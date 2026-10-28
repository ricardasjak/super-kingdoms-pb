# Implementation Plan: Master Architecture & Phased Milestones

> **Target**: Super Kingdoms Rebuild  
> **Stack**: PocketBase (Go custom binary + SQLite) + React 19 SPA (Vite + TypeScript + React Router v7 + Pico CSS)  
> **Design Ground Truth**: [`docs/game-design/`](../game-design/README.md) & [`docs/vindicator-guide/`](../vindicator-guide/README.md)

---

## 1. High-Level Vision & Objectives

This implementation plan establishes a clean-slate rebuild of **Super Kingdoms** on top of a proven, lightweight architecture:
- **PocketBase backend** running an embedded, high-performance **Go native parallel tick engine** (`pkg/engine/`).
- **Discord OAuth2 authentication** for human players via PocketBase's native OAuth2 provider support; email/password authentication strictly reserved for superusers and integration test suites.
- **Pure semantic React 19 SPA** styled with **Pico CSS (classless)** plus a tiny pixelated space-theme CSS layer (`theme.css`). No heavy component libraries, no bespoke styling overhead—just clean, functional, high-readability screens proving that every single game system works.
- **Strict mathematical parity** with the game design documents and the authoritative Vindicator formula archive.

---

## 2. Architectural Blueprint

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React 19 SPA (Vite 8)                           │
│  - Pico CSS (classless) + retro pixel space overrides                  │
│  - React Router v7 (kebab-case pages)                                  │
│  - PocketBase JS Client SDK (singleton pb instance)                    │
│  - Discord OAuth2 authStore listener                                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST / Realtime SSE
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                Custom PocketBase Binary (`pb/pocketbase`)              │
│                                                                        │
│  ┌─────────────────────────────┐    ┌────────────────────────────────┐ │
│  │   PocketBase Core & HTTP    │    │    Native Go Tick Engine       │ │
│  │  - Auth (Discord OAuth2)    │    │    (`pkg/engine/`)             │ │
│  │  - Collections & SQLite     │    │  - Multi-threaded simulation   │ │
│  │  - JSVM Hooks (`pb_hooks/`) │    │  - 8-phase deterministic tick  │ │
│  │  - Static SPA in pb_public/ │    │  - Torus travel & queues       │ │
│  └──────────────┬──────────────┘    └────────────────┬───────────────┘ │
│                 │                                    │                 │
│                 └─────────────────┬──────────────────┘                 │
│                                   ▼                                    │
│                 ┌──────────────────────────────────┐                   │
│                 │      SQLite (WAL mode + Batch)   │                   │
│                 │      `pb/pb_data/data.db`        │                   │
│                 └──────────────────────────────────┘                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Clean-Slate Strategy

To eliminate accumulated technical debt while preserving working build tooling:
1. **Retain Tooling & Dev Environment**:
   - `package.json` scripts (`npm run dev`, `npm run build`, `npm test`, `npm run gen:types`).
   - `scripts/setup.sh`, `scripts/build-pb.sh`, `scripts/test.sh`.
   - `cmd/server/main.go` PocketBase extension wrapper.
   - Vitest test runner configuration (`vitest.config.ts`, `tests/setup/`).
2. **Purge Legacy Game Code**:
   - Replace old ad-hoc migrations in `pb/pb_migrations/` with a single unified initial migration: `1780000000_clean_slate_schema.js`.
   - Clear existing dev data (`pb/pb_data/`) and test data (`pb_test_data/`) on reset.
   - Replace legacy hook files in `pb/pb_hooks/` with modular route handlers matching the GDD specifications.
   - Replace old frontend pages in `src/pages/` and custom components with Pico CSS semantic page views.
   - Re-implement `pkg/engine/` using the updated, verified formulas.

---

## 4. Implementation Phasing & Milestones

The project is structured into **6 sequential milestones**, enabling continuous verification and early playability:

