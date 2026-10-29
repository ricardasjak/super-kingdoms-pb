import { ClientResponseError } from "pocketbase";
import type React from "react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/use-auth.hook";
import { pb } from "../lib/pocketbase";
import type { GameStatusRecord } from "../types/pb.model";

export const LoginPage: React.FC = () => {
	const { login, loginWithDiscord, isAuthenticated } = useAuth();
	const navigate = useNavigate();

	const [status, setStatus] = useState<GameStatusRecord | null>(null);
	const [kingdomCount, setKingdomCount] = useState<number>(0);
	const [adminEmail, setAdminEmail] = useState("");
	const [adminPassword, setAdminPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/");
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		async function fetchGameStatus() {
			try {
				const statusRec = await pb
					.collection("game_status")
					.getFirstListItem<GameStatusRecord>("");
				setStatus(statusRec);
			} catch {
				// Unauthenticated or not seeded yet
			}

			try {
				const kingdomsList = await pb.collection("kingdoms").getList(1, 1);
				setKingdomCount(kingdomsList.totalItems);
			} catch {
				// ignore
			}
		}
		fetchGameStatus();
	}, []);

	const handleDiscordLogin = async () => {
		setError(null);
		setIsLoading(true);
		try {
			await loginWithDiscord();
			navigate("/");
		} catch (err: unknown) {
			if (err instanceof ClientResponseError) {
				setError(err.message || "Discord authentication failed.");
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Discord authentication failed.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleAdminLogin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setError(null);
		if (!adminEmail || !adminPassword) {
			setError("Please provide email and password.");
			return;
		}

		setIsLoading(true);
		try {
			await login(adminEmail.trim(), adminPassword);
			navigate("/");
		} catch (err: unknown) {
			if (err instanceof ClientResponseError) {
				setError(err.message || "Superuser login failed.");
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Superuser login failed.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleQuickLogin = async (email: string, pass: string) => {
		setAdminEmail(email);
		setAdminPassword(pass);
		setError(null);
		setIsLoading(true);
		try {
			await login(email, pass);
			navigate("/");
		} catch (err: unknown) {
			if (err instanceof ClientResponseError) {
				setError(err.message || "Login failed.");
			} else if (err instanceof Error) {
				setError(err.message);
			} else {
				setError("Login failed.");
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<main
			className="container"
			style={{ maxWidth: "580px", marginTop: "3rem" }}
		>
			<article>
				<header
					style={{
						textAlign: "center",
						borderBottom: "1px solid var(--sk-border-subtle)",
						paddingBottom: "1rem",
					}}
				>
					<h1
						style={{
							margin: "0.2rem 0",
							fontSize: "1.8rem",
							letterSpacing: "0.05em",
						}}
					>
						SUPER KINGDOMS
					</h1>
					<p
						style={{
							margin: 0,
							color: "var(--pico-muted-color)",
							fontSize: "0.9rem",
						}}
					>
						Multiplayer Galactic Strategy & Space Conquest
					</p>
				</header>

				{status && (
					<div
						style={{
							background: "#080c14",
							padding: "0.8rem",
							borderRadius: "4px",
							margin: "1.2rem 0",
							border: "1px solid #1e293b",
						}}
					>
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								fontSize: "0.85rem",
							}}
						>
							<span>
								Round:{" "}
								<strong className="land-text">#{status.round_number}</strong>
							</span>
							<span>
								Phase:{" "}
								<strong className="gold-text">
									{status.phase.toUpperCase()}
								</strong>
							</span>
							<span>
								Tick:{" "}
								<strong>
									{status.current_tick ?? 0} / {status.max_ticks ?? 960}
								</strong>
							</span>
							<span>
								Realms: <strong className="power-text">{kingdomCount}</strong>
							</span>
						</div>
					</div>
				)}

				{error && (
					<div
						style={{
							color: "var(--sk-combat)",
							background: "rgba(239, 68, 68, 0.1)",
							padding: "0.7rem",
							borderRadius: "4px",
							marginBottom: "1rem",
							border: "1px solid var(--sk-combat)",
							fontSize: "0.85rem",
						}}
					>
						⚠️ {error}
					</div>
				)}

				<div style={{ margin: "1.5rem 0", textAlign: "center" }}>
					<button
						type="button"
						onClick={handleDiscordLogin}
						disabled={isLoading}
						style={{
							width: "100%",
							background: "#5865F2",
							borderColor: "#5865F2",
							fontWeight: 600,
							padding: "0.75rem",
						}}
					>
						{isLoading ? "Connecting..." : "🚀 Log in with Discord"}
					</button>
					<small
						style={{
							display: "block",
							marginTop: "0.5rem",
							color: "var(--pico-muted-color)",
						}}
					>
						One-click secure login for commanders & players.
					</small>
				</div>

				{/* Quick Test Login Buttons */}
				<div
					style={{
						margin: "1.25rem 0",
						padding: "1rem",
						background: "#080e1a",
						border: "1px solid #1e293b",
						borderRadius: "6px",
					}}
				>
					<div
						style={{
							fontSize: "0.82rem",
							fontWeight: 600,
							color: "#7dd3fc",
							marginBottom: "0.6rem",
							textTransform: "uppercase",
							letterSpacing: "0.04em",
						}}
					>
						Quick Dev / Test Login
					</div>
					<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
						<button
							type="button"
							onClick={() =>
								handleQuickLogin("test@example.com", "password123")
							}
							disabled={isLoading}
							style={{
								flex: "1 1 180px",
								fontSize: "0.82rem",
								padding: "0.5rem",
								margin: 0,
								background: "#1e293b",
								border: "1px solid #334155",
							}}
						>
							⚡ test@example.com
						</button>
						<button
							type="button"
							onClick={() =>
								handleQuickLogin("admin@superkingdoms.internal", "password123")
							}
							disabled={isLoading}
							style={{
								flex: "1 1 180px",
								fontSize: "0.82rem",
								padding: "0.5rem",
								margin: 0,
								background: "#1e293b",
								border: "1px solid #334155",
							}}
						>
							⚡ admin@superkingdoms
						</button>
					</div>
					<div
						style={{
							fontSize: "0.75rem",
							color: "var(--pico-muted-color)",
							marginTop: "0.4rem",
						}}
					>
						Password for default dev accounts: <code>password123</code>
					</div>
				</div>

				<div
					style={{
						margin: "1rem 0",
						textAlign: "center",
						fontSize: "0.88rem",
					}}
				>
					<span style={{ color: "var(--pico-muted-color)" }}>
						Need a new kingdom account?{" "}
					</span>
					<Link
						to="/register"
						style={{
							color: "#38bdf8",
							fontWeight: 600,
							textDecoration: "underline",
						}}
					>
						Create Account / Register
					</Link>
				</div>

				<details
					style={{
						marginTop: "1.5rem",
						borderTop: "1px solid var(--sk-border-subtle)",
						paddingTop: "0.8rem",
					}}
				>
					<summary
						style={{ fontSize: "0.85rem", color: "var(--pico-muted-color)" }}
					>
						Custom Credentials Login
					</summary>
					<form onSubmit={handleAdminLogin} style={{ marginTop: "1rem" }}>
						<label htmlFor="admin-email" style={{ fontSize: "0.85rem" }}>
							Email
							<input
								id="admin-email"
								type="email"
								value={adminEmail}
								onChange={(e) => setAdminEmail(e.target.value)}
								placeholder="admin@superkingdoms.internal"
								required
							/>
						</label>
						<label htmlFor="admin-password" style={{ fontSize: "0.85rem" }}>
							Password
							<input
								id="admin-password"
								type="password"
								value={adminPassword}
								onChange={(e) => setAdminPassword(e.target.value)}
								placeholder="••••••••"
								required
							/>
						</label>
						<button
							type="submit"
							disabled={isLoading}
							className="secondary"
							style={{ width: "100%", marginTop: "0.5rem" }}
						>
							Authenticate with Credentials
						</button>
					</form>
				</details>
			</article>
		</main>
	);
};
