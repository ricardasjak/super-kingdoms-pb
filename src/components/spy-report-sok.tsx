import type React from "react";
import { Fragment } from "react";
import type { KingdomResearch } from "../types/game.types";

export {
	calculateLevel,
	calculateMaxDefPotential,
	calculateMaxOffPotential,
	calculateMinDefPotential,
	calculateNetworth,
} from "../utils/sok.util";

function formatDate(timestamp: number | string) {
	const date = new Date(typeof timestamp === "string" ? timestamp : timestamp);
	return (
		date.toLocaleDateString("en-GB", {
			day: "2-digit",
			month: "short",
			year: "numeric",
		}) +
		" at " +
		date.toLocaleTimeString("en-GB", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		})
	);
}

export interface SpyReportSOKProps {
	kdName: string;
	rulerName: string;
	planetType: string;
	raceType: string;
	level: number;
	land: number;
	networth: number;
	honor?: number;
	money: number;
	population: number;
	power: number;
	probes?: number;
	scientists?: number;
	maProtection?: number;
	military: Record<string, number>;
	maxDefPotential: number;
	maxOffPotential: number;
	minDefPotential: number;
	timestamp?: number | string;
}

export const SpyReportSOK: React.FC<SpyReportSOKProps> = ({
	kdName,
	rulerName,
	planetType,
	raceType,
	level,
	land,
	networth,
	honor = 0,
	money,
	population,
	power,
	probes = 0,
	scientists = 0,
	maProtection = 0,
	military,
	maxDefPotential,
	maxOffPotential,
	minDefPotential,
	timestamp,
}) => {
	return (
		<article
			className="card sok-card"
			style={{ marginTop: "1rem", fontSize: "0.85rem" }}
		>
			<header
				style={{
					marginBottom: "0.75rem",
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<strong>{kdName} — State of the Kingdom (SOK)</strong>
				{timestamp && (
					<span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
						{formatDate(timestamp)}
					</span>
				)}
			</header>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "180px 1fr",
					gap: "0.25rem 0.5rem",
				}}
			>
				<span className="text-secondary">Ruler Name:</span>
				<span style={{ fontWeight: 600 }}>{rulerName}</span>
				<span className="text-secondary">Planet Type:</span>
				<span>{planetType}</span>
				<span className="text-secondary">Race:</span>
				<span>
					{raceType} (Level {level})
				</span>
				<span className="text-secondary">Land:</span>
				<span style={{ color: "var(--accent-secondary)" }}>
					{land.toLocaleString()} acres
				</span>
				<span className="text-secondary">Networth:</span>
				<span style={{ fontWeight: 600 }}>{networth.toLocaleString()}</span>
				<span className="text-secondary">Honor:</span>
				<span>{honor.toLocaleString()}</span>
				<span className="text-secondary">Treasury Money:</span>
				<span style={{ color: "var(--accent-emerald)" }}>
					${money.toLocaleString()}
				</span>
				<span className="text-secondary">Population:</span>
				<span>{population.toLocaleString()}</span>
				<span className="text-secondary">Power Reserves:</span>
				<span>{power.toLocaleString()} MWh</span>
				<span className="text-secondary">Spy Probes:</span>
				<span>{probes.toLocaleString()}</span>
				<span className="text-secondary">Scientists:</span>
				<span>{scientists.toLocaleString()}</span>
				<span className="text-secondary">MA Protection:</span>
				<span>{maProtection}%</span>
			</div>

			<hr
				style={{ margin: "0.75rem 0", borderColor: "var(--border-subtle)" }}
			/>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "180px 1fr",
					gap: "0.2rem 0.5rem",
				}}
			>
				{[
					{ label: "Soldiers", value: military.sol || 0 },
					{ label: "Troopers", value: military.tr || 0 },
					{ label: "Dragoons", value: military.dr || 0 },
					{ label: "Fighters", value: military.ft || 0 },
					{ label: "Tactical Fighters", value: military.tf || 0 },
					{ label: "Laser Troopers", value: military.lt || 0 },
					{ label: "Laser Dragoons", value: military.ld || 0 },
					{ label: "Laser Fighters", value: military.lf || 0 },
					{ label: "F74 Drones", value: military.f74 || 0 },
					{ label: "Tanks", value: military.t || 0 },
					{ label: "Hover Tanks", value: military.ht || 0 },
				]
					.filter((u) => u.value > 0)
					.map((u) => (
						<Fragment key={u.label}>
							<span className="text-secondary">{u.label}:</span>
							<span>{u.value.toLocaleString()}</span>
						</Fragment>
					))}
			</div>

			<hr
				style={{ margin: "0.75rem 0", borderColor: "var(--border-subtle)" }}
			/>

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "180px 1fr",
					gap: "0.2rem 0.5rem",
				}}
			>
				<span className="text-secondary">Max Def. Potential:</span>
				<span style={{ fontWeight: 600, color: "var(--accent-secondary)" }}>
					{maxDefPotential.toLocaleString()}
				</span>
				<span className="text-secondary">Min Def. Potential:</span>
				<span>{minDefPotential.toLocaleString()}</span>
				<span className="text-secondary">Max Off. Potential:</span>
				<span style={{ fontWeight: 600, color: "var(--accent-rose)" }}>
					{maxOffPotential.toLocaleString()}
				</span>
			</div>
		</article>
	);
};

