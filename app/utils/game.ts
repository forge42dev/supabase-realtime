export function generateCards(gridSize: number) {
	const totalPairs = gridSize ** 2 / 2
	const values = Array.from({ length: totalPairs }, (_, i) => i + 1)
	const pairs = [...values, ...values]

	// Fisher-Yates shuffle
	for (let i = pairs.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
	}

	return pairs
}

export function checkForMatch(cards: number[], index1: number, index2: number) {
	return cards[index1] === cards[index2]
}
