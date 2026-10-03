# Super Kingdoms — Implementation Roadmap & Tracking

This document tracks all planned, in-progress, and completed implementations across the documentation specifications and requirements:
- [ARCHITECTURE.md](ARCHITECTURE.md) — Architecture & DX guidelines
- [PVE_REWORK_PLAN.md](PVE_REWORK_PLAN.md) — PvE mode & round lifecycle specification
- [KINGDOM_INTERACTIONS.md](KINGDOM_INTERACTIONS.md) — Espionage, combat, and sector rules
- [TICK_ENGINE.md](TICK_ENGINE.md) — Simulation engine & concurrency model
- [Requirements Catalog](requirements/) — Formal requirement IDs (`REQ-PVE-*`, `REQ-BOT-*`, `REQ-SELF-*`, etc.)

---

## Progress Overview

| Epic / Workstream | Status | Progress | Key Target |
|---|---|---|---|
| **1. Database Schema & Models** | 🟡 In Progress | 40% | Migrations for round phases, sectors, war leaders, and queues |
| **2. Engine Core & Simulation (Go)** | 🟡 In Progress | 60% | Returning military, defensive surge decay, 128-tick bot simulation |
| **3. Phase 1: Global Newbie Mode** | 🟡 In Progress | 50% | 8-step self-tick (16 ticks/step), reset modal with race/planet, 8k def gate |
| **4. Phase 2: PvE Mode & Interactions** | 🔴 Not Started | 0% | Bot auto-spawn ($5 \times \text{players}$), invasion combat, probe espionage |
| **5. Phase 3: PvP Mode & Sector Split** | 🔴 Not Started | 0% | 5-tier NW balanced sector splitting, intra/inter-sector combat rules |
| **6. Automation & Phase Scheduler** | 🔴 Not Started | 0% | Fixed 16:00:00 UTC transitions, admin duration overrides |
| **7. Frontend UI / UX Rework** | 🟡 In Progress | 35% | Phase header, step stepper, custom modals, combat views |
| **8. Automated Testing & Verification** | 🟡 In Progress | 30% | Vitest integration tests for API hooks, combat, and transitions |

---

## 1. Database Schema & Data Models

