'use strict';

// ═══════════════════════════════════════════════════════════════
// BATTLE — Session 3
// ═══════════════════════════════════════════════════════════════

window.startBattle = function(playerTeam, aiTeam, playerItems, aiItems) {
  // Store for battle engine (Session 3)
  window.BATTLE_DATA = { playerTeam, aiTeam, playerItems, aiItems };

  // Switch screens
  document.getElementById('draft-screen').classList.remove('active');
  document.getElementById('battle-screen').classList.add('active');

  // Render the placeholder until battle engine is built
  renderBattlePlaceholder();
};

function renderBattlePlaceholder() {
  const screen = document.getElementById('battle-screen');

  const data = window.BATTLE_DATA;
  const playerNames = data.playerTeam.map(p => `${p.emoji} ${p.name}`).join(', ');
  const aiNames     = data.aiTeam.map(p => `${p.emoji} ${p.name}`).join(', ');
  const playerItemNames = data.playerItems.map(i => i.name).join(', ');
  const aiItemNames     = data.aiItems.map(i => i.name).join(', ');

  screen.innerHTML = `
<div class="battle-placeholder">
  <div class="bp-icon">⚔️</div>
  <div class="bp-title">Battle Ready!</div>
  <div class="bp-sub">Full battle engine coming in Session 3</div>
  <div class="bp-teams">
    <div class="bp-team">
      <div class="bp-team-label">YOUR TEAM</div>
      <div class="bp-team-names">${playerNames}</div>
      <div class="bp-team-items">🎒 ${playerItemNames}</div>
    </div>
    <div class="bp-vs">VS</div>
    <div class="bp-team">
      <div class="bp-team-label">AI TEAM</div>
      <div class="bp-team-names">${aiNames}</div>
      <div class="bp-team-items">🎒 ${aiItemNames}</div>
    </div>
  </div>
</div>`;
}
