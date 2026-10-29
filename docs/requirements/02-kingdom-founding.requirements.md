# Requirements: Kingdom Founding & Planetary Archetypes

> **Requirement ID**: REQ-02  
> **Topic**: Kingdom Creation, Planet Archetypes, Asset Grants & Sector Slots  
> **Status**: Approved  
> **Traceability**: [`docs/game-design/08-planet-types-and-terrains.design.md`](../game-design/08-planet-types-and-terrains.design.md), [`docs/implementation-plan/03-api-endpoints-and-player-actions.md`](../implementation-plan/03-api-endpoints-and-player-actions.md), [`tests/api/kingdoms.test.ts`](../../tests/api/kingdoms.test.ts)

---

## 1. Kingdom Creation Endpoint

### 1.1 Founding Request
- The system **SHALL** expose `POST /api/kingdoms/create` to found a new player kingdom.
- The request **SHALL** accept `name` (kingdom name, 3–30 characters) and `planet_type` (one of the 8 canonical archetypes).
- The system **SHALL** require authentication; unauthenticated requests **SHALL** be rejected with HTTP 401.
- If an authenticated user already owns an active kingdom in the current round, the system **SHALL** reject duplicate creation with HTTP 400.

### 1.2 Galaxy Sector & Slot Assignment
- The system **SHALL** assign newly founded kingdoms to the next available sector in the 100-sector grid (Sectors 0 to 99).
- Each sector **SHALL** accommodate a maximum of 10 kingdom slots (slots 0 to 9).
- When a sector reaches capacity (10 kingdoms), the system **SHALL** place subsequent kingdoms in the next available sector with open slots.

---

## 2. Baseline Asset Grants

Every newly founded kingdom **SHALL** receive the following standard baseline assets:
- **Territory**: 250 Total Land (170 developed, 80 Free Land).
- **Population**: 2,250 Civilians.
- **Treasury**: 300,000 Money.
- **Energy Reserves**: 10,000 Power.
- **Espionage**: 0 Probes, 10 Probe Credits.
- **Starting Buildings**:
  - 80 Residences (`res`)
  - 40 Power Plants (`plants`)
  - 10 Barracks (`rax`)
  - 30 Star Mines (`sm`)
  - 10 Probe Factories (`pf`)
  - 0 Training Camps (`tc`), 0 Air Support Bays (`asb`)
- **Starting Military**:
  - 200 Soldiers (`sol`)
  - 300 Scientists (`sci`)
  - 0 other unit types unless granted by planetary archetype.
- **Newbie Mode Status**:
  - `is_newbie`: `true`
  - `newbie_step`: `0`
  - `state`: `"normal"`
  - `honor`: `1500`

---

## 3. Planet Types & Starter Packages

The system **SHALL** store the 8 official homeworld planet types in the database schema exclusively as canonical 2-letter codes (`FW`, `DW`, `VI`, `ML`, `Mo`, `Oc`, `TF`, `MT`). The user interface **SHALL** map these 2-letter codes to their full canonical display names. The system **SHALL** support all 8 official planet types and apply their dedicated starter packages upon founding:

1. **Forest and Wilderness** (`FW`)
   - **SHALL** start with $+500$ additional Soldiers (total 700 Soldiers).
   - Population capacity multiplied by $1.15$ to $1.30$, $+25$ Money per Star Mine, $+15\%$ to $+20\%$ attack travel time.

2. **Desert Wasteland** (`DW`)
   - **SHALL** start with Dragoon Technology pre-unlocked (`research.t_dragoons = true`).
   - Troop and Dragoon training costs reduced by $90\%$, offensive combat power $+17.5\%$ to $+30\%$, $-10\%$ population cap.

3. **Volcanic Inferno** (`VI`)
   - **SHALL** start with Fusion Technology pre-unlocked (`research.t_fusion = true`).
   - Power plants store 10,000 power per plant (vs standard 1,000). Unit power drain reduced by $70\%$, $-10\%$ to $-15\%$ population cap.

4. **Mystical Lands** (`ML`)
   - **SHALL** start with Fusion Technology pre-unlocked (`research.t_fusion = true`).
   - Attack travel time reduced by $30\%$, power demand reduced by $50\%$, $-10\%$ offensive combat power.

5. **Mountainous** (`Mo`)
   - **SHALL** start with Laser Dragoon Technology pre-unlocked (`research.t_laser_dragoons = true`).
   - Income $+15\%$ to $+25\%$, War Honor gains $+75\%$, probe defense $+15\%$, $-20\%$ power plant production.

6. **Oceanic** (`Oc`)
   - **SHALL** start with 250 Laser Troopers (`military.lt = 250`) stationed in the home garrison.
   - Defensive combat power $+10\%$ to $+20\%$, building construction costs $-25\%$, $+10\%$ to $+25\%$ research required.

7. **Terra Form** (`TF`)
   - **SHALL** start with 1,500 research points pre-invested in Population, Power, Military, and Money (`r_pop: 1500, r_power: 1500, r_mil: 1500, r_money: 1500`).
   - Receives $+40\%$ continual research efficiency bonus and $+20\%$ research caps, with a $-10\%$ income penalty.

8. **Multiple Terrain** (`MT`)
   - **SHALL** start with Dragoons, Laser Dragoons, and Tactical Fighters pre-unlocked (`t_dragoons: true, t_laser_dragoons: true, t_tactical_fighters: true`).
   - $+5\%$ Offense, $+5\%$ Defense, $+5\%$ Population.

---

## 4. Kingdom Reset

- The system **SHALL** expose `POST /api/kingdoms/reset`.
- While a kingdom is in Newbie Mode (`is_newbie == true`), the owner **SHALL** be permitted to reset their kingdom, removing current kingdom records and queues to allow refounding.
