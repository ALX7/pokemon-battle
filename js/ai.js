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

  // ── 1. Full Heal if status-affected ──────────────────────────
  if (mon().status) {
    const idx = s.items.findIndex(i => i.id === 'fullheal' && !i.used);
    if (idx >= 0) {
      b.executeItem(who, idx, null);
      b.render();
      await delay(900);
    }
  }
  if (state.phase !== 'battle') return;

  // ── 2. Potion if HP < 40% ────────────────────────────────────
  if (mon().currentHp / mon().hp < 0.4) {
    const idx = s.items.findIndex(i => i.id === 'potion' && !i.used);
    if (idx >= 0) {
      b.executeItem(who, idx, null);
      b.render();
      await delay(900);
    }
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

  // ── 4. Attack — highest-damage affordable move ────────────────
  const current = mon();
  const best = current.attacks
    .map((a, i) => ({ a, i }))
    .filter(({ a }) => current.storedEnergy >= a.energyCost)
    .sort((x, y) => y.a.damage - x.a.damage)[0];

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
