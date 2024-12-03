import type { Player } from "~/routes/rooms.$roomId"
import { cn } from "~/utils/css"

export function Leaderboard({ players, currentTurn }: { players: Player[]; currentTurn: string | null }) {
	const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

	return (
		<div className="bg-white p-4 rounded-lg shadow-md min-w-80">
			<h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
			<div className="space-y-2">
				{sortedPlayers.map((player) => (
					<div
						key={player.id}
						className={cn(
							"flex items-center justify-between p-2 rounded",
							player.player?.name === currentTurn ? "bg-indigo-50" : "bg-gray-50"
						)}
					>
						<div className="flex items-center gap-2">
							<span>{player.player?.name}</span>
							{player.player?.name === currentTurn && (
								<span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">Current Turn</span>
							)}
							{!player.isActive && <span className="text-xs text-gray-500">(inactive)</span>}
						</div>
						<span className="font-semibold">{player.score}</span>
					</div>
				))}
			</div>
		</div>
	)
}
