# Super Kingdoms — System Requirements Documentation

This directory contains the formal, testable system requirements for the Super Kingdoms game implementation.

## Requirement Writing Standard

Every requirement document follows these core rules:
1. **File Naming**: `docs/requirements/<topic>.requirements.md` (kebab-case).
2. **Normative "Shall" Statements**: Requirements are phrased as testable system capabilities using RFC 2119 keywords (**SHALL**, **SHALL NOT**, **SHOULD**, **MAY**).
3. **No Build Commands**: Requirements describe *what the system does and how it behaves*, never procedural build or setup steps.
4. **Traceability**: Each requirement links to:
   - Source Game Design Document ([`docs/game-design/`](../game-design/README.md)).
   - Implementation Plan ([`docs/implementation-plan/`](../implementation-plan/README.md)).
   - Automated Test Suite ([`tests/api/`](../../tests/api/)).

## Topics & Requirement Documents

| ID | Topic | File | Scope | Status |
|---|---|---|---|---|
| **REQ-01** | **Auth & Identity** | [`01-auth-and-identity.requirements.md`](01-auth-and-identity.requirements.md) | Discord OAuth2 authentication, superuser fallback, token verification | In Progress |
| **REQ-02** | **Kingdom Founding & Archetypes** | [`02-kingdom-founding.requirements.md`](02-kingdom-founding.requirements.md) | Kingdom creation, 8 planet archetypes, initial asset grants, slot assignment | Implemented |
| **REQ-03** | **Simulation Engine & Newbie Mode** | [`03-simulation-engine.requirements.md`](03-simulation-engine.requirements.md) | 8-phase deterministic tick engine, civilian growth, power generation, 8-step Newbie Mode | Implemented |
| **REQ-04** | **Territory & Infrastructure** | [`04-territory-and-infrastructure.requirements.md`](04-territory-and-infrastructure.requirements.md) | Land exploration formula, building construction queues (16 ticks), razing refunds | Planned |
| **REQ-05** | **Research & Technologies** | [`05-research-and-tech.requirements.md`](05-research-and-tech.requirements.md) | Continual research scaling (`weight * land^2`), one-time breakthrough unlocks | Planned |
| **REQ-06** | **Military Operations & Combat** | [`06-military-and-combat.requirements.md`](06-military-and-combat.requirements.md) | Unit training, Torus travel formula, combat resolution, return waves, plunder | Planned |
| **REQ-07** | **Espionage Probes** | [`07-espionage-probes.requirements.md`](07-espionage-probes.requirements.md) | Probe factory production, 10 mission bank, 11 operations, counter-espionage | Planned |
| **REQ-08** | **Missiles & Defense Shields** | [`08-missiles-and-shields.requirements.md`](08-missiles-and-shields.requirements.md) | Missile silos, nuclear/fusion strikes, missile/military/probe shields, blackout | Planned |
| **REQ-09** | **Sector Politics & Alliances** | [`09-sector-politics.requirements.md`](09-sector-politics.requirements.md) | 10-kingdom matrix, Monarch election, sector fund, Trouble Status, emergency aid | Planned |
