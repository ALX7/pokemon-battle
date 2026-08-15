'use strict';

// ═══════════════════════════════════════════════════════════════
// BATTLE ENGINE
// ═══════════════════════════════════════════════════════════════

const MAX_ENERGY = 5;

// Hard cap on battle length. Healing moves (Softboiled, Amnesia) restore more
// per turn than a weak attacker can remove, so some matchups never resolve on
// their own. At the cap the winner is decided on total remaining HP.
const MAX_TURNS = 50;

// Status icons for log messages
const STATUS_ICON = {
  burn:      '🔥',
  paralysis: '⚡',
  sleep:     '💤',
  poison:    '☠️',
  leech:     '🌿',
};

// ── Pokemon init ────────────────────────────────────────────────
function initPokemon(p) {
  return Object.assign({}, p, {
    // Deep-copy attacks so Transform can rewrite them without mutating the roster
    attacks:      p.attacks.map(a => Object.assign({}, a)),
    currentHp:    p.hp,
    storedEnergy: 0,
    status:       null,
    statusTurns:  0,
    fainted:      false,
    hardened:     false,   // Harden: reduces the next incoming hit
    transformed:  null,    // Transform: name of the copied Pokemon
  });
}

// ── BattleState ─────────────────────────────────────────────────
// Exposed as window.BattleState so ui.js can read it directly.
// Always access via getBattleState() internally to avoid stale refs.
let _state = null;
let _turnLogStart = 0;
window.getBattleState = () => _state;

// ── Boot ────────────────────────────────────────────────────────
window.startBattle = function(playerTeam, aiTeam, playerItems, aiItems) {
  _state = {
    player: {
      team:             playerTeam.map(initPokemon),
      active:           0,
      items:            playerItems.map(i => Object.assign({}, i, { used: false })),
      xAttackPending:   false,
      switchedThisTurn: false,
      itemUsedThisTurn: false,
    },
    ai: {
      team:             aiTeam.map(initPokemon),
      active:           0,
      items:            aiItems.map(i => Object.assign({}, i, { used: false })),
      xAttackPending:   false,
      switchedThisTurn: false,
      itemUsedThisTurn: false,
    },
    turn:                       1,
    activePlayer:               'player',
    // 'battle' | 'faint_replace' | 'game_over'
    phase:                      'battle',
    winner:                     null,
    // After a faint-replace chosen during the AI's turn, we advance
    // to the player's turn instead of resuming mid-AI-turn.
    faintReplacePendingAdvance: false,
    log:                        [],
  };

  // Speed decides who moves first: faster lead Pokemon opens the battle.
  const pLead = _state.player.team[0];
  const aLead = _state.ai.team[0];
  const tie   = pLead.speed === aLead.speed;
  _state.activePlayer = tie
    ? (Math.random() < 0.5 ? 'player' : 'ai')
    : (pLead.speed > aLead.speed ? 'player' : 'ai');

  // The turn counter ticks over each time control returns to whoever opened.
  _state.firstPlayer = _state.activePlayer;

  window.BattleState = _state;
  _turnLogStart = 0;

  document.getElementById('draft-screen').classList.remove('active');
  document.getElementById('battle-screen').classList.add('active');

  addLog('⚔️ Battle begins!');
  if (tie) {
    addLog(`⚡ Speed tie (${pLead.speed}) — ${_state.activePlayer === 'player' ? 'you win' : 'AI wins'} the coin flip!`);
  } else {
    const fast = _state.activePlayer === 'player' ? pLead : aLead;
    const slow = _state.activePlayer === 'player' ? aLead : pLead;
    addLog(`⚡ ${fast.emoji} ${fast.name} (SPD ${fast.speed}) outspeeds ${slow.name} (SPD ${slow.speed}) — ${_state.activePlayer === 'player' ? 'you go' : 'AI goes'} first!`);
  }

  startTurn();
  safeRender();

  // If the AI won the speed roll it opens the battle.
  if (_state.activePlayer === 'ai') {
    setTimeout(() => window.aiTakeTurn?.(), window._battleDelay ?? 700);
  }
};

