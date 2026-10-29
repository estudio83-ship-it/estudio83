"""Ronda 3 de isotipos: A) P con pino, B) fascículo, C) pino que es pliego.

Mismas reglas que pinos.py: retícula 120, una tinta, calados por máscara (mín. 5).
Uso:  python3 ronda3.py   →  svg/R3-<id>.svg
"""
import math

from fontTools.ttLib import TTFont

from generar import AQUI, VERDE, guardar, svg, texto
from pinos import CAL, aguja, icono, pino

BOLD = TTFont(AQUI / "fuentes/FreeSansBold.ttf")


def p_helvetica(x, base, alto):
    """La P de Helvetica Bold (sustituto libre) con altura de mayúscula `alto`."""
    size = alto * BOLD["head"].unitsPerEm / BOLD["OS/2"].sCapHeight
    d, w, _ = texto(BOLD, "P", size, 0, 0)
    d, _, _ = texto(BOLD, "P", size, x - w / 2, base)
    return d, w


def invertir(tinta, cortes):
    """Pino calado dentro de otra forma: la tinta del pino pasa a calado y sus cortes a tinta."""
    return (tinta.replace("<path", '<path fill="#000"').replace("<rect", '<rect fill="#000"')
            + cortes.replace('fill="#fff"', 'fill="#000"').replace('fill="none"', 'fill="none" stroke="#fff"'))


# --- A · P con pino -------------------------------------------------------------
def a1():
    """El ojo de la P es un pino."""
    t = '<path d="M20 112 V8 H68 A34 32 0 0 1 68 72 H46 V112 Z"/>'
    c = '<path d="M66 20 L80 40 H52 Z"/><path d="M66 28 L86 58 H46 Z"/>'
    c += '<path d="M48 41 L66 28 L84 41" fill="none" stroke="#fff" stroke-width="4"/>'
    return t, c


def a2():
    """P de Helvetica Bold: el ojo se rellena y en su lugar se cala un pino."""
    d, w = p_helvetica(60, 112, 104)
    x0 = 60 - w / 2
    t = f'<path d="{d}"/><rect x="{x0 + 22}" y="16" width="{w * .52}" height="52"/>'
    cx = x0 + w * .52
    c = (f'<path d="M{cx} 20 L{cx + 14} 40 H{cx - 14} Z"/><path d="M{cx} 28 L{cx + 20} 58 H{cx - 20} Z"/>'
         f'<path d="M{cx - 18} 41 L{cx} 28 L{cx + 18} 41" fill="none" stroke="#fff" stroke-width="4"/>')
    return t, c


def a3():
    """El asta de la P es un pino; el ojo, un arco limpio que nace de la copa."""
    a, b = pino(34, 6, 108, 52)
    arco = '<path d="M48 14 H66 A30 29 0 0 1 66 72 H52" fill="none" stroke-width="15" stroke-linecap="butt"/>'
    return a + arco, b


def a4():
    """p minúscula geométrica: asta y ojo circular con un pino calado."""
    t = '<rect x="24" y="22" width="22" height="94" rx="2"/><circle cx="68" cy="52" r="30"/><rect x="24" y="22" width="44" height="60"/>'
    c = '<path d="M68 28 L82 47 H54 Z"/><path d="M68 36 L87 66 H49 Z"/><rect x="65" y="64" width="6" height="8"/>'
    c += '<path d="M51 48 L68 36 L85 48" fill="none" stroke="#fff" stroke-width="4"/>'
    return t, c


def b1():
    """Tres acículas idénticas abiertas en abanico desde la vaina."""
    t = "".join(aguja(a, 88, (60, 90), 7.5) for a in (-17, 0, 17))
    return t + '<rect x="51" y="88" width="18" height="24" rx="4"/>', '<rect x="51" y="96" width="18" height="3.5"/>'


