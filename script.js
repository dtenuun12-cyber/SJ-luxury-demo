// Upgraded collection renderer matching ultra-luxury cards
function renderPieces(pieces, selector) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = pieces.map(p => `
    <div class="piece reveal">
      <div class="piece-media"><span class="piece-media-label">${p.name}</span></div>
      <div class="piece-header">
        <span class="piece-tier">${p.tier}</span>
        <span class="piece-wood">${p.wood}</span>
      </div>
      <h3>${p.name}</h3>
      <div class="piece-subname">${p.subname}</div>
      <p class="piece-story">${p.story}</p>
      <button class="piece-link" onclick="document.getElementById('sj-concierge-launcher').click()">Inquire with Concierge &rarr;</button>
    </div>
  `).join('');
  
  document.querySelectorAll(selector + ' .reveal').forEach(el => {
    setTimeout(() => el.classList.add('active'), 50);
  });
}
