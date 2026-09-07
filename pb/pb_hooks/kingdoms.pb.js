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

  const kdName = (data.kdName || "").trim()
  const rulerName = (data.rulerName || "").trim()
  const planetType = (data.planetType || "").trim()
  const raceType = (data.raceType || "").trim()

  if (!kdName || !rulerName || !planetType || !raceType) {
    return e.json(400, { error: "kdName, rulerName, planetType, and raceType are required" })
  }

  try {
    const existing = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
    if (existing) {
      return e.json(400, { error: "Kingdom already exists for this user" })
    }
  } catch {
    // Expected when no kingdom exists
  }

  const PLANET_TYPES = [
    "Mountainous", "Forest and Wilderness", "Herbal Jungle", "Terra Form", "Mystical Lands",
    "Volcanic Inferno", "Jagged Tundra", "Oceanic", "Desert Wasteland", "Ice Giant",
    "Shadow Lands", "Multiple Terrain", "Helium", "Eternal Plains"
  ]

  const RACE_TYPES = [
    "Ancients", "Terran", "Xivornai", "Gistrami", "Mafielven", "Qanut", "Shadow"
  ]

  if (PLANET_TYPES.indexOf(planetType) === -1) {
    return e.json(400, { error: "Invalid planet type: " + planetType })
  }
  if (RACE_TYPES.indexOf(raceType) === -1) {
    return e.json(400, { error: "Invalid race type: " + raceType })
  }

  const land = 250
  const population = 2250
  const popChange = 0
  const money = 300000
  const power = 10000
  const probes = 0
  const researchPts = 0

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

  const totalBuildings = buildings.res + buildings.plants + buildings.rax + buildings.sm + buildings.pf + buildings.tc + buildings.asb + buildings.ach
  const militaryNw = military.sol * 3 + military.sci * 8
  const nw = Math.floor(militaryNw + (land * 25) + (totalBuildings * 25) + (population * 1) + Math.floor(money / 500))

  const botSettings = {
    defenseRatio: 0.5,
    growthFocus: "balanced"
  }

  const kingdomsCollection = $app.findCollectionByNameOrId("kingdoms")
  const playerKd = new Record(kingdomsCollection, {
    userId: authRecord.id,
    kdName: kdName,
    rulerName: rulerName,
    planetType: planetType,
    raceType: raceType,
    population: population,
    popChange: popChange,
    land: land,
    money: money,
    power: power,
    probes: probes,
    moneyIncome: moneyIncome,
    powerIncome: powerIncome,
    nw: nw,
    autoExplore: 10,
    autoBuild: false,
    landQueue: [],
    military: military,
    buildings: buildings,
    researchPts: researchPts,
    research: {},
    researchAutoAssign: [],
    state: "active",
    botSettings: botSettings
  })

  $app.save(playerKd)

  // Subordinate bots
  const BOT_NAME_PREFIXES = ["Alpha", "Beta", "Gamma", "Delta", "Omega", "Sector", "Void", "Star", "Nova", "Cosmic", "Orion", "Astra", "Centauri"]
  const BOT_NAME_SUFFIXES = ["Prime", "Major", "Minor", "Outpost", "Colony", "Nexus", "Station", "Bastion", "Redoubt", "Keep"]
  const botLimit = 5
  const userBotNames = Array.isArray(data.botNames) ? data.botNames : []

  for (let i = 0; i < botLimit; i++) {
    const randomPlanet = PLANET_TYPES[Math.floor(Math.random() * PLANET_TYPES.length)]
    const randomRace = RACE_TYPES[Math.floor(Math.random() * RACE_TYPES.length)]
    const prefix = kdName.split(" ")[0] || BOT_NAME_PREFIXES[Math.floor(Math.random() * BOT_NAME_PREFIXES.length)]
    const suffix = BOT_NAME_SUFFIXES[Math.floor(Math.random() * BOT_NAME_SUFFIXES.length)]
    const botName = (userBotNames[i] && userBotNames[i].trim()) || (prefix + " " + suffix + " " + (Math.floor(Math.random() * 900) + 100))

    const botKd = new Record(kingdomsCollection, {
      kdName: botName,
      rulerName: rulerName,
      planetType: randomPlanet,
      raceType: randomRace,
      population: population,
      popChange: popChange,
      land: land,
      money: money,
      power: power,
      probes: probes,
      moneyIncome: moneyIncome,
      powerIncome: powerIncome,
      nw: nw,
      autoExplore: 10,
      autoBuild: true,
      landQueue: [],
      military: military,
      buildings: buildings,
      researchPts: researchPts,
      research: {},
      researchAutoAssign: [],
      state: "active",
      botOwnerKd: playerKd.id,
      botSettings: botSettings
    })

    $app.save(botKd)
  }

  try {
    const statusRecord = $app.findFirstRecordByFilter("gameStatus", "")
    if (statusRecord) {
      const currentCount = statusRecord.getInt("kingdomCount") || 0
      statusRecord.set("kingdomCount", currentCount + 1 + botLimit)
      $app.save(statusRecord)
    }
  } catch {
    // ignore
  }

  return e.json(200, playerKd)
})

