# Game Design: Economy, Population & Energy Grid

> **System**: Demographics, Taxation, Resource Extraction & Power Management  
> **Source of Truth**: [docs/game-manual/status.md](../game-manual/status.md) & [docs/game-manual/buildings.md](../game-manual/buildings.md)

---

## 1. Overview & Role

The kingdom's economy is sustained by its civilian population and industrial infrastructure. Civilians provide tax revenue and the recruitment pool for military forces, while Star Mines and power plants fuel construction, scientific endeavors, and operational grid demands.

---

## 2. Core Mechanics & Formulas

- **Demographics & Population Capacity**:
  - Residential Cap: **50 civilians per Residence** (**55** with *Longevity* technology).
  - Barracks Cap: **75 military units per Barracks**.
  - **Military Eviction Rule**: When Barracks are full, military units occupy Residences, forcibly evicting civilians and capping civilian growth.
  - **Growth & Decimation**:
    - Population grows each tick up to available housing capacity.
    - Overcrowded kingdoms experience rapid hourly population decline down to sustainable limits.
    - **Combat Record Modifier**: Every **50 offensive victories** awards **+1% population bonus**; every **50 defensive losses** inflicts **-1% population penalty**.
- **Income Generation & Taxation**:
  - **Taxes**: Collected hourly from civilian population; amplified by Continual Money Research (up to +25%).
  - **Star Mines**: Provide guaranteed industrial extraction of **+120 money per hour** (no housing or population required).
  - **Sector Tax Deduction**: Sector Leaders levy a **0% to 5%** tax on gross hourly income, routing funds to the shared Sector Treasury.
- **Power Grid & Brownouts**:
  - **Production**: Nuclear Plants (+100/hr, max 500 store); Fusion Plants (+140/hr, max 1,000 store).
  - **Consumption**: Military units consume **double (2x)** the power of civilians.
  - **Grid Deficits**: If power demand exceeds generation and storage, a brownout occurs: all planetary defense shields collapse immediately, and military defense readiness drops.

---

## 3. Economic & Energy Balance Matrix

| Component | Base Rate / Capacity | Primary Scaling Factor | System Interactions |
|---|---|---|---|
| **Civilian Population** | 50 / Residence | Longevity (+10%), Sector State (2x) | Tax revenue, soldier recruitment pool |
| **Star Mine Output** | +120 Money / hr | Forest & Wilderness (+25 money/mine) | Flat income unaffected by population decline |
| **Civilian Power Load** | Baseline (1x) | Population count | Scales with residential expansion |
| **Military Power Load** | Heavy (2x) | Army count | Large standing armies require dedicated power plants |
| **Shield Power Load** | Variable excess | Shield settings (Military / Missile / Probe) | Drains remaining surplus power |
| **Sector Tax Siphon** | 0% – 5% | Sector Leader policy | Financed directly into Sector Fund |

---

## 4. System Synergies & Networth Impact

- **Networth (NW) Anchor**: Land, structures, standing armies, and population collectively determine kingdom Networth.
- **Vulnerability Under Over-Mobilization**: Enlisting too many civilians into soldiers shrinks tax income while doubling power consumption, risking grid insolvency.
- **Brownout Exploitation**: Attackers frequently use covert probe sabotage to induce enemy brownouts right before launching land invasions.
