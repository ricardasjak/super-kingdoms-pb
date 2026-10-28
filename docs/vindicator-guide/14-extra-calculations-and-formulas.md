# Chapter 14: Extra: Calculations & Game Formulas

> **Source:** Unofficial Star Kingdoms Guide by Vindicator (v2, 2003)  
> **Original URL:** `http://www.angelfire.com/ill/l33t_hacker/Vindicator/14_calculations.html`

This chapter provides mathematical analyses and game formulas that govern Star Kingdoms economics, combat travel times, and attack efficiency.

---

## 1. Residences vs. Star Mines Economics

### Base Financial Parameters
- **Star Mine Base Income:** **120 money/hour**.
- **Civilian Tax Rate:** **1.95 money/hour** per civilian.
- **Hidden Income Variance:** There is a **±5% randomness factor** applied to every kingdom's hourly income (not displayed in the UI).
- **Civilian Power Consumption:** Each civilian consumes **0.35 power/hour** (Star Mines consume **0 power**).
- **Population Growth Rate:** Maximum natural population growth is **2.5% per hour** (requires uncrowded residences).

### Hourly Income per Acre Comparison Table

| Planet Type | Res Tier 1 *(1)* | Res Tier 2 *(2)* | Res Tier 3 *(3)* | Res Tier 4 *(4)* | Mine Tier 1 *(5)* | Mine Tier 2 *(6)* |
|---|---|---|---|---|---|---|
| **Desert Wasteland** | 93 | 112 | 116 | 140 | 120 | 150 |
| **Forest & Wilderness** | 122 | 141 | 152 | 176 | 120 | 150 |
| **Mountainous** | 112 | 135 | 137 | 164 | 138 | 168 |
| **Multiple Terrain** | 98 | 117 | 122 | 146 | 120 | 150 |
| **Mystical Lands** | 98 | 117 | 122 | 146 | 120 | 150 |
| **Terra Form** | 96 | 115 | 120 | 144 | 118 | 148 |
| **Oceanic** | 98 | 117 | 122 | 146 | 120 | 150 |
| **Volcanic Inferno** | 83 | 102 | 104 | 128 | 120 | 150 |

#### Table Legend
- **Res Tier 1:** Base Residence (0% money research, 0% population research).
- **Res Tier 2:** Residence with +20% Population research, 0% money research.
- **Res Tier 3:** Residence with +25% Money research, 0% population research.
- **Res Tier 4:** Max Residence (+25% Money research, +20% Population research).
- **Mine Tier 1:** Base Star Mine (0% money research).
- **Mine Tier 2:** Max Star Mine (+25% Money research).

### Economic Trade-offs Summary
- **Star Mines:**
  - Require **0 power**.
  - Generate immediate income upon completion.
  - Immune to arson and destruction.
  - Generate lower Net Worth than fully populated residences.
- **Residences:**
  - Produce higher peak revenue when fully researched (especially on Forest & Wilderness).
  - Require power infrastructure (0.35 power per civilian).
  - Subject to 2.5%/hour population fill delays.
  - Highly vulnerable to enemy arson and kidnapping ops.

---

## 2. Attack Travel Time Formula

Travel time between sectors in Star Kingdoms is governed by a 2D Euclidean grid with wrap-around boundaries (a 10x10 sector torus):

```
Attack Time (hours) = (sqrt(value1^2 + value2^2) + 14) * ((100 + Pbonus + Sbonus + Ebonus + Wbonus) / 100)
```

### Coordinate Distance Calculation
Let $(X_1, Y_1)$ be the attacker's sector coordinates and $(X_2, Y_2)$ be the defender's sector coordinates:

```
xdiff = abs(X1 - X2)
ydiff = abs(Y1 - Y2)

value1 = min(xdiff, 10 - xdiff)
value2 = min(ydiff, 10 - ydiff)
```

### Modifier Variables
- **Pbonus (Planet Modifier):**
  - `-30%` if attacker is **Mystical Lands**.
  - `+15%` if attacker is **Forest and Wilderness**.
  - `0%` for all other planet types.
- **Sbonus (Sector Modifier):**
  - `-10%` if target is in your own sector.
  - `0%` if target is in a different sector.
- **Ebonus (Energy Core Tech):**
  - `-10%` if Energy Core technology is researched, else `0%`.
- **Wbonus (Reactor Warp Core Efficiency):**
  - Negative percentage equal to your Warp Core research (up to `-20%`).

