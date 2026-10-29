# Requirements: Simulation Engine & Newbie Mode

> **Requirement ID**: REQ-03  
> **Topic**: Deterministic 8-Phase Tick Engine, Economy, Demographics & Newbie Progression  
> **Status**: Approved  
> **Traceability**: [`docs/game-design/09-economy-and-population.design.md`](../game-design/09-economy-and-population.design.md), [`docs/implementation-plan/02-go-engine-and-simulation.md`](../implementation-plan/02-go-engine-and-simulation.md), [`tests/api/kingdoms.test.ts`](../../tests/api/kingdoms.test.ts)

---

## 1. Deterministic Tick Simulation

The system **SHALL** execute tick updates deterministically through the native Go engine according to an 8-phase sequence:

### 1.1 Phase 1–3: Queues Resolution
- **Phase 1 (Exploration)**: Inspect `land_queue`. Completed batches arrival:
  $$\text{Land} \leftarrow \text{Land} + \text{Acres}, \quad \text{FreeLand} \leftarrow \text{FreeLand} + \text{Acres}$$
- **Phase 2 (Construction)**: Inspect `building_queue`. Completed batches increment corresponding building count.
- **Phase 3 (Training)**: Inspect `training_queue`. Completed batches increment corresponding military garrison count.

### 1.2 Phase 4: Scientific Research
- Scientists stationed in the realm **SHALL** produce 1 research point per tick:
  $$\text{Points} = \text{Military}[\text{sci}]$$
- Points **SHALL** be allocated according to the kingdom's `auto_research_allocation` distribution across Continual fields (Population, Power, Military, Money, Warp, FDC).
- Continual percentage bonuses **SHALL** scale inversely with $\text{Land}^2 \times \text{Factor}$.

### 1.3 Phase 5: Demographics & Civilian Growth
- Housing capacity **SHALL** be bounded by Residences (`res` $\times 50$ baseline, modified by population research bonus).
- Barracks overcrowding **SHALL** reduce net civilian housing capacity:
  $$\text{Overcrowding} = \max(0, \; \text{Troop Demand} - \text{Barracks Capacity})$$
  $$\text{Max Population} = \max(0, \; \text{Max Res Cap} - \text{Overcrowding})$$
- When $\text{Population} < \text{Max Population}$, civilian count **SHALL** grow by:
  $$\Delta \text{Pop} = \min\left(\lfloor\text{Population} \times 0.025\rfloor, \; \text{Max Population} - \text{Population}\right)$$
- When $\text{Population} > \text{Max Population}$, overcrowding deaths **SHALL** occur at $5\%$ per tick.
- If Population reaches 0, kingdom state **SHALL** transition to `'dead'`.

### 1.4 Phase 6: Economy & Energy Balance
- **Taxation & Treasury**:
  $$\text{Gross Income} = (\text{Population} \times 1.95 + \text{StarMines} \times 120) \times (1 + \text{MoneyBonus}\%)$$
  - Forest archetypes receive $+25$ Money per Star Mine.
  - Siphon Sector Tax rate into sector fund; remaining net income added to treasury.
- **Power Grid**:
  $$\text{Base Gen} = \text{Plants} \times 100 \times (1 + \text{PowerBonus}\% + \text{FusionBonus})$$
  $$\text{Load} = \text{Population} \times 0.35 + \text{BioUnits} \times 0.7 + \text{MechUnits} \times 1.4 + \text{ShieldUpkeep}$$
  - Volcanic archetype cuts military load by $70\%$.
  - Energy is stored up to plant storage capacity ($1,000/\text{plant}$; $10,000/\text{plant}$ for Volcanic).
  - If Power exhausts and net balance is negative, a Blackout condition **SHALL** trigger.

### 1.5 Phase 8: Networth Recalculation
- At the end of every tick, the kingdom's `networth` **SHALL** be recomputed using the canonical valuation formula encompassing land, buildings, military garrison, population, and treasury reserves.

---

## 2. Newbie Mode Step-Engine Runner

### 2.1 Progression Steps
- The system **SHALL** expose `POST /api/kingdoms/self-tick/step` for player-driven progression during Newbie Mode.
- Each invocation **SHALL** advance exactly 24 consecutive simulation ticks for the player's kingdom in an atomic in-memory batch.
- Each step **SHALL** increment `newbie_step` by 1.
- Total Newbie Mode progression **SHALL** consist of 8 distinct steps ($8 \times 24 = 192$ ticks).
- Upon completing Step 8 (`newbie_step == 8`), the system **SHALL** set `is_newbie = false`.
- Any subsequent step advance attempts **SHALL** be rejected with HTTP 400.
