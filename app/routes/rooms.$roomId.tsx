import { QRCodeSVG } from "qrcode.react"
import { useEffect, useState } from "react"
import { type LoaderFunctionArgs, redirect, useRevalidator, useSubmit } from "react-router"
import { Grid } from "~/components/game/Grid"
import { Leaderboard } from "~/components/game/Leaderboard"
import { VictoryScreen } from "~/components/game/VictoryScreen"
import { db } from "~/db.server"
import { getUserFromRequest } from "~/queries/user.server"
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

export type Player = Awaited<ReturnType<typeof loader>>["players"][0]
export type Room = Awaited<ReturnType<typeof loader>>["room"]

export default function Room({ loaderData }: Route.ComponentProps) {
	const { room, players, cards, user, qrCode } = loaderData
	const [activeRoom, setActiveRoom] = useState<Room>(room)
	const [activePlayers, setActivePlayers] = useState<Player[]>(players)
	const showVictory = activeRoom.status === "complete"
	const submit = useSubmit()
	useEffect(() => {
		setActiveRoom(room)
	}, [room])

	useEffect(() => {
		setActivePlayers(players)
	}, [players])

	const { revalidate } = useRevalidator()
	const markAsInactive = () => {
		const formData = new FormData()
		const activePlayer = activePlayers.find((p) => p.playerId === user.id)
		if (!activePlayer) return
		formData.append("id", activePlayer.id)
		formData.append("playerId", user.id)
		submit(formData, { method: "POST" })
	}
	// Subscribe to real-time updates
	useEffect(() => {
		const roomSubscription = supabase
			.channel("rooms")
			.on("postgres_changes", { event: "*", schema: "public", table: "rooms" }, (payload) => {
				const newItem = payload.new as {
					id: string
					created_at: Date
					gridSize: number
					status: string
					created_by: string
					current_turn: string | null
					winnerId: string | null
					matchedPairs: string[]
					flippedIndices: number[]
					cards: string[]
					name: string
				}
				setActiveRoom({
					...room,
					...newItem,
					flippedIndices: newItem.flippedIndices ?? room.flippedIndices,
					matchedPairs: newItem.matchedPairs ?? room.matchedPairs,
					currentTurn: newItem.current_turn,
				})
			})
			.subscribe()

		const playerSubscription = supabase
			.channel("active_players")
			.on("postgres_changes", { event: "*", schema: "public", table: "active_players" }, (payload) => {
				const newItem = payload.new as {
					player_id: string
					isActive: boolean
					score: number
					id: string
					scrollPosition: {
						x: number
						y: number
					}
				}

				if (!activePlayers.find((p) => p.playerId === newItem.player_id)) {
					revalidate()
				}
				setActivePlayers(
					activePlayers.map((player) => {
						if (player.playerId === newItem.player_id) {
							return {
								...player,
								isActive: newItem.isActive,
								score: newItem.score,
								scrollPosition: newItem.scrollPosition,
							}
						}
						return player
					})
				)

				//revalidate()
			})
			.subscribe()

		return () => {
			roomSubscription.unsubscribe()
			playerSubscription.unsubscribe()
		}
	}, [revalidate, activePlayers, room])

	// Handle card clicks
	const handleCardClick = async (index: number) => {
		if (activeRoom.flippedIndices.length === 2) return
		const newFlippedIndices = [...activeRoom.flippedIndices, index]
		await supabase
			.from("rooms")
			.update({ flippedIndices: [...newFlippedIndices] })
			.eq("id", room.id)
		if (activeRoom.flippedIndices.length === 1) {
			const isMatch = cards[activeRoom.flippedIndices[0]] === cards[index]
			const currentPlayerIndex = activePlayers.findIndex((p) => p.player?.name === activeRoom.currentTurn)
			const currentPlayer = activePlayers[currentPlayerIndex]
			if (isMatch) {
				const newMatchedPairs = [...activeRoom.matchedPairs, cards[index]]
				const isFinished = newMatchedPairs.length === room.gridSize * 2
				await supabase
					.from("active_players")
					.update({ score: currentPlayer.score + 1 })
					.eq("room_id", room.id)
					.eq("player_id", user.id)
				await supabase
					.from("rooms")
					.update({ matchedPairs: newMatchedPairs, status: isFinished ? "complete" : "waiting" })
					.eq("id", room.id)
				if (isFinished) {
					return
				}
			}

			setTimeout(async () => {
				await supabase.from("rooms").update({ flippedIndices: [] }).eq("id", room.id)

				const nextPlayer = activePlayers[currentPlayerIndex + 1]
				if (nextPlayer === undefined) {
					await supabase.from("rooms").update({ current_turn: activePlayers[0].player?.name }).eq("id", room.id)
				} else {
					await supabase.from("rooms").update({ current_turn: nextPlayer.player?.name }).eq("id", room.id)
				}
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
				<button type="button" className="bg-red-500 text-base text-white px-4 py-2 rounded-md" onClick={markAsInactive}>
					Leave
				</button>
			</h1>
			<div className="p-8">
				<div className=" mx-auto">
					<div className="flex lg:flex-row flex-col justify-between gap-4">
						<Grid
							// biome-ignore lint/suspicious/noExplicitAny: <explanation>
							size={activeRoom.gridSize as any}
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
