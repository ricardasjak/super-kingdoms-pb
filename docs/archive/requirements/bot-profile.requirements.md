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
- REQ-BOT-011: The interface shall display a chip button before the self-tick button reflecting the currently active bot profile selection (or manual control); clicking the chip shall navigate the player directly to the kingdom settings page (`/kingdom/settings`).
- REQ-BOT-012: The interface shall display an on/off automation toggle before the profile selector button; when automation is toggled off (`autoBuild = false`), the profile selector button shall be hidden.
- REQ-BOT-013: When an automated governor bot profile is active (profile is not None / Manual), the buildings target percentage inputs on the Growth page and military target percentage inputs on the Military page shall be read-only and disabled, and their corresponding target save buttons shall be disabled with an indicator that targets are automatically managed by the active profile. When the profile is None (Manual), target inputs and save buttons shall remain editable.
- REQ-BOT-014: The kingdom settings page directive catalog shall include a dedicated "Manual" row displaying long dashes ("—") across all parameter columns, permitting players to click and activate full manual control and visually distinguish it from automated profiles.


