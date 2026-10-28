# Game Design Documents (GDD)

This directory contains concise, authoritative game design specifications for **Super Kingdoms**, structured for rapid readability and implementation clarity. The authoritative game rules and formulas are derived from the game manuals in [`docs/game-manual/`](../game-manual/).

## Standard Document Structure

Each document adheres to a 4-part **Compact Spec Sheet** format:
1. **Overview & Role**: High-level summary of the system and its gameplay purpose.
2. **Core Mechanics & Formulas**: Operational rules, timing, cost formulas, constraints, and lifecycle states.
3. **Specifications Table**: Concise reference matrix of all entities, stats, requirements, and outputs.
4. **System Synergies & Dependencies**: Cross-cutting interactions with economy, energy, warfare, and progression.

## Core Series

| Index | Document | Scope & Focus |
|---|---|---|
| 01 | [01-buildings.design.md](01-buildings.design.md) | Land development, housing, energy plants, conversion, razing |
| 02 | [02-research.design.md](02-research.design.md) | Scientists, continual land-scaled research, one-time tech tree |
| 03 | [03-military.design.md](03-military.design.md) | Soldier enlistment, unit stats, upgrades, logistics, demobilization |
| 04 | [04-exploration.design.md](04-exploration.design.md) | Peaceful land exploration, 10% daily limit, cost scaling, queues |
| 05 | [05-combat-and-warfare.design.md](05-combat-and-warfare.design.md) | Invasions, Generals, War Shields, War Honor, baseline militia defense, MA Protection |
| 06 | [06-espionage-and-probes.design.md](06-espionage-and-probes.design.md) | Probe factories, Recon & Sabotage ops, energy shields, probe armor, accuracy |
| 07 | [07-missiles-and-defense-shields.design.md](07-missiles-and-defense-shields.design.md) | Nuclear/Fusion/Energy missiles, damage caps, 24h limit, planetary shield arrays |
| 08 | [08-planet-types-and-terrains.design.md](08-planet-types-and-terrains.design.md) | 8 Planet types, primary/secondary advantages, disadvantages, starter assets |
| 09 | [09-economy-and-population.design.md](09-economy-and-population.design.md) | Population dynamics, tax revenues, Star Mines, energy grid & brownouts |
| 10 | [10-sector-politics-and-governance.design.md](10-sector-politics-and-governance.design.md) | Sector Leader elections, tax rate, Sector States, Enhancements & Weapons |
| 11 | [11-aid-and-alliances.design.md](11-aid-and-alliances.design.md) | Trouble status, aid point ratios & limits, Alliances, diplomatic pacts (War/Peace/NAP/Ally) |
| 12 | [12-scoring-and-round-lifecycle.design.md](12-scoring-and-round-lifecycle.design.md) | Daily rewards, scoring dimensions, Networth valuation, round phase progression |
