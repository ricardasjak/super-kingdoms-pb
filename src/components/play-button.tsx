import type React from "react";
import { useState } from "react";
import { pb } from "../lib/pocketbase";

export interface PlayButtonProps {
	onExecutionTime?: (timeMs: number | null) => void;
	onLogicTime?: (timeMs: number | null) => void;
	onError?: (msg: string) => void;
	onSuccess?: (msg: string | null) => void;
	showText?: boolean;
	className?: string;
	style?: React.CSSProperties;
}

export const PlayButton: React.FC<PlayButtonProps> = ({
	onExecutionTime,
	onLogicTime,
	onError,
	onSuccess,
	showText = true,
	className = "",
	style,
}) => {
	const [isLoading, setIsLoading] = useState(false);

	const handleAdvanceTick = async () => {
		if (onError) onError("");
		if (onSuccess) onSuccess(null);
		setIsLoading(true);

		try {
			const response = await pb.send<{
				success: boolean;
				executionTimeMs: number;
				totalLogicTimeMs: number;
				currentTick: number;
			}>("/api/game/advance-tick", {
				method: "POST",
			});

			if (response?.executionTimeMs !== undefined && onExecutionTime) {
				onExecutionTime(response.executionTimeMs);
			}
			if (response?.totalLogicTimeMs !== undefined && onLogicTime) {
				onLogicTime(response.totalLogicTimeMs);
			}
			window.dispatchEvent(
				new CustomEvent("tick-advanced", { detail: response }),
			);
			if (onSuccess) {
				onSuccess("Successfully advanced game tick");
			}
		} catch (error: unknown) {
			console.error("Failed to advance tick:", error);
			const msg =
				error instanceof Error ? error.message : "Failed to advance tick";
			if (onError) {
				onError(msg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<button
			type="button"
			onClick={handleAdvanceTick}
			disabled={isLoading}
			aria-busy={isLoading}
			className={`btn btn-primary ${className}`}
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
			title="Play Next Game Tick"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				stroke="none"
			>
				<title>Play Next Tick</title>
				<polygon points="5 3 19 12 5 21 5 3" />
			</svg>
			{showText && <span>{isLoading ? "Advancing..." : "Next Tick"}</span>}
		</button>
	);
};
