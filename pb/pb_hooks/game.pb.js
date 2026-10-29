/// <reference path="../../pb_data/types.d.ts" />

// ─── 1. GET GAME STATUS ──────────────────────────────────────────────────────
routerAdd("GET", "/api/game/status", (e) => {
  let statusRecord = null
  try {
    statusRecord = $app.findFirstRecordByFilter("game_status", "")
  } catch {
    // ignore
  }

  if (!statusRecord) {
    try {
      const col = $app.findCollectionByNameOrId("game_status")
      statusRecord = new Record(col, {
        current_tick: 0,
        max_ticks: 960,
        round_number: 1,
        phase: "newbie",
        is_paused: false,
      })
      $app.save(statusRecord)
    } catch {
      // ignore
    }
  }

  let totalKingdoms = 0
  try {
    const all = $app.findAllRecords("kingdoms")
    totalKingdoms = all.length
  } catch {
    // ignore
  }

  const currentTick = statusRecord ? statusRecord.getInt("current_tick") : 0
  const maxTicks = statusRecord ? (statusRecord.getInt("max_ticks") || 960) : 960
  const roundNumber = statusRecord ? (statusRecord.getInt("round_number") || 1) : 1
  const phase = statusRecord ? (statusRecord.getString("phase") || "newbie") : "newbie"
  const legacyStatus = phase === "newbie" ? "registration" : (phase === "pvp" ? "in-progress" : "stopped")

  return e.json(200, {
    currentTick: currentTick,
    endTick: maxTicks,
    maxTicks: maxTicks,
    roundNumber: roundNumber,
    kingdomCount: totalKingdoms,
    phase: phase,
    status: legacyStatus,
  })
})

// ─── 2. SET GAME STATUS ──────────────────────────────────────────────────────
routerAdd("POST", "/api/game/status", (e) => {
  const data = e.requestInfo().body || {}
  const next = data.status || data.phase

  const validStatuses = ["registration", "in-progress", "stopped", "newbie", "pvp", "concluded"]
  if (!validStatuses.includes(next)) {
    return e.json(400, { error: 'Invalid status: must be "registration", "in-progress", or "stopped"' })
  }

  let phase = "newbie"
  if (next === "in-progress" || next === "pvp") {
    phase = "pvp"
  } else if (next === "stopped" || next === "concluded") {
    phase = "concluded"
  }

  let statusRecord = null
  try {
    statusRecord = $app.findFirstRecordByFilter("game_status", "")
  } catch {
    // ignore
  }

  if (!statusRecord) {
    const col = $app.findCollectionByNameOrId("game_status")
    statusRecord = new Record(col, {
      current_tick: 0,
      max_ticks: 960,
      round_number: 1,
      phase: phase,
      is_paused: false,
    })
  } else {
    statusRecord.set("phase", phase)
  }
  $app.save(statusRecord)

  return e.json(200, { success: true, status: next, phase: phase })
})

// Note: POST /api/game/advance-tick is handled by native Go engine in cmd/server/main.go

