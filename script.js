'use strict';

// Año automático
document.getElementById('year').textContent = String(new Date().getFullYear());

const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function cleanText(input) {
  return String(input || '').replace(/[\r\n]+/g, ' ').trim();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusEl.textContent = 'Enviando...';

  const formData = new FormData(form);

  // Limpieza básica
  const name = cleanText(formData.get('name'));
  const email = cleanText(formData.get('email'));
  const message = cleanText(formData.get('message'));

  // Honeypot anti-spam
  const gotcha = cleanText(formData.get('_gotcha'));
  if (gotcha) {
    statusEl.textContent = 'Enviado.'; // no revelar detección
    form.reset();
    return;
  }

  if (!name || !email || !message) {
    statusEl.textContent = 'Por favor completa todos los campos.';
    return;
  }

  // Asegura que enviamos valores limpios
  formData.set('name', name);
  formData.set('email', email);
  formData.set('message', message);

  const humanCheck = document.getElementById('humanCheck');

if (!humanCheck.checked) {
  statusEl.textContent = 'Por favor confirma que eres humano.';
  return;
}
  
  try {
    const res = await fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: { 'Accept': 'application/json' }
    });

    if (res.ok) {
      statusEl.textContent = '✅ Mensaje enviado. ¡Gracias!';
      form.reset();
    } else {
      statusEl.textContent = '❌ No se pudo enviar. Intenta nuevamente.';
    }
  } catch (err) {
    statusEl.textContent = '❌ Error de red. Revisa tu conexión.';
  }
});

