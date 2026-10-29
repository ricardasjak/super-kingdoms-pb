/// <reference path="../../pb_data/types.d.ts" />

// Helper inside handler scope requirement: load tick-engine when needed

// ─── 1. CREATE KINGDOM ───────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/create", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) {
    return e.json(401, { error: "Authentication required" })
  }

  const data = e.requestInfo().body
  if (!data || typeof data !== "object") {
    return e.json(400, { error: "Invalid request body" })
  }

  const kdName = (data.name || data.kdName || "").trim()
  if (!kdName) {
    return e.json(400, { error: "Kingdom name is required" })
  }

  try {
    const existing = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
    if (existing) {
      return e.json(400, { error: "Kingdom already exists for this user" })
    }
  } catch {
    // Expected when no kingdom exists
  }

  const PLANET_CODE_MAP = {
    "fw": "FW",
    "forest and wilderness": "FW",
    "vi": "VI",
    "volcanic inferno": "VI",
    "oc": "Oc",
    "oceanic": "Oc",
    "mo": "Mo",
    "mountainous": "Mo",
    "mt": "MT",
    "multiple terrain": "MT",
    "tf": "TF",
    "terra form": "TF",
    "dw": "DW",
    "desert wasteland": "DW",
    "ml": "ML",
    "mystical lands": "ML"
  }
  const rawPlanet = (data.planet_type || data.planetType || "TF").trim().toLowerCase()
  const planetType = PLANET_CODE_MAP[rawPlanet] || "TF"

  // Find next available sector and slot
  let sectorRecord = null
  let sectorSlot = 0
  try {
    const sectors = $app.findAllRecords("sectors")
    for (let s = 0; s < sectors.length; s++) {
      const sec = sectors[s]
      const existingKds = $app.findRecordsByFilter("kingdoms", "sector = {:sec}", "-created", 10, 0, { sec: sec.id })
      if (existingKds.length < 10) {
        sectorRecord = sec
        const used = {}
        for (let k = 0; k < existingKds.length; k++) {
          used[existingKds[k].getInt("sector_slot")] = true
        }
        for (let slot = 0; slot < 10; slot++) {
          if (!used[slot]) {
            sectorSlot = slot
            break
          }
        }
        break
      }
    }
  } catch {
    // fallback
  }

  if (!sectorRecord) {
    sectorRecord = $app.findFirstRecordByFilter("sectors", "")
  }

  const land = 250
  const freeLand = 80
  const population = 2250
  const money = 300000
  const power = 10000
  const probes = 0

  const buildings = {
    res: 80,
    plants: 40,
    rax: 10,
    sm: 30,
    pf: 10,
    tc: 0,
    asb: 0
  }

  const military = {
    sol: 200,
    tr: 0,
    dr: 0,
    lt: 0,
    ld: 0,
    ft: 0,
    t: 0,
    tf: 0,
    sci: 300
  }

  const shields = {
    missile: 0,
    military: 0,
    probe: 0
  }

  const research = {
    r_pop: 0,
    r_power: 0,
    r_mil: 0,
    r_money: 0,
    r_warp: 0,
    r_fdc: 0,
    t_fusion: false,
    t_energy_core: false,
    t_dragoons: false,
    t_probe_armor: false,
    t_laser_dragoons: false,
    t_tactical_fighters: false,
    t_heavy_tanks: false
  }

  const autoResearch = {
    pop: 0,
    power: 0,
    mil: 0,
    money: 0,
    warp: 0,
    fdc: 0
  }

  // Planetary Archetype starter advantages
  if (planetType === "FW") {
    military.sol += 500
  } else if (planetType === "DW") {
    research.t_dragoons = true
  } else if (planetType === "VI" || planetType === "ML") {
    research.t_fusion = true
  } else if (planetType === "Mo") {
    research.t_laser_dragoons = true
  } else if (planetType === "Oc") {
    military.lt = 250
  } else if (planetType === "TF") {
    research.r_pop = 1500
    research.r_power = 1500
    research.r_mil = 1500
    research.r_money = 1500
  } else if (planetType === "MT") {
    research.t_dragoons = true
    research.t_laser_dragoons = true
    research.t_tactical_fighters = true
  }

  const militaryNw = military.sol * 3 + military.sci * 8 + (military.lt || 0) * 8
  const nw = Math.floor(militaryNw + (land * 25) + (50 * 25) + (population * 1) + Math.floor(money / 500))

  const kingdomsCollection = $app.findCollectionByNameOrId("kingdoms")
  const playerKd = new Record(kingdomsCollection, {
    user: authRecord.id,
    name: kdName,
    planet_type: planetType,
    sector: sectorRecord.id,
    sector_slot: sectorSlot,
    state: "normal",
    trouble_until_tick: 0,
    ma_protection: 0,
    land: land,
    free_land: freeLand,
    population: population,
    money: money,
    power: power,
    probes: probes,
    probe_credits: 10,
    networth: nw,
    honor: 1500,
    newbie_step: 0,
    is_newbie: true,
    last_daily_reward_tick: 0,
    daily_explored_land: 0,
    daily_drafted_soldiers: 0,
    shields: shields,
    buildings: buildings,
    building_queue: [],
    land_queue: [],
    military: military,
    training_queue: [],
    research: research,
    auto_research_allocation: autoResearch
  })

  $app.save(playerKd)

  const res = playerKd.publicExport()
  res.kdName = playerKd.getString("name")
  res.rulerName = (data.rulerName || "").trim() || playerKd.getString("name")
  res.planetType = planetType
  res.planet_type = planetType
  res.nw = playerKd.getInt("networth")
  res.newbiemode = 192
  return e.json(200, res)
})

