'use strict';

/* =========================
   Helpers
========================= */
const $ = (sel, root = document) => root.querySelector(sel);

/* =========================
   Year
========================= */
(() => {
  const yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

/* =========================
   MOBILE NAV (Hamburger) - #menuBtn + #mobileNav
========================= */
(() => {
  const menuBtn = $('#menuBtn');
  const mobileNav = $('#mobileNav');
  if (!menuBtn || !mobileNav) return;

  const setOpen = (open) => {
    mobileNav.hidden = !open;
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  const isOpen = () => !mobileNav.hidden;
  const toggle = () => setOpen(!isOpen());
  const close = () => setOpen(false);

  menuBtn.addEventListener('click', (e) => {
    e.preventDefault();
    toggle();
  });

  // Close when clicking any link
  mobileNav.addEventListener('click', (e) => {
    const a = e.target?.closest?.('a');
    if (a) close();
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!isOpen()) return;
    const t = e.target;
    if (t === menuBtn || menuBtn.contains(t)) return;
    if (t === mobileNav || mobileNav.contains(t)) return;
    close();
  });

  // ESC closes
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // If switching to desktop, close
  window.addEventListener('resize', () => {
    if (window.matchMedia('(min-width: 781px)').matches) close();
  });

  // Expose close for GAP open action
  window.__closeMobileNav = close;
})();

/* =========================
   CONTACT FORM (Formspree) - English
========================= */
(() => {
  const form = $('#contactForm');
  const statusEl = $('#formStatus');
  if (!form) return;

  const cleanText = (input) => String(input || '').replace(/[\r\n]+/g, ' ').trim();

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (statusEl) statusEl.textContent = 'Sending...';

    const formData = new FormData(form);

    const name = cleanText(formData.get('name'));
    const email = cleanText(formData.get('email'));
    const message = cleanText(formData.get('message'));

    // Honeypot (input "company")
    const gotcha = cleanText(formData.get('company'));
    if (gotcha) {
      if (statusEl) statusEl.textContent = 'Sent.';
      form.reset();
      return;
    }

    if (!name || !email || !message) {
      if (statusEl) statusEl.textContent = 'Please complete all fields.';
      return;
    }

    const humanCheck = $('#humanCheck');
    if (humanCheck && !humanCheck.checked) {
      if (statusEl) statusEl.textContent = 'Please confirm you are human.';
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
        if (statusEl) statusEl.textContent = '✅ Message sent. Thank you!';
        form.reset();
      } else {
        if (statusEl) statusEl.textContent = '❌ Could not send. Please try again.';
      }
    } catch {
      if (statusEl) statusEl.textContent = '❌ Network error. Check your connection.';
    }
  });
})();

/* =========================
   GAP MODAL
========================= */
const gapModal = $('#gapModal');

function openModal() {
  if (!gapModal) return;
  gapModal.classList.add('is-open');
  gapModal.setAttribute('aria-hidden', 'false');
  document.documentElement.style.overflow = 'hidden';
}

function closeModal() {
  if (!gapModal) return;
  gapModal.classList.remove('is-open');
  gapModal.setAttribute('aria-hidden', 'true');
  document.documentElement.style.overflow = '';
}

(() => {
  const openBtn = $('#openGapModalBtn');
  const openBtn2 = $('#openGapModalBtn2');
  const openFromNav = $('#openGapFromNav');
  const openFromNavMobile = $('#openGapFromNavMobile');

  const interceptOpen = (e) => {
    if (e) e.preventDefault();
    if (typeof window.__closeMobileNav === 'function') window.__closeMobileNav();
    openModal();
  };

  openBtn?.addEventListener('click', interceptOpen);
  openBtn2?.addEventListener('click', interceptOpen);
  openFromNav?.addEventListener('click', interceptOpen);
  openFromNavMobile?.addEventListener('click', interceptOpen);

  gapModal?.addEventListener('click', (e) => {
    const t = e.target;
    if (t?.dataset?.close === 'true') closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && gapModal?.classList.contains('is-open')) closeModal();
  });
})();

