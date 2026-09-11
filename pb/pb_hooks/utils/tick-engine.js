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

function parseJsonField(val, fallback) {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "object") {
    if (!Array.isArray(val)) return val;
    if (val.length === 0 || typeof val[0] !== "number") return val;
    try {
      let decoded = "";
      const chunkSize = 8192;
      for (let i = 0; i < val.length; i += chunkSize) {
        decoded += String.fromCharCode.apply(null, val.slice(i, i + chunkSize));
      }
      let parsed = JSON.parse(decoded);
      while (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "number") {
        let d = "";
        for (let i = 0; i < parsed.length; i += chunkSize) {
          d += String.fromCharCode.apply(null, parsed.slice(i, i + chunkSize));
        }
        parsed = JSON.parse(d);
      }
      return parsed || fallback;
    } catch {
      return val;
    }
  }
  if (typeof val === "string") {
    try {
      let parsed = JSON.parse(val);
      while (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "number") {
        let decoded = "";
        const chunkSize = 8192;
        for (let i = 0; i < parsed.length; i += chunkSize) {
          decoded += String.fromCharCode.apply(null, parsed.slice(i, i + chunkSize));
        }
        parsed = JSON.parse(decoded);
      }
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }
  if (val && typeof val.string === "function") {
    try {
      let parsed = JSON.parse(val.string());
      while (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "number") {
        let decoded = "";
        const chunkSize = 8192;
        for (let i = 0; i < parsed.length; i += chunkSize) {
          decoded += String.fromCharCode.apply(null, parsed.slice(i, i + chunkSize));
        }
        parsed = JSON.parse(decoded);
      }
      return parsed || fallback;
    } catch {
      return fallback;
    }
  }
  return val || fallback;
}

