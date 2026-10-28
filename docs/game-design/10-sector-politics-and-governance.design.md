# Game Design: Sector Politics & Governance

> **System**: Sector Elections, Collective Taxation, Sector States & Orbital Stations
> **Sources of Truth**: [docs/game-manual/sector.md](../game-manual/sector.md) & [docs/game-manual/politics.md](../game-manual/politics.md) & [docs/vindicator-guide/14-extra-calculations-and-formulas.md](../vindicator-guide/14-extra-calculations-and-formulas.md)

---

## 1. Overview & Role

Every sector unites 10 neighboring kingdoms into a collective political entity. Rulers elect a Sector Leader (Monarch) who sets sector tax policies, manages the shared Sector Treasury, activates powerful Sector States, and constructs orbital infrastructure or hostile sector weapons.

---

## 2. Core Mechanics

- **Democratic Elections**:
  - Every ruler casts 1 vote for Sector Leader.
  - Victory requires receiving more than **50% of active sector votes** (or highest tally upon tie-break).
- **Sector Leader Combat & Travel Privileges**:
  - The Monarch receives a direct **+10% combat offense and defense bonus**.
  - Attacks between kingdoms within the same sector receive a **-10% travel time discount**.
- **Shared Sector Treasury**:
  - Funded via an automated sector income tax levied on all member kingdoms.
  - Used exclusively to finance orbital enhancements, sector buffs, or hostile sector weapons.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Sector Leader Privileges & Intra-Sector Travel
- **Monarch Combat Bonus**:
  $$\text{Monarch Offense} = \text{Base Offense} \times 1.10, \quad \text{Monarch Defense} = \text{Base Defense} \times 1.10$$
- **Intra-Sector Travel Modifier**:
  $$S_{\text{bonus}} = -10\% \text{ travel time if attacker and defender share the same sector}$$

### 3.2 Sector Taxation Formula
- **Hourly Sector Fund Inflow**:
  $$\text{Sector Fund Deposit} = \sum_{k=1}^{10} \left( \text{Gross Income}_k \times \frac{\text{SectorTaxRate}}{100} \right) \quad [\text{Tax Rate } 0\% \text{ to } 5\%]$$

### 3.3 Dynamic Sector Weapon Cost Scaling
Costs of dynamic sector weapons scale with the target sector's Networth or Land:
- **Dark Matter Plague**: $\text{Cost} = \text{Target Sector NW} \times 3.0$
- **Super Virus**: $\text{Cost} = \text{Target Sector Land} \times 225$
- **SpyNet**: $\text{Cost} = (\text{Target Sector NW} \times 1.0) + 3,750,000$
- **Solar Winds Buff**: $\text{Cost} = \text{Sector NW} \times 0.25$

---

## 4. Specifications Table

### 4.1 Sector States (Monarch Proclamations)

| Sector State | Upkeep / Constraint | Sector-Wide Operational Effects |
|---|---|---|
| **Normal** | 0% Fund Upkeep | Baseline standard operations; neutral modifiers |
| **Peaceful** | 10% Fund Upkeep | +25% Civilian Birthrate, -20% Exploration Cost |
| **Expansionist** | 20% Fund Upkeep | -75% Land Exploration Cost, +10% Building Cost |
| **Offensive** | 30% Fund Upkeep | +10% Military Offense, +10% Attack Gains, -10% Defense |
| **Defensive** | 30% Fund Upkeep | +20% Military Defense, -20% Attack Travel Speed |
| **Mobilization** | 40% Fund Upkeep | -30% Soldier & Unit Training Costs, -15% Civilian Taxes |

### 4.2 Sector Enhancements & Weapons Matrix

| Project | Type | Base Cost | Core Effect | Duration |
|---|---|---|---|---|
| **Cloning Station** | Enhancement | 500,000 money | +10% Sector Birthrate | Permanent *(until destroyed)* |
| **Research Station** | Enhancement | 5,000,000 money | +10% Sector Research Output | Permanent *(until destroyed)* |
| **Sector Defense** | Enhancement | 10,000,000 money | +4,500 Baseline Defense Points | Permanent *(until destroyed)* |
| **Solar Winds** | Enhancement | $\text{NW} \times 0.25$ | +50% Power Production | 48 hours |
| **Dark Matter Plague** | Weapon | $\text{Target NW} \times 3.0$ | Loses 1% soldiers/tick, -20% income, -20% power | Until cured |
| **SpyNet** | Weapon | $\text{NW} + 3.75\text{M}$ | Siphons **25%** of target Sector Fund | Instant |

---

## 5. System Synergies & Dependencies

- **Coordinated Warfare**: Sector States like *Offensive* or *Mobilization* are coordinated before major war campaigns to maximize land gains.
- **Economic Drainage**: High sector tax rates can strain individual kingdom budgets unless channeled into high-yield enhancements like *Solar Winds* or *Nano Bots*.
- **Station Vulnerability**: Orbital stations provide immense passive power, making *Targeted Missile Strikes* high-priority defensive countermeasures.
