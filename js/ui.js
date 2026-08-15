'use strict';

// ═══════════════════════════════════════════════════════════════
// BATTLE UI
// ═══════════════════════════════════════════════════════════════

// ── UI state ────────────────────────────────────────────────────
let _switchOverlayOpen = false;
let _replayOpen        = false;
let _itemPicker        = null;   // { idx, id } → choosing a target for an item

// Items that need the player to pick which Pokemon they apply to.
const TARGETED_ITEMS = { potion: true, fullheal: true, revive: true };

// Animation state — set by battle events, consumed after each render
let _shakeWho     = null;   // 'player'|'ai'  → active card shakes
let _koAnim       = null;   // { who, idx }   → KO flash on that card
let _energyWho    = null;   // 'player'|'ai'  → pips pulse
let _statusWho    = null;   // 'player'|'ai'  → status badge pops
let _itemUsed     = null;   // { who, idx }   → item button cross-out

// ── Battle event listeners (wired once) ─────────────────────────
window.addEventListener('b:hit',    e => { _shakeWho  = e.detail.who; });
window.addEventListener('b:faint',  e => {
  _koAnim = e.detail;
  setTimeout(() => { _koAnim = null; window.renderBattle?.(); }, 1400);
});
window.addEventListener('b:energy', e => { _energyWho  = e.detail.who; });
window.addEventListener('b:status', e => { _statusWho  = e.detail.who; });
window.addEventListener('b:item',   e => { _itemUsed   = e.detail; });

// ── Type colours ────────────────────────────────────────────────
const TYPE_COLORS = {
  fire:'#dc2626',water:'#2563eb',grass:'#16a34a',electric:'#ca8a04',
  psychic:'#9333ea',ghost:'#312e81',normal:'#52525b',fighting:'#c2410c',
  poison:'#7e22ce',ground:'#92400e',rock:'#57534e',bug:'#4d7c0f',
  flying:'#0369a1',ice:'#0e7490',dragon:'#1e40af',steel:'#475569',
  dark:'#1a1a2e',fairy:'#be185d',
};

const STATUS_LABEL = {
  burn:'🔥 Burn', paralysis:'⚡ Para', sleep:'💤 Sleep',
  poison:'☠️ PSN', leech:'🌿 Seed',
};

// ═══════════════════════════════════════════════════════════════
// ENTRY POINT
// ═══════════════════════════════════════════════════════════════
window.renderBattle = function() {
  const state = window.getBattleState();
  if (!state) return;

  const screen = document.getElementById('battle-screen');

  if (state.phase === 'game_over') {
    screen.innerHTML = buildGameOver(state);
    document.getElementById('play-again-btn')
      ?.addEventListener('click', () => location.reload());
    return;
  }

  const needsOverlay = _switchOverlayOpen ||
    (state.phase === 'faint_replace' && state.player.team[state.player.active].fainted);
  const needsReplay  = _replayOpen;

  screen.innerHTML =
    buildToolbar() +
    buildLayout(state) +
    (_itemPicker  ? buildItemPicker(state)    : '') +
    (needsOverlay ? buildSwitchOverlay(state) : '') +
    (needsReplay  ? buildReplayModal()        : '');

  wireEvents(state);
  applyAnimations();
};

