# Game Design: Combat & Warfare

> **System**: Military Invasions, Generals & Battle Mechanics
> **Sources of Truth**: [docs/game-manual/attack.md](../game-manual/attack.md) & [docs/vindicator-guide/07-calculating-attacks.md](../vindicator-guide/07-calculating-attacks.md) & [docs/vindicator-guide/14-extra-calculations-and-formulas.md](../vindicator-guide/14-extra-calculations-and-formulas.md) & [docs/vindicator-guide/16-attack-calculator-reference.md](../vindicator-guide/16-attack-calculator-reference.md)

---

## 1. Overview & Role

The combat system drives territorial conquest and military conflict. Players launch invasions using combined-arms expeditionary forces to capture land, plunder treasury funds, siphon power, and seize civilians.

---

## 2. Core Mechanics

- **Generals & Deployment Logistics**:
  - Kingdoms have up to **4 deployable generals** (plus 1 stationary homeland garrison commander).
  - Multiple generals split the expeditionary force into proportional segments that return home in staggered return waves over the travel duration.
  - Troops away on deployment cannot defend the homeland while underway.
- **Home Defense Golden Rule**:
  - Keep **50% to 70%** of total military power at home to deter opportunistic counter-attacks.
- **War Shields**:
  - Powered by surplus energy at launch (5 power per biological unit, 15 power per mechanical unit), mitigating offensive combat casualties by up to **50%** (reducing losses from 8% down to 4%).
- **Land & Resource Plunder**:
  - Successful invasions capture between **5% and 10%** of the defender's land, civilians, power, and treasury funds, scaled by relative Networth and mitigated by MA Protection.
- **Multiple Attack (MA) Protection & Trouble Status**:
  - Gains **+10% MA** per incoming attack, decaying by **-2% per tick** down to 0% (capped at **50%**).
  - Reaching **30% MA** triggers **Trouble Status** (12-hour freeze enabling emergency sector aid).

---

## 3. Mathematical Formulas & Algorithms

### 3.1 Combat Force Equations
- **Base Attacker Offense**:
  $$\text{Base Offense} = (\text{Soldiers} \times 1) + (\text{Troopers} \times 4) + (\text{Dragoons} \times 5) + (\text{Fighters} \times 6) + (\text{Tanks} \times 9) + (\text{Tactical Fighters} \times 12)$$
- **Base Defender Defense**:
  $$\text{Base Defense} = (\text{Soldiers} \times 1) + (\text{Laser Troopers} \times 4) + (\text{Laser Dragoons} \times 5) + (\text{Tanks} \times 9)$$

### 3.2 Combat Multipliers & Modifiers
- **Offensive Multiplier**:
  $$\text{OffMult} = 100 + \text{AllianceStatus} + \text{PlanetOffMod} + \text{MilitaryResearch}\% + \text{Generals}\% + \text{SectorLeaderMod} - \text{BlackoutPenalty} - \text{DefenderShields}\%$$
  - $\text{AllianceStatus}$: $+25\%$ if mutual war, $-25\%$ if peace treaty, $0\%$ normal.
  - $\text{PlanetOffMod}$: $+17.5\%$ for Desert Wasteland, $-10\%$ for Mystical Lands.
  - $\text{MilitaryResearch}\%$: $+1\%$ per continual Military research level (max $+30\%$).
  - $\text{Generals}\%$: $+3\%$ per general beyond the first sent (up to $+9\%$).
  - $\text{SectorLeaderMod}$: $+10\%$ if attacker is Monarch.
  - $\text{BlackoutPenalty}$: $-20\%$ if attacker has zero power.
  - $\text{DefenderShields}\%$: $-1\%$ per active defender military shield (up to $-10\%$).

