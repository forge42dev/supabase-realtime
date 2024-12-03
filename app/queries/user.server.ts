import { db } from "~/db.server"
import { getServerSession } from "~/session.server"

export const getUserFromRequest = async (request: Request) => {
	const session = await getServerSession(request.headers.get("Cookie"))
	const userId = session.get("id")
	if (!userId) return null
	const user = await db.player.findFirst({
		where: {
			id: userId ?? 0,
		},
	})
	return user
}
