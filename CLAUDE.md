# Pokemon Draft Battle — Project Context

## Concept
Browser-based Pokemon draft-battle game. Players spend a $100 budget to draft 5 Pokemon from the Kanto Pokedex (151 Pokemon, tiered by strength), then battle with simplified TCG-style combat.

---

## Tech Stack
- Vanilla JavaScript (ES6+), HTML/CSS, DOM-based UI (not canvas)
- No frameworks (no React, Vue, jQuery, Phaser), no build step — open index.html directly

---

## Game Flow
1. **Draft**: Player picks 5 Pokemon within $100 budget; AI snake-drafts on turns 2,4,6,8,10
2. **Items**: Both sides pick 3 items from the item pool
3. **Battle**: Turn-based combat until one side has no Pokemon remaining

---

## Tier System & Pricing

| Tier | Cost | Examples |
|------|------|---------|
| S    | $30  | Mewtwo, Dragonite, Gengar, Alakazam, Machamp, Aerodactyl, Articuno, Zapdos, Moltres, Mew |
| A    | $20  | Charizard, Blastoise, Venusaur, Arcanine, Gyarados, Lapras, Snorlax, Starmie, Raichu, Jolteon, Flareon, Vaporeon, and ~20 more fully-evolved |
| B    | $12  | Charmeleon, Wartortle, Ivysaur, Pikachu, Rhydon, Chansey, Exeggutor, and ~20 more mid-tier |
| C    | $5   | All unevolved basics, weak Pokemon — Charmander, Squirtle, Bulbasaur, Magikarp, etc. |

Full roster is in `js/pokemon.js`.

---

## Pokemon Data Schema

```javascript
{
  id: number,           // Pokedex number 1–151
  name: string,
  type1: PokemonType,
  type2: PokemonType|null,
  tier: "S"|"A"|"B"|"C",
  cost: 30|20|12|5,
  hp: number,
  speed: number,        // higher speed acts first on same priority
  emoji: string,
  attacks: [Attack, Attack],  // exactly 2
  weakness: PokemonType|null,
  resistance: PokemonType|null
}

// Attack
{ name: string, energyCost: 1|2|3, damage: number, effect: EffectKey|null }
```

---

## Energy System
- Each turn, the **active Pokemon gains +1 energy** (max 5, stored on Pokemon)
- Switching out does **not** drain energy — it persists
- Attacks consume energy from the using Pokemon's pool
- Pacing: turn 1 = cheap attacks only; turn 3+ = big moves affordable

---

## Battle Rules

### Setup
5 Pokemon per side: 1 Active + 4 Bench. Only Active gains energy and takes damage.

**Who moves first**: the side whose lead Pokemon has the higher `speed` opens the
battle. Ties are a coin flip. Sides then alternate; the turn counter increments
each time control returns to whoever opened.

### Turn Structure
1. **Energy Phase**: Active Pokemon +1 energy
2. **Action Phase** (one or both, in order):
   - **Switch**: Move a bench Pokemon to active (free, once per turn)
   - **Use Item**: Use one item — **max one item per turn**
3. **Attack Phase**: Choose an attack (required if affordable, else skip/pass)
4. **Status Tick**: Burn/Poison damage applied; Paralysis/Sleep resolved
5. **Faint Check**: HP = 0 → fainted, owner sends replacement; no bench = loss

### Damage Formula
```
Raw = attack.damage
× 2   if target.weakness === attacker.type1
× 0.5 if target.resistance === attacker.type1 (min 10)
```

### Win Condition
All 5 opponent Pokemon fainted.

**Turn limit — 50 turns.** Healing moves (Softboiled, Amnesia) restore 30 HP for
1 energy, which outpaces what a weak attacker can remove, so matchups like
Chansey vs. Magikarp never resolve on their own. At the cap the winner is
decided on total remaining HP, then on fewest fainted, then it's a draw.

---

## Status Effects

| Key         | Effect |
|-------------|--------|
| `burn`      | -20 HP end of burned Pokemon's turn |
| `paralysis` | Skip next attack; clears at end of that turn either way |
| `sleep`     | Cannot attack; 50% wake chance at turn start |
| `poison`    | -10 HP end of poisoned Pokemon's turn |
| `leech`     | -20 HP end of turn; attacker +10 HP |

One status at a time — new status overwrites old.

## Move Effects (non-status)

