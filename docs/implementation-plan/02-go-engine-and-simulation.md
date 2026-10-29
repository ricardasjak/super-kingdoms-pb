# Implementation Plan: Native Go Tick Engine & Simulation Math

> **Document**: 02 of 05  
> **Topic**: Go Simulation Engine (`pkg/engine/`), Concurrency Architecture, Mathematical Determinism & Queues

---

## 1. Concurrency & Concurrency Model

Super Kingdoms simulates 1 in-game hour per tick. A standard round spans **960 ticks**. The simulation engine is implemented directly in native Go inside `pkg/engine/`, compiled as part of the PocketBase binary.

### Architectural Diagram
```
┌────────────────────────────────────────────────────────┐
│           Tick Trigger (Cron or HTTP API)              │
│               POST /api/game/advance-tick              │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           PocketBase Native Go Dispatcher              │
│  1. Check gameStatus (phase != 'concluded', !paused)   │
│  2. Increment current_tick in gameStatus               │
│  3. Fetch all active kingdoms & deployments            │
│  4. Partition kingdoms into NumCPU slices              │
└───────────────┬────────────────────────────┬───────────┘
                │                            │
   ┌────────────┴────────────┐  ┌────────────┴────────────┐
   │ Goroutine 1 (Core 1)    │  │ Goroutine N (Core N)    │
   │ Slices [0 : N/cores]    │  │ Slices [...]            │
   │ Deterministic Phases 1-8│  │ Deterministic Phases 1-8│
   └────────────┬────────────┘  └────────────┬────────────┘
                │                            │
                └─────────────┬──────────────┘
                              ▼
                ┌────────────────────────────┐
                │       sync.WaitGroup       │
                │   (All workers finish)     │
                └─────────────┬──────────────┘
                              ▼
                ┌────────────────────────────┐
                │   Single-Writer SQLite     │
                │     Batch Transaction      │
                │  - Prepared UPDATE stmt    │
                │  - Zero lock contention    │
                └────────────────────────────┘
```

---

## 2. Deterministic 8-Phase Kingdom Simulation

Each kingdom is updated deterministically in the following strict order on every tick $T$:

### Phase 1: Exploration Queue
- Inspect `land_queue`. Any batch with `completion_tick <= T` arrives:
  $$\text{Land} \leftarrow \text{Land} + \text{ArrivedAcres}$$
  $$\text{FreeLand} \leftarrow \text{FreeLand} + \text{ArrivedAcres}$$
- Remove completed batches from queue.

### Phase 2: Building Queue
- Inspect `building_queue`. Any batch with `completion_tick <= T` finishes construction:
  $$\text{Buildings}[type] \leftarrow \text{Buildings}[type] + \text{Count}$$
- Remove completed batches from queue.

### Phase 3: Military Training Queue
- Inspect `training_queue`. Any batch with `completion_tick <= T` completes:
  $$\text{Military}[unit] \leftarrow \text{Military}[unit] + \text{Count}$$
- Remove completed batches from queue.

### Phase 4: Scientific Research
- Each stationed scientist generates **1 research point**:
  $$\text{Total Points Generated} = \text{Military}[\text{sci}]$$
- Distribute points across Continual fields according to player's `auto_research_allocation` percentages.
- Recalculate continual percentage bonus for each field:
  $$\text{Bonus } \% = \min\left(\text{MaxBonus}, \; \text{MaxBonus} \times \frac{\text{PointsAccumulated}}{(\text{Total Land})^2 \times \text{FieldFactor}}\right)$$
  - *Factors*: Pop (`0.00475`), Power (`0.00311`), Mil (`0.00291`), Money (`0.00535`), Warp (`0.00173`), FDC (`0.00040`).
  - *Oceanic*: Multiply required points by $1.10\times$.

### Phase 5: Demographics & Housing Capacity
- **Residence Capacity**:
  $$\text{Base Cap} = \begin{cases} 55 & \text{if Longevity researched} \\ 50 & \text{otherwise} \end{cases}$$
  $$\text{Max Res Cap} = \text{Buildings}[\text{res}] \times \text{Base Cap} \times (1 + \text{PopBonus}\%)$$
- **Barracks Capacity**:
  $$\text{Rax Slots} = \text{Buildings}[\text{rax}] \times 75$$
  $$\text{Troop Demand} = \sum_{\text{infantry/sci}} \text{count} + (\text{Tanks} \times 2)$$
  $$\text{Barracks Overcrowding} = \max(0, \; \text{Troop Demand} - \text{Rax Slots})$$
- **Net Civilian Capacity**:
  $$\text{Max Population} = \max(0, \; \text{Max Res Cap} - \text{Barracks Overcrowding})$$
- **Population Change**:
  - If $\text{Population} < \text{Max Population}$:
    $$\Delta \text{Pop} = \min\left(\lfloor\text{Population} \times 0.025\rfloor, \; \text{Max Population} - \text{Population}\right)$$
  - If $\text{Population} > \text{Max Population}$:
    $$\Delta \text{Pop} = -\min\left(\lfloor\text{Population} \times 0.05\rfloor, \; \text{Population} - \text{Max Population}\right)$$
  $$\text{Population} \leftarrow \max(0, \; \text{Population} + \Delta \text{Pop})$$
  *(If Population reaches 0, set state to `'dead'`)*.

