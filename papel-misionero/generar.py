"""Genera las propuestas de logo de Papel Misionero (Cartocor) como SVG.

Uso:  python3 generar.py
Salida: carpeta svg/ con cada propuesta en sus versiones de color.
Los textos se convierten a trazos, así los SVG no dependen de fuentes instaladas.
"""
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

AQUI = Path(__file__).parent
SALIDA = AQUI / "svg"
SALIDA.mkdir(exist_ok=True)

# Paleta: selva misionera, papel kraft, tierra colorada y papel crudo.
VERDE = "#1F3A2B"
KRAFT = "#B98A57"
KRAFT_OSC = "#8E6538"
TIERRA = "#B0452B"
CRUDO = "#F2EADB"

SANS = TTFont(AQUI / "fuentes/InstrumentSans-600.woff")
SANS_M = TTFont(AQUI / "fuentes/InstrumentSans-500.woff")
SERIF = TTFont(AQUI / "fuentes/Fraunces-600.woff")


def texto(font, s, size, x, y, tracking=0.0):
    """Devuelve (path d, ancho, posiciones x de cada letra) del texto en trazos."""
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    k = size / font["head"].unitsPerEm
    d, cx, pos = [], x, []
    for ch in s:
        g = cmap[ord(ch)]
        pos.append(cx)
        pen = SVGPathPen(gs)
        gs[g].draw(TransformPen(pen, (k, 0, 0, -k, cx, y)))
        d.append(pen.getCommands())
        cx += gs[g].width * k + tracking
    return " ".join(d), cx - tracking - x, pos


def ancho_glifo(font, ch, size):
    return font.getGlyphSet()[font.getBestCmap()[ord(ch)]].width * size / font["head"].unitsPerEm


def araucaria(color, x=0, y=0, s=1.0, trazo=7.0):
    """Araucaria angustifolia estilizada: tronco y tres niveles de ramas en candelabro."""
    t = f'transform="translate({x} {y}) scale({s})"'
    return f'''<g {t} fill="none" stroke="{color}" stroke-width="{trazo}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 12 C10 30 26 32 60 32 C94 32 110 30 112 12"/>
    <path d="M22 42 C24 56 36 58 60 58 C84 58 96 56 98 42"/>
    <path d="M38 68 C40 79 48 81 60 81 C72 81 80 79 82 68"/>
    <path d="M60 32 V114"/>
  </g>'''


def svg(w, h, cuerpo, fondo=None):
    bg = f'<rect width="{w}" height="{h}" fill="{fondo}"/>' if fondo else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{bg}{cuerpo}</svg>\n'


def guardar(nombre, contenido):
    (SALIDA / nombre).write_text(contenido, encoding="utf-8")


# --- Propuesta A: "Araucaria" — símbolo + logotipo en palo seco -----------------
def propuesta_a(simbolo, letras, fondo=None):
    l1, w1, _ = texto(SANS, "PAPEL", 46, 168, 78, tracking=9)
    l2, w2, _ = texto(SANS, "MISIONERO", 46, 168, 132, tracking=9)
    cuerpo = araucaria(simbolo, 24, 14, 1.0) + f'<path d="{l1} {l2}" fill="{letras}"/>'
    return svg(int(168 + max(w1, w2) + 24), 148, cuerpo, fondo)


def propuesta_a_vertical(simbolo, letras, fondo=None):
    w = 360
    l1, w1, _ = texto(SANS, "PAPEL MISIONERO", 30, 0, 0, tracking=5)
    l1, w1, _ = texto(SANS, "PAPEL MISIONERO", 30, (w - w1) / 2, 214, tracking=5)
    cuerpo = araucaria(simbolo, (w - 150) / 2, 20, 1.25, trazo=6.4) + f'<path d="{l1}" fill="{letras}"/>'
    return svg(w, 244, cuerpo, fondo)


# --- Propuesta B: "Pliego" — la araucaria dentro de una hoja kraft con esquina plegada
def pliego(papel, pliegue, arbol, x=0, y=0, s=1.0):
    return f'''<g transform="translate({x} {y}) scale({s})">
    <path d="M10 0 H90 L130 40 V120 a10 10 0 0 1 -10 10 H10 a10 10 0 0 1 -10 -10 V10 a10 10 0 0 1 10 -10 Z" fill="{papel}"/>
    <path d="M90 0 V30 a10 10 0 0 0 10 10 H130 Z" fill="{pliegue}"/>
    {araucaria(arbol, 21, 22, 0.74, trazo=8.5)}
  </g>'''


