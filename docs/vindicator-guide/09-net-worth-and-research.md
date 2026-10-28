# Chapter 9: Net Worth and Research

> **Source:** Unofficial Star Kingdoms Guide by Vindicator (v2, 2003)  
> **Original URL:** `http://www.angelfire.com/ill/l33t_hacker/Vindicator/9_nwandresearch.html`

Net Worth (NW) represents the cumulative value of a kingdom's military assets, infrastructure, population, and economic capital. Research represents persistent bonuses unlocked through scientific investment.

## Complete Net Worth Value Table

| Asset Category | Specific Asset | Net Worth Value | Notes |
|---|---|---|---|
| **Land & Structures** | Acre of Land | **25 NW** | Base territorial value |
| | Any Building | **25 NW** | Counts both completed and under-construction buildings |
| **Elite Units** | Tank | **22 NW** | Highest ground military NW density |
| | Tactical Fighter | **18 NW** | Elite air unit |
| **Infantry & Specialists** | Scientist | **8 NW** | Research specialist |
| | Laser Dragoon | **8 NW** | Heavy defensive infantry |
| | Laser Trooper | **7 NW** | Standard defensive infantry |
| | Dragoon | **7 NW** | Standard offensive infantry |
| | Trooper | **6 NW** | Light offensive infantry |
| | Soldier | **3 NW** | Basic drafted recruit |
| **Resources & Civilians** | Civilian Population | **1 NW each** | 1 NW per civilian living in residences |
| | Liquid Money | **1 NW per 500 money** | Treasury reserves |
| | Probes | **1 NW per 1,000 probes** | Stockpiled espionage drones |
| | Energy Power | **0 NW** | Does not add to Net Worth |
| | Missiles | **0 NW** | Does not add to Net Worth |

## Net Worth to Land Ratio (NW/Land)
- **Early Game (First 3 Days):** ~100 NW/acre
- **Week 1:** ~150 NW/acre
- **Week 2:** ~200 NW/acre
- **End Game (Month 1+):** 250+ NW/acre

---

## The Research System

Research points are produced by Scientists every hour. Researches fall into two categories: **Land-Based Researches** (dynamic scaling based on kingdom size) and **Static Researches** (fixed point thresholds).

### 1. Land-Based Research Formula
As your kingdom expands, maintaining maximum research bonuses requires more points. The formula for the points required to reach maximum bonus is:

```
ResearchPtsForMax = Land * Land * ResearchFieldFactor
```

*(Note: For **Oceanic** kingdoms, multiply `ResearchPtsForMax` by **1.1** due to the racial research penalty).*

#### Research Field Factors

| Research Field | Maximum Bonus | Field Factor | Effect |
|---|---|---|---|
| **Population Bonus** | +20% | `0.0100` | Increases residence capacity from 50 to 60 civilians |
| **Power Bonus** | +50% | `0.0060` | Boosts power output across all powerplants |
| **Military Bonus** | +30% | `0.0063` | Adds +1% per level to offense and defense |
| **Money Bonus** | +25% | `0.0110` | Increases revenue from Star Mines and civilian taxes |
| **Frequency Decryption Center (FDC)** | 25% | `0.0170` | Chance to expose foreign probe origin on incoming ops |
| **Reactor Warp Core Efficiency** | +20% | `0.0100` | Reduces military attack travel times by up to 20% (requires Energy Core) |

### 2. Static Technology Researches
These technologies require fixed point totals and do not scale with land size:

| Technology Name | Points Required | Unlock Effect |
|---|---|---|
| **S.C.O.U.T.E.R.** | 15,000 | Displays attack travel times for all targets across the universe |
| **Fusion Technology** | 30,000 | Unlocks Fusion Powerplants and Fusion Missiles |
| **Dragoons** | 60,000 | Unlocks training of Dragoons (offensive unit) |
| **Laser Dragoons** | 72,000 | Unlocks training of Laser Dragoons (defensive unit) |
| **Vesudian Core and AI Technology** | 600,000 | Unlocks Air Support Bays and Tactical Fighters |
