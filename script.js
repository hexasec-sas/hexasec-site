'use strict';

const $ = (selector, root = document) => root.querySelector(selector);

/* Año */
(() => {
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();

/* Menú móvil */
(() => {
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');
  if (!menuBtn || !mobileNav) return;

  const closeMenu = () => {
    mobileNav.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggleMenu();
  });

  mobileNav.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeMenu();
  });

  document.addEventListener('click', (e) => {
    if (mobileNav.hidden) return;
    if (menuBtn.contains(e.target) || mobileNav.contains(e.target)) return;
    closeMenu();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  window.__closeMobileNav = closeMenu;
})();

/* Modal GAP */
const gapModal = $('#gapModal');

function openGapModal() {
  if (!gapModal) return;
  if (typeof window.__closeMobileNav === 'function') window.__closeMobileNav();
  gapModal.classList.add('is-open');
  gapModal.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
}

function closeGapModal() {
  if (!gapModal) return;
  gapModal.classList.remove('is-open');
  gapModal.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
}

(() => {
  ['#openGapModalBtn', '#openGapModalBtn2', '#openGapFromNav', '#openGapFromNavMobile'].forEach((id) => {
    const el = $(id);
    if (!el) return;

    el.addEventListener('click', (e) => {
      e.preventDefault();
      openGapModal();
    });
  });

  gapModal?.addEventListener('click', (e) => {
    if (e.target?.dataset?.close === 'true') closeGapModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gapModal?.classList.contains('is-open')) closeGapModal();
  });
})();

/* =========================
   GAP COMPLETO + RADAR
========================= */

const GAP_OPTIONS = [
  { label: 'N/A (No aplica)', value: 'NA' },
  { label: '0% (No implementado)', value: 0 },
  { label: '20% (Inicial)', value: 20 },
  { label: '40% (Parcial)', value: 40 },
  { label: '60% (En progreso)', value: 60 },
  { label: '80% (Implementado)', value: 80 },
  { label: '100% (Optimizado)', value: 100 }
];

const GAP_CONTROLS = [
  {
    id: '5.1',
    title: 'Políticas de seguridad de la información',
    question: '¿Existen políticas aprobadas y comunicadas sobre accesos, backups, incidentes, uso aceptable y protección de la información?'
  },
  {
    id: '5.2',
    title: 'Roles y responsabilidades',
    question: '¿Están definidos los responsables de seguridad, TI, dueños de activos, aprobadores y funciones críticas?'
  },
  {
    id: '5.9',
    title: 'Inventario de activos',
    question: '¿La organización mantiene un inventario actualizado de equipos, aplicaciones, servicios, datos y responsables?'
  },
  {
    id: '5.15',
    title: 'Control de acceso',
    question: '¿Los accesos se asignan por rol, bajo mínimo privilegio, con revisión periódica y retiro oportuno?'
  },
  {
    id: '5.17',
    title: 'Autenticación',
    question: '¿Se aplican controles de autenticación como MFA, políticas de contraseñas, gestión de credenciales y control de cuentas compartidas?'
  },
  {
    id: '5.23',
    title: 'Seguridad en nube',
    question: 'Si usan servicios cloud, ¿existen permisos controlados, configuraciones seguras, registros y revisiones periódicas?'
  },
  {
    id: '5.30',
    title: 'Continuidad TIC',
    question: '¿La organización tiene RTO/RPO definidos, plan de continuidad y pruebas de contingencia al menos una vez al año?'
  },
  {
    id: '6.3',
    title: 'Concienciación',
    question: '¿Se realizan capacitaciones periódicas sobre phishing, manejo de datos, buenas prácticas y respuesta a incidentes?'
  },
  {
    id: '8.7',
    title: 'Anti-malware / EDR',
    question: '¿Los equipos cuentan con protección anti-malware o EDR actualizada y políticas de ejecución o descarga controladas?'
  },
  {
    id: '8.8',
    title: 'Gestión de vulnerabilidades',
    question: '¿Se realizan escaneos periódicos, priorización de vulnerabilidades y remediación con tiempos definidos?'
  },
  {
    id: '8.9',
    title: 'Configuración segura',
    question: '¿Existen líneas base de configuración segura, hardening y control de cambios para sistemas, servidores y red?'
  },
  {
    id: '8.13',
    title: 'Backups',
    question: '¿Se aplican backups 3-2-1, cifrados, con acceso restringido y pruebas de restauración periódicas?'
  }
];

