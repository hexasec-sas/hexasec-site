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

/* GAP */
(() => {
  const gapForm = $('#gapFormModal');
  const gapPreview = $('#gapPreviewModal');
  const gapScore = $('#gapScoreModal');
  const gapSummary = $('#gapSummaryModal');
  const gapFindings = $('#gapFindingsModal');
  const hiddenScore = $('#gap_score');
  const hiddenTop = $('#gap_top_gaps');
  const hiddenAnswers = $('#gap_answers');
  const cta = $('#gapCTAModal');

  if (!gapForm || !gapPreview || !gapScore) return;

  const controls = [
    'Políticas de seguridad',
    'Roles y responsabilidades',
    'Inventario de activos',
    'Control de acceso',
    'Autenticación',
    'Seguridad en nube',
    'Continuidad TIC',
    'Concienciación',
    'Anti-malware / EDR',
    'Gestión de vulnerabilidades',
    'Configuración segura',
    'Backups'
  ];

  gapForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = new FormData(gapForm);
    const answers = [];
    let total = 0;
    let count = 0;

    controls.forEach((name, index) => {
      const raw = data.get(`q${index + 1}`);
      const value = Number(raw || 0);
      answers.push({ name, value });

      if (!Number.isNaN(value)) {
        total += value;
        count++;
      }
    });

    const score = count ? Math.round(total / count) : 0;
    const worst = answers.slice().sort((a, b) => a.value - b.value).slice(0, 3);

    gapScore.textContent = String(score);
    gapPreview.hidden = false;

    if (gapSummary) {
      gapSummary.textContent =
        score >= 80 ? 'Base sólida. Se recomiendan mejoras puntuales y formalización.' :
        score >= 55 ? 'Brechas relevantes. Se recomienda un plan 30/60/90 días.' :
        'Riesgo elevado. Prioriza accesos, backups, vulnerabilidades y monitoreo.';
    }

    if (gapFindings) {
      gapFindings.innerHTML = '';
      worst.forEach((w) => {
        const li = document.createElement('li');
        li.textContent = `${w.name}: ${w.value}%`;
        gapFindings.appendChild(li);
      });
    }

    const topText = worst.map(w => `${w.name} (${w.value}%)`).join(' | ');
    const answersText = answers.map(w => `${w.name}: ${w.value}%`).join(' || ');

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