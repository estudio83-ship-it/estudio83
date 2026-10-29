"""Genera las cinco propuestas de logo de Papel Misionero (Cartocor) como SVG.

Uso:  python3 generar.py
Salida: carpeta svg/ con cada propuesta en sus versiones de color.
Los textos se convierten a trazos, así los SVG no dependen de fuentes instaladas.
"""
import math
from pathlib import Path

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont

AQUI = Path(__file__).parent
SALIDA = AQUI / "svg"
SALIDA.mkdir(exist_ok=True)

# Paleta: selva misionera, papel kraft, tierra colorada y papel crudo.
VERDE = "#1F3A2B"
VERDE_OSC = "#12241A"
KRAFT = "#B98A57"
KRAFT_OSC = "#8E6538"
TIERRA = "#B0452B"
CRUDO = "#F2EADB"

SANS = TTFont(AQUI / "fuentes/InstrumentSans-600.woff")
SANS_M = TTFont(AQUI / "fuentes/InstrumentSans-500.woff")
SERIF = TTFont(AQUI / "fuentes/Fraunces-600.woff")


# --- utilidades tipográficas ---------------------------------------------------
def _glifo(font, ch):
    gs = font.getGlyphSet()
    return gs, gs[font.getBestCmap()[ord(ch)]]


def texto(font, s, size, x, y, tracking=0.0):
    """Devuelve (path d, ancho, posiciones x de cada letra) del texto en trazos."""
    k = size / font["head"].unitsPerEm
    d, cx, pos = [], x, []
    for ch in s:
        gs, g = _glifo(font, ch)
        pos.append(cx)
        pen = SVGPathPen(gs)
        g.draw(TransformPen(pen, (k, 0, 0, -k, cx, y)))
        d.append(pen.getCommands())
        cx += g.width * k + tracking
    return " ".join(d), cx - tracking - x, pos


def ancho(font, s, size, tracking=0.0):
    return texto(font, s, size, 0, 0, tracking)[1]


def texto_circular(font, s, size, r, cx, cy, abajo=False, tracking=0.0):
    """Texto sobre un círculo. Arriba se lee en sentido horario; abajo, de izquierda a derecha."""
    k = size / font["head"].unitsPerEm
    anchos = [_glifo(font, ch)[1].width * k for ch in s]
    total = (sum(anchos) + tracking * (len(s) - 1)) / r
    a = (math.pi / 2 + total / 2) if abajo else (-math.pi / 2 - total / 2)
    d = []
    for ch, w in zip(s, anchos):
        da = w / r
        ac = a - da / 2 if abajo else a + da / 2
        px, py = cx + r * math.cos(ac), cy + r * math.sin(ac)
        th = ac - math.pi / 2 if abajo else ac + math.pi / 2
        c, sn = math.cos(th), math.sin(th)
        gs, g = _glifo(font, ch)
        pen = SVGPathPen(gs)
        g.draw(TransformPen(pen, (c * k, sn * k, sn * k, -c * k, px - c * w / 2, py - sn * w / 2)))
        d.append(pen.getCommands())
        paso = (w + tracking) / r
        a = a - paso if abajo else a + paso
    return " ".join(d)


def svg(w, h, cuerpo, fondo=None):
    bg = f'<rect width="{w:.0f}" height="{h:.0f}" fill="{fondo}"/>' if fondo else ""
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}">{bg}{cuerpo}</svg>\n'


def guardar(nombre, contenido):
    (SALIDA / nombre).write_text(contenido, encoding="utf-8")


def bajada(color, x, y, size=13):
    """Línea institucional de respaldo del grupo."""
    d, w, _ = texto(SANS_M, "UNA EMPRESA DE GRUPO ARCOR", size, x, y, tracking=size * 0.16)
    return f'<path d="{d}" fill="{color}"/>', w


# --- 01 Araucaria: el árbol nativo, redibujado ---------------------------------
def araucaria(color, x=0, y=0, s=1.0, trazo=7.0):
    """Araucaria angustifolia estilizada: tronco y tres niveles de ramas en candelabro (caja 120x120)."""
    return f'''<g transform="translate({x:.2f} {y:.2f}) scale({s})" fill="none" stroke="{color}" stroke-width="{trazo}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M8 12 C10 30 26 32 60 32 C94 32 110 30 112 12"/>
    <path d="M22 42 C24 56 36 58 60 58 C84 58 96 56 98 42"/>
    <path d="M38 68 C40 79 48 81 60 81 C72 81 80 79 82 68"/>
    <path d="M60 32 V114"/>
  </g>'''


