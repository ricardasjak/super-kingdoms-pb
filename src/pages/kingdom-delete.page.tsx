import { AlertTriangle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useKingdom } from "../hooks/use-kingdom.hook";

export const KingdomDeletePage: React.FC = () => {
	const navigate = useNavigate();
	const { kingdom, deleteKingdom } = useKingdom();
	const [isDeleting, setIsDeleting] = useState(false);

	if (!kingdom) return null;

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			await deleteKingdom();
			navigate("/create");
		} catch (error) {
			console.error("Failed to delete kingdom", error);
			alert("Failed to delete kingdom. Please try again.");
			setIsDeleting(false);
		}
	};

	return (
		<div className="container" style={{ maxWidth: "600px", marginTop: "3rem" }}>
			<div
				className="card"
				style={{
					padding: "2rem",
					borderColor: "var(--accent-rose)",
					background: "rgba(244, 63, 94, 0.05)",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.75rem",
						marginBottom: "1rem",
					}}
				>
					<AlertTriangle size={32} color="var(--accent-rose)" />
					<div>
						<h2 style={{ margin: 0, color: "var(--accent-rose)" }}>
							Abdicate Sovereign Throne
						</h2>
						<p
							style={{ margin: "0.25rem 0 0", color: "var(--text-secondary)" }}
						>
							Are you completely certain you want to destroy{" "}
							<strong>{kingdom.kdName}</strong>?
						</p>
					</div>
				</div>

				<p
					style={{
						lineHeight: 1.6,
						color: "var(--text-primary)",
						margin: "1.5rem 0",
					}}
				>
					<strong>Critical Warning:</strong> Deleting your kingdom is
					irreversible. All your sovereign territory (
					{kingdom.land.toLocaleString()} acres), treasury funds, trained
					armies, scientific breakthroughs, and 5 subordinate vassal realms will
					be irrevocably disintegrated from the stellar registry.
				</p>

				<div
					style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}
				>
					<button
						type="button"
						className="btn btn-secondary"
						onClick={() => navigate("/kingdom/status")}
						disabled={isDeleting}
					>
						Cancel & Return to Deck
					</button>
					<button
						type="button"
						className="btn btn-danger"
						onClick={handleDelete}
						disabled={isDeleting}
					>
						{isDeleting ? "Disintegrating Realm..." : "Yes, Destroy My Kingdom"}
					</button>
				</div>
			</div>
		</div>
	);
};