/* =========================
   GAP (12 controls) - English
========================= */
const GAP_OPTIONS = [
  { label: 'N/A (Not applicable)', value: 'NA' },
  { label: '0% (Not implemented)', value: 0 },
  { label: '20% (Initial)', value: 20 },
  { label: '40% (Partial)', value: 40 },
  { label: '60% (In progress)', value: 60 },
  { label: '80% (Implemented)', value: 80 },
  { label: '100% (Optimized)', value: 100 },
];

const GAP_CONTROLS = [
  { id: '5.1',  title: 'Information security policies', question: 'Do you have approved and communicated policies (at minimum: access, backups, incidents, acceptable use)?' },
  { id: '5.2',  title: 'Roles & responsibilities',      question: 'Are security, IT, asset owners, and approvals clearly assigned?' },
  { id: '5.9',  title: 'Asset inventory',               question: 'Is there an up-to-date asset inventory (devices, apps, data) with assigned owners?' },
  { id: '5.15', title: 'Access control',                question: 'Role-based access, least privilege, periodic review, and revocation upon exit?' },
  { id: '5.17', title: 'Authentication',                question: 'MFA/password policy/credential management and control of shared accounts?' },
  { id: '5.23', title: 'Cloud security',                question: 'If you use cloud: permissions, configurations, logging, and security reviews defined?' },
  { id: '5.30', title: 'ICT continuity',                question: 'RTO/RPO, continuity plan, and contingency tests (at least annually)?' },
  { id: '6.3',  title: 'Awareness training',             question: 'Regular training (phishing, data, best practices) with evidence/records?' },
  { id: '8.7',  title: 'Anti-malware',                  question: 'Up-to-date anti-malware/EDR and execution/download policies?' },
  { id: '8.8',  title: 'Vulnerability management',      question: 'Periodic scanning, prioritization, and remediation with defined timelines?' },
  { id: '8.9',  title: 'Secure configuration',          question: 'Baseline/hardening and change control for systems and network?' },
  { id: '8.13', title: 'Backups',                       question: '3-2-1 backups, encrypted, restricted access, and restore testing?' },
];

