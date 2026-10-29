package engine

import "encoding/json"

// ResearchTopic represents progress in a research subject.
type ResearchTopic struct {
	Pts  int `json:"pts"`
	Perc int `json:"perc"`
}

// UnitDef defines properties of a military unit.
type UnitDef struct {
	Cost             int
	Sol              int
	Power            float64
	Housing          int
	Off              int
	Def              int
	BuildingRequired string
	ResearchRequired string
}

// TechDef defines prerequisites for the tech tree.
type TechDef struct {
	RequirePoints int
	Requires      string
	Bonus         int
}

// ResearchParam defines standard scientific parameters.
type ResearchParam struct {
	Weight   float64
	Bonus    int
	Requires string
}

// BotProfileBuildings defines building targets specified in a bot profile.
type BotProfileBuildings struct {
	PF int `json:"pf"`
	TC int `json:"tc"`
}

// BotSettings holds AI configuration and strategy directives.
type BotSettings struct {
	Label            string              `json:"label"`
	Exploration      int                 `json:"exploration"`
	Offense          int                 `json:"offense"`
	Defense          int                 `json:"defense"`
	Flex             int                 `json:"flex"`
	Science          int                 `json:"science"`
	Buildings        BotProfileBuildings `json:"buildings"`
	ResearchPriority []string            `json:"researchPriority"`
}

// HasProfile returns true if a named governor profile is configured.
func (bs *BotSettings) HasProfile() bool {
	if bs == nil {
		return false
	}
	return bs.Label != "" || bs.Exploration > 0 || bs.Buildings.PF > 0 || bs.Buildings.TC > 0 || bs.Offense > 0 || bs.Defense > 0
}

// Shields represents planetary defense shield levels.
type Shields struct {
	Missile  int `json:"missile"`
	Military int `json:"military"`
	Probe    int `json:"probe"`
}

// Kingdom represents the full simulation state of a realm.
type Kingdom struct {
	ID                  string  `json:"id" db:"id"`
	User                string  `json:"user" db:"user"`
	Name                string  `json:"name" db:"name"`
	KDName              string  `json:"kdName" db:"-"`
	PlanetType          string  `json:"planet_type" db:"planet_type"`
	Sector              string  `json:"sector" db:"sector"`
	SectorSlot          int     `json:"sector_slot" db:"sector_slot"`
	State               string  `json:"state" db:"state"`
	TroubleUntilTick    int     `json:"trouble_until_tick" db:"trouble_until_tick"`
	MAProtection        float64 `json:"ma_protection" db:"ma_protection"`
	Land                int     `json:"land" db:"land"`
	FreeLand            int     `json:"free_land" db:"free_land"`
	Population          int     `json:"population" db:"population"`
	PopChange           int     `json:"popChange" db:"-"`
	Money               int     `json:"money" db:"money"`
	MoneyIncome         int     `json:"moneyIncome" db:"-"`
	Power               int     `json:"power" db:"power"`
	PowerIncome         int     `json:"powerIncome" db:"-"`
	Probes              int     `json:"probes" db:"probes"`
	ProbeCredits        int     `json:"probe_credits" db:"probe_credits"`
	NW                  int     `json:"networth" db:"networth"`
	Honor               int     `json:"honor" db:"honor"`
	NewbieStep          int     `json:"newbie_step" db:"newbie_step"`
	IsNewbie            bool    `json:"is_newbie" db:"is_newbie"`
	LastDailyRewardTick int     `json:"last_daily_reward_tick" db:"last_daily_reward_tick"`
	DailyExploredLand   int     `json:"daily_explored_land" db:"daily_explored_land"`
	DailyDraftedSoldiers int    `json:"daily_drafted_soldiers" db:"daily_drafted_soldiers"`
	VoteKingdomID       string  `json:"vote_kingdom_id" db:"vote_kingdom_id"`

	AutoBuild   bool         `json:"autoBuild" db:"-"`
	AutoExplore int          `json:"autoExplore" db:"-"`
	Newbiemode  int          `json:"newbiemode" db:"-"`
	BotSettings *BotSettings `json:"botSettings" db:"-"`

	LandQueue          []int                    `json:"land_queue"`
	Buildings          map[string]int           `json:"buildings"`
	BuildingQueue      map[string][]int         `json:"building_queue"`
	BuildingTarget     map[string]int           `json:"buildingTarget" db:"-"`
	Military           map[string]int           `json:"military"`
	MilitaryQueue      map[string][]int         `json:"training_queue"`
	MilitaryTarget     map[string]int           `json:"militaryTarget" db:"-"`
	Research           map[string]ResearchTopic `json:"research"`
	ResearchPts        int                      `json:"researchPts" db:"-"`
	ResearchAutoAssign []string                 `json:"auto_research_allocation"`
	Shields            Shields                  `json:"shields"`

	// Raw JSON strings for fast database reading / writing
	RawBuildings              string `db:"buildings"`
	RawBuildingQueue          string `db:"building_queue"`
	RawLandQueue              string `db:"land_queue"`
	RawMilitary               string `db:"military"`
	RawTrainingQueue          string `db:"training_queue"`
	RawResearch               string `db:"research"`
	RawAutoResearchAllocation string `db:"auto_research_allocation"`
	RawShields                string `db:"shields"`
	RawBotSettings            string `db:"-"`
}

