'use strict';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/* =========================
   YEAR
========================= */
(() => {
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();

/* =========================
   MOBILE MENU
========================= */
(() => {
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');

  if (!menuBtn || !mobileNav) return;

  const closeMenu = () => {
    mobileNav.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  };

  const toggleMenu = () => {
    const willOpen = mobileNav.hidden;
    mobileNav.hidden = !willOpen;
    menuBtn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
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

  window.addEventListener('resize', () => {
    if (window.innerWidth > 780) closeMenu();
  });

  window.__closeMobileNav = closeMenu;
})();

/* =========================
   GAP MODAL
========================= */
const gapModal = $('#gapModal');

function openGapModal() {
  if (!gapModal) return;

  if (typeof window.__closeMobileNav === 'function') {
    window.__closeMobileNav();
  }

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
  const openIds = [
    '#openGapModalBtn',
    '#openGapModalBtn2',
    '#openGapModalBtn3',
    '#openGapFromNav',
    '#openGapFromNavMobile'
  ];

  openIds.forEach((id) => {
    const el = $(id);
    if (!el) return;

    el.addEventListener('click', (e) => {
      e.preventDefault();
      openGapModal();
    });
  });

  gapModal?.addEventListener('click', (e) => {
    if (e.target?.dataset?.close === 'true') {
      closeGapModal();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gapModal?.classList.contains('is-open')) {
      closeGapModal();
    }
  });
})();

/* =========================
   GAP ASSESSMENT
========================= */
(() => {
  const gapForm = $('#gapFormModal');
  const gapPreview = $('#gapPreviewModal');
  const gapScore = $('#gapScoreModal');
  const hiddenScore = $('#gap_score');

  if (!gapForm || !gapPreview || !gapScore) return;

  gapForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(gapForm);
    let total = 0;
    let count = 0;

    for (const [, value] of formData.entries()) {
      if (value === '' || value === 'NA') continue;

      const numberValue = Number(value);
      if (!Number.isNaN(numberValue)) {
        total += numberValue;
        count++;
      }
    }

    const score = count > 0 ? Math.round(total / count) : 0;

    gapScore.textContent = String(score);
    gapPreview.hidden = false;

    if (hiddenScore) hiddenScore.value = String(score);

    const message = $('textarea[name="message"]');
    if (message && !message.value.trim()) {
      message.value =
`Hola HexaSec, quiero solicitar el informe completo del diagnóstico GAP.

Resultado preliminar: ${score}/100

Deseo recibir una cotización y conocer el plan de acción recomendado.`;
    }
  });
})();

/* =========================
   CONTACT FORM
========================= */
(() => {
  const contactForm = $('#contactForm');
  const formStatus = $('#formStatus');

  if (!contactForm) return;

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (formStatus) formStatus.textContent = 'Enviando...';

    const formData = new FormData(contactForm);

    const name = String(formData.get('name') || '').trim();
    const email = String(formData.get('email') || '').trim();

    if (!name || !email) {
      if (formStatus) formStatus.textContent = 'Completa nombre y correo.';
      return;
    }

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
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