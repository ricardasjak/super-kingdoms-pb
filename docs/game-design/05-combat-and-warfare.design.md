# Game Design: Combat & Warfare

> **System**: Military Invasions, Generals & Battle Mechanics  
> **Source of Truth**: [docs/game-manual/attack.md](../game-manual/attack.md)

---

## 1. Overview & Role

The combat system drives territory conquest and military conflict. Players launch invasions using armies composed of infantry, cybernetics, armored armor divisions, and air wings to capture land, plunder treasury funds, siphon power, and capture civilian slaves.

---

## 2. Core Mechanics & Formulas

- **Generals & Deployment Logistics**:
  - Kingdoms have up to **4 deployable generals** (plus 1 stationary homeland garrison commander).
  - **Effectiveness Scaling**: Each general sent beyond the first grants **+3% combat effectiveness** (max +9% with 4 generals).
  - **Staggered Return Waves**: Multiple generals split the expeditionary force into proportional segments that return home progressively over the travel duration rather than all at once.
  - While generals are away, those troops cannot defend the homeland.
- **War Shields (Offensive Power Buff)**:
  - Powered by surplus energy at launch.
  - Power Cost: **5 power** per biological unit (Soldier, Trooper, Dragoon); **15 power** per mechanical unit (Tank, Fighter, Tactical Fighter).
  - Protection: Mitigates offensive battle casualties by **25% to 50%**.
- **Homeland Defense & Baseline Militia**:
  - If a defender has little or no military stationed at home, civilian militia defends:
    $$\text{Land Defense} = \text{Total Land} \times 2$$
  - The battle engine applies whichever defense is greater (**they never stack**):
    $$\text{Effective Defense} = \max(\text{Stationed Military Def}, \; \text{Total Land} \times 2)$$
- **Target Size Penalties**:
  - Attacking targets significantly smaller than yourself incurs sharply elevated combat casualties and yields minimal land.
- **Multiple Attack (MA) Protection & Trouble Status**:
  - Rises each time a kingdom is attacked or probed; caps at **50%**.
  - Reduces incoming land loss by up to 50%. Decays gradually every hour.
  - Sustained incursions trigger **Trouble Status** (12-hour freeze enabling emergency sector aid).

---

## 3. War Honor System

### 3.1 Honor Gained per Victory

| Target Networth vs Attacker | Honor Gained | In War Relation |
|---|:---:|:---:|
| $< 25\%$ | None | None |
| $26\% - 49\%$ | 1.25% | $4\times$ |
| $50\% - 69\%$ | 2.50% | $4\times$ |
| $70\% - 89\%$ | 5.00% | $4\times$ |
| $90\% - 99\%$ | 7.50% | $4\times$ |
| $\ge 100\%$ | 10.00% | $4\times$ |

*Defenders lose 90% of the honor gained by the victor (2x during War).*

### 3.2 Honor Tiers & Economic Modifiers

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

## 4. System Synergies & Dependencies

- **Energy Infrastructure**: Power plants dictate whether high-grade War Shields can be activated.
- **Research**: Reactor Warp Core Efficiency and Energy Core decrease march times; S.C.O.U.T.E.R. reveals exact arrival/return timing.
- **Espionage**: Probes scout defender garrisons to ensure attacker forces exceed the target's effective defense.
- **Diplomacy & Alliances**: Declared War boosts attack gains by +20% and offense by +10%, while multiplying honor generation $4\times$.
