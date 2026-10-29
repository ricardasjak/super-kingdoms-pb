package engine

import (
	"runtime"
	"sync"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/core"
)

// SimulateKingdomsParallel executes simulation logic across all available CPU cores.
func SimulateKingdomsParallel(kingdoms []*Kingdom, currentTick int) int64 {
	t0 := time.Now()
	total := len(kingdoms)
	if total == 0 {
		return 0
	}

	numWorkers := runtime.NumCPU()
	if numWorkers > total {
		numWorkers = total
	}
	if numWorkers <= 0 {
		numWorkers = 1
	}

	chunkSize := (total + numWorkers - 1) / numWorkers
	var wg sync.WaitGroup

	for w := 0; w < numWorkers; w++ {
		start := w * chunkSize
		end := start + chunkSize
		if start >= total {
			break
		}
		if end > total {
			end = total
		}

		wg.Add(1)
		go func(slice []*Kingdom) {
			defer wg.Done()
			for _, kd := range slice {
				if kd.State == "dead" {
					continue
				}
				kd.UnmarshalJSONFields()
				ProcessKingdomTick(kd, currentTick)
				kd.MarshalJSONFields()
			}
		}(kingdoms[start:end])
	}

	wg.Wait()
	return time.Since(t0).Milliseconds()
}

// SaveKingdomsBatch commits updated kingdom states in a single high-speed SQLite transaction.
func SaveKingdomsBatch(app core.App, kingdoms []*Kingdom) (int64, error) {
	t0 := time.Now()
	if len(kingdoms) == 0 {
		return 0, nil
	}

	err := app.RunInTransaction(func(txApp core.App) error {
		query := txApp.DB().NewQuery(`
		UPDATE kingdoms SET
			land = {:land},
			free_land = {:free_land},
			population = {:population},
			money = {:money},
			power = {:power},
			probes = {:probes},
			probe_credits = {:probe_credits},
			networth = {:networth},
			honor = {:honor},
			newbie_step = {:newbie_step},
			is_newbie = {:is_newbie},
			state = {:state},
			buildings = {:buildings},
			building_queue = {:building_queue},
			land_queue = {:land_queue},
			military = {:military},
			training_queue = {:training_queue},
			research = {:research},
			auto_research_allocation = {:auto_research_allocation},
			shields = {:shields}
		WHERE id = {:id}
	`)

	for _, kd := range kingdoms {
		if kd.State == "dead" {
			continue
		}
		_, err := query.Bind(dbx.Params{
			"id":                       kd.ID,
			"land":                     kd.Land,
			"free_land":                kd.FreeLand,
			"population":               kd.Population,
			"money":                    kd.Money,
			"power":                    kd.Power,
			"probes":                   kd.Probes,
			"probe_credits":            kd.ProbeCredits,
			"networth":                 kd.NW,
			"honor":                    kd.Honor,
			"newbie_step":              kd.NewbieStep,
			"is_newbie":                kd.IsNewbie,
			"state":                    kd.State,
			"buildings":                kd.RawBuildings,
			"building_queue":          kd.RawBuildingQueue,
			"land_queue":              kd.RawLandQueue,
			"military":                kd.RawMilitary,
			"training_queue":          kd.RawTrainingQueue,
			"research":                kd.RawResearch,
			"auto_research_allocation": kd.RawAutoResearchAllocation,
			"shields":                 kd.RawShields,
		}).Execute()
		if err != nil {
			return err
		}
	}
	return nil
})
if err != nil {
	return 0, err
}

return time.Since(t0).Milliseconds(), nil
}
