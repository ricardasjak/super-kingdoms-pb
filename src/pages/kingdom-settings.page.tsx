import { AlertCircle, Check } from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
	BOT_PROFILES,
	type BotProfile,
} from "../constants/bot-params.constants";
import { useKingdom } from "../hooks/use-kingdom.hook";

export const KingdomSettingsPage: React.FC = () => {
	const { kingdom, updateBotProfile } = useKingdom();
	const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
		"idle",
	);
	const [errorMsg, setErrorMsg] = useState<string | null>(null);

	if (!kingdom) return null;

	const handleProfileChange = async (profileKey: string | null) => {
		try {
			setSaveStatus("saving");
			setErrorMsg(null);
			if (!profileKey) {
				await updateBotProfile(null);
			} else {
				const profile = BOT_PROFILES[profileKey];
				await updateBotProfile(profile);
			}
			setSaveStatus("saved");
			setTimeout(() => {
				setSaveStatus((prev) => (prev === "saved" ? "idle" : prev));
			}, 2000);
		} catch (err: unknown) {
			setSaveStatus("idle");
			const msg = err instanceof Error ? err.message : "Update failed";
			setErrorMsg(msg);
		}
	};

	const profileKeys = Object.keys(BOT_PROFILES).sort((a, b) => {
		const profileA = BOT_PROFILES[a];
		const profileB = BOT_PROFILES[b];
		if (profileB.exploration !== profileA.exploration) {
			return profileB.exploration - profileA.exploration;
		}
		if (profileB.science !== profileA.science) {
			return profileB.science - profileA.science;
		}
		return profileB.defense - profileA.defense;
	});

	const activeLabel = kingdom.botSettings?.label;

	return (
		<div className="settings-page" style={{ marginTop: "1rem" }}>
			<div className="section-header-row" style={{ marginBottom: "1.5rem" }}>
				<div>
					<h1 className="page-heading">
						Kingdom Automation & Strategy Directives
					</h1>
					<p className="page-subheading">
						Delegate routine planetary expansion and military recruitment to
						autonomous governor routines.
					</p>
				</div>
			</div>

			<div
				className="card"
				style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
			>
				<h3 style={{ marginBottom: "0.5rem" }}>Governor Strategy Directive</h3>
				<p
					style={{
						color: "var(--text-secondary)",
						fontSize: "0.9rem",
						marginBottom: "1rem",
					}}
				>
					Selecting an automated profile allows the simulation engine to manage
					land exploration, building zoning, and unit recruitment on each game
					tick.
				</p>

				<div
					style={{
						display: "flex",
						gap: "1rem",
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<select
						value={
							profileKeys.find((k) => BOT_PROFILES[k].label === activeLabel) ||
							""
						}
						onChange={(e) => handleProfileChange(e.target.value || null)}
						disabled={saveStatus === "saving"}
						style={{
							padding: "0.5rem 0.8rem",
							background: "var(--bg-input)",
							border: "1px solid var(--border-subtle)",
							borderRadius: "6px",
							color: "var(--text-primary)",
							minWidth: "240px",
							cursor: saveStatus === "saving" ? "wait" : "pointer",
						}}
					>
						<option value="">Manual (Full Player Control)</option>
						{profileKeys.map((k) => (
							<option key={k} value={k}>
								{BOT_PROFILES[k].label}
							</option>
						))}
					</select>

					{activeLabel ? (
						<span
							style={{
								padding: "0.3rem 0.8rem",
								background: "rgba(16, 185, 129, 0.15)",
								color: "var(--accent-emerald, #10b981)",
								border: "1px solid rgba(16, 185, 129, 0.4)",
								borderRadius: "20px",
								fontSize: "0.8rem",
								fontWeight: 600,
								display: "inline-flex",
								alignItems: "center",
								gap: "0.45rem",
							}}
						>
							<span
								style={{
									width: "6px",
									height: "6px",
									borderRadius: "50%",
									background: "var(--accent-emerald, #10b981)",
									boxShadow: "0 0 6px rgba(16, 185, 129, 0.8)",
								}}
							/>
							ACTIVE: {activeLabel.toUpperCase()}
						</span>
					) : (
						<span
							style={{
								padding: "0.3rem 0.8rem",
								background: "rgba(255, 255, 255, 0.05)",
								color: "var(--text-muted, #94a3b8)",
								border: "1px solid var(--border-subtle)",
								borderRadius: "20px",
								fontSize: "0.8rem",
								fontWeight: 500,
							}}
						>
							MANUAL CONTROL
						</span>
					)}

					{saveStatus === "saving" && (
						<span
							style={{
								fontSize: "0.85rem",
								color: "var(--text-secondary)",
								display: "inline-flex",
								alignItems: "center",
								gap: "0.4rem",
							}}
						>
							<div className="spinner-small" /> Saving...
						</span>
					)}

					{saveStatus === "saved" && (
						<span
							style={{
								fontSize: "0.85rem",
								color: "var(--accent-emerald)",
								display: "inline-flex",
								alignItems: "center",
								gap: "0.35rem",
								fontWeight: 500,
							}}
						>
							<Check size={15} /> Saved
						</span>
					)}

					{errorMsg && (
						<span
							style={{
								fontSize: "0.85rem",
								color: "var(--accent-rose)",
								display: "inline-flex",
								alignItems: "center",
								gap: "0.35rem",
							}}
						>
							<AlertCircle size={15} /> {errorMsg}
						</span>
					)}
				</div>
			</div>

			<div className="card" style={{ padding: "1.5rem" }}>
				<h3 style={{ marginBottom: "1rem" }}>
					Directive Specifications Catalog
				</h3>

				<div style={{ overflowX: "auto" }}>
					<table
						className="dense-table"
						style={{ width: "100%", borderCollapse: "collapse" }}
					>
						<thead>
							<tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
								<th
									rowSpan={2}
									style={{
										textAlign: "left",
										padding: "0.6rem",
										verticalAlign: "middle",
									}}
								>
									Profile Directive
								</th>
								<th
									rowSpan={2}
									style={{
										textAlign: "center",
										padding: "0.6rem",
										verticalAlign: "middle",
									}}
								>
									Exploration
								</th>
								<th
									colSpan={3}
									style={{
										textAlign: "center",
										padding: "0.6rem",
										borderBottom: "1px solid var(--border-subtle)",
									}}
								>
									Military Focus
								</th>
								<th
									rowSpan={2}
									style={{
										textAlign: "center",
										padding: "0.6rem",
										verticalAlign: "middle",
									}}
								>
									Science
								</th>
								<th
									colSpan={2}
									style={{
										textAlign: "center",
										padding: "0.6rem",
										borderBottom: "1px solid var(--border-subtle)",
									}}
								>
									Infrastructure Targets
								</th>
							</tr>
							<tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
								<th style={{ textAlign: "center", padding: "0.4rem" }}>
									Offense
								</th>
								<th style={{ textAlign: "center", padding: "0.4rem" }}>
									Defense
								</th>
								<th style={{ textAlign: "center", padding: "0.4rem" }}>Flex</th>
								<th style={{ textAlign: "center", padding: "0.4rem" }}>PF %</th>
								<th style={{ textAlign: "center", padding: "0.4rem" }}>TC %</th>
							</tr>
						</thead>
						<tbody>
							{/* Manual Control Row */}
							{(() => {
								const isManualActive = !activeLabel;
								return (
									<tr
										onClick={() => handleProfileChange(null)}
										style={{
											borderBottom: "1px solid var(--border-subtle)",
											cursor: "pointer",
											background: isManualActive
												? "rgba(16, 185, 129, 0.12)"
												: undefined,
											fontWeight: isManualActive ? 600 : undefined,
											borderLeft: isManualActive
												? "4px solid var(--accent-emerald)"
												: "4px solid transparent",
										}}
									>
										<td style={{ padding: "0.6rem" }}>
											<strong
												style={{
													color: isManualActive
														? "var(--accent-emerald)"
														: "var(--text-primary)",
												}}
											>
												Manual
											</strong>
											<span
												style={{
													display: "block",
													fontSize: "0.75rem",
													color: "var(--text-muted)",
													marginTop: "0.15rem",
												}}
											>
												Player sets buildings, military and exploration targets
											</span>
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--text-muted)",
											}}
										>
											&mdash;
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--text-muted)",
											}}
										>
											&mdash;
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--text-muted)",
											}}
										>
											&mdash;
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--text-muted)",
											}}
										>
											&mdash;
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--text-muted)",
											}}
										>
											&mdash;
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--text-muted)",
											}}
										>
											&mdash;
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--text-muted)",
											}}
										>
											&mdash;
										</td>
									</tr>
								);
							})()}

							{profileKeys.map((key) => {
								const p: BotProfile = BOT_PROFILES[key];
								const isActive = activeLabel === p.label;

								return (
									<tr
										key={key}
										onClick={() => handleProfileChange(key)}
										style={{
											borderBottom: "1px solid var(--border-subtle)",
											cursor: "pointer",
											background: isActive
												? "rgba(16, 185, 129, 0.12)"
												: undefined,
											fontWeight: isActive ? 600 : undefined,
											borderLeft: isActive
												? "4px solid var(--accent-emerald)"
												: "4px solid transparent",
										}}
									>
										<td style={{ padding: "0.6rem" }}>
											<strong
												style={{
													color: isActive
														? "var(--accent-emerald)"
														: "var(--text-primary)",
												}}
											>
												{p.label}
											</strong>
										</td>
										<td style={{ textAlign: "center", padding: "0.6rem" }}>
											{p.exploration}
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--accent-rose)",
											}}
										>
											{p.offense}%
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--accent-secondary)",
											}}
										>
											{p.defense}%
										</td>
										<td style={{ textAlign: "center", padding: "0.6rem" }}>
											{p.flex}%
										</td>
										<td
											style={{
												textAlign: "center",
												padding: "0.6rem",
												color: "var(--accent-primary)",
											}}
										>
											{p.science}%
										</td>
										<td style={{ textAlign: "center", padding: "0.6rem" }}>
											{p.buildings.pf}%
										</td>
										<td style={{ textAlign: "center", padding: "0.6rem" }}>
											{p.buildings.tc}%
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
