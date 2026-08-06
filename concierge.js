// SJ Luxury Collezione — Luxury Furniture Concierge widget
(function () {
  const BUSINESS_NAME = 'SJ Luxury Collezione';
  const WELCOME_MESSAGE = "Welcome. I'm your concierge — happy to help you discover the right piece for your home, or answer any question about our craftsmanship and collections.";
  const WHATSAPP_NUMBER = '60123456789';

  function sealSVG() {
    return `<svg class="seal" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="3" fill="#6B2318"/>
      <path d="M12 20c0-4 3-7 8-7s8 3 8 7-3 7-8 7-8-3-8-7z" fill="none" stroke="#F5F1E7" stroke-width="1.4"/>
      <circle cx="20" cy="20" r="3" fill="#F5F1E7"/>
    </svg>`;
  }

  function initConcierge() {
    let floatContainer = document.querySelector('.floating-actions');
    if (!floatContainer) {
      floatContainer = document.createElement('div');
      floatContainer.className = 'floating-actions';
      document.body.appendChild(floatContainer);
    }

    if (!document.getElementById('sj-whatsapp-btn')) {
      const wa = document.createElement('a');
      wa.id = 'sj-whatsapp-btn';
      wa.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello, I would like to enquire about a piece from SJ Luxury Collezione.')}`;
      wa.target = '_blank';
      wa.rel = 'noopener';
      wa.setAttribute('aria-label', 'Chat on WhatsApp');
      wa.innerHTML = '&#128241;';
      floatContainer.appendChild(wa);
    }

    const launcher = document.createElement('button');
    launcher.id = 'sj-concierge-launcher';
    launcher.setAttribute('aria-label', 'Open concierge');
    launcher.innerHTML = sealSVG();
    floatContainer.appendChild(launcher);

    const panel = document.createElement('div');
    panel.id = 'sj-concierge-panel';
    panel.innerHTML = `
      <div class="gc-header">
        <div>
          <div class="gc-header-title">Luxury Furniture Concierge</div>
          <div class="gc-header-sub">${BUSINESS_NAME}</div>
        </div>
        <button class="gc-close" aria-label="Close">&times;</button>
      </div>
      <div class="gc-body" id="gc-body"></div>
      <div class="gc-lead-bar">
        <button id="gc-lead-toggle" class="gc-lead-link">Request a Private Consultation &rarr;</button>
      </div>
      <div class="gc-input-row">
        <input type="text" id="gc-input" placeholder="Ask about a piece, wood, or craftsmanship..." autocomplete="off">
        <button class="gc-send" id="gc-send">Send</button>
      </div>
    `;
    document.body.appendChild(panel);

    const body = panel.querySelector('#gc-body');
    const input = panel.querySelector('#gc-input');
    const sendBtn = panel.querySelector('#gc-send');
    const closeBtn = panel.querySelector('.gc-close');
    const leadToggle = panel.querySelector('#gc-lead-toggle');

    function showLeadForm() {
      if (panel.querySelector('.gc-lead-form')) return;
      const el = document.createElement('div');
      el.className = 'gc-msg bot gc-lead-form';
      el.innerHTML = `
        <div style="margin-bottom:10px;">Leave your name and number, and our showroom consultant will reach out to arrange a private viewing.</div>
        <input type="text" class="gc-lead-name" placeholder="Your name" style="width:100%;margin-bottom:8px;padding:9px;border:1px solid var(--line);font-size:13px;font-family:var(--font-body);">
        <input type="tel" class="gc-lead-phone" placeholder="Phone number" style="width:100%;margin-bottom:10px;padding:9px;border:1px solid var(--line);font-size:13px;font-family:var(--font-body);">
        <button class="gc-lead-submit" style="width:100%;background:var(--ink);color:var(--bg);border:none;padding:11px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;">Send to Concierge</button>
      `;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;

      el.querySelector('.gc-lead-submit').addEventListener('click', async () => {
        const name = el.querySelector('.gc-lead-name').value.trim();
        const phone = el.querySelector('.gc-lead-phone').value.trim();
        if (!name || !phone) return;
        const btn = el.querySelector('.gc-lead-submit');
        btn.textContent = 'Sending...';
        btn.disabled = true;
        try {
          const endpoint = window.SJ_FORMSPREE_ENDPOINT;
          const results = await Promise.allSettled([
            fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ name, phone, source: 'Concierge chat — consultation request' }),
            }),
            fetch('/api/notify-whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, phone, note: 'Requested a private consultation via concierge chat' }),
            }),
          ]);
          const anyOk = results.some(r => r.status === 'fulfilled' && r.value.ok);
          el.innerHTML = anyOk
            ? `<div>Thank you, ${name}. Our showroom consultant will be in touch shortly.</div>`
            : `<div>Something went wrong — please reach us directly via the WhatsApp button.</div>`;
        } catch (err) {
          el.innerHTML = `<div>Something went wrong — please reach us directly via the WhatsApp button.</div>`;
          console.error('Lead form error:', err);
        }
      });
    }

    leadToggle.addEventListener('click', showLeadForm);

    let history = [];
    let opened = false;

    function addMessage(role, text) {
      const el = document.createElement('div');
      el.className = 'gc-msg ' + (role === 'user' ? 'user' : 'bot');
      el.textContent = text;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return el;
    }

    function openPanel() {
      panel.classList.add('open');
      if (!opened) {
        addMessage('bot', WELCOME_MESSAGE);
        opened = true;
      }
      input.focus();
    }

    launcher.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', () => panel.classList.remove('open'));

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      addMessage('user', text);
      history.push({ role: 'user', content: text });
      input.value = '';
      sendBtn.disabled = true;

      const typingEl = document.createElement('div');
      typingEl.className = 'gc-msg bot typing';
      typingEl.textContent = 'The concierge is composing a reply...';
      body.appendChild(typingEl);
      body.scrollTop = body.scrollHeight;

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        typingEl.remove();
        addMessage('bot', data.reply);
        history.push({ role: 'assistant', content: data.reply });
      } catch (err) {
        typingEl.remove();
        addMessage('bot', "My apologies, I'm having trouble connecting. Please reach us via WhatsApp or the consultation form.");
        console.error('Concierge error:', err);
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConcierge);
  } else {
    initConcierge();
  }
})();
