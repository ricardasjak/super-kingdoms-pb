import { CheckCircle, FastForward, RotateCcw, ShieldCheck } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useKingdom } from "../hooks/use-kingdom.hook";
import { pb } from "../lib/pocketbase";

export const NewbieStepView: React.FC = () => {
	const { kingdom, refetch, resetKingdom } = useKingdom();
	const [isLoading, setIsLoading] = useState(false);
	const [statusMessage, setStatusMessage] = useState<string | null>(null);
	const [isResetting, setIsResetting] = useState(false);

	if (!kingdom) return null;

	const isNewbie = kingdom.is_newbie !== false;
	const currentStep = kingdom.newbie_step || 0;
	const totalSteps = 8;
	const ticksPerStep = 24;
	const remainingSteps = Math.max(0, totalSteps - currentStep);
	const remainingTicks = remainingSteps * ticksPerStep;
	const progressPercent = Math.min(
		100,
		Math.round((currentStep / totalSteps) * 100),
	);

	const handleAdvanceStep = async () => {
		setIsLoading(true);
		setStatusMessage(null);
		try {
			const res = await pb.send<{
				success: boolean;
				newbieStep: number;
				ticksAdvanced: number;
				isNewbie: boolean;
			}>("/api/kingdoms/self-tick/step", {
				method: "POST",
			});

			setStatusMessage(
				`✓ Step ${res.newbieStep}/${totalSteps} complete: Advanced ${res.ticksAdvanced} ticks. Population, power, and treasury updated.`,
			);
			window.dispatchEvent(new CustomEvent("tick-advanced", { detail: res }));
			await refetch();
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to advance newbie step";
			setStatusMessage(`⚠️ ${msg}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResetKingdom = async () => {
		if (
			!window.confirm(
				"Are you sure you want to reset your realm? This will delete your current kingdom so you can re-found with a different planetary archetype.",
			)
		) {
			return;
		}

		setIsResetting(true);
		setStatusMessage(null);
		try {
			await resetKingdom();
			setStatusMessage(
				"✓ Realm reset successfully. Redirecting to founding...",
			);
			window.location.href = "/create";
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to reset kingdom";
			setStatusMessage(`⚠️ ${msg}`);
			setIsResetting(false);
		}
	};

	if (!isNewbie || currentStep >= totalSteps) {
		return (
			<div
				style={{
					background: "#08131d",
					border: "1px solid #0369a1",
					borderRadius: "6px",
					padding: "0.85rem 1.25rem",
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "0.75rem",
					marginBottom: "1.5rem",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
					<CheckCircle size={20} color="#38bdf8" />
					<div>
						<strong style={{ color: "#38bdf8", fontSize: "0.95rem" }}>
							Newbie Mode Complete (192 Ticks Simulated)
						</strong>
						<p
							style={{
								margin: 0,
								fontSize: "0.8rem",
								color: "var(--pico-muted-color)",
							}}
						>
							Your kingdom is now a sovereign realm participating in global
							galactic simulation ticks.
						</p>
					</div>
				</div>
				<span
					style={{
						fontSize: "0.75rem",
						padding: "0.25rem 0.6rem",
						background: "rgba(56, 189, 248, 0.15)",
						border: "1px solid #38bdf8",
						borderRadius: "4px",
						color: "#38bdf8",
						fontWeight: 600,
					}}
				>
					PVP ACTIVE
				</span>
			</div>
		);
	}

	return (
		<div
			style={{
				background: "#0a1322",
				border: "1px solid #1e3a5f",
				borderLeft: "4px solid #38bdf8",
				borderRadius: "6px",
				padding: "1rem 1.25rem",
				marginBottom: "1.5rem",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					flexWrap: "wrap",
					gap: "1rem",
					marginBottom: "0.75rem",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
					<ShieldCheck size={24} color="#38bdf8" />
					<div>
						<h3
							style={{
								margin: 0,
								fontSize: "1rem",
								color: "#38bdf8",
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
							}}
						>
							<span>
								Newbie Mode &bull; Step {currentStep} of {totalSteps}
							</span>
							<span
								style={{
									fontSize: "0.72rem",
									padding: "0.15rem 0.45rem",
									background: "rgba(16, 185, 129, 0.2)",
									color: "#10b981",
									border: "1px solid #10b981",
									borderRadius: "4px",
									fontWeight: 600,
								}}
							>
								INVASION IMMUNITY
							</span>
						</h3>
						<p
							style={{
								margin: "0.2rem 0 0 0",
								fontSize: "0.82rem",
								color: "var(--pico-muted-color)",
							}}
						>
							Advance 24 simulation ticks per step to grow your population,
							balance energy, and complete construction queues. (
							{remainingTicks} ticks remaining)
						</p>
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
					<button
						type="button"
						className="secondary"
						onClick={handleResetKingdom}
						disabled={isLoading || isResetting}
						style={{
							fontSize: "0.8rem",
							padding: "0.4rem 0.75rem",
							margin: 0,
							display: "inline-flex",
							alignItems: "center",
							gap: "0.35rem",
						}}
						title="Reset realm to select another archetype"
					>
						<RotateCcw size={14} />
						<span>{isResetting ? "Resetting..." : "Reset Realm"}</span>
					</button>

					<button
						type="button"
						onClick={handleAdvanceStep}
						disabled={isLoading || isResetting}
						style={{
							fontSize: "0.85rem",
							padding: "0.45rem 1.1rem",
							margin: 0,
							fontWeight: 600,
							display: "inline-flex",
							alignItems: "center",
							gap: "0.4rem",
						}}
					>
						{isLoading ? (
							<span>Simulating 24 Ticks...</span>
						) : (
							<>
								<FastForward size={16} />
								<span>Advance Step (24 Ticks)</span>
							</>
						)}
					</button>
				</div>
			</div>

			{/* Progress Bar */}
			<div style={{ marginTop: "0.5rem" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						fontSize: "0.75rem",
						color: "var(--pico-muted-color)",
						marginBottom: "0.25rem",
					}}
				>
					<span>
						Progress: Step {currentStep} / {totalSteps}
					</span>
					<span>
						{progressPercent}% Complete ({currentStep * ticksPerStep} / 192
						Ticks)
					</span>
				</div>
				<div
					style={{
						width: "100%",
						height: "8px",
						background: "#080d1a",
						borderRadius: "4px",
						overflow: "hidden",
						border: "1px solid #142033",
					}}
				>
					<div
						style={{
							width: `${progressPercent}%`,
							height: "100%",
							background: "linear-gradient(90deg, #0284c7, #38bdf8)",
							borderRadius: "4px",
							transition: "width 0.3s ease",
						}}
					/>
				</div>
			</div>

			{statusMessage && (
				<div
					style={{
						marginTop: "0.6rem",
						fontSize: "0.82rem",
						color: statusMessage.startsWith("✓")
							? "var(--sk-land)"
							: "var(--sk-combat)",
					}}
				>
					{statusMessage}
				</div>
			)}
		</div>
	);
};
