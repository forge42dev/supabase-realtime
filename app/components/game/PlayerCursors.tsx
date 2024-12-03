import type { Player } from "~/routes/rooms.$roomId"

export function PlayerCursors({ players }: { players: Player[] }) {
	return (
		<>
			{players.map(
				(player) =>
					player.isActive && (
						<div
							key={player.id}
							className="fixed pointer-events-none"
							style={{
								left: player.scrollPosition?.x,
								top: player.scrollPosition?.y,
							}}
						>
							<div className="bg-indigo-500 text-white px-2 py-1 rounded text-sm">{player.player?.name}</div>
						</div>
					)
			)}
		</>
	)
}
