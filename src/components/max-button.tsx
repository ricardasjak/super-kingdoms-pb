import type React from "react";

export interface MaxButtonProps {
	label?: string | number;
	onClick: () => void;
	disabled?: boolean;
	style?: React.CSSProperties;
}

export const MaxButton: React.FC<MaxButtonProps> = ({
	label = "Max",
	onClick,
	disabled = false,
	style,
}) => {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			style={{
				border: "none",
				background: "none",
				padding: "0.15rem 0.4rem",
				fontSize: "0.85rem",
				color: disabled
					? "var(--text-muted, #64748b)"
					: "var(--accent-primary, #6366f1)",
				textDecoration: "underline",
				cursor: disabled ? "not-allowed" : "pointer",
				display: "inline-block",
				opacity: disabled ? 0.45 : 1,
				transition: "opacity 0.15s ease",
				...style,
			}}
		>
			{label}
		</button>
	);
};
