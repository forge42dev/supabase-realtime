import type { RealtimeMessage } from "@supabase/supabase-js"
import { queryClient } from "~/root"
import type { RoomLoaderData } from "~/routes/rooms.$roomId"

export const handlePlayerUpdate =
	(roomId: string, serverLoader: () => Promise<RoomLoaderData>) => async (payload: RealtimeMessage["payload"]) => {
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
		// biome-ignore lint/style/noNonNullAssertion: This will be there
		const data = queryClient.getQueryData<RoomLoaderData>(["room", roomId])!
		if (!data.players.find((p) => p.playerId === newItem.player_id)) {
			const data = await serverLoader()

			return queryClient.setQueryData(["room", roomId], data)
		}
		queryClient.setQueryData<typeof data>(["room", roomId], {
			...data,
			players: data.players.map((player) => {
				if (player.playerId === newItem.player_id) {
					return {
						...player,
						isActive: newItem.isActive,
						score: newItem.score,
						scrollPosition: newItem.scrollPosition,
					}
				}
				return player
			}),
		})
	}
