/// <reference path="../../pb_data/types.d.ts" />

// ─── 1. GET GAME STATUS ──────────────────────────────────────────────────────
routerAdd("GET", "/api/game/status", (e) => {
  let statusRecord = null
  try {
    statusRecord = $app.findFirstRecordByFilter("gameStatus", "")
  } catch {
    // ignore
  }

  if (!statusRecord) {
    const col = $app.findCollectionByNameOrId("gameStatus")
    statusRecord = new Record(col, {
      currentTick: 0,
      endTick: 960,
      roundNumber: 1,
      kingdomCount: 0,
      status: "registration",
    })
    $app.save(statusRecord)
  }

  let totalKingdoms = 0
  try {
    const all = $app.findAllRecords("kingdoms")
    totalKingdoms = all.length
  } catch {
    // ignore
  }

  let gameStatus = null
  try {
    gameStatus = statusRecord.getString("status") || null
  } catch {
    // ignore
  }

  return e.json(200, {
    currentTick: statusRecord.getInt("currentTick"),
    endTick: statusRecord.getInt("endTick") || 960,
    roundNumber: statusRecord.getInt("roundNumber") || 1,
    kingdomCount: totalKingdoms,
    status: gameStatus,
  })
})

// ─── 2. SET GAME STATUS ──────────────────────────────────────────────────────
// Admin control for the gameStatus select enum:
// "registration" | "in-progress" | "stopped".
routerAdd("POST", "/api/game/status", (e) => {
  const data = e.requestInfo().body || {}
  const next = data.status

  if (next !== "registration" && next !== "in-progress" && next !== "stopped") {
    return e.json(400, { error: 'Invalid status: must be "registration", "in-progress", or "stopped"' })
  }

  let statusRecord = null
  try {
    statusRecord = $app.findFirstRecordByFilter("gameStatus", "")
  } catch {
    // ignore — lazy-create below
  }

  if (!statusRecord) {
    const col = $app.findCollectionByNameOrId("gameStatus")
    statusRecord = new Record(col, {
      currentTick: 0,
      endTick: 960,
      roundNumber: 1,
      kingdomCount: 0,
      status: next,
    })
  } else {
    statusRecord.set("status", next)
  }
  $app.save(statusRecord)

  return e.json(200, { success: true, status: statusRecord.getString("status") })
})

// Note: POST /api/game/advance-tick is handled by native Go engine in cmd/server/main.go

// ─── 3. RESTART GAME ─────────────────────────────────────────────────────────
routerAdd("POST", "/api/game/restart", (e) => {
  let statusRecord = null
  try {
    statusRecord = $app.findFirstRecordByFilter("gameStatus", "")
  } catch {
    // ignore
  }

  if (statusRecord) {
    statusRecord.set("currentTick", 0)
    statusRecord.set("roundNumber", (statusRecord.getInt("roundNumber") || 1) + 1)
    statusRecord.set("kingdomCount", 0)
    statusRecord.set("status", "registration")
    $app.save(statusRecord)
  }

  // Clear existing kingdoms
  let deletedKingdoms = 0
  try {
    const kingdoms = $app.findAllRecords("kingdoms")
    $app.runInTransaction((txApp) => {
      for (let i = 0; i < kingdoms.length; i++) {
        txApp.delete(kingdoms[i])
        deletedKingdoms++
      }
    })
  } catch (err) {
    console.log("Error clearing kingdoms:", err)
  }

  // Clear existing spy reports from previous round
  try {
    const spyReports = $app.findAllRecords("spyReports")
    $app.runInTransaction((txApp) => {
      for (let i = 0; i < spyReports.length; i++) {
        txApp.delete(spyReports[i])
      }
    })
  } catch (err) {
    console.log("Error clearing spy reports:", err)
  }

  return e.json(200, { success: true, deletedKingdoms })
})

