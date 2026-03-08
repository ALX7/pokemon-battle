'use strict';

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const MAX_BUDGET    = 100;
const MAX_TEAM_SIZE = 5;
const TIER_ORDER    = { S: 0, A: 1, B: 2, C: 3 };

const TIER_STYLE = {
  S: { bg: '#ffd700', color: '#000' },
  A: { bg: '#7c3aed', color: '#fff' },
  B: { bg: '#1d4ed8', color: '#fff' },
  C: { bg: '#4b5563', color: '#fff' },
};

const TYPE_COLOR = {
  fire:     '#dc2626',
  water:    '#2563eb',
  grass:    '#16a34a',
  electric: '#ca8a04',
  psychic:  '#9333ea',
  ghost:    '#312e81',
  normal:   '#52525b',
  fighting: '#c2410c',
  poison:   '#7e22ce',
  ground:   '#92400e',
  rock:     '#57534e',
  bug:      '#4d7c0f',
  flying:   '#0369a1',
  ice:      '#0e7490',
  dragon:   '#1e40af',
  steel:    '#475569',
  dark:     '#27272a',
  fairy:    '#be185d',
};

const TIER_META = {
  S: { label: 'S Tier', sub: 'Legendaries & pseudo-legendaries', price: '$30 each', color: '#ffd700' },
  A: { label: 'A Tier', sub: 'Strong fully-evolved picks',        price: '$20 each', color: '#a855f7' },
  B: { label: 'B Tier', sub: 'Mid-tier evolutions & niche picks', price: '$12 each', color: '#3b82f6' },
  C: { label: 'C Tier', sub: 'Basics, unevolved & meme picks',    price: '$5 each',  color: '#6b7280' },
};

const ITEMS = [
  { id: 'potion',   name: 'Potion',    emoji: '🧪', desc: 'Heal 40 HP from one of your Pokémon' },
  { id: 'fullheal', name: 'Full Heal', emoji: '✨', desc: 'Remove status from one of your Pokémon' },
  { id: 'xattack',  name: 'X Attack',  emoji: '⚔️', desc: 'Your next attack deals +20 extra damage' },
  { id: 'revive',   name: 'Revive',    emoji: '💫', desc: 'Restore a fainted Pokémon to 50% HP' },
  { id: 'switch',   name: 'Switch',    emoji: '🔄', desc: 'Free switch, no Action Phase needed' },
];

const AI_DEFAULT_ITEMS = ['potion', 'fullheal', 'revive'];

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════
const state = {
  // Draft
  team:          [],
  budget:        0,
  filterType:    '',
  filterTier:    '',
  filterSearch:  '',
  // AI
  aiTeam:        [],
  aiBudget:      MAX_BUDGET,
  // Phase: 'draft' | 'ai_picking' | 'item_select'
  phase:         'draft',
  // Items
  selectedItems: [],
};

function setPhase(phase) {
  state.phase = phase;
  document.body.dataset.phase = phase;
}

// ═══════════════════════════════════════════════════════════════
// FILTERING & SORTING
// ═══════════════════════════════════════════════════════════════
function getDisplayList() {
  let list = window.KANTO_POKEMON.slice();

  if (state.filterType) {
    list = list.filter(p => p.type1 === state.filterType || p.type2 === state.filterType);
  }
  if (state.filterTier) {
    list = list.filter(p => p.tier === state.filterTier);
  }
  if (state.filterSearch) {
    const q = state.filterSearch.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q));
  }

  list.sort((a, b) => {
    const td = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    return td !== 0 ? td : a.id - b.id;
  });

  return list;
}