### Phase 6: Economy & Power Grid
- **Gross Revenue**:
  $$\text{Base Tax} = \text{Population} \times 1.95$$
  $$\text{Mine Revenue} = \text{Buildings}[\text{sm}] \times 120 \quad [\text{Forest gets } +25/\text{mine}]$$
  $$\text{Gross Income} = (\text{Base Tax} + \text{Mine Revenue}) \times (1 + \text{MoneyBonus}\%)$$
  - Apply hidden $\pm 5\%$ tick fluctuation:
    $$\text{Realized Income} = \text{Gross Income} \times (1 + \text{Random}(-0.05, +0.05))$$
  - Siphon Sector Tax:
    $$\text{Sector Cut} = \text{Realized Income} \times (\text{SectorTaxRate} / 100)$$
    $$\text{Net Income} = \text{Realized Income} - \text{Sector Cut}$$
    $$\text{Money} \leftarrow \text{Money} + \text{Net Income}$$
- **Power Grid**:
  - **Generation**:
    $$\text{Base Gen} = \text{Buildings}[\text{plants}] \times 100 \times (1 + \text{PowerBonus}\% + \text{FusionBonus} + \text{CoreBonus})$$
  - **Demand**:
    $$\text{Civ Load} = \text{Population} \times 0.35$$
    $$\text{Military Load} = (\text{BioUnits} + \text{sci}) \times 0.7 + (\text{Tanks} + \text{TF}) \times 1.4$$
    *(Volcanic Inferno cuts military load by $70\%$)*.
    $$\text{Shield Load} = \text{Total Shield Levels (0..30)} \times 0.01 \times \text{Base Gen}$$
    $$\text{Total Load} = \text{Civ Load} + \text{Military Load} + \text{Shield Load}$$
  - **Net Balance**:
    $$\Delta \text{Power} = \text{Base Gen} - \text{Total Load}$$
    $$\text{Power} \leftarrow \text{clamp}(\text{Power} + \Delta \text{Power}, \; 0, \; \text{MaxStorage})$$
    *(Storage: $1,000/\text{plant}$; Volcanic gets $10,000/\text{plant}$)*.
  - **Blackout State**: Triggered if $\text{Power} == 0 \text{ and } \Delta \text{Power} < 0$. (Inflicts $-20\%$ combat ratings, collapses shields).

### Phase 7: Military Deployments & Return Waves
- For each active `military_deployment`:
  - If `status == 'outbound'` and `arrival_tick <= T`:
    - Execute combat resolution against defender garrison (see §3).
    - Deduct casualties from attacker and defender.
    - Transfer plundered land, civs, money, power.
    - Generate `combat_report` and post to `game_news`.
    - Split surviving attacking force into $N$ return waves.
    - Set `status = 'returning'`.
  - If `status == 'returning'`:
    - For each wave with `return_tick <= T`:
      - Reinstate units into attacker's home garrison.
    - If all waves returned, set `status = 'completed'`.

### Phase 8: Post-Tick Maintenance & Networth
- **MA Protection**:
  $$\text{MA} \leftarrow \max(0, \; \text{MA} - 2\%)$$
- **Trouble Status**:
  - If $\text{trouble_until_tick} \le T$, reset status from `'trouble'` to `'normal'`.
- **Probes**:
  $$\text{New Probes} = \lfloor\text{Buildings}[\text{pf}] \times \text{Random}(0.50, 1.00)\rfloor$$
  $$\text{Probes} \leftarrow \text{Probes} + \text{New Probes}$$
  $$\text{Probe Credits} \leftarrow \min(10, \; \text{Probe Credits} + 1)$$
- **Networth (NW) Recalculation**:
  Sum of all 13 weighted asset categories (GDD 12 §3.1).

---

## 3. Combat Resolution Algorithm

```go
func ResolveCombat(attacker *Kingdom, defender *Kingdom, sentUnits Units, warShieldsPower int) CombatResult {
    // 1. Calculate base ratings
    baseOffense := sentUnits.CalcOffense()
    baseDefense := defender.StationedUnits().CalcDefense()
    
    // 2. Multipliers
    offMult := 100 + attacker.PlanetOffMod() + attacker.ResearchMilBonus() + (sentUnits.Generals - 1)*3
    if attacker.IsMonarch() { offMult += 10 }
    if attacker.IsBlackout() { offMult -= 20 }
    offMult -= defender.Shields.Military // -1% per active military shield
    
    defMult := 100 + defender.PlanetDefMod() + defender.ResearchMilBonus()
    if defender.IsMonarch() { defMult += 10 }
    if defender.IsBlackout() { defMult -= 20 }
    
    totalOffense := (baseOffense * offMult) / 100
    totalDefense := (baseDefense * defMult) / 100
    
    // 3. Baseline militia defense (BCart rule: defender land * 2)
    militiaDefense := defender.Land * 2
    effectiveDefense := max(totalDefense, militiaDefense)
    
    // 4. Outcome
    isVictory := totalOffense >= effectiveDefense + 1
    
    // 5. Casualties & Plunder
    // Attacker loss: 8% minus war shield coverage (costs 5 power/bio, 15 power/mech)
    // Defender loss: 5% to 10% based on defender NW / attacker NW ratio
    // Plunder: 5% to 10% scaled by relative NW, mitigated by defender MA%
    ...
}
```

---

## 4. Newbie Mode Step-Engine Runner

In Phase 1 (Global Newbie Mode), the global clock is frozen for player kingdoms. Each player advances independently via **8 Progression Steps**:
- A step triggers a synchronous call to the Go engine:
  ```go
  func (e *Engine) AdvanceKingdomNewbieStep(kingdomId string) error
  ```
- The engine runs **24 consecutive ticks** for that single kingdom in an isolated in-memory loop (advancing $8 \times 24 = 192$ ticks total across all 8 steps), committing the final state to SQLite in one batch.
- On completing Step 8, the kingdom's `is_newbie` flag is cleared, and it awaits the round's global transition to Phase 2 (PvP Mode).
