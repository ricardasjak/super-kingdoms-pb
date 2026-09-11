# Game Lifecycle Requirements

## Origin

Derived from user request to ensure that server restarts preserve the current game round phase (`status` field in `gameStatus` table) unchanged, instead of resetting it to `stopped`.

## Requirements

### Server Restart Behavior

- REQ-LIFE-001: Upon server startup or restart, the system shall not alter the `status` field of existing `gameStatus` records.
- REQ-LIFE-002: The system shall leave the existing game round phase (`registration`, `in-progress`, or `stopped`) intact across server restarts.
