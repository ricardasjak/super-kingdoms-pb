# Requirements: Authentication & Identity

> **Requirement ID**: REQ-01  
> **Topic**: Authentication, Authorization & Identity Management  
> **Status**: In Progress  
> **Traceability**: [`docs/implementation-plan/01-database-schema-and-pocketbase.md`](../implementation-plan/01-database-schema-and-pocketbase.md), [`docs/implementation-plan/05-clean-slate-and-milestones.md`](../implementation-plan/05-clean-slate-and-milestones.md)

---

## 1. User Authentication

### 1.1 Discord OAuth2 Authentication
- The system **SHALL** support user sign-in and account registration via Discord OAuth2 using PocketBase's native OAuth2 provider mechanisms.
- Upon successful Discord OAuth2 authentication, the system **SHALL** create or link a record in the `users` collection with the player's Discord identity details (ID, username, avatar).
- The client application **SHALL** subscribe to `pb.authStore.onChange` to maintain real-time synchronization of the user's authentication state across browser tabs and sessions.

### 1.2 Administrative & Test Authentication
- The system **SHALL** support email and password authentication exclusively for administrative superusers and automated integration test suites.
- Production human accounts **SHALL NOT** require or rely on email password credentials for gameplay access.

---

## 2. Authorization & Access Control

### 2.1 Collection API Rules
- The system **SHALL** require a valid, non-empty authenticated user ID (`@request.auth.id != ""`) for viewing game resources (`game_status`, `sectors`, public `kingdoms` listing).
- The system **SHALL** restrict direct client updates and deletions on the `kingdoms` collection (`updateRule: null`, `deleteRule: null`), ensuring all mutations execute exclusively through verified server-side route handlers or superuser operations.
- The system **SHALL** allow a user to query their own active kingdom using filter `@request.auth.id = user`.

### 2.2 Endpoint Protection
- All game action endpoints (`/api/kingdoms/*`, `/api/sector/*`) **SHALL** verify the presence of an active authentication record (`e.requestInfo().auth`).
- If an unauthenticated request attempts to call a protected game action, the system **SHALL** reject the request with HTTP 401 or HTTP 400.
- When performing an action on a kingdom, the system **SHALL** verify that the authenticated user is the designated owner of that kingdom.
