'use strict';

// Año automático
document.getElementById('year').textContent = String(new Date().getFullYear());

// Formulario: no envía datos a un servidor.
// Solo prepara un correo (mailto) con los campos del usuario.
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');

function cleanText(input) {
  // Limpieza básica para evitar caracteres raros en el mailto.
  return String(input || '').replace(/[\r\n]+/g, ' ').trim();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(form);
  const name = cleanText(formData.get('name'));
  const email = cleanText(formData.get('email'));
  const message = cleanText(formData.get('message'));

  if (!name || !email || !message) {
    statusEl.textContent = 'Por favor completa todos los campos.';
    return;
  }

  const subject = encodeURIComponent(`Solicitud desde web - ${name}`);
  const body = encodeURIComponent(
    `Hola HexaSec,\n\n` +
    `Mi nombre es: ${name}\n` +
    `Mi correo es: ${email}\n\n` +
    `Mensaje:\n${message}\n\n` +
    `Gracias.`
  );

  const mailto = `mailto:contacto@hexasecsas.com?subject=${subject}&body=${body}`;
  window.location.href = mailto;
  statusEl.textContent = 'Abriendo tu correo con el mensaje listo…';
});
