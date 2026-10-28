# Game Design: Missiles & Planetary Defense Shields

> **System**: Strategic Deterrence, Orbital Bombardment & Defense Shield Arrays
> **Sources of Truth**: [docs/game-manual/missile.md](../game-manual/missile.md) & [docs/game-manual/shields.md](../game-manual/shields.md) & [docs/vindicator-guide/10-power-and-shields.md](../vindicator-guide/10-power-and-shields.md)

---

## 1. Overview & Role

Missiles and planetary shields represent high-stakes strategic warfare. Rulers construct orbital missile silos to launch devastating long-range bombardments against rival kingdoms, while planetary defense shield arrays convert surplus power into force barriers that absorb incoming missiles, blunt military incursions, and scramble enemy probe operations.

---

## 2. Core Mechanics

- **Alliance Gating & 24-Hour Cooldown**:
  - Missiles can only be fired against kingdoms when a formal **Alliance War** is declared.
  - A kingdom may only be targeted by a missile strike **once every 24 hours**.
- **Planetary Defense Shield Arrays**:
  - Rulers distribute surplus energy across three independent shield arrays: **Missile Shield**, **Military Shield**, and **Probe Shield**.
  - Powered strictly by hourly surplus power output. If the kingdom enters an energy brownout, all shield arrays immediately collapse.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Missile Damage Equations & Caps
- **Nuclear Missile Damage**:
  $$\text{Damage} = 2\text{ land destroyed}, \; 150\text{ civilians killed} \quad [\text{Capped at } 0.5\% \text{ Land}, \; 5.0\% \text{ Pop}]$$
- **Fusion Missile Damage**:
  $$\text{Damage} = 4\text{ land destroyed}, \; 400\text{ civilians killed} \quad [\text{Capped at } 1.0\% \text{ Land}, \; 2.5\% \text{ Pop}]$$
- **Energy Missile Damage**:
  $$\text{Damage} = 8\text{ land destroyed}, \; 1,000\text{ civilians killed} \quad [\text{Capped at } 1.0\% \text{ Land}, \; 5.0\% \text{ Pop}]$$

### 3.2 Shield Combat Mitigation Formulas
- **Military Defense Shield Formula**:
  $$\text{Attacker Offense Penalty} = -1\% \text{ per active shield level} \quad [\text{Max } -10\%]$$
- **Missile Interception Rate**:
  $$\text{Interception Chance} = \text{Missile Shield Level} \times 10\% \quad [\text{Max } 100\%]$$
- **Probe Interference Rate**:
  $$\text{Hostile Probe Failure Bonus} = +20\% \text{ at max Probe Shield level}$$

---

## 4. Specifications Table

### 4.1 Missile Arsenal

| Missile Type | Unit Cost | Unit Damage | Max Damage per Strike | Prerequisite |
|---|---|---|---|---|
| **Nuclear Missile** | 5,000 money | 2 land, 150 pop | 0.5% Land, 5.0% Pop | None |
| **Fusion Missile** | 16,000 money | 4 land, 400 pop | 1.0% Land, 2.5% Pop | Fusion Technology |
| **Energy Missile** | 15,000 money + 10,000 power | 8 land, 1,000 pop | 1.0% Land, 5.0% Pop | Energy Core Research |

### 4.2 Planetary Defense Shield Arrays

| Shield Subsystem | Primary Function | Max Effectiveness | Fuel / Resource |
|---|---|:---:|---|
| **Missile Shield** | Intercepts orbital warheads | **100% Interception** | Surplus Power Output |
| **Military Shield** | Depresses attacker offense | **-10% Attacker Offense** | Surplus Power Output |
| **Probe Shield** | Scrambles enemy cybernetic signals | **+20% Enemy Probe Failure** | Surplus Power Output |

---

## 5. System Synergies & Dependencies

- **Energy Grid Dependency**: Energy Missiles and all three shield systems demand substantial power; grid sabotage leaves kingdoms exposed to strikes.
- **Alliance Politics**: Missiles cannot be fired unilaterally; alliance leaders must formally declare War first.
- **Covert Pre-Strike Sabotage**: Espionage probes can spy on enemy shield levels or sabotage power plants right before launching an orbital strike to bypass shields.
