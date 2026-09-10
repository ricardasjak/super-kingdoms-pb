/// <reference path="../../pb_data/types.d.ts" />

// ─── Bootstrap ───────────────────────────────────────────────────────────────
onBootstrap((e) => {
  e.next()
  console.log("Super Kingdoms PB instance started.")

  // A server restart always pauses the galaxy: existing rounds resume as
  // "stopped" and an admin must explicitly re-open them via POST /api/game/status.
  // (Fresh installs have no gameStatus record yet — the lazy-create in
  // GET /api/game/status still defaults those to "registration".)
  try {
    const records = $app.findAllRecords("gameStatus")
    for (let i = 0; i < records.length; i++) {
      if (records[i].getString("status") !== "stopped") {
        records[i].set("status", "stopped")
        $app.save(records[i])
      }
    }
    if (records.length > 0) {
      console.log("Game status reset to 'stopped' on startup.")
    }
  } catch (err) {
    console.log("Game status reset skipped:", err)
  }
})

// ─── SPA Fallback (BrowserRouter support) ────────────────────────────────────
// Must be last — catch-all serves index.html for all unmatched routes
// so React Router handles client-side navigation after initial load.
routerAdd("GET", "/{path...}", (e) => {
  return e.file(`${__hooks}/../pb_public/index.html`)
})
