'use strict';

window.KANTO_POKEMON = [
  // ── #1–3 GRASS/POISON ──────────────────────────────────────────────────────
  { id:1,   name:"Bulbasaur",  type1:"grass",   type2:"poison", tier:"C", cost:5,  hp:54,  speed:45,  emoji:"🌱",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Vine Whip",energyCost:1,damage:25,effect:null},{name:"Leech Seed",energyCost:2,damage:20,effect:"leech"}]},
  { id:2,   name:"Ivysaur",    type1:"grass",   type2:"poison", tier:"B", cost:12, hp:74,  speed:60,  emoji:"🌿",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Razor Leaf",energyCost:2,damage:45,effect:null},{name:"Poison Powder",energyCost:1,damage:10,effect:"poison"}]},
  { id:3,   name:"Venusaur",   type1:"grass",   type2:"poison", tier:"A", cost:20, hp:120, speed:80,  emoji:"🌺",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Razor Leaf",energyCost:2,damage:60,effect:null},{name:"Solar Beam",energyCost:3,damage:95,effect:null}]},

  // ── #4–6 FIRE ──────────────────────────────────────────────────────────────
  { id:4,   name:"Charmander", type1:"fire",    type2:null,     tier:"C", cost:5,  hp:52,  speed:65,  emoji:"🦎",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Ember",energyCost:2,damage:40,effect:"burn"}]},
  { id:5,   name:"Charmeleon", type1:"fire",    type2:null,     tier:"B", cost:12, hp:80,  speed:80,  emoji:"🔥",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Slash",energyCost:1,damage:30,effect:null},{name:"Flamethrower",energyCost:2,damage:60,effect:"burn"}]},
  { id:6,   name:"Charizard",  type1:"fire",    type2:"flying", tier:"A", cost:20, hp:120, speed:100, emoji:"🐉",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Wing Attack",energyCost:2,damage:60,effect:null},{name:"Fire Spin",energyCost:3,damage:100,effect:"burn"}]},

  // ── #7–9 WATER ─────────────────────────────────────────────────────────────
  { id:7,   name:"Squirtle",   type1:"water",   type2:null,     tier:"C", cost:5,  hp:54,  speed:43,  emoji:"🐢",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Water Gun",energyCost:2,damage:40,effect:null}]},
  { id:8,   name:"Wartortle",  type1:"water",   type2:null,     tier:"B", cost:12, hp:79,  speed:58,  emoji:"🐢💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Bite",energyCost:1,damage:30,effect:null},{name:"Surf",energyCost:2,damage:50,effect:null}]},
  { id:9,   name:"Blastoise",  type1:"water",   type2:null,     tier:"A", cost:20, hp:120, speed:78,  emoji:"🐋",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Skull Bash",energyCost:2,damage:55,effect:null},{name:"Hydro Pump",energyCost:3,damage:95,effect:null}]},

  // ── #10–12 BUG ─────────────────────────────────────────────────────────────
  { id:10,  name:"Caterpie",   type1:"bug",     type2:null,     tier:"C", cost:5,  hp:45,  speed:45,  emoji:"🐛",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"String Shot",energyCost:1,damage:10,effect:"paralysis"}]},
  { id:11,  name:"Metapod",    type1:"bug",     type2:null,     tier:"C", cost:5,  hp:50,  speed:30,  emoji:"🫘",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:10,effect:null},{name:"Harden",energyCost:1,damage:0,effect:"harden"}]},
  { id:12,  name:"Butterfree", type1:"bug",     type2:"flying", tier:"C", cost:5,  hp:60,  speed:70,  emoji:"🦋",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Confusion",energyCost:1,damage:30,effect:null},{name:"Sleep Powder",energyCost:1,damage:0,effect:"sleep"}]},

  // ── #13–15 BUG/POISON ──────────────────────────────────────────────────────
  { id:13,  name:"Weedle",     type1:"bug",     type2:"poison", tier:"C", cost:5,  hp:35,  speed:35,  emoji:"🐝",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Poison Sting",energyCost:1,damage:15,effect:"poison"},{name:"Bite",energyCost:1,damage:20,effect:null}]},
  { id:14,  name:"Kakuna",     type1:"bug",     type2:"poison", tier:"C", cost:5,  hp:45,  speed:35,  emoji:"🥚🐝",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:10,effect:null},{name:"Harden",energyCost:1,damage:0,effect:"harden"}]},
  { id:15,  name:"Beedrill",   type1:"bug",     type2:"poison", tier:"C", cost:5,  hp:65,  speed:75,  emoji:"🐝✨",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Fury Attack",energyCost:1,damage:30,effect:null},{name:"Twineedle",energyCost:2,damage:50,effect:"poison"}]},

  // ── #16–18 NORMAL/FLYING ───────────────────────────────────────────────────
  { id:16,  name:"Pidgey",     type1:"normal",  type2:"flying", tier:"C", cost:5,  hp:40,  speed:56,  emoji:"🐦",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Gust",energyCost:1,damage:20,effect:null},{name:"Quick Attack",energyCost:1,damage:20,effect:null}]},
  { id:17,  name:"Pidgeotto",  type1:"normal",  type2:"flying", tier:"C", cost:5,  hp:63,  speed:71,  emoji:"🦅",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Gust",energyCost:1,damage:30,effect:null},{name:"Wing Attack",energyCost:2,damage:50,effect:null}]},
  { id:18,  name:"Pidgeot",    type1:"normal",  type2:"flying", tier:"C", cost:5,  hp:83,  speed:91,  emoji:"🦅✨",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Air Slash",energyCost:2,damage:55,effect:null},{name:"Hurricane",energyCost:3,damage:80,effect:null}]},

  // ── #19–20 NORMAL ──────────────────────────────────────────────────────────
  { id:19,  name:"Rattata",    type1:"normal",  type2:null,     tier:"C", cost:5,  hp:30,  speed:72,  emoji:"🐭",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Quick Attack",energyCost:1,damage:20,effect:null},{name:"Hyper Fang",energyCost:2,damage:40,effect:null}]},
  { id:20,  name:"Raticate",   type1:"normal",  type2:null,     tier:"C", cost:5,  hp:55,  speed:97,  emoji:"🐀",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Hyper Fang",energyCost:2,damage:55,effect:null},{name:"Super Fang",energyCost:1,damage:0,effect:"superfang"}]},

  // ── #21–22 NORMAL/FLYING ───────────────────────────────────────────────────
  { id:21,  name:"Spearow",    type1:"normal",  type2:"flying", tier:"C", cost:5,  hp:40,  speed:70,  emoji:"🐦‍⬛",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Peck",energyCost:1,damage:20,effect:null},{name:"Drill Peck",energyCost:2,damage:40,effect:null}]},
  { id:22,  name:"Fearow",     type1:"normal",  type2:"flying", tier:"C", cost:5,  hp:65,  speed:100, emoji:"🦆✨",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Drill Peck",energyCost:2,damage:55,effect:null},{name:"Agility",energyCost:1,damage:20,effect:null}]},

  // ── #23–24 POISON ──────────────────────────────────────────────────────────
  { id:23,  name:"Ekans",      type1:"poison",  type2:null,     tier:"C", cost:5,  hp:35,  speed:55,  emoji:"🐍",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Poison Sting",energyCost:1,damage:20,effect:"poison"},{name:"Bite",energyCost:1,damage:25,effect:null}]},
  { id:24,  name:"Arbok",      type1:"poison",  type2:null,     tier:"C", cost:5,  hp:60,  speed:70,  emoji:"🐍✨",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Sludge",energyCost:2,damage:50,effect:"poison"},{name:"Crunch",energyCost:2,damage:55,effect:null}]},

  // ── #25–26 ELECTRIC ────────────────────────────────────────────────────────
  { id:25,  name:"Pikachu",    type1:"electric",type2:null,     tier:"B", cost:12, hp:60,  speed:90,  emoji:"⚡🐭",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Quick Attack",energyCost:1,damage:25,effect:null},{name:"Thunderbolt",energyCost:2,damage:55,effect:"paralysis"}]},
  { id:26,  name:"Raichu",     type1:"electric",type2:null,     tier:"A", cost:20, hp:90,  speed:110, emoji:"⚡🐭✨",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Slam",energyCost:1,damage:35,effect:null},{name:"Thunder",energyCost:2,damage:75,effect:"paralysis"}]},

  // ── #27–28 GROUND ──────────────────────────────────────────────────────────
  { id:27,  name:"Sandshrew",  type1:"ground",  type2:null,     tier:"C", cost:5,  hp:50,  speed:40,  emoji:"🌵",
    weakness:"water",    resistance:"electric",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Slash",energyCost:2,damage:40,effect:null}]},
  { id:28,  name:"Sandslash",  type1:"ground",  type2:null,     tier:"C", cost:5,  hp:80,  speed:65,  emoji:"🌵✨",
    weakness:"water",    resistance:"electric",
    attacks:[{name:"Slash",energyCost:1,damage:40,effect:null},{name:"Earthquake",energyCost:2,damage:60,effect:null}]},

  // ── #29–34 POISON(/GROUND) ─────────────────────────────────────────────────
  { id:29,  name:"Nidoran-F",  type1:"poison",  type2:null,     tier:"C", cost:5,  hp:55,  speed:41,  emoji:"🐇💜",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Poison Sting",energyCost:1,damage:20,effect:"poison"}]},
  { id:30,  name:"Nidorina",   type1:"poison",  type2:null,     tier:"C", cost:5,  hp:70,  speed:56,  emoji:"🐇💜✨",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Bite",energyCost:1,damage:25,effect:null},{name:"Poison Fang",energyCost:2,damage:45,effect:"poison"}]},
  { id:31,  name:"Nidoqueen",  type1:"poison",  type2:"ground", tier:"A", cost:20, hp:110, speed:76,  emoji:"👑🐊",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Body Slam",energyCost:2,damage:60,effect:"paralysis"},{name:"Earthquake",energyCost:3,damage:85,effect:null}]},
  { id:32,  name:"Nidoran-M",  type1:"poison",  type2:null,     tier:"C", cost:5,  hp:46,  speed:50,  emoji:"🐰💜",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Horn Attack",energyCost:1,damage:25,effect:null}]},
  { id:33,  name:"Nidorino",   type1:"poison",  type2:null,     tier:"C", cost:5,  hp:61,  speed:65,  emoji:"🐰💜✨",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Horn Attack",energyCost:1,damage:30,effect:null},{name:"Poison Fang",energyCost:2,damage:45,effect:"poison"}]},
  { id:34,  name:"Nidoking",   type1:"poison",  type2:"ground", tier:"A", cost:20, hp:102, speed:85,  emoji:"👑🦎",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Poison Jab",energyCost:2,damage:65,effect:"poison"},{name:"Earthquake",energyCost:3,damage:90,effect:null}]},

  // ── #35–36 NORMAL ──────────────────────────────────────────────────────────
  { id:35,  name:"Clefairy",   type1:"normal",  type2:null,     tier:"C", cost:5,  hp:70,  speed:35,  emoji:"⭐🌸",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Pound",energyCost:1,damage:20,effect:null},{name:"Metronome",energyCost:2,damage:40,effect:null}]},
  { id:36,  name:"Clefable",   type1:"normal",  type2:null,     tier:"A", cost:20, hp:100, speed:60,  emoji:"⭐🌺",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Moonblast",energyCost:2,damage:65,effect:null},{name:"Metronome",energyCost:1,damage:0,effect:"random"}]},

  // ── #37–38 FIRE ────────────────────────────────────────────────────────────
  { id:37,  name:"Vulpix",     type1:"fire",    type2:null,     tier:"C", cost:5,  hp:38,  speed:65,  emoji:"🦊",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Ember",energyCost:1,damage:20,effect:"burn"},{name:"Quick Attack",energyCost:1,damage:25,effect:null}]},
  { id:38,  name:"Ninetales",  type1:"fire",    type2:null,     tier:"B", cost:12, hp:73,  speed:100, emoji:"🦊✨",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Flamethrower",energyCost:2,damage:60,effect:"burn"},{name:"Fire Spin",energyCost:3,damage:80,effect:"burn"}]},

  // ── #39–40 NORMAL/FAIRY ────────────────────────────────────────────────────
  { id:39,  name:"Jigglypuff", type1:"normal",  type2:"fairy",  tier:"C", cost:5,  hp:115, speed:20,  emoji:"🎤",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Sing",energyCost:1,damage:0,effect:"sleep"},{name:"Body Slam",energyCost:2,damage:35,effect:"paralysis"}]},
  { id:40,  name:"Wigglytuff", type1:"normal",  type2:"fairy",  tier:"A", cost:20, hp:140, speed:45,  emoji:"🎤✨",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Double Slap",energyCost:1,damage:30,effect:null},{name:"Hyper Voice",energyCost:3,damage:80,effect:null}]},

  // ── #41–42 POISON/FLYING ───────────────────────────────────────────────────
  { id:41,  name:"Zubat",      type1:"poison",  type2:"flying", tier:"C", cost:5,  hp:40,  speed:55,  emoji:"🦇",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Leech Life",energyCost:1,damage:20,effect:"leech"},{name:"Poison Fang",energyCost:2,damage:35,effect:"poison"}]},
  { id:42,  name:"Golbat",     type1:"poison",  type2:"flying", tier:"C", cost:5,  hp:75,  speed:90,  emoji:"🦇✨",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Air Cutter",energyCost:2,damage:45,effect:null},{name:"Poison Fang",energyCost:2,damage:55,effect:"poison"}]},

  // ── #43–45 GRASS/POISON ────────────────────────────────────────────────────
  { id:43,  name:"Oddish",     type1:"grass",   type2:"poison", tier:"C", cost:5,  hp:45,  speed:30,  emoji:"🌸",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Absorb",energyCost:1,damage:15,effect:"leech"},{name:"Acid",energyCost:1,damage:20,effect:"poison"}]},
  { id:44,  name:"Gloom",      type1:"grass",   type2:"poison", tier:"C", cost:5,  hp:60,  speed:40,  emoji:"🌼",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Mega Drain",energyCost:2,damage:35,effect:"leech"},{name:"Stun Spore",energyCost:1,damage:0,effect:"paralysis"}]},
  { id:45,  name:"Vileplume",  type1:"grass",   type2:"poison", tier:"A", cost:20, hp:90,  speed:50,  emoji:"🌻",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Petal Dance",energyCost:2,damage:70,effect:null},{name:"Sleep Powder",energyCost:1,damage:0,effect:"sleep"}]},

  // ── #46–49 BUG ─────────────────────────────────────────────────────────────
  { id:46,  name:"Paras",      type1:"bug",     type2:"grass",  tier:"C", cost:5,  hp:35,  speed:25,  emoji:"🍄🦀",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Spore",energyCost:1,damage:0,effect:"sleep"}]},
  { id:47,  name:"Parasect",   type1:"bug",     type2:"grass",  tier:"C", cost:5,  hp:60,  speed:30,  emoji:"🍄🦀✨",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Slash",energyCost:1,damage:30,effect:null},{name:"Spore",energyCost:1,damage:0,effect:"sleep"}]},
  { id:48,  name:"Venonat",    type1:"bug",     type2:"poison", tier:"C", cost:5,  hp:60,  speed:45,  emoji:"🐛👁️",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Confusion",energyCost:1,damage:25,effect:null}]},
  { id:49,  name:"Venomoth",   type1:"bug",     type2:"poison", tier:"C", cost:5,  hp:70,  speed:90,  emoji:"🦋☠️",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Psybeam",energyCost:2,damage:45,effect:"paralysis"},{name:"Stun Spore",energyCost:1,damage:0,effect:"paralysis"}]},

  // ── #50–51 GROUND ──────────────────────────────────────────────────────────
  { id:50,  name:"Diglett",    type1:"ground",  type2:null,     tier:"C", cost:5,  hp:10,  speed:95,  emoji:"🕳️",
    weakness:"water",    resistance:"electric",
    attacks:[{name:"Scratch",energyCost:1,damage:15,effect:null},{name:"Dig",energyCost:2,damage:50,effect:null}]},
  { id:51,  name:"Dugtrio",    type1:"ground",  type2:null,     tier:"C", cost:5,  hp:35,  speed:120, emoji:"🕳️🕳️🕳️",
    weakness:"water",    resistance:"electric",
    attacks:[{name:"Earthquake",energyCost:2,damage:60,effect:null},{name:"Sucker Punch",energyCost:1,damage:30,effect:null}]},

  // ── #52–53 NORMAL ──────────────────────────────────────────────────────────
  { id:52,  name:"Meowth",     type1:"normal",  type2:null,     tier:"C", cost:5,  hp:40,  speed:90,  emoji:"😺",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Pay Day",energyCost:2,damage:35,effect:null}]},
  { id:53,  name:"Persian",    type1:"normal",  type2:null,     tier:"B", cost:12, hp:65,  speed:115, emoji:"😸",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Slash",energyCost:1,damage:40,effect:null},{name:"Hyper Beam",energyCost:3,damage:80,effect:null}]},

  // ── #54–55 WATER ───────────────────────────────────────────────────────────
  { id:54,  name:"Psyduck",    type1:"water",   type2:null,     tier:"C", cost:5,  hp:50,  speed:55,  emoji:"🦆",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Gun",energyCost:1,damage:20,effect:null},{name:"Confusion",energyCost:2,damage:35,effect:"paralysis"}]},
  { id:55,  name:"Golduck",    type1:"water",   type2:null,     tier:"A", cost:20, hp:90,  speed:85,  emoji:"🦆💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Aqua Jet",energyCost:1,damage:35,effect:null},{name:"Hydro Pump",energyCost:3,damage:85,effect:null}]},

  // ── #56–57 FIGHTING ────────────────────────────────────────────────────────
  { id:56,  name:"Mankey",     type1:"fighting",type2:null,     tier:"C", cost:5,  hp:40,  speed:70,  emoji:"🐒",
    weakness:"psychic",  resistance:"dark",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Low Kick",energyCost:1,damage:25,effect:null}]},
  { id:57,  name:"Primeape",   type1:"fighting",type2:null,     tier:"A", cost:20, hp:80,  speed:95,  emoji:"🦍",
    weakness:"psychic",  resistance:"dark",
    attacks:[{name:"Cross Chop",energyCost:2,damage:70,effect:null},{name:"Thrash",energyCost:2,damage:60,effect:null}]},

  // ── #58–59 FIRE ────────────────────────────────────────────────────────────
  { id:58,  name:"Growlithe",  type1:"fire",    type2:null,     tier:"B", cost:12, hp:70,  speed:60,  emoji:"🐕",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Bite",energyCost:1,damage:30,effect:null},{name:"Flamethrower",energyCost:2,damage:55,effect:"burn"}]},
  { id:59,  name:"Arcanine",   type1:"fire",    type2:null,     tier:"A", cost:20, hp:110, speed:95,  emoji:"🔥🐕",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Fire Fang",energyCost:2,damage:65,effect:"burn"},{name:"Extreme Speed",energyCost:3,damage:90,effect:null}]},

  // ── #60–62 WATER(/FIGHTING) ────────────────────────────────────────────────
  { id:60,  name:"Poliwag",    type1:"water",   type2:null,     tier:"C", cost:5,  hp:40,  speed:90,  emoji:"🌀",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Bubble",energyCost:1,damage:20,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:61,  name:"Poliwhirl",  type1:"water",   type2:null,     tier:"B", cost:12, hp:65,  speed:90,  emoji:"🌀💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Bubble Beam",energyCost:2,damage:45,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:62,  name:"Poliwrath",  type1:"water",   type2:"fighting",tier:"A", cost:20, hp:100, speed:70, emoji:"💪🌀",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Submission",energyCost:2,damage:60,effect:"recoil"},{name:"Hydro Pump",energyCost:3,damage:80,effect:null}]},

  // ── #63–65 PSYCHIC ─────────────────────────────────────────────────────────
  { id:63,  name:"Abra",       type1:"psychic", type2:null,     tier:"C", cost:5,  hp:25,  speed:90,  emoji:"🥄",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Teleport",energyCost:1,damage:0,effect:null},{name:"Confusion",energyCost:1,damage:30,effect:null}]},
  { id:64,  name:"Kadabra",    type1:"psychic", type2:null,     tier:"B", cost:12, hp:55,  speed:105, emoji:"🥄✨",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Confusion",energyCost:1,damage:40,effect:null},{name:"Psybeam",energyCost:2,damage:55,effect:"paralysis"}]},
  { id:65,  name:"Alakazam",   type1:"psychic", type2:null,     tier:"S", cost:30, hp:75,  speed:120, emoji:"🔮",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Psybeam",energyCost:2,damage:65,effect:null},{name:"Psychic",energyCost:2,damage:90,effect:"paralysis"}]},

  // ── #66–68 FIGHTING ────────────────────────────────────────────────────────
  { id:66,  name:"Machop",     type1:"fighting",type2:null,     tier:"C", cost:5,  hp:70,  speed:35,  emoji:"💪",
    weakness:"psychic",  resistance:"dark",
    attacks:[{name:"Karate Chop",energyCost:1,damage:25,effect:null},{name:"Low Sweep",energyCost:2,damage:40,effect:null}]},
  { id:67,  name:"Machoke",    type1:"fighting",type2:null,     tier:"B", cost:12, hp:90,  speed:45,  emoji:"💪✨",
    weakness:"psychic",  resistance:"dark",
    attacks:[{name:"Cross Chop",energyCost:2,damage:60,effect:null},{name:"Submission",energyCost:2,damage:55,effect:"recoil"}]},
  { id:68,  name:"Machamp",    type1:"fighting",type2:null,     tier:"S", cost:30, hp:130, speed:55,  emoji:"🏋️",
    weakness:"psychic",  resistance:"dark",
    attacks:[{name:"Dynamic Punch",energyCost:2,damage:80,effect:"paralysis"},{name:"Cross Chop",energyCost:2,damage:90,effect:null}]},

  // ── #69–71 GRASS/POISON ────────────────────────────────────────────────────
  { id:69,  name:"Bellsprout", type1:"grass",   type2:"poison", tier:"C", cost:5,  hp:50,  speed:40,  emoji:"🌱🔔",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Vine Whip",energyCost:1,damage:20,effect:null},{name:"Acid",energyCost:1,damage:20,effect:"poison"}]},
  { id:70,  name:"Weepinbell", type1:"grass",   type2:"poison", tier:"C", cost:5,  hp:65,  speed:55,  emoji:"🔔🌿",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Razor Leaf",energyCost:2,damage:40,effect:null},{name:"Wrap",energyCost:1,damage:20,effect:null}]},
  { id:71,  name:"Victreebel", type1:"grass",   type2:"poison", tier:"A", cost:20, hp:90,  speed:70,  emoji:"🔔🌺",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Leaf Blade",energyCost:2,damage:70,effect:null},{name:"Acid",energyCost:2,damage:55,effect:"poison"}]},

  // ── #72–73 WATER/POISON ────────────────────────────────────────────────────
  { id:72,  name:"Tentacool",  type1:"water",   type2:"poison", tier:"C", cost:5,  hp:40,  speed:70,  emoji:"🪼",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Poison Sting",energyCost:1,damage:20,effect:"poison"},{name:"Water Gun",energyCost:1,damage:20,effect:null}]},
  { id:73,  name:"Tentacruel", type1:"water",   type2:"poison", tier:"A", cost:20, hp:90,  speed:100, emoji:"🪼☠️",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Poison Jab",energyCost:2,damage:60,effect:"poison"},{name:"Surf",energyCost:2,damage:65,effect:null}]},

  // ── #74–76 ROCK/GROUND ─────────────────────────────────────────────────────
  { id:74,  name:"Geodude",    type1:"rock",    type2:"ground", tier:"C", cost:5,  hp:40,  speed:20,  emoji:"🪨",
    weakness:"water",    resistance:"fire",
    attacks:[{name:"Rock Throw",energyCost:1,damage:25,effect:null},{name:"Magnitude",energyCost:2,damage:45,effect:null}]},
  { id:75,  name:"Graveler",   type1:"rock",    type2:"ground", tier:"C", cost:5,  hp:55,  speed:35,  emoji:"🪨✨",
    weakness:"water",    resistance:"fire",
    attacks:[{name:"Rock Slide",energyCost:2,damage:50,effect:null},{name:"Earthquake",energyCost:2,damage:55,effect:null}]},
  { id:76,  name:"Golem",      type1:"rock",    type2:"ground", tier:"A", cost:20, hp:80,  speed:45,  emoji:"🪨💪",
    weakness:"water",    resistance:"fire",
    attacks:[{name:"Rock Blast",energyCost:2,damage:65,effect:null},{name:"Earthquake",energyCost:3,damage:90,effect:null}]},

  // ── #77–78 FIRE ────────────────────────────────────────────────────────────
  { id:77,  name:"Ponyta",     type1:"fire",    type2:null,     tier:"C", cost:5,  hp:50,  speed:90,  emoji:"🐴",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Ember",energyCost:1,damage:25,effect:"burn"},{name:"Stomp",energyCost:2,damage:40,effect:null}]},
  { id:78,  name:"Rapidash",   type1:"fire",    type2:null,     tier:"A", cost:20, hp:90,  speed:105, emoji:"🔥🐴",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Fire Spin",energyCost:2,damage:60,effect:"burn"},{name:"Fury Attack",energyCost:1,damage:35,effect:null}]},

  // ── #79–80 WATER/PSYCHIC ───────────────────────────────────────────────────
  { id:79,  name:"Slowpoke",   type1:"water",   type2:"psychic",tier:"C", cost:5,  hp:90,  speed:15,  emoji:"🐌",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Confusion",energyCost:2,damage:35,effect:null}]},
  { id:80,  name:"Slowbro",    type1:"water",   type2:"psychic",tier:"A", cost:20, hp:110, speed:30,  emoji:"🦦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Amnesia",energyCost:1,damage:0,effect:"heal"},{name:"Psychic",energyCost:2,damage:70,effect:null}]},

  // ── #81–82 ELECTRIC/STEEL ──────────────────────────────────────────────────
  { id:81,  name:"Magnemite",  type1:"electric",type2:"steel",  tier:"C", cost:5,  hp:25,  speed:45,  emoji:"🧲",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"Thunder Wave",energyCost:1,damage:0,effect:"paralysis"}]},
  { id:82,  name:"Magneton",   type1:"electric",type2:"steel",  tier:"B", cost:12, hp:50,  speed:70,  emoji:"🧲🧲",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Thunderbolt",energyCost:2,damage:55,effect:"paralysis"},{name:"Mirror Shot",energyCost:2,damage:50,effect:null}]},

  // ── #83–85 NORMAL/FLYING ───────────────────────────────────────────────────
  { id:83,  name:"Farfetch'd", type1:"normal",  type2:"flying", tier:"C", cost:5,  hp:52,  speed:60,  emoji:"🐦🥬",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Slash",energyCost:1,damage:35,effect:null},{name:"Air Cutter",energyCost:2,damage:45,effect:null}]},
  { id:84,  name:"Doduo",      type1:"normal",  type2:"flying", tier:"C", cost:5,  hp:35,  speed:75,  emoji:"🐦🐦",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Peck",energyCost:1,damage:20,effect:null},{name:"Double Hit",energyCost:2,damage:40,effect:null}]},
  { id:85,  name:"Dodrio",     type1:"normal",  type2:"flying", tier:"B", cost:12, hp:60,  speed:110, emoji:"🐦🐦🐦",
    weakness:"electric", resistance:"grass",
    attacks:[{name:"Drill Peck",energyCost:2,damage:60,effect:null},{name:"Tri Attack",energyCost:2,damage:55,effect:null}]},

  // ── #86–87 WATER/ICE ───────────────────────────────────────────────────────
  { id:86,  name:"Seel",       type1:"water",   type2:null,     tier:"C", cost:5,  hp:65,  speed:45,  emoji:"🦭",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Headbutt",energyCost:1,damage:20,effect:null},{name:"Aurora Beam",energyCost:2,damage:40,effect:null}]},
  { id:87,  name:"Dewgong",    type1:"water",   type2:"ice",    tier:"A", cost:20, hp:100, speed:70,  emoji:"🦭❄️",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Ice Beam",energyCost:2,damage:60,effect:"paralysis"},{name:"Surf",energyCost:2,damage:60,effect:null}]},

  // ── #88–89 POISON ──────────────────────────────────────────────────────────
  { id:88,  name:"Grimer",     type1:"poison",  type2:null,     tier:"C", cost:5,  hp:80,  speed:25,  emoji:"🟢☠️",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Acid",energyCost:1,damage:20,effect:"poison"},{name:"Sludge",energyCost:2,damage:40,effect:"poison"}]},
  { id:89,  name:"Muk",        type1:"poison",  type2:null,     tier:"B", cost:12, hp:105, speed:50,  emoji:"🟢☠️✨",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Sludge Bomb",energyCost:2,damage:65,effect:"poison"},{name:"Gunk Shot",energyCost:3,damage:85,effect:"poison"}]},

  // ── #90–91 WATER/ICE ───────────────────────────────────────────────────────
  { id:90,  name:"Shellder",   type1:"water",   type2:null,     tier:"C", cost:5,  hp:30,  speed:40,  emoji:"🐚",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"Ice Shard",energyCost:1,damage:25,effect:null}]},
  { id:91,  name:"Cloyster",   type1:"water",   type2:"ice",    tier:"A", cost:20, hp:90,  speed:70,  emoji:"🐚❄️",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Spike Cannon",energyCost:2,damage:55,effect:null},{name:"Blizzard",energyCost:3,damage:90,effect:"paralysis"}]},

  // ── #92–94 GHOST/POISON ────────────────────────────────────────────────────
  { id:92,  name:"Gastly",     type1:"ghost",   type2:"poison", tier:"C", cost:5,  hp:30,  speed:80,  emoji:"👻",
    weakness:"psychic",  resistance:"fighting",
    attacks:[{name:"Lick",energyCost:1,damage:20,effect:"paralysis"},{name:"Night Shade",energyCost:2,damage:35,effect:null}]},
  { id:93,  name:"Haunter",    type1:"ghost",   type2:"poison", tier:"A", cost:20, hp:60,  speed:95,  emoji:"👻✨",
    weakness:"psychic",  resistance:"fighting",
    attacks:[{name:"Shadow Ball",energyCost:2,damage:60,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:94,  name:"Gengar",     type1:"ghost",   type2:"poison", tier:"S", cost:30, hp:80,  speed:110, emoji:"😈",
    weakness:"psychic",  resistance:"fighting",
    attacks:[{name:"Shadow Ball",energyCost:2,damage:70,effect:null},{name:"Nightmare",energyCost:2,damage:50,effect:"sleep"}]},

  // ── #95 ROCK/GROUND ────────────────────────────────────────────────────────
  { id:95,  name:"Onix",       type1:"rock",    type2:"ground", tier:"B", cost:12, hp:35,  speed:70,  emoji:"🐉🪨",
    weakness:"water",    resistance:"fire",
    attacks:[{name:"Rock Throw",energyCost:1,damage:30,effect:null},{name:"Iron Tail",energyCost:2,damage:60,effect:null}]},

  // ── #96–97 PSYCHIC ─────────────────────────────────────────────────────────
  { id:96,  name:"Drowzee",    type1:"psychic", type2:null,     tier:"C", cost:5,  hp:60,  speed:42,  emoji:"🌙",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"},{name:"Confusion",energyCost:1,damage:25,effect:null}]},
  { id:97,  name:"Hypno",      type1:"psychic", type2:null,     tier:"A", cost:20, hp:95,  speed:67,  emoji:"🌙✨",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"},{name:"Psychic",energyCost:2,damage:70,effect:null}]},

  // ── #98–99 WATER ───────────────────────────────────────────────────────────
  { id:98,  name:"Krabby",     type1:"water",   type2:null,     tier:"C", cost:5,  hp:30,  speed:50,  emoji:"🦀",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Vice Grip",energyCost:1,damage:25,effect:null},{name:"Bubble Beam",energyCost:2,damage:40,effect:null}]},
  { id:99,  name:"Kingler",    type1:"water",   type2:null,     tier:"B", cost:12, hp:70,  speed:75,  emoji:"🦀💪",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Crabhammer",energyCost:2,damage:75,effect:null},{name:"Vice Grip",energyCost:1,damage:35,effect:null}]},

  // ── #100–101 ELECTRIC ──────────────────────────────────────────────────────
  { id:100, name:"Voltorb",    type1:"electric",type2:null,     tier:"C", cost:5,  hp:40,  speed:100, emoji:"💣",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Tackle",energyCost:1,damage:15,effect:null},{name:"Thunderbolt",energyCost:2,damage:45,effect:"paralysis"}]},
  { id:101, name:"Electrode",  type1:"electric",type2:null,     tier:"B", cost:12, hp:60,  speed:150, emoji:"💥",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Thunderbolt",energyCost:2,damage:60,effect:"paralysis"},{name:"Explosion",energyCost:3,damage:100,effect:"recoil"}]},

  // ── #102–103 GRASS/PSYCHIC ─────────────────────────────────────────────────
  { id:102, name:"Exeggcute",  type1:"grass",   type2:"psychic",tier:"C", cost:5,  hp:60,  speed:40,  emoji:"🥚🥚",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Barrage",energyCost:1,damage:20,effect:null},{name:"Hypnosis",energyCost:1,damage:0,effect:"sleep"}]},
  { id:103, name:"Exeggutor",  type1:"grass",   type2:"psychic",tier:"B", cost:12, hp:95,  speed:55,  emoji:"🌴🥚",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Stomp",energyCost:2,damage:55,effect:null},{name:"Solar Beam",energyCost:3,damage:80,effect:null}]},

  // ── #104–105 GROUND ────────────────────────────────────────────────────────
  { id:104, name:"Cubone",     type1:"ground",  type2:null,     tier:"C", cost:5,  hp:50,  speed:35,  emoji:"💀🦴",
    weakness:"water",    resistance:"electric",
    attacks:[{name:"Bone Club",energyCost:1,damage:25,effect:null},{name:"Headbutt",energyCost:2,damage:40,effect:null}]},
  { id:105, name:"Marowak",    type1:"ground",  type2:null,     tier:"B", cost:12, hp:60,  speed:45,  emoji:"💀🦴✨",
    weakness:"water",    resistance:"electric",
    attacks:[{name:"Bone Rush",energyCost:2,damage:60,effect:null},{name:"Earthquake",energyCost:3,damage:80,effect:null}]},

  // ── #106–107 FIGHTING ──────────────────────────────────────────────────────
  { id:106, name:"Hitmonlee",  type1:"fighting",type2:null,     tier:"A", cost:20, hp:80,  speed:87,  emoji:"🦵",
    weakness:"psychic",  resistance:"dark",
    attacks:[{name:"High Jump Kick",energyCost:2,damage:75,effect:"recoil"},{name:"Blaze Kick",energyCost:2,damage:65,effect:"burn"}]},
  { id:107, name:"Hitmonchan", type1:"fighting",type2:null,     tier:"A", cost:20, hp:80,  speed:76,  emoji:"🥊",
    weakness:"psychic",  resistance:"dark",
    attacks:[{name:"Ice Punch",energyCost:2,damage:55,effect:null},{name:"Thunder Punch",energyCost:2,damage:55,effect:"paralysis"}]},

  // ── #108 NORMAL ────────────────────────────────────────────────────────────
  { id:108, name:"Lickitung",  type1:"normal",  type2:null,     tier:"B", cost:12, hp:90,  speed:30,  emoji:"👅",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Lick",energyCost:1,damage:20,effect:"paralysis"},{name:"Body Slam",energyCost:2,damage:50,effect:"paralysis"}]},

  // ── #109–110 POISON ────────────────────────────────────────────────────────
  { id:109, name:"Koffing",    type1:"poison",  type2:null,     tier:"C", cost:5,  hp:40,  speed:35,  emoji:"☁️☠️",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Smog",energyCost:1,damage:20,effect:"poison"},{name:"Sludge",energyCost:2,damage:40,effect:"poison"}]},
  { id:110, name:"Weezing",    type1:"poison",  type2:null,     tier:"B", cost:12, hp:65,  speed:60,  emoji:"☁️☠️✨",
    weakness:"psychic",  resistance:"grass",
    attacks:[{name:"Sludge Bomb",energyCost:2,damage:60,effect:"poison"},{name:"Explosion",energyCost:3,damage:90,effect:"recoil"}]},

  // ── #111–112 GROUND/ROCK ───────────────────────────────────────────────────
  { id:111, name:"Rhyhorn",    type1:"ground",  type2:"rock",   tier:"C", cost:5,  hp:80,  speed:25,  emoji:"🦏",
    weakness:"water",    resistance:"fire",
    attacks:[{name:"Horn Attack",energyCost:1,damage:25,effect:null},{name:"Stomp",energyCost:2,damage:40,effect:null}]},
  { id:112, name:"Rhydon",     type1:"ground",  type2:"rock",   tier:"B", cost:12, hp:105, speed:40,  emoji:"🦏💪",
    weakness:"water",    resistance:"fire",
    attacks:[{name:"Drill Run",energyCost:2,damage:70,effect:null},{name:"Stone Edge",energyCost:3,damage:90,effect:null}]},

  // ── #113 NORMAL ────────────────────────────────────────────────────────────
  { id:113, name:"Chansey",    type1:"normal",  type2:null,     tier:"B", cost:12, hp:250, speed:50,  emoji:"🥚💕",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Egg Bomb",energyCost:2,damage:50,effect:null},{name:"Softboiled",energyCost:1,damage:0,effect:"heal"}]},

  // ── #114 GRASS ─────────────────────────────────────────────────────────────
  { id:114, name:"Tangela",    type1:"grass",   type2:null,     tier:"C", cost:5,  hp:65,  speed:60,  emoji:"🪸",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Constrict",energyCost:1,damage:20,effect:null},{name:"Mega Drain",energyCost:2,damage:40,effect:"leech"}]},

  // ── #115 NORMAL ────────────────────────────────────────────────────────────
  { id:115, name:"Kangaskhan", type1:"normal",  type2:null,     tier:"A", cost:20, hp:120, speed:90,  emoji:"🦘",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Comet Punch",energyCost:1,damage:40,effect:null},{name:"Outrage",energyCost:3,damage:85,effect:null}]},

  // ── #116–117 WATER ─────────────────────────────────────────────────────────
  { id:116, name:"Horsea",     type1:"water",   type2:null,     tier:"C", cost:5,  hp:30,  speed:60,  emoji:"🐟",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Gun",energyCost:1,damage:20,effect:null},{name:"Smokescreen",energyCost:1,damage:10,effect:null}]},
  { id:117, name:"Seadra",     type1:"water",   type2:null,     tier:"B", cost:12, hp:65,  speed:85,  emoji:"🐠",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Pulse",energyCost:2,damage:55,effect:null},{name:"Dragon Rage",energyCost:2,damage:50,effect:null}]},

  // ── #118–119 WATER ─────────────────────────────────────────────────────────
  { id:118, name:"Goldeen",    type1:"water",   type2:null,     tier:"C", cost:5,  hp:45,  speed:63,  emoji:"🐡",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Horn Attack",energyCost:1,damage:25,effect:null},{name:"Waterfall",energyCost:2,damage:45,effect:null}]},
  { id:119, name:"Seaking",    type1:"water",   type2:null,     tier:"B", cost:12, hp:80,  speed:68,  emoji:"🐡💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Megahorn",energyCost:2,damage:65,effect:null},{name:"Waterfall",energyCost:2,damage:55,effect:null}]},

  // ── #120–121 WATER(/PSYCHIC) ───────────────────────────────────────────────
  { id:120, name:"Staryu",     type1:"water",   type2:null,     tier:"C", cost:5,  hp:30,  speed:85,  emoji:"⭐💧",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Water Gun",energyCost:2,damage:40,effect:null}]},
  { id:121, name:"Starmie",    type1:"water",   type2:"psychic",tier:"A", cost:20, hp:85,  speed:115, emoji:"⭐",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Psychic",energyCost:2,damage:65,effect:null},{name:"Hydro Pump",energyCost:3,damage:85,effect:null}]},

  // ── #122 PSYCHIC ───────────────────────────────────────────────────────────
  { id:122, name:"Mr. Mime",   type1:"psychic", type2:null,     tier:"B", cost:12, hp:65,  speed:90,  emoji:"🤡",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Confusion",energyCost:1,damage:35,effect:null},{name:"Psychic",energyCost:2,damage:60,effect:null}]},

  // ── #123 BUG/FLYING ────────────────────────────────────────────────────────
  { id:123, name:"Scyther",    type1:"bug",     type2:"flying", tier:"A", cost:20, hp:95,  speed:105, emoji:"🦗",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Slash",energyCost:1,damage:45,effect:null},{name:"Air Slash",energyCost:2,damage:70,effect:null}]},

  // ── #124 PSYCHIC/ICE ───────────────────────────────────────────────────────
  { id:124, name:"Jynx",       type1:"psychic", type2:"ice",    tier:"C", cost:5,  hp:65,  speed:95,  emoji:"💋",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Lovely Kiss",energyCost:1,damage:0,effect:"sleep"},{name:"Ice Punch",energyCost:2,damage:50,effect:null}]},

  // ── #125 ELECTRIC ──────────────────────────────────────────────────────────
  { id:125, name:"Electabuzz", type1:"electric",type2:null,     tier:"A", cost:20, hp:95,  speed:105, emoji:"⚡👊",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Thunder Punch",energyCost:2,damage:65,effect:"paralysis"},{name:"Thunder",energyCost:3,damage:80,effect:"paralysis"}]},

  // ── #126 FIRE ──────────────────────────────────────────────────────────────
  { id:126, name:"Magmar",     type1:"fire",    type2:null,     tier:"A", cost:20, hp:95,  speed:93,  emoji:"🌋",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Fire Punch",energyCost:2,damage:65,effect:"burn"},{name:"Flamethrower",energyCost:2,damage:75,effect:"burn"}]},

  // ── #127 BUG ───────────────────────────────────────────────────────────────
  { id:127, name:"Pinsir",     type1:"bug",     type2:null,     tier:"A", cost:20, hp:95,  speed:85,  emoji:"🦂",
    weakness:"fire",     resistance:"grass",
    attacks:[{name:"Vice Grip",energyCost:1,damage:40,effect:null},{name:"X-Scissor",energyCost:2,damage:75,effect:null}]},

  // ── #128 NORMAL ────────────────────────────────────────────────────────────
  { id:128, name:"Tauros",     type1:"normal",  type2:null,     tier:"A", cost:20, hp:90,  speed:110, emoji:"🐂",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Tackle",energyCost:1,damage:35,effect:null},{name:"Take Down",energyCost:2,damage:70,effect:"recoil"}]},

  // ── #129–131 WATER ─────────────────────────────────────────────────────────
  { id:129, name:"Magikarp",   type1:"water",   type2:null,     tier:"C", cost:5,  hp:20,  speed:80,  emoji:"🐟✨",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Splash",energyCost:1,damage:0,effect:"splash"},{name:"Flail",energyCost:1,damage:10,effect:null}]},
  { id:130, name:"Gyarados",   type1:"water",   type2:"flying", tier:"A", cost:20, hp:130, speed:81,  emoji:"🐉💦",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Thrash",energyCost:2,damage:70,effect:null},{name:"Hyper Beam",energyCost:3,damage:110,effect:null}]},
  { id:131, name:"Lapras",     type1:"water",   type2:"ice",    tier:"A", cost:20, hp:130, speed:60,  emoji:"🦕",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Ice Beam",energyCost:2,damage:65,effect:null},{name:"Surf",energyCost:2,damage:65,effect:null}]},

  // ── #132–137 NORMAL ────────────────────────────────────────────────────────
  { id:132, name:"Ditto",      type1:"normal",  type2:null,     tier:"C", cost:5,  hp:48,  speed:48,  emoji:"🟣",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Transform",energyCost:1,damage:0,effect:"transform"},{name:"Pound",energyCost:1,damage:20,effect:null}]},
  { id:133, name:"Eevee",      type1:"normal",  type2:null,     tier:"C", cost:5,  hp:55,  speed:55,  emoji:"🦊✨",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Growl",energyCost:1,damage:0,effect:null}]},
  { id:134, name:"Vaporeon",   type1:"water",   type2:null,     tier:"A", cost:20, hp:130, speed:65,  emoji:"💧✨",
    weakness:"electric", resistance:"fire",
    attacks:[{name:"Water Pulse",energyCost:2,damage:55,effect:null},{name:"Hydro Pump",energyCost:3,damage:90,effect:null}]},
  { id:135, name:"Jolteon",    type1:"electric",type2:null,     tier:"A", cost:20, hp:80,  speed:130, emoji:"⚡✨",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Quick Attack",energyCost:1,damage:35,effect:null},{name:"Thunder",energyCost:2,damage:75,effect:"paralysis"}]},
  { id:136, name:"Flareon",    type1:"fire",    type2:null,     tier:"A", cost:20, hp:90,  speed:65,  emoji:"🔥✨",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Fire Spin",energyCost:2,damage:65,effect:"burn"},{name:"Flare Blitz",energyCost:3,damage:95,effect:"recoil"}]},
  { id:137, name:"Porygon",    type1:"normal",  type2:null,     tier:"C", cost:5,  hp:65,  speed:40,  emoji:"💾",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Tackle",energyCost:1,damage:20,effect:null},{name:"Tri Attack",energyCost:2,damage:45,effect:null}]},

  // ── #138–141 ROCK/WATER ────────────────────────────────────────────────────
  { id:138, name:"Omanyte",    type1:"rock",    type2:"water",  tier:"C", cost:5,  hp:35,  speed:35,  emoji:"🐚🪨",
    weakness:"grass",    resistance:"fire",
    attacks:[{name:"Water Gun",energyCost:1,damage:20,effect:null},{name:"Rock Blast",energyCost:2,damage:35,effect:null}]},
  { id:139, name:"Omastar",    type1:"rock",    type2:"water",  tier:"C", cost:5,  hp:70,  speed:55,  emoji:"🐚🪨✨",
    weakness:"grass",    resistance:"fire",
    attacks:[{name:"Spike Cannon",energyCost:2,damage:55,effect:null},{name:"Hydro Pump",energyCost:3,damage:75,effect:null}]},
  { id:140, name:"Kabuto",     type1:"rock",    type2:"water",  tier:"C", cost:5,  hp:30,  speed:55,  emoji:"🦀🪨",
    weakness:"grass",    resistance:"fire",
    attacks:[{name:"Scratch",energyCost:1,damage:20,effect:null},{name:"Aqua Jet",energyCost:1,damage:30,effect:null}]},
  { id:141, name:"Kabutops",   type1:"rock",    type2:"water",  tier:"C", cost:5,  hp:60,  speed:80,  emoji:"🦀🪨✨",
    weakness:"grass",    resistance:"fire",
    attacks:[{name:"Slash",energyCost:1,damage:40,effect:null},{name:"Aqua Jet",energyCost:2,damage:60,effect:null}]},

  // ── #142 ROCK/FLYING ───────────────────────────────────────────────────────
  { id:142, name:"Aerodactyl", type1:"rock",    type2:"flying", tier:"S", cost:30, hp:80,  speed:130, emoji:"🦅🪨",
    weakness:"water",    resistance:"fire",
    attacks:[{name:"Rock Slide",energyCost:2,damage:70,effect:null},{name:"Ancient Power",energyCost:3,damage:100,effect:null}]},

  // ── #143 NORMAL ────────────────────────────────────────────────────────────
  { id:143, name:"Snorlax",    type1:"normal",  type2:null,     tier:"A", cost:20, hp:160, speed:30,  emoji:"😴",
    weakness:"fighting", resistance:null,
    attacks:[{name:"Body Slam",energyCost:2,damage:60,effect:"paralysis"},{name:"Heavy Slam",energyCost:3,damage:90,effect:null}]},

  // ── #144–146 ICE/FIRE/ELECTRIC LEGENDARIES ─────────────────────────────────
  { id:144, name:"Articuno",   type1:"ice",     type2:"flying", tier:"S", cost:30, hp:130, speed:85,  emoji:"🧊🦅",
    weakness:"fire",     resistance:"water",
    attacks:[{name:"Ice Beam",energyCost:2,damage:70,effect:null},{name:"Blizzard",energyCost:3,damage:110,effect:"paralysis"}]},
  { id:145, name:"Zapdos",     type1:"electric",type2:"flying", tier:"S", cost:30, hp:130, speed:100, emoji:"⚡🦅",
    weakness:"ground",   resistance:"electric",
    attacks:[{name:"Thunderbolt",energyCost:2,damage:75,effect:"paralysis"},{name:"Thunder",energyCost:3,damage:110,effect:"paralysis"}]},
  { id:146, name:"Moltres",    type1:"fire",    type2:"flying", tier:"S", cost:30, hp:130, speed:90,  emoji:"🔥🦅",
    weakness:"water",    resistance:"grass",
    attacks:[{name:"Flamethrower",energyCost:2,damage:75,effect:"burn"},{name:"Sky Attack",energyCost:3,damage:110,effect:null}]},

  // ── #147–149 DRAGON ────────────────────────────────────────────────────────
  { id:147, name:"Dratini",    type1:"dragon",  type2:null,     tier:"C", cost:5,  hp:41,  speed:50,  emoji:"🐍",
    weakness:"ice",      resistance:"fire",
    attacks:[{name:"Wrap",energyCost:1,damage:20,effect:null},{name:"Dragon Rage",energyCost:2,damage:40,effect:null}]},
  { id:148, name:"Dragonair",  type1:"dragon",  type2:null,     tier:"B", cost:12, hp:61,  speed:70,  emoji:"🐉✨",
    weakness:"ice",      resistance:"fire",
    attacks:[{name:"Dragon Rage",energyCost:2,damage:50,effect:null},{name:"Thunder Wave",energyCost:1,damage:0,effect:"paralysis"}]},
  { id:149, name:"Dragonite",  type1:"dragon",  type2:"flying", tier:"S", cost:30, hp:134, speed:80,  emoji:"🐲",
    weakness:"ice",      resistance:"grass",
    attacks:[{name:"Dragon Claw",energyCost:2,damage:80,effect:null},{name:"Hyper Beam",energyCost:3,damage:120,effect:null}]},

  // ── #150–151 PSYCHIC LEGENDARIES ───────────────────────────────────────────
  { id:150, name:"Mewtwo",     type1:"psychic", type2:null,     tier:"S", cost:30, hp:130, speed:130, emoji:"👾",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Psywave",energyCost:1,damage:40,effect:null},{name:"Psychic",energyCost:2,damage:90,effect:"paralysis"}]},
  { id:151, name:"Mew",        type1:"psychic", type2:null,     tier:"S", cost:30, hp:100, speed:100, emoji:"🌟",
    weakness:"dark",     resistance:"fighting",
    attacks:[{name:"Ancient Power",energyCost:2,damage:60,effect:null},{name:"Psychic",energyCost:2,damage:80,effect:"paralysis"}]},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
window.getPokemonById = function(id) {
  return window.KANTO_POKEMON.find(p => p.id === id) || null;
};

window.getPokemonByName = function(name) {
  return window.KANTO_POKEMON.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
};

window.filterByTier = function(tier) {
  return window.KANTO_POKEMON.filter(p => p.tier === tier);
};

window.filterByType = function(type) {
  return window.KANTO_POKEMON.filter(p => p.type1 === type || p.type2 === type);
};