// ── Helpers ─────────────────────────────────────────────────────
function side(who)     { return _state[who]; }
function active(who)   { const s = side(who); return s.team[s.active]; }
function opponent(who) { return who === 'player' ? 'ai' : 'player'; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function addLog(msg) {
  _state.log.push(msg);
  if (_state.log.length > 60) _state.log.shift();
}

function safeRender() {
  if (typeof window.renderBattle === 'function') window.renderBattle();
}

// ═══════════════════════════════════════════════════════════════
// TURN PHASES
// ═══════════════════════════════════════════════════════════════

// Called at the start of each side's turn.
function startTurn() {
  const who = _state.activePlayer;
  const mon = active(who);

  side(who).switchedThisTurn = false;
  side(who).itemUsedThisTurn = false;

  // 1. Energy +1
  mon.storedEnergy = clamp(mon.storedEnergy + 1, 0, MAX_ENERGY);
  addLog(`Turn ${_state.turn} — ${mon.emoji} ${mon.name} gains energy (${mon.storedEnergy}/${MAX_ENERGY})`);
  window.dispatchEvent(new CustomEvent('b:energy', { detail: { who } }));

  // 2. Sleep wake check
  if (mon.status === 'sleep') {
    if (Math.random() < 0.5) {
      mon.status = null;
      addLog(`💤 ${mon.name} woke up!`);
    } else {
      addLog(`💤 ${mon.name} is fast asleep…`);
    }
  }

  // 3. Status damage ticks
  applyStatusTick(who);
}

function applyStatusTick(who) {
  const mon = active(who);
  if (!mon.status) return;

  if (mon.status === 'burn') {
    const dmg = 20;
    mon.currentHp = Math.max(0, mon.currentHp - dmg);
    addLog(`🔥 ${mon.name} is hurt by burn! (−${dmg} HP)`);
    checkFaint(who);

  } else if (mon.status === 'poison') {
    const dmg = 10;
    mon.currentHp = Math.max(0, mon.currentHp - dmg);
    addLog(`☠️ ${mon.name} is hurt by poison! (−${dmg} HP)`);
    checkFaint(who);

  } else if (mon.status === 'leech') {
    const leechDmg  = 20;
    const leechHeal = 10;
    const opp       = active(opponent(who));
    mon.currentHp   = Math.max(0, mon.currentHp - leechDmg);
    opp.currentHp   = Math.min(opp.hp, opp.currentHp + leechHeal);
    addLog(`🌿 ${mon.name} is drained! (−${leechDmg} HP → ${opp.name} +${leechHeal} HP)`);
    checkFaint(who);
  }
}

// ═══════════════════════════════════════════════════════════════
// ATTACK
// ═══════════════════════════════════════════════════════════════

// Public — called by UI for the player.
window.useAttack = function(attackIndex) {
  if (_state.phase !== 'battle')          return false;
  if (_state.activePlayer !== 'player')   return false;
  const ok = executeAttack('player', attackIndex);
  if (ok) safeRender();
  return ok;
};

function executeAttack(who, attackIndex) {
  const attacker = active(who);
  const opp      = opponent(who);
  const defender = active(opp);
  const atk      = attacker.attacks[attackIndex];

  if (!atk) return false;

  // Paralysis: skip attack and clear
  if (attacker.status === 'paralysis') {
    attacker.status = null;
    addLog(`⚡ ${attacker.name} is paralyzed and can't move! (status cleared)`);
    return true;
  }

  // Sleep: cannot attack (wake is handled in startTurn)
  if (attacker.status === 'sleep') {
    addLog(`💤 ${attacker.name} is asleep and can't attack!`);
    return false;
  }

  // Energy check
  if (attacker.storedEnergy < atk.energyCost) {
    if (who === 'player') addLog(`Not enough energy for ${atk.name}! (need ${atk.energyCost})`);
    return false;
  }

  attacker.storedEnergy -= atk.energyCost;

  // Damage calculation
  let dmg = atk.damage;

  if (dmg > 0) {
    if (defender.weakness === attacker.type1)   dmg = dmg * 2;
    if (defender.resistance === attacker.type1) dmg = Math.max(10, Math.floor(dmg * 0.5));

    // X Attack bonus
    if (side(who).xAttackPending) {
      dmg += 20;
      side(who).xAttackPending = false;
      addLog(`⚔️ X Attack! +20 bonus damage`);
    }

    // Harden: soaks the next incoming hit, then wears off
    if (defender.hardened) {
      const before = dmg;
      dmg = Math.max(10, dmg - 30);
      defender.hardened = false;
      addLog(`🛡️ ${defender.name} braced itself! (−${before - dmg} damage)`);
    }

    defender.currentHp = Math.max(0, defender.currentHp - dmg);
    window.dispatchEvent(new CustomEvent('b:hit', { detail: { who: opp } }));
    const badge = defender.weakness === attacker.type1 ? ' (super effective!)' : '';
    addLog(`${attacker.emoji} ${attacker.name} used ${atk.name}! ${defender.name} −${dmg} HP${badge}`);
  } else {
    addLog(`${attacker.emoji} ${attacker.name} used ${atk.name}!`);
  }

  // Effect
  applyEffect(atk.effect, who, opp, attacker, defender, dmg);

  // Faint check on defender
  checkFaint(opp);

  return true;
}

// Effect application — status effects have a 30% chance to proc on-hit.
function applyEffect(effect, atkWho, defWho, attacker, defender, dmg) {
  if (!effect) return;

  switch (effect) {

    case 'burn':
    case 'paralysis':
    case 'sleep':
    case 'poison':
      if (!defender.status && !defender.fainted && Math.random() < 0.30) {
        defender.status = effect;
        addLog(`${STATUS_ICON[effect]} ${defender.name} is now ${effect}!`);
        window.dispatchEvent(new CustomEvent('b:status', { detail: { who: defWho } }));
      }
      break;

    case 'leech':
      if (!defender.status && !defender.fainted) {
        defender.status = 'leech';
        addLog(`🌿 ${defender.name} was seeded! Leech Seed drains HP each turn.`);
      }
      break;

    case 'recoil': {
      const recoilDmg = Math.max(1, Math.floor(dmg * 0.25));
      attacker.currentHp = Math.max(0, attacker.currentHp - recoilDmg);
      addLog(`💥 ${attacker.name} took ${recoilDmg} recoil damage!`);
      checkFaint(atkWho);
      break;
    }

    case 'heal': {
      const healAmt = 30;
      attacker.currentHp = Math.min(attacker.hp, attacker.currentHp + healAmt);
      addLog(`💚 ${attacker.name} restored ${healAmt} HP!`);
      break;
    }

    case 'splash':
      addLog(`💦 But nothing happened!`);
      break;

    case 'harden':
      attacker.hardened = true;
      addLog(`🛡️ ${attacker.name} hardened! Next hit is reduced by 30.`);
      break;

    case 'superfang': {
      // Halves whatever the target has left — never a clean KO on its own.
      const loss = Math.max(10, Math.floor(defender.currentHp / 2));
      defender.currentHp = Math.max(1, defender.currentHp - loss);
      addLog(`🦷 Super Fang halved ${defender.name}'s HP! (−${loss} → ${defender.currentHp})`);
      window.dispatchEvent(new CustomEvent('b:hit', { detail: { who: defWho } }));
      break;
    }

    case 'transform': {
      attacker.attacks     = defender.attacks.map(a => Object.assign({}, a));
      attacker.type1       = defender.type1;
      attacker.type2       = defender.type2;
      attacker.weakness    = defender.weakness;
      attacker.resistance  = defender.resistance;
      attacker.transformed = defender.name;
      attacker.spriteId    = defender.id;      // look the part, too
      attacker.emoji       = defender.emoji;
      addLog(`🎭 ${attacker.name} transformed into ${defender.emoji} ${defender.name} — copied its moves and typing!`);
      break;
    }

    case 'random': {
      // Metronome: fires a random attack pulled from the whole Kanto roster.
      const roster = window.KANTO_POKEMON || [];
      const pool   = roster
        .flatMap(p => p.attacks)
        .filter(a => a.damage > 0 && a.effect !== 'random' && a.effect !== 'transform');
      const roll = pool[Math.floor(Math.random() * pool.length)];
      if (!roll) break;

      let rollDmg = roll.damage;
      if (defender.weakness   === attacker.type1) rollDmg *= 2;
      if (defender.resistance === attacker.type1) rollDmg = Math.max(10, Math.floor(rollDmg * 0.5));

      defender.currentHp = Math.max(0, defender.currentHp - rollDmg);
      addLog(`🎲 Metronome became ${roll.name}! ${defender.name} −${rollDmg} HP`);
      window.dispatchEvent(new CustomEvent('b:hit', { detail: { who: defWho } }));

      // Metronome inherits the rolled move's status effect, but never recurses.
      if (roll.effect && !defender.status && !defender.fainted &&
          ['burn', 'paralysis', 'sleep', 'poison'].includes(roll.effect) &&
          Math.random() < 0.30) {
        defender.status = roll.effect;
        addLog(`${STATUS_ICON[roll.effect]} ${defender.name} is now ${roll.effect}!`);
        window.dispatchEvent(new CustomEvent('b:status', { detail: { who: defWho } }));
      }
      break;
    }

    case 'flail': {
      // Weaker the user, harder it hits — up to +60 at critical HP.
      const missing = 1 - (attacker.currentHp / attacker.hp);
      const bonus   = Math.floor(missing * 60);
      if (bonus > 0) {
        defender.currentHp = Math.max(0, defender.currentHp - bonus);
        addLog(`💢 ${attacker.name} flailed desperately! (+${bonus} damage)`);
        window.dispatchEvent(new CustomEvent('b:hit', { detail: { who: defWho } }));
      }
      break;
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// SWITCH
// ═══════════════════════════════════════════════════════════════

// Public — called by UI for the player.
// isReplace = true when choosing a replacement for a fainted Pokemon.
window.switchPokemon = function(benchIndex, isReplace = false) {
  if (_state.phase === 'game_over') return false;
  if (_state.phase === 'battle' && _state.activePlayer !== 'player') return false;
  if (_state.phase === 'faint_replace' && !isReplace) return false;

  if (!isReplace && side('player').switchedThisTurn) {
    addLog('You already switched this turn!');
    return false;
  }

  return performSwitch('player', benchIndex, isReplace);
};

function performSwitch(who, newIndex, isReplace) {
  const s      = side(who);
  const newMon = s.team[newIndex];

  if (!newMon || newMon.fainted)  return false;
  if (newIndex === s.active)      return false;

  const prevName = s.team[s.active].name;
  s.active = newIndex;

  if (isReplace) {
    addLog(`➡️ ${who === 'player' ? 'You' : 'AI'} sent out ${newMon.emoji} ${newMon.name}!`);
    _state.phase = 'battle';
    // If this replacement happened during AI's turn, hand control to player
    if (_state.faintReplacePendingAdvance) {
      _state.faintReplacePendingAdvance = false;
      safeRender();
      advanceTurn();
      return true;
    }
  } else {
    s.switchedThisTurn = true;
    addLog(`🔄 ${who === 'player' ? 'You' : 'AI'} switched ${prevName} → ${newMon.emoji} ${newMon.name}!`);
  }

  safeRender();
  return true;
}

// ═══════════════════════════════════════════════════════════════
// ITEMS
// ═══════════════════════════════════════════════════════════════

// Public — called by UI for the player.
// targetIndex: index into side.team for Potion / Full Heal / Revive targeting.
window.useItem = function(itemIndex, targetIndex = null) {
  if (_state.phase !== 'battle')        return false;
  if (_state.activePlayer !== 'player') return false;
  const ok = executeItem('player', itemIndex, targetIndex);
  if (ok) safeRender();
  return ok;
};

function executeItem(who, itemIndex, targetIndex) {
  const s    = side(who);
  const item = s.items[itemIndex];
  if (!item || item.used) return false;

  // One item per turn (Action Phase).
  if (s.itemUsedThisTurn) {
    if (who === 'player') addLog('You already used an item this turn!');
    return false;
  }

  const label = who === 'player' ? 'You' : 'AI';

  switch (item.id) {

    case 'potion': {
      const t = resolveTarget(s, targetIndex, false);
      if (!t) return false;
      t.currentHp = Math.min(t.hp, t.currentHp + 40);
      addLog(`🧪 ${label} used Potion on ${t.name}! (+40 HP → ${t.currentHp}/${t.hp})`);
      break;
    }

    case 'fullheal': {
      const t = resolveTarget(s, targetIndex, false);
      if (!t) return false;
      if (!t.status) {
        if (who === 'player') addLog(`${t.name} has no status condition to cure.`);
        return false;
      }
      addLog(`✨ ${label} used Full Heal on ${t.name}! ${STATUS_ICON[t.status]} cleared.`);
      t.status = null;
      break;
    }

    case 'xattack':
      s.xAttackPending = true;
      addLog(`⚔️ ${label} used X Attack! Next attack deals +20 damage.`);
      break;

    case 'revive': {
      const t = resolveTarget(s, targetIndex, true);
      if (!t) { if (who === 'player') addLog('No fainted Pokemon to revive.'); return false; }
      t.fainted   = false;
      t.currentHp = Math.floor(t.hp * 0.5);
      t.status    = null;
      addLog(`💫 ${label} used Revive on ${t.name}! (${t.currentHp} HP)`);
      break;
    }

    case 'switch':
      // Grants a free switch: reset the per-turn flag so the next switchPokemon() is free.
      s.switchedThisTurn = false;
      addLog(`🔄 ${label} used Switch item — free switch available!`);
      break;
  }

  item.used            = true;
  s.itemUsedThisTurn   = true;
  window.dispatchEvent(new CustomEvent('b:item', { detail: { who, idx: itemIndex } }));
  return true;
}

// resolveTarget: returns the Pokemon to target.
//   faintedOnly = true  → Revive: a fainted Pokemon
//   faintedOnly = false → Potion / Full Heal: a living Pokemon
// An explicit targetIndex is validated against that rule; without one we fall
// back to the ACTIVE Pokemon, which is what the user means ~always.
function resolveTarget(s, targetIndex, faintedOnly) {
  if (targetIndex !== null && targetIndex !== undefined) {
    const t = s.team[targetIndex];
    if (!t) return null;
    return t.fainted === faintedOnly ? t : null;
  }
  if (faintedOnly) return s.team.find(p => p.fainted) || null;

  const act = s.team[s.active];
  if (act && !act.fainted) return act;
  return s.team.find(p => !p.fainted) || null;
}

// ═══════════════════════════════════════════════════════════════
// FAINT CHECK
// ═══════════════════════════════════════════════════════════════

function checkFaint(who) {
  const s   = side(who);
  const mon = s.team[s.active];

  if (mon.currentHp > 0 || mon.fainted) return;

  mon.fainted   = true;
  mon.currentHp = 0;
  mon.status    = null;
  addLog(`💀 ${mon.emoji} ${mon.name} fainted!`);
  window.dispatchEvent(new CustomEvent('b:faint', { detail: { who, idx: s.active } }));

  // Check wipe
  if (s.team.every(p => p.fainted)) {
    triggerGameOver(opponent(who));
    return;
  }

  _state.phase = 'faint_replace';

  // The AI always auto-picks; the player's side auto-picks too while Auto
  // Battle is driving, otherwise the loop would stall on the overlay.
  if (who === 'ai' || window._autoBattle) {
    const bestIdx = s.team
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => !p.fainted && i !== s.active)
      .sort((a, b) => b.p.currentHp - a.p.currentHp)[0]?.i;

    // An auto-replacement is instantaneous, so the acting side simply carries
    // on with its turn. Advancing here would hand them a second turn, because
    // aiTakeTurn() advances again once it finishes.
    if (bestIdx !== undefined) {
      _state.faintReplacePendingAdvance = false;
      performSwitch(who, bestIdx, true);
    }

  } else {
    // Player must pick — set flag if this happened during AI's turn
    _state.faintReplacePendingAdvance = (_state.activePlayer === 'ai');
    addLog('Choose your next Pokemon!');
    safeRender();
  }
}

// ═══════════════════════════════════════════════════════════════
// END TURN
// ═══════════════════════════════════════════════════════════════

window.endTurn = function() {
  if (_state.phase !== 'battle')        return;
  if (_state.activePlayer !== 'player') return;
  advanceTurn();
};

function advanceTurn() {
  // Paralysis costs the paralyzed side one turn, then wears off — whether or
  // not they actually tried to attack.
  const outgoing = active(_state.activePlayer);
  if (outgoing.status === 'paralysis') {
    outgoing.status = null;
    addLog(`⚡ ${outgoing.name} shook off the paralysis.`);
  }

  const next = opponent(_state.activePlayer);
  if (next === _state.firstPlayer) {
    _state.turn++;
    if (_state.turn > MAX_TURNS) { triggerTimeLimit(); return; }
  }

  // Save last turn log for replay
  window._lastTurnLog = _state.log.slice(_turnLogStart);
  _turnLogStart = _state.log.length;

  _state.activePlayer = next;
  startTurn();
  safeRender();

  // AI always auto-runs; player also auto-runs when _autoBattle is on
  if (next === 'ai' || (next === 'player' && window._autoBattle)) {
    const delay = window._battleDelay ?? 700;
    setTimeout(() => window.aiTakeTurn?.(), delay);
  }
}

// ═══════════════════════════════════════════════════════════════
// GAME OVER
// ═══════════════════════════════════════════════════════════════

// Time limit reached — decide on total HP left, then on fewest fainted.
function triggerTimeLimit() {
  const total   = who => side(who).team.reduce((n, p) => n + p.currentHp, 0);
  const standing = who => side(who).team.filter(p => !p.fainted).length;

  const pHp = total('player'), aHp = total('ai');
  addLog(`⏱️ Turn limit reached! Judging on remaining HP…`);
  addLog(`📊 You: ${pHp} HP across ${standing('player')} Pokemon · AI: ${aHp} HP across ${standing('ai')}`);

  let winner;
  if (pHp !== aHp)                              winner = pHp > aHp ? 'player' : 'ai';
  else if (standing('player') !== standing('ai')) winner = standing('player') > standing('ai') ? 'player' : 'ai';
  else                                          winner = 'draw';

  _state.phase   = 'game_over';
  _state.winner  = winner;
  _state.timedOut = true;
  addLog(winner === 'draw' ? '🤝 A perfect draw!'
       : winner === 'player' ? '🏆 You win on HP!' : '💀 AI wins on HP.');
  safeRender();
}

function triggerGameOver(winner) {
  _state.phase  = 'game_over';
  _state.winner = winner;
  addLog(winner === 'player' ? '🏆 You win! Congratulations!' : '💀 AI wins! Better luck next time.');
  safeRender();
}

// ── Internal API exposed for ai.js ──────────────────────────────
window._b = {
  executeAttack,
  executeItem,
  performSwitch,
  advanceTurn,
  addLog,
  render: safeRender,
};