// ═══════════════════════════════════════════════════════════════
// TOOLBAR
// ═══════════════════════════════════════════════════════════════
function buildToolbar() {
  const spd = window._battleDelay ?? 900;
  const auto = !!window._autoBattle;
  const hasReplay = Array.isArray(window._lastTurnLog) && window._lastTurnLog.length > 0;

  return `
<div class="battle-toolbar" role="toolbar" aria-label="Battle controls">
  <span class="tb-label">Speed</span>
  <button class="speed-btn ${spd === 900  ? 'active' : ''}" data-speed="900"  aria-pressed="${spd===900}">Normal</button>
  <button class="speed-btn ${spd === 300  ? 'active' : ''}" data-speed="300"  aria-pressed="${spd===300}">Fast</button>
  <button class="speed-btn ${spd === 0    ? 'active' : ''}" data-speed="0"    aria-pressed="${spd===0}">Instant</button>
  <button class="replay-btn" id="replay-btn" ${hasReplay ? '' : 'disabled'} aria-label="Replay last turn">⏮ Last Turn</button>
  <button class="auto-btn ${auto ? 'active' : ''}" id="auto-btn" aria-pressed="${auto}">
    🤖 Auto${auto ? ': ON' : ': OFF'}
  </button>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// MAIN LAYOUT
// ═══════════════════════════════════════════════════════════════
function buildLayout(state) {
  return `
<div class="battle-layout">
  ${buildSide(state.ai,     'ai',     state)}
  ${buildCenter(state)}
  ${buildSide(state.player, 'player', state)}
  ${buildActions(state)}
</div>`;
}

// ── Side panel ──────────────────────────────────────────────────
function buildSide(s, who, state) {
  const mon   = s.team[s.active];
  const bench = s.team.map((p, i) => ({ p, i })).filter(({ i }) => i !== s.active);

  return `
<div class="battle-side battle-${who}" role="region" aria-label="${who === 'ai' ? 'AI' : 'Your'} team">
  ${buildActiveCard(mon, who, state)}
  <div class="battle-bench" aria-label="Bench">
    ${bench.map(({ p, i }) => buildBenchCard(p, i, who)).join('')}
  </div>
</div>`;
}

function buildActiveCard(mon, who, state) {
  const hpPct  = mon.currentHp / mon.hp;
  const isTurn = state.activePlayer === who && state.phase === 'battle';
  const isKo   = _koAnim && _koAnim.who === who && mon.fainted;

  return `
<div class="active-card${isTurn ? ' active-turn' : ''}${isKo ? ' ko-wrap' : ''}" aria-label="${mon.name}, ${mon.currentHp} of ${mon.hp} HP">
  ${isKo ? '<div class="ko-overlay"><span class="ko-label">KO! 💀</span></div>' : ''}
  <div class="active-top-row">
    <span class="active-name">${mon.name}</span>
    ${mon.status ? `<span class="status-badge status-${mon.status}" role="status">${STATUS_LABEL[mon.status]}</span>` : ''}
  </div>
  ${window.spriteHtml(mon, 'active', {
      animated: true,
      className: who === 'ai' ? 'sprite-facing-front' : 'sprite-facing-back',
    })}
  <div class="hp-row">
    <div class="hp-track" role="progressbar" aria-valuenow="${mon.currentHp}" aria-valuemax="${mon.hp}" aria-label="HP">
      <div class="hp-fill" style="width:${(hpPct*100).toFixed(1)}%;background:${hpColor(hpPct)}"></div>
    </div>
    <span class="hp-nums">${mon.currentHp}/${mon.hp}</span>
  </div>
  <div class="active-footer">
    <span class="e-pips" aria-label="${mon.storedEnergy} energy">${pips(mon.storedEnergy)}</span>
    <span class="type-sm" style="background:${TYPE_COLORS[mon.type1]||'#555'}">${mon.type1}</span>
    ${mon.type2 ? `<span class="type-sm" style="background:${TYPE_COLORS[mon.type2]||'#555'}">${mon.type2}</span>` : ''}
  </div>
</div>`;
}

function buildBenchCard(mon, idx, who) {
  const isKo = _koAnim && _koAnim.who === who && _koAnim.idx === idx;

  if (mon.fainted) {
    return `
<div class="bench-card bench-fainted${isKo ? ' ko-wrap' : ''}" aria-label="${mon.name}, fainted">
  ${isKo ? '<div class="ko-overlay"><span class="ko-label" style="font-size:1rem">KO!</span></div>' : ''}
  ${window.spriteHtml(mon, 'bench', { emoji: '💀', className: 'sprite-ko' })}
  <div class="bench-right"><span class="bench-name">${mon.name}</span></div>
</div>`;
  }
  const hpPct = mon.currentHp / mon.hp;
  return `
<div class="bench-card" aria-label="${mon.name}, ${mon.currentHp} HP">
  ${window.spriteHtml(mon, 'bench')}
  <div class="bench-right">
    <span class="bench-name">${mon.name}</span>
    <div class="bench-hp-track" role="progressbar" aria-valuenow="${mon.currentHp}" aria-valuemax="${mon.hp}">
      <div class="bench-hp-fill" style="width:${(hpPct*100).toFixed(0)}%;background:${hpColor(hpPct)}"></div>
    </div>
    ${mon.status ? `<span class="bench-status">${STATUS_LABEL[mon.status]}</span>` : ''}
  </div>
</div>`;
}

// ── Center panel ────────────────────────────────────────────────
function buildCenter(state) {
  const entries   = state.log.slice(-5);
  const isMyTurn  = state.activePlayer === 'player' && state.phase === 'battle';
  const turnLabel = state.activePlayer === 'player' ? 'Your turn' : "AI's turn…";
  const turnClass = state.activePlayer === 'ai' ? 'turn-ai' : 'turn-player';

  return `
<div class="battle-center">
  <div class="battle-log" role="log" aria-live="polite" aria-label="Battle log">
    ${entries.map((l, i) =>
      `<div class="log-line${i === entries.length-1 ? ' log-latest' : ''}">${l}</div>`
    ).join('')}
  </div>
  <div class="battle-controls">
    <div class="turn-info" aria-live="polite">
      Turn <strong>${state.turn}</strong><span class="turn-max">/50</span>
      <span class="turn-label ${turnClass}">${turnLabel}</span>
    </div>
    <button id="end-turn-btn" class="end-turn-btn" ${isMyTurn ? '' : 'disabled'}
            aria-label="End your turn">
      End Turn ▶
    </button>
  </div>
</div>`;
}

// ── Action panel ────────────────────────────────────────────────
function buildActions(state) {
  const s         = state.player;
  const mon       = s.team[s.active];
  const myTurn    = state.activePlayer === 'player' && state.phase === 'battle';
  const asleep    = mon.status === 'sleep';
  const paralyzed = mon.status === 'paralysis';

  const atkBtns = mon.attacks.map((atk, i) => {
    const canUse  = myTurn && mon.storedEnergy >= atk.energyCost && !asleep;
    const costStr = '●'.repeat(atk.energyCost) + '○'.repeat(Math.max(0, 3 - atk.energyCost));
    const dmgStr  = atk.damage > 0 ? `${atk.damage} dmg` : 'effect';
    return `
<button class="atk-btn ${canUse ? 'atk-on' : 'atk-off'}" data-atk="${i}"
        ${canUse ? '' : 'disabled'}
        aria-label="${atk.name}, costs ${atk.energyCost} energy, ${dmgStr}">
  <span class="atk-name">${atk.name}</span>
  <span class="atk-meta">${costStr} · ${dmgStr}</span>
  ${atk.effect ? `<span class="atk-fx">${atk.effect}</span>` : ''}
</button>`;
  }).join('');

  const itemBtns = s.items.map((item, i) => {
    const canUse  = myTurn && !item.used && !s.itemUsedThisTurn;
    const isFresh = _itemUsed && _itemUsed.who === 'player' && _itemUsed.idx === i;
    const why     = item.used ? ', used'
                  : s.itemUsedThisTurn ? ', already used an item this turn' : '';
    return `
<button class="item-btn ${item.used ? 'item-used' : canUse ? 'item-on' : 'item-off'}${isFresh ? ' item-cross' : ''}"
        data-item="${i}" ${canUse ? '' : 'disabled'}
        aria-label="${item.name}${why}">
  ${item.emoji} <span class="item-lbl">${item.name}</span>
</button>`;
  }).join('');

  const canSwitch = myTurn && !s.switchedThisTurn &&
    s.team.some((p, i) => !p.fainted && i !== s.active);

  const statusNote = asleep
    ? '<p class="status-note" role="alert">💤 Asleep — cannot attack</p>'
    : paralyzed
      ? '<p class="status-note" role="alert">⚡ Paralyzed — attack will be skipped</p>'
      : '';

  return `
<div class="battle-actions" role="group" aria-label="Player actions">
  <div class="actions-left">
    <span class="action-label" aria-hidden="true">ATTACKS</span>
    <div class="atk-btns">${atkBtns}</div>
    ${statusNote}
  </div>
  <div class="actions-right">
    <span class="action-label" aria-hidden="true">ITEMS</span>
    <div class="item-btns">${itemBtns}</div>
    <button id="switch-btn" class="switch-btn ${canSwitch ? 'switch-on' : 'switch-off'}"
            ${canSwitch ? '' : 'disabled'}
            aria-label="Switch active Pokemon">
      🔄 Switch
    </button>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// SWITCH / FAINT OVERLAY
// ═══════════════════════════════════════════════════════════════
function buildSwitchOverlay(state) {
  const s        = state.player;
  const isFaint  = state.phase === 'faint_replace' && s.team[s.active].fainted;
  const title    = isFaint
    ? `💀 ${s.team[s.active].name} fainted! Choose replacement:`
    : '🔄 Switch to which Pokemon?';

  const options = s.team
    .map((p, i) => ({ p, i }))
    .filter(({ p, i }) => !p.fainted && i !== s.active);

  const cards = options.map(({ p, i }) => {
    const hpPct = p.currentHp / p.hp;
    return `
<div class="ov-card" data-switch-to="${i}" tabindex="0" role="button"
     aria-label="${p.name}, ${p.currentHp} of ${p.hp} HP">
  ${window.spriteHtml(p, 'ov')}
  <div class="ov-name">${p.name}</div>
  <div class="ov-hp-track"><div style="width:${(hpPct*100).toFixed(0)}%;background:${hpColor(hpPct)};height:100%;border-radius:3px"></div></div>
  <div class="ov-hp">${p.currentHp}/${p.hp}</div>
  <div class="ov-pips">${pips(p.storedEnergy)}</div>
  ${p.status ? `<div class="ov-status">${STATUS_LABEL[p.status]}</div>` : ''}
</div>`;
  }).join('') || '<p class="ov-empty">No Pokemon available!</p>';

  return `
<div class="battle-overlay" id="battle-overlay" role="dialog" aria-modal="true" aria-label="${title}">
  <div class="ov-panel">
    <div class="ov-title">${title}</div>
    <div class="ov-cards">${cards}</div>
    ${!isFaint ? '<button class="ov-close" id="ov-close" aria-label="Cancel switch">✕ Cancel</button>' : ''}
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// ITEM TARGET PICKER
// ═══════════════════════════════════════════════════════════════
function itemTargets(state, id) {
  const team = state.player.team;
  const tag  = (p, i) => ({ p, i });

  if (id === 'revive')   return team.map(tag).filter(({ p }) => p.fainted);
  if (id === 'fullheal') return team.map(tag).filter(({ p }) => !p.fainted && p.status);
  return team.map(tag).filter(({ p }) => !p.fainted && p.currentHp < p.hp);
}

const ITEM_PROMPT = {
  potion:   { icon: '🧪', title: 'Potion — heal which Pokemon?',      empty: 'Everyone is already at full HP.' },
  fullheal: { icon: '✨', title: 'Full Heal — cure which Pokemon?',   empty: 'Nobody has a status condition.'   },
  revive:   { icon: '💫', title: 'Revive — bring back which Pokemon?', empty: 'No fainted Pokemon to revive.'   },
};

function buildItemPicker(state) {
  const { id }   = _itemPicker;
  const prompt   = ITEM_PROMPT[id];
  const targets  = itemTargets(state, id);
  const activeIx = state.player.active;

  const cards = targets.map(({ p, i }) => {
    const hpPct   = p.currentHp / p.hp;
    const preview = id === 'potion'
      ? `→ ${Math.min(p.hp, p.currentHp + 40)}/${p.hp}`
      : id === 'revive'
        ? `→ ${Math.floor(p.hp * 0.5)}/${p.hp}`
        : STATUS_LABEL[p.status] || '';

    return `
<div class="ov-card" data-item-target="${i}" tabindex="0" role="button"
     aria-label="${p.name}, ${p.currentHp} of ${p.hp} HP${i === activeIx ? ', active' : ''}">
  ${i === activeIx ? '<div class="ov-active-tag">ACTIVE</div>' : ''}
  ${window.spriteHtml(p, 'ov', p.fainted ? { emoji: '💀', className: 'sprite-ko' } : {})}
  <div class="ov-name">${p.name}</div>
  <div class="ov-hp-track"><div style="width:${(hpPct*100).toFixed(0)}%;background:${hpColor(hpPct)};height:100%;border-radius:3px"></div></div>
  <div class="ov-hp">${p.currentHp}/${p.hp}</div>
  <div class="ov-preview">${preview}</div>
</div>`;
  }).join('') || `<p class="ov-empty">${prompt.empty}</p>`;

  return `
<div class="battle-overlay" id="item-picker" role="dialog" aria-modal="true" aria-label="${prompt.title}">
  <div class="ov-panel">
    <div class="ov-title">${prompt.icon} ${prompt.title}</div>
    <div class="ov-cards">${cards}</div>
    <button class="ov-close" id="item-picker-close" aria-label="Cancel item">✕ Cancel</button>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// REPLAY MODAL
// ═══════════════════════════════════════════════════════════════
function buildReplayModal() {
  const log     = window._lastTurnLog || [];
  const entries = log.map(l => `<div class="replay-entry">${l}</div>`).join('') ||
    '<div class="replay-entry" style="color:var(--text-dim);font-style:italic">No entries.</div>';

  return `
<div class="replay-modal" id="replay-modal" role="dialog" aria-modal="true" aria-label="Last turn replay">
  <div class="replay-panel">
    <div class="replay-title">⏮ Last Turn</div>
    <div class="replay-entries">${entries}</div>
    <button class="replay-close" id="replay-close" aria-label="Close replay">Close</button>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// GAME OVER
// ═══════════════════════════════════════════════════════════════
function buildGameOver(state) {
  const draw        = state.winner === 'draw';
  const won         = state.winner === 'player';
  const playerAlive = state.player.team.filter(p => !p.fainted).length;
  const aiAlive     = state.ai.team.filter(p => !p.fainted).length;
  const recap       = state.log.slice(-8).map(l => `<div class="log-line">${l}</div>`).join('');

  const icon  = draw ? '🤝' : won ? '🏆' : '😞';
  const title = draw ? 'Draw'   : won ? 'Victory!' : 'Defeated';
  const sub   = state.timedOut
    ? (draw ? 'Turn limit reached — dead even on HP.'
            : `Turn limit reached — ${won ? 'you' : 'the AI'} won on remaining HP.`)
    : (won ? 'You won the battle!' : 'AI wins this round!');

  return `
<div class="game-over-wrap" role="main">
  <div class="go-card" role="region" aria-label="Game over">
    <div class="go-icon" aria-hidden="true">${icon}</div>
    <div class="go-title">${title}</div>
    <div class="go-sub">${sub}</div>
    <div class="go-stats">
      <div class="go-stat">
        <span class="go-stat-lbl">Your survivors</span>
        <span class="go-stat-val" style="color:${draw?'var(--text)':won?'var(--green)':'var(--red)'}">${playerAlive}/5</span>
      </div>
      <div class="go-stat">
        <span class="go-stat-lbl">AI survivors</span>
        <span class="go-stat-val" style="color:${draw?'var(--text)':!won?'var(--green)':'var(--red)'}">${aiAlive}/5</span>
      </div>
    </div>
    <div class="go-log" role="log">${recap}</div>
    <button class="go-btn" id="play-again-btn">▶ Play Again</button>
  </div>
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// EVENT WIRING
// ═══════════════════════════════════════════════════════════════
function wireEvents(state) {
  // Attack buttons
  document.querySelectorAll('.atk-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => window.useAttack(+btn.dataset.atk));
  });

  // Item buttons — targeted items open a picker, the rest apply immediately
  document.querySelectorAll('.item-btn:not([disabled])').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = +btn.dataset.item;
      const id  = state.player.items[idx]?.id;

      if (!TARGETED_ITEMS[id]) { window.useItem(idx, null); return; }

      if (itemTargets(state, id).length === 0) {
        window._b?.addLog(ITEM_PROMPT[id].empty);
        window.renderBattle();
        return;
      }
      _itemPicker = { idx, id };
      window.renderBattle();
    });
  });

  // Item picker: choose target
  document.querySelectorAll('[data-item-target]').forEach(card => {
    const activate = () => {
      const target = +card.dataset.itemTarget;
      const picker = _itemPicker;
      _itemPicker = null;
      if (picker) window.useItem(picker.idx, target);
      else window.renderBattle();
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  document.getElementById('item-picker-close')?.addEventListener('click', () => {
    _itemPicker = null;
    window.renderBattle();
  });

  // Switch open
  const switchBtn = document.getElementById('switch-btn');
  if (switchBtn && !switchBtn.disabled) {
    switchBtn.addEventListener('click', () => {
      _switchOverlayOpen = true;
      window.renderBattle();
    });
  }

  // End Turn
  document.getElementById('end-turn-btn')?.addEventListener('click', () => {
    if (!document.getElementById('end-turn-btn').disabled) window.endTurn();
  });

  // Overlay: pick Pokemon
  document.querySelectorAll('.ov-card').forEach(card => {
    const activate = () => {
      const idx      = +card.dataset.switchTo;
      const isReplace = state.phase === 'faint_replace' && state.player.team[state.player.active].fainted;
      _switchOverlayOpen = false;
      window.switchPokemon(idx, isReplace);
    };
    card.addEventListener('click', activate);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
  });

  // Overlay: cancel
  document.getElementById('ov-close')?.addEventListener('click', () => {
    _switchOverlayOpen = false;
    window.renderBattle();
  });

  // Escape closes overlays
  document.addEventListener('keydown', escHandler);

  // Speed buttons
  document.querySelectorAll('.speed-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window._battleDelay = +btn.dataset.speed;
      window.renderBattle();
    });
  });

  // Auto Battle
  document.getElementById('auto-btn')?.addEventListener('click', () => {
    window._autoBattle = !window._autoBattle;
    window.renderBattle();
    // If it's the player's turn and auto just turned on, kick off AI
    const st = window.getBattleState();
    if (window._autoBattle && st?.activePlayer === 'player' && st?.phase === 'battle') {
      setTimeout(() => window.aiTakeTurn?.(), window._battleDelay ?? 900);
    }
  });

  // Replay
  document.getElementById('replay-btn')?.addEventListener('click', () => {
    _replayOpen = true;
    window.renderBattle();
  });
  document.getElementById('replay-close')?.addEventListener('click', () => {
    _replayOpen = false;
    window.renderBattle();
  });
}

