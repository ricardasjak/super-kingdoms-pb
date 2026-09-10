package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

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
				records, err := re.App.FindRecordsByFilter("gameStatus", "", "", 1, 0)
				if err == nil && len(records) > 0 {
					statusRecord = records[0]
				}

				currentTick := 0
				endTick := 960
				if statusRecord != nil {
					currentTick = statusRecord.GetInt("currentTick")
					endTick = statusRecord.GetInt("endTick")
					if endTick <= 0 {
						endTick = 960
					}
				}

				if statusRecord != nil && statusRecord.GetString("status") != "in-progress" {
					return re.JSON(400, map[string]any{
						"error": "Ticks run only while the game phase is in-progress (current: \"" + statusRecord.GetString("status") + "\").",
					})
				}

				if currentTick >= endTick {
					if statusRecord != nil {
						statusRecord.Set("status", "stopped")
						_ = re.App.Save(statusRecord)
					}
					return re.JSON(400, map[string]any{
						"error": "Round has finished. Restart the game to continue.",
					})
				}

				nextTick := currentTick + 1
				if statusRecord != nil {
					statusRecord.Set("currentTick", nextTick)
					statusRecord.Set("status", "in-progress")
					_ = re.App.Save(statusRecord)
				}

				// Load all kingdoms directly via fast dbx mapping
				var kingdoms []*engine.Kingdom
				err = re.App.DB().Select(
					"id", "kdName", "state", "land", "landQueue", "buildings", "military", "research",
					"researchPts", "researchAutoAssign", "population", "popChange", "money",
					"moneyIncome", "power", "powerIncome", "probes", "nw", "autoBuild", "autoExplore", "botSettings",
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