// ─── 2. UPDATE RULER NAME ───────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/update-ruler-name", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const data = e.requestInfo().body
  const rulerName = (data && data.rulerName ? data.rulerName : "").trim()
  if (!rulerName) return e.json(400, { error: "Ruler name cannot be empty" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  kingdom.set("rulerName", rulerName)
  $app.save(kingdom)
  return e.json(200, { success: true, rulerName })
})

// ─── 3. UPDATE BOT PROFILE ──────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/update-bot-profile", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const data = e.requestInfo().body || {}
  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  kingdom.set("botSettings", data.botSettings || null)
  $app.save(kingdom)
  return e.json(200, { success: true })
})

// ─── 4. BUILD BUILDINGS ─────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/build-buildings", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.buildings || {}

  const land = kingdom.getInt("land")
  let money = kingdom.getInt("money")
  let buildings = kingdom.get("buildings") || {}
  if (typeof buildings === "string") {
    try { buildings = JSON.parse(buildings) } catch { buildings = {} }
  }
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
    military: kingdom.get("military") || {},
    buildings: buildings,
    land: land,
    population: kingdom.getInt("population"),
    money: money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("nw", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 5. RAZE BUILDINGS ──────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/raze-buildings", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.buildings || {}

  const land = kingdom.getInt("land")
  let money = kingdom.getInt("money")
  let buildings = kingdom.get("buildings") || {}
  if (typeof buildings === "string") {
    try { buildings = JSON.parse(buildings) } catch { buildings = {} }
  }

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
    military: kingdom.get("military") || {},
    buildings: buildings,
    land: land,
    population: kingdom.getInt("population"),
    money: money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("nw", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 6. TOGGLE AUTO-BUILD & SAVE TARGETS ────────────────────────────────────
routerAdd("POST", "/api/kingdoms/toggle-auto-build", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  kingdom.set("autoBuild", !!data.autoBuild)
  $app.save(kingdom)
  return e.json(200, { success: true, autoBuild: !!data.autoBuild })
})

routerAdd("POST", "/api/kingdoms/save-auto-build", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  let buildings = kingdom.get("buildings") || {}
  if (typeof buildings === "string") {
    try { buildings = JSON.parse(buildings) } catch { buildings = {} }
  }

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

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
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

  function parseJsonArray(val, rec, key) {
    if (rec && typeof rec.getString === "function") {
      const s = rec.getString(key)
      if (s) {
        try {
          const parsed = JSON.parse(s)
          if (Array.isArray(parsed)) return parsed
        } catch {}
      }
    }
    if (typeof val === "string") {
      try {
        const parsed = JSON.parse(val)
        if (Array.isArray(parsed)) return parsed
      } catch {}
    }
    if (Array.isArray(val)) {
      if (val.length > 0 && typeof val[0] === "number" && (val[0] === 91 || val[0] === 123)) {
        try {
          let str = ""
          for (let i = 0; i < val.length; i++) str += String.fromCharCode(val[i])
          const parsed = JSON.parse(str)
          if (Array.isArray(parsed)) return parsed
        } catch {}
      }
      return val
    }
    return []
  }

  let landQueue = parseJsonArray(kingdom.get("landQueue"), kingdom, "landQueue")
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
  kingdom.set("landQueue", newQueue)

  const newNw = tickEngine.calculateNetworth({
    military: kingdom.get("military") || {},
    buildings: kingdom.get("buildings") || {},
    land: land,
    population: kingdom.getInt("population"),
    money: money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("nw", newNw)

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

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
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

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.units || {}

  let money = kingdom.getInt("money")
  let military = kingdom.get("military") || {}
  if (typeof military === "string") {
    try { military = JSON.parse(military) } catch { military = {} }
  }
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
    buildings: kingdom.get("buildings") || {},
    land: kingdom.getInt("land"),
    population: kingdom.getInt("population"),
    money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("nw", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 8. DISBAND MILITARY ────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/disband-military", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const requested = data.units || {}

  let money = kingdom.getInt("money")
  let military = kingdom.get("military") || {}
  if (typeof military === "string") {
    try { military = JSON.parse(military) } catch { military = {} }
  }

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
    buildings: kingdom.get("buildings") || {},
    land: kingdom.getInt("land"),
    population: kingdom.getInt("population"),
    money,
    probes: kingdom.getInt("probes")
  })
  kingdom.set("nw", newNw)

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 9. SAVE MILITARY TARGETS ───────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/save-military-targets", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  let military = kingdom.get("military") || {}
  if (typeof military === "string") {
    try { military = JSON.parse(military) } catch { military = {} }
  }

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

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  const data = e.requestInfo().body || {}
  const count = parseInt(data.count, 10) || 0
  if (count <= 0) return e.json(400, { error: "Invalid count" })

  const cost = count * 1000
  let money = kingdom.getInt("money")
  if (money < cost) return e.json(400, { error: "Insufficient funds" })

  let military = kingdom.get("military") || {}
  if (typeof military === "string") {
    try { military = JSON.parse(military) } catch { military = {} }
  }

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

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
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

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
  if (!kingdom) return e.json(404, { error: "Kingdom not found" })

  kingdom.set("land", 250)
  kingdom.set("population", 2250)
  kingdom.set("popChange", 0)
  kingdom.set("money", 300000)
  kingdom.set("power", 10000)
  kingdom.set("probes", 0)
  kingdom.set("researchPts", 0)
  kingdom.set("state", "active")
  kingdom.set("landQueue", [])
  kingdom.set("research", {})
  kingdom.set("researchAutoAssign", [])
  kingdom.set("buildings", {
    res: 80, plants: 40, rax: 10, sm: 30, pf: 10, tc: 0, asb: 0, ach: 0, rubble: 0,
    queue: { res: [], plants: [], rax: [], sm: [], pf: [], tc: [], asb: [], ach: [] },
    target: { res: 32, plants: 16, rax: 4, sm: 12, pf: 4, tc: 0, asb: 0, ach: 0 }
  })
  kingdom.set("military", {
    sol: 200, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 300,
    queue: { sol: [], tr: [], dr: [], ft: [], tf: [], lt: [], ld: [], lf: [], f74: [], t: [], ht: [], sci: [] },
    target: { sol: 0, tr: 0, dr: 0, ft: 0, tf: 0, lt: 0, ld: 0, lf: 0, f74: 0, t: 0, ht: 0, sci: 0 }
  })

  $app.save(kingdom)
  return e.json(200, { success: true, kingdom })
})

// ─── 13. DELETE KINGDOM ─────────────────────────────────────────────────────
routerAdd("POST", "/api/kingdoms/delete", (e) => {
  const authRecord = e.requestInfo().auth
  if (!authRecord) return e.json(401, { error: "Authentication required" })

  const kingdom = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
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

// ─── 14. TARGETS LIST (Public info) ─────────────────────────────────────────
routerAdd("GET", "/api/kingdoms/targets", (e) => {
  const page = parseInt(e.requestInfo().query.page, 10) || 1
  const perPage = parseInt(e.requestInfo().query.perPage, 10) || 50
  const offset = (page - 1) * perPage

  const records = $app.findRecordsByFilter("kingdoms", "", "-land", perPage, offset)

  const sanitized = records.map((r) => ({
    id: r.id,
    kdName: r.getString("kdName"),
    rulerName: r.getString("rulerName"),
    planetType: r.getString("planetType"),
    raceType: r.getString("raceType"),
    land: r.getInt("land"),
    nw: r.getInt("nw"),
    state: r.getString("state")
  }))

  return e.json(200, {
    page,
    perPage,
    items: sanitized,
  })
})