// ─── 2. UPDATE RULER NAME ───────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/update-ruler-name", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const data = e.requestInfo().body
  const rulerName = (data && data.rulerName ? data.rulerName : "").trim()
  if (!rulerName) return e.json(400, { error: "Ruler name cannot be empty" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  kingdom.set("rulerName", rulerName)
  $app.save(kingdom)
  return e.json(200, { success: true, rulerName })
})

// ─── 4. BUILD BUILDINGS ─────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/build-buildings", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.buildings || {}

  const land = kingdom.getInt("land")
  let money = kingdom.getInt("money")
  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let buildings = jsonUtils.parseJsonObject(kingdom.get("buildings"), kingdom, "buildings")
  if (!buildings.queue) buildings.queue = {}

  const costPerBuilding = Math.round(Math.sqrt(land) * 63)
  const keys = ["res", "plants", "rax", "sm", "pf", "tc", "asb"]
  let requestSum = 0

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const amt = parseInt(requested[k], 10) || 0
    if (amt < 0) return e.json(400, { error: "Invalid building amount" })
    requestSum += amt
  }

  if (requestSum <= 0) return e.json(400, { error: "No buildings requested" })

  const totalCost = requestSum * costPerBuilding
  if (money < totalCost) return e.json(400, { error: "Insufficient funds" })

  // Calculate free land
  let buildingSum = (buildings.rubble || 0)
  for (let i = 0; i < keys.length; i++) {
    buildingSum += (buildings[keys[i]] || 0)
    const q = buildings.queue[keys[i]] || []
    for (let j = 0; j < q.length; j++) buildingSum += q[j]
  }

  const freeLand = land - buildingSum
  if (requestSum > freeLand) return e.json(400, { error: "Not enough free land" })

  // Queue buildings over 16 ticks
  const ticks = 16
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const amount = parseInt(requested[k], 10) || 0
    if (amount <= 0) continue

    const q = buildings.queue[k] ? [...buildings.queue[k]] : []
    while (q.length < ticks) q.push(0)

    const perTick = Math.floor(amount / ticks)
    let rem = amount % ticks
    for (let t = 0; t < ticks; t++) q[t] += perTick

    let back = ticks - 1
    while (rem > 0 && back >= 0) {
      q[back] += 1
      rem--
      back--
    }
    buildings.queue[k] = q
  }

  money -= totalCost
  kingdom.set("money", money)
  kingdom.set("buildings", buildings)

  const tickEngine = require(`${__hooks}/utils/tick-engine.js`)
  const newNw = tickEngine.calculateNetworth({
    military: jsonUtils.parseJsonObject(kingdom.get("military"), kingdom, "military"),
    buildings: buildings,
    land: land,
    population: kingdom.getInt("population"),
    money: money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("networth", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 5. RAZE BUILDINGS ──────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/raze-buildings", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.buildings || {}

  const land = kingdom.getInt("land")
  let money = kingdom.getInt("money")
  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let buildings = jsonUtils.parseJsonObject(kingdom.get("buildings"), kingdom, "buildings")

  const refundPerBuilding = Math.floor(Math.round(Math.sqrt(land) * 63) / 2)
  const keys = ["res", "plants", "rax", "sm", "pf", "tc", "asb"]
  let razeSum = 0

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const count = parseInt(requested[k], 10) || 0
    if (count < 0) return e.json(400, { error: "Invalid count" })
    if (count > (buildings[k] || 0)) return e.json(400, { error: "Cannot raze more than owned" })
    razeSum += count
  }

  if (razeSum <= 0) return e.json(400, { error: "No buildings selected to raze" })

  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const count = parseInt(requested[k], 10) || 0
    if (count > 0) {
      buildings[k] = (buildings[k] || 0) - count
    }
  }

  buildings.rubble = (buildings.rubble || 0) + razeSum
  money += razeSum * refundPerBuilding

  kingdom.set("money", money)
  kingdom.set("buildings", buildings)

  const tickEngine = require(`${__hooks}/utils/tick-engine.js`)
  const newNw = tickEngine.calculateNetworth({
    military: jsonUtils.parseJsonObject(kingdom.get("military"), kingdom, "military"),
    buildings: buildings,
    land: land,
    population: kingdom.getInt("population"),
    money: money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("networth", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 6. TOGGLE AUTO-BUILD & SAVE TARGETS ────────────────────────────────────
routerAdd("POST", "/api/kingdoms/toggle-auto-build", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  kingdom.set("autoBuild", !!data.autoBuild)
  $app.save(kingdom)
  return e.json(200, { success: true, autoBuild: !!data.autoBuild })
})

routerAdd("POST", "/api/kingdoms/save-auto-build", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let buildings = jsonUtils.parseJsonObject(kingdom.get("buildings"), kingdom, "buildings")

  if (data.target) {
    buildings.target = data.target
    kingdom.set("buildings", buildings)
  }
  if (data.autoBuild !== undefined) {
    kingdom.set("autoBuild", !!data.autoBuild)
  }

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 6b. EXPLORE LAND ────────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/explore", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  if (kingdom.getString("state") === "dead") {
    return e.json(400, { error: "Cannot explore land: kingdom has fallen" })
  }

  const data = e.requestInfo().body || {}
  const amount = parseInt(data.amount, 10)
  if (isNaN(amount) || amount <= 0) {
    return e.json(400, { error: "Invalid exploration amount: must be positive integer" })
  }

  const land = kingdom.getInt("land")

  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let landQueue = jsonUtils.parseJsonArray(kingdom.get("land_queue") || kingdom.get("landQueue"), kingdom, "land_queue")
  const currentQueueSum = landQueue.reduce((a, b) => a + (Number(b) || 0), 0)
  const maxPossibleExplore = Math.floor(land * 0.1)
  const maxExplore = Math.max(0, maxPossibleExplore - currentQueueSum)

  if (amount > maxExplore) {
    return e.json(400, {
      error: `Cannot explore more than 10% of current land combined with the current queue (${maxExplore} max available to request)`
    })
  }

  const costPerLand = Math.round(Math.sqrt(land) * 111)
  const totalCost = costPerLand * amount
  let money = kingdom.getInt("money")

  if (money < totalCost) {
    return e.json(400, { error: `Not enough money for exploration (need $${totalCost.toLocaleString()}, have $${money.toLocaleString()})` })
  }

  const tickEngine = require(`${__hooks}/utils/tick-engine.js`)
  const newQueue = tickEngine.calculateExplorationQueue(landQueue, amount, 24)

  money -= totalCost
  kingdom.set("money", money)
  kingdom.set("land_queue", newQueue)

  const newNw = tickEngine.calculateNetworth({
    military: jsonUtils.parseJsonObject(kingdom.get("military"), kingdom, "military"),
    buildings: jsonUtils.parseJsonObject(kingdom.get("buildings"), kingdom, "buildings"),
    land: land,
    population: kingdom.getInt("population"),
    money: money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("networth", newNw)

  $app.save(kingdom)
  return e.json(200, {
    success: true,
    kingdom,
    explored: amount,
    cost: totalCost,
    landQueue: newQueue
  })
})

routerAdd("POST", "/api/kingdoms/toggle-auto-explore", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const autoExplore = Math.min(10, Math.max(0, parseInt(data.autoExplore, 10) || 0))
  kingdom.set("autoExplore", autoExplore)
  $app.save(kingdom)
  return e.json(200, { success: true, autoExplore })
})

// ─── 7. TRAIN MILITARY ──────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/train-military", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.units || {}

  let money = kingdom.getInt("money")
  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let military = jsonUtils.parseJsonObject(kingdom.get("military"), kingdom, "military")
  if (!military.queue) military.queue = {}

  const tickEngine = require(`${__hooks}/utils/tick-engine.js`)
  const unitDefs = tickEngine.MILITARY_UNITS

  let totalCost = 0
  let totalSoldiersNeeded = 0

  const keys = Object.keys(unitDefs)
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const count = parseInt(requested[k], 10) || 0
    if (count < 0) return e.json(400, { error: "Negative units not allowed" })
    if (count === 0) continue

    const def = unitDefs[k]
    totalCost += count * def.cost
    totalSoldiersNeeded += count * def.sol
  }

  if (money < totalCost) return e.json(400, { error: "Insufficient money" })
  if ((military.sol || 0) < totalSoldiersNeeded) return e.json(400, { error: "Insufficient unassigned soldiers" })

  // Enqueue over 24 ticks (or 16 for soldiers)
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const amount = parseInt(requested[k], 10) || 0
    if (amount <= 0) continue

    const duration = k === "sol" ? 16 : 24
    const q = military.queue[k] ? [...military.queue[k]] : []
    while (q.length < duration) q.push(0)

    const perTick = Math.floor(amount / duration)
    let rem = amount % duration
    for (let t = 0; t < duration; t++) q[t] += perTick

    let back = duration - 1
    while (rem > 0 && back >= 0) {
      q[back] += 1
      rem--
      back--
    }
    military.queue[k] = q
  }

  money -= totalCost
  military.sol = (military.sol || 0) - totalSoldiersNeeded

  kingdom.set("money", money)
  kingdom.set("military", military)

  const newNw = tickEngine.calculateNetworth({
    military,
    buildings: jsonUtils.parseJsonObject(kingdom.get("buildings"), kingdom, "buildings"),
    land: kingdom.getInt("land"),
    population: kingdom.getInt("population"),
    money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("networth", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 8. DISBAND MILITARY ────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/disband-military", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.units || {}

  let money = kingdom.getInt("money")
  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let military = jsonUtils.parseJsonObject(kingdom.get("military"), kingdom, "military")

  const tickEngine = require(`${__hooks}/utils/tick-engine.js`)
  const unitDefs = tickEngine.MILITARY_UNITS

  let refundAmount = 0
  let returnedSoldiers = 0

  const keys = Object.keys(unitDefs)
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i]
    const count = parseInt(requested[k], 10) || 0
    if (count <= 0) continue

    if (count > (military[k] || 0)) return e.json(400, { error: "Cannot disband more than owned" })

    const def = unitDefs[k]
    refundAmount += count * Math.floor(def.cost / 2)
    returnedSoldiers += count * def.sol
    military[k] = (military[k] || 0) - count
  }

  money += refundAmount
  military.sol = (military.sol || 0) + returnedSoldiers

  kingdom.set("money", money)
  kingdom.set("military", military)

  const newNw = tickEngine.calculateNetworth({
    military,
    buildings: jsonUtils.parseJsonObject(kingdom.get("buildings"), kingdom, "buildings"),
    land: kingdom.getInt("land"),
    population: kingdom.getInt("population"),
    money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("networth", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 9. SAVE MILITARY TARGETS ───────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/save-military-targets", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let military = jsonUtils.parseJsonObject(kingdom.get("military"), kingdom, "military")

  if (data.target) {
    military.target = data.target
    kingdom.set("military", military)
    $app.save(kingdom)
  }

  return e.json(200, { success: true })
})

// ─── 10. BUY SCIENTISTS ─────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/buy-scientists", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const count = parseInt(data.count, 10) || 0
  if (count <= 0) return e.json(400, { error: "Invalid count" })

  const cost = count * 1000
  let money = kingdom.getInt("money")
  if (money < cost) return e.json(400, { error: "Insufficient funds" })

  const jsonUtils = require(`${__hooks}/utils/json.js`)
  let military = jsonUtils.parseJsonObject(kingdom.get("military"), kingdom, "military")

  military.sci = (military.sci || 0) + count
  money -= cost

  kingdom.set("money", money)
  kingdom.set("military", military)
  $app.save(kingdom)

  return e.json(200, { success: true, kingdom })
})

