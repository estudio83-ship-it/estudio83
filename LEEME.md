# Plantilla: taste-skill + Playwright MCP + Figma en Claude Code (PC y nube)

## Qué trae
- `.mcp.json` + `.claude/iniciar-playwright-mcp.js`: Playwright MCP.
  Probado en Claude Code en la nube: arranca y navega usando el Chromium de la máquina.
  En la PC sigue funcionando como siempre.
- `.claude/skills/`: lugar para la skill taste-skill (hay que copiarla, ver LEEME.md adentro).
- `prueba-taste/`: carpeta para la prueba de la landing.

## Pasos
1. Copiar `taste-skill` dentro de `.claude/skills/` (ver `.claude/skills/LEEME.md`).
2. Crear un repositorio en GitHub (puede ser privado) y subir esta carpeta.
   Con GitHub Desktop: File → Add local repository → Publish repository.
3. Conectar GitHub con Claude: https://claude.ai/connect-github
   e instalar la app de Claude en ese repositorio si lo pide.
4. Abrir una sesión nueva de Claude Code en la nube con ese repositorio seleccionado.
5. Pedirle:
   "Usá la skill design-taste-frontend para crear una landing page de una cafetería en
   prueba-taste/index.html, después abrila con Playwright y sacale una captura."

## Figma
Figma no se puede dejar resuelto desde un archivo del repositorio:
- Requiere iniciar sesión en Figma desde la cuenta de claude.ai (Configuración → Conectores).
- La red del entorno en la nube tiene que permitir los dominios de Figma
  (en la sesión: menú del entorno → Edit → Network access → Allowed domains).
Recomendación: probar primero taste-skill + Playwright, y después sumar Figma.

## Ver PDFs en el panel de previsualización
El panel no abre PDFs pero sí HTML. Para verlos:

    python3 herramientas/pdf_a_html.py ruta/al/archivo.pdf

Genera `archivo.pdf.html`: cada página queda como dibujo vectorial (sin JavaScript, así el
panel lo muestra) y trae un enlace para descargar el PDF original. Requiere pdftocairo
(poppler-utils). En el panel, si se ve el código, tocar el ícono del ojo arriba a la derecha.