function processKingdomTick(kingdom, currentTick) {
  let land = kingdom.land || 250;
  let rawLandQueue = parseJsonField(kingdom.landQueue, []);
  let landQueue = Array.isArray(rawLandQueue) ? [...rawLandQueue] : [];

  let rawBuildings = parseJsonField(kingdom.buildings, null);
  let buildings = rawBuildings && typeof rawBuildings === "object" && !Array.isArray(rawBuildings)
    ? { ...rawBuildings, queue: { ...(rawBuildings.queue || {}) } }
    : { res: 80, plants: 40, rax: 10, sm: 30, pf: 10, tc: 0, asb: 0, ach: 0, rubble: 0, queue: {} };

  let rawMilitary = parseJsonField(kingdom.military, null);
  let military = rawMilitary && typeof rawMilitary === "object" && !Array.isArray(rawMilitary)
    ? { ...rawMilitary, queue: { ...(rawMilitary.queue || {}) } }
    : { sol: 200, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 300, queue: {} };

  let rawResearch = parseJsonField(kingdom.research, {});
  let research = rawResearch && typeof rawResearch === "object" && !Array.isArray(rawResearch)
    ? { ...rawResearch }
    : {};

  let researchPts = kingdom.researchPts || 0;
  let rawAutoAssign = parseJsonField(kingdom.researchAutoAssign, []);
  let researchAutoAssign = Array.isArray(rawAutoAssign) ? [...rawAutoAssign] : [];
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

  // Phase 6: Auto Money Spend (Every 8 ticks or tick 1)
  if ((currentTick % 8 === 0 || currentTick === 1) && kingdom.autoBuild) {
    const autoResult = handleAutoGrowth(
      {
        land,
        money,
        landQueue,
        population,
        research,
        autoBuild: kingdom.autoBuild,
        autoExplore: kingdom.autoExplore,
        botSettings: kingdom.botSettings,
      },
      buildings,
      military
    );
    money = autoResult.money;
    buildings.queue = autoResult.buildingQueue;
    if (autoResult.buildingsTarget) {
      buildings.target = autoResult.buildingsTarget;
    }
    landQueue = autoResult.landQueue;
    military.queue = autoResult.militaryQueue;
    military.sol = autoResult.militarySol;
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

function calculateExplorationQueue(currentQueue, requestedLand, ticks) {
  if (!ticks) ticks = 24;
  const safeQueue = Array.isArray(currentQueue) ? [...currentQueue] : [];
  while (safeQueue.length < ticks) {
    safeQueue.push(0);
  }
  if (requestedLand <= 0) return safeQueue;
  const perTick = Math.floor(requestedLand / ticks);
  let remainder = requestedLand % ticks;
  for (let i = 0; i < ticks; i++) {
    safeQueue[i] += perTick;
  }
  let backIndex = ticks - 1;
  while (remainder > 0 && backIndex >= 0) {
    safeQueue[backIndex] += 1;
    remainder--;
    backIndex--;
  }
  return safeQueue;
}

function calculateFreeLand(land, buildings, queue) {
  const buildingKeys = ["res", "plants", "rax", "sm", "pf", "tc", "asb", "ach", "rubble"];
  let buildingSum = 0;
  for (let i = 0; i < buildingKeys.length; i++) {
    buildingSum += (buildings[buildingKeys[i]] || 0);
  }
  let queueSum = 0;
  if (queue) {
    for (let i = 0; i < buildingKeys.length; i++) {
      const q = queue[buildingKeys[i]];
      if (Array.isArray(q)) {
        for (let j = 0; j < q.length; j++) {
          queueSum += (q[j] || 0);
        }
      }
    }
  }
  return Math.max(0, land - buildingSum - queueSum);
}

function calculateNewQueue(currentQueue, requestedBuildings, ticks) {
  if (!ticks) ticks = 16;
  const buildingKeys = ["res", "plants", "rax", "sm", "pf", "tc", "asb", "ach"];
  const newQueue = {};
  for (let i = 0; i < buildingKeys.length; i++) {
    const k = buildingKeys[i];
    newQueue[k] = (currentQueue && Array.isArray(currentQueue[k])) ? [...currentQueue[k]] : [];
    while (newQueue[k].length < ticks) {
      newQueue[k].push(0);
    }
    const amount = requestedBuildings[k] || 0;
    if (amount <= 0) continue;
    const perTick = Math.floor(amount / ticks);
    let remainder = amount % ticks;
    for (let t = 0; t < ticks; t++) {
      newQueue[k][t] += perTick;
    }
    let backIndex = ticks - 1;
    while (remainder > 0 && backIndex >= 0) {
      newQueue[k][backIndex] += 1;
      remainder--;
      backIndex--;
    }
  }
  return newQueue;
}

function calculateMilitaryQueue(currentQueue, requestedUnits, ticks) {
  if (!ticks) ticks = 24;
  const milKeys = ["sol", "tr", "dr", "ft", "tf", "lt", "ld", "lf", "f74", "t", "ht", "sci"];
  const newQueue = {};
  for (let i = 0; i < milKeys.length; i++) {
    const k = milKeys[i];
    newQueue[k] = (currentQueue && Array.isArray(currentQueue[k])) ? [...currentQueue[k]] : [];
    while (newQueue[k].length < ticks) {
      newQueue[k].push(0);
    }
    const amount = requestedUnits[k] || 0;
    if (amount <= 0) continue;
    const perTick = Math.floor(amount / ticks);
    let remainder = amount % ticks;
    for (let t = 0; t < ticks; t++) {
      newQueue[k][t] += perTick;
    }
    let backIndex = ticks - 1;
    while (remainder > 0 && backIndex >= 0) {
      newQueue[k][backIndex] += 1;
      remainder--;
      backIndex--;
    }
  }
  return newQueue;
}

function handleAutoGrowth(kingdom, buildings, military) {
  let money = kingdom.money || 0;
  let buildingQueue = {};
  if (buildings.queue) {
    const bqKeys = Object.keys(buildings.queue);
    for (let i = 0; i < bqKeys.length; i++) {
      const k = bqKeys[i];
      buildingQueue[k] = Array.isArray(buildings.queue[k]) ? [...buildings.queue[k]] : [];
    }
  }
  let landQueue = Array.isArray(kingdom.landQueue) ? [...kingdom.landQueue] : [];
  let militaryQueue = {};
  if (military && military.queue) {
    const mqKeys = Object.keys(military.queue);
    for (let i = 0; i < mqKeys.length; i++) {
      const k = mqKeys[i];
      militaryQueue[k] = Array.isArray(military.queue[k]) ? [...military.queue[k]] : [];
    }
  }
  let militarySol = (military && military.sol) || 0;
  let autoExplore = kingdom.autoExplore || 0;
  let buildingsTarget = buildings.target || { res: 32, plants: 16, rax: 4, sm: 12, pf: 4, tc: 0, asb: 0, ach: 0 };

  // 1. Auto Explore
  if (autoExplore > 0) {
    const limitPct = autoExplore * 0.01;
    let currentQueueSum = 0;
    for (let i = 0; i < landQueue.length; i++) currentQueueSum += landQueue[i];
    const maxExplorePossible = Math.floor(kingdom.land * limitPct) - currentQueueSum;

    if (maxExplorePossible > 0) {
      const baseCost = Math.sqrt(kingdom.land) * 111;
      const levelMultipliers = [0.165, 0.33, 0.5, 0.67, 0.835, 1, 1.25, 1.5, 1.75, 2];
      const levelMultiplier = levelMultipliers[Math.min(levelMultipliers.length - 1, Math.max(0, autoExplore - 1))] || 1;
      let landMultiplier = 1;
      if (kingdom.land < 1000) landMultiplier = 0.25;
      else if (kingdom.land < 2500) landMultiplier = 0.5;
      else if (kingdom.land < 5000) landMultiplier = 0.75;

      const costPerLand = Math.round(baseCost * levelMultiplier * landMultiplier);
      if (costPerLand > 0) {
        const exploreNum = Math.floor(Math.min(maxExplorePossible, money / costPerLand));
        const roundedExplore = Math.floor(exploreNum / 24) * 24;
        if (roundedExplore > 0) {
          money -= roundedExplore * costPerLand;
          landQueue = calculateExplorationQueue(landQueue, roundedExplore, 24);
        }
      }
    }
  }

  // 2. Auto Build
  if (buildingsTarget) {
    const buildKeys = ["rax", "asb", "plants", "pf", "tc", "res", "sm"];
    const freeLand = calculateFreeLand(kingdom.land, buildings, buildingQueue);
    const buildingCost = Math.round(Math.sqrt(kingdom.land) * 63);

    if (buildingCost > 0) {
      const maxToBuild = Math.min(freeLand, Math.floor(money / buildingCost));
      if (maxToBuild > 0) {
        const deficiencies = {};
        let totalDeficiency = 0;

        for (let i = 0; i < buildKeys.length; i++) {
          const key = buildKeys[i];
          const target = buildingsTarget[key] || 0;
          let inQ = 0;
          if (buildingQueue[key]) {
            for (let j = 0; j < buildingQueue[key].length; j++) inQ += buildingQueue[key][j];
          }
          const current = (buildings[key] || 0) + inQ;
          const deficiency = Math.max(0, Math.floor((kingdom.land * target) / 100) - current);
          deficiencies[key] = deficiency;
          totalDeficiency += deficiency;
        }

        if (totalDeficiency > 0) {
          let remainingChunks = Math.floor(maxToBuild / 16);
          if (remainingChunks > 0) {
            const constructionGroup = { res: 0, plants: 0, rax: 0, sm: 0, pf: 0, tc: 0, asb: 0, ach: 0 };
            while (remainingChunks > 0) {
              let bestKey = null;
              let maxNeeded = -Infinity;
              for (let i = 0; i < buildKeys.length; i++) {
                const key = buildKeys[i];
                const stillNeeded = (deficiencies[key] || 0) - (constructionGroup[key] || 0);
                if (stillNeeded > maxNeeded) {
                  maxNeeded = stillNeeded;
                  bestKey = key;
                }
              }
              if (!bestKey || maxNeeded <= 0) break;
              constructionGroup[bestKey] += 16;
              remainingChunks--;
            }

            let actualBuilt = 0;
            for (let i = 0; i < buildKeys.length; i++) actualBuilt += constructionGroup[buildKeys[i]];
            if (actualBuilt > 0) {
              money -= actualBuilt * buildingCost;
              buildingQueue = calculateNewQueue(buildingQueue, constructionGroup, 16);
            }
          }
        }
      }
    }
  }

  // 3. Military Growth
  if (military && military.target) {
    const trainingLimit = Math.floor(kingdom.population * 0.1);
    let currentSolInQueue = 0;
    if (militaryQueue.sol) {
      for (let i = 0; i < militaryQueue.sol.length; i++) currentSolInQueue += militaryQueue.sol[i];
    }
    const availableTrainingCapacity = Math.max(0, trainingLimit - currentSolInQueue);
    const botLimit = Math.max(4000, kingdom.land * 4);
    const currentSolTotal = militarySol + currentSolInQueue;
    const neededToBotLimit = Math.max(0, botLimit - currentSolTotal);
    const solToBuy = Math.min(availableTrainingCapacity, neededToBotLimit);

    if (solToBuy > 0) {
      const solCost = 150;
      const maxByMoney = Math.floor(money / solCost);
      let actualSol = Math.min(solToBuy, maxByMoney);
      actualSol = Math.floor(actualSol / 16) * 16;
      if (actualSol > 0) {
        money -= actualSol * solCost;
        const solObj = { sol: actualSol, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 0 };
        militaryQueue = calculateMilitaryQueue(militaryQueue, solObj, 16);
      }
    }

    const tcCount = buildings.tc || 0;
    const tcDiscount = kingdom.land > 0 ? Math.min(30, Math.floor((tcCount / kingdom.land) * 300)) : 0;
    const getUnitCost = function(unit) {
      const def = MILITARY_UNITS[unit];
      if (!def) return 1000;
      if (unit === "sol" || unit === "sci") return def.cost;
      return Math.floor((def.cost * (100 - tcDiscount)) / 100);
    };

    const targetKeys = Object.keys(military.target).filter(function(k) {
      return k !== "sol" && (military.target[k] || 0) > 0;
    });

    const initialBudget = money;
    const initialSol = militarySol;
    const requestedProduction = { sol: 0, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 0 };
    let hasProd = false;

    for (let i = 0; i < targetKeys.length; i++) {
      const key = targetKeys[i];
      // While newbie mode lasts, buy military units only when there are 24 or fewer newbiemode ticks left.
      // Don't buy military earlier, except soldiers (sol) and scientists (sci).
      if ((kingdom.newbiemode || 0) > 24 && key !== "sci") continue;
      const ratio = (military.target[key] || 0) / 100;
      const targetBudget = initialBudget * ratio;
      const availableBudget = Math.min(money, targetBudget);
      const targetSolBudget = Math.floor(initialSol * ratio);
      const availableSol = Math.max(0, Math.min(militarySol, targetSolBudget));

      if (availableBudget <= 0) continue;

      const cost = getUnitCost(key);
      const def = MILITARY_UNITS[key];
      const solReq = def ? (def.sol || 0) : 0;
      let maxUnits = Math.floor(availableBudget / cost);

      if (solReq > 0) {
        maxUnits = Math.min(maxUnits, Math.floor(availableSol / solReq));
      }

      if (def && def.buildingRequired === "asb") {
        const asbTotal = (buildings.asb || 0) * 60;
        let asbUsed = 0;
        const allKeys = Object.keys(MILITARY_UNITS);
        for (let j = 0; j < allKeys.length; j++) {
          const k2 = allKeys[j];
          if (MILITARY_UNITS[k2].buildingRequired === "asb") {
            const owned = military[k2] || 0;
            const req = requestedProduction[k2] || 0;
            let inQ = 0;
            if (militaryQueue[k2]) {
              for (let qIdx = 0; qIdx < militaryQueue[k2].length; qIdx++) inQ += militaryQueue[k2][qIdx];
            }
            asbUsed += (owned + inQ + req) * (MILITARY_UNITS[k2].housing || 1);
          }
        }
        const asbLeft = Math.max(0, asbTotal - asbUsed);
        maxUnits = Math.min(maxUnits, Math.floor(asbLeft / (def.housing || 1)));
      }

      if (def && def.researchRequired) {
        const rData = kingdom.research ? kingdom.research[def.researchRequired] : null;
        if (!rData || (rData.perc || 0) < 100) maxUnits = 0;
      }

      const count = Math.floor(maxUnits / 24) * 24;
      if (count > 0) {
        money -= count * cost;
        militarySol -= count * solReq;
        requestedProduction[key] = count;
        hasProd = true;
      }
    }

    if (hasProd) {
      militaryQueue = calculateMilitaryQueue(militaryQueue, requestedProduction, 24);
    }
  }

  return {
    money,
    buildingQueue,
    landQueue,
    militaryQueue,
    militarySol,
    autoExplore,
    buildingsTarget,
  };
}

module.exports = {
  GAME_PARAMS,
  MILITARY_UNITS,
  RESEARCH_PARAMS,
  RESEARCH_TECH_TREE,
  calculateNetworth,
  calculateExplorationQueue,
  calculateFreeLand,
  calculateNewQueue,
  calculateMilitaryQueue,
  handleAutoGrowth,
  processKingdomTick,
  parseJsonField,
};