def p1(simbolo, letras, fondo=None, respaldo=False):
    l1, w1, _ = texto(SANS, "PAPEL", 46, 168, 78, tracking=9)
    l2, w2, _ = texto(SANS, "MISIONERO", 46, 168, 132, tracking=9)
    cuerpo = araucaria(simbolo, 24, 14) + f'<path d="{l1} {l2}" fill="{letras}"/>'
    h = 148
    if respaldo:
        b, _ = bajada(simbolo, 170, 176)
        cuerpo += b
        h = 196
    return svg(168 + max(w1, w2) + 24, h, cuerpo, fondo)


def p1_vertical(simbolo, letras, fondo=None):
    w = 360
    l1, w1, _ = texto(SANS, "PAPEL MISIONERO", 30, 0, 0, tracking=5)
    l1, _, _ = texto(SANS, "PAPEL MISIONERO", 30, (w - w1) / 2, 214, tracking=5)
    cuerpo = araucaria(simbolo, (w - 150) / 2, 20, 1.25, trazo=6.4) + f'<path d="{l1}" fill="{letras}"/>'
    return svg(w, 244, cuerpo, fondo)


# --- 02 Pliego: el bosque dentro del papel ---------------------------------------
def pliego(papel, pliegue, arbol, x=0, y=0, s=1.0):
    return f'''<g transform="translate({x} {y}) scale({s})">
    <path d="M10 0 H90 L130 40 V120 a10 10 0 0 1 -10 10 H10 a10 10 0 0 1 -10 -10 V10 a10 10 0 0 1 10 -10 Z" fill="{papel}"/>
    <path d="M90 0 V30 a10 10 0 0 0 10 10 H130 Z" fill="{pliegue}"/>
    {araucaria(arbol, 21, 22, 0.74, trazo=8.5)}
  </g>'''


def p2(papel, pliegue, arbol, letras, fondo=None):
    l1, w1, _ = texto(SANS, "Papel", 50, 176, 74, tracking=-0.5)
    l2, w2, _ = texto(SANS, "Misionero", 50, 176, 128, tracking=-0.5)
    cuerpo = pliego(papel, pliegue, arbol, 18, 9) + f'<path d="{l1} {l2}" fill="{letras}"/>'
    return svg(176 + max(w1, w2) + 24, 148, cuerpo, fondo)


# --- 03 Misionero: la «i» se vuelve araucaria ----------------------------------
def p3(letras, arbol, fondo=None):
    size, base, pal = 112, 184, "misionero"
    _, w, pos = texto(SERIF, pal, size, 24, base)
    partes = [texto(SERIF, ch, size, pos[i], base)[0] for i, ch in enumerate(pal) if i != 1]
    cx = pos[1] + ancho(SERIF, "i", size) / 2
    # El fuste de la «i» es el tronco y el punto, la copa.
    copa = f'''<g fill="none" stroke="{arbol}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M{cx - 38} {base - 116} C{cx - 37} {base - 106} {cx - 28} {base - 103} {cx} {base - 103} C{cx + 28} {base - 103} {cx + 37} {base - 106} {cx + 38} {base - 116}"/>
    <path d="M{cx - 24} {base - 93} C{cx - 23} {base - 85} {cx - 16} {base - 83} {cx} {base - 83} C{cx + 16} {base - 83} {cx + 23} {base - 85} {cx + 24} {base - 93}"/>
    <path d="M{cx} {base - 103} V{base - 60}" stroke-width="9"/>
    <path d="M{cx} {base - 62} V{base - 6}" stroke-width="13"/>
  </g>'''
    p, _, _ = texto(SANS, "PAPEL", 26, 28, 40, tracking=12)
    cuerpo = f'<path d="{" ".join(partes)}" fill="{letras}"/>' + copa + f'<path d="{p}" fill="{arbol}"/>'
    return svg(24 + w + 24, 216, cuerpo, fondo)


