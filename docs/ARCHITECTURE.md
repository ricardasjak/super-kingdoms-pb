# Super Kingdoms — PocketBase + React SPA Architecture Document

> **AI Context Document** — Authoritative reference for all architecture, DX, and deployment decisions. Read this before touching hooks, migrations, build scripts, or any PocketBase-related code.

---

## 1. Project Overview

| Item | Value |
|---|---|
| Frontend | React 19 + Vite 8 + TypeScript + React Router v7 |
| Backend | PocketBase v0.40.2 (single binary, embedded SQLite) |
| Auth | PocketBase built-in `users` collection |
| Business Logic | PocketBase JS hooks — plain `.pb.js` with PB's built-in type declarations |
| PB SDK (client) | `pocketbase` npm v0.28 |
| PB client singleton | `src/lib/pocketbase.ts` → exported `pb` instance |
| Auth context | `src/context/auth-context.tsx` (wraps `pb.authStore.onChange`) |
| PB URL (client) | `VITE_POCKETBASE_URL` env var; auto-detects `window.location.origin` in prod |

---

## 2. File Naming Convention ✅

All source files use **kebab-case with dot-notation suffixes** — no PascalCase filenames.

| Type | Example |
|---|---|
| Page component | `home.page.tsx` |
| Layout component | `layout.tsx` |
| Navbar component | `navbar.tsx` |
| Auth context | `auth-context.tsx`, `auth-context-def.ts` |
| Hook | `use-auth.ts` |
| Utility | `game-logic.util.ts` |
| Type file | `pb.model.ts` |
| PB hook | `main.pb.js`, `attack.pb.js` |

> **AI NOTE**: Component exports remain PascalCase (`export function HomePage`), only filenames are kebab-case. Existing files (`HomePage.tsx`, `AuthContext.tsx`, etc.) should be renamed when touched.

---

## 3. Repository Layout ✅

```
super-kingdoms-pb/
├── pb/                              ← PocketBase runtime root
│   ├── pocketbase                   ← binary (gitignored — downloaded by setup.sh)
│   ├── pb_data/                     ← dev SQLite DB (gitignored — live data)
│   ├── pb_migrations/               ← SQL migration files (COMMITTED to git)
│   ├── pb_hooks/                    ← JS hook files (COMMITTED to git)
│   │   ├── main.pb.js               ← entry point, loaded by PocketBase
│   │   ├── routes/
│   │   │   ├── attack.pb.js
│   │   │   ├── trade.pb.js
│   │   │   └── events.pb.js
│   │   └── utils/
│   │       └── game-logic.js        ← CJS module, loaded via require()
│   └── pb_public/                   ← built SPA output (gitignored — regenerated on build)
├── pb_prod_data/                    ← prod SQLite DB for local prod testing (gitignored)
├── pb_test_data/                    ← test SQLite DB (gitignored — wiped before each test run)
├── src/                             ← React SPA (TypeScript)
│   ├── lib/
│   │   └── pocketbase.ts
│   ├── types/
│   │   └── pb.model.ts              ← GENERATED from schema (COMMITTED to git)
│   ├── context/
│   │   ├── auth-context.tsx
│   │   ├── auth-context-def.ts
│   │   └── use-auth.ts
│   ├── pages/
│   │   ├── home.page.tsx
│   │   ├── login.page.tsx
│   │   └── register.page.tsx
│   └── components/
│       ├── navbar.tsx
│       └── layout.tsx
├── tests/                           ← API integration tests (Vitest)
│   ├── setup/
│   │   ├── global-setup.ts          ← starts PB test instance before test suite
│   │   ├── global-teardown.ts       ← kills PB test instance after test suite
│   │   └── helpers.ts               ← createTestUser(), seedKingdom(), resetDb(), etc.
│   └── api/
│       ├── auth.test.ts
│       ├── kingdoms.test.ts
│       └── attack.test.ts
├── scripts/
│   ├── setup.sh                     ← idempotent: downloads PB binary if missing
│   └── gen-types.sh                 ← generates src/types/pb.model.ts
├── vitest.config.ts                 ← separate config for API tests
├── .env                             ← dev defaults (committed, no secrets)
├── .env.local                       ← local overrides (gitignored)
├── .env.production                  ← prod build config (committed, VITE_POCKETBASE_URL=)
├── vite.config.ts
└── package.json
```

