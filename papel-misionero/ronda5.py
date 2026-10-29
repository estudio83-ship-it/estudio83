"""Ronda 5: las mismas marcas de la ronda 4, con araucaria en lugar de pino.

La araucaria se dibuja con el mismo lenguaje (trazo afinado, puntas redondeadas):
fuste alto y desnudo, ramas casi horizontales que se curvan hacia arriba en la punta,
con un penacho de follaje, y copa plana en forma de cáliz.
Uso:  python3 ronda5.py   →  svg/R5-<n>.svg y svg/R5-<n>-logo.svg
"""
from generar import VERDE, guardar, svg
from pinos import icono
from ronda4 import W, cinta


def araucaria(cx, top, base, ancho, pisos=4, w0=9, w1=2.8, tronco=6.5, penacho=None):
    """Copa en cáliz: pisos de ramas que salen del tronco casi horizontales y se levantan
    en la punta; el piso de arriba es el más ancho, como en el pino Paraná adulto."""
    out = ""
    paso = (base - top) * 0.13
    for k in range(pisos):
        L = ancho / 2 * (1 - 0.2 * k)
        y = top + k * paso
        for lado in (-1, 1):
            out += cinta(((cx, y + L * .12), (cx + lado * L * .45, y + L * .12),
                          (cx + lado * L * .85, y + L * .05), (cx + lado * L, y - L * .07)), w0, w1)
    y_ult = top + (pisos - 1) * paso + ancho / 2 * (1 - 0.2 * (pisos - 1)) * .12
    out += cinta(((cx, base), (cx, base - (base - top) * .3), (cx, y_ult + 10), (cx, top + 2)), tronco, tronco * .6)
    return out


def m1():
    p = (f'<path d="M22 112 V12 H64 C92 12 106 30 106 52 C106 76 90 92 66 92" fill="none" '
         f'stroke-width="{W}" stroke-linecap="round" stroke-linejoin="round"/>')
    return p + araucaria(62, 32, 112, 48, w0=W, w1=2.6, tronco=W), ""


def m2():
    return araucaria(60, 10, 114, 112, pisos=4, w0=11, w1=3.2, tronco=10), ""


def m4():
    arco = '<path d="M12 112 V54 A48 48 0 0 1 108 54 V112 Z"/>'
    return arco, araucaria(60, 30, 114, 74, w0=7, w1=2.6, tronco=7)


def m5():
    p = '<path d="M18 112 V8 H66 C92 8 106 24 106 44 C106 64 92 80 66 80 H44 V112 Z"/>'
    return p, araucaria(62, 24, 112, 50, w0=7, w1=2.6, tronco=6.5)


def m6():
    return '<circle cx="60" cy="60" r="55"/>', araucaria(60, 28, 112, 78, w0=7, w1=2.6, tronco=7)


MARCAS = {1: ("P monolínea con araucaria", m1), 2: ("Araucaria de ramas", m2), 4: ("Araucaria en arco", m4),
          5: ("P con araucaria calada", m5), 6: ("Araucaria en sello", m6)}


def logotipo(n, color=VERDE):
    from helvetica import NIVELES, lineas
    t, c = MARCAS[n][1]()
    d, w, _ = lineas(NIVELES[1][1], x=168)
    iso = f'<g transform="translate(4 20) scale(1.3)">{icono(f"a{n}", t, c, color)}</g>'
    return svg(168 + w + 24, 196, iso + f'<path d="{d}" fill="{color}" transform="translate(0 6)"/>')


if __name__ == "__main__":
    for n, (nombre, f) in MARCAS.items():
        t, c = f()
        guardar(f"R5-{n}.svg", svg(120, 120, icono(f"r5{n}", t, c, VERDE)))
        guardar(f"R5-{n}-logo.svg", logotipo(n))
        print(n, nombre)
