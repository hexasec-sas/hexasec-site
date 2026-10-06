/* Independent decorative effects: no network, form or chat handlers. */
(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  let paused = false;
  const toggle = document.querySelector('[data-motion-toggle]');
  const en = document.documentElement.lang.startsWith('en');
  const sync = () => {
    root.classList.toggle('holo-effects-paused', paused || reduced.matches || document.hidden);
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = en ? (paused ? 'Resume effects' : 'Pause effects') : (paused ? 'Reanudar efectos' : 'Pausar efectos');
    }
  };
  toggle?.addEventListener('click', () => { paused = !paused; sync(); });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  sync();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('holo-offscreen', !entry.isIntersecting)));
    document.querySelectorAll('.holo-art, .holo-radar').forEach(el => observer.observe(el));
  }
  document.querySelectorAll('.service, .sd-card, .coverage-service').forEach(card => {
    card.classList.add('holo-reflect');
    card.addEventListener('pointermove', event => {
      if (reduced.matches || paused || !fine.matches) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--shine-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--shine-y', `${event.clientY - rect.top}px`);
    }, { passive: true });
  });
})();
