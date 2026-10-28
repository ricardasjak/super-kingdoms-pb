# Messaging Requirements

## Origin

Derived from user request to add a basic player-to-player messaging system, support message viewing and composing, and allow elected Sector Leaders (SL) to broadcast mass messages to all kingdoms within their sector. Detailed narrative in [../stories/0070.player-messaging.story.md](../stories/0070.player-messaging.story.md) and [../stories/0071.sector-leader-mass-messaging.story.md](../stories/0071.sector-leader-mass-messaging.story.md).

## Requirements

### Player-to-Player Messaging

- REQ-MSG-001: The system shall provide an in-game messaging mechanism allowing any active player kingdom to send private messages to any other active kingdom in the universe using sector and kingdom coordinates.
- REQ-MSG-002: The messaging interface shall provide an **Inbox** (`Msg.aspx`), a **Compose** form (`SendMessages.aspx`), and a **Sent Log** (`Sent.aspx`).
- REQ-MSG-003: The system shall automatically delete all messages older than 3 days (72 hours) from the database to enforce archival retention policies.
- REQ-MSG-004: Each inbox message shall display the sender's kingdom name, ruler title, coordinates, subject, delivery timestamp, and message body.
- REQ-MSG-005: The system shall allow recipients to reply to a message, automatically pre-filling the sender's coordinates and prepending `Re: ` to the subject.
- REQ-MSG-006: The system shall allow recipients to delete individual messages from their inbox.
- REQ-MSG-007: The application header shall display an unread message notification badge indicating the number of unopened messages for the active kingdom.
- REQ-MSG-008: The system shall prevent kingdoms from sending messages to themselves or to non-existent kingdoms.

### Sector Leader Mass Messaging

- REQ-MSG-010: The system shall provide an elected Sector Leader with the ability to broadcast a single message simultaneously to all kingdoms located in their home sector.
- REQ-MSG-011: The system shall deny non-Sector Leaders access to the sector mass messaging dispatch endpoint.
- REQ-MSG-012: Mass broadcast messages shall be delivered into the individual inboxes of all kingdoms in the sector with a clear `[SECTOR BROADCAST]` tag and sender attribution identifying the Sector Leader title.
- REQ-MSG-013: The system shall enforce a cooldown period (e.g. 1 broadcast per hour or 12 ticks) on Sector Leader mass broadcasts to prevent message spam.
