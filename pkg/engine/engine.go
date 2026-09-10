package engine

import (
	"math"
)

var MilitaryUnits = map[string]UnitDef{
	"sol": {Cost: 150, Sol: 0, Power: 0.7, Housing: 1, Off: 1, Def: 1},
	"sci": {Cost: 1000, Sol: 0, Power: 0.7, Housing: 1, Off: 0, Def: 0},
	"tr":  {Cost: 350, Sol: 1, Power: 0.7, Housing: 1, Off: 4, Def: 0},
	"dr":  {Cost: 450, Sol: 1, Power: 0.7, Housing: 1, Off: 5, Def: 0, ResearchRequired: "r_dr"},
	"ft":  {Cost: 550, Sol: 1, Power: 0.7, Housing: 1, Off: 6, Def: 0, ResearchRequired: "r_ft"},
	"tf":  {Cost: 1500, Sol: 0, Power: 1.4, Housing: 2, Off: 12, Def: 0, BuildingRequired: "asb", ResearchRequired: "r_tf"},
	"lt":  {Cost: 375, Sol: 1, Power: 0.7, Housing: 1, Off: 0, Def: 4},
	"ld":  {Cost: 500, Sol: 1, Power: 0.7, Housing: 1, Off: 0, Def: 5, ResearchRequired: "r_ld"},
	"lf":  {Cost: 625, Sol: 1, Power: 0.7, Housing: 1, Off: 0, Def: 6, ResearchRequired: "r_lf"},
	"f74": {Cost: 975, Sol: 0, Power: 1.4, Housing: 1, Off: 0, Def: 8, BuildingRequired: "asb", ResearchRequired: "r_f74"},
	"t":   {Cost: 1750, Sol: 1, Power: 1.4, Housing: 2, Off: 9, Def: 9},
	"ht":  {Cost: 2250, Sol: 1, Power: 1.4, Housing: 2, Off: 12, Def: 12, ResearchRequired: "r_ht"},
}

var ResearchParams = map[string]ResearchParam{
	"pop":   {Weight: 0.00475, Bonus: 20},
	"power": {Weight: 0.00311, Bonus: 50},
	"mil":   {Weight: 0.00291, Bonus: 30},
	"money": {Weight: 0.00535, Bonus: 25},
	"fdc":   {Weight: 0.0004, Bonus: 25},
	"warp":  {Weight: 0.00173, Bonus: 20, Requires: "r_core"},
}

var ResearchTechTree = map[string]TechDef{
	"r_dr":     {RequirePoints: 30000, Requires: "r_long"},
	"r_ft":     {RequirePoints: 80000, Requires: "r_dr"},
	"r_tf":     {RequirePoints: 300000, Requires: "r_f74"},
	"r_f74":    {RequirePoints: 200000, Requires: "r_core"},
	"r_ld":     {RequirePoints: 40000, Requires: "r_long"},
	"r_lf":     {RequirePoints: 80000, Requires: "r_ld"},
	"r_fusion": {RequirePoints: 30000, Bonus: 50},
	"r_core":   {RequirePoints: 30000, Requires: "r_fusion", Bonus: 20},
	"r_armor":  {RequirePoints: 92000, Requires: "r_core"},
	"r_long":   {RequirePoints: 30000, Bonus: 5},
	"r_ht":     {RequirePoints: 200000},
}

// CalculateRequiredResearchPoints calculates points needed for standard research.
func CalculateRequiredResearchPoints(topic string, land int) int {
	weight := 0.005
	if p, ok := ResearchParams[topic]; ok {
		weight = p.Weight
	}
	return int(math.Round(float64(land*land) * weight))
}

