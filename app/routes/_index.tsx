import { redirect, useLoaderData } from "react-router"
import { Form } from "react-router"
import { z } from "zod"
import { db } from "~/db.server"
import { getUserFromRequest } from "~/queries/user.server"
import { generateEmojiPairs } from "~/utils/emoji"
import { supabase } from "~/utils/supabase"
import type { Route } from "./+types/_index"

export async function loader() {
	const activeRooms = await db.room.findMany({
		where: {
			status: {
				not: "complete",
			},
		},
		orderBy: {
			createdAt: "desc",
		},
		select: {
			id: true,
			createdBy: true,
			name: true,
			gridSize: true,
			status: true,
			matchedPairs: true,

			activePlayers: {
				select: {
					isActive: true,
					score: true,
					scrollPosition: true,
					player: {
						select: {
							name: true,
						},
					},
				},
			},
		},
	})

	return { rooms: activeRooms }
}

const createRoomSchema = z.object({
	name: z.string().min(1).max(50),
	gridSize: z.enum(["4", "6", "8", "16", "32"]),
})

export async function action({ request }: Route.ActionArgs) {
	const formData = await request.formData()
	const data = Object.fromEntries(formData)

	const parsed = createRoomSchema.safeParse(data)

	if (!parsed.success) {
		return { error: "Invalid input" }
	}
	const user = await getUserFromRequest(request)

	if (!user) return redirect("/")
	const { name, gridSize } = parsed.data
	// Create room
	const room = await db.room.create({
		data: {
			gridSize: Number(gridSize),
			status: "waiting",
			createdBy: user.name,
			currentTurn: user.name,
			cards: generateEmojiPairs(Number(gridSize)),
			name,
		},
	})
	// Create active player
	await db.activePlayer.create({
		data: {
			roomId: room.id,
			playerId: user.id,
		},
	})
	return redirect(`/rooms/${room.id}`)
}
export default function Index() {
	const { rooms } = useLoaderData<typeof loader>()
	console.log(supabase.getChannels())
	return (
		<div className="min-h-screen bg-gray-100 p-8">
			<div className="mx-auto max-w-2xl">
				<h1 className="mb-8 text-4xl font-bold text-center">Memory Game</h1>

				<div className="space-y-8">
					<div className="bg-white p-6 rounded-lg shadow-md">
						<h2 className="text-2xl font-semibold mb-4">Create New Room</h2>
						<Form method="post" className="space-y-4">
							<div>
								<label htmlFor="name" className="block text-sm font-medium text-gray-700">
									Room name
								</label>
								<input
									type="text"
									id="name"
									name="name"
									required
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>

							<div>
								<label htmlFor="gridSize" className="block text-sm font-medium text-gray-700">
									Grid Size
								</label>
								<select
									id="gridSize"
									name="gridSize"
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								>
									<option value="4">4x4</option>
									<option value="6">6x6</option>
									<option value="8">8x8</option>
									<option value="16">16x16</option>
									<option value="32">32x32</option>
								</select>
							</div>

							<button
								type="submit"
								className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
							>
								Create Room
							</button>
						</Form>
					</div>

					{rooms.length > 0 && (
						<div className="bg-white p-6 rounded-lg shadow-md">
							<h2 className="text-2xl font-semibold mb-4">Active Rooms</h2>
							<div className="space-y-4">
								{rooms.map((room) => (
									<div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
										<div>
											<h3 className="font-medium">
												{room.name} - Room by {room.createdBy}
											</h3>
											<p className="text-sm text-gray-500">
												{room.gridSize}x{room.gridSize} Grid
											</p>
										</div>

										<Form method="post" action="/rooms/join">
											<input type="hidden" name="roomId" value={room.id} />

											<button
												type="submit"
												className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
											>
												Join Room
											</button>
										</Form>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
