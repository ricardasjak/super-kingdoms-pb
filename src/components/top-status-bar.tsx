import type React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/use-auth.hook";
import { useGameStatus } from "../hooks/use-game-status.hook";
import { useKingdom } from "../hooks/use-kingdom.hook";

export const TopStatusBar: React.FC = () => {
	const { user, isAuthenticated, logout } = useAuth();
	const { kingdom, hasKingdom } = useKingdom();
	const { status: gameStatus } = useGameStatus();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const money = kingdom?.money ?? 300000;
	const power = kingdom?.power ?? 10000;
	const land = kingdom?.land ?? 250;
	const freeLand = kingdom?.free_land ?? 80;
	const population = kingdom?.population ?? 2250;
	const networth =
		kingdom?.networth ??
		((kingdom as Record<string, unknown>)?.nw as number) ??
		13350;
	const tick = gameStatus?.currentTick ?? 0;
	const maxTicks = gameStatus?.endTick ?? 960;
	const roundNum = gameStatus?.roundNumber ?? 1;
	const phase = (gameStatus?.status || "newbie").toUpperCase();

	return (
		<header
			style={{
				borderBottom: "1px solid var(--sk-border-subtle)",
				background: "#080c14",
				position: "sticky",
				top: 0,
				zIndex: 100,
			}}
		>
			{/* ─── 1. LIVE TELEMETRY BAR ─── */}
			{isAuthenticated && hasKingdom && (
				<div
					style={{
						display: "flex",
						flexWrap: "wrap",
						justifyContent: "space-between",
						alignItems: "center",
						padding: "0.4rem 1.25rem",
						background: "#05080f",
						borderBottom: "1px solid #141c2b",
						fontSize: "0.82rem",
						gap: "0.8rem",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "1rem",
							flexWrap: "wrap",
						}}
					>
						<span style={{ color: "#7dd3fc", fontWeight: 600 }}>
							🏛️ {kingdom?.name || kingdom?.kdName || "Sovereign Realm"}
						</span>
						<span style={{ color: "var(--pico-muted-color)" }}>
							[{kingdom?.planet_type || "Terran"} Homeworld &bull; Sector{" "}
							{kingdom?.sector_slot ?? 0}]
						</span>
					</div>

					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "1.25rem",
							flexWrap: "wrap",
						}}
					>
						<span>
							💰 Credits:{" "}
							<strong className="gold-text">${money.toLocaleString()}</strong>
						</span>
						<span>
							⚡ Power:{" "}
							<strong className="power-text">{power.toLocaleString()}</strong>
						</span>
						<span>
							🌍 Land:{" "}
							<strong className="land-text">{land.toLocaleString()}</strong> (
							{freeLand} free)
						</span>
						<span>
							👥 Civs: <strong>{population.toLocaleString()}</strong>
						</span>
						<span>
							🛡️ NW:{" "}
							<strong style={{ color: "#a78bfa" }}>
								{networth.toLocaleString()}
							</strong>
						</span>
						<span style={{ color: "var(--pico-muted-color)" }}>
							⏳ Round {roundNum} ({phase}) Tick {tick}/{maxTicks}
						</span>
					</div>
				</div>
			)}

			{/* ─── 2. PRIMARY NAVIGATION CONSOLE ─── */}
			<div
				className="container"
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					padding: "0.45rem 1rem",
					gap: "1rem",
					flexWrap: "wrap",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "1.5rem",
						flexWrap: "wrap",
					}}
				>
					<Link
						to="/"
						style={{
							textDecoration: "none",
							fontWeight: 700,
							color: "#38bdf8",
							letterSpacing: "0.05em",
							fontSize: "1rem",
							display: "flex",
							alignItems: "center",
							gap: "0.5rem",
						}}
					>
						<span>🌌 SUPER KINGDOMS</span>
					</Link>

					{isAuthenticated && hasKingdom && (
						<nav className="nav-links">
							<NavLink to="/" end>
								Command Deck
							</NavLink>
							<NavLink to="/kingdom/growth">Buildings</NavLink>
							<NavLink to="/kingdom/explore">Explore</NavLink>
							<NavLink to="/kingdom/military">Armed Forces</NavLink>
							<NavLink to="/kingdom/research">Research</NavLink>
							<NavLink to="/kingdom/targets">Invasions</NavLink>
							<NavLink to="/kingdom/reports">Espionage</NavLink>
						</nav>
					)}
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
					{isAuthenticated ? (
						<>
							<span
								style={{ fontSize: "0.8rem", color: "var(--pico-muted-color)" }}
							>
								{user?.name || user?.email}
							</span>
							<button
								type="button"
								className="secondary"
								onClick={handleLogout}
								style={{
									fontSize: "0.75rem",
									padding: "0.3rem 0.6rem",
									margin: 0,
								}}
							>
								Log Out
							</button>
						</>
					) : (
						<Link
							to="/login"
							role="button"
							style={{
								fontSize: "0.8rem",
								padding: "0.35rem 0.8rem",
								margin: 0,
							}}
						>
							Log In
						</Link>
					)}
				</div>
			</div>
		</header>
	);
};
