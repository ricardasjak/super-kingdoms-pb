# Game Design: Kingdom Buildings

> **System**: Kingdom Development & Infrastructure
> **Sources of Truth**: [docs/game-manual/buildings.md](../game-manual/buildings.md) & [docs/vindicator-guide/04-the-buildings.md](../vindicator-guide/04-the-buildings.md)

---

## 1. Overview & Role

Buildings form the physical infrastructure of a kingdom, dictating population capacity, energy generation, resource income, military readiness, and espionage output. Every building occupies 1 acre of land and must be constructed on free (unbuilt) land.

---

## 2. Core Mechanics

- **Construction**:
  - Requires free land and sufficient money.
  - Base building cost scales proportionally with total owned land.
- **Razing**:
  - Demolishes buildings immediately to reclaim free land.
  - Yields scrap money refund.
- **Converting**:
  - Converts any non-power plant building into another standard building.
  - Conversion Duration: **24 hours (ticks)**.
- **Overcrowding & Military Eviction**:
  - If military units exceed Barracks capacity, troops overflow into Residences, forcibly evicting civilians and capping demographic growth.
- **Arson Susceptibility**:
  - Residences, Barracks, Powerplants, and Factories can be targeted by hostile probe arson missions.
  - **Star Mines are completely immune to arson and cannot be destroyed.**

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Construction, Demolition & Conversion
- **Building Cost Formula**:
  $$\text{Building Cost} = \text{round}\left(\sqrt{\text{Total Land}} \times 63\right)$$
- **Construction Duration**: Fixed at **16 ticks (hours)** across all building types.
- **Razing Refund Equation**:
  $$\text{Refund Money} = \left\lfloor \frac{\text{Building Cost}}{8} \right\rfloor$$
- **Conversion Duration**: Fixed at $24\text{ ticks (hours)}$.

### 3.2 Demographic Capacities & Growth
- **Residence Base Capacity**: $50\text{ civilians per residence}$.
- **Max Residence Capacity (with Population Research)**:
  $$\text{Capacity} = 50 \times (1 + \text{PopulationBonus}) \quad [\text{Max } 60\text{ civilians}]$$
  *(With Longevity breakthrough technology: Base $55 \to \text{Max } 66$ civilians).*
- **Civilian Energy Consumption**:
  $$\text{Hourly Power Drain} = \text{Civilians} \times 0.35\text{ power/hour}$$
- **Natural Population Growth Rate**:
  $$\text{Max Hourly Growth} = \min(2.5\% \times \text{Current Population}, \; \text{Free Housing Capacity})$$

### 3.3 Barracks & Housing Logistics
- **Barracks Base Capacity**: $75\text{ slots per barrack}$.
- **Housing Slot Consumption**:
  - Soldier, Trooper, Laser Trooper, Dragoon, Laser Dragoon, Scientist: $1\text{ slot}$ each.
  - Tank: $2\text{ slots}$ each.
  - Tactical Fighters: $0\text{ barracks slots}$ (require Air Support Bays at $40/\text{bay}$).
  - Probes: $0\text{ slots}$ (require zero housing).

### 3.4 Economic & Industrial Yields
- **Star Mine Gross Revenue**:
  $$\text{Base Mine Revenue} = 120\text{ money/hour per mine}$$
  - Star Mines require **$0\text{ power}$** and operate at $100\%$ efficiency immediately upon completion.
- **Power Plants**:
  - Single standard structure producing **$100\text{ power/hour}$** and storing up to **$1,000\text{ power}$** each.
  - Output boosted by **Fusion Technology** ($+50\%$) and **Energy Core** ($+20\%$).
  - Volcanic Inferno kingdoms store up to **$10,000\text{ power}$** per plant.
- **Training Camp Recruitment Discount**:
  $$\text{Discount} = \min\left(30\%, \; \left\lfloor\frac{\text{Training Camps}}{\text{Total Land}} \times 300\right\rfloor\right)$$
- **Probe Factory Output**:
  $$\text{Probes Generated / Hour} = (50\% \text{ to } 100\%) \times \text{Factories}$$

---

## 4. Specifications Table

| Building | Primary Output / Role | Housing / Output Metric | Tech Prerequisite |
|---|---|---|---|
| **Residence** | Housing, taxes & drafting | 50 Civilians *(up to 60 with Pop Research; 66 with Longevity)* | None |
| **Barracks** | Military logistics & billeting | 75 Infantry/Scientists *(Tanks take 2 slots)* | None |
| **Star Mine** | Flat mineral extraction | +120 Money / hr *(0 power consumed; arson immune)* | None |
| **Power Plant** | Grid power & storage | +100 Power / hr *(Stores 1,000; Volcanic stores 10,000)* | None |
| **Training Camp** | Training cost discount | $\text{Discount} = \min(30\%, \lfloor(\text{TC}/\text{Land}) \times 300\rfloor)$ | None |
| **Probe Factory** | Probe manufacturing | $(50\% \text{ to } 100\%) \times \text{Factories}$ probes / hr | None |
| **Air Support Bay** | Tactical Fighter dock | 40 Tactical Fighters per Bay Slot | Fighters + Energy Core (300k pts) |

---

## 5. System Synergies & Dependencies

- **Economy & Taxes**: Residences provide tax revenue from civilians; Star Mines provide direct industrial credits.
- **Energy Grid**: Power plants sustain population and military. Military units consume double civilian power.
- **Military Readiness**: Barracks supply bunk space; Training Camps cut military recruitment and upgrade costs.
- **Espionage**: Probe Factories supply the active probe pool for intelligence missions and sabotage.
- **Research Tech Locks**: Fusion Plants and Air Support Bays remain locked until their corresponding research projects finish.
