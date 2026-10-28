# Game Design: Economy, Population & Energy Grid

> **System**: Demographics, Taxation, Resource Extraction & Power Management
> **Sources of Truth**: [docs/game-manual/status.md](../game-manual/status.md) & [docs/vindicator-guide/14-extra-calculations-and-formulas.md](../vindicator-guide/14-extra-calculations-and-formulas.md)

---

## 1. Overview & Role

The kingdom's economy is sustained by its civilian population and industrial infrastructure. Civilians provide tax revenue and the recruitment pool for military forces, while Star Mines and power plants fuel construction, scientific endeavors, and operational grid demands.

---

## 2. Core Mechanics

- **Civilian Taxation**:
  - Collected automatically on every hourly tick based on active civilian population.
  - Amplified by continual Money Research.
- **Star Mines**:
  - Independent industrial resource extraction generating flat revenue without requiring civilian labor or power.
  - Immune to hostile probe arson attacks.
- **Hidden Income Variance**:
  - Realized hourly income experiences a subtle natural fluctuation every tick.
- **Demographics & Housing Limits**:
  - Normal growth occurs up to residential capacity. Overcrowded conditions cause population decimation.
- **Power Grid & Brownout Degradation**:
  - Military units consume double the energy of civilians.
  - Depleting stored energy triggers a brownout: planetary defense shields deactivate and military combat ratings drop.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Demographics & Growth Equations
- **Residence Civilian Housing Limit**:
  $$\text{Housing Cap} = \text{Residences} \times 50 \times (1 + \text{PopulationBonus}) \quad [\text{Max } 60\text{ civ/residence}]$$
- **Natural Population Growth Rate**:
  $$\text{Hourly Civilian Growth} = \min(2.5\% \times \text{Current Population}, \; \text{Free Housing Space})$$

### 3.2 Tax Revenue & Mining Equations
- **Civilian Base Tax Rate**:
  $$\text{Base Tax Revenue} = \text{Civilians} \times 1.95\text{ money/hour}$$
- **Star Mine Base Extraction Rate**:
  $$\text{Base Mine Revenue} = \text{Star Mines} \times 120\text{ money/hour}$$
  *(Consumes $0\text{ power}$; immune to arson).*
- **Money Research Multiplier**:
  $$\text{Gross Revenue} = (\text{Base Tax} + \text{Base Mine}) \times \left(1 + \frac{\text{MoneyResearch } \%}{100}\right)$$
- **Hidden Income Variance Formula**:
  $$\text{Realized Hourly Revenue} = \text{Gross Revenue} \times (1 \pm \text{Random}(0.00, \; 0.05))$$
  *(Applies a hidden $\pm 5\%$ random variance to every tick's payout).*

### 3.3 Power Grid Consumption & Brownout Penalty
- **Total Power Demand**:
  $$\text{Power Demand} = (\text{Civilians} \times 0.35) + \sum (\text{Military Units} \times \text{UnitPowerLoad}) + \text{Active Shield Load}$$
- **Brownout Trigger**:
  $$\text{Grid State} = \begin{cases} \mathbf{Normal} & \text{if } \text{Stored Power} + \text{Generation} \ge \text{Demand} \\ \mathbf{Blackout / Brownout} & \text{if } \text{Stored Power} + \text{Generation} < \text{Demand} \end{cases}$$
- **Blackout Penalties**:
  - Attacker Offense Multiplier: $-20\%$
  - Defender Defense Multiplier: $-20\%$
  - Planetary Shields: All collapse to $0\%$ effectiveness immediately.

---

## 4. Economic & Energy Balance Matrix

| Component | Base Rate / Capacity | Primary Scaling Factor | System Interactions |
|---|---|---|---|
| **Civilian Population** | 50 / Residence | Longevity (+10%), Sector State (2x) | Tax revenue, soldier recruitment pool |
| **Star Mine Output** | +120 Money / hr | Forest & Wilderness (+25 money/mine) | Flat income unaffected by population decline |
| **Civilian Power Load** | 0.35 power / civilian / hr | Population count | Scales with residential expansion |
| **Military Power Load** | Heavy (2x civilian rate) | Army count | Large standing armies require dedicated power plants |
| **Shield Power Load** | Variable excess | Shield settings (Military / Missile / Probe) | Drains remaining surplus power |
| **Sector Tax Siphon** | 0% – 5% | Sector Leader policy | Financed directly into Sector Fund |

---

## 5. System Synergies & Networth Impact

- **Networth (NW) Anchor**: Land, structures, standing armies, and population collectively determine kingdom Networth.
- **Vulnerability Under Over-Mobilization**: Enlisting too many civilians into soldiers shrinks tax income while doubling power consumption, risking grid insolvency.
- **Brownout Exploitation**: Attackers frequently use covert probe sabotage to induce enemy brownouts right before launching land invasions.
