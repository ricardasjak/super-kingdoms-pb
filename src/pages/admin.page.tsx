import { Activity, Bot, Clock, Flag, RotateCcw, Users } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { PlayButton } from "../components/play-button";
import { type GamePhase, useGameStatus } from "../hooks/use-game-status.hook";

const GAME_PHASES: GamePhase[] = [
	"registration",
	"in-progress",
	"stopped",
	"newbie",
	"pvp",
	"concluded",
];

const PHASE_HINTS: Record<string, string> = {
	registration: "Kingdoms may register. Ticks do not advance the round.",
	"in-progress": "The round is live. Ticks advance the simulation.",
	stopped: "The galaxy is paused.",
	newbie: "Newbie protection phase: kingdoms cannot be attacked.",
	pvp: "Full warfare enabled across all torus sectors.",
	concluded: "The galaxy round has concluded.",
};

export const AdminPage: React.FC = () => {
	const {
		status,
		isLoading,
		refetch,
		restartGame,
		populateKingdoms,
		createBots,
		setGamePhase,
	} = useGameStatus();

	const [executionTime, setExecutionTime] = useState<number | null>(null);
	const [logicTime, setLogicTime] = useState<number | null>(null);
	const [isPopulating, setIsPopulating] = useState(false);
	const [isCreatingBots, setIsCreatingBots] = useState(false);
	const [isRestarting, setIsRestarting] = useState(false);
	const [isSavingPhase, setIsSavingPhase] = useState(false);
	const [pendingPhase, setPendingPhase] = useState<GamePhase | null>(null);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [successMsg, setSuccessMsg] = useState<string | null>(null);

	const clearMessages = () => {
		setErrorMsg(null);
		setSuccessMsg(null);
	};

	const handleRestartGame = async () => {
		clearMessages();
		if (
			window.confirm(
				"Are you sure you want to COMPLETELY RESTART the game round? Ticks will reset to 0 and all existing kingdoms will be cleared.",
			)
		) {
			setIsRestarting(true);
			try {
				await restartGame();
				setExecutionTime(null);
				setLogicTime(null);
				setSuccessMsg(
					"The galaxy round has been successfully restarted. All kingdoms have been cleared.",
				);
			} catch (err: unknown) {
				console.error("Failed to restart game:", err);
				setErrorMsg(
					err instanceof Error ? err.message : "Failed to restart game",
				);
			} finally {
				setIsRestarting(false);
			}
		}
	};

	const handleSavePhase = async () => {
		clearMessages();
		const target = pendingPhase ?? status?.status ?? null;
		if (!target) {
			setErrorMsg("No game phase selected");
			return;
		}
		setIsSavingPhase(true);
		try {
			const saved = await setGamePhase(target);
			setPendingPhase(null);
			setSuccessMsg(`Game phase set to "${saved}".`);
		} catch (err: unknown) {
			console.error("Failed to set game phase:", err);
			setErrorMsg(
				err instanceof Error ? err.message : "Failed to set game phase",
			);
		} finally {
			setIsSavingPhase(false);
		}
	};

	const handlePopulate = async () => {
		clearMessages();
		setIsPopulating(true);
		try {
			await populateKingdoms();
			setSuccessMsg(
				"Successfully populated 1,000 test kingdoms into the galaxy!",
			);
		} catch (err: unknown) {
			console.error("Failed to populate kingdoms:", err);
			setErrorMsg(
				err instanceof Error ? err.message : "Failed to populate kingdoms",
			);
		} finally {
			setIsPopulating(false);
		}
	};

	const handleCreateBots = async () => {
		clearMessages();
		setIsCreatingBots(true);
		try {
			await createBots(10);
			setSuccessMsg(
				"Successfully spawned 10 autonomous bot kingdoms with randomized profiles and planet types!",
			);
		} catch (err: unknown) {
			console.error("Failed to create bot kingdoms:", err);
			setErrorMsg(
				err instanceof Error ? err.message : "Failed to create bot kingdoms",
			);
		} finally {
			setIsCreatingBots(false);
		}
	};

	return (
		<div
			className="admin-page"
			style={{ marginTop: "2rem", maxWidth: "900px", margin: "2rem auto" }}
		>
			<div className="section-header-row" style={{ marginBottom: "1.5rem" }}>
				<div>
					<h1 className="page-heading">Game Master Deck (Admin)</h1>
					<p className="page-subheading">
						Direct server simulation ticks, inspect database throughput
						benchmarks, and reset galaxy rounds.
					</p>
				</div>
			</div>

			{errorMsg && (
				<div
					className="card"
					style={{
						padding: "1rem",
						marginBottom: "1rem",
						borderColor: "var(--accent-rose)",
						color: "var(--accent-rose)",
					}}
				>
					<strong>Error:</strong> {errorMsg}
				</div>
			)}

			{successMsg && (
				<div
					className="card"
					style={{
						padding: "1rem",
						marginBottom: "1rem",
						borderColor: "var(--accent-emerald)",
						color: "var(--accent-emerald)",
					}}
				>
					<strong>Success:</strong> {successMsg}
				</div>
			)}

			<div
				className="grid"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
					gap: "1.5rem",
				}}
			>
				{/* Status Deck */}
				<div className="card" style={{ padding: "1.5rem" }}>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
							marginBottom: "1rem",
						}}
					>
						<Activity size={22} color="var(--accent-primary)" />
						<h3 style={{ margin: 0 }}>Galaxy Simulation Metrics</h3>
					</div>

					{isLoading || !status ? (
						<p style={{ color: "var(--text-secondary)" }}>
							Querying PocketBase telemetry...
						</p>
					) : (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "0.5rem",
							}}
						>
							<div className="detail-row">
								<span className="detail-label">Galaxy Round:</span>
								<span className="detail-value" style={{ fontWeight: 600 }}>
									Round {status.roundNumber}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Current Tick:</span>
								<span
									className="detail-value"
									style={{ color: "var(--accent-primary)", fontWeight: 600 }}
								>
									Tick {status.currentTick} / {status.endTick}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Registered Kingdoms:</span>
								<span
									className="detail-value"
									style={{ color: "var(--accent-emerald)", fontWeight: 600 }}
								>
									{status.kingdomCount.toLocaleString()} Realms
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Game Phase:</span>
								<span
									className="detail-value"
									style={{
										fontWeight: 600,
										color:
											status.status === "in-progress"
												? "var(--accent-emerald)"
												: status.status === "stopped"
													? "var(--accent-rose)"
													: "var(--accent-primary)",
									}}
								>
									{status.status ?? "unknown"}
								</span>
							</div>

							{executionTime !== null && (
								<div
									style={{
										marginTop: "1rem",
										padding: "0.75rem",
										background: "rgba(255, 255, 255, 0.03)",
										borderRadius: "6px",
										border: "1px solid var(--border-subtle)",
										fontSize: "0.85rem",
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: "0.4rem",
											color: "var(--accent-secondary)",
											marginBottom: "0.25rem",
										}}
									>
										<Clock size={16} />
										<strong>Latest Tick Benchmark:</strong>
									</div>
									<p style={{ margin: 0 }}>
										Wall Execution: {executionTime.toFixed(2)} ms
									</p>
									{logicTime !== null && (
										<>
											<p style={{ margin: 0 }}>
												CPU Simulation Logic: {logicTime.toFixed(2)} ms
											</p>
											<p style={{ margin: 0 }}>
												SQLite DB / IO:{" "}
												{Math.max(0, executionTime - logicTime).toFixed(2)} ms
											</p>
										</>
									)}
								</div>
							)}
						</div>
					)}
				</div>

				{/* Action Controls */}
				<div
					className="card"
					style={{
						padding: "1.5rem",
						display: "flex",
						flexDirection: "column",
						gap: "1rem",
						justifyContent: "center",
					}}
				>
					<h3 style={{ margin: 0 }}>Simulation Engine Controls</h3>

					<PlayButton
						onExecutionTime={setExecutionTime}
						onLogicTime={setLogicTime}
						onError={setErrorMsg}
						onSuccess={() => {
							clearMessages();
							refetch();
						}}
						showText={true}
						style={{ width: "100%", padding: "0.6rem" }}
					/>

					<button
						type="button"
						className="btn btn-secondary"
						onClick={handlePopulate}
						disabled={isPopulating}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "0.5rem",
						}}
					>
						<Users size={18} />
						<span>
							{isPopulating ? "Populating..." : "Populate Test Realms (x1,000)"}
						</span>
					</button>

					<button
						type="button"
						className="btn btn-secondary"
						onClick={handleCreateBots}
						disabled={isCreatingBots}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "0.5rem",
						}}
					>
						<Bot size={18} />
						<span>
							{isCreatingBots ? "Spawning 10 Bots..." : "Spawn 10 Bot Kingdoms"}
						</span>
					</button>

					<div
						style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
					>
						<label
							htmlFor="game-phase-select"
							style={{
								display: "flex",
								alignItems: "center",
								gap: "0.5rem",
								fontWeight: 600,
							}}
						>
							<Flag size={18} />
							<span>Game Phase (gameStatus.status)</span>
						</label>
						<div style={{ display: "flex", gap: "0.5rem" }}>
							<select
								id="game-phase-select"
								className="form-input"
								value={pendingPhase ?? status?.status ?? "registration"}
								onChange={(e) => setPendingPhase(e.target.value as GamePhase)}
								disabled={isLoading || !status || isSavingPhase}
								style={{ flex: 1, padding: "0.6rem" }}
							>
								{GAME_PHASES.map((phase) => (
									<option key={phase} value={phase}>
										{phase}
									</option>
								))}
							</select>
							<button
								type="button"
								className="btn btn-primary"
								onClick={handleSavePhase}
								disabled={isLoading || !status || isSavingPhase}
							>
								{isSavingPhase ? "Saving..." : "Apply"}
							</button>
						</div>
						<p
							style={{
								margin: 0,
								fontSize: "0.85rem",
								color: "var(--text-secondary)",
							}}
						>
							{PHASE_HINTS[pendingPhase ?? status?.status ?? "registration"]}
						</p>
					</div>

					<button
						type="button"
						className="btn btn-danger"
						onClick={handleRestartGame}
						disabled={isRestarting}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "0.5rem",
						}}
					>
						<RotateCcw size={18} />
						<span>
							{isRestarting
								? "Restarting Round..."
								: "Restart Round (Reset Ticks & Clear Kingdoms)"}
						</span>
					</button>
				</div>
			</div>
		</div>
	);
};