// ─── 11. SAVE RESEARCH AUTO-ASSIGN ──────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/save-research-auto-assign", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  kingdom.set("researchAutoAssign", Array.isArray(data.priority) ? data.priority : [])
  $app.save(kingdom)

  return e.json(200, { success: true })
})

// ─── 12. RESET KINGDOM ──────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/reset", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  $app.delete(kingdom)
  return e.json(200, { success: true })
})

// ─── 13. DELETE KINGDOM ─────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/delete", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const kdId = kingdom.id

  // Delete owned bots
  try {
    const bots = $app.findRecordsByFilter("kingdoms", "botOwnerKd = {:owner}", "-created", 100, 0, { owner: kdId })
    for (let i = 0; i < bots.length; i++) {
      $app.delete(bots[i])
    }
  } catch {
    // ignore
  }

  $app.delete(kingdom)
  return e.json(200, { success: true })
})

// ─── 14b. RESTART NEWBIE MODE ───────────────────────────────────────────────
// Available only once the kingdom's newbie-mode budget is exhausted
// (newbiemode < 8). Resets the kingdom to its creation-default stats and
// restores the budget to 96, so the realm can self-tick through a fresh
// newbie cycle.
routerAdd("POST", "/api/kingdoms/restart-newbie-mode", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "user = {:user}", { user: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  let phase = "registration"
  try {
    const statusRecord = $app.findFirstRecordByFilter("gameStatus", "")
    if (statusRecord) {
      const s = statusRecord.getString("status")
      if (s) phase = s
    }
  } catch {
    // ignore — default phase stays registration
  }
  if (phase !== "registration") {
    return e.json(400, { error: 'Newbie mode can only be restarted while the game phase is registration (current: "' + phase + '")' })
  }

  if (kingdom.getInt("newbiemode") >= 8) {
    return e.json(400, { error: "Newbie mode is not yet exhausted: restart is available only below 8 newbie ticks" })
  }

  // Creation-default stats (mirrors POST /api/kingdoms/create)
  const land = 250
  const population = 2250
  const money = 300000
  const power = 10000

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
    queue: { res: [], plants: [], rax: [], sm: [], pf: [], tc: [], asb: [], ach: [] },
    target: { res: 32, plants: 16, rax: 4, sm: 12, pf: 4, tc: 0, asb: 0, ach: 0 }
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
    queue: { sol: [], tr: [], dr: [], ft: [], tf: [], lt: [], ld: [], lf: [], f74: [], t: [], ht: [], sci: [] },
    target: { sol: 0, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 0 }
  }

  const moneyIncome = Math.round(buildings.sm * 140 + population * 2)
  const powerConsumption = population * 0.25 + military.sol * 0.7 + military.sci * 0.7
  const powerIncome = Math.round(buildings.plants * 100 - powerConsumption)

  const tickEngine = require(`${__hooks}/utils/tick-engine.js`)
  const nw = tickEngine.calculateNetworth({ military: military, buildings: buildings, land: land, population: population, money: money, probes: 0 })

  kingdom.set("land", land)
  kingdom.set("population", population)
  kingdom.set("popChange", 0)
  kingdom.set("money", money)
  kingdom.set("moneyIncome", moneyIncome)
  kingdom.set("power", power)
  kingdom.set("powerIncome", powerIncome)
  kingdom.set("probes", 0)
  kingdom.set("nw", nw)
  kingdom.set("landQueue", [])
  kingdom.set("buildings", buildings)
  kingdom.set("military", military)
  kingdom.set("researchPts", 0)
  kingdom.set("research", {})
  kingdom.set("researchAutoAssign", [])
  kingdom.set("state", "active")
  kingdom.set("newbiemode", 96)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 14. TARGETS LIST (Public info) ─────────────────────────────────────────
routerAdd("GET", "/api/kingdoms/targets", (e) => {
  const page = parseInt(e.requestInfo().query.page, 10) || 1
  const perPage = parseInt(e.requestInfo().query.perPage, 10) || 50
  const offset = (page - 1) * perPage

  const records = $app.findRecordsByFilter("kingdoms", "", "-land", perPage, offset)

  const sanitized = records.map((r) => ({
    id: r.id,
    kdName: r.getString("name"),
    rulerName: r.getString("ruler_name"),
    planetType: r.getString("planet_type"),
    land: r.getInt("land"),
    nw: r.getInt("networth"),
    state: r.getString("state")
  }))

  return e.json(200, {
    page,
    perPage,
    items: sanitized,
  })
})
