import React, { useState } from "react";
import { useKingdom } from "../hooks/use-kingdom.hook";
import { useKingdomMessage } from "../context/kingdom-message.context";
import { GAME_PARAMS } from "../constants/game-params.constants";
import { calculateFreeLand } from "../utils/building.util";
import {
  Compass,
  MapPin,
  TrendingUp,
  Clock,
  Coins,
  ShieldAlert,
  Zap,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";

export const KingdomExplorePage: React.FC = () => {
  const { kingdom, exploreLand, toggleAutoExplore } = useKingdom();
  const { showMessage } = useKingdomMessage();

  const [requestedLand, setRequestedLand] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSavingAuto, setIsSavingAuto] = useState<boolean>(false);
  const [autoExploreSlider, setAutoExploreSlider] = useState<number>(() => {
    return Number(kingdom?.autoExplore ?? 0);
  });

  if (!kingdom) return null;

  const land = kingdom.land || 0;
  const landQueue: number[] = Array.isArray(kingdom.landQueue) ? kingdom.landQueue : [];
  const totalQueuedLand = landQueue.reduce((acc, count) => acc + (Number(count) || 0), 0);
  const nextTickLand = landQueue[0] || 0;

  // 10% maximum exploration limit including active pipeline
  const maxPossibleExplore = Math.floor(land * GAME_PARAMS.explore.limit);
  const maxExploreCapacity = Math.max(0, maxPossibleExplore - totalQueuedLand);

  // Manual exploration cost
  const costPerLand = Math.round(GAME_PARAMS.explore.cost(land));
  const affordableLand = Math.floor(kingdom.money / (costPerLand || 1));
  const maxAffordableAndAllowed = Math.min(maxExploreCapacity, affordableLand);

  // Parse input
  const amountToExplore = Math.max(0, parseInt(requestedLand, 10) || 0);
  const totalExpeditionCost = amountToExplore * costPerLand;
  const canAfford = kingdom.money >= totalExpeditionCost;
  const isWithinLimit = amountToExplore <= maxExploreCapacity && amountToExplore > 0;
  const isValidDispatch = isWithinLimit && canAfford && !isSubmitting;

  // Building & Land distribution
  const buildings = kingdom.buildings || {
    res: 0, plants: 0, rax: 0, sm: 0, pf: 0, tc: 0, asb: 0, ach: 0, rubble: 0,
    queue: { res: [], plants: [], rax: [], sm: [], pf: [], tc: [], asb: [], ach: [] }
  };
  const freeLand = calculateFreeLand(land, buildings, buildings.queue);
  const developedLand = Math.max(0, land - freeLand - (buildings.rubble || 0));

  // Autonomous Exploration calculations
  const currentExploreLevel = autoExploreSlider;
  const exploreLevelMultiplier =
    currentExploreLevel > 0
      ? GAME_PARAMS.explore.levelMultipliers[Math.min(currentExploreLevel - 1, GAME_PARAMS.explore.levelMultipliers.length - 1)]
      : 1;

  let landMultiplier = 1;
  if (land < 1000) {
    landMultiplier = GAME_PARAMS.explore.landLevelMultipliers[1000] ?? 0.25;
  } else if (land < 2500) {
    landMultiplier = GAME_PARAMS.explore.landLevelMultipliers[2500] ?? 0.5;
  } else if (land < 5000) {
    landMultiplier = GAME_PARAMS.explore.landLevelMultipliers[5000] ?? 0.75;
  }

  const autoExploreCostPerLand = Math.round(costPerLand * exploreLevelMultiplier * landMultiplier);
  const buildingCost = GAME_PARAMS.buildings.cost(land);

  // Projected Expenses to Income calculation (from original game mechanics)
  const exploreRatio = currentExploreLevel * 0.01;
  const projectedHourlyExpense =
    (1.5 * exploreRatio * land * (autoExploreCostPerLand + buildingCost)) / 24;
  const projectedExpensePercent =
    kingdom.moneyIncome > 0 && exploreRatio > 0
      ? Math.min(100, (projectedHourlyExpense / kingdom.moneyIncome) * 100)
      : 0;

  // Handle Manual Exploration Dispatch
  const handleLaunchExpedition = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDispatch) return;

    setIsSubmitting(true);
    try {
      await exploreLand(amountToExplore);
      showMessage(
        `Expedition launched! Dispatched scouts to secure ${amountToExplore} acres across the 24-hour pipeline.`,
        "success"
      );
      setRequestedLand("");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Failed to launch expedition", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Auto-Explore Level Save
  const handleSaveAutoExplore = async (newLevel: number) => {
    setAutoExploreSlider(newLevel);
    setIsSavingAuto(true);
    try {
      await toggleAutoExplore(newLevel);
      showMessage(
        newLevel === 0
          ? "Autonomous exploration protocol deactivated."
          : `Auto-exploration protocol set to ${newLevel}% territory limit.`,
        newLevel === 0 ? "warning" : "success"
      );
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Failed to update auto-explore protocol", "error");
    } finally {
      setIsSavingAuto(false);
    }
  };

  const handleQuickPercent = (pct: number) => {
    const calculated = Math.floor(maxAffordableAndAllowed * pct);
    setRequestedLand(calculated > 0 ? calculated.toString() : "");
  };

  return (
    <div className="container" style={{ padding: "1.5rem 1rem 4rem" }}>
      {/* ─── Page Title & Lore ─── */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.25), rgba(6, 182, 212, 0.25))",
              border: "1px solid rgba(99, 102, 241, 0.3)",
              color: "var(--accent-secondary)",
            }}
          >
            <Compass size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: "1.85rem", fontWeight: 700, margin: 0 }}>Planetary Exploration</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", margin: 0 }}>
              Dispatch scouting parties to survey and colonize virgin planetary acres for {kingdom.kdName}.
            </p>
          </div>
        </div>
      </div>

      {/* ─── Top Telemetry Metric Cards ─── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Total Territory
            </span>
            <MapPin size={18} style={{ color: "var(--accent-primary)" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700 }}>
            {land.toLocaleString()} <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-secondary)" }}>acres</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Yields ~{((land * 25) / 1000).toFixed(1)}k Networth (25 NW/acre)
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Exploration Pipeline
            </span>
            <Clock size={18} style={{ color: "var(--accent-secondary)" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: totalQueuedLand > 0 ? "var(--accent-secondary)" : "var(--text-primary)" }}>
            +{totalQueuedLand.toLocaleString()} <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-secondary)" }}>acres</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            {nextTickLand > 0 ? `+${nextTickLand} arriving next game hour` : "No pending arrivals next tick"}
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Max Explore Capacity
            </span>
            <TrendingUp size={18} style={{ color: "var(--accent-emerald)" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: maxExploreCapacity > 0 ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
            {maxExploreCapacity.toLocaleString()} <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-secondary)" }}>available</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            10% Cap: {maxPossibleExplore.toLocaleString()} acres max in pipeline
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Expedition Cost
            </span>
            <Coins size={18} style={{ color: "var(--accent-amber)" }} />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--accent-amber)" }}>
            ${costPerLand.toLocaleString()} <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "var(--text-secondary)" }}>/ acre</span>
          </div>
          <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            Treasury: ${kingdom.money.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* ─── MANUAL EXPEDITION FORM ─── */}
        <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Compass size={20} style={{ color: "var(--accent-primary)" }} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Dispatch Manual Expedition</h2>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
            Order dedicated explorers to secure new territory. Dispatched acres arrive progressively across a <strong>24-tick</strong> expedition pipeline.
          </p>

          <form onSubmit={handleLaunchExpedition} style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="explore-amount" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  Acreage to Explore
                </label>
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  Max Request: <strong>{maxExploreCapacity.toLocaleString()}</strong> acres
                </span>
              </div>

              <div style={{ position: "relative" }}>
                <input
                  id="explore-amount"
                  type="number"
                  min="1"
                  max={maxExploreCapacity}
                  placeholder={`e.g. ${Math.min(100, maxExploreCapacity)}`}
                  value={requestedLand}
                  onChange={(e) => setRequestedLand(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    color: "var(--text-primary)",
                    fontSize: "1.1rem",
                    outline: "none",
                  }}
                />
              </div>

              {/* Quick Select Buttons */}
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => handleQuickPercent(0.25)}
                  disabled={maxAffordableAndAllowed <= 0}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                >
                  25%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPercent(0.5)}
                  disabled={maxAffordableAndAllowed <= 0}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                >
                  50%
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPercent(0.75)}
                  disabled={maxAffordableAndAllowed <= 0}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem" }}
                >
                  75%
                </button>
                <button
                  type="button"
                  onClick={() => setRequestedLand(maxAffordableAndAllowed.toString())}
                  disabled={maxAffordableAndAllowed <= 0}
                  className="btn btn-secondary"
                  style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", fontWeight: 600 }}
                >
                  Max ({maxAffordableAndAllowed.toLocaleString()})
                </button>
                {requestedLand && (
                  <button
                    type="button"
                    onClick={() => setRequestedLand("")}
                    className="btn btn-secondary"
                    style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", marginLeft: "auto" }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Financial & Pipeline Breakdown */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                fontSize: "0.875rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Base Cost per Acre:</span>
                <span>${costPerLand.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Total Mission Cost:</span>
                <strong style={{ color: canAfford ? "var(--text-primary)" : "var(--accent-rose)" }}>
                  ${totalExpeditionCost.toLocaleString()}
                </strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Pipeline Delivery:</span>
                <span>
                  {amountToExplore > 0
                    ? `~${(amountToExplore / 24).toFixed(1)} acres / tick (24 ticks)`
                    : "24 ticks pipeline"}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Treasury Remaining:</span>
                <span style={{ color: canAfford ? "var(--accent-emerald)" : "var(--accent-rose)" }}>
                  ${Math.max(0, kingdom.money - totalExpeditionCost).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Warnings / Error feedback */}
            {amountToExplore > maxExploreCapacity && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "var(--accent-rose)",
                  fontSize: "0.85rem",
                }}
              >
                <ShieldAlert size={16} />
                <span>Exceeds 10% maximum exploration limit ({maxExploreCapacity} max available).</span>
              </div>
            )}

            {!canAfford && amountToExplore > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(244, 63, 94, 0.12)",
                  border: "1px solid rgba(244, 63, 94, 0.3)",
                  color: "var(--accent-rose)",
                  fontSize: "0.85rem",
                }}
              >
                <AlertCircle size={16} />
                <span>Insufficient treasury funds to launch this expedition.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isValidDispatch}
              className="btn btn-primary btn-lg"
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Compass size={18} />
              <span>{isSubmitting ? "Dispatching Scouts..." : "Launch Expedition"}</span>
            </button>
          </form>
        </div>

        {/* ─── AUTONOMOUS EXPLORATION PROTOCOL (AUTO-EXPLORE) ─── */}
        <div className="card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Zap size={20} style={{ color: "var(--accent-secondary)" }} />
              <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>Autonomous Exploration Protocol</h2>
            </div>
            <span
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-full)",
                fontSize: "0.8rem",
                fontWeight: 600,
                backgroundColor:
                  currentExploreLevel === 0
                    ? "rgba(148, 163, 184, 0.15)"
                    : currentExploreLevel >= 8
                    ? "rgba(244, 63, 94, 0.2)"
                    : currentExploreLevel >= 5
                    ? "rgba(245, 158, 11, 0.2)"
                    : "rgba(16, 185, 129, 0.2)",
                color:
                  currentExploreLevel === 0
                    ? "var(--text-muted)"
                    : currentExploreLevel >= 8
                    ? "var(--accent-rose)"
                    : currentExploreLevel >= 5
                    ? "var(--accent-amber)"
                    : "var(--accent-emerald)",
                border: `1px solid ${
                  currentExploreLevel === 0
                    ? "rgba(148, 163, 184, 0.3)"
                    : currentExploreLevel >= 8
                    ? "rgba(244, 63, 94, 0.4)"
                    : currentExploreLevel >= 5
                    ? "rgba(245, 158, 11, 0.4)"
                    : "rgba(16, 185, 129, 0.4)"
                }`,
              }}
            >
              {currentExploreLevel === 0 ? "Protocol Off" : `${currentExploreLevel}% Target Limit`}
            </span>
          </div>

          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
            When activated, kingdom scouts automatically explore up to your configured territory cap every game tick if adequate treasury funds exist.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", flex: 1 }}>
            {/* Slider Control */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <label htmlFor="auto-explore-slider" style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                  Exploration Rate
                </label>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-primary)" }}>
                  {autoExploreSlider === 0 ? "Disabled (0%)" : `${autoExploreSlider}% of Territory`}
                </span>
              </div>

              <input
                id="auto-explore-slider"
                type="range"
                min="0"
                max="10"
                step="1"
                value={autoExploreSlider}
                onChange={(e) => setAutoExploreSlider(parseInt(e.target.value, 10))}
                style={{
                  width: "100%",
                  height: "8px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  accentColor: "var(--accent-primary)",
                  backgroundColor: "var(--bg-input)",
                }}
              />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>
                <span>0% (Off)</span>
                <span>2%</span>
                <span>4%</span>
                <span>6%</span>
                <span>8%</span>
                <span>10% (Max)</span>
              </div>
            </div>

            {/* Threshold check reminder */}
            {autoExploreSlider > 0 && Math.floor(land * (autoExploreSlider * 0.01)) < 24 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.85rem",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  color: "var(--accent-amber)",
                  fontSize: "0.85rem",
                }}
              >
                <HelpCircle size={16} />
                <span>
                  Notice: Realm territory is under 2,400 acres. Automated exploration dispatches in 24-acre batches when funds allow.
                </span>
              </div>
            )}

            {/* Auto-Exploration Rate Telemetry */}
            <div
              style={{
                backgroundColor: "rgba(15, 23, 42, 0.6)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-sm)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.6rem",
                fontSize: "0.875rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Level Multiplier:</span>
                <span>{(exploreLevelMultiplier).toFixed(3)}x</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Land Tier Scaling:</span>
                <span>
                  {landMultiplier.toFixed(2)}x{" "}
                  <small style={{ color: "var(--text-muted)" }}>
                    ({land < 1000 ? "Frontier" : land < 2500 ? "Developing" : land < 5000 ? "Established" : "Imperial"})
                  </small>
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Auto Cost per Acre:</span>
                <strong>${autoExploreCostPerLand.toLocaleString()}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--text-secondary)" }}>Projected Income Impact:</span>
                <span
                  style={{
                    fontWeight: 700,
                    color:
                      projectedExpensePercent > 80
                        ? "var(--accent-rose)"
                        : projectedExpensePercent > 50
                        ? "var(--accent-amber)"
                        : "var(--accent-emerald)",
                  }}
                >
                  {Math.round(projectedExpensePercent)}% of Income
                </span>
              </div>
            </div>

            <button
              type="button"
              disabled={isSavingAuto || autoExploreSlider === (kingdom.autoExplore ?? 0)}
              onClick={() => handleSaveAutoExplore(autoExploreSlider)}
              className="btn btn-secondary btn-lg"
              style={{
                marginTop: "auto",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle2 size={18} />
              <span>
                {isSavingAuto
                  ? "Updating Protocol..."
                  : autoExploreSlider === (kingdom.autoExplore ?? 0)
                  ? "Protocol Up to Date"
                  : "Save Auto-Explore Protocol"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 24-TICK PIPELINE RADAR & TERRITORY RADAR ─── */}
      <div className="card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 600, margin: 0 }}>
              24-Hour Land Exploration Pipeline Radar
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: "0.25rem 0 0" }}>
              Incoming territory batches arriving each in-game hour. Total pending: <strong>+{totalQueuedLand.toLocaleString()} acres</strong>
            </p>
          </div>
        </div>

        {totalQueuedLand === 0 ? (
          <div
            style={{
              padding: "2.5rem 1rem",
              textAlign: "center",
              borderRadius: "var(--radius-sm)",
              border: "1px dashed var(--border-subtle)",
              backgroundColor: "rgba(15, 23, 42, 0.4)",
            }}
          >
            <Compass size={36} style={{ color: "var(--text-muted)", margin: "0 auto 0.75rem" }} />
            <p style={{ color: "var(--text-secondary)", margin: 0 }}>
              No exploration expeditions currently in transit.
            </p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: "0.25rem 0 0" }}>
              Dispatch manual scouts above or activate the Autonomous Protocol to commence territory expansion.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Timeline Radar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
                gap: "0.6rem",
              }}
            >
              {landQueue.map((count, index) => {
                const tickNum = index + 1;
                const hasArrival = count > 0;
                return (
                  <div
                    key={index}
                    style={{
                      padding: "0.6rem 0.5rem",
                      borderRadius: "8px",
                      textAlign: "center",
                      backgroundColor: hasArrival ? "rgba(99, 102, 241, 0.12)" : "rgba(15, 23, 42, 0.3)",
                      border: `1px solid ${hasArrival ? "rgba(99, 102, 241, 0.35)" : "var(--border-subtle)"}`,
                      transition: "var(--transition-fast)",
                    }}
                  >
                    <div style={{ fontSize: "0.75rem", color: hasArrival ? "var(--accent-secondary)" : "var(--text-muted)" }}>
                      T+{tickNum}h
                    </div>
                    <div
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: hasArrival ? "var(--accent-emerald)" : "var(--text-muted)",
                        marginTop: "0.15rem",
                      }}
                    >
                      {hasArrival ? `+${count}` : "0"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Territory Utilization Bar */}
        <div style={{ marginTop: "1.75rem", borderTop: "1px solid var(--border-subtle)", paddingTop: "1.25rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
            <span style={{ fontWeight: 600 }}>Territory Land Allocation</span>
            <span style={{ color: "var(--text-secondary)" }}>
              {land.toLocaleString()} total acres + {totalQueuedLand.toLocaleString()} pending
            </span>
          </div>

          <div
            style={{
              height: "12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "rgba(15, 23, 42, 0.8)",
              overflow: "hidden",
              display: "flex",
              border: "1px solid var(--border-subtle)",
            }}
          >
            <div
              style={{
                width: `${Math.min(100, (developedLand / (land || 1)) * 100)}%`,
                backgroundColor: "var(--accent-primary)",
              }}
              title={`Developed: ${developedLand} acres`}
            />
            <div
              style={{
                width: `${Math.min(100, (freeLand / (land || 1)) * 100)}%`,
                backgroundColor: "var(--accent-emerald)",
              }}
              title={`Free Land: ${freeLand} acres`}
            />
            {buildings.rubble > 0 && (
              <div
                style={{
                  width: `${Math.min(100, (buildings.rubble / (land || 1)) * 100)}%`,
                  backgroundColor: "var(--accent-rose)",
                }}
                title={`Rubble: ${buildings.rubble} acres`}
              />
            )}
          </div>

          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.75rem", fontSize: "0.8rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--accent-primary)" }} />
              <span>Developed: <strong>{developedLand.toLocaleString()}</strong> ({((developedLand / (land || 1)) * 100).toFixed(1)}%)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--accent-emerald)" }} />
              <span>Free Land: <strong>{freeLand.toLocaleString()}</strong> ({((freeLand / (land || 1)) * 100).toFixed(1)}%)</span>
            </div>
            {buildings.rubble > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <div style={{ width: "10px", height: "10px", borderRadius: "2px", backgroundColor: "var(--accent-rose)" }} />
                <span>Rubble: <strong>{buildings.rubble.toLocaleString()}</strong></span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
