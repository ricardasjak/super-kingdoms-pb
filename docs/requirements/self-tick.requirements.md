# Self-Tick Requirements

## Origin

Derived from the prompt requesting a self-ticking action for a single kingdom:
newbie-mode-gated, advancing 8 ticks per action, with a `newbiemode` budget
starting at 96, available during the `registration` and `in-progress` game
phases, exposed through a dedicated button, while the whole-server tick button
remains exclusive to the admin page.

## Requirements

### Self-tick action

- REQ-SELF-001: The system shall provide a self-tick action that advances a
  single kingdom without advancing any other kingdom or the global round tick.
- REQ-SELF-002: One self-tick action shall advance the kingdom by exactly
  8 ticks.
- REQ-SELF-003: The self-tick action shall be available only to the owner of
  the kingdom being ticked.

### Newbie-mode gating

- REQ-SELF-004: The self-tick action shall be available only while the kingdom
  is in newbie mode.
- REQ-SELF-005: Each kingdom shall have a `newbiemode` integer field with a
  default value of 96.
- REQ-SELF-006: Each self-tick action shall deduct 8 from the kingdom's
  `newbiemode` value.
- REQ-SELF-007: The self-tick action shall be rejected once the kingdom's
  `newbiemode` value is below 8.

### Game-phase availability

- REQ-SELF-008: Self-ticking shall be available while the game status is
  `registration` or `in-progress`.
- REQ-SELF-009: Self-ticking shall be rejected while the game status is
  `stopped`.

### User interface

- REQ-SELF-010: The interface shall provide a self-tick button for kingdom
  owners stating that one action advances 8 ticks and showing the remaining
  newbie-mode budget.
- REQ-SELF-011: The self-tick button shall be disabled with an explanation
  whenever self-ticking is unavailable.
- REQ-SELF-012: The tick-whole-server button shall appear only on the admin
  page.
- REQ-SELF-013: Every rejected self-tick action shall return a readable error
  message, and the interface shall display it instead of failing silently.
- REQ-SELF-014: Once the newbie-mode budget is exhausted, the interface shall
  hide the self-tick button and show a restart-newbie-mode button instead.
- REQ-SELF-015: The restart action shall require confirmation, then reset the
  kingdom to its creation-default stats and restore `newbiemode` to 96.
- REQ-SELF-016: The restart action shall be rejected while newbie-mode budget
  remains (8 or more) or while the game phase is `stopped`.
- REQ-SELF-017: The self-tick action shall return the updated kingdom object
  so the interface can adopt it directly without re-fetching.
- REQ-SELF-018: Kingdom actions shall be performed through react-query
  mutations that write the returned kingdom into the shared query cache.
- REQ-SELF-019: The self-tick action shall respect the kingdom's stored
  auto-build setting, running autonomous growth (exploration, construction,
  recruitment) only when auto-build is enabled.
- REQ-SELF-020: During self-ticking, autonomous military recruitment shall
  restrict purchases to soldiers and scientists while more than 24 newbie-mode
  ticks remain, and shall permit all military unit purchases once 24 or fewer
  newbie-mode ticks remain.

