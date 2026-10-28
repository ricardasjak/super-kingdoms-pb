# Implementation Plan: Clean-Slate Execution & Milestones

> **Document**: 05 of 05  
> **Topic**: Legacy Codebase Retirement, Phased Build Steps & Verification Criteria

---

## 1. Clean-Slate Execution Plan

To ensure a seamless transition without broken dependencies, the clean slate will be executed in a structured sequence:

### Step 1: Database & Migrations Reset
1. Remove all old incremental migration files in `pb/pb_migrations/`.
2. Author the consolidated baseline schema migration: `pb/pb_migrations/1780000000_clean_slate_schema.js`.
3. Wipe local SQLite development database:
   ```bash
   rm -rf pb/pb_data/* pb_prod_data/* pb_test_data/*
   ```
4. Start PocketBase to run the clean migration and regenerate TypeScript models:
   ```bash
   npm run dev:pb:direct &
   sleep 3
   npm run gen:types
   kill %1
   ```

### Step 2: Backend Logic & Go Engine Clean-Up
1. Remove obsolete JS hook files in `pb/pb_hooks/` and replace with the modular structure:
   - `pb/pb_hooks/main.pb.js` (Bootstrap & SPA fallback route)
   - `pb/pb_hooks/routes/kingdoms.pb.js` (Create, reset, daily reward, self-tick)
   - `pb/pb_hooks/routes/actions.pb.js` (Explore, build, raze, train, research, shields)
   - `pb/pb_hooks/routes/combat.pb.js` (Attack, probes, missiles)
   - `pb/pb_hooks/routes/sector.pb.js` (Vote, aid, sector state)
2. Re-implement `pkg/engine/` in clean Go modules:
   - `pkg/engine/types.go` (Domain structs matching JSON fields)
   - `pkg/engine/simulation.go` (Deterministic 8-phase tick runner)
   - `pkg/engine/combat.go` (Torus coordinates, battle math, casualties, plunder)
   - `pkg/engine/dispatcher.go` (Multi-core worker pool & SQLite batch transaction)

### Step 3: Frontend Clean-Up & Pico CSS Integration
1. Install Pico CSS:
   ```bash
   npm install @picocss/pico
   ```
2. Create `src/theme.css` with the retro pixel space palette.
3. Replace existing custom components and pages with clean semantic views:
   - Update `src/app.tsx` routing.
   - Retain `src/lib/pocketbase.ts` singleton and update `src/context/auth-context.tsx` for Discord OAuth2.

---

## 2. Milestone Execution Plan

### Milestone 1: Foundation, Schema & Discord Auth
- **Goal**: Establish a rock-solid, clean baseline with database migrations, Discord authentication, Pico CSS theme, and API test harness.
- **Tasks**:
  1. Write `pb/pb_migrations/1780000000_clean_slate_schema.js` and execute migration.
  2. Run `npm run gen:types` to generate `src/types/pb.model.ts`.
  3. Install Pico CSS and create `src/theme.css`.
  4. Implement `src/context/auth-context.tsx` with Discord OAuth2 support and superuser fallback.
  5. Build `src/pages/login.page.tsx`.
  6. Bootstrap API integration test suite (`tests/setup/` and `tests/api/auth.test.ts`).
- **Verification Commands**:
  ```bash
  npm run build:pb
  npm test
  ```
- **Acceptance Criteria**:
  - PocketBase boots cleanly with the new schema and zero migration errors.
  - `npm test` passes authentication tests against `:8092`.
  - Vite dev server renders the login screen with Pico CSS and retro pixel styling.

---

### Milestone 2: Kingdom Creation, Economy & Newbie Step-Engine (First Playable Loop)
- **Goal**: Enable players to log in, found a kingdom with any of the 8 planet archetypes, receive starting assets, and experience the first playable economic growth loop via the 8-step Newbie Mode.
- **Tasks**:
  1. Implement `POST /api/kingdoms/create` with archetype bonuses and starting assets.
  2. Implement Go simulation phases 4, 5, 6 (Research, Population, Economy/Power) in `pkg/engine/simulation.go`.
  3. Implement `POST /api/kingdoms/self-tick/step` advancing 16 ticks per step.
  4. Build `src/pages/create-kingdom.page.tsx` with live archetype selector.
  5. Build `src/pages/status.page.tsx` and the `NewbieStepView` banner.
  6. Write API integration tests for kingdom founding and Newbie step progression.
- **Verification Commands**:
  ```bash
  npm test
  ```
- **Acceptance Criteria**:
  - A user can found a kingdom and be assigned a sector slot.
  - Status page displays correct 250 land, 2,250 civs, 300k gold, and 10k power.
  - Clicking "Advance Step" simulates 16 ticks, updating civilian population, taxes, and power reserves.
  - Reaching Step 8 completes Newbie Mode.

