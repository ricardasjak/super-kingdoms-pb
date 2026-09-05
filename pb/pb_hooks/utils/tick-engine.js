/// <reference path="../../pb_data/types.d.ts" />

const MILITARY_UNITS = {
  sol: { cost: 150, sol: 0, power: 0.7, housing: 1, off: 1, def: 1 },
  sci: { cost: 1000, sol: 0, power: 0.7, housing: 1, off: 0, def: 0 },
  tr: { cost: 350, sol: 1, power: 0.7, housing: 1, off: 4, def: 0 },
  dr: { cost: 450, sol: 1, power: 0.7, housing: 1, off: 5, def: 0, researchRequired: "r_dr" },
  ft: { cost: 550, sol: 1, power: 0.7, housing: 1, off: 6, def: 0, researchRequired: "r_ft" },
  tf: { cost: 1500, sol: 0, power: 1.4, housing: 2, off: 12, def: 0, buildingRequired: "asb", researchRequired: "r_tf" },
  lt: { cost: 375, sol: 1, power: 0.7, housing: 1, off: 0, def: 4 },
  ld: { cost: 500, sol: 1, power: 0.7, housing: 1, off: 0, def: 5, researchRequired: "r_ld" },
  lf: { cost: 625, sol: 1, power: 0.7, housing: 1, off: 0, def: 6, researchRequired: "r_lf" },
  f74: { cost: 975, sol: 0, power: 1.4, housing: 1, off: 0, def: 8, buildingRequired: "asb", researchRequired: "r_f74" },
  t: { cost: 1750, sol: 1, power: 1.4, housing: 2, off: 9, def: 9 },
  ht: { cost: 2250, sol: 1, power: 1.4, housing: 2, off: 12, def: 12, researchRequired: "r_ht" },
};

const RESEARCH_PARAMS = {
  pop: { weight: 0.00475, bonus: 20 },
  power: { weight: 0.00311, bonus: 50 },
  mil: { weight: 0.00291, bonus: 30 },
  money: { weight: 0.00535, bonus: 25 },
  fdc: { weight: 0.0004, bonus: 25 },
  warp: { weight: 0.00173, bonus: 20, requires: "r_core" },
};

const RESEARCH_TECH_TREE = {
  r_dr: { requirePoints: 30000, requires: "r_long" },
  r_ft: { requirePoints: 80000, requires: "r_dr" },
  r_tf: { requirePoints: 300000, requires: "r_f74" },
  r_f74: { requirePoints: 200000, requires: "r_core" },
  r_ld: { requirePoints: 40000, requires: "r_long" },
  r_lf: { requirePoints: 80000, requires: "r_ld" },
  r_fusion: { requirePoints: 30000, bonus: 50 },
  r_core: { requirePoints: 30000, requires: "r_fusion", bonus: 20 },
  r_armor: { requirePoints: 92000, requires: "r_core" },
  r_long: { requirePoints: 30000, bonus: 5 },
  r_ht: { requirePoints: 200000 },
};

const GAME_PARAMS = {
  roundLength: 960,
  income: { population: 2, sm: 140 },
  population: {
    growth: 0.05,
    decline: function (pop, land) {
      return Math.round(Math.max(100, land > 10000 ? land / 10 : land / 5, pop * 0.05));
    },
  },
  power: {
    consumption: { population: 0.032, scientists: 0.7, soldiers: 0.7 },
  },
  buildings: {
    duration: 16,
    resCapacity: 50,
    raxCapacity: 75,
    asbCapacity: 60,
    plantProduction: 100,
    plantStorage: 1000,
  },
  military: {
    units: MILITARY_UNITS,
  },
  research: {
    params: RESEARCH_PARAMS,
    required: function (topic, land) {
      const weight = RESEARCH_PARAMS[topic] ? RESEARCH_PARAMS[topic].weight : 0.005;
      return Math.round(land * land * weight);
    },
  },
  nw: {
    units: { sol: 3, tr: 6, dr: 8, ft: 10, tf: 18, lt: 6, ld: 8, lf: 10, f74: 12, t: 22, ht: 31, sci: 8 },
    land: 25,
    buildings: 25,
    population: 1,
    money: 500,
    probes: 1000,
  },
};

