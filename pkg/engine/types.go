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

// BotSettings holds AI configuration.
type BotSettings struct {
	DefenseRatio float64 `json:"defenseRatio"`
	GrowthFocus  string  `json:"growthFocus"`
}

// Kingdom represents the full simulation state of a realm.
type Kingdom struct {
	ID                 string                   `json:"id" db:"id"`
	KDName             string                   `json:"kdName" db:"kdName"`
	State              string                   `json:"state" db:"state"`
	Land               int                      `json:"land" db:"land"`
	LandQueue          []int                    `json:"landQueue"`
	Buildings          map[string]int           `json:"buildings"`
	BuildingQueue      map[string][]int         `json:"buildingQueue"`
	BuildingTarget     map[string]int           `json:"buildingTarget"`
	Military           map[string]int           `json:"military"`
	MilitaryQueue      map[string][]int         `json:"militaryQueue"`
	MilitaryTarget     map[string]int           `json:"militaryTarget"`
	Research           map[string]ResearchTopic `json:"research"`
	ResearchPts        int                      `json:"researchPts" db:"researchPts"`
	ResearchAutoAssign []string                 `json:"researchAutoAssign"`
	Population         int                      `json:"population" db:"population"`
	PopChange          int                      `json:"popChange" db:"popChange"`
	Money              int                      `json:"money" db:"money"`
	MoneyIncome        int                      `json:"moneyIncome" db:"moneyIncome"`
	Power              int                      `json:"power" db:"power"`
	PowerIncome        int                      `json:"powerIncome" db:"powerIncome"`
	Probes             int                      `json:"probes" db:"probes"`
	NW                 int                      `json:"nw" db:"nw"`
	AutoBuild          bool                     `json:"autoBuild" db:"autoBuild"`
	AutoExplore        int                      `json:"autoExplore" db:"autoExplore"`
	BotSettings        *BotSettings             `json:"botSettings"`

	// Raw JSON strings for fast database reading / writing
	RawBuildings          string `db:"buildings"`
	RawMilitary           string `db:"military"`
	RawResearch           string `db:"research"`
	RawLandQueue          string `db:"landQueue"`
	RawResearchAutoAssign string `db:"researchAutoAssign"`
	RawBotSettings        string `db:"botSettings"`
}

// UnmarshalJSONFields unpacks raw JSON strings into structured Go structs.
func (k *Kingdom) UnmarshalJSONFields() {
	if k.LandQueue == nil {
		k.LandQueue = make([]int, 0)
	}
	if k.RawLandQueue != "" {
		_ = json.Unmarshal([]byte(k.RawLandQueue), &k.LandQueue)
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

	k.Research = make(map[string]ResearchTopic)
	if k.RawResearch != "" {
		_ = json.Unmarshal([]byte(k.RawResearch), &k.Research)
	}

	k.ResearchAutoAssign = make([]string, 0)
	if k.RawResearchAutoAssign != "" {
		_ = json.Unmarshal([]byte(k.RawResearchAutoAssign), &k.ResearchAutoAssign)
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
	bMap := make(map[string]any)
	for key, val := range k.Buildings {
		bMap[key] = val
	}
	bMap["queue"] = k.BuildingQueue
	if len(k.BuildingTarget) > 0 {
		bMap["target"] = k.BuildingTarget
	}
	bBytes, _ := json.Marshal(bMap)
	k.RawBuildings = string(bBytes)

	mMap := make(map[string]any)
	for key, val := range k.Military {
		mMap[key] = val
	}
	mMap["queue"] = k.MilitaryQueue
	if len(k.MilitaryTarget) > 0 {
		mMap["target"] = k.MilitaryTarget
	}
	mBytes, _ := json.Marshal(mMap)
	k.RawMilitary = string(mBytes)

	rBytes, _ := json.Marshal(k.Research)
	k.RawResearch = string(rBytes)

	lBytes, _ := json.Marshal(k.LandQueue)
	k.RawLandQueue = string(lBytes)

	raBytes, _ := json.Marshal(k.ResearchAutoAssign)
	k.RawResearchAutoAssign = string(raBytes)
}