function escHandler(e) {
  if (e.key !== 'Escape') return;
  let changed = false;
  if (_switchOverlayOpen) { _switchOverlayOpen = false; changed = true; }
  if (_replayOpen)        { _replayOpen        = false; changed = true; }
  if (_itemPicker)        { _itemPicker        = null;  changed = true; }
  if (changed) {
    document.removeEventListener('keydown', escHandler);
    window.renderBattle();
  }
}

// ═══════════════════════════════════════════════════════════════
// POST-RENDER ANIMATIONS
// ═══════════════════════════════════════════════════════════════
function applyAnimations() {
  // Shake defending side's active card
  if (_shakeWho) {
    const card = document.querySelector(`.battle-${_shakeWho} .active-card`);
    if (card) {
      card.classList.add('shake-anim');
      card.addEventListener('animationend', () => card.classList.remove('shake-anim'), { once: true });
    }
    _shakeWho = null;
  }

  // Energy pips pulse
  if (_energyWho) {
    const pipsEl = document.querySelector(`.battle-${_energyWho} .active-card .e-pips`);
    if (pipsEl) {
      pipsEl.classList.add('pip-pulse');
      pipsEl.addEventListener('animationend', () => pipsEl.classList.remove('pip-pulse'), { once: true });
    }
    _energyWho = null;
  }

  // Status badge pop
  if (_statusWho) {
    const badge = document.querySelector(`.battle-${_statusWho} .active-card .status-badge`);
    if (badge) badge.classList.add('badge-pop');
    _statusWho = null;
  }

  // Item cross-out clears itself (CSS animation handles it)
  _itemUsed = null;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function hpColor(pct) {
  if (pct > 0.5) return 'var(--green)';
  if (pct > 0.2) return 'var(--yellow)';
  return 'var(--red)';
}

function pips(stored, max = 5) {
  return '●'.repeat(stored) + '○'.repeat(max - stored);
}
