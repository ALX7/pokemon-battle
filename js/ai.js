'use strict';

// ═══════════════════════════════════════════════════════════════
// AI BATTLE DECISIONS
// Works for both AI and player (when Auto Battle is on).
// Uses state.activePlayer to determine the acting side.
// ═══════════════════════════════════════════════════════════════

// Speed control — set by UI buttons
window._battleDelay  = 900;   // ms between AI actions (normal)
window._autoBattle   = false; // when true, player turns are also AI-controlled

window.aiTakeTurn = async function() {
  const state = window.getBattleState();
  if (!state || state.phase !== 'battle') return;

  const b    = window._b;
  const who  = state.activePlayer;   // 'player' or 'ai'
  const s    = state[who];

  const delay = ms => {
    const t = Math.round(ms * (window._battleDelay / 900));
    return t > 10 ? new Promise(r => setTimeout(r, t)) : Promise.resolve();
  };

  const mon = () => s.team[s.active];

  // ── 1. Items — only ONE may be used per turn, so pick the most urgent ──
  const has = id => s.items.findIndex(i => i.id === id && !i.used);
  const hpFrac = () => mon().currentHp / mon().hp;

  let itemIdx = -1;
  let itemTarget = null;

  if (mon().status && has('fullheal') >= 0) {
    // Status on the active Pokemon is the most pressing problem.
    itemIdx = has('fullheal');
    itemTarget = s.active;

  } else if (hpFrac() < 0.4 && has('potion') >= 0) {
    itemIdx = has('potion');
    itemTarget = s.active;

  } else if (has('revive') >= 0 && s.team.some(p => p.fainted)) {
    // Only worth it once the bench is genuinely thin.
    const healthy = s.team.filter((p, i) => !p.fainted && i !== s.active).length;
    if (healthy <= 1) {
      itemIdx = has('revive');
      itemTarget = s.team.findIndex(p => p.fainted);
    }
  }

  // X Attack is pure upside when a real attack is already affordable.
  if (itemIdx < 0 && has('xattack') >= 0) {
    const affordable = mon().attacks.some(a =>
      mon().storedEnergy >= a.energyCost && a.damage > 0);
    if (affordable && hpFrac() > 0.3) itemIdx = has('xattack');
  }

  if (itemIdx >= 0) {
    b.executeItem(who, itemIdx, itemTarget);
    b.render();
    await delay(900);
  }
  if (state.phase !== 'battle') return;

  // ── 3. Switch if HP < 20% and healthier bench exists ─────────
  if (!s.switchedThisTurn && mon().currentHp / mon().hp < 0.2) {
    const best = s.team
      .map((p, i) => ({ p, i }))
      .filter(({ p, i }) => !p.fainted && i !== s.active && p.currentHp > mon().currentHp)
      .sort((a, z) => z.p.currentHp - a.p.currentHp)[0];

    if (best) {
      b.performSwitch(who, best.i, false);
      b.render();
      await delay(900);
    }
  }
  if (state.phase !== 'battle') return;

  // ── 4. Attack — best affordable move, scored after type matchup ──────
  const current  = mon();
  const foe      = state[who === 'player' ? 'ai' : 'player'];
  const defender = foe.team[foe.active];

  const effective = a => {
    let d = a.damage;
    if (defender.weakness   === current.type1) d *= 2;
    if (defender.resistance === current.type1) d = Math.max(10, Math.floor(d * 0.5));
    // A status move with no damage still has some value.
    if (d === 0 && a.effect) d = 15;
    return d;
  };

  const best = current.attacks
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => current.storedEnergy >= a.energyCost)
    .sort((x, y) => effective(y.a) - effective(x.a))[0];

  if (best) {
    b.executeAttack(who, best.i);
  } else {
    b.addLog(`${current.emoji} ${current.name} is saving energy…`);
  }
  b.render();
  await delay(700);

  // ── Hand control back ─────────────────────────────────────────
  if (state.phase === 'battle') {
    b.advanceTurn();
  }
};
