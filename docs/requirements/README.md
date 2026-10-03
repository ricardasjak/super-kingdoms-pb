# Requirements

Prompt-derived requirements, phrased as requirements rather than commands.

## Convention

- One file per feature or change: `<topic>.requirements.md`.
- Statements use "shall" / "shall not" and describe _what_ the system does, never _how_ to build it.
- Each statement carries a stable ID (`REQ-<topic>-<nnn>`) so later prompts can amend individual requirements.
- Source prompts or narrative stories in [../stories/](../stories/) are summarized at the top of each file under "Origin" for traceability.

## Tracking & Implementation

- Implementation tasks derived from these requirements are tracked in [TODO.md](../TODO.md).
