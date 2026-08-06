// SJ Luxury Collezione — Private Concierge Salon Drawer
(function () {
  const BUSINESS_NAME = 'SJ Luxury Collezione';
  const WELCOME_MESSAGE = "Welcome. I am your showroom concierge. How may I assist you with our craftsmanship, wood species, or selecting a piece for your home?";
  const WHATSAPP_NUMBER = '60123456789';

  function sealSVG() {
    return `<svg class="seal" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="36" height="36" rx="3" fill="#6B2318"/>
      <path d="M12 20c0-4 3-7 8-7s8 3 8 7-3 7-8 7-8-3-8-7z" fill="none" stroke="#FAF7F2" stroke-width="1.4"/>
      <circle cx="20" cy="20" r="3" fill="#FAF7F2"/>
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
      wa.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-2.978-1.49-4.933-2.659-6.905-6.068-.168-.292-.018-.45.127-.594.133-.133.297-.347.446-.521.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`;
      floatContainer.appendChild(wa);
    }

    const launcher = document.createElement('button');
    launcher.id = 'sj-concierge-launcher';
    launcher.setAttribute('aria-label', 'Open luxury concierge');
    launcher.innerHTML = sealSVG();
    floatContainer.appendChild(launcher);

    const panel = document.createElement('div');
    panel.id = 'sj-concierge-panel';
    panel.innerHTML = `
      <div class="gc-header">
        <div>
          <div class="gc-header-title">Showroom Concierge</div>
          <div class="gc-header-status"><span class="gc-status-dot"></span> Online &bull; ${BUSINESS_NAME}</div>
        </div>
        <button class="gc-close" aria-label="Close">&times;</button>
      </div>
      <div class="gc-body" id="gc-body"></div>
      <div class="gc-lead-bar">
        <button id="gc-lead-toggle" class="gc-lead-link">Book a Private Showroom Appointment &rarr;</button>
      </div>
      <div class="gc-input-row">
        <input type="text" id="gc-input" placeholder="Ask about timber, joinery, or custom sizing..." autocomplete="off">
        <button class="gc-send" id="gc-send">Send</button>
      </div>
    `;
    document.body.appendChild(panel);

    const body = panel.querySelector('#gc-body');
    const input = panel.querySelector('#gc-input');
    const sendBtn = panel.querySelector('#gc-send');
    const closeBtn = panel.querySelector('.gc-close');
    const leadToggle = panel.querySelector('#gc-lead-toggle');

    function renderSuggestionChips() {
      const chipWrap = document.createElement('div');
      chipWrap.className = 'gc-chips';
      chipWrap.innerHTML = `
        <button class="gc-chip" data-q="What is the difference between Huanghuali and Hóngmù?">Wood Species</button>
        <button class="gc-chip" data-q="How does traditional mortise-and-tenon joinery work?">Joinery Craft</button>
        <button class="gc-chip" data-q="Can pieces be made to custom dimensions?">Bespoke Orders</button>
      `;
      body.appendChild(chipWrap);
      chipWrap.querySelectorAll('.gc-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          input.value = btn.dataset.q;
          sendMessage();
        });
      });
    }

    function showLeadForm() {
      if (panel.querySelector('.gc-lead-form')) return;
      const el = document.createElement('div');
      el.className = 'gc-msg bot gc-lead-form';
      el.innerHTML = `
        <div style="margin-bottom:12px; font-weight: 500;">Provide your contact details and our showroom consultant will confirm your private viewing.</div>
        <input type="text" class="gc-lead-name" placeholder="Full Name" style="width:100%;margin-bottom:10px;padding:10px;border:1px solid var(--line);font-size:13px;font-family:var(--font-body);">
        <input type="tel" class="gc-lead-phone" placeholder="Phone Number / WhatsApp" style="width:100%;margin-bottom:12px;padding:10px;border:1px solid var(--line);font-size:13px;font-family:var(--font-body);">
        <button class="gc-lead-submit" style="width:100%;background:var(--ink);color:var(--bg);border:none;padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;cursor:pointer;font-weight:500;">Submit Request</button>
      `;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;

      el.querySelector('.gc-lead-submit').addEventListener('click', async () => {
        const name = el.querySelector('.gc-lead-name').value.trim();
        const phone = el.querySelector('.gc-lead-phone').value.trim();
        if (!name || !phone) return;
        const btn = el.querySelector('.gc-lead-submit');
        btn.textContent = 'Submitting...';
        btn.disabled = true;
        try {
          const endpoint = window.SJ_FORMSPREE_ENDPOINT;
          const results = await Promise.allSettled([
            fetch(endpoint, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
              body: JSON.stringify({ name, phone, source: 'Concierge chat — private viewing request' }),
            }),
            fetch('/api/notify-whatsapp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name, phone, note: 'Requested a private viewing via Concierge Salon' }),
            }),
          ]);
          const anyOk = results.some(r => r.status === 'fulfilled' && r.value.ok);
          el.innerHTML = anyOk
            ? `<div style="color:var(--rosewood); font-weight:500;">Thank you, ${name}. Our showroom consultant will contact you shortly to confirm your viewing.</div>`
            : `<div>Something went wrong — please connect with us directly via WhatsApp.</div>`;
        } catch (err) {
          el.innerHTML = `<div>Something went wrong — please connect with us directly via WhatsApp.</div>`;
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
        renderSuggestionChips();
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
        addMessage('bot', "My apologies, I'm having trouble connecting to the showroom system. Please reach us via WhatsApp.");
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
