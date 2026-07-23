# Formularios HexaSec v20

## Endpoint único
Todos los formularios públicos que envían correo utilizan:

`https://formsubmit.co/admin@hexasecsas.com`

## Activación obligatoria
1. Publica la v20 en GitHub Pages.
2. Abre `https://hexasecsas.com`.
3. Envía una prueba real desde el formulario.
4. Revisa `admin@hexasecsas.com` (incluido Spam) y abre el correo de activación de FormSubmit.
5. Confirma el formulario.
6. Envía una segunda prueba. Esta segunda prueba debe llegar a HexaSec y el usuario debe recibir `_autoresponse`.

## Importante
- No se usa AJAX.
- No se desactiva reCAPTCHA.
- El campo del visitante se llama `email`.
- `_next` usa URLs HTTPS completas.
- La página no muestra “enviado correctamente” antes de la confirmación real de FormSubmit.
- `file:///` se bloquea únicamente para el envío; la interfaz puede seguir validándose localmente.
