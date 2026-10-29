# Game Design: Planet Types & Terrains

> **System**: Planetary Archetypes, Environmental Modifiers & Starter Packages
> **Sources of Truth**: [docs/game-manual/planettypes.md](../game-manual/planettypes.md) & [docs/vindicator-guide/03-planet-types.md](../vindicator-guide/03-planet-types.md)

---

## 1. Overview & Role

At kingdom creation, rulers select a homeworld archetype. Each of the 8 planet types provides a distinct set of passive bonuses, structural penalties, and upfront starter assets, shaping the kingdom's developmental pathway and strategic playstyle.

---

## 2. Core Mechanics

- **Permanent Archetype**:
  - The chosen planet type remains locked for the duration of the round.
- **Modifier Stacking**:
  - Racial advantages and disadvantages stack with continual research bonuses and sector enhancements.
- **Starter Packages**:
  - New kingdoms spawn with specific research projects pre-completed or dedicated military units stationed on day one.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Planetary Modifier Coefficients
- **Combat Multipliers**:
  - Desert Wasteland: $+17.5\%$ to $+30\%$ offensive combat power; $-90\%$ Trooper/Dragoon training cost.
  - Oceanic: $+10\%$ to $+20\%$ defensive combat power.
  - Mystical Lands: $-10\%$ offensive combat power.
  - Multiple Terrain: $+5\%$ offensive & $+5\%$ defensive power.
- **Attack Travel Time Multiplier ($P_{\text{bonus}}$)**:
  - Mystical Lands: $P_{\text{bonus}} = -30\%$ attack travel time.
  - Forest & Wilderness: $P_{\text{bonus}} = +15\%$ to $+20\%$ attack travel time.
- **Demographic & Energy Formulas**:
  - Volcanic Inferno: Unit power consumption multiplied by **$0.30$** ($-70\%$ power drain); Population cap reduced by $-10\%$ to $-15\%$.
  - Forest & Wilderness: Population capacity multiplied by **$1.15$ to $1.30$** ($+15\%$ to $+30\%$).
- **Research Scaling Factor**:
  - Oceanic: Research points required multiplied by **$1.10\times$**:
    $$\text{Oceanic Research Points} = \text{Land}^2 \times \text{FieldFactor} \times 1.10$$

---

## 4. Specifications Table

| Planet Type | Primary Advantage | Secondary Advantage | Disadvantage | Starter Assets & Special Unlocks |
|---|---|---|---|---|
| **Forest and Wilderness** | +15% to +30% Population | +25 Money / Star Mine | +15% to +20% Attack Travel Time | Starts with **500 Soldiers** |
| **Desert Wasteland** | +17.5% to +30% Offense | -90% Trooper & Dragoon Cost | -10% Population | Starts with **Dragoons** unlocked; **FDC fixed at 25%** |
| **Volcanic Inferno** | -70% to -85% Power Required | Power Plants store 10,000 Power *(vs 1k)* | -10% to -15% Population | Starts with **Fusion Technology** & **10 Fusion Missiles** |
| **Mystical Lands** | -30% Attack Travel Time | -50% Power Required | -10% Offensive Strength | Starts with **Fusion Technology** |
| **Mountainous** | +15% to +25% Income | +75% Attack War Honor, +15% Probe Def | -20% Power Production | Starts with **Laser Dragoons** unlocked |
| **Oceanic** | +10% to +20% Defense | -25% Building Cost | +10% to +25% Research Required | Starts with **250 Laser Troopers** |
| **Terra Form** | +40% Research Efficiency | Max Research Cap +20% | -10% Income | Starts with **1,500 points** in Pop, Power, Mil, Money |
| **Multiple Terrain** | +5% Offense, +5% Defense | +5% Population | -5% Mine Income, +5% Attack Time | Starts with **Dragoons, Laser Dragoons, Fighters, TF** |

---

## 5. System Synergies & Dependencies

- **Warmonger / Rush Builds**: *Desert Wasteland* (-90% infantry cost, high offense) and *Mystical Lands* (-30% attack march time) excel at rapid conquest.
- **Economic / Industrial Booms**: *Forest and Wilderness* (huge population cap and extra Star Mine yield) and *Mountainous* (+25% income, +75% war honor) provide top-tier credit generation.
- **Technological Hegemony**: *Terra Form* allows scientific kingdoms to break standard research caps and hit maximum bonuses significantly faster.
- **Fortress Kingdoms**: *Oceanic* and *Volcanic Inferno* combine high natural defenses, cheap infrastructure, or massive energy storage reserves.
