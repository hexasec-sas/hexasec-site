# QA Report — HexaSec v14

## Integridad
- HTML: index, GAP ES, home EN, GAP EN y MSPI verificados.
- Recursos locales: sin referencias inexistentes.
- JavaScript: `script.js`, `script-en.js` y `mspi.js` sin errores de sintaxis.
- CSS público y MSPI separados y versionados como v14.

## Compatibilidad esperada
- Chrome, Edge, Firefox y Safari modernos.
- Apertura directa con `file:///` gracias a rutas relativas.
- Servidor estático, GitHub Pages y hosting convencional.

## Puntos de validación manual
1. Menú móvil y navegación por anclas.
2. Modal del diagnóstico GAP, reinicio y cálculo de resultados.
3. Envío del formulario por Formspree con conexión a Internet.
4. Dashboard, cuestionario, filtros y exportaciones MSPI.
5. Impresión del informe MSPI.
