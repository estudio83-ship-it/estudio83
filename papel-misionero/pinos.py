"""Diez isotipos basados en el pino (Pinus elliottii y P. taeda), materia prima de Papel Misionero.

Uso:  python3 pinos.py   →  svg/P<n>.svg (caja 120x120)
"""
from generar import CRUDO, KRAFT, KRAFT_OSC, TIERRA, VERDE, VERDE_OSC, guardar, svg


def tronco(x=60, y0=70, y1=114, w=8, c=VERDE):
    return f'<rect x="{x - w / 2}" y="{y0}" width="{w}" height="{y1 - y0}" rx="2" fill="{c}"/>'


def pisos(x, top, w, h, n, c):
    """Copa cónica en n pisos superpuestos (triángulos)."""
    out = ""
    for k in range(n):
        y = top + k * h * 0.55
        ww = w * (0.55 + 0.45 * (k + 1) / n)
        out += f'<path d="M{x} {y} L{x + ww / 2} {y + h} L{x - ww / 2} {y + h} Z" fill="{c}"/>'
    return out


def pino_chico(x, base, alto, c):
    w = alto * 0.55
    return (f'<path d="M{x} {base - alto} L{x + w / 2} {base - alto * .22} L{x - w / 2} {base - alto * .22} Z" fill="{c}"/>'
            f'<rect x="{x - alto * .04}" y="{base - alto * .25}" width="{alto * .08}" height="{alto * .25}" fill="{c}"/>')


def acicula(x0, y0, x1, y1, curva, c, w=4):
    cx = (x0 + x1) / 2 + curva
    return f'<path d="M{x0} {y0} Q{cx} {(y0 + y1) / 2} {x1} {y1}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linecap="round"/>'


def piña():
    clip = '<clipPath id="pi"><path d="M60 8 C88 22 92 70 76 104 Q60 116 44 104 C28 70 32 22 60 8 Z"/></clipPath>'
    lineas = "".join(f'<path d="M{x} 0 L{x + 120} 120 M{x + 120} 0 L{x} 120" stroke="{CRUDO}" stroke-width="3"/>' for x in range(-120, 121, 16))
    return clip + f'<g clip-path="url(#pi)"><rect width="120" height="120" fill="{KRAFT_OSC}"/>{lineas}</g>' + tronco(60, 106, 116, 6, KRAFT_OSC)


def plegado():
    out = ""
    for k, (y, w) in enumerate(((8, 52), (30, 76), (54, 100))):
        h = 34
        out += f'<path d="M60 {y} L60 {y + h} L{60 - w / 2} {y + h} Z" fill="{VERDE}"/>'
        out += f'<path d="M60 {y} L{60 + w / 2} {y + h} L60 {y + h} Z" fill="{VERDE_OSC}"/>'
    return out + tronco(60, 88, 114, 9, KRAFT_OSC)


def fibras():
    g = f'<g fill="none" stroke="{VERDE}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">'
    for y, w in ((10, 40), (28, 64), (46, 88), (64, 108)):
        for o in (0, 6):
            g += f'<path d="M{60 - w / 2} {y + 22 + o} L60 {y + o} L{60 + w / 2} {y + 22 + o}"/>'
    return g + "".join(f'<path d="M{x} 116 V14"/>' for x in (55, 60, 65)) + "</g>"


def anillos_pino():
    rings = "".join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{KRAFT}" stroke-width="4"/>'
                    for cx, cy, r in ((60, 60, 54), (59, 61, 44), (58, 62, 35)))
    return f'<circle cx="60" cy="60" r="56" fill="{VERDE}"/>' + rings + pino_chico(58, 86, 50, CRUDO)


PINOS = {
    1: ("Pino de pisos", pisos(60, 6, 92, 40, 3, VERDE) + tronco(60, 76, 114)),
    2: ("Pino adulto de plantación",
        f'<g stroke="{VERDE}" stroke-width="4" stroke-linecap="round">'
        + "".join(f'<path d="M60 {y} L{x} {yy}"/>' for y, x, yy in ((50, 34, 36), (44, 86, 30), (36, 44, 22), (30, 74, 16)))
        + "</g>"
        + "".join(f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{VERDE}"/>'
                  for x, y, rx, ry in ((30, 34, 18, 8), (90, 28, 18, 8), (42, 20, 16, 7), (78, 14, 16, 7), (60, 8, 14, 6), (60, 28, 16, 7)))
        + tronco(60, 24, 116, 7)),
    3: ("Fascículo de acículas",
        acicula(60, 100, 30, 8, -8, VERDE) + acicula(60, 100, 60, 4, 0, VERDE) + acicula(60, 100, 90, 8, 8, VERDE)
        + f'<rect x="54" y="96" width="12" height="18" rx="3" fill="{KRAFT_OSC}"/>'),
    4: ("Pino plegado", plegado()),
    5: ("Piña", piña()),
    6: ("Hilera de plantación",
        pino_chico(22, 100, 54, VERDE) + pino_chico(48, 100, 76, VERDE) + pino_chico(76, 100, 92, VERDE) + pino_chico(102, 100, 64, VERDE)
        + f'<rect x="4" y="102" width="112" height="6" rx="2" fill="{TIERRA}"/>'),
    7: ("Pino de fibras", fibras()),
    8: ("Pino en sello", f'<circle cx="60" cy="60" r="56" fill="{VERDE}"/>' + pino_chico(60, 104, 84, CRUDO)),
    9: ("Pliego con plantación",
        f'<path d="M8 6 H84 L114 36 V106 a8 8 0 0 1 -8 8 H8 a8 8 0 0 1 -8 -8 V14 a8 8 0 0 1 8 -8 Z" fill="{KRAFT}"/>'
        f'<path d="M84 6 V30 a6 6 0 0 0 6 6 H114 Z" fill="{KRAFT_OSC}"/>'
        + pino_chico(30, 100, 50, VERDE) + pino_chico(56, 100, 70, VERDE) + pino_chico(84, 100, 56, VERDE)),
    10: ("Anillos y pino", anillos_pino()),
}

if __name__ == "__main__":
    for n, (nombre, cuerpo) in PINOS.items():
        guardar(f"P{n}.svg", svg(120, 120, cuerpo))
        print(n, nombre)
