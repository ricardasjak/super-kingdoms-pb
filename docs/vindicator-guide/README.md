# Star Kingdoms — Unofficial Guide & Formulas Archive (Vindicator v2)

> **Source:** *Vindicator Star Kingdoms Guide v2* (2002–2004)  
> **Archived From:** `http://www.angelfire.com/ill/l33t_hacker/Vindicator/` via Internet Archive Wayback Machine.  
> **Companion Document:** Located adjacent to the official [`game-manual/`](file:///home/rija/Projects/pocketbase/super-kingdoms-pb/docs/game-manual/README.md).

This archive contains the complete, preserved text, formulas, and calculation algorithms from Vindicator's legendary *Star Kingdoms Guide* (v2). Unlike the standard player manual, this guide provides exact mathematical constants, formulas, and code implementations reverse-engineered and verified directly with the game's creator (BCartfall).

---

## 🧮 Quick Formula Cheat Sheet

### 1. Combat Resolution
- **Base Offense:**  
  `Offense = (Soldiers * 1) + (Troopers * 4) + (Dragoons * 5) + (Tanks * 9) + (Tactical Fighters * 10)`
- **Base Defense:**  
  `Defense = (Soldiers * 1) + (Laser Troopers * 4) + (Laser Dragoons * 5) + (Tanks * 9) + (Tactical Fighters * 4)`
- **Minimum Land Defense:**  
  `Min Defense = Land * 2` *(defense can never fall below 2x land acres)*
- **Combat Resolution:**  
  `Attack Succeeds IF: Modified Offense >= max(Modified Defense, Min Defense) + 1`

### 2. Net Worth Calculation
- **Land:** 25 NW / acre
- **Buildings (completed or in-progress):** 25 NW / building
- **Tanks:** 22 NW
- **Tactical Fighters:** 18 NW
- **Scientists / Laser Dragoons:** 8 NW
- **Laser Troopers / Dragoons:** 7 NW
- **Troopers:** 6 NW
- **Soldiers:** 3 NW
- **Civilians:** 1 NW each
- **Treasury Money:** 1 NW per 500 money
- **Probes:** 1 NW per 1,000 probes
- **Power & Missiles:** 0 NW

### 3. Land-Based Research Scaling
- **Max Research Formula:**  
  `Points Required For Max = Land * Land * Factor` *(x1.1 for Oceanic)*
- **Research Factors:**
  - **Population Bonus (+20% max):** `0.0100` (residence cap 50 $	o$ 60)
  - **Power Bonus (+50% max):** `0.0060`
  - **Military Bonus (+30% max):** `0.0063` (+1% off/def per level)
  - **Money Bonus (+25% max):** `0.0110`
  - **Reactor Warp Core (+20% max):** `0.0100` (-20% attack time)
  - **Frequency Decryption Center (25% max):** `0.0170`

### 4. Attack Travel Time (Torus Distance)
```
Attack Time (hours) = (sqrt(v1^2 + v2^2) + 14) * ((100 + Pbonus + Sbonus + Ebonus + Wbonus) / 100)
v1 = min(abs(X1 - X2), 10 - abs(X1 - X2))
v2 = min(abs(Y1 - Y2), 10 - abs(Y1 - Y2))
```

### 5. Economy & Taxes
- **Civilian Taxes:** 1.95 money/hour per civilian
- **Civilian Power Drain:** 0.35 power/hour per civilian
- **Star Mine Base Income:** 120 money/hour (0 power consumed, immune to arson)
- **Income Variance:** ±5% hidden random modifier per tick

---

## 📚 Table of Contents

1. [Chapter 1: What is Star Kingdoms?](01-what-is-star-kingdoms.md)
2. [Chapter 2: During the First Week](02-during-the-first-week.md)
3. [Chapter 3: Different Planet Types](03-planet-types.md)
4. [Chapter 4: The Buildings](04-the-buildings.md)
5. [Chapter 5: Offense and Defense](05-offense-and-defense.md)
6. [Chapter 6: Finding Targets](06-finding-targets.md)
7. [Chapter 7: Calculating Attacks](07-calculating-attacks.md)
8. [Chapter 8: Using Your Probes](08-using-probes.md)
9. [Chapter 9: Net Worth and Research](09-net-worth-and-research.md)
10. [Chapter 10: Power and Shields](10-power-and-shields.md)
11. [Chapter 11: Common SK Terms](11-common-sk-terms.md)
12. [Chapter 12: Advanced Strategies](12-advanced-strategies.md)
13. [Chapter 13: Extra: Stats of Top Players](13-extra-stats-top-players.md)
14. [Chapter 14: Extra: Calculations & Game Formulas](14-extra-calculations-and-formulas.md)
15. [Chapter 15: Social SK Skills](15-social-sk-skills.md)
16. [Chapter 16: Attack Calculator Reference](16-attack-calculator-reference.md)
17. [Chapter 17: Spreadsheet & Sector Tracker Reference](17-spreadsheet-tracker-reference.md)
18. [Chapter 18: Summary of the Guide](18-summary.md)

---

## 🗄️ Raw HTML Source Files
The original HTML files downloaded from the Wayback Machine are preserved in [`docs/vindicator-guide/raw-html/`](raw-html/).
