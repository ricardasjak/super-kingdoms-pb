import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useKingdom } from "../hooks/use-kingdom.hook";
import { useKingdomMessage } from "../context/kingdom-message.context";
import { MaxButton } from "../components/max-button";
import { Tooltip } from "../components/tooltip";
import { GAME_PARAMS } from "../constants/game-params.constants";
import type { BuildingType } from "../types/game.types";
import { calculateFreeLand } from "../utils/building.util";

const BUILDINGS_DESC = GAME_PARAMS.buildingsTypes;
const BUILDING_KEYS = Object.keys(BUILDINGS_DESC) as BuildingType[];

function QueueTooltip({
  count,
  queueArray,
  isRazeMode,
}: {
  count: number;
  queueArray?: number[];
  isRazeMode?: boolean;
}) {
  if (isRazeMode || count <= 0 || !queueArray) return <span>-</span>;
  const queueString = queueArray.filter((x) => x > 0).join(" ");

  return (
    <Tooltip isButton content={`Construction queue: ${queueString || "0"}`}>
      <span style={{ color: "var(--accent-primary)" }}>+{count}</span>
    </Tooltip>
  );
}

export const KingdomGrowthPage: React.FC = () => {
  const {
    kingdom,
    buildBuildings,
    razeBuildings,
    saveAutoBuildSettings,
    toggleAutoBuild,
  } = useKingdom();
  const { showMessage } = useKingdomMessage();

  const buildings = kingdom?.buildings;

  const INITIAL_BUILD_QUEUE = Object.fromEntries(
    BUILDING_KEYS.map((k) => [k, ""])
  ) as Record<BuildingType, string>;

  const [buildQueue, setBuildQueue] = useState<Record<BuildingType, string>>(INITIAL_BUILD_QUEUE);
  const [targetQueue, setTargetQueue] = useState<Record<BuildingType, string>>(INITIAL_BUILD_QUEUE);
  const [targetInitialized, setTargetInitialized] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isRazeMode, setIsRazeMode] = useState(false);

  useEffect(() => {
    if (buildings && !targetInitialized && kingdom?.land) {
      const target = buildings.target;
      if (target) {
        setTargetQueue(
          Object.fromEntries(
            BUILDING_KEYS.map((k) => [k, (target[k] || 0).toString()])
          ) as Record<BuildingType, string>
        );
      } else {
        const total = BUILDING_KEYS.reduce((sum, k) => sum + (buildings[k] || 0), 0);
        if (total > 0) {
          setTargetQueue(
            Object.fromEntries(
              BUILDING_KEYS.map((k) => [
                k,
                Math.round(((buildings[k] || 0) / kingdom.land) * 100).toString(),
              ])
            ) as Record<BuildingType, string>
          );
        }
      }
      setTargetInitialized(true);
    }
  }, [buildings, targetInitialized, kingdom?.land]);

  if (!kingdom || !buildings) return null;

  const isBuildingUnlocked = (buildingKey: BuildingType) => {
    const building = GAME_PARAMS.buildingsTypes[buildingKey];
    if (!building?.researchRequired) return true;

    const researchData = kingdom.research?.[building.researchRequired];
    return (researchData?.perc ?? 0) >= 100;
  };

  const freeLand = calculateFreeLand(
    kingdom.land,
    buildings,
    buildings.queue
  );

  const queuedCounts = Object.fromEntries(
    BUILDING_KEYS.map((k) => [
      k,
      (buildings.queue?.[k] || []).reduce((sum, val) => sum + val, 0),
    ])
  ) as Record<BuildingType, number>;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setBuildQueue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTargetQueue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const buildingCost = GAME_PARAMS.buildings.cost(kingdom.land);
  const maxAffordable = Math.floor(kingdom.money / buildingCost);
  const maxBuildings = Math.max(0, Math.min(freeLand, maxAffordable));
  const maxBuildingsRounded = Math.floor(maxBuildings / 16) * 16;

  const handleMaxClick = (key: BuildingType) => {
    const count = buildings[key] || 0;
    const targetMax = isRazeMode ? count : maxBuildingsRounded;
    if (targetMax <= 0) return;

    setBuildQueue({
      ...INITIAL_BUILD_QUEUE,
      [key]: targetMax.toString(),
    });
  };

  const requestSum = BUILDING_KEYS.reduce(
    (sum, k) => sum + (parseInt(buildQueue[k], 10) || 0),
    0
  );

  const totalCost = requestSum * buildingCost;
  const refundAmount = requestSum * Math.floor(buildingCost / 2);

  const targetSum = BUILDING_KEYS.reduce(
    (sum, k) => sum + (parseFloat(targetQueue[k]) || 0),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestSum <= 0) return;

    setIsBuilding(true);
    try {
      if (isRazeMode) {
        await razeBuildings(buildQueue);
        showMessage(`Successfully razed ${requestSum} buildings!`, "success");
      } else {
        await buildBuildings(buildQueue);
        showMessage(`Queued ${requestSum} buildings for construction!`, "success");
      }
      setBuildQueue(INITIAL_BUILD_QUEUE);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Building action failed";
      showMessage(msg, "error");
    } finally {
      setIsBuilding(false);
    }
  };

  const actualPercent = (val: number) => {
    if (kingdom.land <= 0) return "0.0%";
    return `${((val / kingdom.land) * 100).toFixed(1)}%`;
  };

  return (
    <div className="growth-page" style={{ marginTop: "1rem" }}>
      <div className="section-header-row" style={{ marginBottom: "1rem" }}>
        <div>
          <h1 className="page-heading">Planetary Infrastructure</h1>
          <p className="page-subheading">
            Construct, zone, or demolish planetary infrastructure across {kingdom.land.toLocaleString()} acres.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ overflowX: "auto" }}>
            <table className="dense-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem" }}>Building Type</th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>% Land</th>
                  <th style={{ textAlign: "right", padding: "0.5rem" }}>Owned</th>
                  <th style={{ textAlign: "center", padding: "0.5rem" }}>Queued</th>
                  {kingdom.autoBuild && !isRazeMode && (
                    <th style={{ textAlign: "center", padding: "0.5rem" }}>Target %</th>
                  )}
                  <th style={{ textAlign: "center", padding: "0.5rem" }}>Max</th>
                  <th style={{ textAlign: "center", padding: "0.5rem" }}>
                    {isRazeMode ? "Demolish" : "Construct"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {BUILDING_KEYS.map((key) => {
                  const unlocked = isBuildingUnlocked(key);
                  if (!unlocked) return null;

                  const count = buildings[key] || 0;
                  const label = BUILDINGS_DESC[key].label;

                  return (
                    <tr
                      key={key}
                      style={{
                        borderBottom: "1px solid var(--border-subtle)",
                        opacity: isRazeMode && count <= 0 ? 0.45 : 1,
                      }}
                    >
                      <td style={{ padding: "0.5rem" }}>
                        <strong>{label}</strong>
                      </td>
                      <td style={{ textAlign: "right", padding: "0.5rem", color: "var(--text-secondary)" }}>
                        {actualPercent(count)}
                      </td>
                      <td style={{ textAlign: "right", padding: "0.5rem" }}>
                        {count.toLocaleString()}
                      </td>
                      <td style={{ textAlign: "center", padding: "0.5rem" }}>
                        <QueueTooltip
                          isRazeMode={isRazeMode}
                          count={queuedCounts[key]}
                          queueArray={buildings.queue?.[key]}
                        />
                      </td>
                      {kingdom.autoBuild && !isRazeMode && (
                        <td style={{ textAlign: "center", padding: "0.5rem" }}>
                          <input
                            type="number"
                            name={key}
                            value={targetQueue[key]}
                            onChange={handleTargetChange}
                            min="0"
                            max="100"
                            step="0.1"
                            style={{
                              width: "70px",
                              padding: "0.2rem 0.4rem",
                              background: "var(--bg-input)",
                              border: "1px solid var(--border-subtle)",
                              borderRadius: "4px",
                              color: "var(--text-primary)",
                              textAlign: "center",
                            }}
                          />
                        </td>
                      )}
                      <td style={{ textAlign: "center", padding: "0.5rem" }}>
                        <MaxButton
                          onClick={() => handleMaxClick(key)}
                          disabled={isRazeMode ? count <= 0 : maxBuildingsRounded <= 0}
                          label={
                            isRazeMode ? count : maxBuildingsRounded.toLocaleString()
                          }
                        />
                      </td>
                      <td style={{ textAlign: "center", padding: "0.5rem" }}>
                        <input
                          type="number"
                          name={key}
                          value={buildQueue[key]}
                          onChange={handleInputChange}
                          min="0"
                          max={isRazeMode ? count : undefined}
                          disabled={isBuilding}
                          placeholder="0"
                          style={{
                            width: "90px",
                            padding: "0.25rem 0.5rem",
                            background: "var(--bg-input)",
                            border: "1px solid var(--border-subtle)",
                            borderRadius: "4px",
                            color: "var(--text-primary)",
                            textAlign: "center",
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}

                {/* Rubble row */}
                {(buildings.rubble || 0) > 0 && (
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}>
                    <td style={{ padding: "0.5rem" }}>Rubble / Ruins</td>
                    <td style={{ textAlign: "right", padding: "0.5rem" }}>{actualPercent(buildings.rubble)}</td>
                    <td style={{ textAlign: "right", padding: "0.5rem" }}>{buildings.rubble.toLocaleString()}</td>
                    <td style={{ textAlign: "center", padding: "0.5rem" }}>-</td>
                    {kingdom.autoBuild && !isRazeMode && <td>-</td>}
                    <td>-</td>
                    <td>-</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <footer
            style={{
              marginTop: "1.25rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--border-subtle)",
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                <strong>Unzoned Free Land:</strong>{" "}
                <span style={{ color: freeLand > 0 ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                  {freeLand.toLocaleString()} acres
                </span>
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                <strong>Units Requested:</strong> {requestSum.toLocaleString()}
              </p>
            </div>

            <div>
              <p style={{ margin: 0, fontSize: "0.9rem" }}>
                <strong>Capacity to Build:</strong> {maxBuildings.toLocaleString()}
              </p>
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                <strong>Total {isRazeMode ? "Refund" : "Cost"}:</strong>{" "}
                <span style={{ fontWeight: 600, color: isRazeMode ? "var(--accent-emerald)" : "var(--accent-amber)" }}>
                  ${(isRazeMode ? refundAmount : totalCost).toLocaleString()}
                </span>{" "}
                <small style={{ color: "var(--text-muted)" }}>
                  (${Math.floor(buildingCost / (isRazeMode ? 2 : 1)).toLocaleString()} per building)
                </small>
              </p>
            </div>

            <div>
              <button
                type="submit"
                disabled={
                  isBuilding ||
                  (isRazeMode
                    ? requestSum <= 0
                    : requestSum > freeLand || requestSum <= 0 || kingdom.money < totalCost)
                }
                className={isRazeMode ? "btn btn-danger" : "btn btn-primary"}
              >
                {isBuilding
                  ? isRazeMode
                    ? "Demolishing..."
                    : "Constructing..."
                  : isRazeMode
                  ? "Demolish Buildings"
                  : "Construct Buildings"}
              </button>
            </div>
          </footer>
        </form>
      </div>

      {/* Auto Build Card */}
      <div className="card" style={{ padding: "1.25rem", marginBottom: "1.5rem" }}>
        <h3 style={{ marginBottom: "0.75rem" }}>Automated Infrastructure (Auto-Build)</h3>

        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={kingdom.autoBuild ?? false}
            onChange={async (e) => {
              const isChecked = e.target.checked;
              try {
                await toggleAutoBuild(isChecked);
                showMessage(isChecked ? "Auto-Build enabled!" : "Auto-Build disabled!", isChecked ? "success" : "warning");
              } catch (err: unknown) {
                showMessage(err instanceof Error ? err.message : "Toggle failed", "error");
              }
            }}
          />
          <span>Enable Sovereign Auto-Build</span>
        </label>

        {kingdom.autoBuild && (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              Target Sum:{" "}
              <strong style={{ color: targetSum > 100 ? "var(--accent-rose)" : "var(--accent-emerald)" }}>
                {targetSum.toFixed(1)}%
              </strong>{" "}
              <span>(Target percentages must sum to &le; 100%)</span>
            </p>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap", marginTop: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={async () => {
                  try {
                    await saveAutoBuildSettings({
                      autoBuild: kingdom.autoBuild ?? false,
                      target: {
                        res: parseFloat(targetQueue.res) || 0,
                        plants: parseFloat(targetQueue.plants) || 0,
                        rax: parseFloat(targetQueue.rax) || 0,
                        sm: parseFloat(targetQueue.sm) || 0,
                        pf: parseFloat(targetQueue.pf) || 0,
                        tc: parseFloat(targetQueue.tc) || 0,
                        asb: parseFloat(targetQueue.asb) || 0,
                        ach: 0,
                      },
                    });
                    showMessage("Target percentages saved successfully!", "success");
                  } catch (err: unknown) {
                    showMessage(err instanceof Error ? err.message : "Failed to save", "error");
                  }
                }}
                disabled={targetSum > 100}
              >
                Save Target Percents
              </button>
              <Link to="/kingdom/settings" className="btn btn-secondary">
                ⚙️ Automation Settings
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Raze Mode Switch */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <label style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
          <input
            type="checkbox"
            checked={isRazeMode}
            onChange={(e) => {
              setIsRazeMode(e.target.checked);
              setBuildQueue(INITIAL_BUILD_QUEUE);
            }}
          />
          <span style={{ color: isRazeMode ? "var(--accent-rose)" : "var(--text-secondary)" }}>
            Demolition / Raze Mode
          </span>
        </label>
      </div>
    </div>
  );
};
