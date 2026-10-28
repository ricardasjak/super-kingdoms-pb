# Implementation Plan: Database Schema & PocketBase

> **Document**: 01 of 05  
> **Topic**: SQLite Data Models, PocketBase Schema, API Rules & Type Generation

---

## 1. Overview & Strategy

PocketBase provides the persistence layer via SQLite in WAL mode. To keep the database lean, fast, and lock-free during Go parallel ticks:
1. **Core Relational Collections**: `users`, `game_status`, `sectors`, `kingdoms`, `military_deployments`, `aid_packages`, `game_news`.
2. **Dense Structs stored as JSON Fields**: Sub-domain data that is always accessed and modified together with a kingdom (`buildings`, `building_queue`, `military`, `training_queue`, `research`, `shields`) is stored as typed JSON fields within the `kingdoms` record. This prevents multi-table join bottlenecks and lets the Go simulation engine process a kingdom in a single read-update cycle.
3. **Clean Initial Migration**: Replace existing migrations with a single consolidated baseline migration `1780000000_clean_slate_schema.js`.

---

## 2. Collection Schemas

### 2.1 `game_status` (System Singleton)
Stores global round progression, timing, and phase gating.

| Field Name | Type | Options / Rules | Description |
|---|---|---|---|
| `round_number` | `number` | Required, min 1 | Active round sequence number |
| `phase` | `select` | `['newbie', 'pvp', 'concluded']` | Active game phase (PvE skipped) |
| `current_tick` | `number` | Required, min 0 | Current simulated hour (0 to 960) |
| `max_ticks` | `number` | Default 960 | Round completion tick |
| `tick_interval_seconds` | `number` | Default 3600 | Real-world seconds per global tick |
| `is_paused` | `bool` | Default false | Admin emergency pause |
| `phase_ends_at` | `date` | Optional | Scheduled timestamp for next phase transition |

**API Rules**:
- View: `@request.auth.id != ""` (Any authenticated player)
- Create / Update / Delete: Superuser only

---

### 2.2 `sectors`
Stores the 10x10 torus galaxy grid (100 sectors max, 10 kingdoms per sector).

| Field Name | Type | Options / Rules | Description |
|---|---|---|---|
| `sector_number` | `number` | Required, unique, 0 to 99 | Sector index identifier |
| `grid_x` | `number` | Required, 0 to 9 | Torus horizontal coordinate |
| `grid_y` | `number` | Required, 0 to 9 | Torus vertical coordinate |
| `name` | `text` | Max 60 chars | Sector name |
| `leader_id` | `relation` | Target `kingdoms`, optional | Elected Monarch |
| `tax_rate` | `number` | Min 0, max 5, default 0 | Sector tax rate (%) levied on gross income |
| `fund` | `number` | Min 0, default 0 | Shared sector treasury |
| `state` | `select` | `['normal', 'peaceful', 'expansionist', 'offensive', 'defensive', 'mobilization']` | Active sector state buff |
| `enhancements` | `json` | Default `[]` | Array of built orbital stations / enhancements |

**API Rules**:
- View: Any authenticated user
- Create / Delete: Superuser only
- Update: Custom hook (`/api/sector/vote`, `/api/sector/state`) or Superuser

---

### 2.3 `kingdoms` (Core Player Entity)
Represents a ruler's realm. Exactly one active kingdom per user.

| Field Name | Type | Options / Rules | Description |
|---|---|---|---|
| `user` | `relation` | Target `users`, required, unique | Account owner |
| `name` | `text` | Required, min 3, max 30 chars | Kingdom title |
| `planet_type` | `select` | 8 classic planet types | Homeworld archetype (locked) |
| `sector` | `relation` | Target `sectors`, required | Assigned sector |
| `sector_slot` | `number` | 0 to 9 | Seat within the sector (max 10) |
| `state` | `select` | `['normal', 'trouble', 'dead']` | Operational status |
| `trouble_until_tick` | `number` | Default 0 | Tick when Trouble Status expires |
| `ma_protection` | `number` | Min 0, max 50, default 0 | Multiple Attack damage reduction (%) |
| `land` | `number` | Min 1, default 250 | Total territory in acres |
| `free_land` | `number` | Min 0, default 200 | Unbuilt acres available for construction |
| `population` | `number` | Min 0, default 2250 | Civilian population |
| `money` | `number` | Min 0, default 300000 | Treasury credits |
| `power` | `number` | Min 0, default 10000 | Stored electrical energy |
| `probes` | `number` | Min 0, default 0 | Active probe inventory |
| `probe_credits` | `number` | Min 0, max 10, default 10 | Available probe mission bank |
| `networth` | `number` | Min 0 | Total composite net worth |
| `honor` | `number` | Default 1500 | War Honor standing |
| `newbie_step` | `number` | Min 0, max 8, default 0 | Progression step in Newbie Mode |
| `is_newbie` | `bool` | Default true | True while in 8-step newbie phase |
| `last_daily_reward_tick`| `number` | Default 0 | Last tick when daily grant was claimed |
| `daily_explored_land` | `number` | Default 0 | Acres explored in current 24h cycle |
| `daily_drafted_soldiers`| `number` | Default 0 | Soldiers drafted in current 24h cycle |
| `vote_kingdom_id` | `relation` | Target `kingdoms`, optional | Cast vote for Sector Leader |
| `shields` | `json` | Required | `{ missile: 0..10, military: 0..10, probe: 0..10 }` |
| `buildings` | `json` | Required | `{ res, plants, rax, sm, pf, tc, asb }` |
| `building_queue` | `json` | Default `[]` | `[{ type: string, count: number, completion_tick: number }]` |
| `land_queue` | `json` | Default `[]` | `[{ acres: number, completion_tick: number }]` |
| `military` | `json` | Required | `{ sol, tr, dr, lt, ld, ft, t, tf, sci }` |
| `training_queue` | `json` | Default `[]` | `[{ unit: string, count: number, completion_tick: number }]` |
| `research` | `json` | Required | Continual points + one-time tech booleans |
| `auto_research_allocation` | `json` | Default `{}` | `{ pop: %, power: %, mil: %, money: %, warp: %, fdc: % }` |

