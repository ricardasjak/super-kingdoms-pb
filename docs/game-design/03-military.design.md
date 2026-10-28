# Game Design: Military Units & Warfare

> **System**: Armed Forces, Training & Combat Units  
> **Source of Truth**: [docs/game-manual/military.md](../game-manual/military.md)

---

## 1. Overview & Role

The military system provides defense against hostile incursions and offensive firepower for land conquests. The armed forces consist of basic infantry, specialized offensive/defensive operatives, heavy armored vehicles, strike aircraft, and autonomous AI craft. 

---

## 2. Core Mechanics & Formulas

- **Soldier Enlistment**:
  - Base unit required for all specialist training (except Tactical Fighters).
  - Cost: **150 money + 1 Civilian**.
  - Recruitment Cap: Maximum **10% of total population** per enlistment batch.
- **Specialist Training**:
  - Costs 1 Soldier + specific unit money cost.
  - Training Camp Discount applies to all training costs:
    $$\text{Discount} = (\% \text{ of Land in Training Camps} \times 3) \quad [\text{Max } 30\%]$$
- **Upgrades**:
  - **Trooper $\rightarrow$ Dragoon**: 125 money (minus TC discount); takes **12 hours**. Requires Dragoon tech.
  - **Laser Trooper $\rightarrow$ Laser Dragoon**: 175 money (minus TC discount); takes **12 hours**. Requires Laser Dragoon tech.
- **Disbandment / Demobilization**:
  - Specialist units $\rightarrow$ return as **Soldiers**.
  - Soldiers $\rightarrow$ return as **Civilians**.
  - Tactical Fighters $\rightarrow$ dismantled permanently (**0 return**).
- **Logistics & Readiness**:
  - **Power Consumption**: Military units consume **double** the power of civilians.
  - **Deployment Risk**: Dispatched offensive armies cannot defend the home kingdom while underway, leaving it vulnerable.

---

## 3. Unit Specifications

| Unit | Off / Def | Base Cost | Housing | Prerequisites & Notes |
|---|:---:|:---:|:---:|---|
| **Soldier** | 1 / 1 | 150 money + 1 Civ | 1 Barracks | Basic militia; base recruit for advanced units |
| **Trooper** | 4 / 0 | 350 money + 1 Sol | 1 Barracks | Dedicated frontline offensive infantry |
| **Dragoon** | 5 / 0 | 450 money + 1 Sol | 1 Barracks | Cybernetic assault unit; requires **Dragoon** research |
| **Laser Trooper** | 0 / 4 | 400 money + 1 Sol | 1 Barracks | Dedicated defensive fortifications guard |
| **Laser Dragoon** | 0 / 5 | 550 money + 1 Sol | 1 Barracks | Cybernetic defensive unit; requires **Laser Dragoon** research |
| **Fighter** | 6 / 0 | 650 money + 1 Sol | 1 Barracks | High-speed aerial strike unit; requires **Fighters** research |
| **Tank** | 9 / 9 | 1,750 money + 1 Sol | 2 Barracks | Heavy combined-arms vehicle; balanced offensive & defensive anchor |
| **Tactical Fighter** | 12 / 0 | 1,600 money | 1 Bay Slot *(40/Bay)* | Autonomous AI strike craft; requires **Vesudian Core & AI Tech**; invulnerable while charging in bay |
| **Scientist** | 0 / 0 | 1,000 money + 1 Sol | 1 Barracks | Non-combatant; generates 1 research point / hour |

*Note: If Barracks are full, units overflow into Residences, displacing civilians. Tactical Fighters bypass Barracks and strictly require Air Support Bays.*

---

## 4. System Synergies & Dependencies

- **Infrastructure**: Barracks and Air Support Bays provide mandatory housing capacity. Training Camps reduce recruitment and upgrade overhead.
- **Energy Grid**: Rapid military mobilization requires adequate Nuclear/Fusion Power Plants to prevent brownouts.
- **Research**: Tech tree dictates access to Dragoons, Laser Dragoons, Fighters, and Tactical Fighters. Continual Military Research grants up to **+30% Military Strength**.
- **Combat Resolution**: Offense ratings drive standard land invasions; Defense ratings protect land against incoming strikes.
