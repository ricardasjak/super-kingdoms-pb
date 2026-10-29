import { Bot } from "lucide-react";
import type React from "react";
import { Link } from "react-router-dom";

export interface BotProfileChipProps {
	label?: string | null;
	className?: string;
	style?: React.CSSProperties;
}

export const BotProfileChip: React.FC<BotProfileChipProps> = ({
	label,
	className = "",
	style,
}) => {
	const activeLabel = label?.trim();
	const isCustomized = Boolean(activeLabel);

	return (
		<Link
			to="/kingdom/settings"
			className={`bot-profile-chip ${className}`}
			title={`Governor Strategy Profile: ${activeLabel || "Manual"} — Click to adjust in Settings`}
			style={{
				display: "inline-flex",
				alignItems: "center",
				gap: "0.45rem",
				padding: "0.3rem 0.75rem",
				borderRadius: "9999px",
				fontSize: "0.8rem",
				fontWeight: 500,
				textDecoration: "none",
				transition: "all 0.2s ease-in-out",
				cursor: "pointer",
				lineHeight: 1.4,
				background: isCustomized
					? "rgba(16, 185, 129, 0.12)"
					: "rgba(255, 255, 255, 0.05)",
				border: isCustomized
					? "1px solid rgba(16, 185, 129, 0.35)"
					: "1px solid var(--border-subtle, rgba(255, 255, 255, 0.12))",
				color: isCustomized
					? "var(--accent-emerald, #10b981)"
					: "var(--text-secondary, #94a3b8)",
				backdropFilter: "blur(6px)",
				whiteSpace: "nowrap",
				...style,
			}}
		>
			<Bot
				size={14}
				style={{
					flexShrink: 0,
					color: isCustomized
						? "var(--accent-emerald, #10b981)"
						: "var(--text-muted, #64748b)",
				}}
			/>
			<span
				style={{ color: "var(--text-muted, #64748b)", fontSize: "0.75rem" }}
			>
				Profile:
			</span>
			<span
				style={{
					fontWeight: 600,
					color: isCustomized ? "var(--text-primary, #f8fafc)" : "inherit",
					maxWidth: "160px",
					overflow: "hidden",
					textOverflow: "ellipsis",
				}}
			>
				{activeLabel || "Manual"}
			</span>
			<span
				style={{
					width: "6px",
					height: "6px",
					borderRadius: "50%",
					background: isCustomized
						? "var(--accent-emerald, #10b981)"
						: "var(--text-muted, #64748b)",
					boxShadow: isCustomized ? "0 0 6px rgba(16, 185, 129, 0.8)" : "none",
				}}
			/>
		</Link>
	);
};