- **Defensive Multiplier**:
  $$\text{DefMult} = 100 + \text{AllianceStatus} + \text{PlanetDefMod} + \text{MilitaryResearch}\% + \text{SectorLeaderMod} - \text{BlackoutPenalty}$$
  - $\text{AllianceStatus}$: $+25\%$ if peace treaty, $-25\%$ if mutual war.
  - $\text{PlanetDefMod}$: $+20\%$ for Oceanic.
  - $\text{MilitaryResearch}\%$: $+1\%$ per MR level (max $+30\%$).
  - $\text{SectorLeaderMod}$: $+10\%$ if defender is Monarch.
  - $\text{BlackoutPenalty}$: $-20\%$ if defender is in blackout.

- **Total Modified Offense & Defense**:
  $$\text{Total Offense} = \left\lfloor \frac{\text{Base Offense} \times \text{OffMult}}{100} \right\rfloor, \quad \text{Total Defense} = \left\lfloor \frac{\text{Base Defense} \times \text{DefMult}}{100} \right\rfloor$$

### 3.3 Minimum Land Defense Rule (BCart Formula)
A kingdom inherently possesses militia defense derived from its territory that cannot be reduced by bonuses or power blackouts:
$$\text{Land Defense} = \text{Defender Land} \times 2$$
$$\text{Effective Defense} = \max(\text{Total Defense}, \; \text{Land Defense})$$

### 3.4 Battle Outcome Resolution & Plunder
$$\text{Battle Result} = \begin{cases} \mathbf{Victory (Invasion Success)} & \text{if } \text{Total Offense} \ge \text{Effective Defense} + 1 \\ \mathbf{Defeat (Invasion Failure)} & \text{if } \text{Total Offense} \le \text{Effective Defense} \end{cases}$$
*(Ties result in battle failure. Attacker must exceed effective defense by at least 1 point).*

- **Plunder Calculation (on Victory)**:
  $$\text{Gain } \% = \text{clamp}\left(0.05 + 0.05 \times \left(\frac{\text{Target NW}}{\text{Attacker NW}} - 0.5\right), \; 0.05, \; 0.10\right) \times \left(1 - \frac{\text{MA}\%}{100}\right)$$
  - Captured Land $= \lfloor\text{Defender Land} \times \text{Gain } \%\rfloor$
  - Captured Civilians $= \lfloor\text{Defender Civilians} \times \text{Gain } \%\rfloor$
  - Looted Money $= \lfloor\text{Defender Money} \times \text{Gain } \%\rfloor$
  - Siphoned Power $= \lfloor\text{Defender Power} \times \text{Gain } \%\rfloor$

### 3.5 Combat Casualties & War Shields
- **Attacker Casualties**:
  - Required war shield energy $= (\text{Bio Units} \times 5) + (\text{Mech Units [Tanks, TF]} \times 15)$.
  - War Shield Coverage: $\text{Coverage} = \min\left(1.0, \; \frac{\text{Power Spent}}{\text{Required Shield Energy}}\right)$.
  - Attacker Loss Rate: $\text{Loss } \% = 8\% \times (1 - 0.50 \times \text{Coverage}) \quad [4\% \text{ to } 8\%]$.
  - Each dispatched unit type loses this percentage.
- **Defender Casualties (apply on both victory and defeat)**:
  - Linear scaling between $1/3$ and $2/3$ of Attacker Networth:
    $$\text{Def Loss } \% = \begin{cases}
    10\% & \text{if } \frac{\text{Defender NW}}{\text{Attacker NW}} \ge \frac{2}{3} \\
    5\% & \text{if } \frac{\text{Defender NW}}{\text{Attacker NW}} \le \frac{1}{3} \\
    5\% + 15\% \times \left(\frac{\text{Defender NW}}{\text{Attacker NW}} - \frac{1}{3}\right) & \text{otherwise}
    \end{cases}$$
  - Each home defense unit type stationed in the kingdom loses this percentage.

