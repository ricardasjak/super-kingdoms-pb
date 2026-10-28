# Game Design: Kingdom Buildings

> **System**: Kingdom Development & Infrastructure  
> **Source of Truth**: [docs/game-manual/buildings.md](../game-manual/buildings.md)

---

## 1. Overview & Role

Buildings form the physical infrastructure of a kingdom, dictating population capacity, energy generation, resource income, military readiness, and espionage output. Every building occupies 1 acre of land and must be constructed on free (unbuilt) land.

---

## 2. Core Mechanics & Formulas

- **Construction**:
  - Requires free land and sufficient money.
  - Base building cost scales proportionally with total owned land.
- **Razing**:
  - Demolishes buildings immediately to reclaim free land.
  - Yields scrap money:
    $$\text{Refund} = \frac{\text{Building Cost}}{8}$$
- **Converting**:
  - Converts any non-power plant building into another standard building.
  - Duration: **24 hours (ticks)**.
  - Reuses structural materials at half price:
    $$\text{Cost} = \frac{\text{Building Cost}}{2}$$
  - *Note*: Power plants cannot be converted via standard conversion.
- **Upgrading Power Plants**:
  - Upgrades existing Nuclear Power Plants into Fusion Power Plants once **Fusion Technology** is researched.
  - Duration: **12 hours (ticks)**.
  - Cost:
    $$\text{Cost} = \frac{\text{Building Cost}}{4}$$
- **Housing Priority & Overflow**:
  - Barracks house military units first. If Barracks are full, military units overflow into Residences, displacing civilian population.

---

## 3. Building Specifications

| Building | Primary Output / Capacity | Special Conditions / Formula | Prerequisite |
|---|---|---|---|
| **Residence** | 50 Civilians or Military | Displaced military can occupy; civilians generate tax income (55 with *Longevity*) | None |
| **Barracks** | 75 Military Units | Supports all military types (including Tanks) | None |
| **Star Mine** | +120 Money / hour | Primary resource extraction; no placement limit | None |
| **Nuclear Power Plant** | +100 Power / hour | Max storage: 500 power; excess power is lost | None |
| **Fusion Power Plant** | +140 Power / hour | Max storage: 1,000 power; higher efficiency | Fusion Technology |
| **Training Camp** | Training cost discount | $\text{Discount} = (\% \text{ of Land} \times 3)$, capped at **30%** | None |
| **Probe Factory** | Probe manufacturing | Produces $(50\% \text{ to } 100\%) \times \text{Factories}$ probes / hour | None |
| **Air Support Bay** | 40 Tactical Fighters | Necessary life-support/dock for Tactical Fighters | Vesudian Core & AI Tech |

---

## 4. System Synergies & Dependencies

- **Economy & Taxes**: Residences provide tax revenue from civilians; Star Mines provide direct industrial credits.
- **Energy Grid**: Power plants sustain population and military. Military units consume double civilian power.
- **Military Readiness**: Barracks supply bunk space; Training Camps cut military recruitment and upgrade costs.
- **Espionage**: Probe Factories supply the active probe pool for intelligence missions and sabotage.
- **Research Tech Locks**: Fusion Plants and Air Support Bays remain locked until their corresponding research projects finish.