def propuesta_b(papel, pliegue, arbol, letras, fondo=None):
    l1, w1, _ = texto(SANS, "Papel", 50, 176, 74, tracking=-0.5)
    l2, w2, _ = texto(SANS, "Misionero", 50, 176, 128, tracking=-0.5)
    cuerpo = pliego(papel, pliegue, arbol, 18, 9) + f'<path d="{l1} {l2}" fill="{letras}"/>'
    return svg(int(176 + max(w1, w2) + 24), 148, cuerpo, fondo)


# --- Propuesta C: "Misionero" — logotipo serif con la araucaria como la i ----------
def propuesta_c(letras, arbol, fondo=None):
    size = 112
    base = 184
    pal = "misionero"
    d, w, pos = texto(SERIF, pal, size, 24, base)
    # Reconstruimos la palabra sin la primera "i" y la reemplazamos por la araucaria.
    partes = []
    for i, ch in enumerate(pal):
        if i == 1:
            continue
        di, _, _ = texto(SERIF, ch, size, pos[i], base)
        partes.append(di)
    ai = ancho_glifo(SERIF, "i", size)
    cx = pos[1] + ai / 2
    # La "i" se vuelve araucaria: el fuste es el tronco y el punto, la copa.
    arbol_svg = f'''<g fill="none" stroke="{arbol}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M{cx - 38} {base - 116} C{cx - 37} {base - 106} {cx - 28} {base - 103} {cx} {base - 103} C{cx + 28} {base - 103} {cx + 37} {base - 106} {cx + 38} {base - 116}"/>
    <path d="M{cx - 24} {base - 93} C{cx - 23} {base - 85} {cx - 16} {base - 83} {cx} {base - 83} C{cx + 16} {base - 83} {cx + 23} {base - 85} {cx + 24} {base - 93}"/>
    <path d="M{cx} {base - 103} V{base - 60}" stroke-width="9"/>
    <path d="M{cx} {base - 62} V{base - 6}" stroke-width="13"/>
  </g>'''
    # "papel" en palo seco, espaciado, sobre la palabra principal
    p, pw, _ = texto(SANS, "PAPEL", 26, 24 + 4, 40, tracking=12)
    cuerpo = f'<path d="{" ".join(partes)}" fill="{letras}"/>' + arbol_svg + f'<path d="{p}" fill="{arbol}"/>'
    return svg(int(24 + w + 24), 216, cuerpo, fondo)


if __name__ == "__main__":
    guardar("A-araucaria-color.svg", propuesta_a(KRAFT, VERDE))
    guardar("A-araucaria-negativo.svg", propuesta_a(KRAFT, CRUDO, VERDE))
    guardar("A-araucaria-monocromo.svg", propuesta_a(VERDE, VERDE))
    guardar("A-araucaria-vertical.svg", propuesta_a_vertical(KRAFT, VERDE))
    guardar("A-simbolo.svg", svg(160, 140, araucaria(VERDE, 20, 6)))

    guardar("B-pliego-color.svg", propuesta_b(KRAFT, KRAFT_OSC, CRUDO, VERDE))
    guardar("B-pliego-negativo.svg", propuesta_b(KRAFT, KRAFT_OSC, VERDE, CRUDO, VERDE))
    guardar("B-pliego-monocromo.svg", propuesta_b(VERDE, "#0F241A", CRUDO, VERDE))
    guardar("B-simbolo.svg", svg(150, 150, pliego(KRAFT, KRAFT_OSC, VERDE, 10, 10)))

    guardar("C-misionero-color.svg", propuesta_c(VERDE, TIERRA))
    guardar("C-misionero-negativo.svg", propuesta_c(CRUDO, KRAFT, VERDE))
    guardar("C-misionero-monocromo.svg", propuesta_c(VERDE, VERDE))
    print("\n".join(sorted(p.name for p in SALIDA.iterdir())))
