// SJ Luxury Collezione — shared site behavior
const WHATSAPP_NUMBER = '60123456789';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';

document.addEventListener('DOMContentLoaded', () => {
  // ---- Mobile nav ----
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  // ---- Scroll reveal ----
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // ---- Render collection grid (home = first 3, collections page = all) ----
  const featuredGrid = document.querySelector('#featured-grid');
  if (featuredGrid && window.SJ_COLLECTION) {
    renderPieces(window.SJ_COLLECTION.slice(0, 3), '#featured-grid');
  }
  const fullGrid = document.querySelector('#collection-grid');
  if (fullGrid && window.SJ_COLLECTION) {
    renderPieces(window.SJ_COLLECTION, '#collection-grid');
  }

  // ---- Qualification / consultation form ----
  const consultForm = document.querySelector('#consult-form');
  if (consultForm) {
    setupPillGroups();

    consultForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = consultForm.querySelector('button[type="submit"]');
      const original = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Sending your request...';

      const payload = {
        name: consultForm.querySelector('#c-name').value,
        email: consultForm.querySelector('#c-email').value,
        phone: consultForm.querySelector('#c-phone').value,
        property_type: getSelectedPills('#property-type'),
        interested_pieces: getSelectedPills('#interested-pieces'),
        timeline: getSelectedPills('#timeline'),
        budget_range: getSelectedPills('#budget-range'),
        notes: consultForm.querySelector('#c-notes').value,
      };

      try {
        const results = await Promise.allSettled([
          fetch(FORMSPREE_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify(payload),
          }),
          fetch('/api/notify-whatsapp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: payload.name,
              phone: payload.phone,
              note: `Consultation request — Property: ${payload.property_type || 'n/a'} | Interested: ${payload.interested_pieces || 'n/a'} | Timeline: ${payload.timeline || 'n/a'} | Budget: ${payload.budget_range || 'n/a'}`,
            }),
          }),
        ]);
        const anyOk = results.some(r => r.status === 'fulfilled' && r.value.ok);
        if (anyOk) {
          btn.textContent = 'Request received — our concierge will be in touch';
          consultForm.reset();
          document.querySelectorAll('.pill.selected').forEach(p => p.classList.remove('selected'));
        } else {
          btn.textContent = 'Something went wrong — please WhatsApp us instead';
        }
      } catch (err) {
        console.error('Consultation form error:', err);
        btn.textContent = 'Something went wrong — please WhatsApp us instead';
      } finally {
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 5000);
      }
    });
  }
});

function setupPillGroups() {
  document.querySelectorAll('.pill-row').forEach(group => {
    const multi = group.dataset.multi === 'true';
    group.querySelectorAll('.pill').forEach(pill => {
      pill.addEventListener('click', () => {
        if (!multi) {
          group.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
        }
        pill.classList.toggle('selected');
      });
    });
  });
}

function getSelectedPills(containerId) {
  const group = document.querySelector(containerId);
  if (!group) return '';
  return Array.from(group.querySelectorAll('.pill.selected')).map(p => p.textContent).join(', ');
}

function renderPieces(pieces, selector) {
  const container = document.querySelector(selector);
  if (!container) return;
  container.innerHTML = pieces.map(p => `
    <div class="piece reveal">
      <div class="piece-media"><span class="piece-media-label">${p.name}</span></div>
      <span class="piece-tier">${p.tier}</span>
      <h3>${p.name}</h3>
      <div class="piece-subname">${p.subname}</div>
      <p class="piece-story">${p.story}</p>
      <div class="piece-wood">${p.wood} &middot; ${p.room}</div>
      <button class="piece-link" onclick="document.getElementById('sj-concierge-launcher').click()">Ask the Concierge &rarr;</button>
    </div>
  `).join('');
  // newly injected .reveal elements need observing
  document.querySelectorAll(selector + ' .reveal').forEach(el => {
    setTimeout(() => el.classList.add('active'), 50);
  });
}

window.SJ_FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT;
window.SJ_WHATSAPP_NUMBER = WHATSAPP_NUMBER;
