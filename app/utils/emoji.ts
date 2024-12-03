export const emojis = [
	"🐶",
	"🐱",
	"🐭",
	"🐹",
	"🐰",
	"🦊",
	"🐻",
	"🐼",
	"🐨",
	"🐯",
	"🦁",
	"🐮",
	"🐷",
	"🐸",
	"🐵",
	"🦄",
	"🦋",
	"🐢",
	"🐍",
	"🦎",
	"🦖",
	"🦕",
	"🐙",
	"🦑",
	"🦐",
	"🦞",
	"🦀",
	"🐡",
	"🐠",
	"🐟",
	"🐳",
	"🐋",
	"🦈",
	"🐊",
	"🐅",
	"🐆",
	"🦓",
	"🦍",
	"🦧",
	"🐘",
	"🦛",
	"🦏",
	"🐪",
	"🐫",
	"🦒",
	"🦘",
	"🐃",
	"🐂",
	"🐄",
	"🐎",
	"🐖",
	"🐏",
	"🐑",
	"🦙",
	"🐐",
	"🦌",
	"🐕",
	"🐩",
	"🦮",
	"🐕‍🦺",
	"🐈",
	"🐈‍⬛",
	"🐓",
	"🦃",
]

export function generateEmojiPairs(gridSize: number) {
	const totalPairs = gridSize ** 2 / 2
	const selectedEmojis = emojis.slice(0, totalPairs)
	const pairs = [...selectedEmojis, ...selectedEmojis]

	// Fisher-Yates shuffle
	for (let i = pairs.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		;[pairs[i], pairs[j]] = [pairs[j], pairs[i]]
	}

	return pairs
}
