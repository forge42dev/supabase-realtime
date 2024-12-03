import { type ActionFunctionArgs, redirect } from "react-router"
import { z } from "zod"
import { db } from "~/db.server"
import { getUserFromRequest } from "~/queries/user.server"

const joinRoomSchema = z.object({
	roomId: z.string(),
})

export const loader = () => {
	return redirect("/")
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const data = Object.fromEntries(formData)

	const parsed = joinRoomSchema.safeParse(data)
	const user = await getUserFromRequest(request)

	if (!user) return redirect("/")

	if (!parsed.success) {
		return { error: "Invalid input" }
	}

	const { roomId } = parsed.data
	const room = await db.room.findUnique({
		where: {
			id: roomId,
			status: {
				not: "finished",
			},
		},
	})
	if (!room) {
		return { error: "Room not found or already finished" }
	}
	const userByName = await db.activePlayer.findFirst({
		where: {
			roomId,
			playerId: user.id,
		},
	})

	if (!userByName) {
		await db.activePlayer.create({
			data: {
				playerId: user.id,
				roomId,
			},
		})
		return redirect(`/rooms/${roomId}`)
	}
	await db.activePlayer.update({
		where: {
			id: userByName.id,
			playerId: user.id,
			roomId,
		},
		data: {
			isActive: true,
		},
	})

	return redirect(`/rooms/${roomId}`)
}