// UnmarshalJSONFields unpacks raw JSON strings into structured Go structs.
func (k *Kingdom) UnmarshalJSONFields() {
	if k.KDName == "" {
		k.KDName = k.Name
	}
	if k.LandQueue == nil {
		k.LandQueue = make([]int, 0)
	}
	if k.RawLandQueue != "" {
		var intArr []int
		if err := json.Unmarshal([]byte(k.RawLandQueue), &intArr); err == nil {
			k.LandQueue = intArr
		} else {
			// Might be array of objects [{"acres": 10, "completion_tick": 24}]
			var objArr []map[string]any
			if err := json.Unmarshal([]byte(k.RawLandQueue), &objArr); err == nil {
				total := 0
				for _, item := range objArr {
					if acres, ok := item["acres"].(float64); ok {
						total += int(acres)
					}
				}
				k.LandQueue = []int{total}
			}
		}
	}

	k.Buildings = make(map[string]int)
	k.BuildingQueue = make(map[string][]int)
	k.BuildingTarget = make(map[string]int)
	if k.RawBuildings != "" {
		var raw map[string]any
		if err := json.Unmarshal([]byte(k.RawBuildings), &raw); err == nil {
			for key, val := range raw {
				if key == "queue" {
					if qMap, ok := val.(map[string]any); ok {
						for qk, qv := range qMap {
							if arr, ok := qv.([]any); ok {
								nums := make([]int, len(arr))
								for i, elem := range arr {
									if n, ok := elem.(float64); ok {
										nums[i] = int(n)
									}
								}
								k.BuildingQueue[qk] = nums
							}
						}
					}
				} else if key == "target" {
					if tMap, ok := val.(map[string]any); ok {
						for tk, tv := range tMap {
							if n, ok := tv.(float64); ok {
								k.BuildingTarget[tk] = int(n)
							}
						}
					}
				} else {
					if n, ok := val.(float64); ok {
						k.Buildings[key] = int(n)
					}
				}
			}
		}
	}

	// Handle standalone building_queue column
	if k.RawBuildingQueue != "" && len(k.BuildingQueue) == 0 {
		var qMap map[string][]int
		if err := json.Unmarshal([]byte(k.RawBuildingQueue), &qMap); err == nil {
			k.BuildingQueue = qMap
		}
	}

	k.Military = make(map[string]int)
	k.MilitaryQueue = make(map[string][]int)
	k.MilitaryTarget = make(map[string]int)
	if k.RawMilitary != "" {
		var raw map[string]any
		if err := json.Unmarshal([]byte(k.RawMilitary), &raw); err == nil {
			for key, val := range raw {
				if key == "queue" {
					if qMap, ok := val.(map[string]any); ok {
						for qk, qv := range qMap {
							if arr, ok := qv.([]any); ok {
								nums := make([]int, len(arr))
								for i, elem := range arr {
									if n, ok := elem.(float64); ok {
										nums[i] = int(n)
									}
								}
								k.MilitaryQueue[qk] = nums
							}
						}
					}
				} else if key == "target" {
					if tMap, ok := val.(map[string]any); ok {
						for tk, tv := range tMap {
							if n, ok := tv.(float64); ok {
								k.MilitaryTarget[tk] = int(n)
							}
						}
					}
				} else {
					if n, ok := val.(float64); ok {
						k.Military[key] = int(n)
					}
				}
			}
		}
	}

	// Handle standalone training_queue column
	if k.RawTrainingQueue != "" && len(k.MilitaryQueue) == 0 {
		var qMap map[string][]int
		if err := json.Unmarshal([]byte(k.RawTrainingQueue), &qMap); err == nil {
			k.MilitaryQueue = qMap
		}
	}

	k.Research = make(map[string]ResearchTopic)
	if k.RawResearch != "" {
		var raw map[string]any
		if err := json.Unmarshal([]byte(k.RawResearch), &raw); err == nil {
			for key, val := range raw {
				if m, ok := val.(map[string]any); ok {
					pts := 0
					perc := 0
					if p, ok := m["pts"].(float64); ok {
						pts = int(p)
					}
					if pr, ok := m["perc"].(float64); ok {
						perc = int(pr)
					}
					k.Research[key] = ResearchTopic{Pts: pts, Perc: perc}
				} else if n, ok := val.(float64); ok {
					k.Research[key] = ResearchTopic{Pts: int(n), Perc: 0}
				} else if b, ok := val.(bool); ok {
					perc := 0
					if b {
						perc = 100
					}
					k.Research[key] = ResearchTopic{Pts: 0, Perc: perc}
				}
			}
		}
	}

	k.ResearchAutoAssign = make([]string, 0)
	if k.RawAutoResearchAllocation != "" {
		var arr []string
		if err := json.Unmarshal([]byte(k.RawAutoResearchAllocation), &arr); err == nil {
			k.ResearchAutoAssign = arr
		}
	}

	if k.RawShields != "" {
		_ = json.Unmarshal([]byte(k.RawShields), &k.Shields)
	}

	if k.RawBotSettings != "" {
		var bs BotSettings
		if err := json.Unmarshal([]byte(k.RawBotSettings), &bs); err == nil {
			k.BotSettings = &bs
		}
	}
}

