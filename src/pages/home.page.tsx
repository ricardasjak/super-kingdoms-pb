import type React from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CreateKingdomForm } from "../components/create-kingdom-form";
import { useAuth } from "../context/use-auth.hook";
import { useGameStatus } from "../hooks/use-game-status.hook";
import { useKingdom } from "../hooks/use-kingdom.hook";
import { pb } from "../lib/pocketbase";

export const HomePage: React.FC = () => {
	const { user, isAuthenticated } = useAuth();
	const { kingdom, hasKingdom, isLoading: kdLoading, refetch } = useKingdom();
	const { status: gameStatus } = useGameStatus();

	const [stepLoading, setStepLoading] = useState(false);
	const [stepMessage, setStepMessage] = useState<string | null>(null);
	const [showFoundingForm, setShowFoundingForm] = useState(false);

	// Unauthenticated Welcome View
	if (!isAuthenticated) {
		return (
			<div style={{ maxWidth: "800px", margin: "2rem auto" }}>
				<article style={{ textAlign: "center", padding: "3rem 2rem" }}>
					<header>
						<h1
							style={{
								fontSize: "2.4rem",
								margin: "0 0 0.5rem 0",
								letterSpacing: "0.05em",
							}}
						>
							SUPER KINGDOMS
						</h1>
						<p
							style={{
								color: "var(--pico-muted-color)",
								fontSize: "1.1rem",
								margin: 0,
							}}
						>
							Turn-Based Interstellar Strategy &amp; Galaxy Conquest
						</p>
					</header>

					<p
						style={{
							margin: "1.5rem 0 2rem 0",
							lineHeight: 1.6,
							fontSize: "0.95rem",
						}}
					>
						Found your sovereign realm across 100 galactic sectors, govern
						economies, colonize planetary territory, deploy espionage probes,
						and command orbital fleets.
					</p>

					<div
						style={{ display: "flex", gap: "1rem", justifyContent: "center" }}
					>
						<Link
							to="/login"
							role="button"
							style={{ padding: "0.75rem 2rem", fontWeight: 600 }}
						>
							🚀 Launch Command Deck
						</Link>
					</div>
				</article>
			</div>
		);
	}

	// Authenticated: Loading State
	if (kdLoading) {
		return (
			<article style={{ textAlign: "center", padding: "4rem 1rem" }}>
				<p aria-busy="true">Synchronizing galactic telemetry...</p>
			</article>
		);
	}

	// Authenticated: No Kingdom Found
	if (!hasKingdom || !kingdom) {
		return (
			<div style={{ maxWidth: "680px", margin: "2rem auto" }}>
				<article>
					<header style={{ textAlign: "center", paddingBottom: "1rem" }}>
						<h2 style={{ margin: "0 0 0.5rem 0" }}>
							👑 Unclaimed Sovereign Account
						</h2>
						<p style={{ color: "var(--pico-muted-color)", margin: 0 }}>
							Commander <strong>{user?.name || user?.email}</strong>, you have
							not yet established a kingdom in the current round.
						</p>
					</header>

					{!showFoundingForm ? (
						<div style={{ textAlign: "center", margin: "2rem 0 1rem" }}>
							<p style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
								Found your realm today to receive 250 starting acres, 2,250
								civilians, $300,000 treasury credits, and sector deployment
								coordinates.
							</p>
							<button
								type="button"
								onClick={() => setShowFoundingForm(true)}
								style={{ padding: "0.75rem 2rem", fontWeight: 600 }}
							>
								🪐 Found Your Kingdom Now
							</button>
						</div>
					) : (
						<div style={{ marginTop: "1.5rem" }}>
							<CreateKingdomForm
								onSuccess={() => {
									setShowFoundingForm(false);
									refetch();
								}}
								onCancel={() => setShowFoundingForm(false)}
							/>
						</div>
					)}
				</article>
			</div>
		);
	}

	// Authenticated: Active Kingdom Command Deck
	const buildings = kingdom.buildings || {
		res: 80,
		plants: 40,
		rax: 10,
		sm: 30,
		pf: 10,
		tc: 0,
		asb: 0,
	};
	const military = kingdom.military || {
		sol: 200,
		tr: 0,
		dr: 0,
		lt: 0,
		ld: 0,
		ft: 0,
		t: 0,
		tf: 0,
		sci: 300,
	};

	const resCap = (buildings.res || 0) * 50;
	const grossIncome =
		(buildings.sm || 0) * 140 + Math.round((kingdom.population || 2250) * 2);
	const powerOutput = (buildings.plants || 0) * 100;
	const powerDrain = Math.round(
		(kingdom.population || 2250) * 0.25 +
			(military.sol || 200) * 0.7 +
			(military.sci || 300) * 0.7,
	);
	const netPower = powerOutput - powerDrain;
	const barracksCap = (buildings.rax || 0) * 100;
	const totalTroops =
		(military.sol || 0) +
		(military.tr || 0) +
		(military.dr || 0) +
		(military.lt || 0) +
		(military.ld || 0) +
		(military.ft || 0) +
		(military.t || 0) +
		(military.tf || 0);

	const isNewbie = kingdom.is_newbie !== false;
	const newbieStep = kingdom.newbie_step || 0;

	const handleAdvanceStep = async () => {
		setStepLoading(true);
		setStepMessage(null);
		try {
			// Advance step via self-tick endpoint
			await pb.send("/api/kingdoms/self-tick", { method: "POST" });
			setStepMessage("✓ Advanced simulation by 8 ticks. Telemetry updated.");
			refetch();
		} catch (err: any) {
			setStepMessage(
				`⚠️ Error: ${err?.message || "Could not advance simulation"}`,
			);
		} finally {
			setStepLoading(false);
		}
	};

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
			{/* ─── NEWBIE MODE BANNER ─── */}
			{isNewbie && (
				<article
					style={{
						borderLeft: "4px solid #38bdf8",
						padding: "1rem 1.25rem",
						margin: 0,
						background: "#0e1626",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "1rem",
						}}
					>
						<div>
							<h3
								style={{
									margin: "0 0 0.25rem 0",
									fontSize: "1.05rem",
									color: "#38bdf8",
								}}
							>
								🔰 Newbie Protection Protocol (Phase 1)
							</h3>
							<p
								style={{
									margin: 0,
									fontSize: "0.85rem",
									color: "var(--pico-muted-color)",
								}}
							>
								Your realm is immune to hostile invasions. Advance simulation
								steps to grow population and complete building queues.
							</p>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
							<span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
								Progress:{" "}
								<strong className="land-text">Step {newbieStep} / 8</strong>
							</span>
							<button
								type="button"
								onClick={handleAdvanceStep}
								disabled={stepLoading}
								style={{ padding: "0.45rem 1rem", margin: 0, fontWeight: 600 }}
							>
								{stepLoading ? "Simulating..." : "⏩ Advance Step (Self-Tick)"}
							</button>
						</div>
					</div>
					{stepMessage && (
						<p
							style={{
								margin: "0.6rem 0 0 0",
								fontSize: "0.85rem",
								color: stepMessage.startsWith("✓")
									? "var(--sk-land)"
									: "var(--sk-combat)",
							}}
						>
							{stepMessage}
						</p>
					)}
				</article>
			)}

			{/* ─── 4-CARD METRIC GRID ─── */}
			<div className="grid">
				{/* Card 1: Demographics & Territory */}
				<article style={{ margin: 0 }}>
					<header>
						<h4 style={{ margin: 0, fontSize: "0.95rem", color: "#7dd3fc" }}>
							🌍 Territory &amp; Population
						</h4>
					</header>
					<table style={{ width: "100%", margin: 0 }}>
						<tbody>
							<tr>
								<td>Total Land</td>
								<td style={{ textAlign: "right" }}>
									<strong className="land-text">{kingdom.land} Acres</strong>
								</td>
							</tr>
							<tr>
								<td>Free (Unbuilt) Land</td>
								<td style={{ textAlign: "right" }}>
									<strong>{kingdom.free_land ?? 80} Acres</strong>
								</td>
							</tr>
							<tr>
								<td>Civilian Population</td>
								<td style={{ textAlign: "right" }}>
									<strong>
										{(kingdom.population || 2250).toLocaleString()}
									</strong>
								</td>
							</tr>
							<tr>
								<td>Housing Capacity</td>
								<td style={{ textAlign: "right" }}>
									<span>{resCap.toLocaleString()}</span>{" "}
									<small style={{ color: "var(--pico-muted-color)" }}>
										({buildings.res || 80} Res)
									</small>
								</td>
							</tr>
							<tr>
								<td>Growth Rate</td>
								<td style={{ textAlign: "right", color: "var(--sk-land)" }}>
									+2.5% / hour
								</td>
							</tr>
						</tbody>
					</table>
					<footer style={{ padding: "0.6rem", textAlign: "center" }}>
						<Link to="/kingdom/explore" style={{ fontSize: "0.8rem" }}>
							&rarr; Dispatch Land Survey
						</Link>
					</footer>
				</article>

				{/* Card 2: Economy & Production */}
				<article style={{ margin: 0 }}>
					<header>
						<h4 style={{ margin: 0, fontSize: "0.95rem", color: "#7dd3fc" }}>
							💰 Treasury &amp; Revenue
						</h4>
					</header>
					<table style={{ width: "100%", margin: 0 }}>
						<tbody>
							<tr>
								<td>Stored Treasury</td>
								<td style={{ textAlign: "right" }}>
									<strong className="gold-text">
										${(kingdom.money || 300000).toLocaleString()}
									</strong>
								</td>
							</tr>
							<tr>
								<td>Star Mines</td>
								<td style={{ textAlign: "right" }}>
									<strong>{buildings.sm || 30} Mines</strong>{" "}
									<small style={{ color: "var(--pico-muted-color)" }}>
										(${(buildings.sm * 140).toLocaleString()}/hr)
									</small>
								</td>
							</tr>
							<tr>
								<td>Civilian Taxes</td>
								<td style={{ textAlign: "right" }}>
									+$
									{Math.round(
										(kingdom.population || 2250) * 2,
									).toLocaleString()}
									/hr
								</td>
							</tr>
							<tr>
								<td>Estimated Gross Revenue</td>
								<td style={{ textAlign: "right", color: "var(--sk-gold)" }}>
									+${grossIncome.toLocaleString()}/hr
								</td>
							</tr>
							<tr>
								<td>Sector Tax Rate</td>
								<td style={{ textAlign: "right" }}>0% (Exempt)</td>
							</tr>
						</tbody>
					</table>
					<footer style={{ padding: "0.6rem", textAlign: "center" }}>
						<Link to="/kingdom/growth" style={{ fontSize: "0.8rem" }}>
							&rarr; Manage Infrastructure
						</Link>
					</footer>
				</article>
			</div>

			<div className="grid">
				{/* Card 3: Energy Grid */}
				<article style={{ margin: 0 }}>
					<header>
						<h4 style={{ margin: 0, fontSize: "0.95rem", color: "#7dd3fc" }}>
							⚡ Power Grid Dynamics
						</h4>
					</header>
					<table style={{ width: "100%", margin: 0 }}>
						<tbody>
							<tr>
								<td>Stored Energy</td>
								<td style={{ textAlign: "right" }}>
									<strong className="power-text">
										{(kingdom.power || 10000).toLocaleString()} MWh
									</strong>
								</td>
							</tr>
							<tr>
								<td>Active Generators</td>
								<td style={{ textAlign: "right" }}>
									<strong>{buildings.plants || 40} Power Plants</strong>
								</td>
							</tr>
							<tr>
								<td>Gross Generation</td>
								<td style={{ textAlign: "right", color: "var(--sk-power)" }}>
									+{powerOutput.toLocaleString()} / hr
								</td>
							</tr>
							<tr>
								<td>Grid Consumption</td>
								<td style={{ textAlign: "right" }}>
									-{powerDrain.toLocaleString()} / hr
								</td>
							</tr>
							<tr>
								<td>Net Energy Balance</td>
								<td style={{ textAlign: "right" }}>
									<strong
										style={{
											color:
												netPower >= 0 ? "var(--sk-power)" : "var(--sk-combat)",
										}}
									>
										{netPower >= 0 ? `+${netPower}` : netPower} / hr
									</strong>
								</td>
							</tr>
						</tbody>
					</table>
					<footer style={{ padding: "0.6rem", textAlign: "center" }}>
						<span style={{ fontSize: "0.8rem", color: "var(--sk-land)" }}>
							● Grid Status: Optimal (Normal)
						</span>
					</footer>
				</article>

				{/* Card 4: Armed Forces Garrison */}
				<article style={{ margin: 0 }}>
					<header>
						<h4 style={{ margin: 0, fontSize: "0.95rem", color: "#7dd3fc" }}>
							🛡️ Military Readiness
						</h4>
					</header>
					<table style={{ width: "100%", margin: 0 }}>
						<tbody>
							<tr>
								<td>Stationed Soldiers</td>
								<td style={{ textAlign: "right" }}>
									<strong>
										{(military.sol || 200).toLocaleString()} Troops
									</strong>{" "}
									<small style={{ color: "var(--pico-muted-color)" }}>
										({totalTroops} total)
									</small>
								</td>
							</tr>
							<tr>
								<td>Assigned Scientists</td>
								<td style={{ textAlign: "right" }}>
									<strong>
										{(military.sci || 300).toLocaleString()} Researchers
									</strong>
								</td>
							</tr>
							<tr>
								<td>Barracks Capacity</td>
								<td style={{ textAlign: "right" }}>
									<span>{barracksCap.toLocaleString()}</span>{" "}
									<small style={{ color: "var(--pico-muted-color)" }}>
										({buildings.rax || 10} Barracks)
									</small>
								</td>
							</tr>
							<tr>
								<td>Espionage Probes</td>
								<td style={{ textAlign: "right" }}>
									<strong>{kingdom.probes || 0} Probes</strong> (
									{kingdom.probe_credits ?? 10} credits)
								</td>
							</tr>
							<tr>
								<td>Composite Net Worth</td>
								<td style={{ textAlign: "right" }}>
									<strong style={{ color: "#a78bfa" }}>
										{(kingdom.networth || 13350).toLocaleString()}
									</strong>
								</td>
							</tr>
						</tbody>
					</table>
					<footer style={{ padding: "0.6rem", textAlign: "center" }}>
						<Link to="/kingdom/military" style={{ fontSize: "0.8rem" }}>
							&rarr; Train Armed Forces
						</Link>
					</footer>
				</article>
			</div>

			{/* ─── QUICK COMMAND CONSOLE ─── */}
			<article style={{ margin: 0 }}>
				<header>
					<h4 style={{ margin: 0, fontSize: "0.95rem", color: "#7dd3fc" }}>
						🕹️ Sovereign Operations Console
					</h4>
				</header>
				<div
					style={{
						display: "flex",
						gap: "0.75rem",
						flexWrap: "wrap",
						padding: "0.5rem 0",
					}}
				>
					<Link
						to="/kingdom/growth"
						role="button"
						className="secondary"
						style={{
							flex: "1 1 140px",
							textAlign: "center",
							fontSize: "0.82rem",
						}}
					>
						🏗️ Buildings
					</Link>
					<Link
						to="/kingdom/explore"
						role="button"
						className="secondary"
						style={{
							flex: "1 1 140px",
							textAlign: "center",
							fontSize: "0.82rem",
						}}
					>
						🗺️ Explore Land
					</Link>
					<Link
						to="/kingdom/military"
						role="button"
						className="secondary"
						style={{
							flex: "1 1 140px",
							textAlign: "center",
							fontSize: "0.82rem",
						}}
					>
						⚔️ Recruit Military
					</Link>
					<Link
						to="/kingdom/research"
						role="button"
						className="secondary"
						style={{
							flex: "1 1 140px",
							textAlign: "center",
							fontSize: "0.82rem",
						}}
					>
						🔬 Tech Tree
					</Link>
					<Link
						to="/kingdom/targets"
						role="button"
						className="secondary"
						style={{
							flex: "1 1 140px",
							textAlign: "center",
							fontSize: "0.82rem",
						}}
					>
						🎯 Target Scanner
					</Link>
					<Link
						to="/kingdom/reports"
						role="button"
						className="secondary"
						style={{
							flex: "1 1 140px",
							textAlign: "center",
							fontSize: "0.82rem",
						}}
					>
						📡 Espionage Probes
					</Link>
				</div>
			</article>
		</div>
	);
};