// ─── 4. POPULATE KINGDOMS ───────────────────────────────────────────────────
routerAdd("POST", "/api/game/populate", (e) => {
  const kingdomsCollection = $app.findCollectionByNameOrId("kingdoms")
  const PLANET_TYPES = ["Mountainous", "Forest and Wilderness", "Herbal Jungle", "Terra Form", "Mystical Lands", "Volcanic Inferno"]
  const RACE_TYPES = ["Ancients", "Terran", "Xivornai", "Gistrami", "Mafielven", "Qanut", "Shadow"]

  let count = 1000
  try {
    const data = e.requestInfo().body
    if (data && typeof data.count === "number" && data.count > 0) {
      count = data.count
    }
  } catch {
    // ignore
  }

  $app.runInTransaction((txApp) => {
    for (let i = 0; i < count; i++) {
      const p = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)]
      const r = RACE_TYPES[Math.floor(Math.random() * RACE_TYPES.length)]
      const name = "Colony " + (Math.floor(Math.random() * 900000) + 10000)

      const rec = new Record(kingdomsCollection, {
        kdName: name,
        rulerName: "Governor " + (i + 1),
        planetType: p,
        raceType: r,
        population: 2250,
        popChange: 0,
        land: 250,
        money: 300000,
        power: 10000,
        probes: 0,
        moneyIncome: 6500,
        powerIncome: 4000,
        nw: 25000,
        tier: 10,
        radius: Math.floor(Math.random() * 360),
        sector: 0,
        autoExplore: 10,
        autoBuild: true,
        landQueue: [],
        military: { sol: 200, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 300, queue: {} },
        buildings: { res: 80, plants: 40, rax: 10, sm: 30, pf: 10, tc: 0, asb: 0, ach: 0, rubble: 0, queue: {} },
        researchPts: 0,
        research: {},
        researchAutoAssign: [],
        state: "active",
        newbiemode: 96,
        botSettings: { defenseRatio: 0.5, growthFocus: "balanced" }
      })
      txApp.save(rec)
    }
  })

  try {
    let totalKingdoms = $app.countRecords("kingdoms")
    const statusRecord = $app.findFirstRecordByFilter("gameStatus", "")
    if (statusRecord) {
      statusRecord.set("kingdomCount", totalKingdoms)
      $app.save(statusRecord)
    }
  } catch {
    // ignore
  }

  return e.json(200, { success: true, added: count })
})

