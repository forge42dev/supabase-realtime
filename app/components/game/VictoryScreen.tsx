import { Link } from "react-router"
import type { Player } from "~/routes/rooms.$roomId"

export function VictoryScreen({ players }: { players: Player[] }) {
	const sortedPlayers = [...players].sort((a, b) => b.score - a.score).slice(0, 3)

	const medals = ["🥇", "🥈", "🥉"]

	return (
		<div className="fixed inset-0 bg-black/50 flex items-center justify-center">
			<div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
				<h2 className="text-3xl font-bold text-center mb-8">Game Over!</h2>
				<div className="space-y-4">
					{sortedPlayers.map((player, index) => (
						<div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded">
							<div className="flex items-center gap-2">
								<span className="text-2xl">{medals[index]}</span>
								<span className="font-medium">{player.player?.name}</span>
							</div>
							<span className="font-semibold">{player.score} points</span>
						</div>
					))}
				</div>
				<Link to="/" className="mt-8 text-center">
					<button type="button" className="mt-8 w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
						Back to Home
					</button>
				</Link>
			</div>
		</div>
	)
}
