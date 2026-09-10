package engine

import (
	"testing"
)

func TestHandleBotParams_BalancedProfile(t *testing.T) {
	kd := &Kingdom{
		Land:        250,
		Population:  2250,
		AutoBuild:   true,
		AutoExplore: 0,
		Probes:      10,
		Military: map[string]int{
			"sol": 200,
			"sci": 300,
		},
		MilitaryQueue: make(map[string][]int),
		Buildings: map[string]int{
			"res":    80,
			"plants": 40,
			"rax":    10,
			"sm":     30,
			"pf":     10,
			"tc":     5,
		},
		BuildingQueue: make(map[string][]int),
		Research:      make(map[string]ResearchTopic),
		BotSettings: &BotSettings{
			Label:       "Standard Balanced",
			Exploration: 6,
			Offense:     20,
			Defense:     50,
			Flex:        12,
			Science:     18,
			Buildings: BotProfileBuildings{
				PF: 10,
				TC: 5,
			},
			ResearchPriority: []string{"mil", "money", "warp"},
		},
	}

	HandleBotParams(kd)

	// Since land < 1000, exploration is set to 10
	if kd.AutoExplore != 10 {
		t.Errorf("expected AutoExplore = 10 for land < 1000, got %d", kd.AutoExplore)
	}

	// Profile TC and PF should be set
	if kd.BuildingTarget["tc"] != 5 {
		t.Errorf("expected tc target = 5, got %d", kd.BuildingTarget["tc"])
	}
	if kd.BuildingTarget["pf"] != 10 {
		t.Errorf("expected pf target = 10, got %d", kd.BuildingTarget["pf"])
	}

	// Plants target must be > 0 to cover power needs
	if kd.BuildingTarget["plants"] <= 0 {
		t.Errorf("expected plants target > 0, got %d", kd.BuildingTarget["plants"])
	}

	// Rax target must house the soldiers (200 * 1.05 / 75 = 3 rax -> 3 / 250 = 1%)
	if kd.BuildingTarget["rax"] < 1 {
		t.Errorf("expected rax target >= 1, got %d", kd.BuildingTarget["rax"])
	}

	// Remaining land split between res and sm
	if kd.BuildingTarget["res"] <= 0 || kd.BuildingTarget["sm"] <= 0 {
		t.Errorf("expected res and sm > 0, got res=%d, sm=%d", kd.BuildingTarget["res"], kd.BuildingTarget["sm"])
	}

	// Sum of targets should not exceed 100
	totalSum := 0
	for _, k := range []string{"rax", "asb", "plants", "tc", "pf", "ach", "res", "sm"} {
		totalSum += kd.BuildingTarget[k]
	}
	if totalSum > 100 {
		t.Errorf("total building target sum %d exceeds 100", totalSum)
	}

	// Military targets: base units before research
	if kd.MilitaryTarget["sci"] != 18 {
		t.Errorf("expected sci target = 18, got %d", kd.MilitaryTarget["sci"])
	}
	if kd.MilitaryTarget["tr"] != 20 {
		t.Errorf("expected base offense tr target = 20, got %d", kd.MilitaryTarget["tr"])
	}
	if kd.MilitaryTarget["lt"] != 50 {
		t.Errorf("expected base defense lt target = 50, got %d", kd.MilitaryTarget["lt"])
	}
	if kd.MilitaryTarget["t"] != 12 {
		t.Errorf("expected base flex t target = 12, got %d", kd.MilitaryTarget["t"])
	}
}

func TestHandleBotParams_UpgradedUnitsWithResearch(t *testing.T) {
	kd := &Kingdom{
		Land:        1500,
		Population:  15000,
		AutoBuild:   true,
		AutoExplore: 0,
		Military:    map[string]int{"sol": 1000},
		Research: map[string]ResearchTopic{
			"r_dr": {Perc: 100},
			"r_ft": {Perc: 100},
			"r_ld": {Perc: 100},
		},
		BotSettings: &BotSettings{
			Label:       "Aggressive",
			Exploration: 2,
			Offense:     40,
			Defense:     30,
			Flex:        20,
			Science:     10,
			Buildings: BotProfileBuildings{
				PF: 5,
				TC: 10,
			},
		},
	}

	HandleBotParams(kd)

	// Since land >= 1000, exploration is set to profile (2)
	if kd.AutoExplore != 2 {
		t.Errorf("expected AutoExplore = 2 for land >= 1000, got %d", kd.AutoExplore)
	}

	// Offense should pick best unlocked: r_ft is 100% -> "ft"
	if kd.MilitaryTarget["ft"] != 40 {
		t.Errorf("expected offense unit ft target = 40, got %d", kd.MilitaryTarget["ft"])
	}
	// Defense should pick best unlocked: r_ld is 100% -> "ld"
	if kd.MilitaryTarget["ld"] != 30 {
		t.Errorf("expected defense unit ld target = 30, got %d", kd.MilitaryTarget["ld"])
	}
}

func TestHandleBotParams_ManualMode(t *testing.T) {
	kd := &Kingdom{
		Land:        500,
		AutoBuild:   true,
		AutoExplore: 5,
		Military: map[string]int{
			"sol": 1500, // 1500 soldiers * 1.05 / 75 = 21 rax needed -> 21/500 = 4.2% -> 4%
		},
		BuildingTarget: map[string]int{
			"rax": 2, // manual was set to only 2%
			"res": 50,
			"sm":  30,
		},
	}

	HandleBotParams(kd)

	// In manual mode, AutoExplore should NOT be changed
	if kd.AutoExplore != 5 {
		t.Errorf("expected AutoExplore = 5 in manual mode, got %d", kd.AutoExplore)
	}

	// Rax target should be increased to house the army (at least 4%)
	if kd.BuildingTarget["rax"] < 4 {
		t.Errorf("expected rax target >= 4 to house army, got %d", kd.BuildingTarget["rax"])
	}

	// Manual res and sm targets should NOT be wiped
	if kd.BuildingTarget["res"] != 50 {
		t.Errorf("expected manual res target 50 preserved, got %d", kd.BuildingTarget["res"])
	}
}