// ─── 5. CREATE BOT KINGDOMS ─────────────────────────────────────────────────
routerAdd("POST", "/api/game/create-bots", (e) => {
  const kingdomsCollection = $app.findCollectionByNameOrId("kingdoms")

  const PLANET_TYPES = [
    "Mountainous",
    "Forest and Wilderness",
    "Herbal Jungle",
    "Terra Form",
    "Mystical Lands",
    "Volcanic Inferno",
    "Jagged Tundra",
    "Oceanic",
    "Desert Wasteland",
    "Ice Giant",
    "Shadow Lands",
    "Multiple Terrain",
    "Helium",
    "Eternal Plains"
  ]

  const RACE_TYPES = [
    "Ancients",
    "Terran",
    "Xivornai",
    "Gistrami",
    "Mafielven",
    "Qanut",
    "Shadow"
  ]

  const DEFAULT_RESEARCH_PRIORITY = [
    "mil", "money", "warp", "pop", "power", "r_fusion", "r_long", "r_core",
    "r_ld", "r_lf", "r_armor", "r_dr", "r_ft", "r_f74", "r_tf", "r_ht"
  ]

  const BOT_PROFILES = [
    {
      label: "Aggressive",
      exploration: 2,
      offense: 30,
      defense: 30,
      flex: 32,
      science: 8,
      buildings: { pf: 5, tc: 10 },
      researchPriority: [
        "mil", "money", "warp", "pop", "r_fusion", "r_core", "r_long",
        "r_ld", "r_dr", "r_armor", "r_ft", "r_tf", "r_lf", "r_f74", "r_ht"
      ]
    },
    {
      label: "Extreme Offense",
      exploration: 1,
      offense: 50,
      defense: 0,
      flex: 44,
      science: 6,
      buildings: { pf: 0, tc: 10 },
      researchPriority: [
        "mil", "money", "warp", "pop", "r_fusion", "r_core", "r_long",
        "r_ld", "r_dr", "r_armor", "r_ft", "r_tf", "r_lf", "r_f74", "r_ht"
      ]
    },
    {
      label: "Probe Specialist",
      exploration: 4,
      offense: 0,
      defense: 70,
      flex: 18,
      science: 12,
      buildings: { pf: 25, tc: 3 },
      researchPriority: [
        "mil", "money", "warp", "pop", "r_fusion", "r_core", "r_armor",
        "r_long", "r_ld", "r_dr", "r_ft", "r_tf", "r_lf", "r_f74", "r_ht"
      ]
    },
    {
      label: "Defensive",
      exploration: 3,
      offense: 0,
      defense: 80,
      flex: 12,
      science: 8,
      buildings: { pf: 10, tc: 10 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "Standard Balanced",
      exploration: 6,
      offense: 20,
      defense: 50,
      flex: 12,
      science: 18,
      buildings: { pf: 10, tc: 5 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "Balanced Attacker",
      exploration: 5,
      offense: 30,
      defense: 40,
      flex: 18,
      science: 12,
      buildings: { pf: 10, tc: 10 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "Balanced Scientist",
      exploration: 5,
      offense: 20,
      defense: 40,
      flex: 0,
      science: 40,
      buildings: { pf: 10, tc: 5 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "NW Booster",
      exploration: 1,
      offense: 0,
      defense: 0,
      flex: 100,
      science: 0,
      buildings: { pf: 0, tc: 10 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "Economic Growth",
      exploration: 8,
      offense: 0,
      defense: 75,
      flex: 12,
      science: 13,
      buildings: { pf: 5, tc: 0 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "Growth & Probes",
      exploration: 7,
      offense: 0,
      defense: 80,
      flex: 10,
      science: 10,
      buildings: { pf: 15, tc: 0 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "Growth & Science",
      exploration: 7,
      offense: 0,
      defense: 65,
      flex: 0,
      science: 35,
      buildings: { pf: 5, tc: 0 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    },
    {
      label: "Pure Growth",
      exploration: 10,
      offense: 0,
      defense: 75,
      flex: 0,
      science: 25,
      buildings: { pf: 5, tc: 0 },
      researchPriority: DEFAULT_RESEARCH_PRIORITY
    }
  ]

  const BOT_NAME_PREFIXES = [
    "Alpha", "Beta", "Gamma", "Delta", "Omega", "Sector", "Void",
    "Star", "Nova", "Cosmic", "Orion", "Astra", "Centauri", "Solar", "Vanguard"
  ]
  const BOT_NAME_SUFFIXES = [
    "Prime", "Major", "Minor", "Outpost", "Colony", "Nexus",
    "Station", "Bastion", "Redoubt", "Keep", "Citadel", "Stronghold"
  ]

  let count = 10
  try {
    const body = e.requestInfo().body
    if (body && typeof body.count === "number" && body.count > 0) {
      count = Math.min(body.count, 100)
    }
  } catch {
    // ignore
  }

  const createdIds = []

  $app.runInTransaction((txApp) => {
    for (let i = 0; i < count; i++) {
      const p = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)]
      const r = RACE_TYPES[Math.floor(Math.random() * RACE_TYPES.length)]
      const profile = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)]

      const prefix = BOT_NAME_PREFIXES[Math.floor(Math.random() * BOT_NAME_PREFIXES.length)]
      const suffix = BOT_NAME_SUFFIXES[Math.floor(Math.random() * BOT_NAME_SUFFIXES.length)]
      const name = prefix + " " + suffix + " " + (Math.floor(Math.random() * 900) + 100)
      const ruler = "Governor " + profile.label + " " + (Math.floor(Math.random() * 900) + 100)

      const land = 250
      const population = 2250
      const money = 300000
      const power = 10000
      const probes = 0

      // Calculate initial building and military targets based on profile
      const tcTarget = profile.buildings.tc || 0
      const pfTarget = profile.buildings.pf || 0
      // 200 soldiers need 3 rax (ceil(200*1.05/75)), which is ~2% of 250 land
      const raxTarget = 2
      const asbTarget = 0
      const achTarget = 0
      // Baseline plants target to maintain positive power
      const plantsTarget = 17
      const fixedSum = tcTarget + pfTarget + raxTarget + asbTarget + achTarget + plantsTarget
      const remainingPct = Math.max(0, 100 - fixedSum)
      const resTarget = Math.floor(remainingPct / 2)
      const smTarget = remainingPct - resTarget

      const buildingTarget = {
        res: resTarget,
        plants: plantsTarget,
        rax: raxTarget,
        sm: smTarget,
        pf: pfTarget,
        tc: tcTarget,
        asb: asbTarget,
        ach: achTarget
      }

      const militaryTarget = {
        sol: profile.flex,
        tr: profile.offense,
        dr: profile.defense,
        sci: profile.science
      }

      const buildings = {
        res: 80,
        plants: 40,
        rax: 10,
        sm: 30,
        pf: 10,
        tc: 0,
        asb: 0,
        ach: 0,
        rubble: 0,
        queue: {},
        target: buildingTarget
      }

      const military = {
        sol: 200,
        tr: 0,
        dr: 0,
        ft: 0,
        tf: 0,
        lt: 0,
        ld: 0,
        lf: 0,
        f74: 0,
        t: 0,
        ht: 0,
        sci: 300,
        queue: {},
        target: militaryTarget
      }

      const moneyIncome = Math.round(buildings.sm * 140 + population * 2)
      const powerConsumption = population * 0.25 + military.sol * 0.7 + military.sci * 0.7
      const powerIncome = Math.round(buildings.plants * 100 - powerConsumption)
      const militaryNw = military.sol * 3 + military.sci * 8
      const totalBuildings = 80 + 40 + 10 + 30 + 10
      const nw = Math.floor(militaryNw + (land * 25) + (totalBuildings * 25) + (population * 1) + Math.floor(money / 500))

      const botSettings = {
        label: profile.label,
        exploration: profile.exploration,
        offense: profile.offense,
        defense: profile.defense,
        flex: profile.flex,
        science: profile.science,
        buildings: {
          pf: profile.buildings.pf,
          tc: profile.buildings.tc
        },
        researchPriority: profile.researchPriority
      }

      const rec = new Record(kingdomsCollection, {
        kdName: name,
        rulerName: ruler,
        planetType: p,
        raceType: r,
        population: population,
        popChange: 0,
        land: land,
        money: money,
        power: power,
        probes: probes,
        moneyIncome: moneyIncome,
        powerIncome: powerIncome,
        nw: nw,
        tier: 10,
        radius: Math.floor(Math.random() * 360),
        sector: 0,
        autoExplore: 10,
        autoBuild: true,
        landQueue: [],
        military: military,
        buildings: buildings,
        researchPts: 0,
        research: {},
        researchAutoAssign: profile.researchPriority,
        state: "active",
        newbiemode: 96,
        botOwnerKd: "freelancer",
        botSettings: botSettings
      })

      txApp.save(rec)
      createdIds.push(rec.id)
    }
  })

  try {
    let totalKingdoms = $app.countRecords("kingdoms")
    const statusRecord = $app.findFirstRecordByFilter("gameStatus", "")
    if (statusRecord) {
      statusRecord.set("kingdomCount", totalKingdoms)
      $app.save(statusRecord)
    }
  } catch {
    // ignore
  }

  return e.json(200, {
    success: true,
    created: createdIds.length,
    ids: createdIds
  })
})

