# Game Design: Exploration & Land Expansion

> **System**: Territorial Expansion & Frontier Colonization
> **Sources of Truth**: [docs/game-manual/explore.md](../game-manual/explore.md) & [docs/vindicator-guide/02-during-the-first-week.md](../vindicator-guide/02-during-the-first-week.md)

---

## 1. Overview & Role

Exploration provides a peaceful, non-military mechanism for territorial expansion. Rulers spend treasury funds to survey unchartered sectors and acquire free (unbuilt) land, enabling early-game economic bootstrapping and steady territorial progression without risking armies in battle.

---

## 2. Core Mechanics

- **Peaceful Territorial Gain**:
  - Unclaimed acres are incorporated directly into the kingdom as unbuilt land.
- **Exploration Daily Cap**:
  - Maximum exploration volume is restricted to **10% of total land per 24 hours**.
  - Prevents runaway peaceful snowballing.
- **Exploration Queue & Delay**:
  - Exploration orders take a fixed number of hours to complete before land is granted.
- **Sector State Synergy**:
  - Sectors operating under the *Expansionist* Sector State receive steep discounts on exploration costs.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Exploration Cost Curve
Exploration money cost per acre scales with total land:

$$\text{Exploration Cost per Acre} = \text{round}\left(\sqrt{\text{Total Land}} \times 111\right)$$

*(Early exploration costs are significantly cheaper than mid-game exploration, incentivizing maximum exploration during peaceful development).*

### 3.2 Daily Exploration Cap Formula
$$\text{Max Explored Land / 24h} = \left\lfloor \text{Total Land} \times 0.10 \right\rfloor$$

### 3.3 Sector Political Discount
When a Sector Leader declares an Expansionist political stance:
$$\text{Effective Exploration Cost} = \text{Exploration Cost} \times (1 - \text{SectorDiscount}) \quad [\text{Discounts up to } 75\%]$$

---

## 4. Specifications Table

| Metric / Parameter | Value / Range | Constraint & Trigger |
|---|---|---|
| **Daily Land Exploration Ceiling** | Max **10% of current Total Land** | Resets every 24 hours (ticks) |
| **Land Condition on Arrival** | 100% Unbuilt / Free Land | Requires construction allocation |
| **Exploration Queue Duration** | Fixed batch delay of **24 ticks (hours)** | Queued operations lock treasury funds |
| **Sector Growth Synergy** | Up to -75% Cost Reduction | Gated by Sector Leader political declaration |

---

## 5. System Synergies & Dependencies

- **Infrastructure**: Directly fuels the kingdom's building ceiling; without free land, no new power plants, residences, or mines can be placed.
- **Research Scaling**: Since Continual Research effectiveness compares accumulated points to $\text{Land}^2$, large-scale exploration dilutes research percentages unless scientific staffing keeps pace.
- **Military Defense Baseline**: Every acre of land inherently provides **2 baseline defense points** if military garrisons are absent.
