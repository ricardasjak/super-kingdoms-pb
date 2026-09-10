package engine

import (
	"math"
)

// HandleBotParams adjusts kingdom settings and building/military targets based on
// the selected governor bot profile (or ensures minimum housing when manual).
func HandleBotParams(kd *Kingdom) {
	hasBotProfile := kd.BotSettings != nil && kd.BotSettings.HasProfile()

	// If no profile and auto-build is off, nothing to adjust.
	if !hasBotProfile && !kd.AutoBuild {
		return
	}

	if kd.BuildingTarget == nil {
		kd.BuildingTarget = make(map[string]int)
	}

	// 1. Adjust exploration rate to bot profile.
	if hasBotProfile {
		targetExploration := kd.BotSettings.Exploration
		if kd.Land < 1000 {
			targetExploration = 10
		}
		if targetExploration > 0 {
			kd.AutoExplore = targetExploration
		}
	}

	// 2. Adjust Training Camps (TC) and Protection Facilities (PF) targets.
	if hasBotProfile {
		kd.BuildingTarget["tc"] = kd.BotSettings.Buildings.TC
		kd.BuildingTarget["pf"] = kd.BotSettings.Buildings.PF
	}

	// 3. Adjust Barracks (rax) and Air Support Bases (asb) to house army + queue (+5% safety buffer).
	raxUsage := 0
	asbUsage := 0

	for k, def := range MilitaryUnits {
		count := kd.Military[k]
		for _, qv := range kd.MilitaryQueue[k] {
			count += qv
		}
		housing := def.Housing
		if housing <= 0 {
			housing = 1
		}
		if def.BuildingRequired == "asb" {
			asbUsage += count * housing
		} else {
			raxUsage += count * housing
		}
	}

	raxNeeded := int(math.Ceil((float64(raxUsage) * 1.05) / 75.0))
	asbNeeded := int(math.Ceil((float64(asbUsage) * 1.05) / 60.0))

	raxTarget := 0
	asbTarget := 0
	if kd.Land > 0 {
		raxTarget = int(math.Round((float64(raxNeeded) * 100.0) / float64(kd.Land)))
		asbTarget = int(math.Round((float64(asbNeeded) * 100.0) / float64(kd.Land)))
	}

	if hasBotProfile {
		kd.BuildingTarget["rax"] = raxTarget
		kd.BuildingTarget["asb"] = asbTarget
	} else {
		// Manual mode with autoBuild on: guarantee sufficient housing without lowering user's target
		if raxTarget > kd.BuildingTarget["rax"] {
			kd.BuildingTarget["rax"] = raxTarget
		}
		if asbTarget > kd.BuildingTarget["asb"] {
			kd.BuildingTarget["asb"] = asbTarget
		}
	}

	kd.BuildingTarget["ach"] = 0

	// 4. Adjust Power Plants (plants) and split remaining land between Residences (res) and Mines (sm).
	if hasBotProfile {
		powerBonus := float64(kd.Research["power"].Perc) / 100.0
		fusionBonus := 0.0
		if kd.Research["r_fusion"].Perc >= 100 {
			fusionBonus = 0.5
		}
		coreBonus := 0.0
		if kd.Research["r_core"].Perc >= 100 {
			coreBonus = 0.2
		}
		totalPowerMultiplier := 1.0 + powerBonus + fusionBonus + coreBonus

		powerConsumption := float64(kd.Population) * 0.032
		for k, def := range MilitaryUnits {
			count := kd.Military[k]
			for _, qv := range kd.MilitaryQueue[k] {
				count += qv
			}
			powerConsumption += float64(count) * def.Power
		}

		productionNeeded := powerConsumption + float64(kd.Probes)
		plantsNeeded := int(math.Ceil(productionNeeded / (100.0 * totalPowerMultiplier)))
		plantsTarget := 0
		if kd.Land > 0 {
			plantsTarget = int(math.Round((float64(plantsNeeded) * 100.0) / float64(kd.Land)))
		}
		kd.BuildingTarget["plants"] = plantsTarget

		usedPercentage := kd.BuildingTarget["rax"] +
			kd.BuildingTarget["asb"] +
			kd.BuildingTarget["plants"] +
			kd.BuildingTarget["tc"] +
			kd.BuildingTarget["pf"] +
			kd.BuildingTarget["ach"]

		remaining := 100 - usedPercentage
		if remaining < 0 {
			remaining = 0
		}
		resTarget := remaining / 2
		smTarget := remaining - resTarget

		kd.BuildingTarget["res"] = resTarget
		kd.BuildingTarget["sm"] = smTarget

		totalSum := 0
		for _, key := range []string{"rax", "asb", "plants", "tc", "pf", "ach", "res", "sm"} {
			totalSum += kd.BuildingTarget[key]
		}
		if totalSum > 100 {
			excess := totalSum - 100
			kd.BuildingTarget["sm"] -= excess
			if kd.BuildingTarget["sm"] < 0 {
				kd.BuildingTarget["sm"] = 0
			}
		}
	}

	// 5. Adjust Military targets based on bot profile and available research.
	if hasBotProfile {
		if kd.MilitaryTarget == nil {
			kd.MilitaryTarget = make(map[string]int)
		}

		for k := range MilitaryUnits {
			kd.MilitaryTarget[k] = 0
		}
		kd.MilitaryTarget["sci"] = kd.BotSettings.Science

		offUnits := []string{"tf", "ft", "dr", "tr"}
		defUnits := []string{"f74", "lf", "ld", "lt"}
		flexUnits := []string{"ht", "t"}

		findBest := func(units []string) string {
			for _, u := range units {
				req := MilitaryUnits[u].ResearchRequired
				if req == "" || kd.Research[req].Perc >= 100 {
					return u
				}
			}
			return units[len(units)-1]
		}

		bestOff := findBest(offUnits)
		bestDef := findBest(defUnits)
		bestFlex := findBest(flexUnits)

		kd.MilitaryTarget[bestOff] = kd.BotSettings.Offense
		kd.MilitaryTarget[bestDef] = kd.BotSettings.Defense
		kd.MilitaryTarget[bestFlex] = kd.BotSettings.Flex
	}
}
