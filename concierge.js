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
      <div class="gc-body" id="gc-body" role="log" aria-live="polite" aria-relevant="additions"></div>
      <div class="gc-lead-bar">
        <button id="gc-lead-toggle" class="gc-lead-link">Book a Private Showroom Appointment &rarr;</button>
      </div>
      <div class="gc-input-row">
        <button type="button" id="gc-photo-btn" class="gc-photo-btn" aria-label="Upload a photo of your room" title="Upload a room photo">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8a2 2 0 0 1 2-2h1.2a1 1 0 0 0 .86-.5l.9-1.5a1 1 0 0 1 .86-.5h4.36a1 1 0 0 1 .86.5l.9 1.5a1 1 0 0 0 .86.5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z"/><circle cx="12" cy="13" r="3.4"/></svg>
        </button>
        <input type="file" id="gc-photo-input" accept="image/*" capture="environment" class="gc-file-input" tabindex="-1">
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
    const photoBtn = panel.querySelector('#gc-photo-btn');
    const photoInput = panel.querySelector('#gc-photo-input');

    function renderSuggestionChips() {
      const chipWrap = document.createElement('div');
      chipWrap.className = 'gc-chips';
      chipWrap.innerHTML = `
        <button class="gc-chip" data-q="What is the difference between Huanghuali and Hóngmù?">Wood Species</button>
        <button class="gc-chip" data-q="How does traditional mortise-and-tenon joinery work?">Joinery Craft</button>
        <button class="gc-chip" data-q="Can pieces be made to custom dimensions?">Bespoke Orders</button>
        <button class="gc-chip gc-chip-photo" data-action="upload-photo">Match a Room Photo</button>
      `;
      body.appendChild(chipWrap);
      chipWrap.querySelectorAll('.gc-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.action === 'upload-photo') {
            photoInput.click();
            return;
          }
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
        <input type="text" class="gc-lead-hp" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;width:1px;height:1px;">
        <button class="gc-lead-submit" style="width:100%;background:var(--ink);color:var(--bg);border:none;padding:12px;font-size:11px;text-transform:uppercase;letter-spacing:0.14em;cursor:pointer;font-weight:500;">Submit Request</button>
      `;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;

      el.querySelector('.gc-lead-submit').addEventListener('click', async () => {
        const name = el.querySelector('.gc-lead-name').value.trim();
        const phone = el.querySelector('.gc-lead-phone').value.trim();
        const gotcha = el.querySelector('.gc-lead-hp').value;
        if (!name || !phone) return;
        if (gotcha) return; // honeypot tripped — silently drop
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

    // Conversation persists across page navigation (sessionStorage — same tab,
    // cleared when it closes) so browsing from Home to Heritage to Collections
    // doesn't reset the concierge mid-conversation. Image uploads/recommendation
    // cards are deliberately excluded to keep storage small.
    const STORAGE_KEY = 'sj_concierge_state';

    function loadState() {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null;
      }
    }

    function saveState() {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
          history: history.slice(-20),
          transcript: transcript.slice(-40),
          opened,
          panelOpen: panel.classList.contains('open'),
        }));
      } catch (err) {
        // sessionStorage unavailable (private browsing, quota) — conversation
        // just won't survive a page navigation, which is a safe fallback.
      }
    }

    let history = [];
    let transcript = [];
    let opened = false;

    function addMessage(role, text) {
      const el = document.createElement('div');
      el.className = 'gc-msg ' + (role === 'user' ? 'user' : 'bot');
      el.textContent = text;
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      transcript.push({ role, text });
      saveState();
      return el;
    }

    function openPanel() {
      panel.classList.add('open');
      if (!opened) {
        addMessage('bot', WELCOME_MESSAGE);
        renderSuggestionChips();
        opened = true;
      }
      saveState();
      input.focus();
    }

    // Replay any conversation saved earlier in this browser tab.
    const saved = loadState();
    if (saved && Array.isArray(saved.transcript) && saved.transcript.length) {
      history = Array.isArray(saved.history) ? saved.history : [];
      opened = true;
      saved.transcript.forEach(m => {
        const el = document.createElement('div');
        el.className = 'gc-msg ' + (m.role === 'user' ? 'user' : 'bot');
        el.textContent = m.text;
        body.appendChild(el);
        transcript.push(m);
      });
      body.scrollTop = body.scrollHeight;
      if (saved.panelOpen) panel.classList.add('open');
    }

    launcher.addEventListener('click', openPanel);
    closeBtn.addEventListener('click', () => { panel.classList.remove('open'); saveState(); });

    async function sendMessage() {
      const text = input.value.trim();
      if (!text) return;
      addMessage('user', text);
      history.push({ role: 'user', content: text });
      saveState();
      input.value = '';
      sendBtn.disabled = true;

      const typingEl = document.createElement('div');
      typingEl.className = 'gc-msg bot typing';
      typingEl.textContent = 'The concierge is composing a reply...';
      body.appendChild(typingEl);
      body.scrollTop = body.scrollHeight;

      let botEl = null;
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });
        if (!res.ok || !res.body) throw new Error('Request failed');

        typingEl.remove();
        botEl = document.createElement('div');
        botEl.className = 'gc-msg bot streaming';
        body.appendChild(botEl);
        body.scrollTop = body.scrollHeight;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let full = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          full += decoder.decode(value, { stream: true });
          botEl.textContent = full;
          body.scrollTop = body.scrollHeight;
        }
        botEl.classList.remove('streaming');

        if (!full.trim()) full = "My apologies, I couldn't process that just now.";
        botEl.textContent = full;

        transcript.push({ role: 'bot', text: full });
        history.push({ role: 'assistant', content: full });
        saveState();
      } catch (err) {
        typingEl.remove();
        if (botEl) botEl.remove();
        addMessage('bot', "My apologies, I'm having trouble connecting to the showroom system. Please reach us via WhatsApp.");
        console.error('Concierge error:', err);
      } finally {
        sendBtn.disabled = false;
      }
    }

    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

    // ---- Room-photo recommendations ----
    // Downscales the photo client-side (max 1024px, JPEG ~0.72 quality) before
    // it's base64-encoded, so uploads stay well under Vercel's request body
    // limit and the vision model gets a fast, focused image to work from.
    function compressImage(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('Could not read file'));
        reader.onload = () => {
          const img = new Image();
          img.onerror = () => reject(new Error('Could not decode image'));
          img.onload = () => {
            const maxDim = 1024;
            let { width, height } = img;
            if (width > maxDim || height > maxDim) {
              const scale = maxDim / Math.max(width, height);
              width = Math.round(width * scale);
              height = Math.round(height * scale);
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            canvas.getContext('2d').drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.72));
          };
          img.src = reader.result;
        };
        reader.readAsDataURL(file);
      });
    }

    function addImageMessage(dataUrl) {
      const el = document.createElement('div');
      el.className = 'gc-msg user gc-msg-image';
      const img = document.createElement('img');
      img.src = dataUrl;
      img.alt = 'Photo of your room';
      el.appendChild(img);
      body.appendChild(el);
      body.scrollTop = body.scrollHeight;
      return el;
    }

    function renderRecommendedPieces(pieces) {
      if (!pieces || !pieces.length) return;
      const wrap = document.createElement('div');
      wrap.className = 'gc-piece-cards';
      wrap.innerHTML = pieces.map(p => `
        <button type="button" class="gc-piece-card">
          <img src="${p.image}" alt="${p.name}" loading="lazy">
          <span class="gc-piece-card-body">
            <span class="gc-piece-card-tier">${p.tier}</span>
            <span class="gc-piece-card-name">${p.name}</span>
          </span>
        </button>
      `).join('');
      body.appendChild(wrap);
      body.scrollTop = body.scrollHeight;
      wrap.querySelectorAll('.gc-piece-card').forEach(card => {
        card.addEventListener('click', showLeadForm);
      });
    }

    photoBtn.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', async () => {
      const file = photoInput.files && photoInput.files[0];
      photoInput.value = ''; // allow re-selecting the same file next time
      if (!file) return;

      if (!opened) openPanel();

      if (!file.type.startsWith('image/')) {
        addMessage('bot', "That doesn't look like a photo — please upload a JPG or PNG of your room.");
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        addMessage('bot', 'That photo is quite large — could you try a smaller one?');
        return;
      }

      let dataUrl;
      try {
        dataUrl = await compressImage(file);
      } catch (err) {
        console.error('Image compression error:', err);
        addMessage('bot', "I couldn't read that photo — please try a different one.");
        return;
      }

      addImageMessage(dataUrl);
      const noteFromInput = input.value.trim();
      input.value = '';

      const typingEl = document.createElement('div');
      typingEl.className = 'gc-msg bot typing';
      typingEl.textContent = 'Studying your room...';
      body.appendChild(typingEl);
      body.scrollTop = body.scrollHeight;

      try {
        const res = await fetch('/api/room-recommend', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: dataUrl, note: noteFromInput }),
        });
        typingEl.remove();
        if (!res.ok) throw new Error('Request failed');
        const data = await res.json();
        addMessage('bot', data.reply);
        renderRecommendedPieces(data.pieces);

        // Fold the exchange into the regular text conversation (minus the
        // image itself) so follow-up chat messages have context on what was
        // recommended, without re-sending the photo through /api/chat.
        history.push({
          role: 'user',
          content: noteFromInput
            ? `[Uploaded a photo of my room] ${noteFromInput}`
            : '[Uploaded a photo of my room for style recommendations]',
        });
        history.push({ role: 'assistant', content: data.reply });
        saveState();
      } catch (err) {
        typingEl.remove();
        addMessage('bot', "My apologies, I'm having trouble analyzing that photo right now. Please reach us via WhatsApp, or describe your room instead.");
        console.error('Room recommend error:', err);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initConcierge);
  } else {
    initConcierge();
  }
})();
