import { Card } from "./Card"

interface GridProps {
	size: 4 | 6 | 8 | 16 | 32
	cards: string[]
	flippedIndices: number[]
	matchedPairs: string[]
	onCardClick: (index: number) => void
	isCurrentTurn: boolean
}

enum ColCount {
	col4 = "",
	col6 = "lg:grid-cols-6",
	col8 = "lg:grid-cols-7",
	col16 = "lg:grid-cols-7",
	col32 = "lg:grid-cols-7",
}

export function Grid({ cards, flippedIndices, matchedPairs, onCardClick, isCurrentTurn, size }: GridProps) {
	const className = ColCount[`col${size}`]
	return (
		<div className={`grid grid-cols-4  gap-2 p-4 ${className}`}>
			{cards.map((value, index) => (
				<Card
					// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
					key={value + index}
					value={value}
					isFlipped={flippedIndices.includes(index)}
					isMatched={matchedPairs.includes(value)}
					onClick={() => onCardClick(index)}
					disabled={!isCurrentTurn || flippedIndices.includes(index) || matchedPairs.includes(value)}
				/>
			))}
		</div>
	)
}