// ─── 3. RESTART GAME ─────────────────────────────────────────────────────────
routerAdd("POST", "/api/game/restart", (e) => {
  let statusRecord = null
  try {
    statusRecord = $app.findFirstRecordByFilter("game_status", "")
  } catch {
    // ignore
  }

  if (statusRecord) {
    statusRecord.set("current_tick", 0)
    statusRecord.set("round_number", (statusRecord.getInt("round_number") || 1) + 1)
    statusRecord.set("phase", "newbie")
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
  const CANONICAL_PLANETS = [
    "FW",
    "VI",
    "Oc",
    "Mo",
    "MT",
    "TF",
    "DW",
    "ML"
  ]

  let count = 10
  try {
    const data = e.requestInfo().body
    if (data && typeof data.count === "number" && data.count > 0) {
      count = Math.min(data.count, 100)
    }
  } catch {
    // ignore
  }

  $app.runInTransaction((txApp) => {
    const usersCol = txApp.findCollectionByNameOrId("users")
    let secId = ""
    try {
      const s = txApp.findFirstRecordByFilter("sectors", "")
      if (s) secId = s.id
    } catch {}

    for (let i = 0; i < count; i++) {
      const p = CANONICAL_PLANETS[i % CANONICAL_PLANETS.length]
      const name = "Colony " + (Math.floor(Math.random() * 900000) + 10000)

      const botUser = new Record(usersCol)
      botUser.setEmail("bot_pop_" + Date.now() + "_" + i + "_" + Math.floor(Math.random() * 100000) + "@example.com")
      botUser.setPassword("BotUser123456!")
      txApp.save(botUser)

      const rec = new Record(kingdomsCollection, {
        user: botUser.id,
        name: name,
        planet_type: p,
        sector: secId,
        sector_slot: i % 10,
        state: "normal",
        trouble_until_tick: 0,
        ma_protection: 0,
        land: 250,
        free_land: 80,
        population: 2250,
        money: 300000,
        power: 10000,
        probes: 0,
        probe_credits: 10,
        networth: 25000,
        honor: 1500,
        newbie_step: 0,
        is_newbie: true,
        last_daily_reward_tick: 0,
        daily_explored_land: 0,
        daily_drafted_soldiers: 0,
        shields: { missile: 0, military: 0, probe: 0 },
        buildings: { res: 80, plants: 40, rax: 10, sm: 30, pf: 10, tc: 0, asb: 0 },
        building_queue: [],
        land_queue: [],
        military: { sol: 200, tr: 0, dr: 0, lt: 0, ld: 0, ft: 0, t: 0, tf: 0, sci: 300 },
        training_queue: [],
        research: {},
        auto_research_allocation: {},
      })
      txApp.save(rec)
    }
  })

  try {
    let totalKingdoms = $app.countRecords("kingdoms")
    const statusRecord = $app.findFirstRecordByFilter("game_status", "")
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

  const CANONICAL_BOT_PLANETS = [
    "FW",
    "VI",
    "Oc",
    "Mo",
    "MT",
    "TF",
    "DW",
    "ML"
  ]

  const BOT_PROFILES = [
    { label: "Aggressive", exploration: 2, offense: 30, defense: 30, flex: 32, science: 8, buildings: { pf: 5, tc: 10 } },
    { label: "Extreme Offense", exploration: 1, offense: 50, defense: 0, flex: 44, science: 6, buildings: { pf: 0, tc: 10 } },
    { label: "Defensive", exploration: 3, offense: 0, defense: 80, flex: 12, science: 8, buildings: { pf: 10, tc: 10 } },
    { label: "Standard Balanced", exploration: 6, offense: 20, defense: 50, flex: 12, science: 18, buildings: { pf: 10, tc: 5 } },
    { label: "Economic Growth", exploration: 8, offense: 0, defense: 75, flex: 12, science: 13, buildings: { pf: 5, tc: 0 } },
    { label: "Pure Growth", exploration: 10, offense: 0, defense: 75, flex: 0, science: 25, buildings: { pf: 5, tc: 0 } }
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
    const usersCol = txApp.findCollectionByNameOrId("users")
    let secId = ""
    try {
      const s = txApp.findFirstRecordByFilter("sectors", "")
      if (s) secId = s.id
    } catch {}

    for (let i = 0; i < count; i++) {
      const p = CANONICAL_BOT_PLANETS[i % CANONICAL_BOT_PLANETS.length]
      const profile = BOT_PROFILES[Math.floor(Math.random() * BOT_PROFILES.length)]
      const name = "Vanguard " + profile.label + " " + (Math.floor(Math.random() * 900) + 100)

      const botUser = new Record(usersCol)
      botUser.setEmail("bot_bot_" + Date.now() + "_" + i + "_" + Math.floor(Math.random() * 100000) + "@example.com")
      botUser.setPassword("BotUser123456!")
      txApp.save(botUser)

      const land = 250
      const population = 2250
      const money = 300000
      const power = 10000

      const rec = new Record(kingdomsCollection, {
        user: botUser.id,
        name: name,
        planet_type: p,
        sector: secId,
        sector_slot: i % 10,
        state: "normal",
        trouble_until_tick: 0,
        ma_protection: 0,
        land: land,
        free_land: 80,
        population: population,
        money: money,
        power: power,
        probes: 0,
        probe_credits: 10,
        networth: 25000,
        honor: 1500,
        newbie_step: 0,
        is_newbie: true,
        last_daily_reward_tick: 0,
        daily_explored_land: 0,
        daily_drafted_soldiers: 0,
        shields: { missile: 0, military: 0, probe: 0 },
        buildings: { res: 80, plants: 40, rax: 10, sm: 30, pf: 10, tc: 0, asb: 0 },
        building_queue: [],
        land_queue: [],
        military: { sol: 200, tr: 0, dr: 0, lt: 0, ld: 0, ft: 0, t: 0, tf: 0, sci: 300 },
        training_queue: [],
        research: {},
        auto_research_allocation: {},
      })

      txApp.save(rec)
      createdIds.push(rec.id)
    }
  })

  return e.json(200, {
    success: true,
    created: createdIds.length,
    ids: createdIds
  })
})

