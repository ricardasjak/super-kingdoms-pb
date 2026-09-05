import { GAME_PARAMS } from "../constants/game-params.constants";
import { calculateNw } from "./nw.util";
import type { KingdomBuildings, KingdomMilitary } from "../types/game.types";

export function calculateLevel(land: number): number {
  return Math.floor(Math.sqrt(land) / 10) + 1;
}

export function calculateNetworth(
  land: number,
  buildings: KingdomBuildings | Record<string, number>,
  military: KingdomMilitary | Record<string, number>,
  population: number
): number {
  return calculateNw({
    military: {
      sol: military.sol || 0,
      tr: military.tr || 0,
      dr: military.dr || 0,
      ft: military.ft || 0,
      tf: military.tf || 0,
      lt: military.lt || 0,
      ld: military.ld || 0,
      lf: military.lf || 0,
      f74: military.f74 || 0,
      t: military.t || 0,
      ht: military.ht || 0,
      sci: military.sci || 0,
    },
    buildings: {
      res: buildings.res || 0,
      plants: buildings.plants || 0,
      rax: buildings.rax || 0,
      sm: buildings.sm || 0,
      pf: buildings.pf || 0,
      tc: buildings.tc || 0,
      asb: buildings.asb || 0,
      ach: buildings.ach || 0,
      rubble: buildings.rubble || 0,
    },
    land,
    population,
    money: 0,
    probes: 0,
  });
}

export function calculateMaxDefPotential(military: {
  sol?: number;
  tr?: number;
  dr?: number;
  ft?: number;
  lt?: number;
  ld?: number;
  lf?: number;
  t?: number;
  ht?: number;
}): number {
  return GAME_PARAMS.military.calculateMaxDefPotential(
    military as Record<string, number>
  );
}

export function calculateMaxOffPotential(military: {
  tr?: number;
  dr?: number;
  ft?: number;
  tf?: number;
  lt?: number;
  ld?: number;
  lf?: number;
  f74?: number;
  t?: number;
  ht?: number;
}): number {
  return GAME_PARAMS.military.calculateMaxOffPotential(
    military as Record<string, number>
  );
}

export function calculateMinDefPotential(military: {
  lt?: number;
  ld?: number;
  lf?: number;
  f74?: number;
}): number {
  return GAME_PARAMS.military.calculateMinDefPotential(
    military as Record<string, number>
  );
}