export interface SpyReportSoEProps {
	kdName: string;
	moneyIncome: number;
	powerIncome: number;
	power: number;
	probes: number;
	pfCount: number;
	population: number;
	popChange: number;
	barracksUsage: number;
	barracksCap: number;
	research?: KingdomResearch;
}

export const SpyReportSoE: React.FC<SpyReportSoEProps> = ({
	kdName,
	moneyIncome,
	powerIncome,
	pfCount,
	population,
	popChange,
	barracksUsage,
	barracksCap,
	research,
	power,
	probes,
}) => {
	const probeProduction = pfCount * 1;
	const researchKeys = ["pop", "power", "mil", "money", "warp", "fdc"] as const;
	const researchLabels: Record<(typeof researchKeys)[number], string> = {
		pop: "Population Bonus",
		power: "Power Bonus",
		mil: "Military Bonus",
		money: "Money Bonus",
		fdc: "FDC",
		warp: "Warp Drive",
	};

	return (
		<article
			className="card soe-card"
			style={{ marginTop: "1rem", fontSize: "0.85rem" }}
		>
			<header style={{ marginBottom: "0.75rem" }}>
				<strong>{kdName} — State of the Economy (SoE)</strong>
			</header>
			<div
				style={{
					display: "grid",
					gridTemplateColumns: "180px 1fr",
					gap: "0.25rem 0.5rem",
				}}
			>
				<span className="text-secondary">Net Income:</span>
				<span style={{ color: "var(--accent-emerald)", fontWeight: 600 }}>
					${moneyIncome.toLocaleString()} / tick
				</span>
				<span className="text-secondary">Power Reserves:</span>
				<span>
					{power.toLocaleString()} (
					<span
						style={{
							color:
								powerIncome < 0
									? "var(--accent-rose)"
									: "var(--accent-emerald)",
							fontWeight: 600,
						}}
					>
						{powerIncome >= 0
							? `+${powerIncome.toLocaleString()}`
							: powerIncome.toLocaleString()}{" "}
						/ tick
					</span>
					)
				</span>

				<span className="text-secondary">Probes:</span>
				<span>
					{probes.toLocaleString()} (+{probeProduction.toLocaleString()} / tick)
				</span>
				<span className="text-secondary">Population:</span>
				<span>
					{population.toLocaleString()} (
					<span
						style={{
							color: popChange < 0 ? "var(--accent-rose)" : "inherit",
						}}
					>
						{popChange > 0 ? `+${popChange}` : popChange} / tick
					</span>
					)
				</span>
				<span className="text-secondary">Barracks Housing:</span>
				<span>
					{barracksUsage.toLocaleString()} / {barracksCap.toLocaleString()}{" "}
					{barracksCap > 0 && (
						<span
							style={{
								color:
									barracksUsage > barracksCap
										? "var(--accent-rose)"
										: "var(--text-secondary)",
								fontWeight: 600,
							}}
						>
							({((barracksUsage / barracksCap) * 100).toFixed(0)}%)
						</span>
					)}
				</span>

				{research &&
					researchKeys.some((key) => (research[key]?.pts ?? 0) > 0) && (
						<Fragment>
							<hr
								style={{
									gridColumn: "1 / -1",
									margin: "0.5rem 0",
									borderColor: "var(--border-subtle)",
								}}
							/>
							{researchKeys.map((key) => {
								const bonus = research[key]?.perc ?? 0;
								if (bonus === 0) return null;
								return (
									<Fragment key={key}>
										<span className="text-secondary">
											{researchLabels[key]}:
										</span>
										<span
											style={{
												color: "var(--accent-primary)",
												fontWeight: 600,
											}}
										>
											+{bonus}%
										</span>
									</Fragment>
								);
							})}
						</Fragment>
					)}
			</div>
		</article>
	);
};

