# HexaSec v19 — FormSubmit

El formulario público ya no utiliza Formspree.

## Flujo
1. El visitante diligencia el formulario.
2. El formulario hace POST normal a `https://formsubmit.co/admin@hexasecsas.com`.
3. FormSubmit envía la solicitud a `admin@hexasecsas.com`.
4. FormSubmit envía `_autoresponse` al correo indicado por el visitante.
5. El visitante vuelve a una página de confirmación de HexaSec mediante `_next`.

## Activación inicial obligatoria
En el primer envío FormSubmit enviará un correo de activación a `admin@hexasecsas.com`. Debe abrirse y confirmarse una sola vez.

## Importante
- El campo del visitante se llama `email`.
- reCAPTCHA permanece activo porque `_autoresponse` no funciona si se desactiva.
- El envío NO usa AJAX porque `_autoresponse` no funciona con AJAX.
- Se usa `_honey` como protección adicional contra bots.
- Las páginas de confirmación son `/gracias.html` y `/en/thanks.html`.