# --- 04 Anillos: los anillos del árbol son la bobina de papel, y forman la P ------
def anillos(exterior, interior, x=0, y=0, s=1.0, trazo=10):
    """La P: el pliego se desenrolla desde la bobina y baja como fuste (caja 120x150)."""
    cx, cy, r = 66, 52, 42
    ang = math.radians(118)  # el anillo exterior termina abajo a la izquierda
    ex, ey = cx + r * math.cos(ang), cy + r * math.sin(ang)
    return f'''<g transform="translate({x} {y}) scale({s})" fill="none" stroke-linecap="round" stroke-width="{trazo}">
    <path d="M{cx - r} 142 V{cy} A{r} {r} 0 1 1 {ex:.2f} {ey:.2f}" stroke="{exterior}"/>
    <circle cx="{cx}" cy="{cy}" r="{r - 15}" stroke="{interior}" stroke-width="{trazo * 0.6}"/>
    <circle cx="{cx}" cy="{cy}" r="{r - 28}" stroke="{interior}" stroke-width="{trazo * 0.6}"/>
    <circle cx="{cx}" cy="{cy}" r="4.5" fill="{interior}" stroke="none"/>
  </g>'''


def p4(exterior, interior, letras, fondo=None):
    l1, w1, _ = texto(SANS, "Papel", 52, 150, 82, tracking=-0.8)
    l2, w2, _ = texto(SANS, "Misionero", 52, 150, 138, tracking=-0.8)
    cuerpo = anillos(exterior, interior, 18, 12) + f'<path d="{l1} {l2}" fill="{letras}"/>'
    return svg(150 + max(w1, w2) + 24, 172, cuerpo, fondo)


# --- 05 Sello de origen: la marca como certificado de procedencia ----------------
def sello(tinta, acento, fondo_int=None, x=0, y=0, s=1.0):
    cx = cy = 100
    arriba = texto_circular(SANS, "PAPEL MISIONERO", 16, 71, cx, cy, tracking=4.6)
    abajo = texto_circular(SANS, "MISIONES · ARGENTINA", 13, 82, cx, cy, abajo=True, tracking=3.4)
    relleno = f'<circle cx="{cx}" cy="{cy}" r="58" fill="{fondo_int}"/>' if fondo_int else ""
    puntos = "".join(
        f'<circle cx="{cx + 75 * math.cos(math.radians(a)):.2f}" cy="{cy + 75 * math.sin(math.radians(a)):.2f}" r="3" fill="{acento}"/>'
        for a in (180, 0)
    )
    anio, wa, _ = texto(SANS, "1975", 14, 0, 0, tracking=3)
    anio, _, _ = texto(SANS, "1975", 14, cx - wa / 2, 146, tracking=3)
    return f'''<g transform="translate({x} {y}) scale({s})">
    <circle cx="{cx}" cy="{cy}" r="96" fill="none" stroke="{tinta}" stroke-width="4"/>
    <circle cx="{cx}" cy="{cy}" r="58" fill="none" stroke="{tinta}" stroke-width="2"/>
    {relleno}
    <path d="{arriba}" fill="{tinta}"/>
    <path d="{abajo}" fill="{tinta}"/>
    {puntos}
    {araucaria(acento, cx - 30, 54, 0.5, trazo=8.5)}
    <path d="{anio}" fill="{tinta}"/>
  </g>'''


def p5(tinta, acento, fondo=None, fondo_int=None):
    return svg(220, 220, sello(tinta, acento, fondo_int, 10, 10), fondo)


def p5_horizontal(tinta, acento, letras, fondo=None):
    l1, w1, _ = texto(SANS, "PAPEL", 44, 238, 96, tracking=8)
    l2, w2, _ = texto(SANS, "MISIONERO", 44, 238, 148, tracking=8)
    b, wb = bajada(acento, 240, 186, 12)
    cuerpo = sello(tinta, acento, None, 12, 12) + f'<path d="{l1} {l2}" fill="{letras}"/>' + b
    return svg(238 + max(w1, w2, wb) + 28, 224, cuerpo, fondo)


# === Ronda 2: refinamiento de Araucaria y Anillos ===============================
def araucaria_copa(color, x=0, y=0, s=1.0, reducida=False):
    """Pino Paraná en silueta: tronco largo y copa plana en capas de follaje (caja 120x160).
    La versión reducida usa tres capas para tamaños menores a 24 px."""
    capas = ([(8, 116, 9, 10), (34, 88, 8, 9.5), (58, 58, 6, 9)] if reducida
             else [(8, 116, 8, 9), (31, 94, 7, 8.5), (52, 70, 6, 8), (70, 44, 5, 7)])
    wt, wb, bot, top = 2.4, 5.4, 152, 24
    d = f'<path d="M{60 - wt} {top} L{60 - wb} {bot} Q60 {bot + 2.5} {60 + wb} {bot} L{60 + wt} {top} Z"/>'
    for yy, w, sag, th in capas:
        l, r = 60 - w / 2, 60 + w / 2
        d += f'<path d="M{l} {yy} Q60 {yy + sag * 2} {r} {yy} Q60 {yy + sag * 2 + th * 2} {l} {yy} Z"/>'
    # El contorno redondea las puntas de cada capa, más noble en flexografía.
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({s})" fill="{color}" stroke="{color}" '
            f'stroke-width="2.6" stroke-linejoin="round">{d}</g>')


