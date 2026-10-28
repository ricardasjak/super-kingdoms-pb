# Game Design Documents (GDD)

This directory contains concise, authoritative game design specifications for **Super Kingdoms**, structured for rapid readability and implementation clarity.

## Sources of Truth & Mathematical Foundations
- **Official Game Manual**: Documented in [`docs/game-manual/`](../game-manual/README.md) as the baseline for thematic rules, game systems, and player-facing mechanics.
- **Vindicator's Guide & Formula Archive**: Documented in [`docs/vindicator-guide/`](../vindicator-guide/README.md) as the authoritative secondary reference for exact mathematical scaling constants, land-scaled research factors, combat resolution algorithms, travel time torus formulas, and economic parameters verified with the original game creator (BCartfall).

---

## Standard Document Structure

Every document in this series adheres to a strict 5-part **Compact Spec Sheet** format:
1. **Overview & Role**: High-level summary of the system and its gameplay purpose.
2. **Core Mechanics**: Operational rules, constraints, lifecycle states, and behavioral logic.
3. **Mathematical Formulas & Algorithms**: Dedicated section containing all mathematical equations, cost scalings, battle algorithms, and exact constant factors.
4. **Specifications Table**: Concise reference matrix of all entities, stats, requirements, and outputs.
5. **System Synergies & Dependencies**: Cross-cutting interactions with economy, energy, warfare, and progression.

---

## Core Series

| Index | Document | Scope & Focus | Key Formulas Included |
|---|---|---|---|
| 01 | [01-buildings.design.md](01-buildings.design.md) | Land development, housing, energy plants, conversion, razing | Housing capacity ($50 \to 60$), pop growth ($\le 2.5\%$/hr), power drain ($0.35$/civ), training camp discount, mine income ($120$/hr) |
| 02 | [02-research.design.md](02-research.design.md) | Scientists, continual land-scaled research, one-time tech tree | $\text{Points} = \text{Land}^2 \times \text{Factor}$, exact factors for all 6 continual fields, static tech point thresholds |
| 03 | [03-military.design.md](03-military.design.md) | Soldier enlistment, unit stats, upgrades, logistics, demobilization | Daily draft ($10\%$/day), training camp discount equation, unit stat ratings, housing requirements |
| 04 | [04-exploration.design.md](04-exploration.design.md) | Peaceful land exploration, 10% daily limit, cost scaling, queues | Daily land cap ($10\%$/day), exploration cost curve, queue timing, sector state reductions |
| 05 | [05-combat-and-warfare.design.md](05-combat-and-warfare.design.md) | Invasions, Generals, War Shields, War Honor, baseline militia defense, MA Protection | Base Off/Def formulas, $2 \times \text{Land}$ militia rule, Torus travel time equation, War Leader return waves & efficiency score $S$ |
| 06 | [06-espionage-and-probes.design.md](06-espionage-and-probes.design.md) | Probe factories, Recon & Sabotage ops, energy shields, probe armor, accuracy | Probe factory yield formula, stored credit bank (10 max), probe NW ($1/1,000$), FDC unmasking probability, suicide overload |
| 07 | [07-missiles-and-defense-shields.design.md](07-missiles-and-defense-shields.design.md) | Nuclear/Fusion/Energy missiles, damage caps, 24h limit, planetary shield arrays | Missile damage equations & caps, 24h limit, shield energy consumption, military defense reduction ($-1\%$/shield up to $10\%$) |
| 08 | [08-planet-types-and-terrains.design.md](08-planet-types-and-terrains.design.md) | 8 Planet types, primary/secondary advantages, disadvantages, starter assets | Full quantitative modifier matrix, Volcanic power discounts, Oceanic research penalty factor ($1.1\times$), travel time modifiers |
| 09 | [09-economy-and-population.design.md](09-economy-and-population.design.md) | Population dynamics, tax revenues, Star Mines, energy grid & brownouts | Tax equation ($1.95$/civ), $\pm 5\%$ hidden income variance, civilian power drain ($0.35$/civ), blackout penalties ($-20\%$) |
| 10 | [10-sector-politics-and-governance.design.md](10-sector-politics-and-governance.design.md) | Sector Leader elections, tax rate, Sector States, Enhancements & Weapons | Monarch combat buff ($+10\%$ Off/Def), intra-sector travel discount ($-10\%$), enhancement cost equations, weapon impact |
| 11 | [11-aid-and-alliances.design.md](11-aid-and-alliances.design.md) | Trouble status, aid point ratios & limits, Alliances, diplomatic pacts (War/Peace/NAP/Ally) | Trouble Status 12h freeze, aid ceiling formula ($50\%$ NW), aid point valuation ratios, treaty combat modifiers |
| 12 | [12-scoring-and-round-lifecycle.design.md](12-scoring-and-round-lifecycle.design.md) | Daily rewards, scoring dimensions, Networth valuation, round phase progression | Complete 13-asset Networth formula, $3\times \text{NW}$ target eligibility window, daily reward equations ($+10\text{ land}, 3\text{h income}$) |
