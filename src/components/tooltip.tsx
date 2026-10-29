import type React from "react";
import { useState } from "react";

export interface TooltipProps {
	content: string;
	children?: React.ReactNode;
	position?: "top" | "bottom" | "left" | "right";
	isButton?: boolean;
	showIcon?: boolean;
}

export function Tooltip({
	content,
	children,
	position = "top",
	isButton = false,
	showIcon = false,
}: TooltipProps) {
	const [isVisible, setIsVisible] = useState(false);

	const trigger = showIcon ? "ⓘ" : children;
	const finalIsButton = isButton || showIcon;

	return (
		<span
			className="tooltip-wrapper"
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
			onFocus={() => setIsVisible(true)}
			onBlur={() => setIsVisible(false)}
			style={{
				position: "relative",
				display: "inline-flex",
				alignItems: "center",
			}}
		>
			{finalIsButton ? (
				<button
					type="button"
					className="tooltip-btn"
					style={{
						cursor: "help",
						background: "rgba(255, 255, 255, 0.08)",
						border: "1px solid var(--border-subtle, rgba(255,255,255,0.15))",
						borderRadius: "4px",
						fontSize: "0.75rem",
						lineHeight: 1,
						padding: "0.15rem 0.35rem",
						color: "var(--text-secondary, #94a3b8)",
					}}
					onClick={(e) => e.preventDefault()}
				>
					{trigger}
				</button>
			) : (
				<span
					style={{
						cursor: "help",
						borderBottom:
							"1px dotted var(--border-subtle, rgba(255,255,255,0.3))",
						display: "inline-flex",
						alignItems: "center",
					}}
				>
					{trigger}
				</span>
			)}

			{isVisible && (
				<span
					className={`tooltip-bubble tooltip-${position}`}
					role="tooltip"
					style={{
						position: "absolute",
						bottom: position === "top" ? "125%" : undefined,
						top: position === "bottom" ? "125%" : undefined,
						left: position === "right" ? "110%" : "50%",
						transform:
							position === "right" || position === "left"
								? "translateY(-50%)"
								: "translateX(-50%)",
						backgroundColor: "rgba(15, 23, 42, 0.95)",
						backdropFilter: "blur(8px)",
						color: "#f8fafc",
						padding: "0.35rem 0.65rem",
						borderRadius: "6px",
						fontSize: "0.75rem",
						whiteSpace: "normal",
						minWidth: "120px",
						maxWidth: "280px",
						textAlign: "center",
						boxShadow: "0 4px 14px rgba(0, 0, 0, 0.5)",
						border: "1px solid rgba(255, 255, 255, 0.12)",
						zIndex: 9999,
						pointerEvents: "none",
					}}
				>
					{content}
				</span>
			)}
		</span>
	);
}
