package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/plugins/ghupdate"
	"github.com/pocketbase/pocketbase/plugins/jsvm"
	"github.com/pocketbase/pocketbase/plugins/migratecmd"
	"github.com/pocketbase/pocketbase/tools/hook"
	"github.com/pocketbase/pocketbase/tools/osutils"

	"super-kingdoms-pb/pkg/engine"
)

func main() {
	app := pocketbase.New()

	// ---------------------------------------------------------------
	// Standard PocketBase plugin flags:
	// ---------------------------------------------------------------

	var hooksDir string
	app.RootCmd.PersistentFlags().StringVar(
		&hooksDir,
		"hooksDir",
		"",
		"the directory with the JS app hooks",
	)

	var hooksWatch bool
	app.RootCmd.PersistentFlags().BoolVar(
		&hooksWatch,
		"hooksWatch",
		true,
		"auto restart the app on pb_hooks file change; it has no effect on Windows",
	)

	var hooksPool int
	app.RootCmd.PersistentFlags().IntVar(
		&hooksPool,
		"hooksPool",
		15,
		"the total prewarm goja.Runtime instances for the JS app hooks execution",
	)

	var migrationsDir string
	app.RootCmd.PersistentFlags().StringVar(
		&migrationsDir,
		"migrationsDir",
		"",
		"the directory with the user defined migrations",
	)

	var automigrate bool
	app.RootCmd.PersistentFlags().BoolVar(
		&automigrate,
		"automigrate",
		true,
		"enable/disable auto migrations",
	)

	var publicDir string
	app.RootCmd.PersistentFlags().StringVar(
		&publicDir,
		"publicDir",
		defaultPublicDir(),
		"the directory to serve static files",
	)

	var indexFallback bool
	app.RootCmd.PersistentFlags().BoolVar(
		&indexFallback,
		"indexFallback",
		true,
		"fallback the request to index.html on missing static path, e.g. when pretty urls are used with SPA",
	)

	_ = app.RootCmd.ParseFlags(os.Args[1:])

	// ---------------------------------------------------------------
	// Plugins and hooks:
	// ---------------------------------------------------------------

	// load jsvm (pb_hooks and pb_migrations)
	jsvm.MustRegister(app, jsvm.Config{
		MigrationsDir: migrationsDir,
		HooksDir:      hooksDir,
		HooksWatch:    hooksWatch,
		HooksPoolSize: hooksPool,
	})

	// migrate command (with js templates)
	migratecmd.MustRegister(app, app.RootCmd, migratecmd.Config{
		TemplateLang: migratecmd.TemplateLangJS,
		Automigrate:  automigrate,
		Dir:          migrationsDir,
	})

	// GitHub selfupdate
	ghupdate.MustRegister(app, app.RootCmd, ghupdate.Config{})

	// Static route to serve files from the provided public dir (SPA)
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			if !e.Router.HasRoute(http.MethodGet, "/{path...}") {
				e.Router.GET("/{path...}", apis.Static(os.DirFS(publicDir), indexFallback))
			}
			return e.Next()
		},
		Priority: 999,
	})

	// Register high-performance native Go tick simulation endpoint
	app.OnServe().Bind(&hook.Handler[*core.ServeEvent]{
		Func: func(e *core.ServeEvent) error {
			e.Router.POST("/api/game/advance-tick", func(re *core.RequestEvent) error {
				t0 := time.Now()

				// Check round lifecycle
				var statusRecord *core.Record
				records, err := re.App.FindRecordsByFilter("game_status", "", "", 1, 0)
				if err == nil && len(records) > 0 {
					statusRecord = records[0]
				}

				currentTick := 0
				maxTicks := 960
				if statusRecord != nil {
					currentTick = statusRecord.GetInt("current_tick")
					maxTicks = statusRecord.GetInt("max_ticks")
					if maxTicks <= 0 {
						maxTicks = 960
					}
				}

				if statusRecord != nil && (statusRecord.GetString("phase") != "pvp" || statusRecord.GetBool("is_paused")) {
					return re.JSON(400, map[string]any{
						"error": "Ticks run only while the game phase is in-progress (pvp).",
					})
				}

				if currentTick >= maxTicks {
					if statusRecord != nil {
						statusRecord.Set("phase", "concluded")
						_ = re.App.Save(statusRecord)
					}
					return re.JSON(400, map[string]any{
						"error": "Round has finished. Restart the game to continue.",
					})
				}

				nextTick := currentTick + 1
				if statusRecord != nil {
					statusRecord.Set("current_tick", nextTick)
					_ = re.App.Save(statusRecord)
				}

				// Load all kingdoms directly via fast dbx mapping
				var kingdoms []*engine.Kingdom
				err = re.App.DB().Select(
					"id", "user", "name", "planet_type", "sector", "sector_slot", "state",
					"trouble_until_tick", "ma_protection", "land", "free_land", "population",
					"money", "power", "probes", "probe_credits", "networth", "honor",
					"newbie_step", "is_newbie", "last_daily_reward_tick", "daily_explored_land",
					"daily_drafted_soldiers", "vote_kingdom_id",
					"shields", "buildings", "building_queue", "land_queue", "military",
					"training_queue", "research", "auto_research_allocation",
				).From("kingdoms").All(&kingdoms)
				if err != nil {
					return re.JSON(500, map[string]any{
						"error": "Failed to query kingdoms: " + err.Error(),
					})
				}

				// Parallel multi-core CPU simulation across goroutines
				simTimeMs := engine.SimulateKingdomsParallel(kingdoms, nextTick)

				// High-speed prepared batch SQLite transaction
				dbTimeMs, err := engine.SaveKingdomsBatch(re.App, kingdoms)
				if err != nil {
					return re.JSON(500, map[string]any{
						"error": "Failed to commit kingdoms batch: " + err.Error(),
					})
				}

				totalTimeMs := time.Since(t0).Milliseconds()

				return re.JSON(200, map[string]any{
					"success":          true,
					"currentTick":      nextTick,
					"processedCount":   len(kingdoms),
					"executionTimeMs":  totalTimeMs,
					"totalLogicTimeMs": simTimeMs,
					"dbSaveTimeMs":     dbTimeMs,
				})
			})

			// Handle single-kingdom newbie-mode step advance (24 ticks per step)
			handleNewbieStep := func(re *core.RequestEvent) error {
				if re.Auth == nil {
					return re.JSON(401, map[string]any{
						"error": "Authentication required",
					})
				}

				kingdom, err := re.App.FindFirstRecordByFilter(
					"kingdoms",
					"user = {:userId}",
					dbx.Params{"userId": re.Auth.Id},
				)
				if err != nil {
					return re.JSON(404, map[string]any{
						"error": "Kingdom not found",
					})
				}
				if kingdom.GetString("state") == "dead" {
					return re.JSON(400, map[string]any{
						"error": "Cannot self-tick: kingdom has fallen",
					})
				}

				var statusRecord *core.Record
				statusRecords, err := re.App.FindRecordsByFilter("game_status", "", "", 1, 0)
				if err == nil && len(statusRecords) > 0 {
					statusRecord = statusRecords[0]
				}

				if statusRecord != nil && (statusRecord.GetString("phase") == "concluded" || statusRecord.GetBool("is_paused")) {
					return re.JSON(400, map[string]any{
						"error": "Self-ticking is not available while game is paused or concluded.",
					})
				}

				newbieStep := kingdom.GetInt("newbie_step")
				isNewbie := kingdom.GetBool("is_newbie")
				if !isNewbie || newbieStep >= 8 {
					return re.JSON(400, map[string]any{
						"error": "Newbie mode exhausted: all 8 steps have been completed.",
					})
				}

				var kingdoms []*engine.Kingdom
				err = re.App.DB().Select(
					"id", "user", "name", "planet_type", "sector", "sector_slot", "state",
					"trouble_until_tick", "ma_protection", "land", "free_land", "population",
					"money", "power", "probes", "probe_credits", "networth", "honor",
					"newbie_step", "is_newbie", "last_daily_reward_tick", "daily_explored_land",
					"daily_drafted_soldiers", "vote_kingdom_id",
					"shields", "buildings", "building_queue", "land_queue", "military",
					"training_queue", "research", "auto_research_allocation",
				).From("kingdoms").Where(dbx.HashExp{"id": kingdom.Id}).All(&kingdoms)
				if err != nil || len(kingdoms) == 0 {
					return re.JSON(404, map[string]any{
						"error": "Kingdom not found",
					})
				}

				kd := kingdoms[0]
				kd.UnmarshalJSONFields()
				engine.AdvanceKingdomNewbieStep(kd)
				kd.MarshalJSONFields()

				err = re.App.RunInTransaction(func(txApp core.App) error {
					_, err := txApp.DB().NewQuery(`
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
				`).Bind(dbx.Params{
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
					return err
				})
				if err != nil {
					return re.JSON(500, map[string]any{
						"error": "Failed to save kingdom: " + err.Error(),
					})
				}

				updatedKingdom, err := re.App.FindRecordById("kingdoms", kd.ID)
				if err != nil {
					return re.JSON(500, map[string]any{
						"error": "Failed to reload kingdom: " + err.Error(),
					})
				}

				return re.JSON(200, map[string]any{
					"success":       true,
					"step":          kd.NewbieStep,
					"ticksAdvanced": 24,
					"newbiemode":    (8 - kd.NewbieStep) * 24,
					"isNewbie":      kd.IsNewbie,
					"kingdom":       updatedKingdom,
				})
			}

			// Register POST /api/kingdoms/self-tick/step and POST /api/kingdoms/self-tick
			e.Router.POST("/api/kingdoms/self-tick/step", handleNewbieStep)
			e.Router.POST("/api/kingdoms/self-tick", handleNewbieStep)

			// Register update-bot-profile endpoint.
			e.Router.POST("/api/kingdoms/update-bot-profile", func(re *core.RequestEvent) error {
				if re.Auth == nil {
					return re.JSON(401, map[string]any{"error": "Authentication required"})
				}

				var body struct {
					BotSettings *engine.BotSettings `json:"botSettings"`
				}
				if err := re.BindBody(&body); err != nil {
					return re.JSON(400, map[string]any{"error": "Invalid request body"})
				}

				kingdom, err := re.App.FindFirstRecordByFilter(
					"kingdoms",
					"user = {:userId}",
					dbx.Params{"userId": re.Auth.Id},
				)
				if err != nil {
					return re.JSON(404, map[string]any{"error": "Kingdom not found"})
				}

				var kingdoms []*engine.Kingdom
				err = re.App.DB().Select(
					"id", "user", "name", "planet_type", "sector", "sector_slot", "state",
					"trouble_until_tick", "ma_protection", "land", "free_land", "population",
					"money", "power", "probes", "probe_credits", "networth", "honor",
					"newbie_step", "is_newbie", "last_daily_reward_tick", "daily_explored_land",
					"daily_drafted_soldiers", "vote_kingdom_id",
					"shields", "buildings", "building_queue", "land_queue", "military",
					"training_queue", "research", "auto_research_allocation",
				).From("kingdoms").Where(dbx.HashExp{"id": kingdom.Id}).All(&kingdoms)
				if err != nil || len(kingdoms) == 0 {
					return re.JSON(404, map[string]any{"error": "Kingdom not found"})
				}

				kd := kingdoms[0]
				kd.UnmarshalJSONFields()
				kd.BotSettings = body.BotSettings

				if kd.BotSettings != nil && kd.BotSettings.HasProfile() {
					engine.HandleBotParams(kd)
				}
				kd.MarshalJSONFields()

				rawBotSettings := ""
				if body.BotSettings != nil {
					bsBytes, _ := json.Marshal(body.BotSettings)
					rawBotSettings = string(bsBytes)
				}

				err = re.App.RunInTransaction(func(txApp core.App) error {
					_, err := txApp.DB().NewQuery(`
					UPDATE kingdoms SET
						buildings = {:buildings},
						military = {:military}
					WHERE id = {:id}
					`).Bind(dbx.Params{
						"id":        kd.ID,
						"buildings": kd.RawBuildings,
						"military":  kd.RawMilitary,
					}).Execute()
					return err
				})
				if err != nil {
					return re.JSON(500, map[string]any{"error": "Failed to update bot profile: " + err.Error() + rawBotSettings})
				}

				updatedRecord, err := re.App.FindRecordById("kingdoms", kingdom.Id)
				if err == nil {
					return re.JSON(200, map[string]any{
						"success": true,
						"kingdom": updatedRecord,
					})
				}
				return re.JSON(200, map[string]any{"success": true})
			})

			return e.Next()
		},
		Priority: 100, // Execute before catch-all static route
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func defaultPublicDir() string {
	if osutils.IsProbablyGoRun() {
		return "./pb_public"
	}
	return filepath.Join(os.Args[0], "../pb_public")
}
