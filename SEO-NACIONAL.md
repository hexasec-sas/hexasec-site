# Primera fase: posicionamiento nacional

Base: commit 8d5acc7. Preparado el 28 de septiembre de 2026 (Colombia).

## Cambios
- Cuatro páginas: consultoría ISO 27001, auditoría de ciberseguridad, análisis de vulnerabilidades y cobertura nacional.
- Cobertura de Medellín, Cali, Ibagué y otras ciudades, manteniendo Bogotá como sede real.
- Enlaces desde la portada y páginas de servicios hacia el formulario existente.
- Campo opcional Ciudad y contexto del servicio/página de origen. No se incorporan cookies, píxeles ni analítica nueva.
- Canonical por página, hreflang recíproco para las cuatro páginas ES/EN existentes, datos Organization/Service y sitemap con ocho URLs.
- robots.txt permite rastreo e identifica el sitemap.

## Publicación
Publicar el contenido de esta versión sobre la raíz del mismo repositorio, conservando CNAME, imágenes y configuración de GitHub Pages. Revisar el diff antes de integrar en la rama de producción. No es necesario cambiar DNS ni contratar hosting.

Después de publicar:
1. Comprobar las cuatro rutas nuevas, formulario y diagnóstico GAP en el dominio real.
2. En Google Search Console, revisar la propiedad hexasecsas.com y enviar https://hexasecsas.com/sitemap.xml.
3. Inspeccionar la portada y páginas nuevas; solicitar indexación cuando proceda.
4. Registrar la línea base de impresiones, clics y consultas; medir contactos calificados por ciudad desde formulario/CRM.

No se ha accedido a Search Console ni se ha confirmado la indexación de Google. La publicación no garantiza posiciones. No se ha probado un envío real de correo ni una conversación real con HexaBot, para evitar generar mensajes de prueba externos.

Las páginas regionales independientes quedan para una fase posterior con contenido diferencial verificable. No se crean oficinas ficticias ni páginas duplicadas por ciudad.

## Verificación realizada
- Sintaxis de JavaScript y diff sin errores.
- Ocho páginas comprobadas: un H1, IDs únicos, enlaces a archivos locales existentes y datos JSON-LD válidos.
- Ocho rutas del sitemap corresponden a archivos existentes.
- Revisión visual y de interacción en navegador pendiente: el navegador de pruebas no pudo descargarse en este entorno.
- Cambios preparados para una rama y solicitud de revisión en GitHub. La publicación en producción queda pendiente de integrar la solicitud.

## ZIP de cambios
El ZIP contiene únicamente los archivos nuevos o modificados, conservando sus rutas. Extraerlo y subir su contenido a la raíz del repositorio; no subir el ZIP como un archivo del sitio. Conviene usar una rama y revisar una solicitud de cambios antes de integrar. No reemplazar el repositorio con una carpeta que solo contenga este ZIP: los demás archivos (imágenes, estilos originales, CNAME y HexaBot) deben mantenerse.
