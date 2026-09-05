/// <reference path="../../../pb_data/types.d.ts" />

routerAdd("POST", "/api/kingdoms/create", (e) => {
  // Check auth
  const authRecord = e.requestInfo().auth
  if (!authRecord) {
    return e.json(401, { error: "Authentication required" })
  }

  // Parse body
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

  // Check if kingdom already exists for this user
  try {
    const existing = $app.findFirstRecordByFilter("kingdoms", "userId = {:userId}", { userId: authRecord.id })
    if (existing) {
      return e.json(400, { error: "Kingdom already exists for this user" })
    }
  } catch {
    // Expected when no kingdom exists
  }

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

  if (PLANET_TYPES.indexOf(planetType) === -1) {
    return e.json(400, { error: "Invalid planet type: " + planetType })
  }
  if (RACE_TYPES.indexOf(raceType) === -1) {
    return e.json(400, { error: "Invalid race type: " + raceType })
  }

  // Initial stats
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
    researchAutoAssign: {},
    state: "active",
    botSettings: botSettings
  })

  $app.save(playerKd)

  // Subordinate bots creation
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
      researchAutoAssign: {},
      state: "active",
      botOwnerKd: playerKd.id,
      botSettings: botSettings
    })

    $app.save(botKd)
  }

  // Increment gameStatus kingdomCount if record exists
  try {
    const statusRecord = $app.findFirstRecordByFilter("gameStatus", "1 = 1")
    if (statusRecord) {
      const currentCount = statusRecord.getInt("kingdomCount") || 0
      statusRecord.set("kingdomCount", currentCount + 1 + botLimit)
      $app.save(statusRecord)
    }
  } catch {
    // Non-fatal if gameStatus not initialized yet
  }

  return e.json(200, playerKd)
})
