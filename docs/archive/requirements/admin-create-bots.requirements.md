# Admin Batch Bot Creation Requirements

## Origin

Derived from user request to add a button to the admin page that spawns 10 bot kingdoms at once, each assigned a random governor bot profile, with `autoBuild` enabled, and with a randomly picked planet type.

## Requirements

- REQ-BOT-CREATE-001: The system shall provide a `POST /api/game/create-bots` endpoint allowing creation of bot kingdoms in batch, defaulting to 10 kingdoms if no count is specified in the request body.
- REQ-BOT-CREATE-002: Each created bot kingdom shall have a randomly selected governor bot profile assigned to `botSettings` from the 12 governor strategies (`Aggressive`, `Extreme Offense`, `Probe Specialist`, `Defensive`, `Standard Balanced`, `Balanced Attacker`, `Balanced Scientist`, `NW Booster`, `Economic Growth`, `Growth & Probes`, `Growth & Science`, `Pure Growth`).
- REQ-BOT-CREATE-003: Each created bot kingdom shall have `autoBuild` enabled (`autoBuild: true`).
- REQ-BOT-CREATE-004: Each created bot kingdom shall have its `planetType` selected randomly from the full catalog of 14 planet types.
- REQ-BOT-CREATE-005: Each created bot kingdom shall be initialized with standard starting territory, population, treasury, power, military units, and baseline buildings with target allocations aligned to the assigned profile.
- REQ-BOT-CREATE-006: Each created bot kingdom shall have `botOwnerKd` designated as `"freelancer"` indicating an autonomous, unowned realm.
- REQ-BOT-CREATE-007: The creation of bot kingdoms shall increment the total kingdom count in `gameStatus` telemetry.
- REQ-BOT-CREATE-008: The admin page (`/admin`) shall provide a button to create 10 bot kingdoms at once, with visual loading indication during the creation request and confirmation feedback upon completion.
