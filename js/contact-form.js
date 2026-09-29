/* Keep contact submissions on the page, including provider failures. */
(() => {
  'use strict';
  const form = document.querySelector('#contactForm');
  if (!form) return;
  const status = document.querySelector('#formStatus');
  const button = form.querySelector('[type="submit"]');
  const fallback = document.querySelector('#contactEmailFallback');
  const en = document.documentElement.lang.startsWith('en');
  const originalLabel = button.textContent;
  let pending = false;
  const text = {
    sending: en ? 'Sending…' : 'Enviando…',
    success: en ? 'The delivery service accepted your request. This does not confirm arrival in our inbox. Reference: ' : 'El servicio de envío aceptó tu solicitud. Esto no confirma su llegada a nuestro correo. Referencia: ',
    failure: en ? 'We could not confirm submission. Your information remains in the form. You can retry or open your email app using the link below.' : 'No pudimos confirmar el envío. Tus datos siguen en el formulario. Puedes reintentar o abrir tu correo con el enlace de abajo.'
  };
  const updateEmail = () => {
    const data = new FormData(form);
    const fields = ['name', 'email', 'company_name', 'service', 'city', 'message', 'gap_score', 'gap_top_gaps', 'request_id'];
    const body = fields.filter(key => data.get(key)).map(key => `${key}: ${data.get(key)}`).join('\n\n');
    fallback.href = `mailto:admin@hexasecsas.com?subject=${encodeURIComponent(en ? 'Website enquiry | HexaSec' : 'Solicitud desde la web | HexaSec')}&body=${encodeURIComponent(body)}`;
  };
  form.addEventListener('input', updateEmail);
  fallback.addEventListener('click', updateEmail);
  updateEmail();
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (pending || !form.reportValidity()) return;
    if (String(new FormData(form).get('_honey') || '').trim()) return;
    const reference = form.querySelector('[name="request_id"]');
    if (!reference.value) reference.value = `HX-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    updateEmail();
    pending = true;
    button.disabled = true;
    button.textContent = text.sending;
    form.setAttribute('aria-busy', 'true');
    status.textContent = text.sending;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch('https://formsubmit.co/ajax/admin@hexasecsas.com', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
        signal: controller.signal
      });
      if (!response.ok) throw new Error('Provider error');
      const result = await response.json();
      if (result.success !== true && result.success !== 'true') throw new Error('Unconfirmed submission');
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