// ═══════════════════════════════════════════════════════════════
// RENDER — DRAFT GRID (grouped by tier)
// ═══════════════════════════════════════════════════════════════
function renderGrid() {
  const grid  = document.getElementById('pokemon-grid');
  const count = document.getElementById('grid-count');
  const list  = getDisplayList();

  count.textContent = `${list.length} / ${window.KANTO_POKEMON.length}`;

  if (list.length === 0) {
    grid.innerHTML = '<p class="no-results">No Pokémon match your filters.</p>';
    return;
  }

  const selectedIds = new Set(state.team.map(p => p.id));
  const buckets = { S: [], A: [], B: [], C: [] };
  list.forEach(p => buckets[p.tier].push(p));

  let html = '';
  for (const tier of ['S', 'A', 'B', 'C']) {
    const pokemon = buckets[tier];
    if (pokemon.length === 0) continue;

    const { label, sub, price, color } = TIER_META[tier];
    const ts = TIER_STYLE[tier];

    html += `
<section class="tier-section" style="--tc:${color}">
  <div class="tier-section-header">
    <span class="tier-badge tier-badge-lg" style="background:${ts.bg};color:${ts.color}">${tier}</span>
    <div class="tier-header-text">
      <span class="tier-header-label">${label}</span>
      <span class="tier-header-sub">${sub}</span>
    </div>
    <span class="tier-header-price">${price}</span>
    <span class="tier-header-count">${pokemon.length} Pokémon</span>
  </div>
  <div class="tier-section-grid">
    ${pokemon.map(p => buildCard(p, selectedIds.has(p.id))).join('')}
  </div>
</section>`;
  }

  grid.innerHTML = html;

  grid.querySelectorAll('.pokemon-card').forEach(el => {
    el.addEventListener('click', () => handleCardClick(parseInt(el.dataset.id, 10)));
  });
}

function buildCard(p, selected) {
  const ts      = TIER_STYLE[p.tier];
  const typePills = [p.type1, p.type2]
    .filter(Boolean)
    .map(t => `<span class="type-badge" style="background:${TYPE_COLOR[t] || '#555'}">${t}</span>`)
    .join('');

  return `
<div class="pokemon-card${selected ? ' selected' : ''}"
     data-id="${p.id}"
     style="--card-accent:${ts.bg}">
  <div class="card-header">
    <span class="tier-badge" style="background:${ts.bg};color:${ts.color}">${p.tier}</span>
    <span class="card-cost">$${p.cost}</span>
  </div>
  <span class="card-emoji">${p.emoji}</span>
  <div class="card-name">${p.name}</div>
  <div class="card-types">${typePills}</div>
  <div class="card-divider"></div>
  <div class="card-stats">
    <span>HP <strong>${p.hp}</strong></span>
    <span>SPD <strong>${p.speed}</strong></span>
  </div>
  <div class="card-attacks">${p.attacks[0].name} · ${p.attacks[1].name}</div>
  ${selected ? '<div class="card-check">✓</div>' : ''}
</div>`;
}

// ═══════════════════════════════════════════════════════════════
// RENDER — SIDEBAR
// ═══════════════════════════════════════════════════════════════
function renderSidebar() {
  renderSlots();
  renderBudget();
  renderLockBtn();
}

function renderSlots() {
  const container  = document.getElementById('team-slots');
  const countBadge = document.getElementById('team-count');

  countBadge.textContent = `${state.team.length} / ${MAX_TEAM_SIZE}`;
  countBadge.classList.toggle('full', state.team.length === MAX_TEAM_SIZE);

  let html = '';
  for (let i = 0; i < MAX_TEAM_SIZE; i++) {
    const p = state.team[i];
    if (p) {
      const ts = TIER_STYLE[p.tier];
      html += `
<div class="team-slot filled" data-index="${i}">
  <span class="slot-emoji">${p.emoji}</span>
  <div class="slot-info">
    <div class="slot-name">${p.name}</div>
    <div class="slot-meta">
      <span class="tier-badge" style="background:${ts.bg};color:${ts.color}">${p.tier}</span>
      <span class="slot-cost">$${p.cost}</span>
    </div>
  </div>
  <button class="slot-remove" data-index="${i}" title="Remove ${p.name}">✕</button>
</div>`;
    } else {
      html += `
<div class="team-slot empty">
  <span class="slot-empty-text">Slot ${i + 1}</span>
</div>`;
    }
  }

  container.innerHTML = html;

  container.querySelectorAll('.slot-remove').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      removePokemon(parseInt(btn.dataset.index, 10));
    });
  });
}

function renderBudget() {
  const spent     = state.budget;
  const remaining = MAX_BUDGET - spent;
  const pct       = (spent / MAX_BUDGET) * 100;

  const amountEl = document.getElementById('budget-display');
  amountEl.textContent = `$${spent} / $${MAX_BUDGET}`;
  amountEl.className   = 'budget-amount';
  if (pct > 80) amountEl.classList.add('tight');
  else if (pct > 60) amountEl.classList.add('warn');

  const fill = document.getElementById('budget-fill');
  fill.style.width = pct + '%';
  fill.style.backgroundPosition = (100 - pct) + '% 0';

  document.getElementById('budget-remaining').textContent = `$${remaining} remaining`;
}

