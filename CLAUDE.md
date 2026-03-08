# Pokemon Draft Battle — Project Context

## Concept
A browser-based Pokemon draft-battle game. Before each match, both players spend a $100 budget
to draft a team of 5 Pokemon from the full Kanto Pokedex (151 Pokemon, tiered by strength).
Then they battle using simplified TCG-style combat mechanics.

Think: Pokemon Showdown meets Pokemon TCG, but designed to be buildable in one weekend.

---

## Tech Stack
- **Language**: Vanilla JavaScript (ES6+)
- **Rendering**: HTML/CSS (DOM-based UI, not canvas)
- **No frameworks**: No React, Vue, jQuery, Phaser
- **No build step**: Open index.html directly in browser

---

## Game Flow

### Phase 1: Draft
1. Show the full Kanto Pokemon roster, filterable by type and tier
2. Player has $100 budget and must pick exactly 5 Pokemon
3. AI picks in a snake draft (alternating turns, player goes first)
4. After Pokemon picks, both sides choose 3 Items from the item pool
5. "Start Battle" confirms and transitions to Phase 2

### Phase 2: Battle
Standard turn-based combat until one side has no Pokemon remaining.

---

## Tier System & Pricing

### S Tier — $30 each
*Legendaries, pseudo-legendaries, top-tier threats*
Mewtwo, Dragonite, Gengar, Alakazam, Machamp, Aerodactyl

### A Tier — $20 each
*Strong fully-evolved Pokemon, consistent meta picks*
Charizard, Blastoise, Venusaur, Arcanine, Gyarados, Lapras, Snorlax, Starmie,
Raichu, Jolteon, Flareon, Vaporeon, Nidoking, Nidoqueen, Clefable, Wigglytuff,
Poliwrath, Golem, Hypno, Dewgong, Cloyster, Electabuzz, Magmar, Scyther, Pinsir,
Tauros, Kangaskhan, Rapidash, Slowbro, Golduck, Primeape, Victreebel

### B Tier — $12 each
*Mid-tier evolutions, niche picks, solid basics with good stats*
Charmeleon, Wartortle, Ivysaur, Pikachu, Growlithe, Poliwhirl, Kadabra,
Tentacruel, Magneton, Dodrio, Seadra, Rhydon, Chansey, Seaking, Exeggutor,
Hitmonlee, Hitmonchan, Weezing, Muk, Kingler, Electrode, Marowak, Haunter,
Omastar, Kabutops, Mr. Mime, Lickitung, Persian, Onix

### C Tier — $5 each
*Unevolved basics, weak Pokemon, meme picks*
Charmander, Squirtle, Bulbasaur, Caterpie, Metapod, Butterfree, Weedle, Kakuna,
Beedrill, Pidgey, Pidgeotto, Pidgeot, Rattata, Raticate, Spearow, Fearow, Ekans,
Arbok, Sandshrew, Sandslash, Nidoran-F, Nidoran-M, Nidorina, Nidorino, Oddish,
Gloom, Vileplume, Paras, Parasect, Venonat, Venomoth, Diglett, Dugtrio, Meowth,
Psyduck, Mankey, Poliwag, Abra, Bellsprout, Weepinbell, Tentacool, Geodude,
Graveler, Ponyta, Slowpoke, Magnemite, Doduo, Seel, Grimer, Shellder, Gastly,
Drowzee, Krabby, Voltorb, Exeggcute, Cubone, Koffing, Rhyhorn, Horsea, Goldeen,
Staryu, Jynx, Eevee, Porygon, Omanyte, Kabuto, Magikarp, Ditto

*Legal $100 / 5-pick combinations:*
| Team Composition | Cost |
|------------------|------|
| 5x A             | $100 ✓ |
| 1x S + 2x A + 2x B | $98 ✓ |
| 1x S + 3x A + 1x C | $95 ✓ |
| 2x S + 1x A + 1x B + 1x C | $97 ✓ |
| 3x A + 2x B      | $84 ✓ |
| 1x S + 1x A + 3x B | $86 ✓ |
| 5x B             | $60 ✓ (budget run) |

---

## Pokemon Data Schema

```javascript
{
  id: number,              // Pokedex number 1–151
  name: string,
  type1: PokemonType,      // primary type
  type2: PokemonType|null, // secondary type
  tier: "S"|"A"|"B"|"C",
  cost: 30|20|12|5,
  hp: number,              // battle HP
  speed: number,           // higher speed acts first on same priority
  emoji: string,           // placeholder art (e.g. "🦎")
  attacks: [Attack, Attack], // exactly 2 attacks
  weakness: PokemonType|null,
  resistance: PokemonType|null
}

// Attack
{
  name: string,
  energyCost: number,      // 1, 2, or 3
  damage: number,
  effect: EffectKey|null   // "burn"|"paralysis"|"sleep"|"poison"|"leech"|"recoil"|"heal"|"splash"
}
```

---

## Energy System (Auto-Generate — No Deck)

No deck, no hand management. Energy builds up automatically:
- Each turn, the **Active Pokemon gains 1 energy** (up to max 5)
- Energy is **stored on the Pokemon** and persists through switches
- Switching OUT does NOT drain energy — Pokemon keep their stored energy
- Attacks consume energy from the using Pokemon's pool
- This creates natural pacing: turn 1 = weak attacks only; turn 3+ = big moves

---

## Battle Rules

### Setup
- Each player has 5 Pokemon: 1 Active + 4 Bench
- Active Pokemon gains energy and takes damage
- Bench Pokemon are safe but cannot act

### Turn Structure
1. **Energy Phase**: Active Pokemon +1 energy (auto)
2. **Action Phase** (pick one OR both in order):
   - **Switch**: Move a Bench Pokemon to Active position (free action, once per turn)
   - **Use Item**: Use one of your 3 items (optional)
3. **Attack Phase**: Choose an attack (required if energy ≥ attack cost, else skip)
4. **Status Tick**: Burn/Poison damage applied; Paralysis/Sleep resolved
5. **Faint Check**: If Active Pokemon HP = 0, it faints; owner sends out Bench Pokemon

### Damage Formula
```
Raw = attack.damage
If target.weakness === attacker.type1: Raw × 2
If target.resistance === attacker.type1: Raw × 0.5 (min 10)
Final = Raw + status/item modifiers
```

### Faint & Replacement
- Fainted Pokemon is removed permanently
- Owner immediately picks replacement from bench (or loses if bench empty)
- Replacement enters with whatever energy it had stored

### Win Condition
All 5 opponent Pokemon have fainted.

---

## Status Effects

| Key          | Icon | Effect |
|--------------|------|--------|
| `burn`       | 🔥   | -20 HP at end of burned Pokemon's turn |
| `paralysis`  | ⚡   | Skip next attack; auto-clears after skip |
| `sleep`      | 💤   | Cannot attack; 50% chance to wake at turn start |
| `poison`     | ☠️   | -10 HP at end of poisoned Pokemon's turn |
| `leech`      | 🌿   | -20 HP end of turn; attacker +10 HP |

