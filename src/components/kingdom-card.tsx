import {
	Coins,
	Compass,
	Crown,
	Globe2,
	MapPin,
	Radar,
	Shield,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import type React from "react";
import { useNavigate } from "react-router-dom";
import { getPlanetDetail } from "../constants/game.constants";
import type { TypedKingdom } from "../hooks/use-kingdom.hook";

interface KingdomCardProps {
	kingdom: TypedKingdom;
	onRefresh?: () => void;
}

export const KingdomCard: React.FC<KingdomCardProps> = ({ kingdom }) => {
	const navigate = useNavigate();
	const rawPlanet = kingdom.planet_type || kingdom.planetType || "TF";
	const planetMeta = getPlanetDetail(rawPlanet);

	return (
		<div className="kd-overview-card card">
			{/* Header with Title & Ruler */}
			<div className="kd-header">
				<div className="kd-badge-icon">
					<Crown size={28} color="#eab308" />
				</div>
				<div className="kd-header-info">
					<div className="kd-ruler-title">
						<span>Ruler</span>{" "}
						<strong>{kingdom.rulerName || "Commander"}</strong>
					</div>
					<h2 className="kd-name">{kingdom.name || kingdom.kdName}</h2>
					<div className="kd-meta-tags">
						<span
							className="kd-tag planet-tag"
							style={{
								borderColor: `${planetMeta.color}55`,
								color: planetMeta.color,
							}}
						>
							<Globe2 size={13} />
							<span>{planetMeta.name}</span>
						</span>
					</div>
				</div>
				<div className="kd-nw-badge">
					<span className="kd-nw-label">Net Worth</span>
					<span className="kd-nw-val">
						{kingdom.networth?.toLocaleString() ??
							kingdom.nw?.toLocaleString() ??
							0}
					</span>
				</div>
			</div>

			{/* Flavor Descriptions */}
			<div className="kd-flavor-row">
				<p className="kd-flavor-text">
					<strong>Perks:</strong> {planetMeta.advantage} &bull;{" "}
					<strong>Tradeoff:</strong> {planetMeta.disadvantage}
				</p>
			</div>

			{/* Core Resources Metric Grid */}
			<div className="kd-metrics-grid">
				<div className="kd-metric-box">
					<div
						className="kd-metric-icon"
						style={{ background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8" }}
					>
						<MapPin size={18} />
					</div>
					<div className="kd-metric-content">
						<span className="kd-metric-label">Land Area</span>
						<span className="kd-metric-value">
							{kingdom.land?.toLocaleString()} <small>acres</small>
						</span>
					</div>
				</div>

				<div className="kd-metric-box">
					<div
						className="kd-metric-icon"
						style={{ background: "rgba(168, 85, 247, 0.12)", color: "#c084fc" }}
					>
						<Users size={18} />
					</div>
					<div className="kd-metric-content">
						<span className="kd-metric-label">Population</span>
						<span className="kd-metric-value">
							{kingdom.population?.toLocaleString()}
						</span>
					</div>
				</div>

				<div className="kd-metric-box">
					<div
						className="kd-metric-icon"
						style={{ background: "rgba(234, 179, 8, 0.12)", color: "#facc15" }}
					>
						<Coins size={18} />
					</div>
					<div className="kd-metric-content">
						<span className="kd-metric-label">Treasury</span>
						<span className="kd-metric-value">
							${kingdom.money?.toLocaleString()}
						</span>
						<span className="kd-metric-sub positive">
							+{kingdom.moneyIncome?.toLocaleString()}/tick
						</span>
					</div>
				</div>

				<div className="kd-metric-box">
					<div
						className="kd-metric-icon"
						style={{ background: "rgba(16, 185, 129, 0.12)", color: "#34d399" }}
					>
						<Zap size={18} />
					</div>
					<div className="kd-metric-content">
						<span className="kd-metric-label">Power Reserves</span>
						<span className="kd-metric-value">
							{kingdom.power?.toLocaleString()} <small>MWh</small>
						</span>
						<span
							className={`kd-metric-sub ${(kingdom.powerIncome ?? 0) >= 0 ? "positive" : "negative"}`}
						>
							{(kingdom.powerIncome ?? 0) >= 0
								? `+${kingdom.powerIncome ?? 0}`
								: kingdom.powerIncome}
							/tick
						</span>
					</div>
				</div>

				<div className="kd-metric-box">
					<div
						className="kd-metric-icon"
						style={{ background: "rgba(244, 63, 94, 0.12)", color: "#fb7185" }}
					>
						<Radar size={18} />
					</div>
					<div className="kd-metric-content">
						<span className="kd-metric-label">Probes</span>
						<span className="kd-metric-value">
							{kingdom.probes?.toLocaleString() ?? 0}
						</span>
					</div>
				</div>

				<div className="kd-metric-box">
					<div
						className="kd-metric-icon"
						style={{ background: "rgba(99, 102, 241, 0.12)", color: "#818cf8" }}
					>
						<TrendingUp size={18} />
					</div>
					<div className="kd-metric-content">
						<span className="kd-metric-label">Auto-Explore</span>
						<span className="kd-metric-value">
							{kingdom.autoExplore ?? 10} <small>acres</small>
						</span>
					</div>
				</div>
			</div>

			{/* Quick Action Navigation Bar */}
			<div className="kd-actions-bar">
				<button
					type="button"
					className="btn btn-primary"
					onClick={() => navigate("/kingdom/status")}
				>
					<Crown size={16} />
					<span>Realm Command</span>
				</button>

				<button
					type="button"
					className="btn btn-secondary"
					onClick={() => navigate("/kingdom/military")}
				>
					<Shield size={16} />
					<span>Military</span>
				</button>

				<button
					type="button"
					className="btn btn-secondary"
					onClick={() => navigate("/kingdom/explore")}
				>
					<Compass size={16} />
					<span>Explore</span>
				</button>
			</div>
		</div>
	);
};