// MarshalJSONFields packs structured Go structs into raw JSON strings for database writing.
func (k *Kingdom) MarshalJSONFields() {
	if k.Name == "" && k.KDName != "" {
		k.Name = k.KDName
	}

	bMap := make(map[string]any)
	for key, val := range k.Buildings {
		bMap[key] = val
	}
	bBytes, _ := json.Marshal(bMap)
	k.RawBuildings = string(bBytes)

	bqBytes, _ := json.Marshal(k.BuildingQueue)
	k.RawBuildingQueue = string(bqBytes)

	mMap := make(map[string]any)
	for key, val := range k.Military {
		mMap[key] = val
	}
	mBytes, _ := json.Marshal(mMap)
	k.RawMilitary = string(mBytes)

	tqBytes, _ := json.Marshal(k.MilitaryQueue)
	k.RawTrainingQueue = string(tqBytes)

	rBytes, _ := json.Marshal(k.Research)
	k.RawResearch = string(rBytes)

	lBytes, _ := json.Marshal(k.LandQueue)
	k.RawLandQueue = string(lBytes)

	raBytes, _ := json.Marshal(k.ResearchAutoAssign)
	k.RawAutoResearchAllocation = string(raBytes)

	sBytes, _ := json.Marshal(k.Shields)
	k.RawShields = string(sBytes)
}

// AdvanceKingdomNewbieStep runs 24 simulation ticks for Newbie Mode progression.
func AdvanceKingdomNewbieStep(kd *Kingdom) {
	for i := 0; i < 24; i++ {
		if kd.State == "dead" {
			break
		}
		currentTick := kd.NewbieStep*24 + i + 1
		ProcessKingdomTick(kd, currentTick)
	}
	kd.NewbieStep++
	if kd.NewbieStep >= 8 {
		kd.IsNewbie = false
		kd.Newbiemode = 0
	} else {
		kd.IsNewbie = true
		kd.Newbiemode = (8 - kd.NewbieStep) * 24
	}
}