*Only one status at a time. New status overwrites old.*

---

## Items (Pick 3 during Draft Phase)

| Name       | Effect |
|------------|--------|
| Potion     | Heal 40 HP from one of your Pokemon |
| Full Heal  | Remove status from one of your Pokemon |
| X Attack   | Your next attack deals +20 extra damage |
| Revive     | Restore one fainted Pokemon to 50% HP (returns to bench) |
| Switch     | Free switch without using your Action Phase switch |

*Single-use. Player chooses 3 from this list. AI always picks: Potion, Full Heal, Revive.*

---

## AI Behaviour

### Draft (Snake — AI picks on turns 2, 4, 6, 8, 10)
1. Target highest-tier Pokemon available within remaining budget
2. Maintain type diversity: avoid picking 3 of the same type
3. Reserve at least $5 for final pick
4. 20% chance to make a surprise off-tier pick (keeps AI unpredictable)

### Battle
1. **Use Full Heal** immediately if status-affected
2. **Use Potion** if HP < 40% and Potion available
3. **Switch** if Active HP < 20% and a healthier bench Pokemon exists
4. **Attack**: pick highest-damage attack with sufficient energy
5. **Pass attack** (save energy) if no attack affordable

---

## Full Kanto Pokemon Database

Implement all 151 in `js/pokemon.js`. Use these as exact specs:

