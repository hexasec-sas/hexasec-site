'use strict';

/* ================================
   Helpers
================================ */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function cleanText(input) {
  return String(input ?? '').replace(/[\r\n]+/g, ' ').trim();
}

function setText(el, txt) {
  if (el) el.textContent = txt;
}

/* ================================
   Año automático
================================ */
(() => {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* ================================
   FORMSPREE (Contacto)
================================ */
(() => {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  if (!form) return;

  const humanCheck = document.getElementById('humanCheck');
  const submitBtn = form.querySelector('button[type="submit"]');

  const setStatus = (msg) => setText(statusEl, msg);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    setStatus('Enviando...');
    if (submitBtn) submitBtn.disabled = true;

    const formData = new FormData(form);

    const name = cleanText(formData.get('name'));
    const email = cleanText(formData.get('email'));
    const message = cleanText(formData.get('message'));

    // Honeypot
    const gotchaB = cleanText(formData.get('company'));
    if (gotchaB) {
      setStatus('Enviado.');
      form.reset();
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (!name || !email || !message) {
      setStatus('Por favor completa todos los campos.');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    if (humanCheck && !humanCheck.checked) {
      setStatus('Por favor confirma que eres humano.');
      if (submitBtn) submitBtn.disabled = false;
      return;
    }

    formData.set('name', name);
    formData.set('email', email);
    formData.set('message', message);

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (res.ok) {
        setStatus('✅ Mensaje enviado. ¡Gracias!');
        form.reset();
      } else {
        setStatus('❌ No se pudo enviar. Intenta nuevamente.');
      }
    } catch (_err) {
      setStatus('❌ Error de red. Revisa tu conexión.');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
})();

/* ================================
   Modal GAP
================================ */
(() => {
  const gapModal = document.getElementById('gapModal');
  if (!gapModal) return;

  const openBtns = [
    document.getElementById('openGapModalBtn'),
    document.getElementById('openGapModalBtn2'),
    document.getElementById('openGapFromNav'),
  ].filter(Boolean);

  const focusableSel = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    gapModal.classList.add('is-open');
    gapModal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';

    // focus al primer control dentro del modal
    requestAnimationFrame(() => {
      const first = $(focusableSel, gapModal);
      first?.focus?.();
    });
  }

  function closeModal() {
    gapModal.classList.remove('is-open');
    gapModal.setAttribute('aria-hidden', 'true');
    document.documentElement.style.overflow = '';
    lastFocused?.focus?.();
  }

  function interceptOpen(e) {
    e?.preventDefault?.();
    openModal();
  }

  openBtns.forEach(btn => btn.addEventListener('click', interceptOpen));

  // Cerrar por overlay / botón
  gapModal.addEventListener('click', (e) => {
    const t = e.target;
    if (t?.dataset?.close === 'true') closeModal();
  });

  // Escape + focus trap simple
  window.addEventListener('keydown', (e) => {
    if (!gapModal.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeModal();
      return;
    }

    if (e.key === 'Tab') {
      const focusables = $$(focusableSel, gapModal);
      if (!focusables.length) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Exponer para CTA (sin globals raros)
  window.__hexasecGapModal = { openModal, closeModal };
})();

/* ================================
   Diagnóstico GAP (12 controles) + Radar
================================ */
(() => {
  const GAP_OPTIONS = [
    { label: 'N/A (No aplica)', value: 'NA' },
    { label: '0% (No implementado)', value: 0 },
    { label: '20% (Inicial)', value: 20 },
    { label: '40% (Parcial)', value: 40 },
    { label: '60% (En progreso)', value: 60 },
    { label: '80% (Implementado)', value: 80 },
    { label: '100% (Optimizado)', value: 100 },
  ];

  const GAP_CONTROLS = [
    { id: '5.1',  title: 'Políticas de SI',            question: '¿Existen políticas aprobadas y comunicadas (mínimo: accesos, backups, incidentes, uso aceptable)?' },
    { id: '5.2',  title: 'Roles y responsabilidades', question: '¿Están definidos responsables para seguridad, TI, dueños de activos y aprobaciones?' },
    { id: '5.9',  title: 'Inventario de activos',     question: '¿Existe inventario actualizado de activos (equipos, apps, datos) con responsables asignados?' },
    { id: '5.15', title: 'Control de acceso',         question: '¿Accesos por rol, mínimo privilegio, revisión periódica y revocación al retiro?' },
    { id: '5.17', title: 'Autenticación',             question: '¿MFA/contraseñas/gestión de credenciales y control de cuentas compartidas?' },
    { id: '5.23', title: 'Seguridad en nube',         question: 'Si usan cloud: ¿permisos, configuraciones, logs y revisiones de seguridad definidos?' },
    { id: '5.30', title: 'Continuidad TIC',           question: '¿RTO/RPO, plan de continuidad y pruebas de contingencia (al menos anual)?' },
    { id: '6.3',  title: 'Concienciación',            question: '¿Capacitación periódica (phishing, datos, buenas prácticas) con evidencias?' },
    { id: '8.7',  title: 'Anti-malware',              question: '¿Protección anti-malware/EDR actualizada y políticas de ejecución/descargas?' },
    { id: '8.8',  title: 'Vulnerabilidades',          question: '¿Escaneo periódico, priorización y remediación con tiempos definidos?' },
    { id: '8.9',  title: 'Configuración segura',      question: '¿Baseline/hardening y control de cambios para sistemas y red?' },
    { id: '8.13', title: 'Backups',                   question: '¿Backups 3-2-1, cifrados, acceso restringido y pruebas de restauración?' },
  ];

  // Elementos del modal
  const gapForm = document.getElementById('gapFormModal');
  const gapGrid = document.getElementById('gapGridModal');
  const gapPreview = document.getElementById('gapPreviewModal');
  const gapScoreEl = document.getElementById('gapScoreModal');
  const gapBadgeEl = document.getElementById('gapBadgeModal');
  const gapSummaryEl = document.getElementById('gapSummaryModal');
  const gapFindingsEl = document.getElementById('gapFindingsModal');
  const gapCTA = document.getElementById('gapCTAModal');
  const gapHint = document.getElementById('gapHintModal');
  const gapResetBtn = document.getElementById('gapResetBtn');

  // Campos ocultos del form
  const hScore = document.getElementById('gap_score');
  const hTop = document.getElementById('gap_top_gaps');
  const hAnswers = document.getElementById('gap_answers');

  // Radar
  const radarCanvas = document.getElementById('gapRadarModal');
  const radarCtx = radarCanvas?.getContext?.('2d');

  if (!gapForm || !gapGrid) return; // sin modal, no corremos

  // Render de preguntas (evita duplicados)
  function renderGapQuestions() {
    gapGrid.innerHTML = '';

    const makeSelect = (name) => {
      const sel = document.createElement('select');
      sel.name = name;
      sel.required = true;

      const opt0 = document.createElement('option');
      opt0.value = '';
      opt0.textContent = 'Selecciona';
      sel.appendChild(opt0);

      for (const o of GAP_OPTIONS) {
        const opt = document.createElement('option');
        opt.value = String(o.value);
        opt.textContent = o.label;
        sel.appendChild(opt);
      }
      return sel;
    };

    GAP_CONTROLS.forEach((c, i) => {
      const label = document.createElement('label');
      label.className = 'gapQ';

      const meta = document.createElement('div');
      meta.className = 'gapMeta';

      const left = document.createElement('div');
      left.className = 'gapMetaLeft';
      // Si no tienes esta clase en CSS, no pasa nada.
      left.style.display = 'flex';
      left.style.gap = '10px';
      left.style.alignItems = 'center';

      const id = document.createElement('div');
      id.className = 'gapId';
      id.textContent = c.id;

      const title = document.createElement('div');
      title.className = 'gapTitle';
      title.textContent = c.title;

      left.appendChild(id);
      left.appendChild(title);
      meta.appendChild(left);

      const q = document.createElement('div');
      q.className = 'gapQuestion';
      q.textContent = c.question;

      const select = makeSelect(`gap_${i + 1}`);

      label.appendChild(meta);
      label.appendChild(q);
      label.appendChild(select);

      gapGrid.appendChild(label);
    });
  }
  renderGapQuestions();

  function scoreToBadge(score) {
    if (score >= 80) return { txt: 'Bajo', note: 'Base sólida. Enfoque en mejoras puntuales y formalización.' };
    if (score >= 55) return { txt: 'Medio', note: 'Brechas importantes. Recomendable plan 30/60/90 días.' };
    return { txt: 'Alto', note: 'Riesgo elevado. Priorizar quick wins (accesos, backups, vulnerabilidades, monitoreo).' };
  }

  function getGapResults() {
    const data = new FormData(gapForm);

    const answers = [];
    let sum = 0;
    let countApplicable = 0;

    GAP_CONTROLS.forEach((c, i) => {
      const raw = data.get(`gap_${i + 1}`);

      if (raw === 'NA') {
        answers.push({ ...c, value: 'NA', numeric: null });
        return;
      }

      const n = Number(raw);
      if (Number.isNaN(n)) {
        answers.push({ ...c, value: '', numeric: null });
        return;
      }

      answers.push({ ...c, value: n, numeric: n });
      sum += n;
      countApplicable += 1;
    });

    const score = countApplicable > 0 ? Math.round(sum / countApplicable) : 0;

    const worst = answers
      .filter((a) => typeof a.numeric === 'number')
      .sort((a, b) => a.numeric - b.numeric)
      .slice(0, 3);

    return { score, answers, worst, applicable: countApplicable };
  }

  // Radar chart (Canvas)
  function drawRadar(labels, values) {
    if (!radarCtx || !radarCanvas) return;

    const ctx = radarCtx;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = radarCanvas.clientWidth || 520;
    const cssHeight = radarCanvas.clientHeight || 420;

    radarCanvas.width = Math.floor(cssWidth * dpr);
    radarCanvas.height = Math.floor(cssHeight * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssWidth;
    const h = cssHeight;
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.36;

    const n = labels.length;
    const angleStep = (Math.PI * 2) / n;

    // Grid
    ctx.strokeStyle = 'rgba(11,18,32,.12)';
    ctx.lineWidth = 1;

    [20, 40, 60, 80, 100].forEach((rVal) => {
      const r = (rVal / 100) * radius;
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * angleStep;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    });

    // Axes + labels
    ctx.strokeStyle = 'rgba(11,18,32,.18)';
    ctx.fillStyle = 'rgba(11,18,32,.72)';
    ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * angleStep;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();

      const lx = cx + Math.cos(a) * (radius + 18);
      const ly = cy + Math.sin(a) * (radius + 18);
      ctx.fillText(labels[i], lx, ly);
    }

    // Data polygon
    const pts = [];
    for (let i = 0; i < n; i++) {
      const v = Math.max(0, Math.min(100, values[i] ?? 0));
      const r = (v / 100) * radius;
      const a = -Math.PI / 2 + i * angleStep;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }

    ctx.fillStyle = 'rgba(11,18,32,.10)';
    ctx.strokeStyle = 'rgba(11,18,32,.85)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    pts.forEach(([x, y], idx) => (idx === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)));
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(11,18,32,.85)';
    pts.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function setSuggestedMessage(score, topText) {
    const msg = document.querySelector('textarea[name="message"]');
    if (msg && !msg.value.trim()) {
      msg.value =
`Hola HexaSec, quiero el informe completo (PDF) del GAP + plan 30/60/90 días.

Resultado preliminar: ${score}/100
Brechas principales: ${topText}

Mi objetivo es recibir una cotización y agendar una llamada.`;
    }
  }

  // Reiniciar
  gapResetBtn?.addEventListener('click', () => {
    gapForm.reset();
    if (gapPreview) gapPreview.hidden = true;
    if (gapHint) gapHint.textContent = '';
    if (radarCtx && radarCanvas) radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
  });

  // Submit diagnóstico
  gapForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const { score, answers, worst, applicable } = getGapResults();

    if (applicable === 0) {
      if (gapHint) gapHint.textContent = 'Selecciona al menos un control aplicable (que no sea N/A).';
      return;
    }
    if (gapHint) gapHint.textContent = '';

    const badge = scoreToBadge(score);
    setText(gapScoreEl, String(score));
    setText(gapBadgeEl, `Riesgo: ${badge.txt}`);
    setText(gapSummaryEl, badge.note);

    if (gapFindingsEl) {
      gapFindingsEl.innerHTML = '';
      worst.forEach((w) => {
        const li = document.createElement('li');
        const level =
          w.numeric === 0 ? 'No implementado' :
          w.numeric <= 40 ? 'Parcial' :
          w.numeric <= 60 ? 'En progreso' :
          w.numeric <= 80 ? 'Implementado' : 'Optimizado';
        li.textContent = `${w.id} ${w.title}: ${level} (${w.numeric}%).`;
        gapFindingsEl.appendChild(li);
      });
    }

    // Radar
    const labels = GAP_CONTROLS.map((c) => c.id);
    const values = answers.map((a) => (typeof a.numeric === 'number' ? a.numeric : 0));
    drawRadar(labels, values);

    // Campos ocultos para Formspree
    const topText = worst.map((w) => `${w.id} ${w.title} (${w.numeric}%)`).join(' | ');
    const answersText = answers.map((a) => {
      const v = a.value === 'NA' ? 'N/A' : `${a.value}%`;
      return `${a.id} ${a.title}: ${v}`;
    }).join(' || ');

    if (hScore) hScore.value = String(score);
    if (hTop) hTop.value = topText;
    if (hAnswers) hAnswers.value = answersText;

    // CTA: baja a contacto y sugiere mensaje
    if (gapCTA) {
      gapCTA.onclick = (ev) => {
        ev.preventDefault();
        setSuggestedMessage(score, topText);

        // cerrar modal si existe controlador
        window.__hexasecGapModal?.closeModal?.();

        setTimeout(() => {
          document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      };
    }

    if (gapPreview) gapPreview.hidden = false;
  });

  // Redraw en resize (suavizado)
  let resizeRAF = 0;
  window.addEventListener('resize', () => {
    if (!gapPreview || gapPreview.hidden) return;
    cancelAnimationFrame(resizeRAF);
    resizeRAF = requestAnimationFrame(() => {
      const { answers } = getGapResults();
      const labels = GAP_CONTROLS.map((c) => c.id);
      const values = answers.map((a) => (typeof a.numeric === 'number' ? a.numeric : 0));
      drawRadar(labels, values);
    });
  });
})();