**`.gitignore` additions required:**
```gitignore
# PocketBase
pb/pocketbase
pb/pb_data/
pb/pb_public/
pb_prod_data/
pb_test_data/
```

---

## 4. PocketBase Setup ✅

### 4.1 — Version

**Target: PocketBase v0.40.2** (latest at time of writing). Update `PB_VERSION` in `setup.sh` when upgrading.

Keep PB npm client in sync: `pocketbase` npm package version should be compatible with server version.

### 4.2 — Idempotent Setup Script

`scripts/setup.sh` — **never touches `pb_data/` or `pb_prod_data/`**:

```bash
#!/bin/bash
set -e

PB_VERSION="0.40.2"
PB_BIN="pb/pocketbase"

# Only download if binary is missing or wrong version
if [ ! -f "$PB_BIN" ] || ! "$PB_BIN" --version 2>/dev/null | grep -q "$PB_VERSION"; then
  echo "→ Downloading PocketBase v$PB_VERSION..."
  OS=$(uname -s | tr '[:upper:]' '[:lower:]')
  ARCH=$(uname -m | sed 's/x86_64/amd64/' | sed 's/aarch64/arm64/')
  URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
  mkdir -p pb
  curl -L "$URL" -o /tmp/pb.zip
  unzip -o /tmp/pb.zip -d pb pocketbase
  chmod +x "$PB_BIN"
  rm /tmp/pb.zip
  echo "✓ PocketBase v$PB_VERSION ready."
else
  echo "✓ PocketBase v$PB_VERSION already present."
fi

# Ensure directories exist (safe to run repeatedly)
mkdir -p pb/pb_hooks/routes pb/pb_hooks/utils pb/pb_migrations pb/pb_public pb_prod_data
echo "✓ Setup complete."
```

> **AI NOTE**: Run `npm run setup` on fresh clone and whenever `PB_VERSION` changes. Safe to run at any time — never overwrites data or customisations.

### 4.3 — Explicit Directory Flags

Always pass all directory flags to the `pocketbase serve` command so it works regardless of CWD:

```
--dir              path to pb_data    (dev: pb/pb_data  | prod: pb_prod_data)
--publicDir        path to pb_public  (always: pb/pb_public)
--hooksDir         path to pb_hooks   (always: pb/pb_hooks)
--migrationsDir    path to pb_migrations (always: pb/pb_migrations)
```

---

## 5. PocketBase JS Hooks ✅

### 5.1 — Language & Tooling

**Plain `.pb.js` files with PocketBase's built-in TypeScript declarations for IDE support.**

- No TypeScript compilation, no esbuild, no build step for hooks
- All business logic lives inside the PB instance — no external services
- PocketBase auto-reloads hook files on change (on UNIX systems)

**Getting IDE type completion**: PocketBase generates `pb/pb_data/types.d.ts` automatically. Reference it at the top of every hook file:

```javascript
/// <reference path="../../pb_data/types.d.ts" />
```

If your editor still doesn't show types, rename the file to `.pb.ts` — PocketBase supports both `.pb.js` and `.pb.ts` extensions (it still executes them as JS).

### 5.2 — Runtime: GOJA (ES5 + most ES6)

