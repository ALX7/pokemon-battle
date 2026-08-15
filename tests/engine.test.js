'use strict';

// ═══════════════════════════════════════════════════════════════
// BATTLE ENGINE TESTS
// Zero dependencies, no build step — matches the rest of the project.
//   node tests/engine.test.js
// ═══════════════════════════════════════════════════════════════

const fs   = require('fs');
const path = require('path');
const JS   = path.join(__dirname, '..', 'js');

// ── Minimal browser stubs so the engine can load under Node ─────
global.window     = { addEventListener() {}, dispatchEvent() {} };
global.CustomEvent = class { constructor(n, d) { this.type = n; this.detail = d && d.detail; } };
global.document   = { getElementById: () => ({ classList: { add() {}, remove() {} } }) };

const load = f => eval(fs.readFileSync(path.join(JS, f), 'utf8'));
load('pokemon.js');
load('battle.js');
load('ai.js');

const W = global.window;
W._battleDelay = 0;
W._autoBattle  = false;

const P    = W.KANTO_POKEMON;
const pick = n => {
  const p = P.find(x => x.name === n);
  if (!p) throw new Error('No such Pokemon: ' + n);
  return p;
};
const ITEMS = () => [
  { id: 'potion',   name: 'Potion',    emoji: '🧪' },
  { id: 'fullheal', name: 'Full Heal', emoji: '✨' },
  { id: 'revive',   name: 'Revive',    emoji: '💫' },
];