---

## 3. War Leader Troop Return Dynamics & Efficiency

When attacking, dispatching multiple War Leaders (WL) splits your attacking forces into staggered return waves, reducing the time your entire army is absent from home defense.

### Return Wave Formula
If you send $N$ War Leaders on an attack with one-way travel time $T$:
- Each wave carries $100 / N$ percent of the deployed forces.
- The return waves arrive home at intervals:
  - **1 War Leader:** Entire army (100%) returns at hour $T$.
  - **2 War Leaders:** 50% returns at $T/2$, remaining 50% returns at $T$.
  - **3 War Leaders:** 33% returns at $T/3$, 33% at $2T/3$, 33% at $T$.
  - **4 War Leaders:** 25% returns at $T/4$, 25% at $T/2$, 25% at $3T/4$, 25% at $T$.

### Efficiency Score ($S$) Formula
The efficiency score ($S$) measures how rapidly military forces return to home defense:

```
S = sum( (100 / N) / ReturnTime_i )
```
*(Higher $S$ values indicate superior defensive safety and faster troop availability).*

### Attack Time vs. War Leader Efficiency Table

| Base Attack Time | 1 War Leader (Return: $S$) | 2 War Leaders (Return: $S$) | 3 War Leaders (Return: $S$) | 4 War Leaders (Return: $S$) |
|---|---|---|---|---|
| **6 hours** | 6h ($S=17$) | 3, 6h ($S=25$) | 2, 4, 6h ($S=30$) | 1, 2, 3, 6h ($S=50$) |
| **7 hours** | 7h ($S=14$) | 3, 7h ($S=23$) | 2, 4, 7h ($S=29$) | 1, 2, 3, 7h ($S=49$) |
| **8 hours** | 8h ($S=12$) | 4, 8h ($S=19$) | 2, 4, 8h ($S=29$) | 2, 4, 6, 8h ($S=26$) |
| **9 hours** | 9h ($S=11$) | 4, 9h ($S=18$) | 3, 6, 9h ($S=20$) | 2, 4, 6, 9h ($S=26$) |
| **10 hours** | 10h ($S=10$) | 5, 10h ($S=15$) | 3, 6, 10h ($S=20$) | 2, 4, 6, 10h ($S=25$) |
| **11 hours** | 11h ($S=9$) | 5, 11h ($S=15$) | 3, 6, 11h ($S=20$) | 2, 4, 6, 11h ($S=25$) |
| **12 hours** | 12h ($S=8$) | 6, 12h ($S=13$) | 4, 8, 12h ($S=15$) | 3, 6, 9, 12h ($S=17$) |
| **13 hours** | 13h ($S=8$) | 6, 13h ($S=12$) | 4, 8, 13h ($S=15$) | 3, 6, 9, 13h ($S=17$) |
| **14 hours** | 14h ($S=7$) | 7, 14h ($S=11$) | 4, 8, 14h ($S=15$) | 3, 6, 9, 14h ($S=17$) |
| **15 hours** | 15h ($S=7$) | 7, 15h ($S=10$) | 5, 10, 15h ($S=12$) | 3, 6, 9, 15h ($S=17$) |
| **16 hours** | 16h ($S=6$) | 8, 16h ($S=9$) | 5, 10, 16h ($S=12$) | 4, 8, 12, 16h ($S=13$) |
| **18 hours** | 18h ($S=6$) | 9, 18h ($S=8$) | 6, 12, 18h ($S=10$) | 4, 8, 12, 18h ($S=13$) |
| **20 hours** | 20h ($S=5$) | 10, 20h ($S=8$) | 6, 12, 20h ($S=10$) | 5, 10, 15, 20h ($S=10$) |
| **22 hours** | 22h ($S=5$) | 11, 22h ($S=7$) | 7, 14, 22h ($S=9$) | 5, 10, 15, 22h ($S=10$) |
| **24 hours** | 24h ($S=4$) | 12, 24h ($S=6$) | 8, 16, 24h ($S=9$) | 6, 12, 18, 24h ($S=9$) |

> [!TIP]
> **Key Insight:** Attacking a target 6 hours away with **1 War Leader** ($S=17$) is safer for home defense than attacking a target 11 hours away with **3 War Leaders** ($S=20$), because the entire force is back at hour 6 rather than having troops out through hour 11.
