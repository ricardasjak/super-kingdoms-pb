# Super Kingdoms — Implementation Progress & Tracking

> **Overall Status**: Milestone 1 Completed (Clean Slate, Auth, Pico Theme, Kingdom Creation Base)  
> **Clean-Slate Strategy**: Single migration baseline (`1780000000_clean_slate_schema.js`)  
> **Master Reference**: [`docs/implementation-plan/05-clean-slate-and-milestones.md`](05-clean-slate-and-milestones.md)

---

## High-Level Milestone Dashboard

| Milestone | Scope | Status | Test Coverage |
|---|---|---|---|
| **Milestone 1** | **Foundation, Schema & Discord Auth** | **[x] Completed** | `tests/api/auth.test.ts` |
| **Milestone 2** | **Kingdom Creation & Newbie Step Engine** | **[x] Completed** | `tests/api/kingdoms.test.ts`, `tests/api/self-tick.test.ts` |
| **Milestone 3** | **Buildings, Exploration & Research Tech Tree** | `[/] Next Up` | `tests/api/growth.test.ts` |
| **Milestone 4** | **Military Logistics & Invasions (Combat Engine)**| `[ ] Pending` | `tests/api/combat.test.ts` |
| **Milestone 5** | **Espionage Probes, Missiles & Planetary Shields** | `[ ] Pending` | `tests/api/probes.test.ts` |
| **Milestone 6** | **Sector Politics, Alliances, Emergency Aid & Scores** | `[ ] Pending` | `tests/api/sector.test.ts` |

---

## Detailed Task Breakdown

### Milestone 1: Foundation, Schema & Discord Auth

- [x] **1.1 Database Clean Slate & Baseline Migration**
  - [x] Purge legacy migration files in `pb/pb_migrations/`
  - [x] Author consolidated baseline migration: `pb/pb_migrations/1780000000_clean_slate_schema.js`
    - Collections: `game_status`, `sectors`, `kingdoms`, `military_deployments`, `aid_packages`, `game_news`
    - Seed 100 sectors (Torus 10x10) and initial `game_status`
  - [x] Wipe old local databases (`pb/pb_data/*`, `pb_prod_data/*`, `pb_test_data/*`)
- [x] **1.2 Schema Execution & Type Generation**
  - [x] Boot PocketBase to apply migration
  - [x] Run `npm run gen:types` to generate `src/types/pb.model.ts`
- [x] **1.3 UI Foundation (Pico CSS & Retro Theme)**
  - [x] Install `@picocss/pico`
  - [x] Implement `src/theme.css` with pixelated space palette
  - [x] Update `src/index.css` and HTML entry point
- [x] **1.4 Discord OAuth2 & Auth Flow**
  - [x] Implement `src/context/auth-context.tsx` with Discord OAuth2 and superuser test fallback
  - [x] Build `src/pages/login.page.tsx` with Discord login CTA and game status widget
- [x] **1.5 Milestone 1 Verification**
  - [x] Verify test harness with `npm test` against test instance `:8092` (passed)
  - [x] Ensure clean build with `npm run build` (`build:spa` + `build:pb` passed)

---

### Milestone 2: Kingdom Creation, Economy & Newbie Step-Engine

- [x] **2.1 Kingdom Founding Endpoint & Logic**
  - [x] Implement `POST /api/kingdoms/create` in `pb/pb_hooks/kingdoms.pb.js`
  - [x] Enforce 8 archetype bonus stats and initial assets (250 land, 2,250 civs, 300k gold, 10k power, 200 sol, 300 sci)
  - [x] Assign sector and sector slot (0..9) with Torus distribution
- [x] **2.2 Go Engine Core Simulation (Phases 4, 5, 6)**
  - [x] Implement `pkg/engine/types.go` matching clean-slate schema
  - [x] Implement civilian growth, power consumption/generation, and tax calculations
  - [x] Implement step tick endpoint `POST /api/kingdoms/self-tick/step` (24 ticks per step)
- [x] **2.3 UI: Creation & Status Screens**
  - [x] Build `src/pages/create-kingdom.page.tsx` & `src/components/create-kingdom-form.tsx` with live 8-archetype preview
  - [x] Build `src/pages/kingdom-status.page.tsx` with resource counters and `NewbieStepView` banner
- [x] **2.4 Milestone 2 Verification**
  - [x] Write `tests/api/kingdoms.test.ts` covering founding and 8 Newbie steps
  - [x] Write `tests/api/self-tick.test.ts` covering 192 ticks across 8 steps, reset, and unauthenticated checks

---

### Milestone 3: Infrastructure, Exploration & Research Tech Tree

- [ ] **3.1 Land Exploration**
  - [ ] Implement `POST /api/kingdoms/explore` with `sqrt(land)*111` cost & 24-tick queue
  - [ ] Implement daily exploration cap (10% max)
