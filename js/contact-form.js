/* Keep contact submissions on the page, including provider failures. */
(() => {
  'use strict';
  const form = document.querySelector('#contactForm');
  if (!form) return;
  const status = document.querySelector('#formStatus');
  const button = form.querySelector('[type="submit"]');
  const en = document.documentElement.lang.startsWith('en');
  const originalLabel = button.textContent;
  let pending = false;
  const text = {
    sending: en ? 'Sending…' : 'Enviando…',
    success: en ? 'Your request has been sent successfully. Reference: ' : 'Tu solicitud se ha enviado correctamente. Referencia: ',
    failure: en ? 'We could not confirm submission. Your information remains in the form. Please try again in a few moments.' : 'No pudimos confirmar el envío. Tus datos siguen en el formulario. Intenta nuevamente en unos momentos.'
  };
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    if (String(new FormData(form).get('_gotcha') || '').trim()) return;
    const reference = form.querySelector('[name="request_id"]');
    if (!reference.value) reference.value = `HX-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    pending = true;
    button.disabled = true;
    button.textContent = text.sending;
    form.setAttribute('aria-busy', 'true');
    status.textContent = text.sending;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Provider error');
      const result = await response.json();
      if (result.ok !== true) throw new Error('Unconfirmed submission');
      status.textContent = text.success + reference.value;
    } catch (_) {
      status.textContent = text.failure;
    } finally {
      clearTimeout(timer);
      pending = false;
      button.disabled = false;
      button.textContent = originalLabel;
      form.removeAttribute('aria-busy');
    }
  });
})();
