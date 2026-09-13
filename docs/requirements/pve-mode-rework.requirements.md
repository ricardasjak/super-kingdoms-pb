# PvE Mode & Round Lifecycle Rework Requirements

## Origin

Derived from user request to rework the PvE mode and game round lifecycle from the ground up:
introducing a 3-phase round structure (Global Newbie Mode -> PvE Mode -> PvP Mode),
custom step-based self-ticking (8 steps × 16 ticks), reset capabilities with trait customization,
auto-build restrictions, bot spawning with 128-tick simulation, and Networth tier-based sector
allocation with fixed 16:00:00 UTC phase transitions.

Detailed feature architecture, formulas, and diagrams are specified in:
[PVE_REWORK_PLAN.md](file:///home/rija/Projects/pocketbase/super-kingdoms-pb/docs/PVE_REWORK_PLAN.md)

## Requirements

### Round Structure & Global Phases

- REQ-PVE-001: The game round lifecycle shall consist of three consecutive phases:
  1. Global Newbie Mode
  2. PvE Mode (Player vs Environment)
  3. PvP Mode (Player vs Player)
- REQ-PVE-002: Every phase transition (Newbie -> PvE, PvE -> PvP, and PvP -> Round End) shall occur at exactly 16:00:00 UTC.
- REQ-PVE-003: The `gameStatus` record shall track the active phase (`newbie`, `pve`, `pvp`, `ended`), the current round number, and the scheduled transition timestamps for each phase.
- REQ-PVE-004: The system shall provide an automated scheduler/checker that detects when 16:00:00 UTC is reached on the transition date and executes the phase transition logic.
- REQ-PVE-005: Administrators shall be able to configure phase durations and manually trigger or extend phase transitions if extra time is required.

### Phase 1: Global Newbie Mode

- REQ-PVE-006: Upon new round opening, the game shall enter Global Newbie Mode.
- REQ-PVE-007: Global Newbie Mode shall have a base duration of at least 3 days from round opening, ending at 16:00:00 UTC, with administrative capability to extend the duration as needed.
- REQ-PVE-008: During Global Newbie Mode, each player kingdom shall advance through exactly 8 self-tick steps.
- REQ-PVE-009: Each self-tick step shall execute exactly 16 game simulation ticks internally under the hood (totaling 128 ticks for a full newbie run).
- REQ-PVE-010: The user interface shall present this progression to the player as 8 steps (e.g. "Step X of 8" or "8 Steps Remaining") and shall not expose raw 16-tick intervals.
- REQ-PVE-011: Real human players shall not be allowed to enable or use `autoBuild` during Global Newbie Mode; all building and development decisions shall be manual.
- REQ-PVE-012: The system shall allow players to reset their newbie mode progress at any time while in Global Newbie Mode via a styled confirmation dialog; within this dialog, players shall have the option to change their kingdom's planet type and race, restoring the kingdom to creation defaults with the chosen traits and resetting the step budget back to 8 steps, as many times as desired.
- REQ-PVE-013: All combat and offensive attack actions shall remain locked and prohibited during Global Newbie Mode.
- REQ-PVE-014: Global background round ticking shall not advance kingdoms during Global Newbie Mode; progression shall be driven exclusively by player step actions.
- REQ-PVE-015: During Phase 1 (Global Newbie Mode), military production training queues for all military unit types shall be set to a duration of exactly 16 ticks, allowing all queued units to complete within a single step.
- REQ-PVE-016: The system shall prohibit and reject advancing the final step (Step 8) of Global Newbie Mode unless the sum of the kingdom's already produced military units and military units currently in training queues provides at least 8,000 base military defensive points (calculated from base unit defense values before any race, technology, or building bonuses).
- REQ-PVE-017: If a player kingdom has more than 16 free (unbuilt) land available and the player attempts to advance to the next step during Global Newbie Mode, the interface shall prompt the player with a styled modal confirmation dialog asking whether they really want to proceed without utilizing their available land.

### Phase 2: PvE Mode (Player vs Environment)

- REQ-PVE-018: PvE Mode shall begin immediately when Global Newbie Mode ends at 16:00:00 UTC.
- REQ-PVE-019: Upon the conclusion of Global Newbie Mode (at 16:00:00 UTC), the system shall automatically spawn bot kingdoms in a quantity equal to five times the number of active player kingdoms, with a minimum threshold of 21 bot kingdoms ($\max(21, 5 \times \text{activeKingdoms})$).
- REQ-PVE-020: Each spawned bot kingdom shall be created with 300,000 extra starting cash (totaling 600,000 money), `autoBuild` enabled, and a randomly assigned bot build profile.
- REQ-PVE-021: Upon creation, the system shall automatically execute the 8 steps (128 simulation ticks) for each spawned bot kingdom according to its assigned profile and auto-build instructions prior to player interaction in PvE Mode.
- REQ-PVE-022: PvE Mode shall last for exactly 3 days, concluding at 16:00:00 UTC.
- REQ-PVE-023: During PvE Mode, all player kingdoms and environment bot kingdoms shall reside in a single shared sector (Sector 0).
- REQ-PVE-024: Combat actions shall unlock in PvE Mode, permitting players to launch attacks against environment targets (bots / AI kingdoms).
- REQ-PVE-025: In military combat, the system shall support Standard Invasion attacks (with Plunder and Bombardment attack types disabled); on a successful invasion ($\text{OP} > \text{DP}$), the attacker shall capture exactly 10% of the defender's total land ($\lfloor \text{Defender Land} \times 0.10 \rfloor$).
- REQ-PVE-026: On an unsuccessful attack ($\text{OP} \le \text{DP}$), combat casualties for both the attacker and defender shall be scaled to 8% of the sent attacking power amount ($\text{Loss Points} = \text{OP} \times 0.08$); if military bonuses are identical, both parties shall lose approximately equal unit points equivalent to 8% of the sent force.
- REQ-PVE-027: In combat actions, attacks shall only be permitted between active kingdoms whose Networth differs by less than a factor of 3 ($NW_{\text{attacker}} / 3 < NW_{\text{target}} < 3 \times NW_{\text{attacker}}$); targets outside this range shall be ineligible for attack.
- REQ-PVE-028: When a kingdom is attacked and broken in combat, its defensive bonus shall immediately increase by 8%, and this bonus shall decrease by 1% on each subsequent simulation tick until it reaches 0%.
- REQ-PVE-029: Direct player-versus-player attacks shall remain locked during PvE Mode to protect developing players.
- REQ-PVE-030: Probe espionage mission success probability shall be calculated as $\min(1.0, \max(0.20, \text{sent\_probes} / \text{defender\_probes}))$, with a minimum baseline chance of 20% and 100% success if the target has 0 probes; successful missions shall consume/lose 0.25 (25%) of the sent probes, while failed missions shall result in the loss of 1.0 (100%) of the sent probes.
- REQ-PVE-031: Global server ticking shall run at regular intervals during PvE Mode to advance the round and simulate bot / economic ticks.
- REQ-PVE-032: Auto-build shall become unlocked for real players upon entry into PvE Mode.

### Phase 3: PvP Mode (Player vs Player) & Sector Splitting

- REQ-PVE-033: PvP Mode shall begin immediately when PvE Mode ends at 16:00:00 UTC.
- REQ-PVE-034: PvP Mode shall last for exactly 20 days, concluding at 16:00:00 UTC when the round ends.
- REQ-PVE-035: At the transition into PvP Mode (16:00:00 UTC), the system shall automatically split all player kingdoms from the single initial sector into multiple sectors.
- REQ-PVE-036: The total number of sectors shall be calculated by dividing the total count of active player kingdoms by 5 (rounded up: `ceil(playerCount / 5)`).
- REQ-PVE-037: Prior to sector allocation, all active player kingdoms shall be ranked by Networth (NW) in descending order and partitioned into 5 distinct tier groups: Tier 1 (top 20%), Tier 2 (next 20%), Tier 3 (middle 20%), Tier 4 (lower 20%), and Tier 5 (bottom 20%).
- REQ-PVE-038: The system shall allocate players to sectors by randomly drawing from each tier group, such that each sector is assigned balanced representation across Tier 1 through Tier 5 (ideally 1 player from each tier per 5-player sector).
- REQ-PVE-039: Full PvP combat and probe espionage actions shall unlock, allowing players to attack and probe other player kingdoms within the 3x Networth range residing within their own assigned sector.
- REQ-PVE-040: Inter-sector attacks and inter-sector probe espionage missions shall be blocked between active kingdoms; inter-sector attacks and inter-sector probe missions shall only be permitted against a kingdom in another sector if that kingdom has become inactive (48 consecutive hours of inactivity) and satisfies the 3x Networth condition.
- REQ-PVE-041: When the 20-day PvP Mode concludes at 16:00:00 UTC, the round shall transition to `ended`, freezing actions and calculating final kingdom and sector leaderboards.
