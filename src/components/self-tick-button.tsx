import type React from "react";
import { useState } from "react";
import { useKingdom } from "../hooks/use-kingdom.hook";

export interface SelfTickButtonProps {
	newbiemode?: number;
	gamePhase?: string | null;
	onError?: (msg: string) => void;
	onSuccess?: (msg: string | null) => void;
	showText?: boolean;
	className?: string;
	style?: React.CSSProperties;
}

export const SelfTickButton: React.FC<SelfTickButtonProps> = ({
	newbiemode,
	gamePhase,
	onError,
	onSuccess,
	showText = true,
	className = "",
	style,
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const { selfTick, restartNewbieMode } = useKingdom();

	const remaining = newbiemode ?? 0;
	const phaseOk = gamePhase === "registration" || gamePhase === "in-progress";
	const budgetOk = remaining >= 24;
	const exhausted = !budgetOk;
	const disabled = isLoading || !phaseOk || !budgetOk;

	const title = !phaseOk
		? `Self-tick runs only during registration or in-progress (now: ${gamePhase ?? "unknown"})`
		: !budgetOk
			? gamePhase === "registration"
				? "Newbie mode exhausted — restart it for a fresh cycle"
				: "Newbie mode exhausted"
			: `Advance your kingdom 24 ticks (${remaining} newbie ticks left)`;

	const reportError = (fallback: string, error: unknown) => {
		console.error(fallback, error);
		let msg = fallback;
		if (error && typeof error === "object" && "data" in error) {
			const errorData = (error as { data?: { error?: string } }).data;
			if (errorData?.error) {
				msg = errorData.error;
			}
		} else if (error instanceof Error) {
			msg = error.message;
		}
		if (onError) {
			onError(msg);
		}
	};

	const handleSelfTick = async () => {
		if (onError) onError("");
		if (onSuccess) onSuccess(null);
		setIsLoading(true);

		try {
			const response = await selfTick();

			window.dispatchEvent(
				new CustomEvent("tick-advanced", { detail: response }),
			);
			if (onSuccess) {
				onSuccess(`Advanced your kingdom ${response.ticksAdvanced} ticks`);
			}
		} catch (error: unknown) {
			reportError("Failed to self-tick", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleRestartNewbieMode = async () => {
		if (
			!window.confirm(
				"Restart newbie mode? Your kingdom will be reset to its initial stats and your newbie-mode budget restored to 96.",
			)
		) {
			return;
		}
		if (onError) onError("");
		if (onSuccess) onSuccess(null);
		setIsLoading(true);

		try {
			const response = await restartNewbieMode();

			window.dispatchEvent(
				new CustomEvent("tick-advanced", { detail: response }),
			);
			if (onSuccess) {
				onSuccess("Newbie mode restarted — kingdom reset to initial stats");
			}
		} catch (error: unknown) {
			reportError("Failed to restart newbie mode", error);
		} finally {
			setIsLoading(false);
		}
	};

	if (exhausted) {
		if (gamePhase !== "registration") {
			return null;
		}

		return (
			<button
				type="button"
				onClick={handleRestartNewbieMode}
				disabled={isLoading}
				aria-busy={isLoading}
				className={`btn btn-danger ${className}`}
				style={{
					display: "inline-flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "0.4rem",
					padding: "0.35rem 0.75rem",
					fontSize: "0.85rem",
					cursor: isLoading ? "wait" : "pointer",
					...style,
				}}
				title="Newbie mode exhausted — restart it to reset your kingdom to initial stats with a fresh budget of 96"
			>
				{showText && (
					<span>{isLoading ? "Restarting..." : "Restart newbie mode"}</span>
				)}
			</button>
		);
	}

	return (
		<button
			type="button"
			onClick={handleSelfTick}
			disabled={disabled}
			aria-busy={isLoading}
			className={`btn btn-primary ${className}`}
			style={{
				display: "inline-flex",
				alignItems: "center",
				justifyContent: "center",
				gap: "0.4rem",
				padding: "0.35rem 0.75rem",
				fontSize: "0.85rem",
				cursor: disabled ? "not-allowed" : isLoading ? "wait" : "pointer",
				...style,
			}}
			title={title}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				stroke="none"
			>
				<title>Self-Tick 24 Ticks</title>
				<polygon points="3 3 11 12 3 21 3 3" />
				<polygon points="11 3 21 12 11 21 11 3" />
			</svg>
			{showText && (
				<span>
					{isLoading
						? "Advancing 24 ticks..."
						: `Advance 24 ticks (${remaining} left)`}
				</span>
			)}
		</button>
	);
};
