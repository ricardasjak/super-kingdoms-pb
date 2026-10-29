import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Crown,
	Globe2,
	Sparkles,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import {
	PLANET_CODES,
	PLANET_DETAILS,
	type PlanetTypeCode,
} from "../constants/game.constants";
import { useAuth } from "../context/use-auth.hook";
import { useKingdom } from "../hooks/use-kingdom.hook";

interface CreateKingdomFormProps {
	onSuccess?: () => void;
	onCancel?: () => void;
}

export const CreateKingdomForm: React.FC<CreateKingdomFormProps> = ({
	onSuccess,
	onCancel,
}) => {
	const { user } = useAuth();
	const { createKingdom, isCreating } = useKingdom();

	const [kdName, setKdName] = useState("");
	const [rulerName, setRulerName] = useState(
		user?.name || user?.email?.split("@")[0] || "",
	);
	const [selectedPlanetCode, setSelectedPlanetCode] =
		useState<PlanetTypeCode>("TF");

	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<boolean>(false);

	const selectedDetail = PLANET_DETAILS[selectedPlanetCode];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (!kdName.trim()) {
			setError("Please provide a name for your Kingdom.");
			return;
		}
		if (!rulerName.trim()) {
			setError("Please provide a Ruler Name.");
			return;
		}

		try {
			await createKingdom({
				kdName: kdName.trim(),
				rulerName: rulerName.trim(),
				planetType: selectedPlanetCode,
			});

			setSuccess(true);
			if (onSuccess) {
				setTimeout(onSuccess, 800);
			}
		} catch (err: unknown) {
			const msg =
				err instanceof Error ? err.message : "Failed to establish kingdom";
			setError(msg);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="card create-kd-form-card">
			<div className="create-kd-header">
				<div className="create-kd-icon-wrap">
					<Crown size={32} color="var(--accent-primary)" />
				</div>
				<div>
					<h2 className="create-kd-title" style={{ margin: "0 0 0.25rem 0" }}>
						Found Your Kingdom
					</h2>
					<p
						className="create-kd-desc"
						style={{ color: "var(--pico-muted-color)", margin: 0 }}
					>
						Stake your sovereign claim, declare your ruler title, and choose
						your homeworld planet type to begin the 8-step Newbie Mode.
					</p>
				</div>
			</div>

			{error && (
				<div
					className="form-feedback error"
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.6rem",
						padding: "0.75rem",
						background: "rgba(239, 68, 68, 0.15)",
						border: "1px solid #ef4444",
						borderRadius: "4px",
						color: "#fca5a5",
						margin: "1rem 0",
					}}
				>
					<AlertCircle size={18} />
					<span>{error}</span>
				</div>
			)}

			{success && (
				<div
					className="form-feedback success"
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.6rem",
						padding: "0.75rem",
						background: "rgba(16, 185, 129, 0.15)",
						border: "1px solid #10b981",
						borderRadius: "4px",
						color: "#6ee7b7",
						margin: "1rem 0",
					}}
				>
					<CheckCircle2 size={18} />
					<span>
						Kingdom successfully established! Initializing stellar sector...
					</span>
				</div>
			)}

			{/* Main Identity Fields */}
			<div
				className="form-grid-2"
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
					gap: "1.25rem",
					marginTop: "1.5rem",
				}}
			>
				<div className="form-group">
					<label
						htmlFor="kdName"
						className="form-label"
						style={{
							display: "block",
							marginBottom: "0.35rem",
							fontWeight: 600,
						}}
					>
						Kingdom / Realm Name{" "}
						<span style={{ color: "var(--sk-combat)" }}>*</span>
					</label>
					<div
						className="input-with-icon"
						style={{
							position: "relative",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Globe2
							size={18}
							style={{
								position: "absolute",
								left: "12px",
								color: "var(--pico-muted-color)",
							}}
						/>
						<input
							id="kdName"
							type="text"
							className="form-input"
							placeholder="e.g. Nova Avalon, Zenith Imperium"
							value={kdName}
							onChange={(e) => setKdName(e.target.value)}
							disabled={isCreating || success}
							required
							style={{ paddingLeft: "2.5rem", margin: 0 }}
						/>
					</div>
				</div>

				<div className="form-group">
					<label
						htmlFor="rulerName"
						className="form-label"
						style={{
							display: "block",
							marginBottom: "0.35rem",
							fontWeight: 600,
						}}
					>
						Ruler Title &amp; Name{" "}
						<span style={{ color: "var(--sk-combat)" }}>*</span>
					</label>
					<div
						className="input-with-icon"
						style={{
							position: "relative",
							display: "flex",
							alignItems: "center",
						}}
					>
						<Crown
							size={18}
							style={{
								position: "absolute",
								left: "12px",
								color: "var(--pico-muted-color)",
							}}
						/>
						<input
							id="rulerName"
							type="text"
							className="form-input"
							placeholder="e.g. Emperor Sean, Sovereign Vael"
							value={rulerName}
							onChange={(e) => setRulerName(e.target.value)}
							disabled={isCreating || success}
							required
							style={{ paddingLeft: "2.5rem", margin: 0 }}
						/>
					</div>
				</div>
			</div>

			{/* Planet Type Selector (Exact 8 Design Doc Planet Types) */}
			<div style={{ marginTop: "1.75rem" }}>
				<div
					style={{
						display: "flex",
						justifyContent: "space-between",
						alignItems: "center",
						marginBottom: "0.75rem",
					}}
				>
					<span
						className="form-label"
						style={{ fontWeight: 600, fontSize: "0.95rem" }}
					>
						Planet Type (Select 1 of 8)
					</span>
					<span
						style={{
							fontSize: "0.8rem",
							color: "var(--pico-muted-color)",
						}}
					>
						Permanent homeworld environment &amp; modifier specifications
					</span>
				</div>

				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
						gap: "0.75rem",
					}}
				>
					{PLANET_CODES.map((code) => {
						const detail = PLANET_DETAILS[code];
						const isSelected = code === selectedPlanetCode;
						return (
							<button
								key={code}
								type="button"
								onClick={() => setSelectedPlanetCode(code)}
								disabled={isCreating || success}
								style={{
									display: "flex",
									flexDirection: "column",
									alignItems: "center",
									padding: "0.85rem 0.5rem",
									borderRadius: "6px",
									background: isSelected ? "rgba(2, 132, 199, 0.2)" : "#0e1524",
									border: isSelected
										? `2px solid ${detail.color}`
										: "1px solid #1e293b",
									boxShadow: isSelected ? `0 0 12px ${detail.color}40` : "none",
									cursor: "pointer",
									textAlign: "center",
									transition: "all 0.15s ease",
									margin: 0,
								}}
							>
								<span style={{ fontSize: "1.8rem", marginBottom: "0.35rem" }}>
									{detail.icon}
								</span>
								<strong
									style={{
										color: isSelected ? "#38bdf8" : "var(--pico-color)",
										fontSize: "0.88rem",
										lineHeight: 1.25,
									}}
								>
									{detail.name}
								</strong>
								<span
									style={{
										fontSize: "0.75rem",
										color: isSelected ? "#7dd3fc" : "var(--pico-muted-color)",
										marginTop: "0.2rem",
										fontWeight: 600,
									}}
								>
									[{code}]
								</span>
							</button>
						);
					})}
				</div>

				{/* Active Planet Type Detailed Preview Card */}
				<div
					style={{
						marginTop: "1rem",
						padding: "1rem 1.25rem",
						background: "#080d1a",
						border: `1px solid ${selectedDetail.color}60`,
						borderRadius: "6px",
						display: "flex",
						flexDirection: "column",
						gap: "0.5rem",
					}}
				>
					<div
						style={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							flexWrap: "wrap",
							gap: "0.5rem",
						}}
					>
						<span
							style={{
								color: selectedDetail.color,
								fontWeight: 700,
								fontSize: "0.95rem",
								display: "flex",
								alignItems: "center",
								gap: "0.4rem",
							}}
						>
							<span>{selectedDetail.icon}</span>
							<span>{selectedDetail.name}</span>
							<span
								style={{
									fontSize: "0.75rem",
									color: "var(--pico-muted-color)",
									fontWeight: 600,
								}}
							>
								[{selectedPlanetCode}]
							</span>
						</span>
						<span
							style={{
								fontSize: "0.75rem",
								padding: "0.15rem 0.5rem",
								borderRadius: "4px",
								background: `${selectedDetail.color}20`,
								color: selectedDetail.color,
								border: `1px solid ${selectedDetail.color}40`,
							}}
						>
							Official Homeworld
						</span>
					</div>

					<div style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
						<div>
							<strong style={{ color: "#38bdf8" }}>Primary Advantage:</strong>{" "}
							<span>{selectedDetail.advantage}</span>
						</div>
						<div>
							<strong style={{ color: "#7dd3fc" }}>Secondary Advantage:</strong>{" "}
							<span>{selectedDetail.secondaryAdvantage}</span>
						</div>
						<div>
							<strong style={{ color: "#fca5a5" }}>Disadvantage:</strong>{" "}
							<span style={{ color: "var(--pico-muted-color)" }}>
								{selectedDetail.disadvantage}
							</span>
						</div>
						<div style={{ marginTop: "0.25rem" }}>
							<strong style={{ color: "#fde047" }}>Starter Assets:</strong>{" "}
							<span style={{ color: "#fef08a" }}>
								{selectedDetail.starterPerks}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Starting Assets Overview */}
			<div
				className="starter-perks-box"
				style={{
					marginTop: "1.75rem",
					padding: "1rem 1.25rem",
					background: "#0b1220",
					border: "1px solid #1e293b",
					borderRadius: "6px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
						marginBottom: "0.75rem",
						fontSize: "0.85rem",
						color: "#7dd3fc",
						fontWeight: 600,
					}}
				>
					<Sparkles size={16} />
					<span>Standard Colonial Grant (Included With All Homeworlds)</span>
				</div>
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
						gap: "0.75rem",
						textAlign: "center",
					}}
				>
					<div
						style={{
							padding: "0.5rem",
							background: "#070b14",
							borderRadius: "4px",
							border: "1px solid #172033",
						}}
					>
						<span
							className="land-text"
							style={{ fontSize: "1.1rem", fontWeight: 700 }}
						>
							250
						</span>
						<div
							style={{ fontSize: "0.72rem", color: "var(--pico-muted-color)" }}
						>
							Acres Land
						</div>
					</div>
					<div
						style={{
							padding: "0.5rem",
							background: "#070b14",
							borderRadius: "4px",
							border: "1px solid #172033",
						}}
					>
						<span
							style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0" }}
						>
							2,250
						</span>
						<div
							style={{ fontSize: "0.72rem", color: "var(--pico-muted-color)" }}
						>
							Civilians
						</div>
					</div>
					<div
						style={{
							padding: "0.5rem",
							background: "#070b14",
							borderRadius: "4px",
							border: "1px solid #172033",
						}}
					>
						<span
							className="gold-text"
							style={{ fontSize: "1.1rem", fontWeight: 700 }}
						>
							$300k
						</span>
						<div
							style={{ fontSize: "0.72rem", color: "var(--pico-muted-color)" }}
						>
							Credits
						</div>
					</div>
					<div
						style={{
							padding: "0.5rem",
							background: "#070b14",
							borderRadius: "4px",
							border: "1px solid #172033",
						}}
					>
						<span
							className="power-text"
							style={{ fontSize: "1.1rem", fontWeight: 700 }}
						>
							10,000
						</span>
						<div
							style={{ fontSize: "0.72rem", color: "var(--pico-muted-color)" }}
						>
							MWh Power
						</div>
					</div>
					<div
						style={{
							padding: "0.5rem",
							background: "#070b14",
							borderRadius: "4px",
							border: "1px solid #172033",
						}}
					>
						<span
							className="combat-text"
							style={{ fontSize: "1.1rem", fontWeight: 700 }}
						>
							200
						</span>
						<div
							style={{ fontSize: "0.72rem", color: "var(--pico-muted-color)" }}
						>
							Soldiers
						</div>
					</div>
					<div
						style={{
							padding: "0.5rem",
							background: "#070b14",
							borderRadius: "4px",
							border: "1px solid #172033",
						}}
					>
						<span
							style={{ fontSize: "1.1rem", fontWeight: 700, color: "#c084fc" }}
						>
							300
						</span>
						<div
							style={{ fontSize: "0.72rem", color: "var(--pico-muted-color)" }}
						>
							Scientists
						</div>
					</div>
				</div>
			</div>

			{/* Submission Actions */}
			<div
				style={{
					display: "flex",
					gap: "1rem",
					marginTop: "2rem",
					justifyContent: "flex-end",
				}}
			>
				{onCancel && (
					<button
						type="button"
						className="secondary"
						onClick={onCancel}
						disabled={isCreating || success}
						style={{ margin: 0 }}
					>
						Cancel
					</button>
				)}
				<button
					type="submit"
					disabled={isCreating || success}
					style={{
						margin: 0,
						display: "inline-flex",
						alignItems: "center",
						gap: "0.5rem",
						fontWeight: 600,
						padding: "0.75rem 1.75rem",
					}}
				>
					{isCreating ? (
						<span>Establishing Sovereignty...</span>
					) : (
						<>
							<Crown size={18} />
							<span>Establish Kingdom</span>
							<ArrowRight size={18} />
						</>
					)}
				</button>
			</div>
		</form>
	);
};