```javascript
// KANTO POKEMON — Full database
// Format: [id, name, type1, type2, tier, cost, hp, speed, emoji, weakness, resistance, attack1, attack2]
// Attack format: { name, energyCost, damage, effect }

const KANTO_POKEMON = [
  // --- FIRE ---
  { id:4,  name:"Charmander", type1:"fire", type2:null, tier:"C", cost:5,  hp:52,  speed:65,  emoji:"🦎",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Ember",energyCost:2,damage:40,effect:"burn"}]},
  { id:5,  name:"Charmeleon", type1:"fire", type2:null, tier:"B", cost:12, hp:80,  speed:80,  emoji:"🔥",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Slash",energyCost:1,damage:30,effect:null},{name:"Flamethrower",energyCost:2,damage:60,effect:"burn"}]},
  { id:6,  name:"Charizard",  type1:"fire", type2:"flying", tier:"A", cost:20, hp:120, speed:100, emoji:"🐉",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Wing Attack",energyCost:2,damage:60,effect:null},{name:"Fire Spin",energyCost:3,damage:100,effect:"burn"}]},
  { id:37, name:"Vulpix",     type1:"fire", type2:null, tier:"C", cost:5,  hp:38,  speed:65,  emoji:"🦊",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Ember",energyCost:1,damage:20,effect:"burn"},{name:"Quick Attack",energyCost:1,damage:25,effect:null}]},
  { id:58, name:"Growlithe",  type1:"fire", type2:null, tier:"B", cost:12, hp:70,  speed:60,  emoji:"🐕",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Bite",energyCost:1,damage:30,effect:null},{name:"Flamethrower",energyCost:2,damage:55,effect:"burn"}]},
  { id:59, name:"Arcanine",   type1:"fire", type2:null, tier:"A", cost:20, hp:110, speed:95,  emoji:"🔥🐕",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Fire Fang",energyCost:2,damage:65,effect:"burn"},{name:"Extreme Speed",energyCost:3,damage:90,effect:null}]},
  { id:77, name:"Ponyta",     type1:"fire", type2:null, tier:"C", cost:5,  hp:50,  speed:90,  emoji:"🐴",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Ember",energyCost:1,damage:25,effect:"burn"},{name:"Stomp",energyCost:2,damage:40,effect:null}]},
  { id:78, name:"Rapidash",   type1:"fire", type2:null, tier:"A", cost:20, hp:90,  speed:105, emoji:"🔥🐴",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Fire Spin",energyCost:2,damage:60,effect:"burn"},{name:"Fury Attack",energyCost:1,damage:35,effect:null}]},
  { id:126,name:"Magmar",     type1:"fire", type2:null, tier:"A", cost:20, hp:95,  speed:93,  emoji:"🌋",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Fire Punch",energyCost:2,damage:65,effect:"burn"},{name:"Flamethrower",energyCost:2,damage:75,effect:"burn"}]},
  // --- WATER ---
  { id:7,  name:"Squirtle",   type1:"water", type2:null, tier:"C", cost:5,  hp:54,  speed:43,  emoji:"🐢",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Water Gun",energyCost:2,damage:40,effect:null}]},
  { id:8,  name:"Wartortle",  type1:"water", type2:null, tier:"B", cost:12, hp:79,  speed:58,  emoji:"🐢💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Bite",energyCost:1,damage:30,effect:null},{name:"Surf",energyCost:2,damage:50,effect:null}]},
  { id:9,  name:"Blastoise",  type1:"water", type2:null, tier:"A", cost:20, hp:120, speed:78,  emoji:"🐋",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Skull Bash",energyCost:2,damage:55,effect:null},{name:"Hydro Pump",energyCost:3,damage:95,effect:null}]},
  { id:54, name:"Psyduck",    type1:"water", type2:null, tier:"C", cost:5,  hp:50,  speed:55,  emoji:"🦆",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Gun",energyCost:1,damage:20,effect:null},{name:"Confusion",energyCost:2,damage:35,effect:"paralysis"}]},
  { id:55, name:"Golduck",    type1:"water", type2:null, tier:"A", cost:20, hp:90,  speed:85,  emoji:"🦆💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Aqua Jet",energyCost:1,damage:35,effect:null},{name:"Hydro Pump",energyCost:3,damage:85,effect:null}]},
  { id:60, name:"Poliwag",    type1:"water", type2:null, tier:"C", cost:5,  hp:40,  speed:90,  emoji:"🌀",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Bubble",energyCost:1,damage:20,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:61, name:"Poliwhirl",  type1:"water", type2:null, tier:"B", cost:12, hp:65,  speed:90,  emoji:"🌀💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Bubble Beam",energyCost:2,damage:45,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:62, name:"Poliwrath",  type1:"water", type2:"fighting", tier:"A", cost:20, hp:100, speed:70, emoji:"💪🌀",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Submission",energyCost:2,damage:60,effect:"recoil"},{name:"Hydro Pump",energyCost:3,damage:80,effect:null}]},
  { id:72, name:"Tentacool",  type1:"water", type2:"poison", tier:"C", cost:5,  hp:40,  speed:70,  emoji:"🪼",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Poison Sting",energyCost:1,damage:20,effect:"poison"},{name:"Water Gun",energyCost:1,damage:20,effect:null}]},
  { id:73, name:"Tentacruel", type1:"water", type2:"poison", tier:"A", cost:20, hp:90,  speed:100, emoji:"🪼☠️",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Poison Jab",energyCost:2,damage:60,effect:"poison"},{name:"Surf",energyCost:2,damage:65,effect:null}]},
  { id:79, name:"Slowpoke",   type1:"water", type2:"psychic", tier:"C", cost:5,  hp:90,  speed:15,  emoji:"🐌",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Confusion",energyCost:2,damage:35,effect:null}]},
  { id:80, name:"Slowbro",    type1:"water", type2:"psychic", tier:"A", cost:20, hp:110, speed:30,  emoji:"🦦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Amnesia",energyCost:1,damage:0,effect:"heal"},{name:"Psychic",energyCost:2,damage:70,effect:null}]},
  { id:86, name:"Seel",       type1:"water", type2:null, tier:"C", cost:5,  hp:65,  speed:45,  emoji:"🦭",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Headbutt",energyCost:1,damage:20,effect:null},{name:"Aurora Beam",energyCost:2,damage:40,effect:null}]},
  { id:87, name:"Dewgong",    type1:"water", type2:"ice", tier:"A", cost:20, hp:100, speed:70,  emoji:"🦭❄️",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Ice Beam",energyCost:2,damage:60,effect:"paralysis"},{name:"Surf",energyCost:2,damage:60,effect:null}]},
  { id:90, name:"Shellder",   type1:"water", type2:null, tier:"C", cost:5,  hp:30,  speed:40,  emoji:"🐚",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"Ice Shard",energyCost:1,damage:25,effect:null}]},
  { id:91, name:"Cloyster",   type1:"water", type2:"ice", tier:"A", cost:20, hp:90,  speed:70,  emoji:"🐚❄️",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Spike Cannon",energyCost:2,damage:55,effect:null},{name:"Blizzard",energyCost:3,damage:90,effect:"paralysis"}]},
  { id:98, name:"Krabby",     type1:"water", type2:null, tier:"C", cost:5,  hp:30,  speed:50,  emoji:"🦀",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Vice Grip",energyCost:1,damage:25,effect:null},{name:"Bubble Beam",energyCost:2,damage:40,effect:null}]},
  { id:99, name:"Kingler",    type1:"water", type2:null, tier:"B", cost:12, hp:70,  speed:75,  emoji:"🦀💪",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Crabhammer",energyCost:2,damage:75,effect:null},{name:"Vice Grip",energyCost:1,damage:35,effect:null}]},
  { id:116,name:"Horsea",     type1:"water", type2:null, tier:"C", cost:5,  hp:30,  speed:60,  emoji:"🐟",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Gun",energyCost:1,damage:20,effect:null},{name:"Smokescreen",energyCost:1,damage:10,effect:null}]},
  { id:117,name:"Seadra",     type1:"water", type2:null, tier:"B", cost:12, hp:65,  speed:85,  emoji:"🐠",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Pulse",energyCost:2,damage:55,effect:null},{name:"Dragon Rage",energyCost:2,damage:50,effect:null}]},
  { id:118,name:"Goldeen",    type1:"water", type2:null, tier:"C", cost:5,  hp:45,  speed:63,  emoji:"🐡",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Horn Attack",energyCost:1,damage:25,effect:null},{name:"Waterfall",energyCost:2,damage:45,effect:null}]},
  { id:119,name:"Seaking",    type1:"water", type2:null, tier:"B", cost:12, hp:80,  speed:68,  emoji:"🐡💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Megahorn",energyCost:2,damage:65,effect:null},{name:"Waterfall",energyCost:2,damage:55,effect:null}]},
  { id:121,name:"Starmie",    type1:"water", type2:"psychic", tier:"A", cost:20, hp:85,  speed:115, emoji:"⭐",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Psychic",energyCost:2,damage:65,effect:null},{name:"Hydro Pump",energyCost:3,damage:85,effect:null}]},
  { id:130,name:"Gyarados",   type1:"water", type2:"flying", tier:"A", cost:20, hp:130, speed:81,  emoji:"🐉💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Thrash",energyCost:2,damage:70,effect:null},{name:"Hyper Beam",energyCost:3,damage:110,effect:null}]},
  { id:131,name:"Lapras",     type1:"water", type2:"ice", tier:"A", cost:20, hp:130, speed:60,  emoji:"🦕",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Ice Beam",energyCost:2,damage:65,effect:null},{name:"Surf",energyCost:2,damage:65,effect:null}]},
  { id:147,name:"Dratini",    type1:"dragon",type2:null, tier:"C", cost:5,  hp:41,  speed:50,  emoji:"🐍",
    weakness:"ice", resistance:"fire",
    attacks:[{name:"Wrap",energyCost:1,damage:20,effect:null},{name:"Dragon Rage",energyCost:2,damage:40,effect:null}]},
  { id:148,name:"Dragonair",  type1:"dragon",type2:null, tier:"B", cost:12, hp:61,  speed:70,  emoji:"🐉✨",
    weakness:"ice", resistance:"fire",
    attacks:[{name:"Dragon Rage",energyCost:2,damage:50,effect:null},{name:"Thunder Wave",energyCost:1,damage:0,effect:"paralysis"}]},
  { id:149,name:"Dragonite",  type1:"dragon",type2:"flying", tier:"S", cost:30, hp:134, speed:80,  emoji:"🐲",
    weakness:"ice", resistance:"grass",
    attacks:[{name:"Dragon Claw",energyCost:2,damage:80,effect:null},{name:"Hyper Beam",energyCost:3,damage:120,effect:null}]},
  { id:134,name:"Vaporeon",   type1:"water", type2:null, tier:"A", cost:20, hp:130, speed:65,  emoji:"💧✨",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Pulse",energyCost:2,damage:55,effect:null},{name:"Hydro Pump",energyCost:3,damage:90,effect:null}]},
  { id:129,name:"Magikarp",   type1:"water", type2:null, tier:"C", cost:5,  hp:20,  speed:80,  emoji:"🐟✨",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Splash",energyCost:1,damage:0,effect:"splash"},{name:"Flail",energyCost:1,damage:0,effect:"flail"}]},

  // --- GRASS ---
  { id:1,  name:"Bulbasaur",  type1:"grass", type2:"poison", tier:"C", cost:5,  hp:54,  speed:45,  emoji:"🌱",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Vine Whip",energyCost:1,damage:25,effect:null},{name:"Leech Seed",energyCost:2,damage:20,effect:"leech"}]},
  { id:2,  name:"Ivysaur",    type1:"grass", type2:"poison", tier:"B", cost:12, hp:74,  speed:60,  emoji:"🌿",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Razor Leaf",energyCost:2,damage:45,effect:null},{name:"Poison Powder",energyCost:1,damage:10,effect:"poison"}]},
  { id:3,  name:"Venusaur",   type1:"grass", type2:"poison", tier:"A", cost:20, hp:120, speed:80,  emoji:"🌺",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Razor Leaf",energyCost:2,damage:60,effect:null},{name:"Solar Beam",energyCost:3,damage:95,effect:null}]},
  { id:43, name:"Oddish",     type1:"grass", type2:"poison", tier:"C", cost:5,  hp:45,  speed:30,  emoji:"🌸",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Absorb",energyCost:1,damage:15,effect:"leech"},{name:"Acid",energyCost:1,damage:20,effect:"poison"}]},
  { id:44, name:"Gloom",      type1:"grass", type2:"poison", tier:"C", cost:5,  hp:60,  speed:40,  emoji:"🌼",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Mega Drain",energyCost:2,damage:35,effect:"leech"},{name:"Stun Spore",energyCost:1,damage:0,effect:"paralysis"}]},
  { id:45, name:"Vileplume",  type1:"grass", type2:"poison", tier:"A", cost:20, hp:90,  speed:50,  emoji:"🌻",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Petal Dance",energyCost:2,damage:70,effect:null},{name:"Sleep Powder",energyCost:1,damage:0,effect:"sleep"}]},
  { id:69, name:"Bellsprout", type1:"grass", type2:"poison", tier:"C", cost:5,  hp:50,  speed:40,  emoji:"🌱🔔",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Vine Whip",energyCost:1,damage:20,effect:null},{name:"Acid",energyCost:1,damage:20,effect:"poison"}]},
  { id:70, name:"Weepinbell", type1:"grass", type2:"poison", tier:"C", cost:5,  hp:65,  speed:55,  emoji:"🔔🌿",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Razor Leaf",energyCost:2,damage:40,effect:null},{name:"Wrap",energyCost:1,damage:20,effect:null}]},
  { id:71, name:"Victreebel", type1:"grass", type2:"poison", tier:"A", cost:20, hp:90,  speed:70,  emoji:"🔔🌺",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Leaf Blade",energyCost:2,damage:70,effect:null},{name:"Acid",energyCost:2,damage:55,effect:"poison"}]},
  { id:114,name:"Tangela",    type1:"grass", type2:null, tier:"C", cost:5,  hp:65,  speed:60,  emoji:"🪸",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Constrict",energyCost:1,damage:20,effect:null},{name:"Mega Drain",energyCost:2,damage:40,effect:"leech"}]},

  // --- ELECTRIC ---
  { id:25, name:"Pikachu",    type1:"electric", type2:null, tier:"B", cost:12, hp:60,  speed:90,  emoji:"⚡🐭",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Quick Attack",energyCost:1,damage:25,effect:null},{name:"Thunderbolt",energyCost:2,damage:55,effect:"paralysis"}]},
  { id:26, name:"Raichu",     type1:"electric", type2:null, tier:"A", cost:20, hp:90,  speed:110, emoji:"⚡🐭✨",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Slam",energyCost:1,damage:35,effect:null},{name:"Thunder",energyCost:2,damage:75,effect:"paralysis"}]},
  { id:81, name:"Magnemite",  type1:"electric", type2:"steel", tier:"C", cost:5,  hp:25,  speed:45,  emoji:"🧲",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"Thunder Wave",energyCost:1,damage:0,effect:"paralysis"}]},
  { id:82, name:"Magneton",   type1:"electric", type2:"steel", tier:"B", cost:12, hp:50,  speed:70,  emoji:"🧲🧲",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Thunderbolt",energyCost:2,damage:55,effect:"paralysis"},{name:"Mirror Shot",energyCost:2,damage:50,effect:null}]},
  { id:100,name:"Voltorb",    type1:"electric", type2:null, tier:"C", cost:5,  hp:40,  speed:100, emoji:"💣",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"Thunderbolt",energyCost:2,damage:45,effect:"paralysis"}]},
  { id:101,name:"Electrode",  type1:"electric", type2:null, tier:"B", cost:12, hp:60,  speed:150, emoji:"💥",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Thunderbolt",energyCost:2,damage:60,effect:"paralysis"},{name:"Explosion",energyCost:3,damage:100,effect:"recoil"}]},
  { id:125,name:"Electabuzz", type1:"electric", type2:null, tier:"A", cost:20, hp:95,  speed:105, emoji:"⚡👊",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Thunder Punch",energyCost:2,damage:65,effect:"paralysis"},{name:"Thunder",energyCost:3,damage:80,effect:"paralysis"}]},
  { id:135,name:"Jolteon",    type1:"electric", type2:null, tier:"A", cost:20, hp:80,  speed:130, emoji:"⚡✨",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Quick Attack",energyCost:1,damage:35,effect:null},{name:"Thunder",energyCost:2,damage:75,effect:"paralysis"}]},

  // --- PSYCHIC ---
  { id:63, name:"Abra",       type1:"psychic", type2:null, tier:"C", cost:5,  hp:25,  speed:90,  emoji:"🥄",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Teleport",energyCost:1,damage:0,effect:null},{name:"Confusion",energyCost:1,damage:30,effect:null}]},
  { id:64, name:"Kadabra",    type1:"psychic", type2:null, tier:"B", cost:12, hp:55,  speed:105, emoji:"🥄✨",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Confusion",energyCost:1,damage:40,effect:null},{name:"Psybeam",energyCost:2,damage:55,effect:"paralysis"}]},
  { id:65, name:"Alakazam",   type1:"psychic", type2:null, tier:"S", cost:30, hp:75,  speed:120, emoji:"🔮",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Psybeam",energyCost:2,damage:65,effect:null},{name:"Psychic",energyCost:2,damage:90,effect:"paralysis"}]},
  { id:96, name:"Drowzee",    type1:"psychic", type2:null, tier:"C", cost:5,  hp:60,  speed:42,  emoji:"🌙",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"},{name:"Confusion",energyCost:1,damage:25,effect:null}]},
  { id:97, name:"Hypno",      type1:"psychic", type2:null, tier:"A", cost:20, hp:95,  speed:67,  emoji:"🌙✨",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"},{name:"Psychic",energyCost:2,damage:70,effect:null}]},
  { id:102,name:"Exeggcute",  type1:"grass",   type2:"psychic", tier:"C", cost:5, hp:60, speed:40, emoji:"🥚🥚",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Barrage",energyCost:1,damage:20,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:103,name:"Exeggutor",  type1:"grass",   type2:"psychic", tier:"B", cost:12, hp:95, speed:55, emoji:"🌴🥚",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Stomp",energyCost:2,damage:55,effect:null},{name:"Solar Beam",energyCost:3,damage:80,effect:null}]},
  { id:122,name:"Mr. Mime",   type1:"psychic", type2:null, tier:"B", cost:12, hp:65,  speed:90,  emoji:"🤡",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Confusion",energyCost:1,damage:35,effect:null},{name:"Psychic",energyCost:2,damage:60,effect:null}]},
  { id:124,name:"Jynx",       type1:"psychic", type2:"ice", tier:"C", cost:5,  hp:65,  speed:95,  emoji:"💋",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Lovely Kiss",energyCost:1,damage:0,effect:"sleep"},{name:"Ice Punch",energyCost:2,damage:50,effect:null}]},
  { id:150,name:"Mewtwo",     type1:"psychic", type2:null, tier:"S", cost:30, hp:130, speed:130, emoji:"👾",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Psywave",energyCost:1,damage:40,effect:null},{name:"Psychic",energyCost:2,damage:90,effect:"paralysis"}]},

  // --- GHOST / POISON ---
  { id:92, name:"Gastly",     type1:"ghost",   type2:"poison", tier:"C", cost:5, hp:30, speed:80, emoji:"👻",
    weakness:"psychic", resistance:"fighting",
    attacks:[{name:"Lick",energyCost:1,damage:20,effect:"paralysis"},{name:"Night Shade",energyCost:2,damage:35,effect:null}]},
  { id:93, name:"Haunter",    type1:"ghost",   type2:"poison", tier:"A", cost:20, hp:60, speed:95, emoji:"👻✨",
    weakness:"psychic", resistance:"fighting",
    attacks:[{name:"Shadow Ball",energyCost:2,damage:60,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:94, name:"Gengar",     type1:"ghost",   type2:"poison", tier:"S", cost:30, hp:80, speed:110, emoji:"😈",
    weakness:"psychic", resistance:"fighting",
    attacks:[{name:"Shadow Ball",energyCost:2,damage:70,effect:null},{name:"Nightmare",energyCost:2,damage:50,effect:"sleep"}]},
  { id:109,name:"Koffing",    type1:"poison",  type2:null, tier:"C", cost:5, hp:40, speed:35, emoji:"☁️☠️",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Smog",energyCost:1,damage:20,effect:"poison"},{name:"Sludge",energyCost:2,damage:40,effect:"poison"}]},
  { id:110,name:"Weezing",    type1:"poison",  type2:null, tier:"B", cost:12, hp:65, speed:60, emoji:"☁️☠️✨",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Sludge Bomb",energyCost:2,damage:60,effect:"poison"},{name:"Explosion",energyCost:3,damage:90,effect:"recoil"}]},

  // --- NORMAL ---
  { id:19, name:"Rattata",    type1:"normal",  type2:null, tier:"C", cost:5, hp:30, speed:72, emoji:"🐭",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Quick Attack",energyCost:1,damage:20,effect:null},{name:"Hyper Fang",energyCost:2,damage:40,effect:null}]},
  { id:20, name:"Raticate",   type1:"normal",  type2:null, tier:"C", cost:5, hp:55, speed:97, emoji:"🐀",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Hyper Fang",energyCost:2,damage:55,effect:null},{name:"Super Fang",energyCost:1,damage:0,effect:"superfang"}]},
  { id:35, name:"Clefairy",   type1:"normal",  type2:null, tier:"C", cost:5, hp:70, speed:35, emoji:"⭐🌸",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Pound",energyCost:1,damage:20,effect:null},{name:"Metronome",energyCost:2,damage:40,effect:null}]},
  { id:36, name:"Clefable",   type1:"normal",  type2:null, tier:"A", cost:20, hp:100, speed:60, emoji:"⭐🌺",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Moonblast",energyCost:2,damage:65,effect:null},{name:"Metronome",energyCost:1,damage:0,effect:"random"}]},
  { id:39, name:"Jigglypuff", type1:"normal",  type2:"fairy", tier:"C", cost:5, hp:115, speed:20, emoji:"🎤",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Sing",energyCost:1,damage:0,effect:"sleep"},{name:"Body Slam",energyCost:2,damage:35,effect:"paralysis"}]},
  { id:40, name:"Wigglytuff", type1:"normal",  type2:"fairy", tier:"A", cost:20, hp:140, speed:45, emoji:"🎤✨",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Double Slap",energyCost:1,damage:30,effect:null},{name:"Hyper Voice",energyCost:3,damage:80,effect:null}]},
  { id:52, name:"Meowth",     type1:"normal",  type2:null, tier:"C", cost:5, hp:40, speed:90, emoji:"😺",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Pay Day",energyCost:2,damage:35,effect:null}]},
  { id:53, name:"Persian",    type1:"normal",  type2:null, tier:"B", cost:12, hp:65, speed:115, emoji:"😸",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Slash",energyCost:1,damage:40,effect:null},{name:"Hyper Beam",energyCost:3,damage:80,effect:null}]},
  { id:108,name:"Lickitung",  type1:"normal",  type2:null, tier:"B", cost:12, hp:90, speed:30, emoji:"👅",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Lick",energyCost:1,damage:20,effect:"paralysis"},{name:"Body Slam",energyCost:2,damage:50,effect:"paralysis"}]},
  { id:113,name:"Chansey",    type1:"normal",  type2:null, tier:"B", cost:12, hp:250, speed:50, emoji:"🥚💕",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Egg Bomb",energyCost:2,damage:50,effect:null},{name:"Softboiled",energyCost:1,damage:0,effect:"heal"}]},
  { id:115,name:"Kangaskhan", type1:"normal",  type2:null, tier:"A", cost:20, hp:120, speed:90, emoji:"🦘",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Comet Punch",energyCost:1,damage:40,effect:null},{name:"Outrage",energyCost:3,damage:85,effect:null}]},
  { id:128,name:"Tauros",     type1:"normal",  type2:null, tier:"A", cost:20, hp:90, speed:110, emoji:"🐂",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Tackle",energyCost:1,damage:35,effect:null},{name:"Take Down",energyCost:2,damage:70,effect:"recoil"}]},
  { id:132,name:"Ditto",      type1:"normal",  type2:null, tier:"C", cost:5, hp:48, speed:48, emoji:"🟣",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Transform",energyCost:1,damage:0,effect:"transform"},{name:"Pound",energyCost:1,damage:20,effect:null}]},
  { id:133,name:"Eevee",      type1:"normal",  type2:null, tier:"C", cost:5, hp:55, speed:55, emoji:"🦊✨",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Growl",energyCost:1,damage:0,effect:null}]},
  { id:137,name:"Porygon",    type1:"normal",  type2:null, tier:"C", cost:5, hp:65, speed:40, emoji:"💾",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Tri Attack",energyCost:2,damage:45,effect:null}]},
  { id:143,name:"Snorlax",    type1:"normal",  type2:null, tier:"A", cost:20, hp:160, speed:30, emoji:"😴",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Body Slam",energyCost:2,damage:60,effect:"paralysis"},{name:"Heavy Slam",energyCost:3,damage:90,effect:null}]},

  // --- FIGHTING ---
  { id:56, name:"Mankey",     type1:"fighting",type2:null, tier:"C", cost:5, hp:40, speed:70, emoji:"🐒",
    weakness:"psychic", resistance:"dark",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Low Kick",energyCost:1,damage:25,effect:null}]},
  { id:57, name:"Primeape",   type1:"fighting",type2:null, tier:"A", cost:20, hp:80, speed:95, emoji:"🦍",
    weakness:"psychic", resistance:"dark",
    attacks:[{name:"Cross Chop",energyCost:2,damage:70,effect:null},{name:"Thrash",energyCost:2,damage:60,effect:null}]},
  { id:66, name:"Machop",     type1:"fighting",type2:null, tier:"C", cost:5, hp:70, speed:35, emoji:"💪",
    weakness:"psychic", resistance:"dark",
    attacks:[{name:"Karate Chop",energyCost:1,damage:25,effect:null},{name:"Low Sweep",energyCost:2,damage:40,effect:null}]},
  { id:67, name:"Machoke",    type1:"fighting",type2:null, tier:"B", cost:12, hp:90, speed:45, emoji:"💪✨",
    weakness:"psychic", resistance:"dark",
    attacks:[{name:"Cross Chop",energyCost:2,damage:60,effect:null},{name:"Submission",energyCost:2,damage:55,effect:"recoil"}]},
  { id:68, name:"Machamp",    type1:"fighting",type2:null, tier:"S", cost:30, hp:130, speed:55, emoji:"🏋️",
    weakness:"psychic", resistance:"dark",
    attacks:[{name:"Dynamic Punch",energyCost:2,damage:80,effect:"paralysis"},{name:"Cross Chop",energyCost:2,damage:90,effect:null}]},
  { id:106,name:"Hitmonlee",  type1:"fighting",type2:null, tier:"A", cost:20, hp:80, speed:87, emoji:"🦵",
    weakness:"psychic", resistance:"dark",
    attacks:[{name:"High Jump Kick",energyCost:2,damage:75,effect:"recoil"},{name:"Blaze Kick",energyCost:2,damage:65,effect:"burn"}]},
  { id:107,name:"Hitmonchan", type1:"fighting",type2:null, tier:"A", cost:20, hp:80, speed:76, emoji:"🥊",
    weakness:"psychic", resistance:"dark",
    attacks:[{name:"Ice Punch",energyCost:2,damage:55,effect:null},{name:"Thunder Punch",energyCost:2,damage:55,effect:"paralysis"}]},

  // --- GROUND / ROCK ---
  { id:27, name:"Sandshrew",  type1:"ground",  type2:null, tier:"C", cost:5, hp:50, speed:40, emoji:"🌵",
    weakness:"water", resistance:"electric",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Slash",energyCost:2,damage:40,effect:null}]},
  { id:28, name:"Sandslash",  type1:"ground",  type2:null, tier:"C", cost:5, hp:80, speed:65, emoji:"🌵✨",
    weakness:"water", resistance:"electric",
    attacks:[{name:"Slash",energyCost:1,damage:40,effect:null},{name:"Earthquake",energyCost:2,damage:60,effect:null}]},
  { id:50, name:"Diglett",    type1:"ground",  type2:null, tier:"C", cost:5, hp:10, speed:95, emoji:"🕳️",
    weakness:"water", resistance:"electric",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Dig",energyCost:2,damage:50,effect:null}]},
  { id:51, name:"Dugtrio",    type1:"ground",  type2:null, tier:"C", cost:5, hp:35, speed:120, emoji:"🕳️🕳️🕳️",
    weakness:"water", resistance:"electric",
    attacks:[{name:"Earthquake",energyCost:2,damage:60,effect:null},{name:"Sucker Punch",energyCost:1,damage:30,effect:null}]},
  { id:74, name:"Geodude",    type1:"rock",    type2:"ground", tier:"C", cost:5, hp:40, speed:20, emoji:"🪨",
    weakness:"water", resistance:"fire",
    attacks:[{name:"Rock Throw",energyCost:1,damage:25,effect:null},{name:"Magnitude",energyCost:2,damage:45,effect:null}]},
  { id:75, name:"Graveler",   type1:"rock",    type2:"ground", tier:"C", cost:5, hp:55, speed:35, emoji:"🪨✨",
    weakness:"water", resistance:"fire",
    attacks:[{name:"Rock Slide",energyCost:2,damage:50,effect:null},{name:"Earthquake",energyCost:2,damage:55,effect:null}]},
  { id:76, name:"Golem",      type1:"rock",    type2:"ground", tier:"A", cost:20, hp:80, speed:45, emoji:"🪨💪",
    weakness:"water", resistance:"fire",
    attacks:[{name:"Rock Blast",energyCost:2,damage:65,effect:null},{name:"Earthquake",energyCost:3,damage:90,effect:null}]},
  { id:111,name:"Rhyhorn",    type1:"ground",  type2:"rock", tier:"C", cost:5, hp:80, speed:25, emoji:"🦏",
    weakness:"water", resistance:"fire",
    attacks:[{name:"Horn Attack",energyCost:1,damage:25,effect:null},{name:"Stomp",energyCost:2,damage:40,effect:null}]},
  { id:112,name:"Rhydon",     type1:"ground",  type2:"rock", tier:"B", cost:12, hp:105, speed:40, emoji:"🦏💪",
    weakness:"water", resistance:"fire",
    attacks:[{name:"Drill Run",energyCost:2,damage:70,effect:null},{name:"Stone Edge",energyCost:3,damage:90,effect:null}]},
  { id:138,name:"Omanyte",    type1:"rock",    type2:"water", tier:"C", cost:5, hp:35, speed:35, emoji:"🐚🪨",
    weakness:"grass", resistance:"fire",
    attacks:[{name:"Water Gun",energyCost:1,damage:20,effect:null},{name:"Rock Blast",energyCost:2,damage:35,effect:null}]},
  { id:139,name:"Omastar",    type1:"rock",    type2:"water", tier:"C", cost:5, hp:70, speed:55, emoji:"🐚🪨✨",
    weakness:"grass", resistance:"fire",
    attacks:[{name:"Spike Cannon",energyCost:2,damage:55,effect:null},{name:"Hydro Pump",energyCost:3,damage:75,effect:null}]},
  { id:140,name:"Kabuto",     type1:"rock",    type2:"water", tier:"C", cost:5, hp:30, speed:55, emoji:"🦀🪨",
    weakness:"grass", resistance:"fire",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Aqua Jet",energyCost:1,damage:30,effect:null}]},
  { id:141,name:"Kabutops",   type1:"rock",    type2:"water", tier:"C", cost:5, hp:60, speed:80, emoji:"🦀🪨✨",
    weakness:"grass", resistance:"fire",
    attacks:[{name:"Slash",energyCost:1,damage:40,effect:null},{name:"Aqua Jet",energyCost:2,damage:60,effect:null}]},
  { id:142,name:"Aerodactyl", type1:"rock",    type2:"flying", tier:"S", cost:30, hp:80, speed:130, emoji:"🦅🪨",
    weakness:"water", resistance:"fire",
    attacks:[{name:"Rock Slide",energyCost:2,damage:70,effect:null},{name:"Ancient Power",energyCost:3,damage:100,effect:null}]},

  // --- BUG / FLYING ---
  { id:10, name:"Caterpie",   type1:"bug",     type2:null, tier:"C", cost:5, hp:45, speed:45, emoji:"🐛",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"String Shot",energyCost:1,damage:10,effect:"paralysis"}]},
  { id:11, name:"Metapod",    type1:"bug",     type2:null, tier:"C", cost:5, hp:50, speed:30, emoji:"🫘",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:10,effect:null},{name:"Harden",energyCost:1,damage:0,effect:"harden"}]},
  { id:12, name:"Butterfree", type1:"bug",     type2:"flying", tier:"C", cost:5, hp:60, speed:70, emoji:"🦋",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Confusion",energyCost:1,damage:30,effect:null},{name:"Sleep Powder",energyCost:1,damage:0,effect:"sleep"}]},
  { id:13, name:"Weedle",     type1:"bug",     type2:"poison", tier:"C", cost:5, hp:35, speed:35, emoji:"🐝",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Poison Sting",energyCost:1,damage:15,effect:"poison"},{name:"Bite",energyCost:1,damage:20,effect:null}]},
  { id:14, name:"Kakuna",     type1:"bug",     type2:"poison", tier:"C", cost:5, hp:45, speed:35, emoji:"🥚🐝",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:10,effect:null},{name:"Harden",energyCost:1,damage:0,effect:"harden"}]},
  { id:15, name:"Beedrill",   type1:"bug",     type2:"poison", tier:"C", cost:5, hp:65, speed:75, emoji:"🐝✨",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Fury Attack",energyCost:1,damage:30,effect:null},{name:"Twineedle",energyCost:2,damage:50,effect:"poison"}]},
  { id:16, name:"Pidgey",     type1:"normal",  type2:"flying", tier:"C", cost:5, hp:40, speed:56, emoji:"🐦",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Gust",energyCost:1,damage:20,effect:null},{name:"Quick Attack",energyCost:1,damage:20,effect:null}]},
  { id:17, name:"Pidgeotto",  type1:"normal",  type2:"flying", tier:"C", cost:5, hp:63, speed:71, emoji:"🦅",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Gust",energyCost:1,damage:30,effect:null},{name:"Wing Attack",energyCost:2,damage:50,effect:null}]},
  { id:18, name:"Pidgeot",    type1:"normal",  type2:"flying", tier:"C", cost:5, hp:83, speed:91, emoji:"🦅✨",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Air Slash",energyCost:2,damage:55,effect:null},{name:"Hurricane",energyCost:3,damage:80,effect:null}]},
  { id:21, name:"Spearow",    type1:"normal",  type2:"flying", tier:"C", cost:5, hp:40, speed:70, emoji:"🐦‍⬛",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Peck",energyCost:1,damage:20,effect:null},{name:"Drill Peck",energyCost:2,damage:40,effect:null}]},
  { id:22, name:"Fearow",     type1:"normal",  type2:"flying", tier:"C", cost:5, hp:65, speed:100, emoji:"🦆✨",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Drill Peck",energyCost:2,damage:55,effect:null},{name:"Agility",energyCost:1,damage:20,effect:null}]},
  { id:83, name:"Farfetch'd", type1:"normal",  type2:"flying", tier:"C", cost:5, hp:52, speed:60, emoji:"🐦🥬",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Slash",energyCost:1,damage:35,effect:null},{name:"Air Cutter",energyCost:2,damage:45,effect:null}]},
  { id:84, name:"Doduo",      type1:"normal",  type2:"flying", tier:"C", cost:5, hp:35, speed:75, emoji:"🐦🐦",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Peck",energyCost:1,damage:20,effect:null},{name:"Double Hit",energyCost:2,damage:40,effect:null}]},
  { id:85, name:"Dodrio",     type1:"normal",  type2:"flying", tier:"B", cost:12, hp:60, speed:110, emoji:"🐦🐦🐦",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Drill Peck",energyCost:2,damage:60,effect:null},{name:"Tri Attack",energyCost:2,damage:55,effect:null}]},
  { id:123,name:"Scyther",    type1:"bug",     type2:"flying", tier:"A", cost:20, hp:95, speed:105, emoji:"🦗",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Slash",energyCost:1,damage:45,effect:null},{name:"Air Slash",energyCost:2,damage:70,effect:null}]},
  { id:127,name:"Pinsir",     type1:"bug",     type2:null, tier:"A", cost:20, hp:95, speed:85, emoji:"🦂",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Vice Grip",energyCost:1,damage:40,effect:null},{name:"X-Scissor",energyCost:2,damage:75,effect:null}]},

  // --- ICE ---
  { id:144,name:"Articuno",   type1:"ice",     type2:"flying", tier:"S", cost:30, hp:130, speed:85, emoji:"🧊🦅",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Ice Beam",energyCost:2,damage:70,effect:null},{name:"Blizzard",energyCost:3,damage:110,effect:"paralysis"}]},
  // (Articuno added as bonus S-tier legendary)

  // --- MISC / REMAINING C-TIERS ---
  { id:23, name:"Ekans",      type1:"poison",  type2:null, tier:"C", cost:5, hp:35, speed:55, emoji:"🐍",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Poison Sting",energyCost:1,damage:20,effect:"poison"},{name:"Bite",energyCost:1,damage:25,effect:null}]},
  { id:24, name:"Arbok",      type1:"poison",  type2:null, tier:"C", cost:5, hp:60, speed:70, emoji:"🐍✨",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Sludge",energyCost:2,damage:50,effect:"poison"},{name:"Crunch",energyCost:2,damage:55,effect:null}]},
  { id:46, name:"Paras",      type1:"bug",     type2:"grass", tier:"C", cost:5, hp:35, speed:25, emoji:"🍄🦀",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Spore",energyCost:1,damage:0,effect:"sleep"}]},
  { id:47, name:"Parasect",   type1:"bug",     type2:"grass", tier:"C", cost:5, hp:60, speed:30, emoji:"🍄🦀✨",
    weakness:"fire", resistance:"water",
    attacks:[{name:"Slash",energyCost:1,damage:30,effect:null},{name:"Spore",energyCost:1,damage:0,effect:"sleep"}]},
  { id:48, name:"Venonat",    type1:"bug",     type2:"poison", tier:"C", cost:5, hp:60, speed:45, emoji:"🐛👁️",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Confusion",energyCost:1,damage:25,effect:null}]},
  { id:49, name:"Venomoth",   type1:"bug",     type2:"poison", tier:"C", cost:5, hp:70, speed:90, emoji:"🦋☠️",
    weakness:"fire", resistance:"grass",
    attacks:[{name:"Psybeam",energyCost:2,damage:45,effect:"paralysis"},{name:"Stun Spore",energyCost:1,damage:0,effect:"paralysis"}]},
  { id:88, name:"Grimer",     type1:"poison",  type2:null, tier:"C", cost:5, hp:80, speed:25, emoji:"🟢☠️",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Acid",energyCost:1,damage:20,effect:"poison"},{name:"Sludge",energyCost:2,damage:40,effect:"poison"}]},
  { id:89, name:"Muk",        type1:"poison",  type2:null, tier:"B", cost:12, hp:105, speed:50, emoji:"🟢☠️✨",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Sludge Bomb",energyCost:2,damage:65,effect:"poison"},{name:"Gunk Shot",energyCost:3,damage:85,effect:"poison"}]},
  { id:104,name:"Cubone",     type1:"ground",  type2:null, tier:"C", cost:5, hp:50, speed:35, emoji:"💀🦴",
    weakness:"water", resistance:"electric",
    attacks:[{name:"Bone Club",energyCost:1,damage:25,effect:null},{name:"Headbutt",energyCost:2,damage:40,effect:null}]},
  { id:105,name:"Marowak",    type1:"ground",  type2:null, tier:"B", cost:12, hp:60, speed:45, emoji:"💀🦴✨",
    weakness:"water", resistance:"electric",
    attacks:[{name:"Bone Rush",energyCost:2,damage:60,effect:null},{name:"Earthquake",energyCost:3,damage:80,effect:null}]},
  { id:120,name:"Staryu",     type1:"water",   type2:null, tier:"C", cost:5, hp:30, speed:85, emoji:"⭐💧",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Water Gun",energyCost:2,damage:40,effect:null}]},
  { id:136,name:"Flareon",    type1:"fire",    type2:null, tier:"A", cost:20, hp:90, speed:65, emoji:"🔥✨",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Fire Spin",energyCost:2,damage:65,effect:"burn"},{name:"Flare Blitz",energyCost:3,damage:95,effect:"recoil"}]},
  { id:145,name:"Zapdos",     type1:"electric",type2:"flying", tier:"S", cost:30, hp:130, speed:100, emoji:"⚡🦅",
    weakness:"ground", resistance:"electric",
    attacks:[{name:"Thunderbolt",energyCost:2,damage:75,effect:"paralysis"},{name:"Thunder",energyCost:3,damage:110,effect:"paralysis"}]},
  { id:146,name:"Moltres",    type1:"fire",    type2:"flying", tier:"S", cost:30, hp:130, speed:90, emoji:"🔥🦅",
    weakness:"water", resistance:"grass",
    attacks:[{name:"Flamethrower",energyCost:2,damage:75,effect:"burn"},{name:"Sky Attack",energyCost:3,damage:110,effect:null}]},
  { id:151,name:"Mew",        type1:"psychic", type2:null, tier:"S", cost:30, hp:100, speed:100, emoji:"🌟",
    weakness:"dark", resistance:"fighting",
    attacks:[{name:"Ancient Power",energyCost:2,damage:60,effect:null},{name:"Psychic",energyCost:2,damage:80,effect:"paralysis"}]},
  { id:95, name:"Onix",       type1:"rock",    type2:"ground", tier:"B", cost:12, hp:35, speed:70, emoji:"🐉🪨",
    weakness:"water", resistance:"fire",
    attacks:[{name:"Rock Throw",energyCost:1,damage:30,effect:null},{name:"Iron Tail",energyCost:2,damage:60,effect:null}]},
  { id:31, name:"Nidoqueen",  type1:"poison",  type2:"ground", tier:"A", cost:20, hp:110, speed:76, emoji:"👑🐊",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Body Slam",energyCost:2,damage:60,effect:"paralysis"},{name:"Earthquake",energyCost:3,damage:85,effect:null}]},
  { id:34, name:"Nidoking",   type1:"poison",  type2:"ground", tier:"A", cost:20, hp:102, speed:85, emoji:"👑🦎",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Poison Jab",energyCost:2,damage:65,effect:"poison"},{name:"Earthquake",energyCost:3,damage:90,effect:null}]},
  { id:29, name:"Nidoran-F",  type1:"poison",  type2:null, tier:"C", cost:5, hp:55, speed:41, emoji:"🐇💜",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Poison Sting",energyCost:1,damage:20,effect:"poison"}]},
  { id:30, name:"Nidorina",   type1:"poison",  type2:null, tier:"C", cost:5, hp:70, speed:56, emoji:"🐇💜✨",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Bite",energyCost:1,damage:25,effect:null},{name:"Poison Fang",energyCost:2,damage:45,effect:"poison"}]},
  { id:32, name:"Nidoran-M",  type1:"poison",  type2:null, tier:"C", cost:5, hp:46, speed:50, emoji:"🐰💜",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Horn Attack",energyCost:1,damage:25,effect:null}]},
  { id:33, name:"Nidorino",   type1:"poison",  type2:null, tier:"C", cost:5, hp:61, speed:65, emoji:"🐰💜✨",
    weakness:"psychic", resistance:"grass",
    attacks:[{name:"Horn Attack",energyCost:1,damage:30,effect:null},{name:"Poison Fang",energyCost:2,damage:45,effect:"poison"}]},
];
```

