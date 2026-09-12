# Kingdom Registration Requirements

## Origin

Derived from user request to disable connected/subordinate bot creation when a player establishes their kingdom, enabling the creation of a single standalone kingdom and hiding the connected bots creation feature in the UI while preserving the underlying code.

## Requirements

- REQ-KD-REG-001: When a player registers/creates their kingdom via `/api/kingdoms/create`, the system shall create only the player's kingdom and shall not spawn connected subordinate bot kingdoms (`botLimit = 0`).
- REQ-KD-REG-002: The kingdom creation interface (`CreateKingdomForm`) shall hide the subordinate protectorate kingdoms configuration section and randomize controls.
- REQ-KD-REG-003: When a player kingdom is created, `gameStatus.kingdomCount` shall increment by 1 for the player's realm alone.
- REQ-KD-REG-004: All connected bot generation code and schemas shall be preserved to permit re-enabling in the future.
