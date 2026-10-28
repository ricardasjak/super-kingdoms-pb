# Sector Politics & Sector Leader Requirements

## Origin

Derived from user request to implement Step 7 (`Politics.aspx`) and Sector Leader rules so that each sector democratically elects their Sector Leader (SL), with networth tie-breaking, an additive 10% attacking bonus, and alliance membership powers. Detailed narrative in [../stories/0072.sector-politics-and-elections.story.md](../stories/0072.sector-politics-and-elections.story.md) and [../stories/0073.sector-leader.story.md](../stories/0073.sector-leader.story.md).

## Requirements

### Sector Elections

- REQ-POL-001: The system shall maintain an election system for each sector in the universe allowing resident kingdoms to vote for their Sector Leader (SL).
- REQ-POL-002: Each active kingdom in a sector shall be entitled to cast exactly 1 vote for any resident candidate kingdom in that sector.
- REQ-POL-003: Kingdoms in `Newbie` protection mode shall be restricted from holding the Sector Leader office until newbie protection expires or is deactivated.
- REQ-POL-004: A kingdom shall be permitted to change its vote at any time via the Politics interface (`Politics.aspx`).
- REQ-POL-005: The candidate with the highest number of votes in the sector shall be designated as the active Sector Leader.
- REQ-POL-006: In the event of a tie in votes, the candidate with the higher networth shall be selected as the Sector Leader.
- REQ-POL-007: If an incumbent Sector Leader loses the plurality of votes, leadership privileges and titles shall automatically transfer to the newly elected candidate.

### Sector Leader Powers

- REQ-POL-010: The system shall allow the elected Sector Leader to edit the sector's public announcement message (Message of the Day / MotD) displayed on `MySector.aspx`.
- REQ-POL-011: The system shall display a distinct `[Sector Leader]` badge next to the elected leader's kingdom name across sector views and leaderboards.
- REQ-POL-012: The system shall grant the Sector Leader permission to initiate sector-wide mass broadcast messages via the messaging system.
- REQ-POL-013: The system shall grant the active Sector Leader a flat 10% attacking bonus on military offensive strikes, stacked additively with existing attack modifiers.
- REQ-POL-014: The system shall grant the Sector Leader executive authority to join the sector to an alliance or withdraw the sector from an alliance.