---

### Milestone 3: Infrastructure, Exploration & Research Tech Tree
- **Goal**: Implement territorial expansion, physical construction, and scientific progression.
- **Tasks**:
  1. Implement `POST /api/kingdoms/explore` with `sqrt(land)*111` cost and 24-tick queue.
  2. Implement `POST /api/kingdoms/build` (16-tick queue) and `POST /api/kingdoms/raze` (cost/8 refund).
  3. Implement `POST /api/kingdoms/research/allocate` and one-time breakthrough unlocking.
  4. Wire Go engine Phases 1, 2, 3 to process land and building arrivals on ticks.
  5. Build `src/pages/buildings.page.tsx`, `src/pages/explore.page.tsx`, and `src/pages/research.page.tsx`.
  6. Write integration tests for growth queues and research scaling.
- **Verification Commands**:
  ```bash
  npm test
  ```
- **Acceptance Criteria**:
  - Exploring land locks funds and delivers acres after 24 ticks.
  - Building structures reserves free land and completes after 16 ticks.
  - Research points scale dynamically against $\text{Land}^2$ and unlock technologies.

---

### Milestone 4: Military Logistics & Invasions (Combat Engine)
- **Goal**: Implement the armed forces roster, barracks logistics, Torus travel calculation, and full military invasions with return waves.
- **Tasks**:
  1. Implement `POST /api/kingdoms/train` for all 9 units (24 ticks training time) and Training Camp discount ($\le 30\%$).
  2. Implement `POST /api/kingdoms/attack` enforcing $3\times$ Networth target window.
  3. Implement Torus wrap-around travel time formula and War Leader return waves in Go engine.
  4. Implement battle resolution: base ratings, multipliers, militia baseline defense ($2 \times \text{land}$), attacker casualties (8% minus war shields), defender casualties (5–10%), and plunder (5–10%).
  5. Build `src/pages/military.page.tsx` and `src/pages/attack.page.tsx`.
  6. Write API tests simulating battle outcomes, casualties, and plundered land.
- **Verification Commands**:
  ```bash
  npm test
  ```
- **Acceptance Criteria**:
  - Armies travel across torus coordinates and arrive on schedule.
  - Combat correctly calculates victory/defeat and distributes casualties.
  - Plundered land, money, and population transfer to the victor.
  - Returning troops rejoin the home garrison in staggered waves.

---

### Milestone 5: Espionage Probes, Missiles & Planetary Shields
- **Goal**: Implement covert intelligence gathering, economic sabotage, orbital missile strikes, and power-grid shielding.
- **Tasks**:
  1. Implement probe manufacturing (50–100% of factories) and 10 stored credits bank.
  2. Implement `POST /api/kingdoms/probe` covering all 11 operations (SoK, SoM, Arson, Rob, Suicide, etc.) with the exact probability formula and FDC detection.
  3. Implement `POST /api/kingdoms/shields/set` for Missile, Military, and Probe shields with 1% power gen upkeep per level.
  4. Implement `POST /api/kingdoms/missile/fire` for Nuclear, Fusion, and Energy missiles.
  5. Build `src/pages/probes.page.tsx` and `src/pages/missiles.page.tsx`.
  6. Write API tests for probe operations, shield interception, and missile damage caps.
- **Verification Commands**:
  ```bash
  npm test
  ```
- **Acceptance Criteria**:
  - Probes accurately gather intelligence or execute sabotage.
  - Active shields reduce incoming attack power, scramble probes, and intercept missiles.
  - Running out of power induces grid blackout, immediately disabling shields.

---

### Milestone 6: Sector Politics, Alliances, Emergency Aid & Scores
- **Goal**: Complete the multiplayer meta-game with democratic elections, sector governance, emergency aid relief, and global leaderboards.
- **Tasks**:
  1. Implement 10-kingdom sector matrix and Monarch voting (`POST /api/sector/vote`).
  2. Implement sector tax collection and Monarch sector state proclamations.
  3. Implement Trouble Status (MA $\ge 30\%$, 12h freeze) and emergency aid transfers (`POST /api/sector/aid`, 50% NW cap).
  4. Implement galaxy leaderboards sorting by Networth, Land, Military, and Honor.
  5. Build `src/pages/sector.page.tsx` and `src/pages/scores.page.tsx`.
  6. Write comprehensive round lifecycle and multi-sector integration tests.
- **Verification Commands**:
  ```bash
  npm test
  npm run build
  ```
- **Acceptance Criteria**:
  - Sector Monarch elected by democratic majority receives +10% combat buff.
  - Devastated players entering Trouble Status receive emergency aid from sector allies.
  - Full game build (`npm run build`) bundles the SPA into `pb/pb_public/` ready for production deployment.