def _espiral(off, cx=64, cy=56, r0=6, R=36, vueltas=1, n=500):
    """Espiral que termina en el extremo izquierdo, bajando: de ahí nace el fuste de la P."""
    tend = math.pi + 2 * math.pi * vueltas
    b = (R - r0) / tend
    pts = []
    for i in range(n):
        t = tend * i / (n - 1)
        r = r0 + b * t + off
        pts.append((cx + r * math.cos(-t), cy + r * math.sin(-t)))
    return pts


def bobina_fibra(color, x=0, y=0, s=1.0, reducida=False):
    """La P como bobina: tres hebras de fibra se enrollan y se desenrollan en el fuste,
    con los extremos desparejos como el borde de un papel rasgado (caja 120x170).
    La versión reducida usa una sola hebra gruesa para tamaños menores a 32 px."""
    hebras = [(6.4, 162)] if reducida else [(0, 160), (6.4, 150), (12.8, 165)]
    d = ""
    for off, fin in hebras:
        pts = _espiral(off)
        ex = pts[-1][0]
        d += '<path d="M' + " L".join(f"{px:.2f} {py:.2f}" for px, py in pts) + f' L{ex:.2f} {fin}"/>'
    return (f'<g transform="translate({x:.2f} {y:.2f}) scale({s})" fill="none" stroke="{color}" '
            f'stroke-width="{13 if reducida else 4.2}" stroke-linecap="round" stroke-linejoin="round">{d}</g>')


def r2_araucaria(simbolo, letras, fondo=None, respaldo=False):
    l1, w1, _ = texto(SANS, "PAPEL", 46, 150, 92, tracking=9)
    l2, w2, _ = texto(SANS, "MISIONERO", 46, 150, 146, tracking=9)
    cuerpo = araucaria_copa(simbolo, 20, 12, 1.0) + f'<path d="{l1} {l2}" fill="{letras}"/>'
    h = 180
    if respaldo:
        b, _ = bajada(simbolo, 152, 192)
        cuerpo += b
        h = 206
    return svg(150 + max(w1, w2) + 24, h, cuerpo, fondo)


def r2_araucaria_vertical(simbolo, letras, fondo=None):
    w = 360
    _, w1, _ = texto(SANS, "PAPEL MISIONERO", 30, 0, 0, tracking=5)
    l1, _, _ = texto(SANS, "PAPEL MISIONERO", 30, (w - w1) / 2, 262, tracking=5)
    cuerpo = araucaria_copa(simbolo, (w - 168) / 2, 18, 1.4) + f'<path d="{l1}" fill="{letras}"/>'
    return svg(w, 290, cuerpo, fondo)


def r2_bobina(simbolo, letras, fondo=None, respaldo=False):
    l1, w1, _ = texto(SANS, "Papel", 54, 150, 92, tracking=-0.8)
    l2, w2, _ = texto(SANS, "Misionero", 54, 150, 150, tracking=-0.8)
    cuerpo = bobina_fibra(simbolo, 18, 8) + f'<path d="{l1} {l2}" fill="{letras}"/>'
    h = 186
    if respaldo:
        b, _ = bajada(simbolo, 152, 196)
        cuerpo += b
        h = 210
    return svg(150 + max(w1, w2) + 24, h, cuerpo, fondo)


def r2_bobina_vertical(simbolo, letras, fondo=None):
    w = 360
    _, w1, _ = texto(SANS, "Papel Misionero", 36, 0, 0, tracking=-0.4)
    l1, _, _ = texto(SANS, "Papel Misionero", 36, (w - w1) / 2, 286, tracking=-0.4)
    cuerpo = bobina_fibra(simbolo, (w - 168) / 2 - 6, 14, 1.4) + f'<path d="{l1}" fill="{letras}"/>'
    return svg(w, 312, cuerpo, fondo)


