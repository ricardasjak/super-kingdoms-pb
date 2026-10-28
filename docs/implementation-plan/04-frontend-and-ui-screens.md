# Implementation Plan: Frontend & UI Screens

> **Document**: 04 of 05  
> **Topic**: React 19 SPA, Pico CSS Classless Architecture, Retro Space Theme & Screen Specifications

---

## 1. Design & Styling Philosophy

### 1.1 Pure Semantic HTML + Pico CSS
The user objective for the frontend is explicit: **no bespoke custom designs, no heavy UI frameworks, and maximum focus on showing that every game system works cleanly and reliably**.
- **Base CSS**: [Pico CSS](https://picocss.com/) (classless version). Standard HTML elements (`<main>`, `<article>`, `<nav>`, `<table>`, `<form>`, `<progress>`, `<dialog>`) provide out-of-the-box responsive layouts, clean typography, accessible forms, and dark-mode styling with zero configuration.
- **Pixelated Space Theme Override (`src/theme.css`)**: A compact stylesheet (<150 lines) providing a retro sci-fi terminal vibe:
  - Monospace / pixel font (`ui-monospace, "Cascadia Code", "Courier New", monospace`).
  - Deep space color palette: `#0b0f19` background, `#161e2e` card surfaces, `#00ffcc` cyan accents for energy, `#ffd700` gold for credits, `#ff4444` crimson for warnings/combat.
  - Compact data tables and crisp borders.

---

## 2. Navigation & Layout Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              TOP STATUS BAR                            │
│  Nova Terra [Sector 4:2] | 💰 342,100 | ⚡ 8,450/10,000 | 🌍 250 Acres  │
│  👥 2,250 Civs | 🛡️ NW: 18,450 | ⏳ Round 1 (PvP) Tick 64/960          │
├────────────────────────────────────────────────────────────────────────┤
│ [Status] [Build] [Explore] [Military] [Research] [Attack] [Probes]     │
│ [Sector] [Scores] [News]                             [Profile/Logout]  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│                          ACTIVE PAGE VIEW                              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

The application layout wraps all in-game views in a persistent `TopStatusBar` displaying live resources, land holdings, net worth, and game phase.

---

## 3. Screen Specifications

### 3.1 `LoginPage` (`/login`)
- **Primary Action**: Prominent `Log in with Discord` button triggering `loginWithDiscord()`.
- **Admin Accordion**: Collapsible `<details>` section for superuser credentials (`admin@superkingdoms.internal`) used for local debugging and headless testing.
- **Game Status Widget**: Displays active round number, current tick, and registered kingdom count.

### 3.2 `CreateKingdomPage` (`/create`)
- Displayed when an authenticated user has no active kingdom in the current round.
- **Fields**:
  - `Kingdom Name`: Text input (3–30 characters).
  - `Homeworld Planet Archetype`: Select dropdown of the 8 canonical types (Forest & Wilderness, Desert Wasteland, Volcanic Inferno, Mystical Lands, Mountainous, Oceanic, Terra Form, Multiple Terrain).
- **Live Archetype Summary Card**:
  - Displays primary advantage, secondary advantage, racial penalties, and starter asset package for the selected world.
- **Submit**: "Found Kingdom" button dispatching `POST /api/kingdoms/create`.

### 3.3 `NewbieStepView` (Banner on Status Page during Phase 1)
- Displayed whenever `kingdom.is_newbie == true`.
- **Step Meter**: Visual indicator showing `Step X of 8` (each representing 16 engine simulation ticks).
- **Actions**:
  - **"Advance Next Step (Simulate 16 Hours)"**: Calls `POST /api/kingdoms/self-tick/step`. Shows summary modal of population born, money collected, power generated, and queue completions.
  - **"Reset Kingdom"**: Emergency restart button allowing the player to wipe and pick a new planet archetype.

### 3.4 `StatusPage` (`/`)
- **Demographics Card**:
  - Civilian population, natural growth rate (+2.5%/hr), housing capacity limit ($50 \to 60$), overcrowding warnings.
- **Economic & Industrial Card**:
  - Gross tax income, Star Mine output (+120/mine), sector tax deduction, net hourly credit inflow.
- **Energy Grid Card**:
  - Power generation vs civilian, military, and shield demand.
  - Active grid status: **Normal** or **Brownout / Blackout** (-20% combat penalties alert).
- **Armed Forces Card**:
  - Breakdown of stationed garrison vs away troops on deployment.

### 3.5 `BuildingsPage` (`/buildings`)
- **Land Summary**: Total Land, Free (unbuilt) Land, In-Construction Land.
- **Construction Table**:
  - Lists the 7 buildings (Residences, Power Plants, Barracks, Star Mines, Probe Factories, Training Camps, Air Support Bays).
  - Shows current count, land occupied, and quick number input for construction orders.
  - Dynamic cost calculator: $\text{Total Cost} = \text{Orders} \times \text{round}(\sqrt{\text{Land}} \times 63)$.
- **Razing Section**:
  - Number inputs to demolish existing structures for an instant $\lfloor\text{Cost}/8\rfloor$ credit refund.
- **Active Construction Queue**:
  - Displays batches underway with remaining ticks until completion (16 ticks total).

### 3.6 `ExplorePage` (`/explore`)
- **Frontier Overview**:
  - Daily 10% Exploration Limit meter: `daily_explored_land / max_daily_land`.
  - Cost per acre: $\text{round}(\sqrt{\text{Land}} \times 111)$.
- **Order Form**:
  - Acre input field with "Max Possible" button.
  - Total cost calculation with sector *Expansionist* discount indicator.
- **Pending Arrivals Queue**:
  - Table showing arriving land batches and arrival tick (24 ticks total).

### 3.7 `MilitaryPage` (`/military`)
- **Soldier Drafting Form**:
  - Input to enlist civilians into Soldiers (capped at 10% of civilian population per 24 hours).
- **Specialist Training Table**:
  - Roster: Troopers, Dragoons, Laser Troopers, Laser Dragoons, Fighters, Tanks, Tactical Fighters, Scientists.
  - Displays Off/Def ratings, base cost, Training Camp discount ($\le 30\%$), and power load.
  - Input field for training numbers; verifies barracks bunk space and tech unlocks.
- **Generals & Fleet Status**:
  - Status of 4 deployable War Leaders: `AVAILABLE (Home)` or `UNAVAILABLE (Returning in X hours)`.

### 3.8 `ResearchPage` (`/research`)
- **Scientists Summary**: Total active scientists, generating 1 point per scientist every tick.
- **Continual Research Allocation**:
  - Sliders for Population (+20%), Power (+50%), Military (+30%), Money (+25%), Warp Core (-20%), and FDC (25%).
  - Real-time display of current bonus %, points invested, and points required for max bonus based on $\text{Land}^2 \times \text{Weight}$.
- **One-Time Breakthrough Tech Tree**:
  - Interactive tree showing status of Longevity, Fusion Tech, Energy Core, Dragoons, Laser Dragoons, Fighters, Probe Armor, and Tactical Fighters.
  - Displays required points and prerequisites.

### 3.9 `AttackPage` (`/attack`)
- **Target Selection**:
  - Filter kingdoms by Sector and Networth.
  - Enforces the $3\times$ Networth Window: $\frac{1}{3}\text{AttackerNW} \le \text{TargetNW} \le 3\times\text{AttackerNW}$.
- **Battle Deployment Form**:
  - Select War Leader (General 1 to 4).
  - Sliders/inputs to assign attacking troops from stationed home garrison.
  - **War Shield Power Slider**: Displays required energy (5 power/bio unit, 15 power/tank or fighter) and expected casualty reduction (up to 50% loss mitigation).
  - **Travel Time & Torus Calculator**: Computes exact arrival time $T$ using torus distance formula and warp bonuses.
- **Active Deployments Table**:
  - Tracks outbound strikes and return waves with countdowns.

### 3.10 `ProbesPage` (`/probes`)
- **Espionage Center**:
  - Stored probe credits meter ($X / 10$) and available probe pool.
- **Mission Console**:
  - Target kingdom selector.
  - Mission dropdown (Spy on Kingdom, Military, Buildings, Research, Shields, News, Rob Banks, Arson, Sabotage, Kidnap, Suicide Overload).
  - Probes to dispatch slider.
  - Success chance estimate preview: $\text{clamp}(\text{Sent}/(\text{TargetProbes} + \text{Land}\times 4), 20\%, 95\%) - \text{Shields}\%$.
- **Planetary Defense Shields**:
  - Controls to adjust Missile Shield, Military Shield, and Probe Shield arrays (0 to 10 levels each; 1% power gen upkeep per level).
- **Intelligence Reports Archive**:
  - Tabs viewing recent stolen dossiers and recon logs.

### 3.11 `SectorPage` (`/sector`)
- **Sector Grid View**:
  - Table of all 10 kingdoms in the sector: Kingdom Name, Ruler, Homeworld, Land, Networth, Status (Normal / Trouble / Dead), Monarch crown icon.
- **Democratic Governance**:
  - Ballot selector to cast the kingdom's vote for Sector Leader.
  - Sector Tax Rate (0% to 5%) and active Sector Fund balance.
- **Sector Stance & Enhancements**:
  - Monarch controls to proclaim Sector States (Normal, Peaceful, Expansionist, Offensive, Defensive, Mobilization).
- **Emergency Aid Dispatch**:
  - Active when a sector ally enters **Trouble Status** (MA $\ge 30\%$).
  - Aid form to dispatch money, power, soldiers, or civilians within the recipient's 50% NW aid ceiling.

### 3.12 `ScoresPage` (`/scores`)
- Galaxy rankings table with tabbed sorting:
  - **By Networth** (universal power standing)
  - **By Territory** (total owned acres)
  - **By Armed Forces** (offensive & defensive potential)
  - **By War Honor** (combat reputation standing)
  - **By Sector** (collective sector networth)
