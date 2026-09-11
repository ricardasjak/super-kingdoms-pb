/// <reference path="../../pb_data/types.d.ts" />

// ─── Bootstrap ───────────────────────────────────────────────────────────────
onBootstrap((e) => {
  e.next()
  console.log("Super Kingdoms PB instance started.")
})

// ─── SPA Fallback (BrowserRouter support) ────────────────────────────────────
// Must be last — catch-all serves index.html for all unmatched routes
// so React Router handles client-side navigation after initial load.
routerAdd("GET", "/{path...}", (e) => {
  return e.file(`${__hooks}/../pb_public/index.html`)
})
