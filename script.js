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
});

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
