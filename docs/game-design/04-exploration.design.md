# Game Design: Exploration & Land Expansion

> **System**: Peaceful Expansion & Territory Acquisition  
> **Source of Truth**: [docs/game-manual/explore.md](../game-manual/explore.md)

---

## 1. Overview & Role

Exploration provides a peaceful, non-military avenue for kingdoms to expand their territorial boundaries. It allows rulers to convert surplus economic capital into raw acreage for building construction, bypassing the risks of warfare.

---

## 2. Core Mechanics & Formulas

- **Daily Exploration Cap**:
  - Kingdoms are rate-limited to exploring at most **10% (1/10) of total land per day (24 hours)**.
- **Base Cost Formula**:
  - Financial expenditure per acre of land explored scales with current territory size:
    $$\text{Cost per Acre} = \sqrt{\text{Total Land}} \times 111$$
    $$\text{Total Cost} = \text{Acres Explored} \times (\sqrt{\text{Total Land}} \times 111)$$
- **Completion & Queue**:
  - Land is discovered progressively over time (tracked via Construction Status).
  - Newly acquired acres enter the kingdom as unbuilt (free) land.
- **Political Modifiers**:
  - When the sector enters the **Growth State**, exploration costs receive progressive discounts:
    - Land $\le 1,000$: **-75% Cost**
    - Land $1,001 - 2,500$: **-50% Cost**
    - Land $\ge 2,501$: **-25% Cost**

---

## 3. Exploration Specifications

| Parameter | Specification | Details & Rules |
|---|---|---|
| **Pacing Cap** | Max 10% of total land / 24h | Prevents runaway economic snowballing |
| **Input Currency** | Money | Base unit cost: $\sqrt{\text{Total Land}} \times 111$ per acre |
| **Output** | Free (Unbuilt) Land | Ready for immediate construction |
| **Tracking** | Construction / Status Room | Hourly arrival rate and completion ETA |
| **Sector Growth Synergy** | Up to -75% Cost Reduction | Gated by Sector Leader political declaration |

---

## 4. System Synergies & Dependencies

- **Infrastructure**: Directly fuels the kingdom's building ceiling; without free land, no new power plants, residences, or mines can be placed.
- **Research Scaling**: Since Continual Research effectiveness compares accumulated points to Total Land, large-scale exploration dilutes research percentages unless scientific staffing keeps pace.
- **Military Defense Baseline**: Every acre of land inherently provides **2 baseline defense points** if military garrisons are absent.