// CalculateNetworth computes the aggregate score of the realm.
func CalculateNetworth(kd *Kingdom) int {
	m := kd.Military
	b := kd.Buildings

	totalBuildings := b["res"] + b["plants"] + b["rax"] + b["sm"] + b["pf"] + b["tc"] + b["asb"] + b["ach"]

	milNW := m["sol"]*3 + m["tr"]*6 + m["dr"]*8 + m["ft"]*10 + m["tf"]*18 +
		m["lt"]*6 + m["ld"]*8 + m["lf"]*10 + m["f74"]*12 + m["t"]*22 + m["ht"]*31 + m["sci"]*8

	landNW := kd.Land * 25
	bldNW := totalBuildings * 25
	popNW := kd.Population * 1
	moneyNW := kd.Money / 500
	probeNW := kd.Probes / 1000

	return milNW + landNW + bldNW + popNW + moneyNW + probeNW
}

// CalculateExplorationQueue appends new land across a 24-tick pipeline.
func CalculateExplorationQueue(currentQueue []int, requestedLand int, ticks int) []int {
	if ticks <= 0 {
		ticks = 24
	}
	res := make([]int, len(currentQueue))
	copy(res, currentQueue)
	for len(res) < ticks {
		res = append(res, 0)
	}
	if requestedLand <= 0 {
		return res
	}
	perTick := requestedLand / ticks
	remainder := requestedLand % ticks
	for i := 0; i < ticks; i++ {
		res[i] += perTick
	}
	backIndex := ticks - 1
	for remainder > 0 && backIndex >= 0 {
		res[backIndex]++
		remainder--
		backIndex--
	}
	return res
}

// CalculateFreeLand calculates undeveloped acres.
func CalculateFreeLand(land int, buildings map[string]int, queue map[string][]int) int {
	keys := []string{"res", "plants", "rax", "sm", "pf", "tc", "asb", "ach", "rubble"}
	buildingSum := 0
	for _, k := range keys {
		buildingSum += buildings[k]
	}
	queueSum := 0
	if queue != nil {
		for _, k := range keys {
			for _, amount := range queue[k] {
				queueSum += amount
			}
		}
	}
	free := land - buildingSum - queueSum
	if free < 0 {
		return 0
	}
	return free
}

// CalculateNewBuildingQueue schedules buildings over 16 ticks.
func CalculateNewBuildingQueue(currentQueue map[string][]int, requested map[string]int, ticks int) map[string][]int {
	if ticks <= 0 {
		ticks = 16
	}
	keys := []string{"res", "plants", "rax", "sm", "pf", "tc", "asb", "ach"}
	res := make(map[string][]int)
	for _, k := range keys {
		curr := currentQueue[k]
		slice := make([]int, len(curr))
		copy(slice, curr)
		for len(slice) < ticks {
			slice = append(slice, 0)
		}
		amount := requested[k]
		if amount > 0 {
			perTick := amount / ticks
			remainder := amount % ticks
			for t := 0; t < ticks; t++ {
				slice[t] += perTick
			}
			backIndex := ticks - 1
			for remainder > 0 && backIndex >= 0 {
				slice[backIndex]++
				remainder--
				backIndex--
			}
		}
		res[k] = slice
	}
	return res
}

// CalculateMilitaryQueue schedules military recruitment over 24 ticks.
func CalculateMilitaryQueue(currentQueue map[string][]int, requested map[string]int, ticks int) map[string][]int {
	if ticks <= 0 {
		ticks = 24
	}
	keys := []string{"sol", "tr", "dr", "ft", "tf", "lt", "ld", "lf", "f74", "t", "ht", "sci"}
	res := make(map[string][]int)
	for _, k := range keys {
		curr := currentQueue[k]
		slice := make([]int, len(curr))
		copy(slice, curr)
		for len(slice) < ticks {
			slice = append(slice, 0)
		}
		amount := requested[k]
		if amount > 0 {
			perTick := amount / ticks
			remainder := amount % ticks
			for t := 0; t < ticks; t++ {
				slice[t] += perTick
			}
			backIndex := ticks - 1
			for remainder > 0 && backIndex >= 0 {
				slice[backIndex]++
				remainder--
				backIndex--
			}
		}
		res[k] = slice
	}
	return res
}

