# QA Report — HexaSec v13

## Causa corregida
La versión v12 usaba rutas absolutas desde la raíz del dominio (`/styles.css`, `/script.js`, `/H.png`). Al abrir `index.html` con `file:///C:/...`, el navegador intentaba resolverlas desde la raíz de la unidad (`file:///C:/styles.css`), no desde la carpeta del proyecto. Por ello el HTML cargaba sin CSS ni JavaScript.

## Correcciones
- Todos los recursos propios usan rutas relativas por nivel de carpeta.
- CSS, JS e imágenes se centralizaron en `css/`, `js/` e `img/`.
- Las dependencias visuales de MSPI se incluyeron localmente.
- El gráfico MSPI usa un renderer local sin CDN.
- Los iconos MSPI usan un fallback local sin fuente externa.

## Validaciones automatizadas
- Todos los `link`, `script` e `img` locales referenciados existen.
- No quedan rutas de recursos que comiencen por `/`.
- Sintaxis JavaScript validada con `node --check`.
- CSS analizado sin errores de parseo con `tinycss2`.
- ZIP validado con prueba de integridad.
