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
