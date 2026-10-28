# Game Design: Aid Transfers & Alliances

> **System**: Emergency Relief, Multi-Sector Alliances & Diplomatic Treaties  
> **Source of Truth**: [docs/game-manual/aid.md](../game-manual/aid.md) & [docs/game-manual/alliance.md](../game-manual/alliance.md)

---

## 1. Overview & Role

To survive large-scale conflicts, kingdoms rely on intra-sector emergency aid and multi-sector Alliances. Alliances unite up to 40 sectors under a unified command structure, establishing binding diplomatic relations (War, Peace, Non-Aggression Pacts, and Alliances) that dictate galaxy-wide warfare rules.

---

## 2. Core Mechanics & Formulas

- **Trouble Status & Aid Gating**:
  - Direct resource transfers are strictly prohibited unless the recipient is in **Trouble Status**.
  - **Trouble Status Lifecycle**:
    - Meter increments with every incoming hostile attack or covert probe strike.
    - Upon reaching threshold, the meter freezes for **12 hours**, broadcasting an alert to Sector News and opening the aid window.
    - After 12 hours, the meter resets to zero and aid closes.
- **Aid Delivery Ceiling**:
  - Total aid a kingdom can receive is strictly capped at **50% of its Networth** at the moment Trouble Status was triggered.
  - Resources convert into Aid Points against this cap:
    $$\text{Total Aid Points} = (\text{Soldiers} \times 100) + (\text{Pop} \times 25) + (\text{Power} \times 1.0) + (\text{Money} \times 0.1)$$
- **Alliance Formation**:
  - Any player can establish an Alliance; Sector Leaders enroll their entire sector using the alliance password.
  - Size Limit: Maximum **40 sectors per Alliance**.
  - Shared Alliance Forum, MotD, and public banner.

---

## 3. Diplomatic Treaties & Relations

*Alliance Leaders with 5 or more sectors can formalize diplomatic treaties:*

| Treaty Type | Combat & Gain Modifiers | Operational Rules | Limitations |
|---|---|---|---|
| **War** | +20% Attack Gains; +10% Military Offense | Mandatory 48h duration; cancels all other pacts; unlocks Missile strikes | Active with 1 alliance at a time *(mutual auto-declaration if attacked)* |
| **Peace** | +25% Military Defense; -10% Military Offense; -30% Attack Gains | Mandatory 48h duration | Active with 1 alliance at a time |
| **NAP (Non-Aggression)** | Attacks, probes, and missiles strictly blocked | Bilateral approval required | Unlimited simultaneous pacts |
| **Ally** | -50% Attack Gains; all hits broadcast to Alliance News | Bilateral approval required | Unlimited simultaneous pacts |

---

## 4. System Synergies & Dependencies

- **Target Bashing Countermeasure**: Trouble Status prevents coordinated dogpiles from wiping a player out by unlocking emergency injections of troops, cash, and power.
- **Strategic War Declarations**: Declaring official War maximizes offensive land captures (+20%) and quadruples War Honor gains.
- **Missile System Dependency**: The missile arsenal cannot be deployed without an active **War** treaty.