function calculateNetworth(kd) {
  const m = kd.military || {};
  const b = kd.buildings || {};

  const totalBuildings =
    (b.res || 0) +
    (b.plants || 0) +
    (b.rax || 0) +
    (b.sm || 0) +
    (b.pf || 0) +
    (b.tc || 0) +
    (b.asb || 0) +
    (b.ach || 0);

  const u = GAME_PARAMS.nw.units;
  const milNw =
    (m.sol || 0) * u.sol +
    (m.tr || 0) * u.tr +
    (m.dr || 0) * u.dr +
    (m.ft || 0) * u.ft +
    (m.tf || 0) * u.tf +
    (m.lt || 0) * u.lt +
    (m.ld || 0) * u.ld +
    (m.lf || 0) * u.lf +
    (m.f74 || 0) * u.f74 +
    (m.t || 0) * u.t +
    (m.ht || 0) * u.ht +
    (m.sci || 0) * u.sci;

  const landNw = (kd.land || 0) * GAME_PARAMS.nw.land;
  const bldNw = totalBuildings * GAME_PARAMS.nw.buildings;
  const popNw = (kd.population || 0) * GAME_PARAMS.nw.population;
  const moneyNw = Math.floor((kd.money || 0) / GAME_PARAMS.nw.money);
  const probeNw = Math.floor((kd.probes || 0) / GAME_PARAMS.nw.probes);

  return Math.floor(milNw + landNw + bldNw + popNw + moneyNw + probeNw);
}

