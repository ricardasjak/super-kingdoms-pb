import type React from "react";
import { GAME_PARAMS } from "../../constants/game-params.constants";

export interface ScientistsSummaryProps {
	myKingdom: {
		researchAutoAssign?: string[];
		military?: {
			sci?: number;
		};
		land: number;
	};
}

export const ScientistsSummary: React.FC<ScientistsSummaryProps> = ({
	myKingdom,
}) => {
	const autoAssign = myKingdom.researchAutoAssign || [];
	const sumWeights = autoAssign.reduce((sum, key) => {
		const weight =
			(GAME_PARAMS.research.params as Record<string, { weight: number }>)[key]
				?.weight || 0;
		return sum + weight;
	}, 0);
	const scientists = myKingdom.military?.sci || 0;
	const pointsFor1PercLand =
		(myKingdom.land * 1.01) ** 2 * sumWeights -
		myKingdom.land ** 2 * sumWeights;
	const landCoverage =
		pointsFor1PercLand > 0
			? (scientists / pointsFor1PercLand) * myKingdom.land * 0.01
			: 0;

	return (
		<div style={{ textAlign: "center", padding: "0.5rem 0" }}>
			<h4 style={{ marginBottom: "0.25rem" }}>
				Assigned Scientists:{" "}
				<span style={{ color: "var(--accent-secondary)" }}>
					{scientists.toLocaleString()}
				</span>
			</h4>
			<p
				style={{
					color: "var(--text-secondary)",
					fontSize: "0.85rem",
					margin: 0,
				}}
			>
				{sumWeights > 0 ? (
					<span>
						Research points output covers up to{" "}
						<strong style={{ color: "var(--accent-emerald)" }}>
							{Math.floor(landCoverage).toLocaleString()}
						</strong>{" "}
						acres / tick
					</span>
				) : (
					<span style={{ color: "var(--accent-amber)" }}>
						No research topics currently in auto-priority queue
					</span>
				)}
			</p>
		</div>
	);
};
