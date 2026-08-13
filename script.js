// Formspree endpoint used by the concierge's lead form and the consultation form.
// Get a free endpoint at https://formspree.io and paste it here.
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID';
window.SJ_FORMSPREE_ENDPOINT = FORMSPREE_ENDPOINT;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Reveals elements that share a parent in a short cascade instead of all at
// once — e.g. the four craft-steps step in left-to-right rather than popping
// in together. Capped so a long list (the full collection grid) doesn't end
// up with an awkwardly long tail.
function revealStaggered(el) {
  if (!prefersReducedMotion && el.parentElement) {
    const siblings = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 420) + 'ms';
  }
  el.classList.add('active');
}

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
        revealStaggered(entry.target);
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

  // 2b. Condense the sticky nav once the page has scrolled past the hero
  const navHeader = document.querySelector('.nav-header');
  if (navHeader) {
    const updateNavState = () => navHeader.classList.toggle('scrolled', window.scrollY > 24);
    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
  }

  // 2c. Hero parallax — the decorative glow layer drifts slower than the
  // page scrolls, a depth cue in place of a (nonexistent) hero photo.
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg && !prefersReducedMotion) {
    let ticking = false;
    const updateParallax = () => {
      heroBg.style.transform = `translateY(${window.scrollY * 0.25}px)`;
      ticking = false;
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
  }

  // 2d. Wood Species sticky split-screen (heritage.html only) — pins a
  // panel showing the wood currently in view as the descriptions scroll.
  initWoodPin();

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

  // 6. Custom cursor (desktop only, see initCustomCursor for the guards)
  initCustomCursor();
});

// A delicate, inverted-color ring cursor that expands over clickable
// elements. Desktop-only (fine pointer + hover-capable) so it never breaks
// touch interaction, skipped under prefers-reduced-motion, and the native
// cursor is explicitly restored over text inputs so typing still shows a
// normal I-beam instead of vanishing.
function initCustomCursor() {
  if (prefersReducedMotion) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  document.documentElement.classList.add('custom-cursor-active');
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  document.body.appendChild(cursor);

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ticking = false;
  let shown = false;

  const paint = () => {
    cursor.style.transform = `translate(${targetX}px, ${targetY}px) translate(-50%, -50%)`;
    ticking = false;
  };

  document.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!shown) { cursor.classList.add('visible'); shown = true; }
    if (!ticking) { requestAnimationFrame(paint); ticking = true; }
  });
  document.addEventListener('mouseleave', () => { cursor.classList.remove('visible'); shown = false; });

  const hoverSelector = 'a, button, .pill, .gc-chip, .piece, .piece-media';
  const textSelector = 'input, textarea, select';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverSelector)) cursor.classList.add('hover');
    if (e.target.closest(textSelector)) cursor.classList.add('text-context');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverSelector)) cursor.classList.remove('hover');
    if (e.target.closest(textSelector)) cursor.classList.remove('text-context');
  });
}

// Sticky split-screen for heritage.html's Wood Species section: a pinned
// panel on the left updates to name whichever wood entry is centered in
// the viewport on the right, tracked via IntersectionObserver.
function initWoodPin() {
  const rows = document.querySelectorAll('#wood-table .wood-row');
  const pinName = document.getElementById('wood-pin-name');
  const pinSwatch = document.getElementById('wood-pin-swatch');
  if (!rows.length || !pinName || !pinSwatch) return;

  const setActive = (row) => {
    pinName.textContent = row.dataset.wood;
    pinSwatch.style.background = row.dataset.tone;
  };
  setActive(rows[0]);

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target);
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  rows.forEach(row => observer.observe(row));
}

// Wires up the pill selectors, step navigation, and submit handling for
// consultation.html's invitation-style form: one question at a time
// (Typeform-style) instead of every field at once.
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

  // ---- Step navigation (skipped entirely if this page doesn't use the
  // multi-step markup, so this function still works on older layouts) ----
  const steps = Array.from(form.querySelectorAll('.form-step'));
  const backBtn = document.getElementById('form-back');
  const continueBtn = document.getElementById('form-continue');
  const submitBtn = document.getElementById('form-submit');
  const progressBar = document.getElementById('form-progress-bar');
  const stepCount = document.getElementById('form-step-count');
  let currentStep = 1;

  if (steps.length && backBtn && continueBtn && submitBtn) {
    const showStep = (n) => {
      steps.forEach(s => s.classList.toggle('active', Number(s.dataset.step) === n));
      backBtn.style.visibility = n === 1 ? 'hidden' : 'visible';
      continueBtn.style.display = n === steps.length ? 'none' : '';
      submitBtn.style.display = n === steps.length ? '' : 'none';
      if (progressBar) progressBar.style.width = (n / steps.length * 100) + '%';
      if (stepCount) stepCount.textContent = `Question ${n} of ${steps.length}`;
      const firstInput = steps[n - 1].querySelector('input, textarea');
      if (firstInput && !prefersReducedMotion) firstInput.focus({ preventScroll: true });
    };

    const stepIsValid = (n) => {
      const step = steps[n - 1];
      const requiredPillRow = step.querySelector('.pill-row[data-multi="false"]');
      if (requiredPillRow && !requiredPillRow.querySelector('.pill.selected')) {
        requiredPillRow.classList.add('pill-row-error');
        return false;
      }
      const requiredInputs = step.querySelectorAll('input[required]');
      for (const input of requiredInputs) {
        if (!input.checkValidity()) { input.reportValidity(); return false; }
      }
      return true;
    };

    const advance = () => {
      if (!stepIsValid(currentStep)) return;
      if (currentStep < steps.length) { currentStep++; showStep(currentStep); }
    };

    continueBtn.addEventListener('click', advance);
    backBtn.addEventListener('click', () => {
      if (currentStep > 1) { currentStep--; showStep(currentStep); }
    });
    // Enter-to-advance only on text inputs (name/phone/email) — pills handle
    // their own Enter to toggle selection, and must not also bubble into
    // advancing past a multi-select step after picking just one option.
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        if (currentStep < steps.length) advance();
      }
    });

    showStep(currentStep);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: real visitors never fill this hidden field.
    const honeypot = form.querySelector('input[name="_gotcha"]');
    if (honeypot && honeypot.value) return;

    const propertyType = selectedValues('property-type');
    const interestedPieces = selectedValues('interested-pieces');
    const timeline = selectedValues('timeline');
    const budgetRange = selectedValues('budget-range');

    const name = form.querySelector('#c-name').value.trim();
    const phone = form.querySelector('#c-phone').value.trim();
    const email = form.querySelector('#c-email').value.trim();
    const notes = form.querySelector('#c-notes').value.trim();

    const activeSubmitBtn = form.querySelector('button[type="submit"]');
    activeSubmitBtn.disabled = true;
    activeSubmitBtn.textContent = 'Submitting...';
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
          revealStaggered(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll(selector + ' .reveal').forEach(el => {
      dynamicObserver.observe(el);
    });
  }, 50); 
}
