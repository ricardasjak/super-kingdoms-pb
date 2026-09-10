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
			landQueue = {:landQueue},
			buildings = {:buildings},
			military = {:military},
			research = {:research},
			researchPts = {:researchPts},
			researchAutoAssign = {:researchAutoAssign},
			population = {:population},
			popChange = {:popChange},
			money = {:money},
			moneyIncome = {:moneyIncome},
			power = {:power},
			powerIncome = {:powerIncome},
			probes = {:probes},
			nw = {:nw},
			state = {:state},
			autoExplore = {:autoExplore}
		WHERE id = {:id}
	`)

	for _, kd := range kingdoms {
		if kd.State == "dead" {
			continue
		}
		_, err := query.Bind(dbx.Params{
			"id":                 kd.ID,
			"land":               kd.Land,
			"landQueue":          kd.RawLandQueue,
			"buildings":          kd.RawBuildings,
			"military":           kd.RawMilitary,
			"research":           kd.RawResearch,
			"researchPts":        kd.ResearchPts,
			"researchAutoAssign": kd.RawResearchAutoAssign,
			"population":         kd.Population,
			"popChange":          kd.PopChange,
			"money":              kd.Money,
			"moneyIncome":        kd.MoneyIncome,
			"power":              kd.Power,
			"powerIncome":        kd.PowerIncome,
			"probes":             kd.Probes,
			"nw":                 kd.NW,
			"state":              kd.State,
			"autoExplore":        kd.AutoExplore,
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
