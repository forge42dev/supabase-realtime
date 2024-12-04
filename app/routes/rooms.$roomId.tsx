import { useQuery } from "@tanstack/react-query"
import { QRCodeSVG } from "qrcode.react"
import { type LoaderFunctionArgs, redirect, useSubmit } from "react-router"
import { Grid } from "~/components/game/Grid"
import { Leaderboard } from "~/components/game/Leaderboard"
import { VictoryScreen } from "~/components/game/VictoryScreen"
import { db } from "~/db.server"
import { getUserFromRequest } from "~/queries/user.server"
import { handlePlayerUpdate } from "~/realtime/player"
import { handleRoomUpdate } from "~/realtime/room"
import { queryClient } from "~/root"
import { supabase } from "~/utils/supabase"
import type { Route } from "./+types/rooms.$roomId"

export async function loader({ params, request }: LoaderFunctionArgs) {
	const user = await getUserFromRequest(request)
	if (!user) throw redirect(`/?redirectTo=rooms/${params.roomId}`)
	const room = await db.room.findFirst({
		where: {
			id: params.roomId,
		},
		select: {
			id: true,
			name: true,
			cards: true,
			gridSize: true,
			currentTurn: true,
			flippedIndices: true,
			matchedPairs: true,
			status: true,
			activePlayers: {
				select: {
					id: true,
					score: true,
					playerId: true,

					scrollPosition: true,
					isActive: true,
					player: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		},
	})

	if (!room) {
		throw redirect("/")
	}
	const qrCode = new URL(request.url).toString()
	return { room, players: room.activePlayers, cards: room.cards, user, qrCode }
}

export type RoomLoaderData = Awaited<ReturnType<typeof loader>>
export type Player = Awaited<ReturnType<typeof loader>>["players"][0]
export type Room = Awaited<ReturnType<typeof loader>>["room"]

export const action = async ({ request }: Route.ActionArgs) => {
	const formData = await request.formData()
	const playerId = formData.get("playerId") as string | null
	const id = formData.get("id") as string | null
	if (!playerId || !id) {
		throw redirect("/")
	}
	await db.activePlayer.update({
		where: {
			id,
			playerId,
		},
		data: {
			isActive: false,
		},
	})
	return redirect("/")
}

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
const realtime = (roomId: string, serverLoader: any) => {
	// Subscribe to real-time updates on the room
	const roomSubscription = supabase
		.channel("rooms")
		.on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, handleRoomUpdate(roomId))
		.subscribe()
	// Subscribe to real-time updates on the active players
	const playerSubscription = supabase
		.channel("active_players")
		.on(
			"postgres_changes",
			{ event: "*", schema: "public", table: "active_players" },
			handlePlayerUpdate(roomId, serverLoader)
		)
		.subscribe()
	return {
		test: "",
		[Symbol.dispose]() {
			playerSubscription.unsubscribe()
			roomSubscription.unsubscribe()
		},
	}
}

export const clientLoader = async ({ serverLoader, params }: Route.ClientLoaderArgs) => {
	// Try to get the data from the cache
	const cachedData = queryClient.getQueryData<RoomLoaderData>(["room", params.roomId])
	// Either used the cached data or fetch it from the server
	const data = cachedData ?? (await serverLoader())
	// Don't set the data if it's already there
	if (!cachedData) {
		queryClient.setQueryData(["room", params.roomId], data)
	}

	using _a = realtime(params.roomId, serverLoader)

	return {
		...data,
	}
}

clientLoader.hydrate = true

export default function Room({ loaderData, params }: Route.ComponentProps) {
	const { room, cards, user, qrCode } = loaderData
	const submit = useSubmit()
	const { data } = useQuery<Route.ComponentProps["loaderData"]>({ queryKey: ["room", params.roomId] })

	if (!data) return <div>Loading...</div>
	const activeRoom = data.room
	const activePlayers = data.players
	const showVictory = activeRoom.status === "complete"

	const leaveGame = () => {
		const formData = new FormData()
		const activePlayer = activePlayers.find((p) => p.playerId === user.id)
		if (!activePlayer) return
		formData.append("id", activePlayer.id)
		formData.append("playerId", user.id)
		submit(formData, { method: "POST" })
	}
	// Update room data
	const updateRoom = async (data: Partial<Room & { current_turn?: string }>) => {
		await supabase.from("rooms").update(data).eq("id", activeRoom.id)
	}
	const updatePlayer = async (data: Partial<Player>) => {
		await supabase.from("active_players").update(data).eq("room_id", activeRoom.id).eq("player_id", user.id)
	}
	// Handle card clicks
	const handleCardClick = async (index: number) => {
		// Don't do anything if there are already two flipped cards
		if (activeRoom.flippedIndices.length === 2) return
		// Add the clicked card to the flipped indices
		const newFlippedIndices = [...activeRoom.flippedIndices, index]
		// Update the room with the new flipped indices so everyone can see the change
		await updateRoom({ flippedIndices: [...newFlippedIndices] })
		// Check if it's a match if two cards are flipped
		if (activeRoom.flippedIndices.length === 1) {
			// Check if the two cards are the same
			const isMatch = cards[activeRoom.flippedIndices[0]] === cards[index]
			const currentPlayerIndex = activePlayers.findIndex((p) => p.player?.name === activeRoom.currentTurn)
			const currentPlayer = activePlayers[currentPlayerIndex]
			// If it's a match, update the player's score and the room's status
			if (isMatch) {
				const newMatchedPairs = [...activeRoom.matchedPairs, cards[index]]
				// Check if the game is finished and update the room and the player
				const isFinished = newMatchedPairs.length === activeRoom.gridSize * 2
				// Update the player's score
				await updatePlayer({ score: currentPlayer.score + 1 })
				// Update the room's status and matched pairs
				await updateRoom({ matchedPairs: newMatchedPairs, status: isFinished ? "complete" : "waiting" })
				// Revert the flipped cards so the game can go on
				setTimeout(async () => {
					await updateRoom({ flippedIndices: [] })
				}, 1000)
				// Exit early so that we don't go into the setTimeout below
				return
			}

			setTimeout(async () => {
				const nextPlayer = activePlayers[currentPlayerIndex + 1]
				// Move to the next player
				await updateRoom({
					flippedIndices: [],
					current_turn: !nextPlayer ? activePlayers[0].player?.name : nextPlayer.player?.name,
				})
			}, 1000)
		}
	}

	if (showVictory) {
		return <VictoryScreen players={activePlayers} />
	}

	return (
		<div className="bg-gray-50 min-h-screen">
			<h1 className="bg-indigo-600 text-white drop-shadow-xl flex items-center justify-between text-center text-2xl font-bold p-4 lg:px-12">
				{activeRoom.name}
				<button type="button" className="bg-red-500 text-base text-white px-4 py-2 rounded-md" onClick={leaveGame}>
					Leave
				</button>
			</h1>
			<div className="p-8">
				<div className=" mx-auto">
					<div className="flex lg:flex-row flex-col justify-between gap-4">
						<Grid
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							size={room.gridSize as any}
							cards={cards}
							flippedIndices={activeRoom.flippedIndices}
							matchedPairs={activeRoom.matchedPairs}
							onCardClick={handleCardClick}
							isCurrentTurn={activeRoom.currentTurn === user.name}
						/>
						<Leaderboard currentTurn={activeRoom.currentTurn} players={activePlayers} />
					</div>
					<QRCodeSVG className="fixed bottom-0 p-8 right-0" value={qrCode} size={200} />
				</div>
			</div>
		</div>
	)
}
