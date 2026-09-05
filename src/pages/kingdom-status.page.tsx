import React from "react";
import { useKingdom } from "../hooks/use-kingdom.hook";
import {
  calculateLevel,
  calculateMaxDefPotential,
  calculateMaxOffPotential,
  calculateMinDefPotential,
  calculateNetworth,
  SpyReportSOB,
  SpyReportSOK,
  SpyReportSoE,
} from "../components/spy-report-sok";
import { GAME_PARAMS } from "../constants/game-params.constants";

export const KingdomStatusPage: React.FC = () => {
  const { kingdom } = useKingdom();

  if (!kingdom) return null;

  const military = kingdom.military || {
    sol: 0, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 0
  };
  const buildings = kingdom.buildings || {
    res: 0, plants: 0, rax: 0, sm: 0, pf: 0, tc: 0, asb: 0, ach: 0, rubble: 0, queue: {}
  };

  const raxUsage =
    (military.sol || 0) +
    (military.tr || 0) +
    (military.dr || 0) +
    (military.ft || 0) +
    (military.lt || 0) +
    (military.ld || 0) +
    (military.lf || 0) +
    (military.sci || 0) +
    (military.t || 0) * 2 +
    (military.ht || 0) * 2;

  const raxCapacity = (buildings.rax || 0) * GAME_PARAMS.buildings.raxCapacity;

  const level = calculateLevel(kingdom.land);
  const networth = calculateNetworth(
    kingdom.land,
    buildings,
    military,
    kingdom.population
  );

  const maxDef = calculateMaxDefPotential(military);
  const maxOff = calculateMaxOffPotential(military);
  const minDef = calculateMinDefPotential(military);

  return (
    <div className="kingdom-status-page" style={{ marginTop: "1rem" }}>
      <div className="section-header-row" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 className="page-heading">{kingdom.kdName}</h1>
          <p className="page-subheading">
            Sovereign realm ruled by <strong>{kingdom.rulerName}</strong>
          </p>
        </div>
      </div>

      <div className="grid status-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>
        <SpyReportSoE
          kdName={kingdom.kdName}
          moneyIncome={kingdom.moneyIncome || 0}
          powerIncome={kingdom.powerIncome || 0}
          power={kingdom.power}
          probes={kingdom.probes || 0}
          pfCount={buildings.pf || 0}
          population={kingdom.population}
          popChange={kingdom.popChange || 0}
          barracksUsage={raxUsage}
          barracksCap={raxCapacity}
          research={kingdom.research || undefined}
        />

        <SpyReportSOK
          kdName={kingdom.kdName}
          rulerName={kingdom.rulerName}
          planetType={kingdom.planetType}
          raceType={kingdom.raceType}
          level={level}
          land={kingdom.land}
          networth={networth}
          honor={0}
          money={kingdom.money}
          population={kingdom.population}
          power={kingdom.power}
          probes={kingdom.probes || 0}
          scientists={military.sci || 0}
          maProtection={0}
          military={military as Record<string, number>}
          maxDefPotential={maxDef}
          maxOffPotential={maxOff}
          minDefPotential={minDef}
        />
      </div>

      <div style={{ marginTop: "1.5rem" }}>
        <SpyReportSOB
          kdName={kingdom.kdName}
          land={kingdom.land}
          buildings={buildings}
          landQueue={kingdom.landQueue || []}
        />
      </div>
    </div>
  );
};