### 3.6 Multiple Attack (MA) Protection & Trouble Status
- **MA Gain**: $+10\%$ per incoming attack hit.
- **MA Decay**: $-2\%$ per hourly tick (capped at maximum $50\%$).
- **Trouble Status Trigger**: Reaching $\text{MA} \ge 30\%$ triggers Trouble Status for **12 hours**, opening the emergency aid window.

### 3.7 Attack Travel Time Formula (Torus Coordinates Wrap-Around)
Travel time between attacker $(X_1, Y_1)$ and defender $(X_2, Y_2)$ on a 10x10 sector grid wraps around the boundaries:
$$v_1 = \min(|X_1 - X_2|, \; 10 - |X_1 - X_2|), \quad v_2 = \min(|Y_1 - Y_2|, \; 10 - |Y_1 - Y_2|)$$
$$\text{Attack Time (hours)} = \left(\sqrt{v_1^2 + v_2^2} + 14\right) \times \left(\frac{100 + P_{\text{bonus}} + S_{\text{bonus}} + E_{\text{bonus}} + W_{\text{bonus}}}{100}\right)$$
- $P_{\text{bonus}}$: $-30\%$ for Mystical Lands; $+15\%$ for Forest & Wilderness.
- $S_{\text{bonus}}$: $-10\%$ if target is in the same sector.
- $E_{\text{bonus}}$: $-10\%$ if Energy Core is researched.
- $W_{\text{bonus}}$: Up to $-20\%$ from Reactor Warp Core Efficiency research.

### 3.8 War Leader Return Waves & Efficiency Score ($S$)
If an attack is launched with $N$ generals and one-way duration $T$:
- Troops split into $N$ equal waves returning at intervals of $\frac{T}{N}, \frac{2T}{N}, \dots, T$.
- **Efficiency Score ($S$) Equation**:
  $$S = \sum_{i=1}^N \frac{100 / N}{\text{ReturnTime}_i}$$

---

## 4. War Honor System Specifications

### 4.1 Honor Gained per Victory

| Target Networth vs Attacker | Honor Gained | In War Relation |
|---|:---:|:---:|
| $< 25\%$ | None | None |
| $26\% - 49\%$ | 1.25% | $4\times$ |
| $50\% - 69\%$ | 2.50% | $4\times$ |
| $70\% - 89\%$ | 5.00% | $4\times$ |
| $90\% - 99\%$ | 7.50% | $4\times$ |
| $\ge 100\%$ | 10.00% | $4\times$ |

*Defenders lose 90% of the honor gained by the victor (2x during War).*

### 4.2 Honor Tiers & Economic Modifiers

| Kingdom Honor | Economic Income Bonus | Military Training Cost |
|---|:---:|:---:|
| **0 – 599** | -5.0% | Normal |
| **600 – 1,199** | -2.5% | Normal |
| **1,200 – 1,500** | Neutral (0%) | Normal |
| **1,501 – 1,800** | +2.5% | Normal |
| **1,801 – 2,100** | +5.0% | Normal |
| **2,101 – 2,400** | +5.0% | -5.0% |
| **2,401 – 2,700** | +6.0% | -5.0% |
| **2,701 – 3,000** | +7.0% | -5.0% |
| **3,001 – 3,300** | +8.0% | -5.0% |
| **3,301 – 3,600** | +9.0% | -5.0% |
| **3,601 – 5,000** | +10.0% | -5.0% |
| **5,001+** | +10.0% | -10.0% |

---

## 5. System Synergies & Dependencies

- **Energy Infrastructure**: Power plants dictate whether high-grade War Shields can be activated.
- **Research**: Reactor Warp Core Efficiency and Energy Core decrease march times; S.C.O.U.T.E.R. reveals exact arrival/return timing.
- **Espionage**: Probes scout defender garrisons to ensure attacker forces exceed the target's effective defense.
- **Diplomacy & Alliances**: Declared War boosts attack gains by +20% and offense by +10%, while multiplying honor generation $4\times$.
