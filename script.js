// Formspree endpoint used by the concierge's lead form and the consultation form.
// Get a free endpoint at https://formspree.io and paste it here.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
window.SJ_FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal Animations
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); 
      }
    });
  }, observerOptions);

  document.querySelectorAll('.reveal').forEach(el => {
    observer.observe(el);
  });

  // 2. Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // 3. Render Homepage Featured Collection (First 3 items)
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid && typeof COLLECTION !== 'undefined') {
    renderPieces(COLLECTION.slice(0, 3), '#featured-grid');
  }

  // 4. Render Full Collection on the Collections Page (All items)
  const fullGrid = document.getElementById('full-grid');
  if (fullGrid && typeof COLLECTION !== 'undefined') {
    renderPieces(COLLECTION, '#full-grid');
  }

  // 5. Consultation Request Form
  initConsultForm();
});

// Wires up the pill selectors and submit handling for consultation.html's
// qualification form. Was previously markup-only with no JS behind it.
function initConsultForm() {
  const form = document.getElementById('consult-form');
  if (!form) return;

  document.querySelectorAll('.pill-row').forEach(row => {
    const multi = row.dataset.multi === 'true';
    row.querySelectorAll('.pill').forEach(pill => {
      pill.setAttribute('role', 'button');
      pill.setAttribute('tabindex', '0');
      const toggle = () => {
        if (multi) {
          pill.classList.toggle('selected');
        } else {
          const wasSelected = pill.classList.contains('selected');
          row.querySelectorAll('.pill').forEach(p => p.classList.remove('selected'));
          if (!wasSelected) pill.classList.add('selected');
        }
        row.classList.remove('pill-row-error');
      };
      pill.addEventListener('click', toggle);
      pill.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });
    });
  });

  let statusEl = form.querySelector('.form-status');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.className = 'form-status';
    statusEl.setAttribute('role', 'status');
    form.appendChild(statusEl);
  }

  function selectedValues(rowId) {
    return Array.from(document.querySelectorAll(`#${rowId} .pill.selected`)).map(p => p.textContent.trim());
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: real visitors never fill this hidden field.
    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const propertyType = selectedValues('property-type');
    const interestedPieces = selectedValues('interested-pieces');
    const timeline = selectedValues('timeline');
    const budgetRange = selectedValues('budget-range');

    const requiredGroups = [
      ['property-type', propertyType],
      ['timeline', timeline],
      ['budget-range', budgetRange],
    ];
    let missing = false;
    requiredGroups.forEach(([rowId, values]) => {
      const row = document.getElementById(rowId);
      if (values.length === 0) {
        row.classList.add('pill-row-error');
        missing = true;
      }
    });
    if (missing) {
      statusEl.textContent = 'Please make a selection for each highlighted field above.';
      statusEl.className = 'form-status error';
      return;
    }

    const name = form.querySelector('#c-name').value.trim();
    const phone = form.querySelector('#c-phone').value.trim();
    const email = form.querySelector('#c-email').value.trim();
    const notes = form.querySelector('#c-notes').value.trim();

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    const summaryNote = [
      `Property: ${propertyType.join(', ')}`,
      `Interested in: ${interestedPieces.join(', ') || 'Not specified'}`,
      `Timeline: ${timeline.join(', ')}`,
      `Budget: ${budgetRange.join(', ')}`,
      notes ? `Notes: ${notes}` : null,
    ].filter(Boolean).join('\n');

    try {
      const endpoint = window.SJ_FORMSPREE_ENDPOINT;
      const results = await Promise.allSettled([
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            name, phone, email,
            property_type: propertyType.join(', '),
            interested_pieces: interestedPieces.join(', '),
            timeline: timeline.join(', '),
            budget_range: budgetRange.join(', '),
            notes,
            source: 'Consultation request form',
          }),
        }),
        fetch('/api/notify-whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, phone, email, note: summaryNote }),
        }),
      ]);
      const anyOk = results.some(r => r.status === 'fulfilled' && r.value.ok);
      if (anyOk) {
        form.innerHTML = `<div class="form-status success" role="status">Thank you, ${name}. A showroom consultant will be in touch shortly to confirm your consultation.</div>`;
      } else {
        statusEl.textContent = 'Something went wrong submitting your request — please reach us directly via WhatsApp.';
        statusEl.className = 'form-status error';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Request My Consultation';
      }
    } catch (err) {
      statusEl.textContent = 'Something went wrong submitting your request — please reach us directly via WhatsApp.';
      statusEl.className = 'form-status error';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Request My Consultation';
      console.error('Consultation form error:', err);
    }
  });
}

// Upgraded Collection Renderer with Image Support
function renderPieces(pieces, selector) {
  const container = document.querySelector(selector);
  if (!container) return;
  
  container.innerHTML = pieces.map(p => `
    <div class="piece reveal">
      <div class="piece-media">
        <img src="${p.image}" alt="${p.name} - ${p.wood}" loading="lazy">
      </div>
      <div class="piece-header">
        <span class="piece-tier">${p.tier || 'Signature Tier'}</span>
        <span class="piece-wood">${p.wood}</span>
      </div>
      <h3>${p.name}</h3>
      <div class="piece-subname">${p.subname || ''}</div>
      <p class="piece-story">${p.story}</p>
      <button class="piece-link" onclick="document.getElementById('sj-concierge-launcher').click()">Inquire with Concierge &rarr;</button>
    </div>
  `).join('');
  
  // Apply scroll reveal to newly generated cards
  setTimeout(() => {
    const dynamicObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(selector + ' .reveal').forEach(el => {
      dynamicObserver.observe(el);
    });
  }, 50); 
}
