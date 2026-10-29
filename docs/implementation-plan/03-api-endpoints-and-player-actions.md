# Implementation Plan: API Endpoints & Player Actions

> **Document**: 03 of 05  
> **Topic**: HTTP Routing, Discord OAuth2, Validation & Kingdom Operations

---

## 1. Authentication Flow

### 1.1 Discord OAuth2 (Human Players)
Human players authenticate exclusively using Discord OAuth2, handled natively by PocketBase:
```typescript
// src/context/auth-context.tsx
import { pb } from '../lib/pocketbase';

export async function loginWithDiscord() {
  const authData = await pb.collection('users').authWithOAuth2({
    provider: 'discord',
    scopes: ['identify', 'email'],
  });
  return authData;
}
```
- PocketBase automatically provisions or logs into the corresponding `users` record.
- The `pb.authStore` persists the JWT in `localStorage` across page reloads.

### 1.2 Password Authentication (Superusers & Automated Testing)
- Superuser credentials (`admin@superkingdoms.internal`) are upserted via CLI during initialization.
- Vitest integration tests use `superuser` or test password logins to seed databases and bypass client-facing rate gates.

---

## 2. Kingdom Management Endpoints

### 2.1 `POST /api/kingdoms/create`
Founds a new kingdom for the authenticated user.
- **Request Body**:
  ```json
  { "name": "Nova Terra", "planet_type": "Volcanic Inferno" }
  ```
- **Validation**:
  - Authenticated user must not already own a non-dead kingdom in the current round.
  - `name`: 3–30 characters, alphanumeric with spaces.
  - `planet_type`: Must be one of the 8 canonical types.
- **Execution**:
  1. Find the next open sector slot across the galaxy (Sectors 0 to 99, 10 slots per sector).
  2. Provision the `kingdoms` record with baseline assets (250 land, 2,250 civs, 300k gold, 10k power, 200 sol, 100 sci).
  3. Apply planet-specific starter assets (e.g., Volcanic gets Fusion Tech + 10 Fusion Missiles; Forest gets +500 Soldiers; Desert gets Dragoons unlocked).
  4. Place starter building distribution (20 Res, 10 Plants, 10 Rax, 10 SM, 200 Free Land).
  5. Compute initial Networth.
- **Response**: `200 OK` with populated kingdom record.

### 2.2 `POST /api/kingdoms/reset`
Wipes the active kingdom and restarts Newbie Mode.
- **Constraint**: Only allowed during Phase 1 (Newbie Mode).
- **Execution**: Deletes existing kingdom and associated queues, allowing `/api/kingdoms/create` to be called again.

### 2.3 `POST /api/kingdoms/self-tick/step`
Advances the kingdom by 1 progression step (24 engine ticks).
- **Constraint**: `is_newbie == true` and `newbie_step < 8`.
- **Execution**: Invokes Go simulation engine for 24 batch ticks on the caller's realm. Increments `newbie_step`. If step reaches 8, marks `is_newbie = false`.
- **Response**: `200 OK` with updated kingdom stats and 24-tick event delta.

### 2.4 `POST /api/game/daily-reward`
Claims the once-per-24h territorial and treasury subsidy.
- **Constraint**: Current tick $\ge \text{last_daily_reward_tick} + 24$.
- **Execution**:
  - Grant $+10\text{ free land}$.
  - Grant $+3 \times \text{Gross Hourly Revenue}$.
  - Update `last_daily_reward_tick = current_tick`.

---

## 3. Infrastructure & Scientific Endpoints

### 3.1 `POST /api/kingdoms/explore`
Dispatches an exploration survey for unbuilt acres.
- **Request Body**: `{ "acres": 25 }`
- **Validation**:
  - $\text{acres} \le \lfloor\text{Land} \times 0.10\rfloor - \text{daily_explored_land}$.
  - Treasury has sufficient funds: $\text{Cost} = \text{acres} \times \text{round}(\sqrt{\text{Land}} \times 111)$. Apply sector *Expansionist* discount if active.
- **Execution**:
  - Deduct money from treasury.
  - Increment `daily_explored_land += acres`.
  - Append to `land_queue`: `{ acres, completion_tick: current_tick + 24 }`.

### 3.2 `POST /api/kingdoms/build`
Places construction orders on free territory.
- **Request Body**:
  ```json
  { "orders": { "res": 10, "plants": 5, "rax": 5, "sm": 0, "pf": 0, "tc": 0, "asb": 0 } }
  ```
- **Validation**:
  - $\sum \text{orders} \le \text{free_land}$.
  - Required research completed (e.g., Air Support Bays require `r_tf`).
  - Total Cost $\le \text{money}$: $\text{Cost} = \sum \text{orders} \times \text{round}(\sqrt{\text{Land}} \times 63)$.
- **Execution**:
  - Deduct money; reserve free land: $\text{free_land} \leftarrow \text{free_land} - \sum \text{orders}$.
  - Append each batch to `building_queue`: `{ type, count, completion_tick: current_tick + 16 }`.

### 3.3 `POST /api/kingdoms/raze`
Demolishes existing structures to reclaim free land.
- **Request Body**: `{ "orders": { "res": 5 } }`
- **Execution**:
  - Deduct counts from `buildings[type]`.
  - Reclaim free land: $\text{free_land} \leftarrow \text{free_land} + \sum \text{orders}$.
  - Credit scrap refund: $\text{money} \leftarrow \text{money} + \sum \text{orders} \times \lfloor\text{BuildingCost}/8\rfloor$.

