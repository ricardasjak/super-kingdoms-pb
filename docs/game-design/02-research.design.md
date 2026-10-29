# Game Design: Research & Technologies

> **System**: Kingdom Progression & Scientific Advancement
> **Sources of Truth**: [docs/game-manual/research.md](../game-manual/research.md) & [docs/vindicator-guide/09-net-worth-and-research.md](../vindicator-guide/09-net-worth-and-research.md)

---

## 1. Overview & Role

Research drives both continuous efficiency gains and critical technological breakthroughs. Kingdoms convert soldiers into Scientists who generate research points every hour. Progression is divided into two distinct branches: **Continual Research** (scaling percentage bonuses against total land) and **One-Time Technologies** (fixed-point unlocks for advanced units, structures, and abilities).

---

## 2. Core Mechanics

- **Scientific Labor**:
  - Scientists generate **1 research point per hour (tick)**.
  - Scientists are recruited from existing Soldiers at **1,000 money** each.
- **Continual Research Dynamic Scaling**:
  - Continual bonuses scale dynamically against total kingdom size. As land increases through exploration or conquest, existing points yield lower percentage bonuses unless additional research points are invested.
  - Bonuses are capped at fixed maximums.
- **One-Time Technologies**:
  - Require accumulating a fixed threshold of research points.
  - Technology remains permanently unlocked once reached and does not degrade with land expansion.
  - Strict prerequisites apply across the tech tree.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Continual Research Scaling Formula
The total research points required to reach the maximum bonus in any continual field is a quadratic function of total kingdom land:

$$\text{Points Required For Max} = (\text{Total Land})^2 \times \text{FieldFactor}$$

*(For **Oceanic** kingdoms, multiply points required by **$1.1\times$** due to racial research penalty).*

#### Exact Research Field Factors & Caps
| Continual Research Field | Max Cap | Field Factor | Effective In-Game Benefit |
|---|:---:|:---:|---|
| **Population Bonus** | $+20\%$ | $0.00475$ | Increases residence capacity from 50 to 60 civilians |
| **Power Bonus** | $+50\%$ | $0.00311$ | Increases power generation output across all power plants |
| **Military Strength** | $+30\%$ | $0.00291$ | Boosts both offensive and defensive combat ratings ($+1\%$/level) |
| **Money Bonus** | $+25\%$ | $0.00535$ | Amplifies revenue from civilian taxes and Star Mines |
| **Reactor Warp Core Efficiency** | $+20\%$ | $0.00173$ | Reduces military attack travel times by up to $-20\%$ (Requires Energy Core) |
| **Frequency Decryption Center (FDC)** | $25\%$ | $0.00040$ | Probability to expose enemy probe origin and mission on incoming ops |

### 3.2 Current Bonus Calculation
When research points $P$ are below the threshold required for maximum bonus:
$$\text{Current Bonus } \% = \min\left(\text{MaxBonus}, \; \text{MaxBonus} \times \frac{P}{(\text{Total Land})^2 \times \text{FieldFactor}}\right)$$

### 3.3 Static Breakthrough Technologies
Static projects require fixed cumulative point pools:
- **Longevity (`r_long`)**: $30,000\text{ pts}$ — $+5$ residence capacity (holds $55 \to 66$).
- **Fusion Technology (`r_fusion`)**: $30,000\text{ pts}$ — $+50\%$ power generation bonus; unlocks Fusion Missiles.
- **Energy Core (`r_core`)**: $30,000\text{ pts}$ (prereq: Fusion Tech) — $+20\%$ power output; unlocks Energy Missiles, $-10\%$ travel time, prerequisites for Warp Core & Probe Armor.
- **Dragoons (`r_dr`)**: $30,000\text{ pts}$ (prereq: Longevity) — unlocks Dragoon assault unit.
- **Laser Dragoons (`r_ld`)**: $40,000\text{ pts}$ (prereq: Longevity) — unlocks Laser Dragoon defense unit.
- **Fighters (`r_ft`)**: $80,000\text{ pts}$ (prereq: Dragoons) — unlocks Fighter aerial unit.
- **Probe Armor (`r_armor`)**: $92,000\text{ pts}$ (prereq: Energy Core) — cuts probe mission losses by $50\%$.
- **Tactical Fighters & Air Support Bays (`r_tf`)**: $300,000\text{ pts}$ (prereq: Fighters + Energy Core) — unlocks Air Support Bay construction and Tactical Fighters.

---

## 4. Specifications Table

### 4.1 One-Time Breakthroughs (Tech Tree)

| Technology | Points Required | Prerequisites | Unlocks & Effects |
|---|---|---|---|
| **Longevity** | 30,000 | None | +5 residence base capacity (holds 55 civs, up to 66 with Pop research) |
| **Fusion Technology** | 30,000 | None | +50% power generation bonus; unlocks Fusion Missiles |
| **Energy Core** | 30,000 | Fusion Technology | +20% power output, unlocks Energy Missiles, -10% attack time, enables Warp research |
| **Dragoons** | 30,000 | Longevity | Unlocks Dragoon cybernetic assault unit |
| **Laser Dragoons** | 40,000 | Longevity | Unlocks Laser Dragoon cybernetic defense unit |
| **Fighters** | 80,000 | Dragoons | Unlocks Fighter aerial strike unit |
| **Probe Armor** | 92,000 | Energy Core | Decreases probe losses on missions by 50% |
| **Tactical Fighters & Air Support Bays** | 300,000 | Fighters + Energy Core | Unlocks Air Support Bays and Tactical Fighters |

---

## 5. System Synergies & Dependencies

- **Military Unlocks**: Essential for upgrading beyond basic troopers into advanced cybernetic, air, and AI combat units.
- **Energy Infrastructure**: Fusion Tech and Energy Core massively boost powerplant efficiency to support energy-hungry armies.
- **Counter-Espionage**: Frequency Decryption Center and Probe Armor protect kingdom intel and operational probe fleets.
- **Expansion Dilution**: Because continual research costs scale with $\text{Land}^2$, rapid territory conquest dilutes research percentages unless scientific staffing increases proportionally.
