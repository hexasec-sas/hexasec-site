(() => {
  'use strict';

  const API_URL = 'https://chat.hexasecsas.com/api/chat/message';
  const STORAGE_SESSION = 'hexabot_session_v22';
  const STORAGE_HISTORY = 'hexabot_history_v22';
  const MAX_HISTORY = 30;

  const widget = document.getElementById('hexabot-widget');
  const toggle = document.getElementById('hexabot-toggle');
  const panel = document.getElementById('hexabot-panel');
  const closeBtn = document.getElementById('hexabot-close');
  const messages = document.getElementById('hexabot-messages');
  const form = document.getElementById('hexabot-form');
  const input = document.getElementById('hexabot-input');
  const sendBtn = document.getElementById('hexabot-send');
  const status = document.getElementById('hexabot-status');
  const clearBtn = document.getElementById('hexabot-clear');

  if (!widget || !toggle || !panel || !closeBtn || !messages || !form || !input || !sendBtn) return;

  const lang = widget.dataset.lang === 'en' ? 'en' : 'es';
  const copy = lang === 'en'
    ? {
        hello: 'Hi 👋 I’m HexaBot, HexaSec’s virtual assistant. I can guide you on cybersecurity audits, vulnerability assessments, ISO/IEC 27001:2022 and GAP diagnostics. How can I help?',
        placeholder: 'Type your message…',
        typing: 'HexaBot is typing…',
        online: 'Online',
        ready: 'Ready to help',
        error: 'I’m having trouble connecting right now. Please try again in a moment or use HexaSec’s contact form.',
        empty: 'Write a message before sending.',
        local: 'To test HexaBot locally, open the site through a local web server instead of file://.',
        clearConfirm: 'Start a new conversation?',
      }
    : {
        hello: 'Hola 👋 Soy HexaBot, el asistente virtual de HexaSec. Puedo orientarte sobre auditorías de ciberseguridad, análisis de vulnerabilidades, ISO/IEC 27001:2022 y diagnóstico GAP. ¿Cómo puedo ayudarte?',
        placeholder: 'Escribe tu mensaje…',
        typing: 'HexaBot está escribiendo…',
        online: 'En línea',
        ready: 'Listo para ayudarte',
        error: 'Estoy teniendo una dificultad temporal para conectarme. Intenta nuevamente en un momento o utiliza el formulario de contacto de HexaSec.',
        empty: 'Escribe un mensaje antes de enviar.',
        local: 'Para probar HexaBot localmente, abre el sitio mediante un servidor web local y no con file://.',
        clearConfirm: '¿Iniciar una conversación nueva?',
      };

  input.placeholder = copy.placeholder;

  const makeSessionId = () => {
    if (window.crypto?.randomUUID) return `web-${window.crypto.randomUUID()}`;
    return `web-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  };

  const getSessionId = () => {
    try {
      let id = localStorage.getItem(STORAGE_SESSION);
      if (!id || !/^[A-Za-z0-9_-]{8,80}$/.test(id)) {
        id = makeSessionId().slice(0, 80);
        localStorage.setItem(STORAGE_SESSION, id);
      }
      return id;
    } catch {
      return makeSessionId().slice(0, 80);
    }
  };

  let sessionId = getSessionId();
  let busy = false;

  const escapeHtml = (value) => String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Render a deliberately small, safe Markdown subset: bold, inline code, bullets and line breaks.
  const renderText = (value) => {
    const safe = escapeHtml(value || '');
    const lines = safe.split(/\r?\n/);
    let html = '';
    let inList = false;

    const inline = (line) => line
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/`([^`]+)`/g, '<code>$1</code>');

    lines.forEach((line) => {
      const bullet = line.match(/^\s*[-•]\s+(.+)/);
      if (bullet) {
        if (!inList) {
          html += '<ul>';
          inList = true;
        }
        html += `<li>${inline(bullet[1])}</li>`;
        return;
      }

      if (inList) {
        html += '</ul>';
        inList = false;
      }

      if (!line.trim()) {
        html += '<div class="hexabot-spacer" aria-hidden="true"></div>';
      } else {
        html += `<p>${inline(line)}</p>`;
      }
    });

    if (inList) html += '</ul>';
    return html;
  };

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messages.scrollTop = messages.scrollHeight;
    });
  };

  const saveHistory = () => {
    try {
      const history = [...messages.querySelectorAll('.hexabot-message[data-role]')]
        .map((node) => ({
          role: node.dataset.role,
          text: node.dataset.raw || '',
        }))
        .filter((item) => item.text)
        .slice(-MAX_HISTORY);
      localStorage.setItem(STORAGE_HISTORY, JSON.stringify(history));
    } catch {
      // Storage is optional; chat still works without it.
    }
  };

  const appendMessage = (role, text, options = {}) => {
    const row = document.createElement('div');
    row.className = `hexabot-message hexabot-message--${role}`;
    row.dataset.role = role;
    row.dataset.raw = text;

    const avatar = document.createElement('div');
    avatar.className = 'hexabot-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = role === 'assistant' ? 'H' : 'Tú';

    const bubble = document.createElement('div');
    bubble.className = 'hexabot-bubble';
    bubble.innerHTML = renderText(text);

    if (role === 'assistant') {
      row.append(avatar, bubble);
    } else {
      row.append(bubble, avatar);
    }

    messages.appendChild(row);
    if (!options.skipSave) saveHistory();
    scrollToBottom();
    return row;
  };

  const restoreHistory = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_HISTORY) || '[]');
      if (Array.isArray(parsed) && parsed.length) {
        parsed.slice(-MAX_HISTORY).forEach((item) => {
          if ((item.role === 'assistant' || item.role === 'user') && typeof item.text === 'string') {
            appendMessage(item.role, item.text, { skipSave: true });
          }
        });
        return;
      }
    } catch {
      // Ignore malformed history.
    }
    appendMessage('assistant', copy.hello);
  };

  const setStatus = (text, mode = 'ready') => {
    if (!status) return;
    status.textContent = text;
    status.dataset.mode = mode;
  };

  const setBusy = (value) => {
    busy = value;
    sendBtn.disabled = value;
    input.disabled = value;
    form.classList.toggle('is-busy', value);
    setStatus(value ? copy.typing : copy.ready, value ? 'typing' : 'ready');
  };

  let typingRow = null;
  const showTyping = () => {
    typingRow = document.createElement('div');
    typingRow.className = 'hexabot-message hexabot-message--assistant hexabot-message--typing';
    typingRow.innerHTML = `
      <div class="hexabot-avatar" aria-hidden="true">H</div>
      <div class="hexabot-bubble" aria-label="${escapeHtml(copy.typing)}">
        <span></span><span></span><span></span>
      </div>`;
    messages.appendChild(typingRow);
    scrollToBottom();
  };

  const hideTyping = () => {
    typingRow?.remove();
    typingRow = null;
  };

  const openChat = () => {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('hexabot-is-open');
    window.setTimeout(() => input.focus({ preventScroll: true }), 100);
    scrollToBottom();
  };

  const closeChat = () => {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('hexabot-is-open');
    toggle.focus({ preventScroll: true });
  };

  const resetConversation = () => {
    if (!window.confirm(copy.clearConfirm)) return;
    try {
      localStorage.removeItem(STORAGE_HISTORY);
      sessionId = makeSessionId().slice(0, 80);
      localStorage.setItem(STORAGE_SESSION, sessionId);
    } catch {
      sessionId = makeSessionId().slice(0, 80);
    }
    messages.innerHTML = '';
    appendMessage('assistant', copy.hello);
    setStatus(copy.ready, 'ready');
    input.focus();
  };

  const sendMessage = async (message) => {
    if (busy) return;
    const clean = String(message || '').trim();
    if (!clean) {
      setStatus(copy.empty, 'error');
      input.focus();
      return;
    }

    if (window.location.protocol === 'file:') {
      setStatus(copy.local, 'error');
      appendMessage('assistant', copy.local);
      return;
    }

    appendMessage('user', clean);
    input.value = '';
    input.style.height = '';
    setBusy(true);
    showTyping();

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ sessionId, message: clean }),
      });

      let data = null;
      try {
        data = await response.json();
      } catch {
        // handled below
      }

      if (!response.ok || !data?.ok || typeof data.reply !== 'string') {
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      if (typeof data.sessionId === 'string' && /^[A-Za-z0-9_-]{8,80}$/.test(data.sessionId)) {
        sessionId = data.sessionId;
        try { localStorage.setItem(STORAGE_SESSION, sessionId); } catch { /* optional */ }
      }

      hideTyping();
      appendMessage('assistant', data.reply);
      setStatus(copy.online, 'ready');
    } catch (error) {
      console.error('[HexaBot]', error);
      hideTyping();
      appendMessage('assistant', copy.error);
      setStatus(copy.error, 'error');
    } finally {
      setBusy(false);
      input.focus({ preventScroll: true });
    }
  };

  toggle.addEventListener('click', () => {
    panel.classList.contains('open') ? closeChat() : openChat();
  });
  closeBtn.addEventListener('click', closeChat);
  clearBtn?.addEventListener('click', resetConversation);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });

  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('open')) closeChat();
  });

  restoreHistory();
  setStatus(copy.ready, 'ready');
})();
