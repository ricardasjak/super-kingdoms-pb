# Game Design: Aid Transfers & Alliances

> **System**: Emergency Relief, Multi-Sector Alliances & Diplomatic Treaties
> **Sources of Truth**: [docs/game-manual/aid.md](../game-manual/aid.md) & [docs/game-manual/alliance.md](../game-manual/alliance.md)

---

## 1. Overview & Role

To survive large-scale conflicts, kingdoms rely on intra-sector emergency aid and multi-sector Alliances. Alliances unite up to 40 sectors under a unified command structure, establishing binding diplomatic relations (War, Peace, Non-Aggression Pacts, and Alliances) that dictate galaxy-wide warfare rules.

---

## 2. Core Mechanics

- **Trouble Status & Aid Gating**:
  - Direct resource transfers are strictly prohibited unless the recipient is in **Trouble Status**.
  - Trouble Status freezes for **12 hours**, broadcasting an alert to Sector News and opening the aid window.
- **Aid Delivery Ceiling**:
  - Total aid a kingdom can receive is strictly capped at **50% of its Networth** at the moment Trouble Status was triggered.
- **Alliance Diplomatic Treaties**:
  - Alliance Leaders formalize binding diplomatic treaties: War, Peace, Non-Aggression Pacts (NAP), and Alliances.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Trouble Status Aid Cap Formula
$$\text{Max Aid Receivable} = \lfloor \text{Recipient Networth at Trouble Trigger} \times 0.50 \rfloor$$

### 3.2 Aid Point Valuation Ratio
Resources dispatched as emergency relief convert into Aid Points against the recipient's cap according to strict ratios:
$$\text{Total Aid Points} = (\text{Soldiers} \times 100) + (\text{Civilians} \times 25) + (\text{Power} \times 1.0) + (\text{Money} \times 0.10)$$

*(Example: Sending 10,000 money consumes $1,000$ aid points; sending 100 soldiers consumes $10,000$ aid points).*

### 3.3 Diplomatic Treaty Combat Coefficients
- **War Treaty Modifiers**:
  - Attack Land & Resource Gains: $+20\%$
  - Attacker Military Offense: $+10\%$
  - Honor Gained: Multiplied by $4\times$
- **Peace Treaty Modifiers**:
  - Defender Military Defense: $+25\%$
  - Attacker Military Offense: $-10\%$
  - Attack Land & Resource Gains: $-30\%$
- **Alliance Pact**:
  - Attack Land & Resource Gains: $-50\%$
- **Non-Aggression Pact (NAP)**:
  - All attacks, probe sabotage, and missile strikes strictly blocked by the game engine.

---

## 4. Specifications Table

### 4.1 Diplomatic Treaties & Relations

| Treaty Type | Combat & Gain Modifiers | Operational Rules | Limitations |
|---|---|---|---|
| **War** | +20% Attack Gains; +10% Military Offense | Mandatory 48h duration; cancels all other pacts; unlocks Missiles | Active with 1 alliance at a time *(mutual auto-declaration)* |
| **Peace** | +25% Military Defense; -10% Military Offense; -30% Attack Gains | Mandatory 48h duration | Active with 1 alliance at a time |
| **NAP (Non-Aggression)** | Attacks, probes, and missiles strictly blocked | Bilateral approval required | Unlimited simultaneous pacts |
| **Ally** | -50% Attack Gains; all hits broadcast to Alliance News | Bilateral approval required | Unlimited simultaneous pacts |

---

## 5. System Synergies & Dependencies

- **Target Bashing Countermeasure**: Trouble Status prevents coordinated dogpiles from wiping a player out by unlocking emergency injections of troops, cash, and power.
- **Strategic War Declarations**: Declaring official War maximizes offensive land captures (+20%) and quadruples War Honor gains.
- **Missile System Dependency**: The missile arsenal cannot be deployed without an active **War** treaty.