def b2():
    """Tres pliegos: bandas rectas que se abren como acículas (fibra larga)."""
    t = ""
    for ang in (-14, 0, 14):
        t += f'<rect x="54.5" y="8" width="11" height="92" rx="2" transform="rotate({ang} 60 104)"/>'
    return t + '<rect x="48" y="96" width="24" height="16" rx="3"/>', '<rect x="0" y="92" width="120" height="4"/>'


def b3():
    """Fascículo calado dentro de un disco: sello."""
    c = "".join(aguja(a, 70, (60, 92), 7) for a in (-18, 0, 18)) + '<rect x="52.5" y="90" width="15" height="18" rx="3.5"/>'
    return '<circle cx="60" cy="60" r="54"/>', c + '<rect x="52.5" y="96" width="15" height="3" fill="#fff"/>'


def b4():
    """Una acícula recta y otra que se curva: el fascículo dibuja la P."""
    t = aguja(0, 96, (38, 104), 10)
    t += '<path d="M38 100 C38 40 42 12 66 12 C86 12 98 26 98 42 C98 60 84 70 64 70 L50 70" fill="none" stroke-width="8" stroke-linecap="round"/>'
    return t + '<rect x="29" y="98" width="18" height="16" rx="4"/>', '<rect x="29" y="104" width="18" height="3"/>'


def c1():
    """Hoja cuadrada con dos pliegues diagonales que dejan un pino en el centro."""
    t = '<rect x="10" y="10" width="100" height="100" rx="4"/>'
    c = f'<path d="M12 112 L60 16 L108 112" fill="none" stroke-width="{CAL}" stroke-linejoin="miter"/>'
    c += f'<rect x="{60 - CAL / 2}" y="86" width="{CAL}" height="28"/>'
    return t, c


def c2():
    """El pino es el espacio entre dos pliegos."""
    t = '<rect x="8" y="10" width="104" height="102" rx="4"/>'
    a, b = pino(60, 18, 94, 70)
    return t, invertir(a, b) + f'<rect x="{60 - CAL / 2}" y="100" width="{CAL}" height="14" fill="#000"/>'


def c3():
    """Tres pliegos de una bolsa multipliego, superpuestos en forma de pino."""
    t, c = "", ""
    for k, (y, w) in enumerate(((8, 56), (30, 82), (52, 108))):
        h = 44
        tri = f"M60 {y} L{60 + w / 2} {y + h} L{60 - w / 2} {y + h} Z"
        t += f'<path d="{tri}"/>'
        if k:
            c += f'<path d="M{60 - w / 2} {y + h} L60 {y} L{60 + w / 2} {y + h}" fill="none" stroke-width="{CAL}"/>'
            c += f'<path d="{tri}" fill="#fff"/>'
    return t + '<rect x="55" y="94" width="10" height="18" rx="1.5"/>', c


def c4():
    """Un solo pliego doblado al medio: la cara trasera se marca con un rayado calado."""
    t = '<path d="M60 6 L106 88 H14 Z"/><rect x="54" y="86" width="12" height="26" rx="1.5"/>'
    c = '<rect x="58.5" y="14" width="3" height="74"/>'
    c += "".join(f'<rect x="61.5" y="{y}" width="60" height="2.4"/>' for y in range(24, 88, 7))
    return t, c


RONDA = {
    "A1": ("P · ojo de pino", a1), "A2": ("P Helvetica · pino calado", a2), "A3": ("P · asta de pino", a3), "A4": ("P redonda · ojo de pino", a4),
    "B1": ("Fascículo", b1), "B2": ("Fascículo de pliegos", b2), "B3": ("Fascículo en sello", b3), "B4": ("Fascículo que dibuja la P", b4),
    "C1": ("Hoja con pliegues", c1), "C2": ("Pino entre pliegos", c2), "C3": ("Pino multipliego", c3), "C4": ("Pliego doblado", c4),
}

if __name__ == "__main__":
    for k, (nombre, f) in RONDA.items():
        t, c = f()
        guardar(f"R3-{k}.svg", svg(120, 120, icono(f"r{k}", t, c, VERDE)))
        print(k, nombre)
