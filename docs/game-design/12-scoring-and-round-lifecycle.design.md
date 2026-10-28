# Game Design: Scoring, Daily Rewards & Round Lifecycle

> **System**: Leaderboards, Networth Valuation, Daily Rewards & Round Pacing  
> **Source of Truth**: [docs/game-manual/scores.md](../game-manual/scores.md) & [docs/game-manual/rewards.md](../game-manual/rewards.md)

---

## 1. Overview & Role

Super Kingdoms operates in discrete, competitive round seasons. Players compete individually and collectively (by Sector and Alliance) for leaderboard dominance based on Networth, land holdings, military strength, and combat honor. Daily rewards provide baseline retention and recovery incentives throughout the round.

---

## 2. Core Mechanics & Formulas

- **Daily Kingdom Rewards**:
  - Available to claim once every **24 hours**:
    1. **Land Grant**: **+10 free unbuilt land**.
    2. **Treasury Subsidy**: Lump sum equal to **3 hours of gross income**.
  - Rulers may claim both rewards daily; uncollected rewards expire and **do not accumulate**.
- **Scoring Dimensions**:
  - Standings update periodically throughout the day across five core leaderboards:
    1. **Networth (NW)**: Primary ranking index measuring overall kingdom power.
    2. **Land Acreage**: Total sovereign territory controlled.
    3. **Military Strength**: Raw combined offensive and defensive rating of living armies.
    4. **War Honor**: Honorable combat record and battle prestige.
    5. **Sector & Alliance Standings**: Collective ranking of sectors and alliances.
- **Round Pacing & Phase Progression**:
  - Rounds progress through structured game phases:
    - **Phase 1 (Newbie Mode)**: Total isolation and peaceful economic buildup.
    - **Phase 2 (PvE Mode)**: Open bot conflict and safe intra-sector exploration.
    - **Phase 3 (PvP Mode)**: Full galaxy warfare, sector conflicts, and alliance treaties.

---

## 3. Daily Rewards & Scoring Matrix

| Reward / Metric | Formula / Value | Frequency / Reset | Strategic Value |
|---|---|---|---|
| **Daily Land Reward** | +10 Land | Every 24 hours *(non-stacking)* | Guaranteed expansion for small kingdoms |
| **Daily Cash Reward** | $3\times \text{Hourly Income}$ | Every 24 hours *(non-stacking)* | Capital injection for construction or training |
| **Networth (NW)** | Composite Index | Calculated on hourly tick | Gates target eligibility (3x window) |
| **Honor Standing** | Net Battle Honor | Updated post-combat | Dictates income buffs/penalties |
| **Round Archive** | Top Hall of Fame | Finalized at round conclusion | Historical preservation and accolades |

---

## 4. System Synergies & Dependencies

- **Target Filtering**: Networth actively regulates attack and espionage eligibility, preventing high-tier players from crushing developing kingdoms.
- **Economic Recovery**: Rulers devastated by war can rely on daily land and treasury grants alongside sector aid to rebuild.
- **Competitive Win Conditions**: Alliance and sector standings incentivize cooperation and mutual defense over rogue play.