function renderLockBtn() {
  document.getElementById('lock-btn').disabled = state.team.length !== MAX_TEAM_SIZE;
}

// ═══════════════════════════════════════════════════════════════
// DRAFT ACTIONS
// ═══════════════════════════════════════════════════════════════
function handleCardClick(id) {
  if (state.phase !== 'draft') return;

  const idx = state.team.findIndex(p => p.id === id);
  if (idx >= 0) { removePokemon(idx); return; }

  const pokemon = window.getPokemonById(id);
  if (!pokemon) return;

  if (state.team.length >= MAX_TEAM_SIZE) {
    shakeCard(id);
    showToast('Team is full! Remove a Pokémon first.', 'error');
    return;
  }

  const remaining = MAX_BUDGET - state.budget;
  if (pokemon.cost > remaining) {
    shakeCard(id);
    showToast(`Not enough budget — need $${pokemon.cost - remaining} more.`, 'error');
    return;
  }

  state.team.push(pokemon);
  state.budget += pokemon.cost;
  refresh();
}

function removePokemon(index) {
  const p = state.team[index];
  if (!p) return;
  state.budget -= p.cost;
  state.team.splice(index, 1);
  refresh();
}

function refresh() {
  renderGrid();
  renderSidebar();
}

// ═══════════════════════════════════════════════════════════════
// AI DRAFT
// ═══════════════════════════════════════════════════════════════
function aiPickPokemon() {
  const isLastPick = state.aiTeam.length === 4;
  const takenIds   = new Set([...state.team, ...state.aiTeam].map(p => p.id));

  let available = window.KANTO_POKEMON.filter(p =>
    !takenIds.has(p.id) && p.cost <= state.aiBudget
  );

  // Reserve $5 for the final pick unless this IS the final pick
  if (!isLastPick) {
    available = available.filter(p => state.aiBudget - p.cost >= 5);
  }

  if (available.length === 0) return null;

  // 20% surprise: pick randomly from anything affordable
  if (Math.random() < 0.20) {
    return available[Math.floor(Math.random() * available.length)];
  }

  // Sort by tier priority, then cost descending within tier
  available.sort((a, b) => {
    const td = TIER_ORDER[a.tier] - TIER_ORDER[b.tier];
    return td !== 0 ? td : b.cost - a.cost;
  });

  // Type diversity: avoid 3 of the same type
  const typeCounts = {};
  state.aiTeam.forEach(p => {
    typeCounts[p.type1] = (typeCounts[p.type1] || 0) + 1;
    if (p.type2) typeCounts[p.type2] = (typeCounts[p.type2] || 0) + 1;
  });

  const diverse = available.filter(p =>
    (typeCounts[p.type1] || 0) < 2 &&
    (!p.type2 || (typeCounts[p.type2] || 0) < 2)
  );

  return (diverse.length > 0 ? diverse : available)[0];
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startAiDraft() {
  setPhase('ai_picking');
  renderVsView();

  for (let i = 0; i < MAX_TEAM_SIZE; i++) {
    await delay(800);
    const pick = aiPickPokemon();
    if (pick) {
      state.aiTeam.push(pick);
      state.aiBudget -= pick.cost;
      revealAiPick(pick, i);
    }
  }

  // Brief pause so the user sees the completed teams before item select
  await delay(1200);
  setPhase('item_select');
  renderItemSelection();
}

// ═══════════════════════════════════════════════════════════════
// RENDER — VS VIEW
// ═══════════════════════════════════════════════════════════════
function buildVsCard(p) {
  const ts = TIER_STYLE[p.tier];
  const typePills = [p.type1, p.type2]
    .filter(Boolean)
    .map(t => `<span class="type-badge" style="background:${TYPE_COLOR[t] || '#555'}">${t}</span>`)
    .join('');

  return `
    <span class="vs-card-emoji">${p.emoji}</span>
    <div class="vs-card-info">
      <div class="vs-card-name">${p.name}</div>
      <div class="vs-card-meta">
        <span class="tier-badge" style="background:${ts.bg};color:${ts.color}">${p.tier}</span>
        ${typePills}
      </div>
    </div>
    <span class="vs-card-cost">$${p.cost}</span>`;
}

function renderVsView() {
  const grid = document.getElementById('pokemon-grid');

  const playerCards = state.team
    .map(p => `<div class="vs-card player-card">${buildVsCard(p)}</div>`)
    .join('');

  const aiSlots = Array.from({ length: MAX_TEAM_SIZE }, (_, i) =>
    `<div class="vs-card ai-card empty" id="ai-slot-${i}">
      <span class="vs-slot-num">${i + 1}</span>
      <span class="vs-slot-dots">· · ·</span>
    </div>`
  ).join('');

  grid.innerHTML = `
<div class="vs-view">

  <div class="vs-side player-side">
    <div class="vs-side-header">
      <span class="vs-side-label">YOUR TEAM</span>
      <span class="vs-side-budget">$${state.budget} spent</span>
    </div>
    <div class="vs-card-list">${playerCards}</div>
  </div>

  <div class="vs-center">
    <div class="vs-text">VS</div>
    <div class="vs-snake-label">Snake Draft</div>
    <div class="vs-snake-pips">
      <span class="vs-pip done"  title="Your pick">🔵</span>
      <span class="vs-pip ai"    title="AI pick">🔴</span>
      <span class="vs-pip done"  title="Your pick">🔵</span>
      <span class="vs-pip ai"    title="AI pick">🔴</span>
      <span class="vs-pip done"  title="Your pick">🔵</span>
      <span class="vs-pip ai"    title="AI pick">🔴</span>
      <span class="vs-pip done"  title="Your pick">🔵</span>
      <span class="vs-pip ai"    title="AI pick">🔴</span>
      <span class="vs-pip done"  title="Your pick">🔵</span>
      <span class="vs-pip ai"    title="AI pick">🔴</span>
    </div>
  </div>

  <div class="vs-side ai-side">
    <div class="vs-side-header">
      <span class="vs-side-label">AI TEAM</span>
      <span class="vs-picking-badge" id="ai-status-badge">Picking…</span>
    </div>
    <div class="vs-card-list" id="ai-card-list">${aiSlots}</div>
  </div>

</div>`;
}

function revealAiPick(pokemon, index) {
  const slot = document.getElementById(`ai-slot-${index}`);
  if (!slot) return;

  slot.innerHTML = buildVsCard(pokemon);
  slot.classList.remove('empty');
  slot.classList.add('filled', 'pop-in');
  slot.addEventListener('animationend', () => slot.classList.remove('pop-in'), { once: true });

  // Update status badge
  const badge = document.getElementById('ai-status-badge');
  if (badge) {
    const remaining = (MAX_TEAM_SIZE - 1) - index;
    badge.textContent = remaining > 0 ? `${remaining} left…` : 'Done ✓';
    if (remaining === 0) badge.classList.add('done');
  }

  // Mark the corresponding AI pip as done
  const pips = document.querySelectorAll('.vs-pip.ai');
  if (pips[index]) pips[index].classList.add('done');
}

// ═══════════════════════════════════════════════════════════════
// RENDER — ITEM SELECTION
// ═══════════════════════════════════════════════════════════════
function renderItemSelection() {
  const grid = document.getElementById('pokemon-grid');

  const playerItemCards = ITEMS.map(item => {
    const selected = state.selectedItems.includes(item.id);
    return `
<div class="item-card${selected ? ' selected' : ''}" data-item-id="${item.id}">
  <span class="item-emoji">${item.emoji}</span>
  <div class="item-name">${item.name}</div>
  <div class="item-desc">${item.desc}</div>
  ${selected ? '<div class="item-check">✓</div>' : ''}
</div>`;
  }).join('');

  const aiItemCards = AI_DEFAULT_ITEMS.map(id => {
    const item = ITEMS.find(i => i.id === id);
    return `
<div class="item-card ai-item selected">
  <span class="item-emoji">${item.emoji}</span>
  <div class="item-name">${item.name}</div>
  <div class="item-desc">${item.desc}</div>
  <div class="item-check">✓</div>
</div>`;
  }).join('');

  const sel   = state.selectedItems.length;
  const ready = sel === 3;

  grid.innerHTML = `
<div class="item-select-view">

  <div class="item-select-player">
    <div class="item-select-header">
      <div>
        <div class="item-select-title">Choose Your Items</div>
        <div class="item-select-sub">Pick exactly 3 — single use each</div>
      </div>
      <span class="item-count-badge${ready ? ' ready' : ''}">${sel} / 3</span>
    </div>
    <div class="item-grid">${playerItemCards}</div>
    <button class="confirm-btn" id="confirm-items-btn" ${ready ? '' : 'disabled'}>
      ⚔️ Start Battle
    </button>
  </div>

  <div class="item-select-divider"></div>

  <div class="item-select-ai">
    <div class="item-select-header">
      <div>
        <div class="item-select-title">AI's Items</div>
        <div class="item-select-sub">Pre-selected</div>
      </div>
    </div>
    <div class="item-grid ai-item-grid">${aiItemCards}</div>
  </div>

</div>`;

  grid.querySelectorAll('.item-card:not(.ai-item)').forEach(card => {
    card.addEventListener('click', () => toggleItem(card.dataset.itemId));
  });

  const confirmBtn = document.getElementById('confirm-items-btn');
  if (confirmBtn) confirmBtn.addEventListener('click', confirmItems);
}

function toggleItem(itemId) {
  const idx = state.selectedItems.indexOf(itemId);
  if (idx >= 0) {
    state.selectedItems.splice(idx, 1);
  } else if (state.selectedItems.length < 3) {
    state.selectedItems.push(itemId);
  } else {
    showToast('Already selected 3 items — remove one first.', 'error');
    return;
  }
  renderItemSelection();
}

function confirmItems() {
  if (state.selectedItems.length !== 3) return;

  const playerItems = state.selectedItems.map(id => ITEMS.find(i => i.id === id));
  const aiItems     = AI_DEFAULT_ITEMS.map(id => ITEMS.find(i => i.id === id));

  if (typeof window.startBattle === 'function') {
    window.startBattle(state.team, state.aiTeam, playerItems, aiItems);
  } else {
    // Fallback if battle.js not loaded yet
    document.getElementById('draft-screen').classList.remove('active');
    document.getElementById('battle-screen').classList.add('active');
  }
}

// ═══════════════════════════════════════════════════════════════
// VISUAL FEEDBACK
// ═══════════════════════════════════════════════════════════════
function shakeCard(id) {
  const card = document.querySelector(`.pokemon-card[data-id="${id}"]`);
  if (!card) return;
  card.classList.remove('shake');
  void card.offsetWidth;
  card.classList.add('shake');
  card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
}

let toastTimer;
function showToast(msg, type = 'info') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = `toast ${type} visible`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2800);
}

