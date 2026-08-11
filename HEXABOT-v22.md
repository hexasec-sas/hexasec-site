# HexaSec Site v22 — HexaBot nativo

## Cambio principal
El iframe de HexaBot fue reemplazado por un chat nativo integrado al sitio y conectado a:

`https://chat.hexasecsas.com/api/chat/message`

## Funciones
- Sesión independiente por visitante (`localStorage`).
- Historial local de hasta 30 mensajes.
- Indicador de escritura.
- Enter para enviar / Shift+Enter para salto de línea.
- Renderizado seguro de un subconjunto de Markdown (negritas, código, listas y saltos de línea).
- Estado de conexión y manejo de errores.
- Nueva conversación sin mezclar sesiones.
- Español e inglés.
- Responsive y `prefers-reduced-motion`.
- Sin iframe y sin exposición de tokens o credenciales en frontend.

## Requisito de producción
El backend debe permanecer disponible en `chat.hexasecsas.com` y permitir CORS para:
- https://hexasecsas.com
- https://www.hexasecsas.com

## Prueba recomendada
Publicar en GitHub Pages y validar desde https://hexasecsas.com. Para pruebas locales usar un servidor HTTP (por ejemplo `python3 -m http.server 8000`) y no `file://`.