### 3.4 `POST /api/kingdoms/research/allocate`
Updates continuous research sliders.
- **Request Body**:
  ```json
  { "allocation": { "pop": 20, "power": 20, "mil": 30, "money": 30, "warp": 0, "fdc": 0 } }
  ```
- **Validation**: $\sum \text{allocation} == 100\%$. Warp research requires `r_core`.
- **Execution**: Updates `auto_research_allocation` on kingdom record.

---

## 4. Military & Espionage Endpoints

### 4.1 `POST /api/kingdoms/train`
Enlists civilians into soldiers or trains soldiers into specialists.
- **Request Body**:
  ```json
  { "units": { "sol": 100, "tr": 50, "t": 10 } }
  ```
- **Validation**:
  - Soldier enlistment $\le \lfloor\text{Civilian Population} \times 0.10\rfloor - \text{daily_drafted_soldiers}$.
  - Sufficient unassigned Soldiers available to train into requested specialists.
  - Training camp discount applied: $\text{Discount} = \min(30\%, \lfloor(\text{TC}/\text{Land}) \times 300\rfloor)$.
  - Sufficient treasury funds.
- **Execution**:
  - Deduct money and draft civilians / convert soldiers.
  - Append each unit batch to `training_queue`: `{ unit, count, completion_tick: current_tick + 24 }`.

### 4.2 `POST /api/kingdoms/attack`
Launches an offensive combined-arms strike across the galaxy torus grid.
- **Request Body**:
  ```json
  {
    "target_id": "kd_target_123",
    "general_slot": 1,
    "units": { "tr": 500, "t": 100 },
    "war_shields_power": 5000
  }
  ```
- **Validation**:
  - Game phase must be Phase 2 (PvP).
  - Target within $3\times$ Networth window: $\frac{1}{3}\text{AttackerNW} \le \text{TargetNW} \le 3\times\text{AttackerNW}$.
  - General slot (1 to 4) is currently stationed home (`status == AVAILABLE`).
  - Units and power requested are available in the homeland inventory.
- **Execution**:
  1. Calculate travel time $T$ using Torus wrap-around coordinate distance (GDD 05 §3.7).
  2. Deduct units from attacker's stationed garrison; deduct power for War Shields.
  3. Create `military_deployments` record with `departure_tick = current_tick`, `arrival_tick = current_tick + T`.
  4. Precompute return wave schedule ($N$ segments).
- **Response**: `200 OK` with estimated arrival time and combat force estimate.

### 4.3 `POST /api/kingdoms/probe`
Executes an intelligence or sabotage covert operation.
- **Request Body**:
  ```json
  {
    "target_id": "kd_target_123",
    "mission": "sok",
    "probes_sent": 150
  }
  ```
- **Validation**:
  - Caller has $\ge 1$ stored probe credit.
  - Probes requested $\le$ available probe pool.
  - Target within $3\times$ Networth window.
- **Execution**:
  1. Deduct 1 probe credit.
  2. Compute success probability:
     $$\text{Chance} = \text{clamp}\left(\frac{\text{ProbesSent}}{\text{DefProbes} + (\text{DefLand} \times 4)} \times 100, \; 20\%, \; 95\%\right) - \text{DefProbeShields}\%$$
  3. Deduct probe casualties (10–20% on failure; halved if Probe Armor researched).
  4. If successful: compile intel report (SoK, SoM, SoR, etc.) or execute sabotage effect (Arson, Rob, Power Overload, Kidnap).
  5. Check defender FDC research: if triggered, post attacker ID to defender's news.
- **Response**: `200 OK` with mission outcome and intelligence dossier.

### 4.4 `POST /api/kingdoms/shields/set`
Configures active power shielding levels.
- **Request Body**:
  ```json
  { "missile": 5, "military": 10, "probe": 2 }
  ```
- **Validation**: Each array value between 0 and 10.
- **Execution**: Updates `shields` object on kingdom record. Hourly power upkeep will apply automatically during Phase 6 of the next tick.

---

## 5. Sector Governance & Emergency Aid Endpoints

### 5.1 `POST /api/sector/vote`
Casts the kingdom's democratic vote for Sector Leader.
- **Request Body**: `{ "candidate_kingdom_id": "kd_456" }`
- **Validation**: Target kingdom must belong to the caller's sector.
- **Execution**: Updates `vote_kingdom_id`. Tally evaluated hourly; winning $> 50\%$ votes confers Monarch status (+10% combat ratings).

### 5.2 `POST /api/sector/aid`
Sends emergency resources to an ally in Trouble Status.
- **Request Body**:
  ```json
  {
    "recipient_id": "kd_789",
    "resources": { "money": 100000, "power": 5000, "soldiers": 200, "civilians": 0 }
  }
  ```
- **Validation**:
  - Recipient must be in caller's sector or formal alliance.
  - Recipient must have `state == 'trouble'` and `trouble_until_tick > current_tick`.
  - Calculate Aid Points:
    $$\text{Points} = (\text{Soldiers} \times 100) + (\text{Civilians} \times 25) + \text{Power} + (\text{Money} \times 0.10)$$
  - Aid Points must not exceed recipient's remaining ceiling ($50\%$ of recipient Networth at trouble trigger).
- **Execution**:
  - Transfer resources immediately.
  - Record entry in `aid_packages` and publish announcement to Sector News.