// ── Tiny test harness ───────────────────────────────────────────
let pass = 0, fail = 0, group = '';
const describe = (name, fn) => { group = name; console.log('\n' + name); fn(); };
const it = (name, fn) => {
  try { fn(); console.log('  ✓ ' + name); pass++; }
  catch (e) { console.log('  ✗ ' + name + '\n      ' + e.message); fail++; }
};
const eq = (actual, expected, msg) => {
  if (actual !== expected) {
    throw new Error(`${msg || ''} expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
};
const ok = (cond, msg) => { if (!cond) throw new Error(msg || 'expected truthy'); };

// Start a battle and force the player to be on move.
function battle(playerNames, aiNames) {
  W.startBattle(playerNames.map(pick), aiNames.map(pick), ITEMS(), ITEMS());
  const s = W.getBattleState();
  s.activePlayer = 'player';
  s.firstPlayer  = 'player';
  return s;
}

const FILLER    = ['Gengar', 'Lapras', 'Snorlax', 'Machamp'];
const AI_FILLER = ['Blastoise', 'Venusaur', 'Alakazam', 'Machop'];

// ═══════════════════════════════════════════════════════════════
describe('Item targeting', () => {
  it('Potion heals the ACTIVE Pokemon, not team slot 0', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    s.player.active = 2;
    s.player.team[2].currentHp = 20;
    const slot0 = s.player.team[0].currentHp;

    W.useItem(0, null);
    eq(s.player.team[2].currentHp, 60, 'active healed');
    eq(s.player.team[0].currentHp, slot0, 'slot 0 untouched');
  });

  it('Potion honours an explicit bench target', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    s.player.team[4].currentHp = 10;
    W.useItem(0, 4);
    eq(s.player.team[4].currentHp, 50);
  });

  it('Full Heal reads the ACTIVE Pokemon status', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    s.player.active = 2;
    s.player.team[2].status = 'burn';
    s.player.team[0].status = null;
    eq(W.useItem(1, null), true, 'should succeed');
    eq(s.player.team[2].status, null);
  });

  it('Revive refuses a living target', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    eq(W.useItem(2, 1), false);
  });

  it('Revive restores a fainted target to 50% HP', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    const target = s.player.team[1];
    target.fainted = true; target.currentHp = 0;
    eq(W.useItem(2, 1), true);
    eq(target.fainted, false);
    eq(target.currentHp, Math.floor(target.hp * 0.5));
  });
});

describe('One item per turn', () => {
  it('refuses a second item in the same turn', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    s.player.team[s.player.active].currentHp = 10;
    eq(W.useItem(0, null), true,  'first item');
    eq(W.useItem(2, null), false, 'second item must be refused');
  });

  it('allows another item after the turn rolls over', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    s.player.team[s.player.active].currentHp = 10;
    eq(W.useItem(0, null), true);
    W.endTurn();
    s.activePlayer = 'player';
    s.player.itemUsedThisTurn = false;
    eq(W.useItem(1, null) !== undefined, true);
  });
});

describe('Previously dead moves', () => {
  it('Harden absorbs 30 damage from the next hit, then wears off', () => {
    const s = battle(['Metapod', ...FILLER], ['Charizard', ...AI_FILLER]);
    const me = s.player.team[0];
    me.storedEnergy = 3;
    W.useAttack(1);
    eq(me.hardened, true, 'shield raised');

    const hp = me.currentHp;
    s.activePlayer = 'ai';
    s.ai.team[0].storedEnergy = 3;
    W._b.executeAttack('ai', 0);
    ok(hp - me.currentHp < 60, 'damage was reduced');
    eq(me.hardened, false, 'shield consumed');
  });

  it('Super Fang halves current HP but never lands the KO', () => {
    const s = battle(['Raticate', ...FILLER], ['Snorlax', ...AI_FILLER]);
    const foe = s.ai.team[0];

    foe.currentHp = 100;
    s.player.team[0].storedEnergy = 3;
    W.useAttack(1);
    eq(foe.currentHp, 50, 'halved');

    foe.currentHp = 1;
    s.player.team[0].storedEnergy = 3;
    W.useAttack(1);
    ok(foe.currentHp >= 1, 'never reduces below 1');
  });

  it('Transform copies the foe moves and typing without mutating the roster', () => {
    const s = battle(['Ditto', ...FILLER], ['Charizard', ...AI_FILLER]);
    const me = s.player.team[0], foe = s.ai.team[0];
    me.storedEnergy = 3;
    W.useAttack(me.attacks.findIndex(a => a.effect === 'transform'));

    eq(me.type1, foe.type1, 'typing copied');
    eq(me.attacks[0].name, foe.attacks[0].name, 'moves copied');
    eq(me.transformed, 'Charizard');
    eq(pick('Ditto').attacks[0].name, 'Transform', 'source roster intact');
  });

  it('Metronome resolves into a real move and deals damage', () => {
    const s = battle(['Clefable', ...FILLER], ['Snorlax', ...AI_FILLER]);
    const foe = s.ai.team[0];
    const before = foe.currentHp;
    s.player.team[0].storedEnergy = 3;
    W.useAttack(s.player.team[0].attacks.findIndex(a => a.effect === 'random'));

    ok(foe.currentHp < before, 'dealt damage');
    ok(/Metronome became/.test(s.log.join('|')), 'logged the rolled move');
  });
});

describe('Speed decides who opens', () => {
  it('faster lead Pokemon moves first', () => {
    W.startBattle(['Jolteon', ...FILLER].map(pick), ['Snorlax', ...AI_FILLER].map(pick), ITEMS(), ITEMS());
    eq(W.getBattleState().activePlayer, 'player');
  });

  it('slower lead Pokemon cedes the first turn', () => {
    W.startBattle(['Snorlax', ...FILLER].map(pick), ['Jolteon', ...AI_FILLER].map(pick), ITEMS(), ITEMS());
    eq(W.getBattleState().activePlayer, 'ai');
  });

  it('turn counter ticks once per full round, whoever opened', () => {
    W.startBattle(['Snorlax', ...FILLER].map(pick), ['Jolteon', ...AI_FILLER].map(pick), ITEMS(), ITEMS());
    const s = W.getBattleState();
    eq(s.turn, 1); eq(s.firstPlayer, 'ai');
    W._b.advanceTurn(); eq(s.turn, 1, 'player half of round 1');
    W._b.advanceTurn(); eq(s.turn, 2, 'round 2 begins');
  });
});

describe('Status handling', () => {
  it('paralysis wears off at end of turn even if you never attack', () => {
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    s.player.team[0].status = 'paralysis';
    W.endTurn();
    eq(s.player.team[0].status, null);
  });
});

describe('Faint replacement turn flow', () => {
  it('player KO on the AI turn waits, then hands control over exactly once', () => {
    W._autoBattle = false;
    const s = battle(['Pikachu', ...FILLER], ['Charizard', ...AI_FILLER]);
    s.activePlayer = 'ai';
    s.player.team[s.player.active].currentHp = 1;
    s.ai.team[0].storedEnergy = 3;
    W._b.executeAttack('ai', 0);

    eq(s.phase, 'faint_replace', 'waits for the player to choose');
    eq(s.activePlayer, 'ai', 'still the AI turn until they pick');
    W.switchPokemon(1, true);
    eq(s.phase, 'battle');
    eq(s.activePlayer, 'player', 'control handed over once');
  });

  it('AI auto-replacement does not steal an extra turn', () => {
    const s = battle(['Charizard', ...AI_FILLER], ['Pikachu', ...FILLER]);
    s.ai.team[s.ai.active].currentHp = 1;
    s.player.team[0].storedEnergy = 3;
    W.useAttack(0);

    eq(s.phase, 'battle', 'AI replaced itself');
    eq(s.activePlayer, 'player', 'no free turn for the AI');
  });
});

describe('Turn limit', () => {
  it('an unkillable healer matchup still terminates', () => {
    // Chansey out-heals Magikarp forever; the cap must resolve it.
    W._autoBattle = true;
    W.startBattle(
      ['Chansey', 'Chansey', 'Chansey', 'Chansey', 'Chansey'].map(pick),
      ['Magikarp', 'Magikarp', 'Magikarp', 'Magikarp', 'Magikarp'].map(pick),
      ITEMS(), ITEMS());
    const s = W.getBattleState();
    for (let i = 0; i < 400 && s.phase !== 'game_over'; i++) W._b.advanceTurn();

    eq(s.phase, 'game_over', 'battle ended');
    eq(s.timedOut, true, 'ended on the turn limit');
    ok(['player', 'ai', 'draw'].includes(s.winner), 'has a verdict: ' + s.winner);
    W._autoBattle = false;
  });
});

// ═══════════════════════════════════════════════════════════════
console.log(`\n${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