---

## File Structure

```
/pokemon-draft-battle/
├── index.html          # Full game UI (draft + battle screens)
├── style.css           # Styling — dark theme, TCG card aesthetic
├── js/
│   ├── pokemon.js      # Full Kanto database (all entries from above) + helpers
│   ├── draft.js        # Draft phase: UI, player picks, AI snake draft, item selection
│   ├── battle.js       # Battle state, turn engine, damage calc, status effects
│   ├── ai.js           # AI battle decisions
│   └── ui.js           # DOM rendering for draft and battle, event handlers
└── CLAUDE.md
```

---

## UI Notes

### Draft Screen
- Grid of Pokemon cards sorted S → A → B → C, then by Pokedex number within tier
- Each card: emoji art, name, type badge(s), tier badge, cost, HP, speed, attack names preview
- Tier color coding: S=gold, A=purple, B=blue, C=grey
- Filter bar: by type, by tier, search by name
- "My Team" sidebar: 5 slots, running budget (e.g. "$68 / $100"), lock-in button
- After lock-in: AI makes picks one by one with 800ms delay, revealed with animation
- Snake draft order shown as a progress bar: 🔵🔴🔵🔴🔵🔴🔵🔴🔵🔴

### Battle Screen
- **Top**: AI team — Active Pokemon large, bench as 4 smaller cards
- **Bottom**: Player team — same layout
- Each Pokemon shows: emoji, name, HP bar, energy pips (●●○ = 2 stored of 3 max), status badge
- **Center panel**: Battle log (last 5 lines), turn counter, "End Turn" button
- Player's attack buttons highlight green/grey based on energy availability
- Item buttons in corner — greyed after use

---

## Out of Scope for v1
- Gen 2+ Pokemon
- Saving/loading
- Network multiplayer
- Abilities (passives)
- Weather/terrain
- EV/IV stats
- Full 6v6
- Held items