(() => {
  const gapForm = $('#gapFormModal');
  const gapGrid = $('#gapGridModal');
  const gapPreview = $('#gapPreviewModal');
  const gapScore = $('#gapScoreModal');
  const gapBadge = $('#gapBadgeModal');
  const gapSummary = $('#gapSummaryModal');
  const gapFindings = $('#gapFindingsModal');
  const gapHint = $('#gapHintModal');
  const gapResetBtn = $('#gapResetBtn');
  const radarCanvas = $('#gapRadarModal');
  const radarCtx = radarCanvas?.getContext('2d');

  const hiddenScore = $('#gap_score');
  const hiddenTop = $('#gap_top_gaps');
  const hiddenAnswers = $('#gap_answers');
  const cta = $('#gapCTAModal');

  if (!gapForm || !gapGrid) return;

  function renderGapQuestions() {
    gapGrid.innerHTML = '';

    GAP_CONTROLS.forEach((control, index) => {
      const label = document.createElement('label');
      label.className = 'gapQ';

      const title = document.createElement('div');
      title.className = 'gapTitle';
      title.textContent = `${control.id} ${control.title}`;

      const question = document.createElement('div');
      question.className = 'gapQuestion';
      question.textContent = control.question;

      const select = document.createElement('select');
      select.name = `q${index + 1}`;
      select.required = true;

      const first = document.createElement('option');
      first.value = '';
      first.textContent = 'Selecciona';
      select.appendChild(first);

      GAP_OPTIONS.forEach((option) => {
        const opt = document.createElement('option');
        opt.value = String(option.value);
        opt.textContent = option.label;
        select.appendChild(opt);
      });

      label.appendChild(title);
      label.appendChild(question);
      label.appendChild(select);

      gapGrid.appendChild(label);
    });
  }

  renderGapQuestions();

  function scoreToBadge(score) {
    if (score >= 80) {
      return {
        txt: 'Bajo',
        note: 'Base sólida. Se recomiendan mejoras puntuales, documentación y formalización.'
      };
    }

    if (score >= 55) {
      return {
        txt: 'Medio',
        note: 'Existen brechas relevantes. Se recomienda un plan de acción 30/60/90 días.'
      };
    }

    return {
      txt: 'Alto',
      note: 'Riesgo elevado. Prioriza controles de acceso, backups, vulnerabilidades, configuración segura y monitoreo.'
    };
  }

  function getGapResults() {
    const data = new FormData(gapForm);
    const answers = [];
    let total = 0;
    let count = 0;

    GAP_CONTROLS.forEach((control, index) => {
      const raw = data.get(`q${index + 1}`);

      if (raw === 'NA') {
        answers.push({ ...control, value: 'NA', numeric: null });
        return;
      }

      const n = Number(raw);

      if (!Number.isNaN(n)) {
        answers.push({ ...control, value: n, numeric: n });
        total += n;
        count++;
      }
    });

    const score = count ? Math.round(total / count) : 0;

    const worst = answers
      .filter((a) => typeof a.numeric === 'number')
      .sort((a, b) => a.numeric - b.numeric)
      .slice(0, 3);

    return { score, answers, worst, applicable: count };
  }

  function drawRadar(labels, values) {
    if (!radarCanvas || !radarCtx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssWidth = radarCanvas.clientWidth || 520;
    const cssHeight = radarCanvas.clientHeight || 420;

    radarCanvas.width = Math.floor(cssWidth * dpr);
    radarCanvas.height = Math.floor(cssHeight * dpr);
    radarCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssWidth;
    const h = cssHeight;
    radarCtx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) * 0.36;
    const n = labels.length;
    const angleStep = (Math.PI * 2) / n;

    radarCtx.strokeStyle = 'rgba(11,18,32,.12)';
    radarCtx.lineWidth = 1;

    [20, 40, 60, 80, 100].forEach((level) => {
      const r = (level / 100) * radius;
      radarCtx.beginPath();

      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + i * angleStep;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;

        if (i === 0) radarCtx.moveTo(x, y);
        else radarCtx.lineTo(x, y);
      }

      radarCtx.closePath();
      radarCtx.stroke();
    });

    radarCtx.strokeStyle = 'rgba(11,18,32,.20)';
    radarCtx.fillStyle = 'rgba(11,18,32,.72)';
    radarCtx.font = '12px system-ui, -apple-system, Segoe UI, Roboto, Arial';
    radarCtx.textAlign = 'center';
    radarCtx.textBaseline = 'middle';

    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i * angleStep;
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;

      radarCtx.beginPath();
      radarCtx.moveTo(cx, cy);
      radarCtx.lineTo(x, y);
      radarCtx.stroke();

      const lx = cx + Math.cos(a) * (radius + 20);
      const ly = cy + Math.sin(a) * (radius + 20);
      radarCtx.fillText(labels[i], lx, ly);
    }

    const points = values.map((value, i) => {
      const v = Math.max(0, Math.min(100, value ?? 0));
      const r = (v / 100) * radius;
      const a = -Math.PI / 2 + i * angleStep;
      return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
    });

    radarCtx.fillStyle = 'rgba(11,18,32,.10)';
    radarCtx.strokeStyle = 'rgba(11,18,32,.85)';
    radarCtx.lineWidth = 2;

    radarCtx.beginPath();
    points.forEach(([x, y], i) => {
      if (i === 0) radarCtx.moveTo(x, y);
      else radarCtx.lineTo(x, y);
    });
    radarCtx.closePath();
    radarCtx.fill();
    radarCtx.stroke();

    radarCtx.fillStyle = 'rgba(11,18,32,.85)';
    points.forEach(([x, y]) => {
      radarCtx.beginPath();
      radarCtx.arc(x, y, 3, 0, Math.PI * 2);
      radarCtx.fill();
    });
  }

  function clearRadar() {
    if (!radarCanvas || !radarCtx) return;
    radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
  }

  gapResetBtn?.addEventListener('click', () => {
    gapForm.reset();
    gapPreview.hidden = true;
    if (gapHint) gapHint.textContent = '';
    if (gapFindings) gapFindings.innerHTML = '';
    if (gapScore) gapScore.textContent = '0';
    if (gapBadge) gapBadge.textContent = 'Riesgo';
    if (gapSummary) gapSummary.textContent = '';
    if (hiddenScore) hiddenScore.value = '';
    if (hiddenTop) hiddenTop.value = '';
    if (hiddenAnswers) hiddenAnswers.value = '';
    clearRadar();
  });

  gapForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const { score, answers, worst, applicable } = getGapResults();

    if (applicable === 0) {
      if (gapHint) gapHint.textContent = 'Selecciona al menos un control aplicable.';
      return;
    }

    if (gapHint) gapHint.textContent = '';

    const badge = scoreToBadge(score);

    gapScore.textContent = String(score);
    gapBadge.textContent = `Riesgo: ${badge.txt}`;
    gapSummary.textContent = badge.note;

    if (gapFindings) {
      gapFindings.innerHTML = '';
      worst.forEach((w) => {
        const li = document.createElement('li');
        li.textContent = `${w.id} ${w.title}: ${w.numeric}%.`;
        gapFindings.appendChild(li);
      });
    }

    const labels = GAP_CONTROLS.map((c) => c.id);
    const values = answers.map((a) => typeof a.numeric === 'number' ? a.numeric : 0);
    drawRadar(labels, values);

    const topText = worst.map(w => `${w.id} ${w.title} (${w.numeric}%)`).join(' | ');
    const answersText = answers.map(a => `${a.id} ${a.title}: ${a.value === 'NA' ? 'N/A' : `${a.value}%`}`).join(' || ');

    if (hiddenScore) hiddenScore.value = String(score);
    if (hiddenTop) hiddenTop.value = topText;
    if (hiddenAnswers) hiddenAnswers.value = answersText;

    if (cta) {
      cta.onclick = (ev) => {
        ev.preventDefault();

        const msg = $('textarea[name="message"]');
        if (msg && !msg.value.trim()) {
          msg.value =
`Hola HexaSec, quiero solicitar el informe completo del diagnóstico GAP.

Resultado preliminar: ${score}/100
Brechas principales: ${topText}

Deseo recibir una cotización y conocer el plan de acción recomendado.`;
        }

        closeGapModal();

        setTimeout(() => {
          document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      };
    }

    gapPreview.hidden = false;
  });

  window.addEventListener('resize', () => {
    if (!gapPreview || gapPreview.hidden) return;

    const { answers } = getGapResults();
    const labels = GAP_CONTROLS.map((c) => c.id);
    const values = answers.map((a) => typeof a.numeric === 'number' ? a.numeric : 0);

    drawRadar(labels, values);
  });
})();

/* Formulario contacto */
(() => {
  const contactForm = $('#contactForm');
  const formStatus = $('#formStatus');
  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();
    const message = String(formData.get('message') || '').trim();
    const gotcha = String(formData.get('company') || '').trim();
    const humanCheck = $('#humanCheck');

    if (gotcha) {
      contactForm.reset();
      return;
    }

    if (!name || !email || !message) {
      if (formStatus) formStatus.textContent = 'Completa nombre, correo y mensaje.';
      return;
    }

    if (!humanCheck || !humanCheck.checked) {
      if (formStatus) formStatus.textContent = 'Debes confirmar que eres humano antes de enviar.';
      return;
    }

    if (formStatus) formStatus.textContent = 'Enviando...';

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });

      if (res.ok) {
        if (formStatus) formStatus.textContent = '✅ Mensaje enviado correctamente.';
        contactForm.reset();
      } else {
        if (formStatus) formStatus.textContent = '❌ No se pudo enviar. Intenta nuevamente.';
      }
    } catch {
      if (formStatus) formStatus.textContent = '❌ Error de conexión. Revisa tu internet.';
    }
  });
})();