| Key         | Effect |
|-------------|--------|
| `recoil`    | User takes 25% of damage dealt |
| `heal`      | User restores 30 HP |
| `harden`    | Next incoming hit reduced by 30 (min 10), then wears off |
| `superfang` | Halves target's *current* HP; never reduces below 1 |
| `transform` | Copies target's attacks, typing, weakness/resistance and sprite |
| `random`    | Metronome — fires a random damaging move from the Kanto roster |
| `flail`     | Bonus damage scaling with the user's missing HP (up to +60) |
| `splash`    | Does nothing (deliberately) |

---

## Items

| Name       | Effect |
|------------|--------|
| Potion     | Heal 40 HP from one Pokemon |
| Full Heal  | Remove status from one Pokemon |
| X Attack   | Next attack deals +20 extra damage |
| Revive     | Restore one fainted Pokemon to 50% HP (to bench) |
| Switch     | Free switch without using Action Phase switch |

Single-use. AI always picks: Potion, Full Heal, Revive.

---

## AI Behaviour

### Draft
1. Pick highest-tier Pokemon within remaining budget
2. Maintain type diversity (avoid 3+ of same type)
3. Reserve ≥$5 for final pick
4. 20% chance of surprise off-tier pick

### Battle
Only **one** item may be used per turn, so the AI picks the most urgent:
1. Full Heal if status-affected → else Potion if HP < 40% → else Revive when the
   bench is down to one healthy Pokemon → else X Attack if an attack is affordable
2. Switch if Active HP < 20% and a healthier bench Pokemon exists
3. Attack with the best affordable move, scored *after* weakness/resistance
   (a 45-dmg super-effective hit beats a 60-dmg resisted one)
4. Pass attack if nothing affordable (save energy)

The same routine drives the player's side when Auto Battle is on, which is why
it handles all five items rather than just the AI's three.

---

## File Structure

```
/
├── index.html      — two screens: #draft-screen, #battle-screen
├── style.css       — dark theme (#0b0b18), TCG card aesthetic
├── assets/
│   └── sprites/    — Gen-V PNGs 1–151, plus anim/ GIFs for the battle hero slot
├── tests/
│   └── engine.test.js — battle engine tests: `node tests/engine.test.js`
└── js/
    ├── pokemon.js  — KANTO_POKEMON array (151 entries) + helpers + spriteHtml()
    ├── draft.js    — draft phase UI, player picks, AI snake draft, item selection
    ├── battle.js   — battle state, turn engine, damage calc, status effects
    ├── ai.js       — AI battle decisions
    └── ui.js       — DOM rendering, HP bars, energy pips, battle log, event handlers
```

## Sprites
Rendered via `window.spriteHtml(pokemon, size, opts)` (defined in `pokemon.js`).
Sizes: `card | slot | vs | tt | active | bench | ov`. Pass `{ animated: true }`
for the battle hero slot. The Pokemon's emoji sits behind the image as a
fallback — if the file 404s the `<img>` removes itself and the emoji shows
through, so a missing sprite never renders a broken-image icon.

Sprites are **bundled, not hotlinked**, to preserve the no-dependency /
no-build / works-offline promise.

---

## UI Notes

### Draft Screen
- Pokemon grid: sorted S→A→B→C, then by Pokedex ID within tier; sticky tier headers
- Card shows: emoji, name, type badge(s), tier badge, cost, HP, speed, attack names
- Tier colors: S=gold `#ffd700`, A=purple `#7c3aed`, B=blue `#1d4ed8`, C=grey `#4b5563`
- Filter bar: by type, by tier, search by name
- Sidebar: 5 team slots, running budget (`$68 / $100`), lock-in button
- After lock-in: VS split view, AI picks one-by-one with 800ms delay + pop-in animation
- Snake draft progress bar: 🔵🔴🔵🔴🔵🔴🔵🔴🔵🔴

### Battle Screen
- Top: AI team — Active Pokemon large, 4 bench cards smaller
- Bottom: Player team — same layout
- Each Pokemon: emoji, name, HP bar, energy pips (●●○), status badge
- Center: Battle log (last 5 lines), turn counter, "End Turn" button
- Attack buttons: green if affordable, grey if not
- Item buttons: greyed after use

---

## Out of Scope (v1)
Gen 2+, saving/loading, multiplayer, abilities, weather/terrain, EV/IV, 6v6, held items
