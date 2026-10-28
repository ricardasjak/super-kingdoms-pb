# Game Design: Military Units & Warfare

> **System**: Armed Forces, Training & Combat Units
> **Sources of Truth**: [docs/game-manual/military.md](../game-manual/military.md) & [docs/vindicator-guide/05-offense-and-defense.md](../vindicator-guide/05-offense-and-defense.md)

---

## 1. Overview & Role

The military system provides defense against hostile incursions and offensive firepower for land conquests. The armed forces consist of basic infantry, specialized offensive/defensive operatives, heavy armored vehicles, strike aircraft, and autonomous AI craft.

---

## 2. Core Mechanics

- **Soldier Enlistment**:
  - Base recruit required for all ground unit training.
  - Recruited directly from civilian population.
- **Specialist Training**:
  - Costs 1 Soldier + specific unit money cost (Tactical Fighters require money only, no soldier).
  - Training Camp discount applies to all ground recruitment.
  - **Training Duration**: **24 hours (ticks)** for all units (including Soldiers and Scientists).
- **Unit Upgrades**:
  - Existing Troopers can be upgraded to Dragoons; Laser Troopers can be upgraded to Laser Dragoons.
  - Duration: **12 hours (ticks)**.
- **Disbandment / Demobilization**:
  - Disbanding specialist units returns them as Soldiers.
  - Disbanding Soldiers returns them as Civilians.
  - Tactical Fighters are permanently destroyed upon disbanding.
- **Logistics & Readiness**:
  - Military units consume **0.7 power/hour** (Tanks and Tactical Fighters consume **1.4 power/hour**).
  - Armies deployed on attacks cannot participate in homeland defense until they return.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Recruitment Limits & Training Camp Discount
- **Daily Enlistment Cap**:
  $$\text{Max Soldiers Recruited / 24h} = \left\lfloor \text{Civilian Population} \times 0.10 \right\rfloor$$
- **Training Camp Discount Formula**:
  $$\text{TC Discount } \% = \min\left(30\%, \; \left\lfloor\frac{\text{Training Camps}}{\text{Total Land}} \times 300\right\rfloor\right)$$
- **Discounted Unit Training Cost**:
  $$\text{Effective Cost} = \left\lfloor \text{Base Cost} \times \left(1 - \frac{\text{TC Discount } \%}{100}\right) \right\rfloor$$

### 3.2 Unit Combat Power Valuation
- **Attacker Force Power Contribution**:
  $$\text{Unit Offense} = (\text{Soldiers} \times 1) + (\text{Troopers} \times 4) + (\text{Dragoons} \times 5) + (\text{Fighters} \times 6) + (\text{Tanks} \times 9) + (\text{Tactical Fighters} \times 12)$$
- **Defender Garrison Power Contribution**:
  $$\text{Unit Defense} = (\text{Soldiers} \times 1) + (\text{Laser Troopers} \times 4) + (\text{Laser Dragoons} \times 5) + (\text{Tanks} \times 9)$$

### 3.3 Unit Upgrades & Demobilization Returns
- **Trooper $\to$ Dragoon Upgrade Cost**: $125\text{ money} \times (1 - \text{Discount})$; takes $12\text{ hours}$.
- **Laser Trooper $\to$ Laser Dragoon Upgrade Cost**: $175\text{ money} \times (1 - \text{Discount})$; takes $12\text{ hours}$.
- **Demobilization Conversion**:
  $$\text{Specialist Unit} \to 1\text{ Soldier}, \quad \text{Soldier} \to 1\text{ Civilian}, \quad \text{Tactical Fighter} \to 0\text{ returns}$$

---

## 4. Specifications Table

| Unit | Off / Def | Base Cost | Housing | Power Load | Prerequisites & Notes |
|---|:---:|:---:|:---:|:---:|---|
| **Soldier** | 1 / 1 | 150 money + 1 Civ | 1 Barracks | 0.7 / hr | Basic militia; base recruit for specialists; 24h train |
| **Trooper** | 4 / 0 | 350 money + 1 Sol | 1 Barracks | 0.7 / hr | Frontline offensive infantry; 24h train |
| **Dragoon** | 5 / 0 | 450 money + 1 Sol | 1 Barracks | 0.7 / hr | Cybernetic assault unit; requires **Dragoon** research; 24h train |
| **Laser Trooper** | 0 / 4 | 400 money + 1 Sol | 1 Barracks | 0.7 / hr | Defensive fortifications guard; 24h train |
| **Laser Dragoon** | 0 / 5 | 550 money + 1 Sol | 1 Barracks | 0.7 / hr | Cybernetic defense unit; requires **Laser Dragoon** research; 24h train |
| **Fighter** | 6 / 0 | 650 money + 1 Sol | 1 Barracks | 0.7 / hr | High-speed aerial strike unit; requires **Fighters** research; 24h train |
| **Tank** | 9 / 9 | 1,750 money + 1 Sol | 2 Barracks | 1.4 / hr | Heavy combined-arms vehicle; balanced anchor; 24h train |
| **Tactical Fighter** | 12 / 0 | 1,600 money | 1 Bay Slot *(40/Bay)* | 1.4 / hr | Autonomous AI strike craft; requires **TF & ASB** research; 24h train |
| **Scientist** | 0 / 0 | 1,000 money + 1 Sol | 1 Barracks | 0.7 / hr | Non-combatant; generates 1 research point / hr; 24h train |

---

## 5. System Synergies & Dependencies

- **Infrastructure**: Barracks and Air Support Bays provide mandatory housing capacity. Training Camps reduce recruitment overhead.
- **Energy Grid**: Military units consume $2\times$ power of civilians. Blackout incurs a $-20\%$ combat penalty.
- **Research**: Tech tree dictates access to Dragoons, Laser Dragoons, Fighters, and Tactical Fighters. Continual Military Research grants up to **+30% Military Strength**.
- **Combat Resolution**: Offense ratings drive standard land invasions; Defense ratings protect land against incoming strikes.
