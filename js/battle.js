'use strict';

// ═══════════════════════════════════════════════════════════════
// BATTLE ENGINE
// ═══════════════════════════════════════════════════════════════

const MAX_ENERGY = 5;

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
    currentHp:    p.hp,
    storedEnergy: 0,
    status:       null,
    statusTurns:  0,
    fainted:      false,
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
    },
    ai: {
      team:             aiTeam.map(initPokemon),
      active:           0,
      items:            aiItems.map(i => Object.assign({}, i, { used: false })),
      xAttackPending:   false,
      switchedThisTurn: false,
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

  window.BattleState = _state;
  _turnLogStart = 0;

  document.getElementById('draft-screen').classList.remove('active');
  document.getElementById('battle-screen').classList.add('active');

  addLog('⚔️ Battle begins!');
  startTurn();
  safeRender();
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

    // Unimplemented special effects — no-op for now
    case 'flail':
    case 'transform':
    case 'random':
    case 'superfang':
    case 'harden':
      break;
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

  item.used = true;
  window.dispatchEvent(new CustomEvent('b:item', { detail: { who, idx: itemIndex } }));
  return true;
}

// resolveTarget: returns the Pokemon to target.
//   faintedOnly = true  → pick first fainted (for Revive)
//   faintedOnly = false → pick first living (for Potion / Full Heal)
//   If targetIndex is provided, use that instead.
function resolveTarget(s, targetIndex, faintedOnly) {
  if (targetIndex !== null) {
    const t = s.team[targetIndex];
    return t ? t : null;
  }
  if (faintedOnly) return s.team.find(p => p.fainted) || null;
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

  if (who === 'ai') {
    // AI auto-picks: healthiest non-fainted bench Pokemon
    const bestIdx = s.team
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => !p.fainted && i !== s.active)
      .sort((a, b) => b.p.currentHp - a.p.currentHp)[0]?.i;

    if (bestIdx !== undefined) performSwitch('ai', bestIdx, true);

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
  const next = opponent(_state.activePlayer);
  if (next === 'player') _state.turn++;

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