**API Rules**:
- View: Any authenticated user (public fields); sensitive fields filtered via API
- Create: Custom hook `/api/kingdoms/create` or Superuser
- Update: Custom game hooks or Superuser
- Delete: Custom hook `/api/kingdoms/reset` or Superuser

---

### 2.4 `military_deployments`
Tracks armies dispatched on offensive operations across the torus grid.

| Field Name | Type | Options / Rules | Description |
|---|---|---|---|
| `attacker_id` | `relation` | Target `kingdoms`, required | Launching kingdom |
| `target_id` | `relation` | Target `kingdoms`, required | Defending kingdom |
| `general_index` | `number` | 1 to 4 | Deployed War Leader slot |
| `units` | `json` | Required | Breakdown of dispatched combat units |
| `war_shields_power` | `number` | Min 0 | Power allocated for war shielding |
| `departure_tick` | `number` | Required | Launch tick |
| `arrival_tick` | `number` | Required | Strike resolution tick |
| `return_waves` | `json` | Required | `[{ wave: number, units: object, return_tick: number }]` |
| `status` | `select` | `['outbound', 'returning', 'completed']` | Deployment phase |
| `combat_report` | `json` | Optional | Battle outcome, casualties, and plunder |

---

### 2.5 `aid_packages`
Records emergency aid dispatched to kingdoms in Trouble Status.

| Field Name | Type | Options / Rules | Description |
|---|---|---|---|
| `sender_id` | `relation` | Target `kingdoms`, required | Donor kingdom |
| `recipient_id` | `relation` | Target `kingdoms`, required | Kingdom in Trouble Status |
| `resources` | `json` | Required | `{ money, power, soldiers, civs }` |
| `aid_points` | `number` | Required | Consumed aid points against the 50% NW cap |
| `tick` | `number` | Required | Delivery tick |

---

### 2.6 `game_news`
Stores event logs for Kingdom News, Sector News, and Universe News.

| Field Name | Type | Options / Rules | Description |
|---|---|---|---|
| `scope` | `select` | `['kingdom', 'sector', 'universe']` | Visibility boundary |
| `kingdom_id` | `relation` | Target `kingdoms`, optional | Target kingdom (for personal news) |
| `sector_id` | `relation` | Target `sectors`, optional | Target sector (for sector news) |
| `event_type` | `text` | E.g., `attack`, `probe`, `election` | Category tag |
| `headline` | `text` | Max 120 chars | Brief summary |
| `content` | `text` | Full details | Detailed event narrative |
| `tick` | `number` | Required | Occurrence tick |

---

## 3. Migration File Specification

A single code-first migration file `pb/pb_migrations/1780000000_clean_slate_schema.js` will register all collections, relations, and default indexes:

```javascript
/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  // 1. Ensure game_status collection exists
  // 2. Ensure sectors collection exists with grid_x, grid_y, sector_number
  // 3. Ensure kingdoms collection exists with user relation & typed JSON fields
  // 4. Ensure military_deployments collection exists
  // 5. Ensure aid_packages collection exists
  // 6. Ensure game_news collection exists
  // 7. Seed Sector 0..99 records on 10x10 torus
  // 8. Seed initial game_status record (round 1, phase: newbie, current_tick: 0)
}, (db) => {
  // Rollback logic
})
```

---

## 4. TypeScript Type Generation Workflow

After running the migration with `npm run dev:pb`, execute:
```bash
npm run gen:types
```
This updates `src/types/pb.model.ts`, guaranteeing compile-time type safety across all React components and queries:
```typescript
import { pb } from '../lib/pocketbase';
import type { KingdomsRecord, GameStatusRecord } from '../types/pb.model';

const kingdom = await pb.collection('kingdoms').getOne<KingdomsRecord>(id);
```
