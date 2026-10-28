# Game Design: Sector Politics & Governance

> **System**: Sector Leadership, Taxation, Strategic States & Influences  
> **Source of Truth**: [docs/game-manual/politics.md](../game-manual/politics.md)

---

## 1. Overview & Role

Kingdoms are grouped into political units known as Sectors. Through democratic elections, sectors appoint a Sector Leader who sets fiscal policy, directs strategic postures via Sector States, and deploys high-impact Sector Influences (orbital stations, galactic weather buffs, and biological/electronic weapons) financed by the shared Sector Fund.

---

## 2. Core Mechanics & Formulas

- **Elections & Leadership**:
  - Each kingdom casts 1 vote; the candidate with the simple majority becomes **Sector Leader**.
  - **Leader Buff**: Sector Leader receives a passive **+10% military effectiveness bonus** (both offense and defense).
  - Leader appoints a Vice Leader to assist with sector communication and forum moderation.
- **Sector Taxation & Treasury**:
  - Leader sets a tax rate between **0% and 5%** deducted from all member kingdoms' gross hourly income.
  - Revenue pools into the **Sector Fund**, which finances strategic enhancements and sector weapons.
- **Sector Strategic States**:
  - The Leader can shift the sector into one of five mutually exclusive operational states.
- **Sector Weapons Gating**:
  - Offensive weapons can only target rival sectors within a **$0.5\times$ to $2.0\times$ Sector Networth** range.

---

## 3. Specifications: States & Influences

### 3.1 Sector States

| State | Primary Effects | Operational Trade-offs |
|---|---|---|
| **None** | Baseline gameplay | None |
| **Growth** | 2x birth rate; -75% / -50% / -25% exploration cost scaling | +10% defensive casualties |
| **Mobilization** | Military training accelerated to **12 hours** | Probe storage capped at 5; only 3 War Leaders usable |
| **Offensive** | +10% Land gains on attacks | +10% offensive casualties; **0% MA Protection** when defending |
| **Defensive** | Military Shields permanently at 10% (0 energy cost); -25% defensive casualties | Only 2 War Leaders usable |

### 3.2 Sector Enhancements (Treasury Funded)

| Enhancement | Cost | Strategic Effect | Duration |
|---|---|---|---|
| **Cloning Station** | 500,000 money | +10% Sector Birthrate | Permanent *(until destroyed)* |
| **Research Station** | 5,000,000 money | +10% Sector Research Efficiency | Permanent *(until destroyed)* |
| **Sector Defense** | 10,000,000 money | +4,500 Baseline Defense Points | Permanent *(until destroyed)* |
| **Solar Winds** | $\text{Sector NW} \times 0.25$ | +50% Power Production | 48 hours |
| **Warp Gate** | $\text{Sector Land} \times 100$ | Base attack march time -1 hour | 24 hours |
| **Nano Bots** | $\text{Sector NW} \times 0.35$ | +10% Economic Income | 24 hours |
| **Sector Cure** | $\text{Sector NW} \times 0.75$ | 25% chance to cure Plague; 75% chance to cure Virus | Instant |

### 3.3 Sector Weapons (Hostile Deployments)

| Weapon | Cost | Hostile Effects on Target Sector | Duration |
|---|---|---|---|
| **Dark Matter Plague** | $\text{Target NW} \times 3.0$ | Loses 1% soldiers/tick; -20% income; -20% power; -50% birthrate | Until cured |
| **Super Virus** | $\text{Target Land} \times 225$ | -10% Income; -10% Power Production | Until cured |
| **Solar Cloud** | 3,750,000 money | Base attack march time +2 hours | 24 hours |
| **Black Hole** | $\text{Target NW} \times 1.0$ | Blocks all intergalactic travel | 24 hours |
| **SpyNet** | $(\text{Target NW} \times 1.0) + 3,750,000$ | Siphons **25%** of target's Sector Fund | Instant |
| **Targeted Missile Strike** | 3,750,000 money | 10% chance to permanently destroy an orbital station | Instant |

---

## 4. System Synergies & Dependencies

- **Coordinated Warfare**: Sector States like *Offensive* or *Mobilization* are coordinated before major war campaigns to maximize land gains.
- **Economic Drainage**: High sector tax rates can strain individual kingdom budgets unless channeled into high-yield enhancements like *Solar Winds* or *Nano Bots*.
- **Station Vulnerability**: Orbital stations provide immense passive power, making *Targeted Missile Strikes* high-priority defensive countermeasures.
