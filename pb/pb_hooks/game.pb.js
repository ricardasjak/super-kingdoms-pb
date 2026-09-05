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

  return e.json(200, {
    currentTick: statusRecord.getInt("currentTick"),
    endTick: statusRecord.getInt("endTick") || 960,
    roundNumber: statusRecord.getInt("roundNumber") || 1,
    kingdomCount: totalKingdoms,
  })
})

// ─── 2. ADVANCE TICK ─────────────────────────────────────────────────────────
routerAdd("POST", "/api/game/advance-tick", (e) => {
  const t0 = Date.now()

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
    })
    $app.save(statusRecord)
  }

  const currentTick = statusRecord.getInt("currentTick")
  const endTick = statusRecord.getInt("endTick") || 960

  if (currentTick >= endTick) {
    return e.json(400, { error: "Round has finished. Restart the game to continue." })
  }

  const nextTick = currentTick + 1
  statusRecord.set("currentTick", nextTick)
  $app.save(statusRecord)

  const tickEngine = require(`${__hooks}/utils/tick-engine.js`)
  const logicStart = Date.now()

  // Process ticks for all kingdoms
  const kingdoms = $app.findRecordsByFilter("kingdoms", "state = 'active'", "-created", 500, 0)

  for (let i = 0; i < kingdoms.length; i++) {
    const kd = kingdoms[i]
    let buildings = kd.get("buildings") || {}
    if (typeof buildings === "string") {
      try { buildings = JSON.parse(buildings) } catch { buildings = {} }
    }
    let military = kd.get("military") || {}
    if (typeof military === "string") {
      try { military = JSON.parse(military) } catch { military = {} }
    }
    let research = kd.get("research") || {}
    if (typeof research === "string") {
      try { research = JSON.parse(research) } catch { research = {} }
    }
    let landQueue = kd.get("landQueue") || []
    if (typeof landQueue === "string") {
      try { landQueue = JSON.parse(landQueue) } catch { landQueue = [] }
    }
    let researchAutoAssign = kd.get("researchAutoAssign") || []
    if (typeof researchAutoAssign === "string") {
      try { researchAutoAssign = JSON.parse(researchAutoAssign) } catch { researchAutoAssign = [] }
    }

    const kdData = {
      land: kd.getInt("land"),
      landQueue,
      buildings,
      military,
      research,
      researchPts: kd.getInt("researchPts"),
      researchAutoAssign,
      population: kd.getInt("population"),
      popChange: kd.getInt("popChange"),
      money: kd.getInt("money"),
      moneyIncome: kd.getInt("moneyIncome"),
      power: kd.getInt("power"),
      powerIncome: kd.getInt("powerIncome"),
      probes: kd.getInt("probes"),
      state: kd.getString("state") || "active",
    }

    const updated = tickEngine.processKingdomTick(kdData, nextTick)

    kd.set("land", updated.land)
    kd.set("landQueue", updated.landQueue)
    kd.set("buildings", updated.buildings)
    kd.set("military", updated.military)
    kd.set("research", updated.research)
    kd.set("researchPts", updated.researchPts)
    kd.set("researchAutoAssign", updated.researchAutoAssign)
    kd.set("population", updated.population)
    kd.set("popChange", updated.popChange)
    kd.set("money", updated.money)
    kd.set("moneyIncome", updated.moneyIncome)
    kd.set("power", updated.power)
    kd.set("powerIncome", updated.powerIncome)
    kd.set("probes", updated.probes)
    kd.set("nw", updated.nw)
    kd.set("state", updated.state)

    $app.save(kd)
  }

  const logicEnd = Date.now()
  const totalLogicTimeMs = logicEnd - logicStart
  const executionTimeMs = Date.now() - t0

  return e.json(200, {
    success: true,
    currentTick: nextTick,
    processedCount: kingdoms.length,
    executionTimeMs,
    totalLogicTimeMs,
  })
})

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
        autoExplore: 10,
        autoBuild: true,
        landQueue: [],
        military: { sol: 200, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 300, queue: {} },
        buildings: { res: 80, plants: 40, rax: 10, sm: 30, pf: 10, tc: 0, asb: 0, ach: 0, rubble: 0, queue: {} },
        researchPts: 0,
        research: {},
        researchAutoAssign: [],
        state: "active",
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