function processKingdomTick(kingdom, currentTick) {
  let land = kingdom.land || 250;
  let landQueue = Array.isArray(kingdom.landQueue) ? [...kingdom.landQueue] : [];
  let buildings = kingdom.buildings ? JSON.parse(JSON.stringify(kingdom.buildings)) : { res: 80, plants: 40, rax: 10, sm: 30, pf: 10, tc: 0, asb: 0, ach: 0, rubble: 0, queue: {} };
  let military = kingdom.military ? JSON.parse(JSON.stringify(kingdom.military)) : { sol: 200, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 300, queue: {} };
  let research = kingdom.research ? JSON.parse(JSON.stringify(kingdom.research)) : {};
  let researchPts = kingdom.researchPts || 0;
  let researchAutoAssign = Array.isArray(kingdom.researchAutoAssign) ? [...kingdom.researchAutoAssign] : [];
  let population = kingdom.population || 2250;
  let popChange = kingdom.popChange || 0;
  let money = kingdom.money || 300000;
  let power = kingdom.power || 10000;
  let probes = kingdom.probes || 0;
  let state = kingdom.state || "active";

  if (!buildings.queue) buildings.queue = {};
  if (!military.queue) military.queue = {};

  // Phase 1: Growth
  if (landQueue.length > 0) {
    land += landQueue[0];
    landQueue = landQueue.slice(1);
  }

  const buildKeys = ["res", "plants", "rax", "sm", "pf", "tc", "asb"];
  for (let i = 0; i < buildKeys.length; i++) {
    const k = buildKeys[i];
    if (buildings.queue[k] && buildings.queue[k].length > 0) {
      buildings[k] = (buildings[k] || 0) + buildings.queue[k][0];
      buildings.queue[k] = buildings.queue[k].slice(1);
    }
  }

  // Phase 2: Research
  researchPts += (military.sci || 0);
  if (researchAutoAssign.length > 0 && researchPts > 0) {
    for (let i = 0; i < researchAutoAssign.length; i++) {
      if (researchPts <= 0) break;
      const key = researchAutoAssign[i];
      const existing = research[key] || { pts: 0, perc: 0 };
      const currentPts = existing.pts || 0;

      let required = 0;
      const techInfo = RESEARCH_TECH_TREE[key];
      if (techInfo) {
        if (techInfo.requires) {
          const prereq = research[techInfo.requires];
          if (!prereq || (prereq.perc || 0) < 100) continue;
        }
        required = techInfo.requirePoints;
      } else {
        const prereqKey = RESEARCH_PARAMS[key] ? RESEARCH_PARAMS[key].requires : null;
        if (prereqKey) {
          const prereq = research[prereqKey];
          if (!prereq || (prereq.perc || 0) < 100) continue;
        }
        required = GAME_PARAMS.research.required(key, land);
      }

      const needed = Math.max(0, required - currentPts);
      if (needed > 0) {
        const toAssign = Math.min(researchPts, needed);
        research[key] = { pts: currentPts + toAssign, perc: existing.perc || 0 };
        researchPts -= toAssign;
      }
    }
  }

  const standardKeys = ["pop", "power", "mil", "money", "fdc", "warp"];
  for (let i = 0; i < standardKeys.length; i++) {
    const k = standardKeys[i];
    const resData = research[k] || { pts: 0, perc: 0 };
    const required = GAME_PARAMS.research.required(k, land);
    const maxBonus = RESEARCH_PARAMS[k].bonus;
    research[k] = {
      pts: resData.pts,
      perc: required > 0 ? Math.min(Math.floor((maxBonus * resData.pts) / required), maxBonus) : 0,
    };
  }

  const techKeys = Object.keys(RESEARCH_TECH_TREE);
  for (let i = 0; i < techKeys.length; i++) {
    const k = techKeys[i];
    const resData = research[k] || { pts: 0, perc: 0 };
    const techInfo = RESEARCH_TECH_TREE[k];
    research[k] = {
      pts: resData.pts,
      perc: techInfo.requirePoints > 0 ? Math.min(Math.floor((resData.pts / techInfo.requirePoints) * 100), 100) : 0,
    };
  }

  // Phase 3: Population
  const popBonus = ((research.pop && research.pop.perc) || 0) / 100;
  const longBonus = (research.r_long && research.r_long.perc >= 100) ? 5 : 0;
  let raxUsage = 0;
  const mKeys = Object.keys(MILITARY_UNITS);
  for (let i = 0; i < mKeys.length; i++) {
    const k = mKeys[i];
    const weight = (k === "t" || k === "ht") ? 2 : 1;
    raxUsage += (military[k] || 0) * weight;
  }
  const raxCap = (buildings.rax || 0) * GAME_PARAMS.buildings.raxCapacity;
  const raxSurplus = Math.max(0, raxUsage - raxCap);
  const resCap = (GAME_PARAMS.buildings.resCapacity + longBonus) * (1 + popBonus);
  const maxPop = Math.floor((buildings.res || 0) * resCap - raxSurplus);

  if (population < maxPop) {
    popChange = Math.ceil(population * GAME_PARAMS.population.growth);
    popChange = Math.min(popChange, maxPop - population);
  } else if (population > maxPop) {
    popChange = -GAME_PARAMS.population.decline(population, land);
  } else {
    popChange = 0;
  }

  population = Math.round(Math.max(0, population + popChange));
  if (population <= 0) {
    state = "dead";
  }

  // Phase 4: Economics
  const moneyBonus = ((research.money && research.money.perc) || 0) / 100;
  const powerBonus = ((research.power && research.power.perc) || 0) / 100;
  const fusionBonus = (research.r_fusion && research.r_fusion.perc >= 100) ? 0.5 : 0;
  const coreBonus = (research.r_core && research.r_core.perc >= 100) ? 0.2 : 0;

  const moneyIncome = Math.round(((buildings.sm || 0) * 140 + population * 2) * (1 + moneyBonus));
  let powerCons = population * 0.032;
  for (let i = 0; i < mKeys.length; i++) {
    const k = mKeys[i];
    powerCons += (military[k] || 0) * (MILITARY_UNITS[k].power || 0);
  }

  const powerIncome = Math.round((buildings.plants || 0) * 100 * (1 + powerBonus + fusionBonus + coreBonus) - powerCons);
  money += moneyIncome;
  power = Math.min((buildings.plants || 0) * 1000, Math.max(0, Math.round(power + powerIncome)));
  probes += (buildings.pf || 0);

  // Phase 5: Military Training completion
  const milKeys = ["sol", "tr", "dr", "ft", "tf", "lt", "ld", "lf", "f74", "t", "ht", "sci"];
  for (let i = 0; i < milKeys.length; i++) {
    const k = milKeys[i];
    if (military.queue[k] && military.queue[k].length > 0) {
      military[k] = (military[k] || 0) + military.queue[k][0];
      military.queue[k] = military.queue[k].slice(1);
    }
  }

  // Promotions
  if (research.r_ld && research.r_ld.perc >= 100 && military.lt > 0) {
    const pool = military.lt * 4;
    military.ld = (military.ld || 0) + Math.floor(pool / 5);
    military.sol = (military.sol || 0) + (pool % 5);
    military.lt = 0;
  }
  if (research.r_lf && research.r_lf.perc >= 100 && military.ld > 0) {
    const pool = military.ld * 5;
    military.lf = (military.lf || 0) + Math.floor(pool / 6);
    military.sol = (military.sol || 0) + (pool % 6);
    military.ld = 0;
  }
  if (research.r_dr && research.r_dr.perc >= 100 && military.tr > 0) {
    const pool = military.tr * 4;
    military.dr = (military.dr || 0) + Math.floor(pool / 5);
    military.sol = (military.sol || 0) + (pool % 5);
    military.tr = 0;
  }
  if (research.r_ft && research.r_ft.perc >= 100 && military.dr > 0) {
    const pool = military.dr * 5;
    military.ft = (military.ft || 0) + Math.floor(pool / 6);
    military.sol = (military.sol || 0) + (pool % 6);
    military.dr = 0;
  }
  if (research.r_ht && research.r_ht.perc >= 100 && military.t > 0) {
    const pool = military.t * 9;
    military.ht = (military.ht || 0) + Math.floor(pool / 12);
    military.sol = (military.sol || 0) + (pool % 12);
    military.t = 0;
  }

  const updatedNw = calculateNetworth({
    land,
    buildings,
    military,
    population,
    money,
    probes,
  });

  return {
    land,
    landQueue,
    buildings,
    military,
    research,
    researchPts,
    researchAutoAssign,
    population,
    popChange,
    money,
    moneyIncome,
    power,
    powerIncome,
    probes,
    nw: updatedNw,
    state,
  };
}

module.exports = {
  GAME_PARAMS,
  MILITARY_UNITS,
  RESEARCH_PARAMS,
  RESEARCH_TECH_TREE,
  calculateNetworth,
  processKingdomTick,
};