// ═══════════════════════════════════════════════════════════════
// FILTER SETUP
// ═══════════════════════════════════════════════════════════════
function setupFilters() {
  const types = [...new Set(
    window.KANTO_POKEMON.flatMap(p => [p.type1, p.type2]).filter(Boolean)
  )].sort();

  const typeSelect = document.getElementById('filter-type');
  types.forEach(t => {
    const opt = document.createElement('option');
    opt.value       = t;
    opt.textContent = t.charAt(0).toUpperCase() + t.slice(1);
    typeSelect.appendChild(opt);
  });

  typeSelect.addEventListener('change', () => {
    state.filterType = typeSelect.value;
    renderGrid();
  });

  document.getElementById('filter-tier').addEventListener('change', e => {
    state.filterTier = e.target.value;
    renderGrid();
  });

  document.getElementById('filter-search').addEventListener('input', e => {
    state.filterSearch = e.target.value.trim();
    renderGrid();
  });
}

// ═══════════════════════════════════════════════════════════════
// LOCK-IN
// ═══════════════════════════════════════════════════════════════
function setupLockBtn() {
  document.getElementById('lock-btn').addEventListener('click', () => {
    if (state.team.length !== MAX_TEAM_SIZE || state.phase !== 'draft') return;
    startAiDraft();
  });
}

// ═══════════════════════════════════════════════════════════════
// BOOT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  setPhase('draft');
  setupFilters();
  setupLockBtn();
  renderGrid();
  renderSidebar();
});