(() => {
  const gapForm = $('#gapFormModal');
  const gapGrid = $('#gapGridModal');
  const gapPreview = $('#gapPreviewModal');
  const gapScoreEl = $('#gapScoreModal');
  const gapBadgeEl = $('#gapBadgeModal');
  const gapSummaryEl = $('#gapSummaryModal');
  const gapFindingsEl = $('#gapFindingsModal');
  const gapCTA = $('#gapCTAModal');
  const gapHint = $('#gapHintModal');
  const radarCanvas = $('#gapRadarModal');
  const radarCtx = radarCanvas?.getContext('2d');
  const gapResetBtn = $('#gapResetBtn');

  // Hidden fields to send to Formspree (optional if form exists)
  const hScore = $('#gap_score');
  const hTop = $('#gap_top_gaps');
  const hAnswers = $('#gap_answers');

  if (!gapForm || !gapGrid) return;

  /* Render questions (once) */
  (() => {
    gapGrid.innerHTML = '';

    const makeSelect = (name) => {
      const sel = document.createElement('select');
      sel.name = name;
      sel.required = true;

      const opt0 = document.createElement('option');
      opt0.value = '';
      opt0.textContent = 'Select';
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
  })();

  function scoreToBadge(score) {
    if (score >= 80) return { txt: 'Low', note: 'Strong foundation. Focus on small improvements and formalization.' };
    if (score >= 55) return { txt: 'Medium', note: 'Relevant gaps found. Recommended: a 30/60/90-day action plan.' };
    return { txt: 'High', note: 'Elevated risk. Prioritize quick wins (access, backups, vulnerabilities, monitoring).' };
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

  function drawRadar({ labels, values }) {
    if (!radarCtx || !radarCanvas) return;

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

    [20, 40, 60, 80, 100].forEach((rVal) => {
      const r = (rVal / 100) * radius;
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

    radarCtx.strokeStyle = 'rgba(11,18,32,.18)';
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

      const lx = cx + Math.cos(a) * (radius + 18);
      const ly = cy + Math.sin(a) * (radius + 18);
      radarCtx.fillText(labels[i], lx, ly);
    }

    const pts = [];
    for (let i = 0; i < n; i++) {
      const v = Math.max(0, Math.min(100, values[i] ?? 0));
      const r = (v / 100) * radius;
      const a = -Math.PI / 2 + i * angleStep;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }

    radarCtx.fillStyle = 'rgba(11,18,32,.10)';
    radarCtx.strokeStyle = 'rgba(11,18,32,.85)';
    radarCtx.lineWidth = 2;

    radarCtx.beginPath();
    pts.forEach(([x, y], idx) => (idx === 0 ? radarCtx.moveTo(x, y) : radarCtx.lineTo(x, y)));
    radarCtx.closePath();
    radarCtx.fill();
    radarCtx.stroke();

    radarCtx.fillStyle = 'rgba(11,18,32,.85)';
    pts.forEach(([x, y]) => {
      radarCtx.beginPath();
      radarCtx.arc(x, y, 3, 0, Math.PI * 2);
      radarCtx.fill();
    });
  }

  function setSuggestedMessage(score, topText) {
    const msg = $('textarea[name="message"]');
    if (msg && !msg.value.trim()) {
      msg.value =
`Hello HexaSec, I would like the full GAP report (PDF) + a 30/60/90-day action plan.

Preliminary result: ${score}/100
Top gaps: ${topText}

My goal is to receive a quote and schedule a call.`;
    }
  }

  gapResetBtn?.addEventListener('click', () => {
    gapForm.reset();
    if (gapPreview) gapPreview.hidden = true;
    if (gapHint) gapHint.textContent = '';
    if (radarCtx && radarCanvas) radarCtx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);
  });

  gapForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const { score, answers, worst, applicable } = getGapResults();

    if (applicable === 0) {
      if (gapHint) gapHint.textContent = 'Select at least one applicable control (not N/A).';
      return;
    }
    if (gapHint) gapHint.textContent = '';

    const badge = scoreToBadge(score);
    if (gapScoreEl) gapScoreEl.textContent = String(score);
    if (gapBadgeEl) gapBadgeEl.textContent = `Risk: ${badge.txt}`;
    if (gapSummaryEl) gapSummaryEl.textContent = badge.note;

    if (gapFindingsEl) {
      gapFindingsEl.innerHTML = '';
      worst.forEach((w) => {
        const li = document.createElement('li');
        const level =
          w.numeric === 0 ? 'Not implemented' :
          w.numeric <= 40 ? 'Partial' :
          w.numeric <= 60 ? 'In progress' :
          w.numeric <= 80 ? 'Implemented' : 'Optimized';
        li.textContent = `${w.id} ${w.title}: ${level} (${w.numeric}%).`;
        gapFindingsEl.appendChild(li);
      });
    }

    const labels = GAP_CONTROLS.map((c) => c.id);
    const values = answers.map((a) => (typeof a.numeric === 'number' ? a.numeric : 0));
    drawRadar({ labels, values });

    const topText = worst.map((w) => `${w.id} ${w.title} (${w.numeric}%)`).join(' | ');
    const answersText = answers.map((a) => {
      const v = a.value === 'NA' ? 'N/A' : `${a.value}%`;
      return `${a.id} ${a.title}: ${v}`;
    }).join(' || ');

    if (hScore) hScore.value = String(score);
    if (hTop) hTop.value = topText;
    if (hAnswers) hAnswers.value = answersText;

    if (gapCTA) {
      gapCTA.onclick = (ev) => {
        ev.preventDefault();
        setSuggestedMessage(score, topText);
        closeModal();
        setTimeout(() => {
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
      };
    }

    if (gapPreview) gapPreview.hidden = false;
  });

  let resizeT;
  window.addEventListener('resize', () => {
    if (!gapPreview || gapPreview.hidden) return;
    clearTimeout(resizeT);
    resizeT = setTimeout(() => {
      const { answers } = getGapResults();
      const labels = GAP_CONTROLS.map((c) => c.id);
      const values = answers.map((a) => (typeof a.numeric === 'number' ? a.numeric : 0));
      drawRadar({ labels, values });
    }, 120);
  });
})();