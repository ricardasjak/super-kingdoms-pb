import type React from "react";
import { useState } from "react";
import { RESEARCH_TOOLTIPS } from "../components/research/research-tooltips";
import { ScientistsSummary } from "../components/research/scientists-summary";
import { TechnicalResearchTree } from "../components/research/technical-research-tree";
import { GAME_PARAMS } from "../constants/game-params.constants";
import { useKingdomMessage } from "../context/kingdom-message.context";
import { useKingdom } from "../hooks/use-kingdom.hook";
import type { ResearchTopicType } from "../types/game.types";

export const KingdomResearchPage: React.FC = () => {
	const { kingdom, saveResearchAutoAssign, buyScientists } = useKingdom();
	const { showMessage } = useKingdomMessage();

	const [isHiring, setIsHiring] = useState(false);
	const [scientistCount, setScientistCount] = useState("");
	const [showAllTech, setShowAllTech] = useState(false);

	const research = kingdom?.research || {};
	if (!kingdom) return null;

	const standardResearchTopics = [
		{
			key: "mil" as ResearchTopicType,
			label: "Military Strength",
			data: research.mil,
		},
		{ key: "money" as ResearchTopicType, label: "Money", data: research.money },
		{
			key: "pop" as ResearchTopicType,
			label: "Population Bonus",
			data: research.pop,
		},
		{
			key: "power" as ResearchTopicType,
			label: "Power Bonus",
			data: research.power,
		},
		{
			key: "warp" as ResearchTopicType,
			label: "Warp Drive",
			data: research.warp,
		},
		{
			key: "fdc" as ResearchTopicType,
			label: "Frequency Decryption",
			data: research.fdc,
		},
	];

	const handleAutoToggle = async (key: string) => {
		const currentAuto = kingdom.researchAutoAssign || [];
		let newPriority = [...currentAuto];

		if (newPriority.includes(key)) {
			newPriority = newPriority.filter((k) => k !== key);
		} else {
			const standardKeys = ["pop", "power", "mil", "money", "fdc", "warp"];
			const isStandard = standardKeys.includes(key);

			if (isStandard) {
				const firstTechIndex = newPriority.findIndex(
					(k) => !standardKeys.includes(k),
				);
				if (firstTechIndex === -1) {
					newPriority.push(key);
				} else {
					newPriority.splice(firstTechIndex, 0, key);
				}
			} else {
				newPriority.push(key);
			}
		}

		try {
			await saveResearchAutoAssign(newPriority);
			showMessage("Research prioritization updated!", "success");
		} catch (err: unknown) {
			const msg =
				err instanceof Error
					? err.message
					: "Failed to update research priority";
			showMessage(msg, "error");
		}
	};

	const handleHireScientists = async (e: React.FormEvent) => {
		e.preventDefault();
		const count = parseInt(scientistCount, 10);
		if (!count || count <= 0) return;

		setIsHiring(true);
		try {
			await buyScientists(count);
			showMessage(
				`Successfully commissioned ${count} research scientists!`,
				"success",
			);
			setScientistCount("");
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to hire scientists";
			showMessage(msg, "error");
		} finally {
			setIsHiring(false);
		}
	};

	return (
		<div className="research-page" style={{ marginTop: "1rem" }}>
			<div className="section-header-row" style={{ marginBottom: "1rem" }}>
				<div>
					<h1 className="page-heading">Scientific Research Labs</h1>
					<p className="page-subheading">
						Direct sovereign research initiatives across standard civilization
						topics and military tech trees.
					</p>
				</div>
			</div>

			{/* Summary & Commissioning */}
			<div
				className="card"
				style={{
					padding: "1.25rem",
					marginBottom: "1.5rem",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: "1.5rem",
					alignItems: "center",
				}}
			>
				<ScientistsSummary myKingdom={kingdom} />

				<form
					onSubmit={handleHireScientists}
					style={{
						borderLeft: "1px solid var(--border-subtle)",
						paddingLeft: "1.5rem",
					}}
				>
					<label
						htmlFor="commission-scientists-input"
						style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}
					>
						Commission Scientists ($1,000 / scientist)
					</label>
					<div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem" }}>
						<input
							id="commission-scientists-input"
							type="number"
							min="1"
							value={scientistCount}
							onChange={(e) => setScientistCount(e.target.value)}
							placeholder="Quantity..."
							style={{
								padding: "0.35rem 0.65rem",
								background: "var(--bg-input)",
								border: "1px solid var(--border-subtle)",
								borderRadius: "6px",
								color: "var(--text-primary)",
								width: "140px",
							}}
						/>
						<button
							type="submit"
							disabled={isHiring || !parseInt(scientistCount, 10)}
							className="btn btn-primary btn-sm"
						>
							{isHiring ? "Hiring..." : "Commission"}
						</button>
					</div>
				</form>
			</div>

			{/* Standard Research Topics */}
			<div
				className="card"
				style={{ padding: "1.25rem", marginBottom: "1.5rem" }}
			>
				<h3 style={{ marginBottom: "1rem" }}>Civilization Research Sectors</h3>

				<div
					style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
				>
					{standardResearchTopics.map(({ key, label, data }) => {
						const required = GAME_PARAMS.research.required(key, kingdom.land);
						const index = (kingdom.researchAutoAssign || []).indexOf(key);
						const isAuto = index !== -1;
						const pts = data?.pts ?? 0;
						const perc = data?.perc ?? 0;

						return (
							<div
								key={key}
								style={{
									display: "flex",
									alignItems: "center",
									justifyContent: "space-between",
									padding: "0.6rem 0.8rem",
									background: "rgba(255, 255, 255, 0.03)",
									borderRadius: "6px",
									border: "1px solid var(--border-subtle)",
									flexWrap: "wrap",
									gap: "0.75rem",
								}}
							>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										gap: "0.5rem",
										minWidth: "220px",
									}}
								>
									<strong>{label}</strong>
									{RESEARCH_TOOLTIPS[key]}
									{isAuto && (
										<span
											className="badge"
											style={{
												background: "var(--accent-primary)",
												color: "#fff",
												fontSize: "0.7rem",
												padding: "0.1rem 0.4rem",
												borderRadius: "10px",
											}}
										>
											#{index + 1} Active
										</span>
									)}
								</div>

								<div
									style={{ flexGrow: 1, minWidth: "200px", maxWidth: "450px" }}
								>
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											fontSize: "0.75rem",
											color: "var(--text-secondary)",
											marginBottom: "0.25rem",
										}}
									>
										<span>Bonus: +{perc}%</span>
										<span>
											{pts.toLocaleString()} / {required.toLocaleString()} pts
										</span>
									</div>
									<progress
										value={pts}
										max={required}
										style={{ width: "100%", height: "6px" }}
									/>
								</div>

								<div>
									<button
										type="button"
										className={`btn btn-sm ${isAuto ? "btn-secondary" : "btn-primary"}`}
										onClick={() => handleAutoToggle(key)}
									>
										{isAuto ? "Halt Priority" : "Prioritize"}
									</button>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Technical Research Tree */}
			<div
				className="card"
				style={{ padding: "1.25rem", marginBottom: "1.5rem" }}
			>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "1rem",
					}}
				>
					<h3 style={{ margin: 0 }}>Advanced Technology Tree</h3>
					<label
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "0.4rem",
							fontSize: "0.85rem",
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={showAllTech}
							onChange={(e) => setShowAllTech(e.target.checked)}
						/>
						<span style={{ color: "var(--text-secondary)" }}>
							Show All Branches
						</span>
					</label>
				</div>

				<TechnicalResearchTree
					myKingdom={kingdom}
					handleAutoToggle={handleAutoToggle}
					showAllTech={showAllTech}
				/>
			</div>
		</div>
	);
};
