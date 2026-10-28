# Game Design: Research & Technologies

> **System**: Kingdom Progression & Scientific Advancement  
> **Source of Truth**: [docs/game-manual/research.md](../game-manual/research.md)

---

## 1. Overview & Role

Research drives both continuous efficiency gains and critical technological breakthroughs. Kingdoms convert soldiers into Scientists who generate research points every hour. Progression is divided into two distinct branches: **Continual Research** (scaling percentage bonuses against total land) and **One-Time Technologies** (fixed-point unlocks for advanced units, structures, and abilities).

---

## 2. Core Mechanics & Formulas

- **Scientific Labor**:
  - Scientists generate **1 research point per hour (tick)**.
  - Scientists are recruited from existing Soldiers at **1,000 money** each.
- **Continual Research**:
  - Efficiency scales relative to kingdom size: points are evaluated against **Total Land**.
  - Bonuses are capped at fixed maximums.
- **One-Time Technologies**:
  - Requires accumulating a fixed threshold of research points.
  - Technology remains permanently unlocked once reached.
  - Strict prerequisites apply across the tech tree.

---

## 3. Research Specifications

### 3.1 Continual Research Projects

| Field | Max Bonus | Effect | Prerequisites |
|---|---|---|---|
| **Population Bonus** | +20% | Increases civilian housing capacity | None |
| **Power Bonus** | +50% | Increases output of all power plants | None |
| **Military Strength** | +30% | Boosts both offensive and defensive combat power | None |
| **Money Bonus** | +25% | Increases economic and tax revenues | None |
| **Frequency Decryption Center** | +25% | Chance to reveal sender, size, and mission of enemy probes | None |
| **Reactor Warp Core Efficiency** | +20% | Decreases military attack travel time | Energy Core |

### 3.2 One-Time Breakthroughs (Tech Tree)

| Technology | Points Required | Prerequisites | Unlocks & Effects |
|---|---|---|---|
| **S.C.O.U.T.E.R.** | 15,000 | None | Accurately predicts attack arrival and return times |
| **Fusion Technology** | 30,000 | None | Unlocks Fusion Power Plants and Fusion Missiles |
| **Energy Core** | 50,000 | Fusion Technology | +20% power output, unlocks Energy Missiles, -10% attack time |
| **Dragoons** | 60,000 | None | Unlocks Dragoon cybernetic assault unit |
| **Laser Dragoons** | 72,000 | None | Unlocks Laser Dragoon cybernetic defense unit |
| **Probe Armor** | 92,000 | Fusion Technology | Decreases probe losses on missions by 50% |
| **Longevity** | 100,000 | Vesudian Core & AI Tech | 4x civilian birth rate; Residences hold 55 civilians (up from 50) |
| **Fighters** | 150,000 | Dragoons + Laser Dragoons | Unlocks Fighter aviation strike unit |
| **Vesudian Core & AI Tech** | 500,000 | Fighters | Unlocks Air Support Bays and Tactical Fighters |

---

## 4. System Synergies & Dependencies

- **Military Unlocks**: Essential for upgrading beyond basic troopers into advanced cybernetic, air, and AI combat units.
- **Energy Infrastructure**: Fusion Tech and Energy Core massively boost powerplant efficiency to support energy-hungry armies.
- **Counter-Espionage**: Frequency Decryption Center and Probe Armor protect kingdom intel and operational probe fleets.
- **Expansion Scaling**: As kingdom land expands via exploration and conquest, more continual points are required to sustain maximum percentage bonuses.
