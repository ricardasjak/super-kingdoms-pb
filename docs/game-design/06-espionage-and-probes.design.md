# Game Design: Espionage & Probes

> **System**: Intelligence Reconnaissance & Covert Sabotage
> **Sources of Truth**: [docs/game-manual/probes.md](../game-manual/probes.md) & [docs/vindicator-guide/08-using-probes.md](../vindicator-guide/08-using-probes.md)

---

## 1. Overview & Role

The espionage system enables rulers to conduct clandestine surveillance, steal enemy intelligence, and execute covert sabotage missions without deploying traditional armies. Probes are mass-manufactured, consumable robotic agents used for both information gathering and covert economic disruption.

---

## 2. Core Mechanics

- **Probe Manufacturing**:
  - Manufactured automatically by dedicated Probe Factories every hour.
  - Unshielded probes in storage consume zero power.
- **Mission Bank**:
  - Kingdoms generate **1 probe mission credit per hour**, banking up to a strict cap of **10 stored uses**.
- **Reconnaissance Operations**:
  - Spy on Kingdom (SoK), Spy on Military (SoM), Spy on Research (SoR), Spy on Buildings, Spy on Shields, Spy on Sector News.
- **Sabotage Operations**:
  - Rob Treasury, Arson Buildings, Sabotage Powerplants, Kidnap Civilians, Suicide Power Overload.
- **Counter-Espionage**:
  - Probe Armor research cuts probe casualties by 50%.
  - Frequency Decryption Center (FDC) gives up to 25% chance to expose enemy attackers.

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Probe Production & Storage
- **Hourly Probe Generation**:
  $$\text{Probes Generated / Hour} = (50\% \text{ to } 100\%) \times \text{Probe Factories}$$
- **Mission Stored Bank**:
  $$\text{Stored Credits} = \min(10, \; \text{Current Credits} + 1/\text{hour})$$

### 3.2 Net Worth & Power Metrics
- **Probe Net Worth**:
  $$\text{Probe NW} = \left\lfloor \frac{\text{Probes}}{1,000} \right\rfloor \quad [1\text{ NW per 1,000 probes}]$$

### 3.3 Sabotage Impact Equations
- **Suicide Power Overload**:
  $$\text{Target Power Depleted} = \text{Dispatched Probes} \times 2$$
  *(Consumes $100\%$ of dispatched probes).*
- **Counter-Espionage Detection Probability**:
  $$\text{Exposure Chance} = \text{Defender FDC Research } \% \quad [\text{Max } 25\%]$$
- **Damage Mitigation via Probe Armor**:
  $$\text{Mission Probe Losses} = \text{Base Losses} \times 0.50 \quad [\text{Requires Probe Armor Tech}]$$

---

## 4. Specifications Table

### 4.1 Reconnaissance Missions

| Operation | Objective | Output / Scaling |
|---|---|---|
| **Spy on Kingdom** | General Kingdom Assessment | Overview of land, networth, status meters |
| **Spy on Military** | Military Strength Audit | Breakdown of stationed garrison vs away troops `Unavail.(X)` |
| **Spy on Buildings** | Infrastructure Survey | Exact or estimated building counts |
| **Spy on Research** | Technological Intelligence | Continual bonus levels and tech completions |
| **Spy on Shields** | Defensive Shield Audit | Active shield power percentages |
| **Spy on Sector News** | Intercept Sector Comms | Steals 12h, 24h, or 32h of target sector news logs |

### 4.2 Covert Sabotage Missions

| Operation | Objective | Constraints & Mechanics |
|---|---|---|
| **Rob Banks** | Financial Infiltration | Siphons liquid treasury money directly into attacker coffers |
| **Arson** | Residential Fire Bombing | Destroys residences; target must hold $> 5\% \text{ Land}$ in residences |
| **Sabotage Powerplants** | Grid Disruption | Demolishes power plants, crippling energy reserves |
| **Kidnappings** | Demographic Theft | Abducts civilian citizens and relocates them to the attacker |
| **Suicide Attack** | Power Core Overload | Consumes **100%** of probes; inflicts **2 power loss per probe** |

---

## 5. System Synergies & Dependencies

- **Pre-Attack Recon**: Scouts defender military readiness to calculate optimal force ratios and avoid high-casualty traps.
- **Power Grid Collapse**: Sabotage operations induce brownouts, deactivating enemy War Shields and military shields prior to invasions.
- **MA Protection Impact**: Heavy covert sabotage triggers defender MA Protection and can push targets into **Trouble Status**.
- **Factory Infrastructure**: Kingdom probe production scales strictly with dedicated Probe Factory acreage.