- [x] Baseline schema initialization ([1788560421_init_game_schema.js](../pb/pb_migrations/1788560421_init_game_schema.js))
- [x] Initial `gameStatus` collection ([1788990472_add_game_status.js](../pb/pb_migrations/1788990472_add_game_status.js))
- [x] Initial `sector` integer field on kingdoms ([1788989743_add_sector.js](../pb/pb_migrations/1788989743_add_sector.js))
- [x] Initial `newbiemode` integer field on kingdoms ([1789073638_add_newbiemode.js](../pb/pb_migrations/1789073638_add_newbiemode.js))
- [ ] **Migration: `gameStatus` Phase Rework** ([REQ-PVE-001](requirements/pve-mode-rework.requirements.md#L18-L21), [REQ-PVE-003](requirements/pve-mode-rework.requirements.md#L23))
  - [x] Add `phase` string select field (`newbie`, `pve`, `pvp`, `ended`) ([1791019540_add_game_status_phase.js](../pb/pb_migrations/1791019540_add_game_status_phase.js))
  - [ ] Add `phaseEndTime` text/date field (ISO UTC timestamp)
  - [ ] Add `newbieDurationDays` (default: 3), `pveDurationDays` (default: 3), `pvpDurationDays` (default: 20)
  - [ ] Add `sectorCount` integer field (default: 1)
- [ ] **Migration: `kingdoms` Combat & Interaction Fields** ([REQ-PVE-025](requirements/pve-mode-rework.requirements.md#L51), [REQ-PVE-026](requirements/pve-mode-rework.requirements.md#L52), [REQ-PVE-030](requirements/pve-mode-rework.requirements.md#L56))
  - [ ] Add `newbieStepsRemaining` integer field (default: 8, replaces raw tick counter)
  - [ ] Add `warLeaders` integer field (default: 4, min: 0, max: 4)
  - [ ] Add `returningMilitary` json field (array of `{ returnTick, warLeaders, units }`)
  - [ ] Add `defensiveSurge` integer field (default: 0, percent defensive bonus)
  - [ ] Add `lastActiveAt` text/date field for 48h inactivity tracking
- [ ] **Migration: `spyReports` & `attackReports` Collections**
  - [ ] Create `spyReports` collection (`attackerId`, `targetId`, `reportType`, `success`, `data`, `created`)
  - [ ] Create `attackReports` collection (`attackerId`, `defenderId`, `result`, `landCaptured`, `attackerLosses`, `defenderLosses`, `warLeadersSent`, `created`)
- [ ] Run `npm run gen:types` to regenerate [pb.model.ts](../src/types/pb.model.ts)

---

## 2. Tick Engine & Simulation Core (Go & JS Utils)

- [x] Parallel multi-core kingdom simulation loop in Go ([cmd/server/main.go](../cmd/server/main.go))
- [x] Seven-phase deterministic simulation ([pkg/engine/engine.go](../pkg/engine/engine.go) & [pb/pb_hooks/utils/tick-engine.js](../pb/pb_hooks/utils/tick-engine.js))
- [x] Autonomous bot growth logic ([REQ-BOT-001](requirements/bot-profile.requirements.md))
- [ ] **Returning Military Wave Processing** ([REQ-PVE-026](requirements/pve-mode-rework.requirements.md#L52))
  - [ ] On each simulation tick, inspect `returningMilitary` queue entries matching `currentTick`
  - [ ] Restore returned units to active garrison and increment available `warLeaders`
  - [ ] Prune resolved waves from queue
- [ ] **Defensive Surge Decay** ([REQ-PVE-030](requirements/pve-mode-rework.requirements.md#L56))
  - [ ] If `defensiveSurge > 0`, decrement by 1% per tick down to 0%
- [ ] **16-Tick Military Training Queues in Newbie Phase** ([REQ-PVE-015](requirements/pve-mode-rework.requirements.md#L38))
  - [ ] Enforce 16-tick maximum recruitment delay during Newbie phase so recruits finish in 1 step

---

## 3. Phase 1: Global Newbie Mode

- [x] Initial self-tick endpoint (`POST /api/kingdoms/self-tick` advancing 8 ticks)
- [x] Initial restart newbie mode endpoint (`POST /api/kingdoms/restart-newbie-mode`)
- [ ] **Rework Self-Tick to 8 Steps × 16 Ticks** ([REQ-PVE-008](requirements/pve-mode-rework.requirements.md#L31), [REQ-PVE-009](requirements/pve-mode-rework.requirements.md#L32))
  - [ ] Update `POST /api/kingdoms/self-tick` to run exactly 16 engine simulation ticks per invocation
  - [ ] Decrement `newbieStepsRemaining` from 8 down to 0
  - [ ] Reject if `newbieStepsRemaining <= 0` or phase is not `newbie`
- [ ] **Enforce Player Auto-Build Restriction** ([REQ-PVE-011](requirements/pve-mode-rework.requirements.md#L34))
  - [ ] Reject toggling `autoBuild: true` for human players while phase is `newbie`
  - [ ] Disable auto-build toggle in client UI with explanatory tooltip
- [ ] **Unlimited Resets with Trait Customization** ([REQ-PVE-012](requirements/pve-mode-rework.requirements.md#L35))
  - [ ] Update `POST /api/kingdoms/restart-newbie-mode` to accept optional `{ planetType, raceType }`
  - [ ] Validate chosen planet and race against allowed lists
  - [ ] Allow reset at any time during `newbie` phase (not restricted to 0 steps remaining)
  - [ ] Restore kingdom to initial stats and reset `newbieStepsRemaining = 8`
- [ ] **Step 8 Defense Readiness Gate (8,000 Base Defense Points)** ([REQ-PVE-016](requirements/pve-mode-rework.requirements.md#L39))
  - [ ] Calculate base defense points: active units + training queues (using base unit def values without bonuses)
  - [ ] Reject step 8 advance if defense points < 8,000 with informative error message
- [ ] **Free Land Optimization Warning (> 16 Land)** ([REQ-PVE-017](requirements/pve-mode-rework.requirements.md#L40))
  - [ ] Client check: if `freeLand > 16`, prompt custom glassmorphism modal before calling self-tick

---

## 4. Phase 2: PvE Mode & Kingdom Interactions

- [x] Batch bot creation endpoint (`POST /api/game/create-bots` — [REQ-BOT-CREATE-001](requirements/admin-create-bots.requirements.md#L9))
- [ ] **Automated Phase 1 $\rightarrow$ Phase 2 Bot Spawner & 128-Tick Fast-Forward** ([REQ-PVE-019](requirements/pve-mode-rework.requirements.md#L45)–[REQ-PVE-021](requirements/pve-mode-rework.requirements.md#L47))
  - [ ] Compute bot count: $\max(21, 5 \times \text{activePlayerKingdoms})$
  - [ ] Spawn bots with +300k starting cash (600,000 total), `autoBuild: true`, random profile, random planet
  - [ ] Run 8 steps (128 simulation ticks) automatically for each bot using the Go engine
- [ ] **Combat Engine: Standard Invasion** ([REQ-PVE-025](requirements/pve-mode-rework.requirements.md#L51)–[REQ-PVE-029](requirements/pve-mode-rework.requirements.md#L55))
  - [ ] Validate 3x Networth window: $NW_{\text{att}} / 3 < NW_{\text{def}} < 3 \times NW_{\text{att}}$
  - [ ] Validate target eligibility: bot only in Phase 2; intra-sector or 48h inactive in Phase 3
  - [ ] War Leaders allocation: require 1 to available count (max 4); reject if 0 available
  - [ ] Resolve Offensive Power (OP) vs Defensive Power (DP) with bonuses & surge
  - [ ] Calculate casualties: 8% of sent power benchmark on both sides
  - [ ] Calculate captured land: 10% of defender's total land on success ($\lfloor \text{land} \times 0.10 \rfloor$)
  - [ ] Trigger defender's +8% defensive alert surge bonus on breach
  - [ ] Enqueue surviving troops into $N$ return waves over 12 ticks ($12/N$ ticks per wave)
- [ ] **Espionage / Probe Reconnaissance** ([REQ-PVE-032](requirements/pve-mode-rework.requirements.md#L58))
  - [ ] Success probability: $\min(1.0, \max(0.20, \text{sent} / \text{def}))$; 100% if defender has 0 probes
  - [ ] Probe loss: 25% on success, 100% on failure
  - [ ] Generate reports: Status of Kingdom (SoK), Status of Buildings (SoB), Status of Economy (SoE)
- [ ] **Unlock Auto-Build for Human Players in Phase 2** ([REQ-PVE-034](requirements/pve-mode-rework.requirements.md#L60))

---

## 5. Phase 3: PvP Mode & Sector Splitting

- [ ] **NW-Tier Balanced Sector Splitting Procedure** ([REQ-PVE-037](requirements/pve-mode-rework.requirements.md#L66)–[REQ-PVE-040](requirements/pve-mode-rework.requirements.md#L69))
  - [ ] Trigger automatically at 16:00:00 UTC at Phase 2 completion
  - [ ] Calculate sector count: $S = \lceil \text{activePlayerCount} / 5 \rceil$
  - [ ] Rank all active players by `nw` descending and partition into 5 equal tiers (Tiers 1 to 5)
  - [ ] Randomly shuffle within tiers and distribute across sectors $1 \dots S$
  - [ ] Update `sector` field on all player kingdom records in database
- [ ] **PvP Interaction Rules Enforcement** ([REQ-PVE-041](requirements/pve-mode-rework.requirements.md#L70), [REQ-PVE-042](requirements/pve-mode-rework.requirements.md#L71))
  - [ ] Allow combat and probes between kingdoms in the same sector (intra-sector)
  - [ ] Block combat and probes between different sectors (inter-sector) unless target is inactive (48h idle)
  - [ ] Track player activity to set `lastActiveAt` and determine `inactive` status
- [ ] **Round Conclusion & Final Standings** ([REQ-PVE-043](requirements/pve-mode-rework.requirements.md#L72))
  - [ ] Transition phase to `ended` at 16:00:00 UTC on day 20 of PvP
  - [ ] Freeze kingdom actions and calculate final individual and sector leaderboards

---

## 6. Automation & Phase Transition Scheduler

- [ ] **Fixed 16:00:00 UTC Phase Transition Scheduler** ([REQ-PVE-002](requirements/pve-mode-rework.requirements.md#L22), [REQ-PVE-004](requirements/pve-mode-rework.requirements.md#L24))
  - [ ] Create background scheduler routine (Go daemon or cron job)
  - [ ] Evaluate current time against `gameStatus.phaseEndTime`
  - [ ] Execute automated transition routines:
    - Newbie $\rightarrow$ PvE: Spawn bots, fast-forward 128 ticks, set phase to `pve`, set next end time (+3 days 16:00 UTC)
    - PvE $\rightarrow$ PvP: Run sector splitting, set phase to `pvp`, set next end time (+20 days 16:00 UTC)
    - PvP $\rightarrow$ Ended: Archive standings, set phase to `ended`
- [ ] **Admin Phase Controls** ([REQ-PVE-005](requirements/pve-mode-rework.requirements.md#L25))
  - [ ] Endpoint / UI buttons to adjust phase durations and manually trigger transitions if needed

---

## 7. Frontend UI / UX Implementation

- [x] Basic Kingdom Navigation and Page Layout ([src/pages/kingdom-layout.tsx](../src/pages/kingdom-layout.tsx))
- [x] Self-tick button component ([src/components/self-tick-button.tsx](../src/components/self-tick-button.tsx))
- [x] Bot profile chip indicator ([REQ-BOT-011](requirements/bot-profile.requirements.md#L23))
- [x] Admin page bot creation button ([src/pages/admin.page.tsx](../src/pages/admin.page.tsx))
- [ ] **Phase Header & Transition Countdown Banner** ([PVE_REWORK_PLAN.md §6.3](PVE_REWORK_PLAN.md#L247-L250))
  - [ ] Display active phase badge: `🌱 Global Newbie Mode`, `🛡️ PvE Mode`, or `⚔️ PvP Sector Warfare`
  - [ ] Live countdown timer to 16:00:00 UTC transition
- [ ] **Newbie Step Progression Widget** ([PVE_REWORK_PLAN.md §6.3](PVE_REWORK_PLAN.md#L250-L255))
  - [ ] Visual 8-step stepper component (replacing raw tick budget)
  - [ ] Step advance button with loading indicator
  - [ ] Defensive readiness tracker: `"Defensive Readiness: X / 8,000 Base Def"` (disabled if < 8k on Step 8)
- [ ] **Reset Newbie Modal with Trait Selectors** (`ResetNewbieModal` — [PVE_REWORK_PLAN.md §3.3](PVE_REWORK_PLAN.md#L48-L62))
  - [ ] Styled glassmorphism modal with confirmation prompt
  - [ ] Dropdowns/cards to select new Planet Type and Race Type
- [ ] **Unbuilt Land Warning Modal** (`UnbuiltLandModal` — [REQ-PVE-017](requirements/pve-mode-rework.requirements.md#L40))
  - [ ] Modern dialog warning player if free land > 16 before advancing step
  - [ ] Direct action to navigate to `/kingdom/buildings` or proceed anyway
- [ ] **War Leaders & Returning Military Indicator**
  - [ ] Header or military page widget showing available War Leaders (`X / 4 available`)
  - [ ] Display returning waves timeline (`Wave 1: +3 ticks, X units`, etc.)
- [ ] **PvE Combat & Espionage Views**
  - [ ] Target browser filtered to Environment Bot kingdoms
  - [ ] Attack deployment modal: army composition inputs, War Leaders selector (1–4), wave return schedule preview
  - [ ] Espionage modal: probe dispatch count, success chance estimate, report display modal (SoK, SoB, SoE)
- [ ] **PvP Sector Overview & Standings View**
  - [ ] Sector dashboard showing all 5 sector members, ranks, Networth, and defense status
  - [ ] Sector leaderboards and inter-sector inactive target scanner

---

## 8. Testing & Validation

- [x] Authentication & User CRUD tests ([tests/api/auth.test.ts](../tests/api/auth.test.ts))
- [x] Bot profile assignment tests ([tests/api/bot-profile.test.ts](../tests/api/bot-profile.test.ts))
- [x] Initial self-tick tests ([tests/api/self-tick.test.ts](../tests/api/self-tick.test.ts))
- [ ] **Newbie 8-Step & Defense Gate Tests**
  - [ ] Verify each step executes exactly 16 engine ticks
  - [ ] Verify Step 8 rejection if base defense < 8,000
  - [ ] Verify reset with trait customization (planet/race update and budget restoration)
- [ ] **Combat Engine Tests**
  - [ ] Verify 8% casualty scaling on repelled and successful attacks
  - [ ] Verify 10% land capture formula
  - [ ] Verify War Leaders consumption and wave staggered return ticks
  - [ ] Verify +8% defensive surge application and 1% tick decay
- [ ] **Probe Espionage Tests**
  - [ ] Verify probe success probability curve (20% floor, 100% on 0 def probes)
  - [ ] Verify 25% probe loss on win and 100% loss on defeat
- [ ] **Sector Splitting Tests**
  - [ ] Verify 5-tier NW partitioning and balanced sector distribution across 20+ test kingdoms
- [ ] **Phase Transition Scheduler Tests**
  - [ ] Verify automated transition at 16:00:00 UTC and bot creation + 128-tick simulation

---

## Tracking Conventions

- When picking up a task: Mark as `[/]` (in progress) or add your name/context.
- When finishing a task: Mark as `[x]`, link relevant commits/files, and update dependent tasks.
- If requirements change: Update both the respective [docs/requirements/*.requirements.md](requirements/) file and this tracking document.