PocketBase v0.40.2 uses the [GOJA](https://github.com/dop251/goja) JavaScript engine. Key facts:

| Capability | Status |
|---|---|
| ES6 (arrow functions, let/const, template literals) | ✅ Supported |
| `async/await` | ✅ Supported (ES6+ in GOJA) |
| `setTimeout` / `setInterval` | ❌ **Not supported** |
| `fetch`, `window`, `fs`, Node.js APIs | ❌ **Not available** |
| HTTP requests | ✅ Use `$http.send()` |
| npm ESM packages | ❌ Not directly — must bundle to CJS first |
| npm CJS packages | ✅ Via `require()` from `node_modules` |

### 5.3 — Critical: Handler Scope Isolation ⚠️

**Each handler function executes in its own isolated context.** Variables declared in the outer file scope are **not visible** inside handlers. This is the most common source of bugs:

```javascript
// ❌ WRONG — name is undefined inside the handler
const name = "test"
onBootstrap((e) => {
  e.next()
  console.log(name) // undefined!
})
```

**To share code between handlers, use `require()` inside the handler:**

```javascript
// ✅ CORRECT — load shared module inside the handler
onBootstrap((e) => {
  e.next()
  const utils = require(`${__hooks}/utils/game-logic.js`)
  utils.doSomething()
})
```

### 5.4 — Shared Code with `require()`

Utility files use CommonJS `module.exports`:

```javascript
// pb/pb_hooks/utils/game-logic.js
/// <reference path="../../../pb_data/types.d.ts" />

/**
 * Apply damage to a kingdom record.
 * @param {core.Record} kingdom
 * @param {number} damage
 */
module.exports.applyDamage = function(kingdom, damage) {
  const currentHp = kingdom.getInt("hp")
  const newHp = Math.max(0, currentHp - damage)
  kingdom.set("hp", newHp)
  return { survived: newHp > 0, remainingHp: newHp }
}
```

### 5.5 — Hook File Pattern

```javascript
// pb/pb_hooks/routes/attack.pb.js
/// <reference path="../../../pb_data/types.d.ts" />

routerAdd("POST", "/api/kingdoms/attack", (e) => {
  // Load shared utils inside handler (required due to scope isolation)
  const gameLogic = require(`${__hooks}/utils/game-logic.js`)

  // Parse body
  const data = e.requestInfo().body

  // Require auth
  const authRecord = e.requestInfo().auth
  if (!authRecord) {
    throw new BadRequestError("Unauthenticated")
  }

  // Read records
  const attacker = $app.findRecordById("kingdoms", data.attackerId)
  const target   = $app.findRecordById("kingdoms", data.targetId)

  // Apply game logic
  const result = gameLogic.applyDamage(target, 10)
  $app.save(target)

  return e.json(200, { success: true, ...result })
})
```

```javascript
// pb/pb_hooks/main.pb.js
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
```

> **AI NOTE**: The SPA fallback route in `main.pb.js` **must be registered last** after all API routes. PocketBase router is first-match-wins — `/api/*` routes registered before this catch-all will still take precedence.

### 5.6 — Available Globals

| Global | Purpose | Docs |
|---|---|---|
| `$app` | Main app instance — find/save records, settings | [JSVM ref](https://pocketbase.io/jsvm/modules/_app.html) |
| `$app.findRecordById(collection, id)` | Fetch a single record | |
| `$app.findFirstRecordByFilter(col, filter, ...params)` | Filtered record lookup | |
| `$app.save(record)` | Insert or update a record | |
| `$app.delete(record)` | Delete a record | |
| `$apis.*` | Routing helpers and auth middlewares | [JSVM ref](https://pocketbase.io/jsvm/modules/_apis.html) |
| `$os.*` | OS-level ops (file system, shell commands) | [JSVM ref](https://pocketbase.io/jsvm/modules/_os.html) |
| `$security.*` | JWTs, random strings, AES, hashing | [JSVM ref](https://pocketbase.io/jsvm/modules/_security.html) |
| `$http.send({ url, method, body, headers })` | Outgoing HTTP requests | |
| `__hooks` | Absolute path to `pb_hooks/` directory | |
| `routerAdd(method, path, handler)` | Register custom HTTP endpoint | |
| `onBootstrap(fn)` | App startup hook | |
| `onRecordCreate(fn, ...collections)` | Before/after record create | |
| `onRecordUpdate(fn, ...collections)` | Before/after record update | |
| `onRecordDelete(fn, ...collections)` | Before/after record delete | |

> **AI NOTE**: Full JSVM reference: https://pocketbase.io/jsvm/index.html — always check this for exact method signatures on v0.40.2.

---

## 6. Schema Migrations ✅

### Hybrid approach: Admin UI as primary, code-first for AI agents

#### Admin UI → Auto-generated Migrations (Normal workflow)

When PB is running with `--dev`, every schema change made via the Admin UI automatically writes a migration file to `pb/pb_migrations/`. These are committed to git.

Workflow:
1. `npm run dev` (PB starts in dev mode)
2. Open Admin UI at `http://127.0.0.1:8090/_/`
3. Create / modify collections
4. PB writes `pb/pb_migrations/<timestamp>_<name>.js` automatically
5. Run `npm run gen:types` to regenerate `src/types/pb.model.ts`
6. Commit both files

On fresh deployment, PB automatically runs all pending migrations on startup.

#### Code-First Migrations (AI agent workflow)

When an AI agent creates or alters collections:

```javascript
// pb/pb_migrations/1725400000_add_kingdoms.js
migrate((db) => {
  // Create collection
  const kingdoms = new Collection({
    name: "kingdoms",
    type: "base",
    fields: [
      { name: "name",  type: "text",   required: true },
      { name: "hp",    type: "number", required: true, min: 0 },
      { name: "gold",  type: "number", required: true, min: 0 },
      { name: "owner", type: "relation", collectionId: "_pb_users_auth_", required: true }
    ]
  })
  db.saveCollection(kingdoms)
}, (db) => {
  // Rollback
  db.deleteCollection("kingdoms")
})
```

> **AI NOTE**: Migration filename prefix must be a **Unix timestamp in seconds** to run in order. Use the current time. After writing a migration, tell the user to run `npm run gen:types` so SPA types stay in sync.

---

## 7. TypeScript Models for the SPA ✅

**Tool: `pocketbase-typegen`** — reads local `data.db`, generates typed interfaces.

```bash
npm install -D pocketbase-typegen
```

**`scripts/gen-types.sh`:**
```bash
#!/bin/bash
set -e
npx pocketbase-typegen --db ./pb/pb_data/data.db --out src/types/pb.model.ts
echo "✓ Types written to src/types/pb.model.ts"
```

**`package.json` script:**
```json
"gen:types": "bash scripts/gen-types.sh"
```

**Generated file is committed to git** (`src/types/pb.model.ts`). Run `npm run gen:types` after any schema change, then commit the updated file.

**Using typed PB in the SPA:**
```typescript
// src/lib/pocketbase.ts
import PocketBase from 'pocketbase';
import type { TypedPocketBase } from '../types/pb.model';

export const pb = new PocketBase(POCKETBASE_URL) as TypedPocketBase;
// Now: pb.collection('kingdoms').getOne(id) → KingdomsRecord ✅
```

---

## 8. Serving the SPA from PocketBase ✅

**Decision: SPA built into `pb/pb_public/`. Always built on deploy — not committed to git.**

```json
// package.json
"build:spa": "vite build"
```

```typescript
// vite.config.ts
build: {
  outDir: 'pb/pb_public',
  emptyOutDir: true,
}
```

**BrowserRouter deep-link support**: Configured via catch-all route in `pb/pb_hooks/main.pb.js` (§5.5 above). No additional PB config needed.

---

## 9. VITE_POCKETBASE_URL — Smart Detection ✅

```typescript
// src/lib/pocketbase.ts
export const POCKETBASE_URL =
  import.meta.env.VITE_POCKETBASE_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://127.0.0.1:8090');
```

| Environment | `VITE_POCKETBASE_URL` | Resolved URL |
|---|---|---|
| `npm run dev` | `http://127.0.0.1:8090` | Direct to PB |
| `npm run serve:prod` (local prod test) | `` (empty) | `window.location.origin` on port 8091 |
| Production (SPA inside pb_public) | `` (empty) | `window.location.origin` |

`.env.production` (committed):
```
VITE_POCKETBASE_URL=
```

---

## 10. Local Developer Experience ✅

### One-command dev

```bash
npm install -D concurrently
```

```json
// package.json scripts
{
  "setup":       "bash scripts/setup.sh",
  "gen:types":   "bash scripts/gen-types.sh",

  "dev:pb":      "./pb/pocketbase serve --dev --dir=pb/pb_data --publicDir=pb/pb_public --hooksDir=pb/pb_hooks --migrationsDir=pb/pb_migrations --http=127.0.0.1:8090",
  "dev:vite":    "vite",
  "dev":         "concurrently -n PB,VITE -c cyan,magenta \"npm run dev:pb\" \"npm run dev:vite\"",

  "build:spa":   "vite build",
  "build":       "npm run build:spa",

  "serve:prod":  "./pb/pocketbase serve --dir=pb_prod_data --publicDir=pb/pb_public --hooksDir=pb/pb_hooks --migrationsDir=pb/pb_migrations --http=127.0.0.1:8091",
  "deploy:prod": "npm run build && npm run serve:prod",

  "test:pb":     "./pb/pocketbase serve --dir=pb_test_data --hooksDir=pb/pb_hooks --migrationsDir=pb/pb_migrations --http=127.0.0.1:8092",
  "test":        "vitest run --config vitest.config.ts",
  "test:watch":  "vitest --config vitest.config.ts"
}
```

### Vite proxy

Proxies SPA dev requests to PB so `VITE_POCKETBASE_URL` can be left empty in dev:

```typescript
// vite.config.ts
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8090',
      '/_':   'http://127.0.0.1:8090',
    },
  },
  build: {
    outDir: 'pb/pb_public',
    emptyOutDir: true,
  },
});
```

### Local production testing (`npm run serve:prod`)

Runs a **second PocketBase instance** on port `8091` using `pb_prod_data/` as its database — completely isolated from the dev database on port `8090`.

- `pb_prod_data/` is **gitignored** — it's a separate local DB that simulates prod
- Same hooks, same migrations, same built SPA — only different data
- After `npm run build` the SPA in `pb/pb_public/` is production-built and served by this instance
- Admin UI for prod instance: `http://127.0.0.1:8091/_/`

> **AI NOTE**: `npm run serve:prod` does NOT automatically rebuild the SPA. Always run `npm run build` first, or use `npm run deploy:prod` which does both.

---

## 11. Decisions Summary

| # | Topic | Decision |
|---|---|---|
| 1 | Repo layout | Same-repo monorepo; PB runtime in `pb/` |
| 2 | File naming | kebab-case with dot notation (`home.page.tsx`, `use-auth.ts`) |
| 3 | Hook language | Plain `.pb.js` with `/// <reference path="../../pb_data/types.d.ts" />` |
| 4 | Hook TS support | PB's built-in `pb_data/types.d.ts` — no external tool needed |
| 5 | Shared hook code | CJS `module.exports` + `require()` inside handlers |
| 6 | PB version | v0.40.2 (latest) |
| 7 | SPA TS types | `pocketbase-typegen` → `src/types/pb.model.ts` (committed to git) |
| 8 | Migrations | Hybrid: Admin UI auto-generates; AI agents write code-first |
| 9 | SPA serving | Built to `pb/pb_public/`; always rebuilt on deploy; gitignored |
| 10 | BrowserRouter | Supported via catch-all `routerAdd` in `main.pb.js` |
| 11 | PB URL detection | `window.location.origin` in prod via `import.meta.env.PROD` |
| 12 | Local DX | `concurrently` (PB + Vite); Vite proxy for `/api` and `/_` |
| 13 | Local prod test | `npm run serve:prod` — port 8091, `pb_prod_data/` (gitignored) |
| 14 | API testing | Vitest + dedicated PB test instance on port 8092, `pb_test_data/` wiped per run |
| 15 | Deployment | ZimaOS + Cloudflare Tunnel (deferred — not in scope yet) |

---

## 12. Files To Create (Next Actions)

```
scripts/
├── setup.sh                  ← idempotent PB binary downloader
└── gen-types.sh              ← wrapper for pocketbase-typegen
pb/
├── pb_hooks/
│   ├── main.pb.js            ← stub with SPA fallback + onBootstrap
│   ├── routes/.gitkeep
│   └── utils/.gitkeep
└── pb_migrations/.gitkeep
src/
└── types/
    └── pb.model.ts           ← run npm run gen:types after first PB start
tests/
├── setup/
│   ├── global-setup.ts
│   ├── global-teardown.ts
│   └── helpers.ts
└── api/
    └── auth.test.ts          ← starter test
.env.production               ← VITE_POCKETBASE_URL=  (empty string)
vite.config.ts                ← add proxy + build.outDir
vitest.config.ts              ← API test config
package.json                  ← add all scripts from §10
```

---

## 13. API Testing Strategy ✅

### 13.1 — Overview

API tests are **integration tests** that run against a real, isolated PocketBase instance. They test:
- Custom hook routes (`POST /api/kingdoms/attack`, etc.)
- Auth flows (register, login, token refresh)
- Collection rules and validation
- Game logic correctness end-to-end

**Test PB instance**: port `8092`, separate `pb_test_data/` directory (gitignored). The database is **wiped and re-migrated before every test run** — you always start from a known-empty state.

**Test runner**: [Vitest](https://vitest.dev/) — already in the Vite ecosystem, shares TypeScript config, fast.

### 13.2 — Install

```bash
npm install -D vitest @vitest/coverage-v8
```

### 13.3 — `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    globalSetup: ['tests/setup/global-setup.ts'],
    // globalTeardown runs after all tests complete
    // (vitest uses the same file for teardown via exported teardown fn)
    testTimeout: 15000,   // PB API calls can be slow on first run
    hookTimeout: 30000,   // global setup starts a process
    reporters: ['verbose'],
    env: {
      PB_TEST_URL: 'http://127.0.0.1:8092',
    },
  },
});
```

### 13.4 — Global Setup / Teardown

```typescript
// tests/setup/global-setup.ts
import { spawn, execSync } from 'child_process';
import { rmSync, mkdirSync } from 'fs';
import type { ChildProcess } from 'child_process';

let pbProcess: ChildProcess;

export async function setup() {
  // 1. Wipe test DB — guarantees a clean slate every run
  rmSync('pb_test_data', { recursive: true, force: true });
  mkdirSync('pb_test_data');

  // 2. Start PB test instance — migrations run automatically on startup
  pbProcess = spawn(
    './pb/pocketbase',
    [
      'serve',
      '--dir=pb_test_data',
      '--hooksDir=pb/pb_hooks',
      '--migrationsDir=pb/pb_migrations',
      '--http=127.0.0.1:8092',
    ],
    { stdio: 'pipe' }
  );

  // 3. Wait for PB to be ready (poll health endpoint)
  await waitForPb('http://127.0.0.1:8092');

  // 4. Bootstrap: create superuser for admin operations in tests
  //    (PB requires a superuser to access admin APIs)
  execSync(
    `./pb/pocketbase superuser upsert test-admin@example.com test-admin-password --dir=pb_test_data`,
    { stdio: 'pipe' }
  );

  console.log('✓ PB test instance ready on :8092');
}

export async function teardown() {
  pbProcess?.kill();
  console.log('✓ PB test instance stopped.');
}

async function waitForPb(url: string, maxWaitMs = 15000): Promise<void> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${url}/api/health`);
      if (res.ok) return;
    } catch { /* not ready yet */ }
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error(`PocketBase test instance did not start within ${maxWaitMs}ms`);
}
```

### 13.5 — Test Helpers

```typescript
// tests/setup/helpers.ts
import PocketBase from 'pocketbase';

export const TEST_PB_URL = 'http://127.0.0.1:8092';
export const ADMIN_EMAIL = 'test-admin@example.com';
export const ADMIN_PASSWORD = 'test-admin-password';

/** Create a fresh PB client (unauthenticated) for each test. */
export function createClient(): PocketBase {
  return new PocketBase(TEST_PB_URL);
}

/** Create a client authenticated as a new random test user. */
export async function createAuthClient(suffix = Math.random().toString(36).slice(2)) {
  const pb = createClient();
  const email = `test-${suffix}@example.com`;
  const password = 'Test1234!';
  await pb.collection('users').create({ email, password, passwordConfirm: password });
  await pb.collection('users').authWithPassword(email, password);
  return { pb, email, password };
}

/** Create a client authenticated as the superuser (for admin operations). */
export async function createAdminClient(): Promise<PocketBase> {
  const pb = createClient();
  await pb.admins.authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
  return pb;
}

/**
 * Seed a kingdom record for a given user.
 * Requires an authenticated admin client to bypass collection rules.
 */
export async function seedKingdom(
  adminPb: PocketBase,
  ownerId: string,
  overrides: Record<string, unknown> = {}
) {
  return adminPb.collection('kingdoms').create({
    name: 'Test Kingdom',
    hp: 100,
    gold: 500,
    owner: ownerId,
    ...overrides,
  });
}
```

### 13.6 — Example Tests

```typescript
// tests/api/auth.test.ts
import { describe, it, expect } from 'vitest';
import { createClient, createAuthClient } from '../setup/helpers';

describe('Auth', () => {
  it('registers a new user', async () => {
    const pb = createClient();
    const user = await pb.collection('users').create({
      email: 'new@example.com',
      password: 'Test1234!',
      passwordConfirm: 'Test1234!',
    });
    expect(user.email).toBe('new@example.com');
  });

  it('logs in with correct credentials', async () => {
    const { pb, email, password } = await createAuthClient('login-test');
    expect(pb.authStore.isValid).toBe(true);
    expect(pb.authStore.record?.email).toBe(email);
  });

  it('rejects wrong password', async () => {
    await createAuthClient('badpass');
    const pb = createClient();
    await expect(
      pb.collection('users').authWithPassword('test-badpass@example.com', 'WRONG')
    ).rejects.toThrow();
  });
});
```

```typescript
// tests/api/attack.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createAuthClient, createAdminClient, seedKingdom } from '../setup/helpers';

describe('POST /api/kingdoms/attack', () => {
  let adminPb: Awaited<ReturnType<typeof createAdminClient>>;

  beforeEach(async () => {
    adminPb = await createAdminClient();
  });

  it('reduces target hp', async () => {
    const { pb: attackerPb, email: aEmail } = await createAuthClient('attacker');
    const { email: tEmail } = await createAuthClient('target');

    const attackerUser = await adminPb.collection('users').getFirstListItem(`email='${aEmail}'`);
    const targetUser   = await adminPb.collection('users').getFirstListItem(`email='${tEmail}'`);

    const attackerKingdom = await seedKingdom(adminPb, attackerUser.id);
    const targetKingdom   = await seedKingdom(adminPb, targetUser.id, { hp: 100 });

    const res = await attackerPb.send('/api/kingdoms/attack', {
      method: 'POST',
      body: { attackerId: attackerKingdom.id, targetId: targetKingdom.id },
    });

    expect(res.success).toBe(true);
    const updated = await adminPb.collection('kingdoms').getOne(targetKingdom.id);
    expect(updated.hp).toBeLessThan(100);
  });

  it('rejects unauthenticated requests', async () => {
    const { createClient } = await import('../setup/helpers');
    const pb = createClient();
    await expect(
      pb.send('/api/kingdoms/attack', { method: 'POST', body: {} })
    ).rejects.toThrow();
  });
});
```

### 13.7 — DB Reset Between Tests

**Strategy**: The entire `pb_test_data/` is deleted and PB is restarted **once per test run** (in global setup). This gives every run a perfectly clean DB with only migrations applied.

Within a test run, individual tests are responsible for creating their own data via helpers. Tests should **not** depend on data from other tests.

**If you need mid-run resets** (e.g., between `describe` blocks): use `beforeEach` in the test file to create fresh data, and use the admin client to delete records after with `afterEach`. Full DB resets mid-run are not recommended as they require restarting the PB process.

> **AI NOTE**: `pb_test_data/` is wiped on every `npm test` — never store anything important there. The test admin credentials (`test-admin@example.com`) are recreated via `superuser upsert` each run — this command is idempotent.

### 13.8 — Running Tests

```bash
# Full test run (wipes pb_test_data, starts PB, runs all tests, stops PB)
npm test

# Watch mode (keeps PB running between re-runs — faster iteration)
# Note: first run still wipes DB; subsequent re-runs reuse the same DB
npm run test:watch

# Start PB test instance manually (useful for debugging)
npm run test:pb
# Then in another terminal: npx vitest run --config vitest.config.ts
```
