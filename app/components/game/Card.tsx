import { cn } from "~/utils/css"

interface CardProps {
	value: string
	isFlipped: boolean
	isMatched: boolean
	onClick: () => void
	disabled?: boolean
}
export function Card({ value, isFlipped, isMatched, onClick, disabled }: CardProps) {
	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: <explanation>
		<div
			onClick={() => !disabled && onClick()}
			className={cn(
				"relative  size-20 lg:size-36 cursor-pointer transition duration-500",
				disabled ? "cursor-not-allowed opacity-50" : ""
			)}
			style={{ perspective: "1000px" }}
		>
			{/* Front face (hidden when flipped) */}
			<div
				className={cn(
					"absolute inset-0 rounded-lg border-2 bg-indigo-600 flex items-center justify-center",
					!disabled && !isMatched ? "hover:bg-indigo-700" : "",
					isMatched ? "bg-green-500" : ""
				)}
				style={{ transform: "rotateY(0deg)", backfaceVisibility: "hidden" }}
			>
				<span className="text-4xl opacity-0">{value}</span>
			</div>

			{/* Back face (shown when flipped) */}
			<div
				className={cn(
					"absolute inset-0 flex items-center justify-center rounded-lg border-2 bg-white text-4xl",
					isMatched ? "bg-green-100" : ""
				)}
				style={{ transform: "rotateY(180deg)", backfaceVisibility: isFlipped || isMatched ? "visible" : "hidden" }}
			>
				<span>{value}</span>
			</div>
		</div>
	)
}
