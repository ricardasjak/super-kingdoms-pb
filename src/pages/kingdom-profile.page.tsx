import type React from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useKingdomMessage } from "../context/kingdom-message.context";
import { useTheme } from "../context/theme.context";
import { useAuth } from "../context/use-auth.hook";
import { useKingdom } from "../hooks/use-kingdom.hook";

export const KingdomProfilePage: React.FC = () => {
	const { kingdom, updateRulerName, resetKingdom } = useKingdom();
	const { logout } = useAuth();
	const { theme, toggleTheme } = useTheme();
	const { showMessage } = useKingdomMessage();
	const navigate = useNavigate();

	const [newName, setNewName] = useState("");
	const [isUpdating, setIsUpdating] = useState(false);
	const [isResetting, setIsResetting] = useState(false);

	if (!kingdom) return null;

	const handleUpdateName = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!newName || newName.trim() === "") {
			showMessage("Ruler name cannot be empty", "error");
			return;
		}

		setIsUpdating(true);
		try {
			await updateRulerName(newName.trim());
			setNewName("");
			showMessage("Ruler name updated successfully!", "success");
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to update ruler name";
			showMessage(msg, "error");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleResetKingdom = async () => {
		if (
			!window.confirm(
				"Are you sure you want to RESET your kingdom to the initial starting state? This action cannot be undone.",
			)
		) {
			return;
		}

		setIsResetting(true);
		try {
			await resetKingdom();
			showMessage("Kingdom reset to initial state successfully!", "success");
			navigate("/kingdom/status");
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to reset kingdom";
			showMessage(msg, "error");
		} finally {
			setIsResetting(false);
		}
	};

	return (
		<div
			className="profile-page"
			style={{ marginTop: "1rem", maxWidth: "800px" }}
		>
			<div className="section-header-row" style={{ marginBottom: "1.5rem" }}>
				<div>
					<h1 className="page-heading">Ruler Account & Settings</h1>
					<p className="page-subheading">
						Manage your sovereign credentials, interface aesthetics, and realm
						lifecycle.
					</p>
				</div>
			</div>

			{/* Update Ruler Details */}
			<div
				className="card"
				style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
			>
				<h3 style={{ marginBottom: "0.5rem" }}>Update Sovereign Title</h3>
				<p
					style={{
						color: "var(--text-secondary)",
						fontSize: "0.9rem",
						marginBottom: "1rem",
					}}
				>
					Current Ruler Name:{" "}
					<strong style={{ color: "var(--text-primary)" }}>
						{kingdom.rulerName}
					</strong>
				</p>

				<form
					onSubmit={handleUpdateName}
					style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
				>
					<input
						type="text"
						value={newName}
						onChange={(e) => setNewName(e.target.value)}
						disabled={isUpdating}
						placeholder="Enter new sovereign title..."
						style={{
							flex: 1,
							minWidth: "220px",
							padding: "0.5rem 0.8rem",
							background: "var(--bg-input)",
							border: "1px solid var(--border-subtle)",
							borderRadius: "6px",
							color: "var(--text-primary)",
						}}
					/>
					<button
						type="submit"
						disabled={isUpdating || newName.trim() === ""}
						className="btn btn-primary"
					>
						{isUpdating ? "Updating..." : "Update Ruler Name"}
					</button>
				</form>
			</div>

			{/* Appearance Settings */}
			<div
				className="card"
				style={{ padding: "1.5rem", marginBottom: "1.5rem" }}
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
						<h3 style={{ margin: "0 0 0.25rem" }}>Interface Theme</h3>
						<p
							style={{
								color: "var(--text-secondary)",
								fontSize: "0.9rem",
								margin: 0,
							}}
						>
							Current Mode:{" "}
							<strong>
								{theme === "dark" ? "Deep Cosmos (Dark)" : "Solar Day (Light)"}
							</strong>
						</p>
					</div>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={toggleTheme}
					>
						{theme === "dark"
							? "☀️ Switch to Light Mode"
							: "🌙 Switch to Dark Mode"}
					</button>
				</div>
			</div>

			{/* Danger Zone */}
			<div
				className="card"
				style={{ padding: "1.5rem", borderColor: "rgba(244, 63, 94, 0.3)" }}
			>
				<h3 style={{ color: "var(--accent-rose)", marginBottom: "0.5rem" }}>
					Danger Zone
				</h3>
				<p
					style={{
						color: "var(--text-secondary)",
						fontSize: "0.9rem",
						marginBottom: "1.25rem",
					}}
				>
					Irreversible administrative operations affecting your sovereignty.
				</p>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
						gap: "1rem",
					}}
				>
					<div
						style={{
							padding: "1rem",
							background: "rgba(255, 255, 255, 0.02)",
							borderRadius: "6px",
							border: "1px solid var(--border-subtle)",
						}}
					>
						<button
							type="button"
							className="btn btn-secondary"
							style={{ width: "100%", marginBottom: "0.5rem" }}
							onClick={logout}
						>
							Sign Out
						</button>
						<small style={{ color: "var(--text-muted)", display: "block" }}>
							Safely exit this terminal session.
						</small>
					</div>

					<div
						style={{
							padding: "1rem",
							background: "rgba(255, 255, 255, 0.02)",
							borderRadius: "6px",
							border: "1px solid var(--border-subtle)",
						}}
					>
						<button
							type="button"
							className="btn btn-secondary"
							style={{
								width: "100%",
								marginBottom: "0.5rem",
								color: "var(--accent-rose)",
								borderColor: "var(--accent-rose)",
							}}
							onClick={handleResetKingdom}
							disabled={isResetting}
						>
							{isResetting ? "Resetting..." : "Reset Kingdom"}
						</button>
						<small style={{ color: "var(--text-muted)", display: "block" }}>
							Reinitializes resources to 250 land & $300k.
						</small>
					</div>

					<div
						style={{
							padding: "1rem",
							background: "rgba(255, 255, 255, 0.02)",
							borderRadius: "6px",
							border: "1px solid var(--border-subtle)",
						}}
					>
						<Link
							to="/kingdom/delete"
							className="btn btn-danger"
							style={{
								width: "100%",
								display: "inline-block",
								textAlign: "center",
								marginBottom: "0.5rem",
							}}
						>
							Abdicate & Delete
						</Link>
						<small style={{ color: "var(--text-muted)", display: "block" }}>
							Permanently eradicates realm from galaxy.
						</small>
					</div>
				</div>
			</div>
		</div>
	);
};
