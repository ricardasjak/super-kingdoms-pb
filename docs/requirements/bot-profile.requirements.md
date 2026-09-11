# Bot Profile Strategy Directives Requirements

## Origin

Derived from user request to port autonomous governor strategy directives (`handleBotParams`) from the Convex reference implementation into the Go tick engine so that selecting a bot profile impacts building zoning, power balancing, housing, exploration, and military recruitment during tick simulation.

## Requirements

### Profile Configuration & Strategy Directives

- REQ-BOT-001: When autonomous growth runs (Phase 6, ticks where `tick % 8 == 0` or `tick == 1`) with `autoBuild` enabled, the system shall evaluate the kingdom's governor strategy profile (`botSettings`).
- REQ-BOT-002: If an automated bot profile is active and the kingdom's land is less than 1,000 acres, the system shall set `autoExplore` to 10; otherwise, the system shall set `autoExplore` to the profile's specified exploration level.
- REQ-BOT-003: If an automated bot profile is active, the system shall set building target percentages for Protection Facilities (`pf`) and Training Camps (`tc`) directly from the profile's building configuration.
- REQ-BOT-004: When autonomous growth runs with `autoBuild` enabled, the system shall calculate the Barracks (`rax`) and Air Support Bases (`asb`) required to house current military units and active recruitment queues with a 5% safety margin:
  - If a bot profile is active, the targets for `rax` and `asb` shall match the exact calculated percentage needs.
  - If no bot profile is active (manual control), the system shall not lower the player's manual targets, ensuring only that targets meet the minimum calculated housing need.
- REQ-BOT-005: If an automated bot profile is active, the system shall calculate power consumption (from population, army units, and probes) and power production bonuses (from power, fusion, and core research) to set the Power Plants (`plants`) target to maintain a positive power balance.
- REQ-BOT-006: If an automated bot profile is active, the system shall split the remaining unallocated building target percentage ($100 - \sum \text{allocated}$) equally between Residences (`res`) and Silicon Mines (`sm`).
- REQ-BOT-007: If an automated bot profile is active, the system shall set military targets to train the highest-tier unlocked units matching the profile's offense, defense, flex, and science distribution.
- REQ-BOT-008: Changes made to `autoExplore`, building targets, and military targets during simulation shall be persisted to the database.
- REQ-BOT-009: When a kingdom's governor strategy profile is updated via `/api/kingdoms/update-bot-profile`, the system shall immediately evaluate strategy directives to update building targets, military targets, and exploration settings, and shall return the updated kingdom object.
- REQ-BOT-010: During autonomous military recruitment, while newbie mode lasts (`newbiemode > 0`), the system shall only purchase soldiers (`sol`) and scientists (`sci`) until 24 or fewer newbie-mode ticks remain (`newbiemode <= 24`). When more than 24 newbie-mode ticks remain (`newbiemode > 24`), all other military unit recruitment shall be skipped.

