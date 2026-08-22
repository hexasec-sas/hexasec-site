(() => {
  'use strict';

  const API_URL = 'https://chat.hexasecsas.com/api/chat/message';
  const STORAGE_SESSION = 'hexabot_session_v25';
  const STORAGE_HISTORY = 'hexabot_history_v25';
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
  const companion = document.getElementById('hexabot-companion');
  const gapSection = document.getElementById('diagnostico');
  const gapButton = document.getElementById('openGapModalBtn2') || document.getElementById('openGapModalBtn');

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
        attentive: 'I’m listening…',
        done: 'Ready. What else can I help with?',
        companionHello: 'Hi! I’m HexaBot.',
        companionThink: 'Analyzing…',
        companionDone: 'Done ✓',
        companionListen: 'I’m listening.',
        companionGap: 'Try the FREE ASSESSMENT. Click me to start.',
        companionServices: 'Want to see how HexaSec can strengthen your security?',
        companionMethod: 'Here I can show you how we work.',
        companionContact: 'Need an expert? I can guide you to the team.',
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
        attentive: 'Te escucho…',
        done: 'Listo. ¿En qué más puedo ayudarte?',
        companionHello: '¡Hola! Soy HexaBot.',
        companionThink: 'Analizando…',
        companionDone: 'Listo ✓',
        companionListen: 'Te escucho.',
        companionGap: 'Haz tu DIAGNÓSTICO GRATUITO. Haz clic en mí para comenzar.',
        companionServices: '¿Quieres ver cómo HexaSec puede fortalecer tu seguridad?',
        companionMethod: 'Aquí te muestro cómo trabajamos.',
        companionContact: '¿Necesitas un experto? Te guío hasta el equipo.',
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
  let stateTimer = null;
  let companionSpeechTimer = null;
  let idleBehaviorTimer = null;
  let roamingTimer = null;
  let promotionTimer = null;
  let companionIntent = 'chat';
  let lastRoamAt = 0;
  let lastPromotionAt = 0;

  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const finePointer = window.matchMedia?.('(pointer:fine)').matches ?? false;
  const canRoam = () => finePointer && !reducedMotion && window.innerWidth >= 760 && !panel.classList.contains('open');

  const setCompanionSpeech = (text, duration = 1800) => {
    const bubble = companion?.querySelector('.hexabot-companion__speech');
    if (!bubble) return;
    bubble.textContent = text;
    widget.dataset.companionSpeech = 'show';
    if (companionSpeechTimer) window.clearTimeout(companionSpeechTimer);
    companionSpeechTimer = window.setTimeout(() => {
      widget.dataset.companionSpeech = 'hide';
    }, duration);
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const companionSize = () => ({
    width: companion?.offsetWidth || 136,
    height: companion?.offsetHeight || 154,
  });

  const setCompanionIntent = (intent = 'chat', duration = 0) => {
    companionIntent = intent;
    if (companion) companion.dataset.intent = intent;
    if (duration > 0) {
      window.setTimeout(() => {
        if (companionIntent === intent) {
          companionIntent = 'chat';
          if (companion) companion.dataset.intent = 'chat';
        }
      }, duration);
    }
  };

  const moveCompanionTo = (x, y, { mood = 'idle', speech = '', duration = 0, intent = 'chat' } = {}) => {
    if (!companion || !canRoam()) return;
    const size = companionSize();
    const safeX = clamp(x, 18, Math.max(18, window.innerWidth - size.width - 18));
    const safeY = clamp(y, 82, Math.max(82, window.innerHeight - size.height - 22));
    companion.classList.add('hexabot-roaming');
    companion.style.left = `${Math.round(safeX)}px`;
    companion.style.top = `${Math.round(safeY)}px`;
    companion.style.right = 'auto';
    companion.style.bottom = 'auto';
    setBotState(mood, duration || 1300);
    setCompanionIntent(intent, duration || 4200);
    if (speech) setCompanionSpeech(speech, duration || 3200);
    lastRoamAt = Date.now();
  };

  const getVisibleGuideTarget = () => {
    const candidates = [
      { id: 'diagnostico', speech: copy.companionGap, intent: 'diagnostic', mood: 'greeting' },
      { id: 'servicios', speech: copy.companionServices, intent: 'chat', mood: 'attentive' },
      { id: 'metodo', speech: copy.companionMethod, intent: 'chat', mood: 'attentive' },
      { id: 'contacto', speech: copy.companionContact, intent: 'chat', mood: 'greeting' },
    ];
    let best = null;
    let bestVisible = 0;
    for (const item of candidates) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const visible = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
      const ratio = visible / Math.max(1, Math.min(rect.height, window.innerHeight));
      if (ratio > bestVisible) {
        bestVisible = ratio;
        best = { ...item, el, rect };
      }
    }
    return bestVisible > .28 ? best : null;
  };

  const roamNearTarget = (target) => {
    if (!target || !canRoam()) return false;
    const rect = target.el.getBoundingClientRect();
    const size = companionSize();
    const preferRight = rect.left + rect.width / 2 < window.innerWidth / 2;
    let x = preferRight ? rect.right - size.width * .55 : rect.left - size.width * .45;
    let y = clamp(rect.top + Math.min(rect.height * .28, 160), 92, window.innerHeight - size.height - 28);

    if (target.id === 'diagnostico' && gapButton) {
      const btnRect = gapButton.getBoundingClientRect();
      x = btnRect.left - size.width - 18;
      if (x < 18) x = btnRect.right + 18;
      y = btnRect.top - size.height * .38;
    }

    moveCompanionTo(x, y, {
      mood: target.mood,
      speech: target.speech,
      duration: target.id === 'diagnostico' ? 6200 : 3500,
      intent: target.intent,
    });
    return true;
  };

  const wanderFreely = () => {
    if (!canRoam() || busy || document.visibilityState !== 'visible') return;
    const size = companionSize();
    const margin = 24;
    const x = margin + Math.random() * Math.max(0, window.innerWidth - size.width - margin * 2);
    const yMin = 105;
    const yMax = Math.max(yMin, window.innerHeight - size.height - 34);
    const y = yMin + Math.random() * Math.max(0, yMax - yMin);
    moveCompanionTo(x, y, { mood: Math.random() > .62 ? 'attentive' : 'idle', duration: 1600 });
  };

  const scheduleRoaming = () => {
    if (roamingTimer) window.clearTimeout(roamingTimer);
    const delay = 9000 + Math.random() * 8000;
    roamingTimer = window.setTimeout(() => {
      if (canRoam() && !busy && document.visibilityState === 'visible') {
        const target = getVisibleGuideTarget();
        const shouldGuide = target && Math.random() > .42;
        if (!shouldGuide || !roamNearTarget(target)) wanderFreely();
      }
      scheduleRoaming();
    }, delay);
  };

  const promoteDiagnostic = () => {
    if (!canRoam() || busy || panel.classList.contains('open')) return;
    const now = Date.now();
    if (now - lastPromotionAt < 45000) return;
    lastPromotionAt = now;
    const target = {
      id: 'diagnostico', el: gapSection || document.body, speech: copy.companionGap,
      intent: 'diagnostic', mood: 'greeting'
    };
    if (gapSection) {
      gapSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(() => roamNearTarget(target), 650);
    } else {
      moveCompanionTo(window.innerWidth * .55, window.innerHeight * .45, {
        mood: 'greeting', speech: copy.companionGap, duration: 6200, intent: 'diagnostic'
      });
    }
  };

  const scheduleDiagnosticPromotion = () => {
    if (promotionTimer) window.clearTimeout(promotionTimer);
    promotionTimer = window.setTimeout(() => {
      if (!panel.classList.contains('open') && !busy && document.visibilityState === 'visible') {
        // Do not auto-scroll the first time. Move near the visible edge and invite the visitor.
        const size = companionSize();
        moveCompanionTo(window.innerWidth - size.width - 28, Math.max(105, window.innerHeight * .36), {
          mood: 'greeting', speech: copy.companionGap, duration: 6500, intent: 'diagnostic'
        });
        lastPromotionAt = Date.now();
      }
      promotionTimer = window.setTimeout(scheduleDiagnosticPromotion, 55000);
    }, 11500);
  };

  const scheduleIdleBehavior = () => {
    if (idleBehaviorTimer) window.clearTimeout(idleBehaviorTimer);
    const delay = 7500 + Math.random() * 6500;
    idleBehaviorTimer = window.setTimeout(() => {
      if (!busy && !panel.classList.contains('open') && document.visibilityState === 'visible') {
        const behaviors = ['greeting', 'attentive', 'idle'];
        const pick = behaviors[Math.floor(Math.random() * behaviors.length)];
        setBotState(pick, 1200);
        if (Math.random() > .7 && Date.now() - lastPromotionAt > 12000) setCompanionSpeech(copy.companionHello, 1500);
      }
      scheduleIdleBehavior();
    }, delay);
  };

  const setBotState = (state = 'idle', duration = 0) => {
    widget.dataset.botState = state;
    if (stateTimer) {
      window.clearTimeout(stateTimer);
      stateTimer = null;
    }
    if (duration > 0) {
      stateTimer = window.setTimeout(() => {
        if (!busy) widget.dataset.botState = 'idle';
      }, duration);
    }
  };

  const createBotAvatar = (variant = 'message') => {
    const avatar = document.createElement('div');
    avatar.className = `hexabot-avatar hexabot-avatar--${variant}`;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.innerHTML = `
      <span class="hexabot-core hexabot-core--${variant}">
        <span class="hexabot-face">
          <span class="hexabot-brow hexabot-brow--left"></span>
          <span class="hexabot-brow hexabot-brow--right"></span>
          <span class="hexabot-eyes">
            <span class="hexabot-eye"></span>
            <span class="hexabot-eye"></span>
          </span>
          <span class="hexabot-mouth"></span>
          <span class="hexabot-scanline"></span>
        </span>
        <span class="hexabot-core__spark"></span>
      </span>`;
    return avatar;
  };

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

    const avatar = role === 'assistant' ? createBotAvatar('message') : document.createElement('div');
    if (role !== 'assistant') {
      avatar.className = 'hexabot-avatar hexabot-avatar--user';
      avatar.setAttribute('aria-hidden', 'true');
      avatar.textContent = lang === 'en' ? 'You' : 'Tú';
    }

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
    if (value) {
      setBotState('thinking');
    } else if (widget.dataset.botState === 'thinking') {
      setBotState('idle');
    }
  };

  let typingRow = null;
  const showTyping = () => {
    typingRow = document.createElement('div');
    typingRow.className = 'hexabot-message hexabot-message--assistant hexabot-message--typing';
    typingRow.appendChild(createBotAvatar('message'));
    const typingBubble = document.createElement('div');
    typingBubble.className = 'hexabot-bubble';
    typingBubble.setAttribute('aria-label', copy.typing);
    typingBubble.innerHTML = '<span></span><span></span><span></span>';
    typingRow.appendChild(typingBubble);
    messages.appendChild(typingRow);
    scrollToBottom();
  };

  const hideTyping = () => {
    typingRow?.remove();
    typingRow = null;
  };

  const openChat = () => {
    companion?.classList.remove('hexabot-roaming');
    if (companion) { companion.style.left = ''; companion.style.top = ''; companion.style.right = ''; companion.style.bottom = ''; }
    setCompanionIntent('chat');
    widget.classList.add('hexabot-open');
    setBotState('greeting', 1200);
    setCompanionSpeech(copy.companionHello, 1300);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('hexabot-is-open');
    window.setTimeout(() => input.focus({ preventScroll: true }), 100);
    scrollToBottom();
  };

  const closeChat = () => {
    widget.classList.remove('hexabot-open');
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('hexabot-is-open');
    toggle.focus({ preventScroll: true });
    window.setTimeout(() => { if (canRoam()) wanderFreely(); }, 700);
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
    setCompanionSpeech(copy.companionThink, 1400);
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
      setBotState('speaking');
      setCompanionSpeech(copy.companionDone, 1600);
      setStatus(copy.online, 'ready');
      window.setTimeout(() => {
        if (!busy) {
          setBotState('success', 1700);
          setStatus(copy.done, 'ready');
        }
      }, 1500);
    } catch (error) {
      console.error('[HexaBot]', error);
      hideTyping();
      appendMessage('assistant', copy.error);
      setBotState('error', 2600);
      setStatus(copy.error, 'error');
    } finally {
      setBusy(false);
      input.focus({ preventScroll: true });
    }
  };

  companion?.addEventListener('click', () => {
    if (companionIntent === 'diagnostic' && gapButton) {
      setBotState('success', 1500);
      setCompanionSpeech(lang === 'en' ? 'Great choice. Let’s measure your security maturity.' : 'Excelente elección. Midamos tu nivel de madurez.', 2200);
      gapButton.click();
      setCompanionIntent('chat');
      return;
    }
    if (!panel.classList.contains('open')) openChat();
    else input.focus({ preventScroll: true });
  });

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

  input.addEventListener('focus', () => {
    if (!busy) {
      setBotState('attentive');
      setCompanionSpeech(copy.companionListen, 1100);
      setStatus(copy.attentive, 'ready');
    }
  });

  input.addEventListener('blur', () => {
    if (!busy && widget.dataset.botState === 'attentive') {
      setBotState('idle');
      setStatus(copy.ready, 'ready');
    }
  });

  input.addEventListener('input', () => {
    if (!busy && input.value.trim()) {
      setBotState('attentive');
      setStatus(copy.attentive, 'ready');
    } else if (!busy && document.activeElement !== input) {
      setBotState('idle');
      setStatus(copy.ready, 'ready');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && panel.classList.contains('open')) closeChat();
  });

  // Subtle eye tracking makes HexaBot feel present without turning the chat into a distracting animation.
  const canTrackPointer = finePointer && !reducedMotion;
  if (canTrackPointer) {
    window.addEventListener('pointermove', (event) => {
      const targetEl = panel.classList.contains('open') ? panel : companion;
      if (!targetEl) return;
      const rect = targetEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + Math.min(rect.height * 0.2, 110);
      const dx = Math.max(-1, Math.min(1, (event.clientX - cx) / Math.max(rect.width * 0.55, 1)));
      const dy = Math.max(-1, Math.min(1, (event.clientY - cy) / Math.max(rect.height * 0.35, 1)));
      widget.style.setProperty('--hexabot-look-x', `${(dx * 2.2).toFixed(2)}px`);
      widget.style.setProperty('--hexabot-look-y', `${(dy * 1.6).toFixed(2)}px`);
    }, { passive: true });
  }

  widget.dataset.botState = 'idle';
  widget.dataset.companionSpeech = 'hide';
  scheduleIdleBehavior();
  scheduleRoaming();
  scheduleDiagnosticPromotion();
  window.setTimeout(() => {
    setCompanionSpeech(copy.companionHello, 2200);
    if (canRoam()) {
      const size = companionSize();
      moveCompanionTo(window.innerWidth - size.width - 24, window.innerHeight - size.height - 88, { mood: 'greeting', duration: 1800 });
    }
  }, 900);

  // When the free assessment enters the viewport, HexaBot may approach it and point it out.
  if ('IntersectionObserver' in window && gapSection) {
    const gapObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (!entry?.isIntersecting || entry.intersectionRatio < .35 || busy || panel.classList.contains('open')) return;
      if (Date.now() - lastPromotionAt < 18000) return;
      lastPromotionAt = Date.now();
      roamNearTarget({ id: 'diagnostico', el: gapSection, speech: copy.companionGap, intent: 'diagnostic', mood: 'greeting' });
    }, { threshold: [.35, .6] });
    gapObserver.observe(gapSection);
  }

  window.addEventListener('resize', () => {
    if (!canRoam()) {
      companion?.classList.remove('hexabot-roaming');
      if (companion) { companion.style.left = ''; companion.style.top = ''; companion.style.right = ''; companion.style.bottom = ''; }
    } else if (companion?.classList.contains('hexabot-roaming')) {
      const rect = companion.getBoundingClientRect();
      moveCompanionTo(rect.left, rect.top);
    }
  }, { passive: true });
  restoreHistory();
  setStatus(copy.ready, 'ready');
})();
