"""Convierte un PDF en una página HTML autocontenida que lo muestra con pdf.js.

El panel de previsualización no abre PDFs pero sí HTML, así que el HTML lleva
adentro el PDF y el visor completos (no necesita internet).

Uso:  python3 herramientas/pdf_a_html.py archivo.pdf [otro.pdf ...]
Genera archivo.pdf.html al lado de cada PDF.
"""
import base64
import html
import sys
from pathlib import Path

PDFJS = Path(__file__).parent / "pdfjs"

PLANTILLA = """<!doctype html>
<html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITULO__</title>
<style>
  :root { --fondo:#e6e6e6; --barra:#ffffff; --texto:#222; }
  @media (prefers-color-scheme: dark) { :root { --fondo:#1e1e1e; --barra:#2b2b2b; --texto:#eee; } }
  body { margin:0; background:var(--fondo); color:var(--texto); font:14px system-ui, sans-serif; }
  header { position:sticky; top:0; z-index:1; display:flex; gap:8px; align-items:center;
           padding:8px 16px; background:var(--barra); box-shadow:0 1px 4px #0003; }
  header b { flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  button { font:inherit; padding:4px 10px; border:1px solid #8884; border-radius:6px;
           background:transparent; color:inherit; cursor:pointer; }
  #paginas { padding:16px; display:flex; flex-direction:column; align-items:center; gap:16px; }
  canvas { background:#fff; box-shadow:0 1px 6px #0004; max-width:none; }
</style></head>
<body>
<header><b>__TITULO__</b>
  <button id="menos">−</button><span id="nivel">Ajustar</span><button id="mas">+</button>
  <button id="ajustar">Ajustar</button>
  <a id="bajar" download="__TITULO__"><button>Descargar PDF</button></a>
</header>
<div id="paginas"></div>
<script id="w" type="text/plain">__WORKER__</script>
<script>__PDFJS__</script>
<script>
const datos = Uint8Array.from(atob("__PDF__"), c => c.charCodeAt(0));
const worker = new Blob([document.getElementById("w").textContent], {type: "text/javascript"});
pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(worker);
document.getElementById("bajar").href = URL.createObjectURL(new Blob([datos], {type: "application/pdf"}));

let doc, anchoPag = 842, zoom = null;  // null = ajustar al ancho
const cont = document.getElementById("paginas");

async function dibujar() {
  cont.innerHTML = "";
  const ancho = cont.clientWidth - 32;
  for (let i = 1; i <= doc.numPages; i++) {
    const pag = await doc.getPage(i);
    const base = pag.getViewport({scale: 1});
    if (i === 1) anchoPag = base.width;
    const escala = zoom ?? ancho / base.width;
    const vp = pag.getViewport({scale: escala * devicePixelRatio});
    const c = document.createElement("canvas");
    c.width = vp.width; c.height = vp.height;
    c.style.width = vp.width / devicePixelRatio + "px";
    cont.appendChild(c);
    await pag.render({canvasContext: c.getContext("2d"), viewport: vp}).promise;
  }
  document.getElementById("nivel").textContent = zoom ? Math.round(zoom * 100) + " %" : "Ajustar";
}
function actual() { return zoom ?? (cont.clientWidth - 32) / anchoPag; }
document.getElementById("mas").onclick = () => { zoom = actual() * 1.25; dibujar(); };
document.getElementById("menos").onclick = () => { zoom = actual() / 1.25; dibujar(); };
document.getElementById("ajustar").onclick = () => { zoom = null; dibujar(); };
pdfjsLib.getDocument({data: datos}).promise.then(d => { doc = d; dibujar(); });
</script>
</body></html>
"""


def convertir(pdf: Path) -> Path:
    js = (PDFJS / "pdf.min.js").read_text()
    worker = (PDFJS / "pdf.worker.min.js").read_text().replace("</script", "<\\/script")
    out = pdf.with_name(pdf.name + ".html")
    out.write_text(PLANTILLA
                   .replace("__TITULO__", html.escape(pdf.name))
                   .replace("__PDF__", base64.b64encode(pdf.read_bytes()).decode())
                   .replace("__WORKER__", worker)
                   .replace("__PDFJS__", js))
    return out


if __name__ == "__main__":
    for nombre in sys.argv[1:]:
        print("Generado:", convertir(Path(nombre)))