- [ ] **3.2 Construction & Razing**
  - [ ] Implement `POST /api/kingdoms/build` (16-tick queue)
  - [ ] Implement `POST /api/kingdoms/raze` (cost/8 refund)
- [ ] **3.3 Scientific Research & Tech Tree**
  - [ ] Implement `POST /api/kingdoms/research/allocate`
  - [ ] Research scaling formula (`weight * land^2`)
  - [ ] One-time tech unlocks (Fusion, Energy Core, Dragoons, Probe Armor, etc.)
- [ ] **3.4 Go Engine Queue Processing (Phases 1, 2, 3)**
  - [ ] Process land arrivals and building completions during ticks
- [ ] **3.5 UI: Exploration, Buildings & Research Screens**
  - [ ] Build `src/pages/explore.page.tsx`
  - [ ] Build `src/pages/buildings.page.tsx`
  - [ ] Build `src/pages/research.page.tsx`
- [ ] **3.6 Milestone 3 Verification**
  - [ ] Write `tests/api/growth.test.ts`

---

### Milestone 4: Military Logistics & Invasions (Combat Engine)

- [ ] **4.1 Military Recruitment & Logistics**
  - [ ] Implement `POST /api/kingdoms/train` for 9 unit types (24 ticks queue)
  - [ ] Training Camp discount ($\le 30\%$) and Barracks living capacity
- [ ] **4.2 Torus Coordinates & Deployment Scheduling**
  - [ ] Torus wrap-around distance and travel time calculation in Go
  - [ ] 4 War Leaders slots and return waves scheduling
- [ ] **4.3 Combat Resolution Engine (`pkg/engine/combat.go`)**
  - [ ] Offensive & defensive battle power calculation
  - [ ] Militia baseline defense ($2 \times \text{land}$)
  - [ ] Casualties distribution (attacker 8% minus war shields, defender 5–10%)
  - [ ] Plunder calculation (5–10% of land, money, and civilians)
- [ ] **4.4 Invasions Endpoint (`POST /api/kingdoms/attack`)**
  - [ ] Target validation ($3\times$ Networth window, non-newbie, non-trouble)
- [ ] **4.5 UI: Military & Attack Screens**
  - [ ] Build `src/pages/military.page.tsx`
  - [ ] Build `src/pages/attack.page.tsx`
- [ ] **4.6 Milestone 4 Verification**
  - [ ] Write `tests/api/combat.test.ts`

---

### Milestone 5: Espionage Probes, Missiles & Planetary Shields

- [ ] **5.1 Probe Operations (`POST /api/kingdoms/probe`)**
  - [ ] Probe factory generation and 10 stored credits bank
  - [ ] 11 probe missions (SoK, SoM, Arson, Rob, Sabotage, Suicide, etc.)
  - [ ] FDC counter-espionage detection formula
- [ ] **5.2 Planetary Shields (`POST /api/kingdoms/shields/set`)**
  - [ ] Missile, Military, and Probe shields (1% power generation upkeep per level)
  - [ ] Grid blackout handling when power is exhausted
- [ ] **5.3 Orbital Missiles (`POST /api/kingdoms/missile/fire`)**
  - [ ] Nuclear, Fusion, and Energy missile production and strike resolution
- [ ] **5.4 UI: Probes & Missiles Screens**
  - [ ] Build `src/pages/probes.page.tsx`
  - [ ] Build `src/pages/missiles.page.tsx`
- [ ] **5.5 Milestone 5 Verification**
  - [ ] Write `tests/api/probes.test.ts`

---

### Milestone 6: Sector Politics, Alliances, Emergency Aid & Scores

- [ ] **6.1 Sector Matrix & Politics**
  - [ ] 10-kingdom sector matrix and Monarch election (`POST /api/sector/vote`)
  - [ ] Sector tax collection into sector fund
  - [ ] Monarch sector state proclamations
- [ ] **6.2 Trouble Status & Emergency Aid**
  - [ ] Trouble Status trigger ($MA \ge 30\%$, 12h freeze)
  - [ ] Emergency aid transfers (`POST /api/sector/aid`, 50% NW cap)
- [ ] **6.3 Leaderboards & Round Lifecycle**
  - [ ] Global leaderboards (Networth, Land, Military, Honor)
  - [ ] 960-tick round lifecycle transition
- [ ] **6.4 UI: Sector & Leaderboard Screens**
  - [ ] Build `src/pages/sector.page.tsx`
  - [ ] Build `src/pages/scores.page.tsx`
- [ ] **6.5 Milestone 6 Verification**
  - [ ] Write `tests/api/sector.test.ts`
  - [ ] Full end-to-end game production build (`npm run build`)
