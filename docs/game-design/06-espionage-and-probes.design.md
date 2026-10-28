# Game Design: Espionage & Probes

> **System**: Intelligence Reconnaissance & Covert Sabotage  
> **Source of Truth**: [docs/game-manual/probes.md](../game-manual/probes.md)

---

## 1. Overview & Role

The espionage system enables rulers to conduct clandestine surveillance, steal enemy intelligence, and execute covert sabotage missions without deploying traditional armies. Probes are mass-manufactured, consumable robotic agents used for both information gathering and covert economic disruption.

---

## 2. Core Mechanics & Formulas

- **Probe Manufacturing**:
  - Manufactured automatically by **Probe Factories** each hour:
    $$\text{Probes Generated} = (50\% \text{ to } 100\%) \times \text{Factories}$$
  - Unshielded probes consume no hourly power.
- **Action Bank & Pacing**:
  - Kingdoms generate **1 probe mission credit per hour**.
  - Banks up to a strict maximum of **10 stored probe uses**. Unused charges beyond 10 expire.
- **Mission Success Factors**:
  Success probability is evaluated against 4 primary metrics:
  1. Attacker's probe density compared against $\max(\text{Attacker Land}, \; \text{Target Land})$.
  2. Defender's probe reserve relative to their land.
  3. Absolute volume of probes deployed on the mission.
  4. Defender's active Probe Shield level.
- **Accuracy Variance**:
  - Intelligence scan accuracy scales with deployed probe count from **95% to 100%** ($\pm 5\%$ data jitter at minimal threshold).
- **Damage Mitigation & Counter-Espionage**:
  - **Probe Armor** research permanently slashes probe casualties by **50%**.
  - **Frequency Decryption Center (FDC)** research grants up to a **25% chance** to unmask the attacker's identity, fleet size, and mission.

---

## 3. Espionage Operations Matrix

### 3.1 Reconnaissance Missions

| Operation | Objective | Output / Scaling |
|---|---|---|
| **Spy on Kingdom** | General Kingdom Assessment | Overview of land, networth, status meters |
| **Spy on Military** | Military Strength Audit | Breakdown of stationed garrison and fleet size |
| **Spy on Buildings** | Infrastructure Survey | Exact or estimated building counts |
| **Spy on Research** | Technological Intelligence | Continual bonus levels and tech completions |
| **Spy on Shields** | Defensive Shield Audit | Active shield power percentages |
| **Spy on Sector News** | Intercept Sector Comms | Steals 12h, 24h, or 32h of target sector news logs |

### 3.2 Covert Sabotage Missions

| Operation | Objective | Constraints & Mechanics |
|---|---|---|
| **Rob Banks** | Financial Infiltration | Siphons liquid treasury money directly into attacker coffers |
| **Arson** | Residential Fire Bombing | Destroys residences over time; requires target to hold $> 5\% \text{ Land}$ in residences |
| **Sabotage Powerplants** | Grid Disruption | Demolishes power plants, crippling energy reserves |
| **Kidnappings** | Demographic Theft | Abducts civilian citizens and relocates them to the attacker |
| **Suicide Attack** | Power Core Overload | Consumes **100%** of dispatched probes; inflicts **2 power loss per probe** |

---

## 4. System Synergies & Dependencies

- **Pre-Attack Recon**: Scouts defender military readiness to calculate optimal force ratios and avoid high-casualty traps.
- **Power Grid Collapse**: Sabotage operations induce brownouts, deactivating enemy War Shields and military shields prior to invasions.
- **MA Protection Impact**: Heavy covert sabotage triggers defender MA Protection and can push targets into **Trouble Status**.
- **Factory Infrastructure**: Kingdom probe production scales strictly with dedicated Probe Factory acreage.
