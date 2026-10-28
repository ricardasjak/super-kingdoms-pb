# Game Design: Missiles & Planetary Defense Shields

> **System**: Strategic Bombardment & Homeland Shield Arrays  
> **Source of Truth**: [docs/game-manual/missile.md](../game-manual/missile.md) & [docs/game-manual/shields.md](../game-manual/shields.md)

---

## 1. Overview & Role

Missiles are weapons of mass destruction designed for inter-alliance warfare. Unlike standard military invasions that conquer land for assimilation, missile strikes permanently vaporize acreage and eliminate civilian populations from afar. Rulers counter orbital bombardment and kinetic invasions by allocating surplus grid energy to planetary defense shield arrays.

---

## 2. Core Mechanics & Formulas

- **War Prerequisite**:
  - Missiles may **only be launched during an active, declared War** between alliances.
- **Launch Rate Limit**:
  - Kingdoms are restricted to **1 missile strike per 24 hours**.
- **Permanent Destruction**:
  - Impacted land is permanently deleted from the universe; it cannot be harvested by the attacker.
- **Combined Salvo Damage**:
  - Rulers can fire mixed arsenals simultaneously. The theoretical ceiling across all three missile types is **2.5% land** and **12.5% population** per 24h bombardment.
- **Planetary Defense Energy Allocation**:
  - Shields do not consume financial capital; they operate on continuous excess power grid output.
  - Insufficient grid power degrades shield efficiency proportionally.

---

## 3. Missile & Shield Specifications

### 3.1 Missile Arsenal

| Missile Type | Unit Cost | Unit Damage | Max Damage per Strike | Prerequisite |
|---|---|---|---|---|
| **Nuclear Missile** | 5,000 money | 2 land, 150 pop | 0.5% Land, 5.0% Pop | None |
| **Fusion Missile** | 16,000 money | 4 land, 400 pop | 1.0% Land, 2.5% Pop | Fusion Technology |
| **Energy Missile** | 15,000 money + 10,000 power | 8 land, 1,000 pop | 1.0% Land, 5.0% Pop | Energy Core Research |

### 3.2 Planetary Defense Shield Arrays

| Shield Subsystem | Primary Function | Max Effectiveness | Fuel / Resource |
|---|---|:---:|---|
| **Missile Shield** | Intercepts and detonates orbital warheads before impact | **100% Interception** | Surplus Power Output |
| **Military Shield** | Rebounds incoming battle carriers, depressing attacker offense | **-10% Attacker Offense** | Surplus Power Output |
| **Probe Shield** | Scrambles frequencies to disrupt enemy cybernetic signals | **+20% Enemy Probe Failure** | Surplus Power Output |

---

## 4. System Synergies & Dependencies

- **Energy Grid Dependency**: Energy Missiles and all three shield systems demand substantial power; grid sabotage or underbuilt power plants leaves kingdoms exposed to strikes.
- **Alliance Politics**: Missiles cannot be fired unilaterally against random targets; alliance leaders must formally declare War first.
- **Covert Pre-Strike Sabotage**: Espionage probes can spy on enemy shield levels or sabotage power plants right before launching an orbital strike to bypass shields.