| Milestone | Scope & Core Deliverables | Deliverable Artifacts |
|---|---|---|
| **Milestone 1** | **Foundation, Schema & Discord Auth**<br>• Clean PB schema migration (`1780000000_clean_slate_schema.js`)<br>• Discord OAuth2 login flow + superuser fallback<br>• Pico CSS styling setup (`theme.css`) with pixel font<br>• Vitest test suite bootstrap | `src/types/pb.model.ts`<br>`src/context/auth-context.tsx`<br>`tests/api/auth.test.ts` |
| **Milestone 2** | **Kingdom Creation & Newbie Step Engine**<br>• Kingdom registration with 8 planet archetypes<br>• Starting assets (250 land, 2,250 civs, 300k gold, 10k power, 200 sol, 100 sci)<br>• Go engine: 8-phase tick logic (income, power, pop, research)<br>• Phase 1 Newbie Mode (8 Progression Steps of 16 ticks) | `pkg/engine/simulation.go`<br>`src/pages/create-kingdom.page.tsx`<br>`src/pages/newbie-step.page.tsx`<br>`src/pages/status.page.tsx` |
| **Milestone 3** | **Buildings, Exploration & Research Tech Tree**<br>• Building orders (16 ticks) & razing (1/8 refund)<br>• Exploration orders (24 ticks, `sqrt(land)*111`, 10% daily cap)<br>• Continual research scaling (`weight * land^2`)<br>• One-time tech tree unlocks (Fusion, Energy Core, Dragoons, etc.) | `src/pages/buildings.page.tsx`<br>`src/pages/explore.page.tsx`<br>`src/pages/research.page.tsx`<br>`tests/api/growth.test.ts` |
| **Milestone 4** | **Military Recruitment & Invasions (Combat Engine)**<br>• All 9 military units (24 ticks training time)<br>• Training Camp discounts ($\le 30\%$) & Barracks capacity<br>• 10x10 Torus travel calculation & 4 War Leaders return waves<br>• Battle resolution, militia baseline defense ($2 \times \text{land}$), casualties, war shields, and plunder formulas | `pkg/engine/combat.go`<br>`src/pages/military.page.tsx`<br>`src/pages/attack.page.tsx`<br>`tests/api/combat.test.ts` |
| **Milestone 5** | **Espionage Probes, Missiles & Planetary Shields**<br>• Probe production & 10 stored credits bank<br>• 11 probe missions (SoK, SoM, Arson, Rob, Sabotage, Suicide, etc.)<br>• Probe shields, Probe Armor, and FDC counter-espionage<br>• Nuclear, Fusion, and Energy missiles & 3 defense shield arrays | `src/pages/probes.page.tsx`<br>`src/pages/missiles.page.tsx`<br>`tests/api/probes.test.ts` |
| **Milestone 6** | **Sector Politics, Alliances, Emergency Aid & Scores**<br>• 10-kingdom sectors, Monarch election, sector tax & fund<br>• Sector states (Expansionist, Offensive, etc.) & orbital stations<br>• Trouble Status (MA $\ge 30\%$) & emergency aid window (50% NW cap)<br>• Galaxy leaderboards & 960-tick round lifecycle transition | `src/pages/sector.page.tsx`<br>`src/pages/scores.page.tsx`<br>`tests/api/sector.test.ts` |

---

## 5. Implementation Documentation Series

| Document | Focus & Contents |
|---|---|
| [**01-database-schema-and-pocketbase.md**](01-database-schema-and-pocketbase.md) | Database collections, field definitions, JSON structures, API rules, and initial migration file. |
| [**02-go-engine-and-simulation.md**](02-go-engine-and-simulation.md) | Deterministic 8-phase simulation engine in Go, queue processing, Torus coordinates, and concurrency architecture. |
| [**03-api-endpoints-and-player-actions.md**](03-api-endpoints-and-player-actions.md) | Full specification of HTTP routes, request/response bodies, permission checks, and business logic execution. |
| [**04-frontend-and-ui-screens.md**](04-frontend-and-ui-screens.md) | React 19 pages, navigation tree, Pico CSS components, form specifications, and feedback dialogs. |
| [**05-clean-slate-and-milestones.md**](05-clean-slate-and-milestones.md) | Detailed checklist, file retirement instructions, verification commands, and acceptance criteria per milestone. |
