document.addEventListener('DOMContentLoaded', () => {
  // 1. Scroll Reveal Animations (Fixes the missing text issue)
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15 // Triggers when 15% of the element is visible
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // Stop observing once it has animated in
      }
    });
  }, observerOptions);

  // Grab all elements with the 'reveal' class and observe them
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

  // 3. Render Homepage Featured Collection
  // (Ensures products-data.js is loaded and the grid exists)
  const featuredGrid = document.getElementById('featured-grid');
  if (featuredGrid && typeof COLLECTION !== 'undefined') {
    // Render the first 3 items on the homepage
    renderPieces(COLLECTION.slice(0, 3), '#featured-grid');
  }
});

// 4. Upgraded Collection Renderer
function renderPieces(pieces, selector) {
  const container = document.querySelector(selector);
  if (!container) return;
  
  container.innerHTML = pieces.map(p => `
    <div class="piece reveal">
      <div class="piece-media"><span class="piece-media-label">${p.name}</span></div>
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
  
  // Apply the scroll reveal observer to the newly generated dynamic product cards
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
  }, 50); // Slight delay to ensure DOM is updated
}
