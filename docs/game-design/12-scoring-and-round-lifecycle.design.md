# Game Design: Scoring, Daily Rewards & Round Lifecycle

> **System**: Leaderboards, Networth Valuation, Daily Rewards & Round Pacing
> **Sources of Truth**: [docs/game-manual/scores.md](../game-manual/scores.md) & [docs/game-manual/rewards.md](../game-manual/rewards.md) & [docs/vindicator-guide/09-net-worth-and-research.md](../vindicator-guide/09-net-worth-and-research.md)

---

## 1. Overview & Role

Super Kingdoms operates in discrete, competitive round seasons. Players compete individually and collectively (by Sector and Alliance) for leaderboard dominance based on Networth, land holdings, military strength, and combat honor. Daily rewards provide baseline retention and recovery incentives throughout the round.

---

## 2. Core Mechanics

- **Daily Kingdom Rewards**:
  - Claimable once every 24 hours: Land grant and treasury subsidy.
  - Unclaimed rewards expire and do not stack.
- **Target Range Eligibility Window**:
  - A kingdom may only attack or probe targets within a **3x Networth window**:
    $$\frac{1}{3} \times \text{Own NW} \le \text{Target NW} \le 3 \times \text{Own NW}$$
- **Round Pacing & Phase Progression**:
  - **Phase 1 (Newbie Mode)**: 72 hours of total protection and peaceful economic development.
  - **Phase 2 (PvE Mode)**: Bot targets and intra-sector consolidation.
  - **Phase 3 (PvP Mode)**: Full galaxy warfare, sector politics, and alliance diplomacy.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Complete Networth (NW) Valuation Formula
Networth is computed every tick by summing the values of all territorial, military, demographic, and economic assets:

$$\begin{aligned}
\text{Total Networth} &= (\text{Land} \times 25) \\
&+ (\text{Buildings} \times 25) \quad [\text{includes in-construction buildings}] \\
&+ (\text{Tanks} \times 22) \\
&+ (\text{Tactical Fighters} \times 18) \\
&+ (\text{Scientists} \times 8) \\
&+ (\text{Laser Dragoons} \times 8) \\
&+ (\text{Laser Troopers} \times 7) \\
&+ (\text{Dragoons} \times 7) \\
&+ (\text{Troopers} \times 6) \\
&+ (\text{Soldiers} \times 3) \\
&+ (\text{Civilians} \times 1) \\
&+ \left\lfloor \frac{\text{Treasury Money}}{500} \right\rfloor \\
&+ \left\lfloor \frac{\text{Probes}}{1,000} \right\rfloor
\end{aligned}$$

*(Note: Stored Power and Missiles contribute $0\text{ NW}$).*

### 3.2 Daily Rewards Formulas
- **Daily Land Grant**: $+10\text{ unbuilt acres}$
- **Daily Treasury Subsidy**:
  $$\text{Daily Money Grant} = 3 \times \text{Gross Hourly Income}$$

### 3.3 Target Window Constraints
$$\text{Attack Permitted IF: } \text{Target NW} \ge \left\lceil \frac{\text{Attacker NW}}{3} \right\rceil \quad \text{AND} \quad \text{Target NW} \le \text{Attacker NW} \times 3$$

---

## 4. Specifications Table

| Metric / Reward | Formula / Exact Value | Reset / Evaluation | Gameplay Purpose |
|---|---|---|---|
| **Daily Land Reward** | +10 Land | Every 24 hours *(non-stacking)* | Guaranteed expansion for small kingdoms |
| **Daily Cash Reward** | $3\times \text{Hourly Income}$ | Every 24 hours *(non-stacking)* | Capital injection for construction or training |
| **Networth (NW)** | Composite Formula *(see §3.1)* | Recalculated on hourly tick | Universal power ranking and target gate |
| **Honor Standing** | Net Battle Honor | Updated post-combat | Dictates income buffs and training discounts |
| **Target Eligibility** | $3\times$ Networth Window | Evaluated at launch | Protects smaller kingdoms from predator strikes |

---

## 5. System Synergies & Dependencies

- **Target Filtering**: Networth actively regulates attack and espionage eligibility, preventing high-tier players from crushing developing kingdoms.
- **Economic Recovery**: Rulers devastated by war can rely on daily land and treasury grants alongside sector aid to rebuild.
- **Competitive Win Conditions**: Alliance and sector standings incentivize cooperation and mutual defense over rogue play.
