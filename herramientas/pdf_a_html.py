"""Convierte un PDF en una página HTML autocontenida para el panel de previsualización.

El panel no abre PDFs y no ejecuta JavaScript, pero sí muestra HTML. Cada página
del PDF se convierte a SVG (vectorial, nítido con cualquier zoom) con pdftocairo
y se incrusta en el HTML, junto con el PDF original para descargarlo.

Uso:  python3 herramientas/pdf_a_html.py archivo.pdf [otro.pdf ...]
Genera archivo.pdf.html al lado de cada PDF. Requiere poppler-utils (pdftocairo).
"""
import base64
import html
import re
import subprocess
import sys
import tempfile
from pathlib import Path

PLANTILLA = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITULO__</title>
<style>
  :root { --fondo:#e6e6e6; --barra:#ffffff; --texto:#222; }
  @media (prefers-color-scheme: dark) { :root { --fondo:#1e1e1e; --barra:#2b2b2b; --texto:#eee; } }
  body { margin:0; background:var(--fondo); color:var(--texto); font:14px system-ui, sans-serif; }
  header { display:flex; gap:12px; align-items:center; padding:8px 16px; background:var(--barra);
           box-shadow:0 1px 4px #0003; }
  header b { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  a { color:inherit; }
  main { padding:16px; display:flex; flex-direction:column; align-items:center; gap:16px; }
  .pagina { width:100%; max-width:1600px; background:#fff; box-shadow:0 1px 6px #0004; line-height:0; }
  .pagina svg { width:100%; height:auto; display:block; }
</style></head>
<body>
<header><b>__TITULO__</b><span>__N__ pág.</span>
  <a download="__TITULO__" href="data:application/pdf;base64,__PDF__">Descargar PDF</a></header>
<main>
__PAGINAS__
</main>
</body></html>
"""


def paginas_svg(pdf: Path):
    with tempfile.TemporaryDirectory() as tmp:
        info = subprocess.run(["pdfinfo", str(pdf)], capture_output=True, text=True).stdout
        n = int(re.search(r"Pages:\s+(\d+)", info).group(1))
        for i in range(1, n + 1):
            out = Path(tmp) / f"p{i}.svg"
            subprocess.run(["pdftocairo", "-svg", "-f", str(i), "-l", str(i), str(pdf), str(out)],
                           check=True)
            svg = out.read_text()
            svg = svg[svg.index("<svg"):]
            # prefijar ids para que no choquen entre páginas
            svg = re.sub(r'id="([^"]+)"', rf'id="p{i}-\1"', svg)
            svg = re.sub(r'(href="#|url\(#)([^")]+)', rf'\1p{i}-\2', svg)
            yield svg


def convertir(pdf: Path) -> Path:
    paginas = list(paginas_svg(pdf))
    out = pdf.with_name(pdf.name + ".html")
    out.write_text(PLANTILLA
                   .replace("__TITULO__", html.escape(pdf.name))
                   .replace("__N__", str(len(paginas)))
                   .replace("__PDF__", base64.b64encode(pdf.read_bytes()).decode())
                   .replace("__PAGINAS__", "\n".join(f'<div class="pagina">{s}</div>' for s in paginas)))
    return out


if __name__ == "__main__":
    for nombre in sys.argv[1:]:
        print("Generado:", convertir(Path(nombre)))
