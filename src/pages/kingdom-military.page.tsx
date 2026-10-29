import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MaxButton } from "../components/max-button";
import { Tooltip } from "../components/tooltip";
import {
	GAME_PARAMS,
	MILITARY_UNITS,
} from "../constants/game-params.constants";
import { useKingdomMessage } from "../context/kingdom-message.context";
import { useKingdom } from "../hooks/use-kingdom.hook";
import type { MilitaryUnitType } from "../types/game.types";

const UNIT_LABELS: Record<MilitaryUnitType, string> = {
	sol: "Soldiers",
	tr: "Troopers",
	dr: "Dragoons",
	ft: "Fighters",
	tf: "Tactical Fighters",
	lt: "Laser Troopers",
	ld: "Laser Dragoons",
	lf: "Laser Fighters",
	f74: "F74 Drones",
	t: "Tanks",
	ht: "Hover Tanks",
	sci: "Scientists",
};

const UNIT_KEYS = Object.keys(MILITARY_UNITS) as MilitaryUnitType[];

export const KingdomMilitaryPage: React.FC = () => {
	const { kingdom, trainMilitary, disbandMilitary, saveMilitaryTargets } =
		useKingdom();
	const { showMessage } = useKingdomMessage();

	const military = kingdom?.military;
	const buildings = kingdom?.buildings;

	const INITIAL_TRAIN_QUEUE = Object.fromEntries(
		UNIT_KEYS.map((k) => [k, ""]),
	) as Record<MilitaryUnitType, string>;

	const [trainQueue, setTrainQueue] =
		useState<Record<MilitaryUnitType, string>>(INITIAL_TRAIN_QUEUE);
	const [targetQueue, setTargetQueue] =
		useState<Record<MilitaryUnitType, string>>(INITIAL_TRAIN_QUEUE);
	const [isTraining, setIsTraining] = useState(false);
	const [isDisbandMode, setIsDisbandMode] = useState(false);
	const [isSavingTargets, setIsSavingTargets] = useState(false);

	const targetStr = JSON.stringify(military?.target);
	const isAutomatedProfile = Boolean(kingdom?.botSettings?.label);

	useEffect(() => {
		const target = military?.target;
		if (target) {
			setTargetQueue(
				Object.fromEntries(
					UNIT_KEYS.map((k) => [k, (target[k] || 0).toString()]),
				) as Record<MilitaryUnitType, string>,
			);
		}
	}, [targetStr, military?.target]);

	if (!kingdom || !military || !buildings) return null;

	const isUnitUnlocked = (unitKey: MilitaryUnitType) => {
		const unit = MILITARY_UNITS[unitKey];
		if (unit.researchRequired) {
			const researchData = kingdom.research?.[unit.researchRequired];
			if ((researchData?.perc ?? 0) < 100) return false;
		}
		if (unit.buildingRequired) {
			if ((buildings[unit.buildingRequired] || 0) <= 0) return false;
		}
		return true;
	};

	const raxUsage =
		(military.sol || 0) +
		(military.tr || 0) +
		(military.dr || 0) +
		(military.ft || 0) +
		(military.lt || 0) +
		(military.ld || 0) +
		(military.lf || 0) +
		(military.sci || 0) +
		(military.t || 0) * 2 +
		(military.ht || 0) * 2;

	const raxCapacity = (buildings.rax || 0) * GAME_PARAMS.buildings.raxCapacity;
	const asbUsage = (military.tf || 0) * 2 + (military.f74 || 0);
	const asbCapacity = (buildings.asb || 0) * GAME_PARAMS.buildings.asbCapacity;

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setTrainQueue((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setTargetQueue((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const calculateUnitCost = (key: MilitaryUnitType) => {
		const unit = MILITARY_UNITS[key];
		const tcDiscount = GAME_PARAMS.military.calculateTcDiscount(
			buildings.tc || 0,
			kingdom.land,
		);
		const discountedCost = Math.max(
			1,
			Math.round(unit.cost * (1 - tcDiscount / 100)),
		);
		return discountedCost;
	};

	const handleMaxClick = (key: MilitaryUnitType) => {
		const count = military[key] || 0;
		if (isDisbandMode) {
			if (count <= 0) return;
			setTrainQueue({ ...INITIAL_TRAIN_QUEUE, [key]: count.toString() });
			return;
		}

		const unit = MILITARY_UNITS[key];
		const cost = calculateUnitCost(key);
		const maxByMoney = Math.floor(kingdom.money / cost);
		const maxBySol =
			unit.sol > 0 ? Math.floor((military.sol || 0) / unit.sol) : maxByMoney;

		let maxUnits = Math.min(maxByMoney, maxBySol);
		if (unit.buildingRequired === "asb") {
			const freeAsb = Math.max(0, asbCapacity - asbUsage);
			const unitsPerSpace = key === "tf" ? Math.floor(freeAsb / 2) : freeAsb;
			maxUnits = Math.min(maxUnits, unitsPerSpace);
		}

		const duration = key === "sol" ? 16 : 24;
		const rounded = Math.floor(maxUnits / duration) * duration;
		if (rounded <= 0) return;

		setTrainQueue({
			...INITIAL_TRAIN_QUEUE,
			[key]: rounded.toString(),
		});
	};

	const requestSum = UNIT_KEYS.reduce(
		(sum, k) => sum + (parseInt(trainQueue[k], 10) || 0),
		0,
	);

	let totalCost = 0;
	let refundAmount = 0;
	for (const k of UNIT_KEYS) {
		const c = parseInt(trainQueue[k], 10) || 0;
		if (c > 0) {
			totalCost += c * calculateUnitCost(k);
			refundAmount += c * Math.floor(MILITARY_UNITS[k].cost / 2);
		}
	}

	const targetSum = UNIT_KEYS.reduce(
		(sum, k) => sum + (parseFloat(targetQueue[k]) || 0),
		0,
	);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (requestSum <= 0) return;

		setIsTraining(true);
		try {
			if (isDisbandMode) {
				await disbandMilitary(trainQueue);
				showMessage(
					`Successfully disbanded ${requestSum} military personnel!`,
					"success",
				);
			} else {
				await trainMilitary(trainQueue);
				showMessage(
					`Successfully enqueued ${requestSum} military units for training!`,
					"success",
				);
			}
			setTrainQueue(INITIAL_TRAIN_QUEUE);
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : "Military action failed";
			showMessage(msg, "error");
		} finally {
			setIsTraining(false);
		}
	};

	const handleSaveTargets = async () => {
		setIsSavingTargets(true);
		try {
			const targetObj: Record<string, number> = {};
			for (const k of UNIT_KEYS) {
				targetObj[k] = parseFloat(targetQueue[k]) || 0;
			}
			await saveMilitaryTargets(targetObj);
			showMessage(
				"Military recruitment targets saved successfully!",
				"success",
			);
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to save military targets";
			showMessage(msg, "error");
		} finally {
			setIsSavingTargets(false);
		}
	};

	return (
		<div className="military-page" style={{ marginTop: "1rem" }}>
			<div className="section-header-row" style={{ marginBottom: "1rem" }}>
				<div>
					<h1 className="page-heading">Armed Forces Deck</h1>
					<p className="page-subheading">
						Deploy combat personnel, aerospace fighter craft, and automated
						defenses.
					</p>
				</div>
			</div>

			{/* Capacities Bar */}
			<div
				className="card"
				style={{
					padding: "1rem",
					marginBottom: "1.5rem",
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
					gap: "1rem",
				}}
			>
				<div>
					<span className="text-secondary" style={{ fontSize: "0.85rem" }}>
						Barracks Bunking:
					</span>
					<div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
						{raxUsage.toLocaleString()} / {raxCapacity.toLocaleString()}{" "}
						<small
							style={{
								color:
									raxUsage > raxCapacity
										? "var(--accent-rose)"
										: "var(--accent-emerald)",
							}}
						>
							(
							{raxCapacity > 0
								? ((raxUsage / raxCapacity) * 100).toFixed(0)
								: 0}
							%)
						</small>
					</div>
				</div>

				<div>
					<span className="text-secondary" style={{ fontSize: "0.85rem" }}>
						Air Support Bay Bays:
					</span>
					<div style={{ fontSize: "1.1rem", fontWeight: 600 }}>
						{asbUsage.toLocaleString()} / {asbCapacity.toLocaleString()}{" "}
						<small
							style={{
								color:
									asbUsage > asbCapacity
										? "var(--accent-rose)"
										: "var(--accent-emerald)",
							}}
						>
							(
							{asbCapacity > 0
								? ((asbUsage / asbCapacity) * 100).toFixed(0)
								: 0}
							%)
						</small>
					</div>
				</div>

				<div>
					<span className="text-secondary" style={{ fontSize: "0.85rem" }}>
						Unassigned Recruits (Sol):
					</span>
					<div
						style={{
							fontSize: "1.1rem",
							fontWeight: 600,
							color: "var(--accent-amber)",
						}}
					>
						{(military.sol || 0).toLocaleString()} 🪖
					</div>
				</div>
			</div>

			<div
				className="card"
				style={{ padding: "1.25rem", marginBottom: "1.5rem" }}
			>
				<form onSubmit={handleSubmit}>
					<div style={{ overflowX: "auto" }}>
						<table
							className="dense-table"
							style={{ width: "100%", borderCollapse: "collapse" }}
						>
							<thead>
								<tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
									<th style={{ textAlign: "left", padding: "0.5rem" }}>
										Unit Class
									</th>
									<th style={{ textAlign: "right", padding: "0.5rem" }}>
										Active Active
									</th>
									<th style={{ textAlign: "center", padding: "0.5rem" }}>
										Training
									</th>
									<th style={{ textAlign: "right", padding: "0.5rem" }}>
										{isDisbandMode ? "Refund" : "Cost"}
									</th>
									{!isDisbandMode && kingdom.autoBuild && (
										<th style={{ textAlign: "center", padding: "0.5rem" }}>
											Target %{isAutomatedProfile && " (Auto)"}
										</th>
									)}
									<th style={{ textAlign: "center", padding: "0.5rem" }}>
										Max
									</th>
									<th style={{ textAlign: "center", padding: "0.5rem" }}>
										{isDisbandMode ? "Disband" : "Recruit"}
									</th>
								</tr>
							</thead>
							<tbody>
								{UNIT_KEYS.map((key) => {
									const unlocked = isUnitUnlocked(key);
									if (!unlocked) return null;

									const count = military[key] || 0;
									const queueCount = (military.queue?.[key] || []).reduce(
										(a, b) => a + b,
										0,
									);
									const cost = calculateUnitCost(key);
									const unitDef = MILITARY_UNITS[key];

									return (
										<tr
											key={key}
											style={{
												borderBottom: "1px solid var(--border-subtle)",
												opacity: isDisbandMode && count <= 0 ? 0.45 : 1,
											}}
										>
											<td style={{ padding: "0.5rem" }}>
												<div
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: "0.4rem",
													}}
												>
													<strong>{UNIT_LABELS[key]}</strong>
													<Tooltip
														showIcon
														content={`⚔️ Off: ${unitDef.off} | 🛡️ Def: ${unitDef.def} | Housing: ${unitDef.housing} | Power: ${unitDef.power} MWh`}
													/>
												</div>
											</td>
											<td style={{ textAlign: "right", padding: "0.5rem" }}>
												{count.toLocaleString()}
											</td>
											<td style={{ textAlign: "center", padding: "0.5rem" }}>
												{queueCount > 0 ? (
													<span style={{ color: "var(--accent-primary)" }}>
														+{queueCount.toLocaleString()}
													</span>
												) : (
													"-"
												)}
											</td>
											<td style={{ textAlign: "right", padding: "0.5rem" }}>
												{isDisbandMode ? (
													<span style={{ color: "var(--accent-emerald)" }}>
														+${Math.floor(unitDef.cost / 2)}{" "}
														{unitDef.sol > 0 && `(+${unitDef.sol} 🪖)`}
													</span>
												) : (
													<span>
														${cost.toLocaleString()}{" "}
														{unitDef.sol > 0 && `(${unitDef.sol} 🪖)`}
													</span>
												)}
											</td>
											{!isDisbandMode && kingdom.autoBuild && (
												<td style={{ textAlign: "center", padding: "0.5rem" }}>
													<input
														type="number"
														name={key}
														value={targetQueue[key]}
														onChange={handleTargetChange}
														min="0"
														step="0.1"
														readOnly={isAutomatedProfile}
														disabled={isAutomatedProfile}
														title={
															isAutomatedProfile
																? `Target managed automatically by Governor Profile: ${kingdom.botSettings?.label}`
																: undefined
														}
														style={{
															width: "70px",
															padding: "0.2rem 0.4rem",
															background: isAutomatedProfile
																? "rgba(255, 255, 255, 0.03)"
																: "var(--bg-input)",
															border: isAutomatedProfile
																? "1px dashed var(--border-subtle)"
																: "1px solid var(--border-subtle)",
															borderRadius: "4px",
															color: isAutomatedProfile
																? "var(--text-secondary)"
																: "var(--text-primary)",
															textAlign: "center",
															cursor: isAutomatedProfile
																? "not-allowed"
																: "text",
															opacity: isAutomatedProfile ? 0.85 : 1,
														}}
													/>
												</td>
											)}
											<td style={{ textAlign: "center", padding: "0.5rem" }}>
												<MaxButton
													onClick={() => handleMaxClick(key)}
													label="Max"
												/>
											</td>
											<td style={{ textAlign: "center", padding: "0.5rem" }}>
												<input
													type="number"
													name={key}
													value={trainQueue[key]}
													onChange={handleInputChange}
													min="0"
													max={isDisbandMode ? count : undefined}
													disabled={isTraining}
													placeholder="0"
													style={{
														width: "90px",
														padding: "0.25rem 0.5rem",
														background: "var(--bg-input)",
														border: "1px solid var(--border-subtle)",
														borderRadius: "4px",
														color: "var(--text-primary)",
														textAlign: "center",
													}}
												/>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					<footer
						style={{
							marginTop: "1.25rem",
							paddingTop: "1rem",
							borderTop: "1px solid var(--border-subtle)",
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "1rem",
						}}
					>
						<div>
							<span>
								Total {isDisbandMode ? "Refund" : "Cost"}:{" "}
								<strong
									style={{
										color: isDisbandMode
											? "var(--accent-emerald)"
											: "var(--accent-amber)",
									}}
								>
									${(isDisbandMode ? refundAmount : totalCost).toLocaleString()}
								</strong>
							</span>
						</div>

						<div>
							<button
								type="submit"
								disabled={isTraining || requestSum <= 0}
								className={isDisbandMode ? "btn btn-danger" : "btn btn-primary"}
							>
								{isTraining
									? isDisbandMode
										? "Disbanding..."
										: "Training..."
									: isDisbandMode
										? "Disband Selected Units"
										: "Train Military Units"}
							</button>
						</div>
					</footer>
				</form>
			</div>

			{/* Auto Military Targets */}
			{kingdom.autoBuild && (
				<div
					className="card"
					style={{ padding: "1.25rem", marginBottom: "1.5rem" }}
				>
					<h3 style={{ marginBottom: "0.5rem" }}>Auto-Recruitment Targets</h3>
					<p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
						Military Target Sum:{" "}
						<strong
							style={{
								color:
									targetSum > 100
										? "var(--accent-rose)"
										: "var(--accent-emerald)",
							}}
						>
							{targetSum.toFixed(1)}%
						</strong>
					</p>
					<div
						style={{
							display: "flex",
							gap: "1rem",
							alignItems: "center",
							marginTop: "0.75rem",
							flexWrap: "wrap",
						}}
					>
						<button
							type="button"
							className="btn btn-primary"
							onClick={handleSaveTargets}
							disabled={
								isSavingTargets || isAutomatedProfile || targetSum > 100
							}
							title={
								isAutomatedProfile
									? `Military targets are governed by profile: ${kingdom.botSettings?.label}`
									: undefined
							}
						>
							{isSavingTargets ? "Saving..." : "Save Military Targets"}
						</button>
						<Link to="/kingdom/settings" className="btn btn-secondary">
							⚙️ Automation Settings
						</Link>
						{isAutomatedProfile && (
							<span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
								Targets governed by profile{" "}
								<strong>{kingdom.botSettings?.label}</strong>.
							</span>
						)}
					</div>
				</div>
			)}

			{/* Disband Mode Toggle */}
			<div style={{ display: "flex", justifyContent: "flex-end" }}>
				<label
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: "0.5rem",
						cursor: "pointer",
						fontSize: "0.9rem",
					}}
				>
					<input
						type="checkbox"
						checked={isDisbandMode}
						onChange={(e) => {
							setIsDisbandMode(e.target.checked);
							setTrainQueue(INITIAL_TRAIN_QUEUE);
						}}
					/>
					<span
						style={{
							color: isDisbandMode
								? "var(--accent-rose)"
								: "var(--text-secondary)",
						}}
					>
						Disband Personnel Mode
					</span>
				</label>
			</div>
		</div>
	);
};
