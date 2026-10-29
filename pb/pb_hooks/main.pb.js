/// <reference path="../../pb_data/types.d.ts" />

// ─── Bootstrap ───────────────────────────────────────────────────────────────
onBootstrap((e) => {
  e.next()
  console.log("Super Kingdoms PB instance started.")

  try {
    const users = $app.findCollectionByNameOrId("users")
    const devAccounts = [
      { email: "test@example.com", pass: "password123", name: "Commander" },
      { email: "admin@superkingdoms.internal", pass: "password123", name: "Admin" }
    ]

    for (let i = 0; i < devAccounts.length; i++) {
      const acc = devAccounts[i]
      try {
        $app.findAuthRecordByEmail("users", acc.email)
      } catch {
        const u = new Record(users)
        u.setEmail(acc.email)
        u.setPassword(acc.pass)
        u.set("name", acc.name)
        $app.save(u)
        console.log(`[bootstrap] Seeded dev user: ${acc.email}`)
      }
    }
  } catch (err) {
    console.log("[bootstrap] Dev user seed notice: " + err)
  }
})

// ─── SPA Fallback (BrowserRouter support) ────────────────────────────────────
// Must be last — catch-all serves index.html for all unmatched routes
// so React Router handles client-side navigation after initial load.
routerAdd("GET", "/{path...}", (e) => {
  return e.file(`${__hooks}/../pb_public/index.html`)
})