const BUILDING_NAMES: Record<string, string> = {
	res: "Residences",
	plants: "Power Plants",
	rax: "Barracks",
	sm: "Star Mines",
	pf: "Probe Factories",
	tc: "Training Camps",
	asb: "Air Support Bays",
	ach: "Aegis Control Hub",
	rubble: "Rubble",
	land: "Land",
};

export interface SpyReportSOBProps {
	kdName: string;
	land: number;
	buildings: {
		res: number;
		plants: number;
		rax: number;
		sm: number;
		pf: number;
		tc: number;
		asb: number;
		ach: number;
		rubble: number;
		queue?: Record<string, number[]>;
	};
	landQueue?: number[];
	timestamp?: number | string;
}

export const SpyReportSOB: React.FC<SpyReportSOBProps> = ({
	kdName,
	land,
	buildings,
	landQueue,
	timestamp,
}) => {
	const buildingKeys = [
		"res",
		"plants",
		"rax",
		"sm",
		"pf",
		"tc",
		"asb",
		"rubble",
	] as const;

	const totalBuildings = land;
	const queueLength = 16;

	const renderQueueCell = (key: string, tickIndex: number) => {
		const queue = buildings.queue?.[key];
		const value = queue?.[tickIndex] || 0;
		return (
			<span
				key={tickIndex}
				style={{
					textAlign: "center",
					color: value > 0 ? "var(--accent-primary)" : "var(--text-muted)",
					fontWeight: value > 0 ? 600 : "normal",
				}}
			>
				{value}
			</span>
		);
	};

	return (
		<article
			className="card sob-card"
			style={{ marginTop: "1rem", fontSize: "0.85rem" }}
		>
			<header
				style={{
					marginBottom: "0.75rem",
					display: "flex",
					justifyContent: "space-between",
				}}
			>
				<strong>{kdName} — State of Buildings (SOB)</strong>
				{timestamp && (
					<span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
						{formatDate(timestamp)}
					</span>
				)}
			</header>
			<div style={{ overflowX: "auto" }}>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: `140px 70px 60px repeat(${queueLength}, minmax(28px, 1fr))`,
						gap: "0.25rem 0.4rem",
						alignItems: "center",
						minWidth: "750px",
					}}
				>
					<span
						style={{
							fontWeight: "bold",
							borderBottom: "1px solid var(--border-subtle)",
						}}
					>
						Building
					</span>
					<span
						style={{
							fontWeight: "bold",
							borderBottom: "1px solid var(--border-subtle)",
						}}
					>
						Count
					</span>
					<span
						style={{
							fontWeight: "bold",
							borderBottom: "1px solid var(--border-subtle)",
						}}
					>
						%
					</span>
					{Array.from({ length: queueLength }, (_, i) => (
						<span
							key={`h-${i}`}
							style={{
								fontWeight: "bold",
								textAlign: "center",
								borderBottom: "1px solid var(--border-subtle)",
								color: "var(--text-muted)",
								fontSize: "0.75rem",
							}}
						>
							+{i + 1}
						</span>
					))}

					{buildingKeys.map((key) => {
						const count =
							(buildings as unknown as Record<string, number>)[key] || 0;
						const pct = totalBuildings > 0 ? (count / totalBuildings) * 100 : 0;
						return (
							<Fragment key={key}>
								<span className="text-secondary">{BUILDING_NAMES[key]}</span>
								<span>{count.toLocaleString()}</span>
								<span style={{ color: "var(--text-muted)" }}>
									{pct.toFixed(0)}%
								</span>
								{Array.from({ length: queueLength }, (_, i) =>
									renderQueueCell(key, i),
								)}
							</Fragment>
						);
					})}

					<span
						style={{
							fontWeight: "bold",
							borderTop: "1px solid var(--border-subtle)",
							paddingTop: "0.25rem",
						}}
					>
						Total Land
					</span>
					<span
						style={{
							fontWeight: "bold",
							borderTop: "1px solid var(--border-subtle)",
							paddingTop: "0.25rem",
						}}
					>
						{land.toLocaleString()}
					</span>
					<span
						style={{
							borderTop: "1px solid var(--border-subtle)",
							paddingTop: "0.25rem",
						}}
					>
						100%
					</span>
					{Array.from({ length: queueLength }, (_, i) => {
						const queueValue = landQueue?.[i] ?? 0;
						return (
							<span
								key={`land-tick-${i}`}
								style={{
									fontWeight: "bold",
									textAlign: "center",
									borderTop: "1px solid var(--border-subtle)",
									paddingTop: "0.25rem",
									color:
										queueValue > 0
											? "var(--accent-secondary)"
											: "var(--text-muted)",
								}}
							>
								{queueValue}
							</span>
						);
					})}
				</div>
			</div>
		</article>
	);
};
