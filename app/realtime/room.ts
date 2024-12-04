import type { RealtimeMessage } from "@supabase/supabase-js"
import { queryClient } from "~/root"
import type { RoomLoaderData } from "~/routes/rooms.$roomId"

export const handleRoomUpdate = (roomId: string) => (payload: RealtimeMessage["payload"]) => {
	const newRoomInfo = payload.new
	// biome-ignore lint/style/noNonNullAssertion: This will be there
	const data = queryClient.getQueryData<RoomLoaderData>(["room", roomId])!
	if(payload.new.id !== data.room.id) return
	queryClient.setQueryData<typeof data>(["room", data.room.id], {
		...data,
		room: {
			...data.room,
			...newRoomInfo,
			flippedIndices: newRoomInfo.flippedIndices ?? data.room.flippedIndices,
			matchedPairs: newRoomInfo.matchedPairs ?? data.room.matchedPairs,
			currentTurn: newRoomInfo.current_turn,
		},
	})
}