if __name__ == "__main__":
    for f in SALIDA.glob("*.svg"):
        f.unlink()

    guardar("01-araucaria-color.svg", p1(KRAFT, VERDE))
    guardar("01-araucaria-respaldo.svg", p1(KRAFT, VERDE, respaldo=True))
    guardar("01-araucaria-negativo.svg", p1(KRAFT, CRUDO, VERDE))
    guardar("01-araucaria-monocromo.svg", p1(VERDE, VERDE))
    guardar("01-araucaria-vertical.svg", p1_vertical(KRAFT, VERDE))
    guardar("01-simbolo.svg", svg(160, 140, araucaria(VERDE, 20, 6)))

    guardar("02-pliego-color.svg", p2(KRAFT, KRAFT_OSC, CRUDO, VERDE))
    guardar("02-pliego-negativo.svg", p2(KRAFT, KRAFT_OSC, VERDE, CRUDO, VERDE))
    guardar("02-pliego-monocromo.svg", p2(VERDE, VERDE_OSC, CRUDO, VERDE))
    guardar("02-simbolo.svg", svg(150, 150, pliego(KRAFT, KRAFT_OSC, VERDE, 10, 10)))

    guardar("03-misionero-color.svg", p3(VERDE, TIERRA))
    guardar("03-misionero-negativo.svg", p3(CRUDO, KRAFT, VERDE))
    guardar("03-misionero-monocromo.svg", p3(VERDE, VERDE))

    guardar("04-anillos-color.svg", p4(TIERRA, VERDE, VERDE))
    guardar("04-anillos-negativo.svg", p4(KRAFT, CRUDO, CRUDO, VERDE))
    guardar("04-anillos-monocromo.svg", p4(VERDE, VERDE, VERDE))
    guardar("04-simbolo.svg", svg(150, 176, anillos(TIERRA, VERDE, 14, 12)))

    guardar("05-sello-color.svg", p5(VERDE, TIERRA))
    guardar("05-sello-negativo.svg", p5(CRUDO, KRAFT, VERDE))
    guardar("05-sello-monocromo.svg", p5(VERDE, VERDE))
    guardar("05-sello-horizontal.svg", p5_horizontal(VERDE, TIERRA, VERDE))

    # Versiones claras sin fondo, para aplicaciones sobre color.
    guardar("01-simbolo-claro.svg", svg(160, 140, araucaria(KRAFT, 20, 6)))
    guardar("03-misionero-claro.svg", p3(CRUDO, KRAFT))
    guardar("04-simbolo-claro.svg", svg(150, 176, anillos(KRAFT, CRUDO, 14, 12)))
    guardar("05-sello-claro.svg", p5(CRUDO, KRAFT))

    # Ronda 2
    guardar("R2-araucaria-color.svg", r2_araucaria(VERDE, VERDE))
    guardar("R2-araucaria-respaldo.svg", r2_araucaria(VERDE, VERDE, respaldo=True))
    guardar("R2-araucaria-negativo.svg", r2_araucaria(KRAFT, CRUDO, VERDE))
    guardar("R2-araucaria-kraft.svg", r2_araucaria(VERDE, VERDE, KRAFT))
    guardar("R2-araucaria-vertical.svg", r2_araucaria_vertical(VERDE, VERDE))
    guardar("R2-araucaria-simbolo.svg", svg(150, 176, araucaria_copa(VERDE, 15, 8)))
    guardar("R2-araucaria-simbolo-reducido.svg", svg(150, 176, araucaria_copa(VERDE, 15, 8, reducida=True)))
    guardar("R2-araucaria-simbolo-claro.svg", svg(150, 176, araucaria_copa(KRAFT, 15, 8)))
    guardar("R2-bobina-color.svg", r2_bobina(TIERRA, VERDE))
    guardar("R2-bobina-respaldo.svg", r2_bobina(TIERRA, VERDE, respaldo=True))
    guardar("R2-bobina-negativo.svg", r2_bobina(KRAFT, CRUDO, VERDE))
    guardar("R2-bobina-kraft.svg", r2_bobina(VERDE, VERDE, KRAFT))
    guardar("R2-bobina-vertical.svg", r2_bobina_vertical(TIERRA, VERDE))
    guardar("R2-bobina-simbolo.svg", svg(150, 190, bobina_fibra(TIERRA, 12, 10)))
    guardar("R2-bobina-simbolo-reducido.svg", svg(150, 190, bobina_fibra(TIERRA, 12, 10, reducida=True)))
    guardar("R2-bobina-simbolo-claro.svg", svg(150, 190, bobina_fibra(KRAFT, 12, 10)))
    guardar("R2-bobina-monocromo.svg", r2_bobina(VERDE, VERDE))
    print("\n".join(sorted(p.name for p in SALIDA.iterdir())))