// ProcessKingdomTick executes the 7 simulation phases on a kingdom.
func ProcessKingdomTick(kd *Kingdom, currentTick int) {
	land := kd.Land
	landQueue := kd.LandQueue
	buildings := kd.Buildings
	buildingQueue := kd.BuildingQueue
	military := kd.Military
	militaryQueue := kd.MilitaryQueue
	research := kd.Research
	researchPts := kd.ResearchPts
	population := kd.Population
	money := kd.Money
	power := kd.Power
	probes := kd.Probes
	state := kd.State

	// ─── Phase 1: Growth & Construction Completion ───────────────────────────
	if len(landQueue) > 0 {
		land += landQueue[0]
		landQueue = landQueue[1:]
	}

	buildKeys := []string{"res", "plants", "rax", "sm", "pf", "tc", "asb"}
	for _, k := range buildKeys {
		if len(buildingQueue[k]) > 0 {
			buildings[k] += buildingQueue[k][0]
			buildingQueue[k] = buildingQueue[k][1:]
		}
	}

	// ─── Phase 2: Scientific Research ────────────────────────────────────────
	researchPts += military["sci"]
	if len(kd.ResearchAutoAssign) > 0 && researchPts > 0 {
		for _, key := range kd.ResearchAutoAssign {
			if researchPts <= 0 {
				break
			}
			existing := research[key]
			currentTopicPts := existing.Pts

			required := 0
			if techInfo, ok := ResearchTechTree[key]; ok {
				if techInfo.Requires != "" {
					prereq := research[techInfo.Requires]
					if prereq.Perc < 100 {
						continue
					}
				}
				required = techInfo.RequirePoints
			} else {
				if param, ok := ResearchParams[key]; ok && param.Requires != "" {
					prereq := research[param.Requires]
					if prereq.Perc < 100 {
						continue
					}
				}
				required = CalculateRequiredResearchPoints(key, land)
			}

			needed := required - currentTopicPts
			if needed > 0 {
				toAssign := researchPts
				if toAssign > needed {
					toAssign = needed
				}
				research[key] = ResearchTopic{
					Pts:  currentTopicPts + toAssign,
					Perc: existing.Perc,
				}
				researchPts -= toAssign
			}
		}
	}

	standardKeys := []string{"pop", "power", "mil", "money", "fdc", "warp"}
	for _, k := range standardKeys {
		resData := research[k]
		required := CalculateRequiredResearchPoints(k, land)
		maxBonus := ResearchParams[k].Bonus
		perc := 0
		if required > 0 {
			perc = (maxBonus * resData.Pts) / required
			if perc > maxBonus {
				perc = maxBonus
			}
		}
		research[k] = ResearchTopic{Pts: resData.Pts, Perc: perc}
	}

	for k, techInfo := range ResearchTechTree {
		resData := research[k]
		perc := 0
		if techInfo.RequirePoints > 0 {
			perc = (resData.Pts * 100) / techInfo.RequirePoints
			if perc > 100 {
				perc = 100
			}
		}
		research[k] = ResearchTopic{Pts: resData.Pts, Perc: perc}
	}

	// ─── Phase 3: Population Dynamics & Housing ──────────────────────────────
	popBonus := float64(research["pop"].Perc) / 100.0
	longBonus := 0
	if research["r_long"].Perc >= 100 {
		longBonus = 5
	}

	raxUsage := 0
	for k := range MilitaryUnits {
		weight := 1
		if k == "t" || k == "ht" {
			weight = 2
		}
		raxUsage += military[k] * weight
	}

	raxCap := buildings["rax"] * 75
	raxSurplus := raxUsage - raxCap
	if raxSurplus < 0 {
		raxSurplus = 0
	}

	resCap := float64(50+longBonus) * (1.0 + popBonus)
	maxPop := int(math.Floor(float64(buildings["res"])*resCap - float64(raxSurplus)))
	if maxPop < 0 {
		maxPop = 0
	}

	popChange := 0
	if population < maxPop {
		popChange = int(math.Ceil(float64(population) * 0.05))
		if popChange > maxPop-population {
			popChange = maxPop - population
		}
	} else if population > maxPop {
		decline := 100.0
		landBound := float64(land) / 5.0
		if land > 10000 {
			landBound = float64(land) / 10.0
		}
		if landBound > decline {
			decline = landBound
		}
		popBound := float64(population) * 0.05
		if popBound > decline {
			decline = popBound
		}
		popChange = -int(math.Round(decline))
	}

	population += popChange
	if population <= 0 {
		population = 0
		state = "dead"
	}

	// ─── Phase 4: Economics & Power ──────────────────────────────────────────
	moneyBonus := float64(research["money"].Perc) / 100.0
	powerBonus := float64(research["power"].Perc) / 100.0
	fusionBonus := 0.0
	if research["r_fusion"].Perc >= 100 {
		fusionBonus = 0.5
	}
	coreBonus := 0.0
	if research["r_core"].Perc >= 100 {
		coreBonus = 0.2
	}

	moneyIncome := int(math.Round(float64(buildings["sm"]*140+population*2) * (1.0 + moneyBonus)))
	powerCons := float64(population) * 0.032
	for k, def := range MilitaryUnits {
		powerCons += float64(military[k]) * def.Power
	}

	powerGen := float64(buildings["plants"]*100) * (1.0 + powerBonus + fusionBonus + coreBonus)
	powerIncome := int(math.Round(powerGen - powerCons))

	money += moneyIncome
	power = power + powerIncome
	if power < 0 {
		power = 0
	}
	plantCap := buildings["plants"] * 1000
	if power > plantCap {
		power = plantCap
	}
	probes += buildings["pf"]

	// ─── Phase 5: Military Training Completion & Promotions ──────────────────
	milKeys := []string{"sol", "tr", "dr", "ft", "tf", "lt", "ld", "lf", "f74", "t", "ht", "sci"}
	for _, k := range milKeys {
		if len(militaryQueue[k]) > 0 {
			military[k] += militaryQueue[k][0]
			militaryQueue[k] = militaryQueue[k][1:]
		}
	}

	// Promotions
	if research["r_ld"].Perc >= 100 && military["lt"] > 0 {
		pool := military["lt"] * 4
		military["ld"] += pool / 5
		military["sol"] += pool % 5
		military["lt"] = 0
	}
	if research["r_lf"].Perc >= 100 && military["ld"] > 0 {
		pool := military["ld"] * 5
		military["lf"] += pool / 6
		military["sol"] += pool % 6
		military["ld"] = 0
	}
	if research["r_dr"].Perc >= 100 && military["tr"] > 0 {
		pool := military["tr"] * 4
		military["dr"] += pool / 5
		military["sol"] += pool % 5
		military["tr"] = 0
	}
	if research["r_ft"].Perc >= 100 && military["dr"] > 0 {
		pool := military["dr"] * 5
		military["ft"] += pool / 6
		military["sol"] += pool % 6
		military["dr"] = 0
	}
	if research["r_ht"].Perc >= 100 && military["t"] > 0 {
		pool := military["t"] * 9
		military["ht"] += pool / 12
		military["sol"] += pool % 12
		military["t"] = 0
	}

	// ─── Phase 6: Autonomous Bot Growth ──────────────────────────────────────
	if (currentTick%12 == 0 || currentTick == 1) && kd.AutoBuild {
		HandleBotParams(kd)

		autoExplore := kd.AutoExplore
		target := kd.BuildingTarget
		if len(target) == 0 {
			target = map[string]int{"res": 32, "plants": 16, "rax": 4, "sm": 12, "pf": 4, "tc": 0, "asb": 0, "ach": 0}
			kd.BuildingTarget = target
		}

		// 1. Auto Explore
		if autoExplore > 0 {
			limitPct := float64(autoExplore) * 0.01
			queueSum := 0
			for _, v := range landQueue {
				queueSum += v
			}
			maxExplore := int(math.Floor(float64(land)*limitPct)) - queueSum
			if maxExplore > 0 {
				baseCost := math.Sqrt(float64(land)) * 111.0
				levelMultipliers := []float64{0.165, 0.33, 0.5, 0.67, 0.835, 1, 1.25, 1.5, 1.75, 2}
				lIdx := autoExplore - 1
				if lIdx < 0 {
					lIdx = 0
				}
				if lIdx >= len(levelMultipliers) {
					lIdx = len(levelMultipliers) - 1
				}
				levelMultiplier := levelMultipliers[lIdx]

				landMultiplier := 1.0
				if land < 1000 {
					landMultiplier = 0.25
				} else if land < 2500 {
					landMultiplier = 0.5
				} else if land < 5000 {
					landMultiplier = 0.75
				}

				costPerLand := int(math.Round(baseCost * levelMultiplier * landMultiplier))
				if costPerLand > 0 {
					affordable := money / costPerLand
					exploreNum := maxExplore
					if affordable < exploreNum {
						exploreNum = affordable
					}
					roundedExplore := (exploreNum / 24) * 24
					if roundedExplore > 0 {
						money -= roundedExplore * costPerLand
						landQueue = CalculateExplorationQueue(landQueue, roundedExplore, 24)
					}
				}
			}
		}

		// 2. Auto Build
		freeLand := CalculateFreeLand(land, buildings, buildingQueue)
		buildingCost := int(math.Round(math.Sqrt(float64(land)) * 63.0))
		if buildingCost > 0 && freeLand > 0 {
			maxToBuild := money / buildingCost
			if freeLand < maxToBuild {
				maxToBuild = freeLand
			}
			if maxToBuild > 0 {
				deficiencies := make(map[string]int)
				totalDeficiency := 0
				for _, key := range buildKeys {
					tVal := target[key]
					inQ := 0
					for _, qv := range buildingQueue[key] {
						inQ += qv
					}
					current := buildings[key] + inQ
					def := (land * tVal) / 100 - current
					if def < 0 {
						def = 0
					}
					deficiencies[key] = def
					totalDeficiency += def
				}

				if totalDeficiency > 0 {
					remainingChunks := maxToBuild / 16
					if remainingChunks > 0 {
						constructionGroup := map[string]int{
							"res": 0, "plants": 0, "rax": 0, "sm": 0, "pf": 0, "tc": 0, "asb": 0, "ach": 0,
						}
						for remainingChunks > 0 {
							bestKey := ""
							maxNeeded := -1
							for _, key := range buildKeys {
								needed := deficiencies[key] - constructionGroup[key]
								if needed > maxNeeded {
									maxNeeded = needed
									bestKey = key
								}
							}
							if bestKey == "" || maxNeeded <= 0 {
								break
							}
							constructionGroup[bestKey] += 16
							remainingChunks--
						}

						actualBuilt := 0
						for _, key := range buildKeys {
							actualBuilt += constructionGroup[key]
						}
						if actualBuilt > 0 {
							money -= actualBuilt * buildingCost
							buildingQueue = CalculateNewBuildingQueue(buildingQueue, constructionGroup, 16)
						}
					}
				}
			}
		}

		// 3. Military Growth
		trainingLimit := population / 10
		solInQueue := 0
		for _, v := range militaryQueue["sol"] {
			solInQueue += v
		}
		availableCap := trainingLimit - solInQueue
		if availableCap < 0 {
			availableCap = 0
		}
		botLimit := land * 4
		if botLimit < 4000 {
			botLimit = 4000
		}
		currSolTotal := military["sol"] + solInQueue
		neededToBotLimit := botLimit - currSolTotal
		if neededToBotLimit < 0 {
			neededToBotLimit = 0
		}
		solToBuy := availableCap
		if neededToBotLimit < solToBuy {
			solToBuy = neededToBotLimit
		}

		if solToBuy > 0 {
			solCost := 150
			maxSol := money / solCost
			actualSol := solToBuy
			if maxSol < actualSol {
				actualSol = maxSol
			}
			actualSol = (actualSol / 16) * 16
			if actualSol > 0 {
				money -= actualSol * solCost
				militaryQueue = CalculateMilitaryQueue(militaryQueue, map[string]int{"sol": actualSol}, 16)
			}
		}

		if len(kd.MilitaryTarget) > 0 {
			tcCount := buildings["tc"]
			tcDiscount := 0
			if land > 0 {
				tcDiscount = (tcCount * 300) / land
				if tcDiscount > 30 {
					tcDiscount = 30
				}
			}

			getUnitCost := func(u string) int {
				def := MilitaryUnits[u]
				if u == "sol" || u == "sci" {
					return def.Cost
				}
				return (def.Cost * (100 - tcDiscount)) / 100
			}

			initialBudget := money
			initialSol := military["sol"]
			requestedProd := make(map[string]int)
			hasProd := false

			for key, targetPct := range kd.MilitaryTarget {
				if key == "sol" || targetPct <= 0 {
					continue
				}
				ratio := float64(targetPct) / 100.0
				targetBudget := int(float64(initialBudget) * ratio)
				availBudget := money
				if targetBudget < availBudget {
					availBudget = targetBudget
				}
				targetSol := int(float64(initialSol) * ratio)
				availSol := military["sol"]
				if targetSol < availSol {
					availSol = targetSol
				}

				if availBudget <= 0 {
					continue
				}

				cost := getUnitCost(key)
				def := MilitaryUnits[key]
				maxUnits := availBudget / cost
				if def.Sol > 0 {
					solMax := availSol / def.Sol
					if solMax < maxUnits {
						maxUnits = solMax
					}
				}

				if def.BuildingRequired == "asb" {
					asbTotal := buildings["asb"] * 60
					asbUsed := 0
					for k2, def2 := range MilitaryUnits {
						if def2.BuildingRequired == "asb" {
							inQ := 0
							for _, v := range militaryQueue[k2] {
								inQ += v
							}
							asbUsed += (military[k2] + inQ + requestedProd[k2]) * def2.Housing
						}
					}
					asbLeft := asbTotal - asbUsed
					if asbLeft < 0 {
						asbLeft = 0
					}
					unitsLeft := asbLeft / def.Housing
					if unitsLeft < maxUnits {
						maxUnits = unitsLeft
					}
				}

				if def.ResearchRequired != "" {
					rData := research[def.ResearchRequired]
					if rData.Perc < 100 {
						maxUnits = 0
					}
				}

				count := (maxUnits / 24) * 24
				if count > 0 {
					money -= count * cost
					military["sol"] -= count * def.Sol
					requestedProd[key] = count
					hasProd = true
				}
			}

			if hasProd {
				militaryQueue = CalculateMilitaryQueue(militaryQueue, requestedProd, 24)
			}
		}
	}

	// ─── Phase 7: Networth Calculation ───────────────────────────────────────
	kd.Land = land
	kd.LandQueue = landQueue
	kd.Buildings = buildings
	kd.BuildingQueue = buildingQueue
	kd.Military = military
	kd.MilitaryQueue = militaryQueue
	kd.Research = research
	kd.ResearchPts = researchPts
	kd.Population = population
	kd.PopChange = popChange
	kd.Money = money
	kd.MoneyIncome = moneyIncome
	kd.Power = power
	kd.PowerIncome = powerIncome
	kd.Probes = probes
	kd.State = state
	kd.NW = CalculateNetworth(kd)
}
