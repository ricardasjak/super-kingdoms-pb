import type React from "react";
import { useEffect, useState } from "react";
import {
	calculateLevel,
	calculateMaxDefPotential,
	calculateMaxOffPotential,
	calculateMinDefPotential,
	calculateNetworth,
	SpyReportSOB,
	SpyReportSOK,
} from "../components/spy-report-sok";
import { useAuth } from "../context/use-auth.hook";
import { useKingdom } from "../hooks/use-kingdom.hook";
import { pb } from "../lib/pocketbase";
import type { SpyReportsResponse } from "../types/pb.model";

export const KingdomReportsPage: React.FC = () => {
	const { kingdom } = useKingdom();
	const { user } = useAuth();
	const [spyReports, setSpyReports] = useState<SpyReportsResponse[]>([]);
	const [isLoadingReports, setIsLoadingReports] = useState(true);

	useEffect(() => {
		if (!user) return;
		pb.collection("spyReports")
			.getFullList<SpyReportsResponse>({
				filter: `userId = "${user.id}"`,
				sort: "-spiedAt",
			})
			.then((res) => {
				setSpyReports(res);
				setIsLoadingReports(false);
			})
			.catch((err) => {
				console.error("Failed to fetch spy reports:", err);
				setIsLoadingReports(false);
			});
	}, [user]);

	if (!kingdom) return null;

	const military = kingdom.military || {
		sol: 0,
		tr: 0,
		dr: 0,
		ft: 0,
		tf: 0,
		lt: 0,
		ld: 0,
		lf: 0,
		f74: 0,
		t: 0,
		ht: 0,
		sci: 0,
	};
	const buildings = kingdom.buildings || {
		res: 0,
		plants: 0,
		rax: 0,
		sm: 0,
		pf: 0,
		tc: 0,
		asb: 0,
		ach: 0,
		rubble: 0,
		queue: {},
	};

	const level = calculateLevel(kingdom.land);
	const networth = calculateNetworth(
		kingdom.land,
		buildings,
		military,
		kingdom.population,
	);
	const maxDef = calculateMaxDefPotential(military);
	const maxOff = calculateMaxOffPotential(military);
	const minDef = calculateMinDefPotential(military);

	return (
		<div className="reports-page" style={{ marginTop: "1rem" }}>
			<div className="section-header-row" style={{ marginBottom: "1rem" }}>
				<div>
					<h1 className="page-heading">Intelligence & Strategic Reports</h1>
					<p className="page-subheading">
						Review your own tactical telemetry alongside espionage files
						retrieved by probe scouts.
					</p>
				</div>
			</div>

			{/* Your SOK */}
			<div style={{ marginBottom: "1.5rem" }}>
				<h3 style={{ marginBottom: "0.5rem" }}>Sovereign Realm Assessment</h3>
				<SpyReportSOK
					kdName={kingdom.kdName}
					rulerName={kingdom.rulerName}
					planetType={kingdom.planetType}
					raceType={kingdom.raceType}
					level={level}
					land={kingdom.land}
					networth={networth}
					honor={0}
					money={kingdom.money}
					population={kingdom.population}
					power={kingdom.power}
					probes={kingdom.probes || 0}
					scientists={military.sci || 0}
					maProtection={0}
					military={military as Record<string, number>}
					maxDefPotential={maxDef}
					maxOffPotential={maxOff}
					minDefPotential={minDef}
				/>
			</div>

			{/* Your SOB */}
			<div style={{ marginBottom: "2rem" }}>
				<h3 style={{ marginBottom: "0.5rem" }}>Infrastructure Assessment</h3>
				<SpyReportSOB
					kdName={kingdom.kdName}
					land={kingdom.land}
					buildings={buildings}
					landQueue={kingdom.landQueue || []}
				/>
			</div>

			{/* Spy Reports from Enemy Territories */}
			<div>
				<h3 style={{ marginBottom: "0.5rem" }}>
					Espionage & Probe Recon Archives
				</h3>
				{isLoadingReports ? (
					<p style={{ color: "var(--text-secondary)" }}>
						Scanning intelligence archives...
					</p>
				) : spyReports.length === 0 ? (
					<div
						className="card"
						style={{
							padding: "1.5rem",
							textAlign: "center",
							color: "var(--text-muted)",
						}}
					>
						<p style={{ margin: 0 }}>
							No enemy probe reports in the archives yet. Launch probes from
							target operations to gather intel.
						</p>
					</div>
				) : (
					<div
						style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
					>
						{spyReports
							.filter((r) => r.targetKdName !== kingdom.kdName)
							.map((report) => {
								const repMil = (report.military || {}) as Record<
									string,
									number
								>;
								const repMinDef = calculateMinDefPotential({
									lt: repMil.lt || 0,
									ld: repMil.ld || 0,
									lf: repMil.lf || 0,
									f74: repMil.f74 || 0,
								});

								return (
									<SpyReportSOK
										key={report.id}
										kdName={report.targetKdName}
										rulerName={report.targetRulerName}
										planetType={report.targetPlanetType}
										raceType={report.targetRaceType}
										level={report.targetLevel}
										land={report.land}
										networth={report.networth}
										honor={report.honor || 0}
										money={report.money}
										population={report.population}
										power={report.power}
										probes={report.probes || 0}
										scientists={report.scientists || 0}
										maProtection={report.maProtection || 0}
										military={repMil}
										maxDefPotential={report.maxDefPotential || 0}
										maxOffPotential={report.maxOffPotential || 0}
										minDefPotential={repMinDef}
										timestamp={report.spiedAt}
									/>
								);
							})}
					</div>
				)}
			</div>
		</div>
	);
};
