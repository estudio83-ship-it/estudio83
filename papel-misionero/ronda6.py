"""Ronda 6: variables con anillos (anillos de crecimiento, bobina y espiral),
en el lenguaje de las rondas 4 y 5: monolínea W = 7, terminaciones redondeadas, trazo afinado.
Uso:  python3 ronda6.py   →  svg/R6-<n>.svg y svg/R6-<n>-logo.svg
"""
import math

from generar import VERDE, guardar, svg
from pinos import icono
from ronda4 import W, pino_ramas
from ronda5 import araucaria

LINEA = f'fill="none" stroke-width="{W}" stroke-linecap="round" stroke-linejoin="round"'


def poli(pts, cerrar=False):
    return "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in pts) + (" Z" if cerrar else "")


def anillo(cx, cy, r, onda=0.0, fase=0.0, n=160):
    """Anillo de crecimiento: círculo con una ondulación suave, como en un corte real."""
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n
        rr = r * (1 + onda * math.sin(3 * a + fase) + onda * .6 * math.sin(5 * a + fase * 1.7))
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    return poli(pts, True)


def espiral(cx, cy, r0, r1, vueltas, fin=math.pi, n=400):
    """Espiral que termina en el extremo izquierdo, bajando (de ahí sale el asta)."""
    tend = fin + 2 * math.pi * vueltas
    b = (r1 - r0) / tend
    return [(cx + (r0 + b * t) * math.cos(-t), cy + (r0 + b * t) * math.sin(-t)) for t in (tend * i / n for i in range(n + 1))]


# 1 · P espiral: el pliego se enrolla en bobina y baja como asta
def m1():
    pts = espiral(66, 46, 4, 36, 2)
    return f'<path d="{poli(pts)} L{pts[-1][0]:.2f} 112" {LINEA}/>', ""


# 2 · Corte del tronco: anillos de crecimiento ondulados y descentrados
def m2():
    t = "".join(f'<path d="{anillo(60 - k * 1.6, 60 + k * 1.4, r, .007 + k * .002, k)}" {LINEA}/>'
                for k, r in enumerate((52, 39, 27, 15)))
    return t + '<circle cx="54" cy="65" r="5"/>', ""


# 3 · Árbol de anillos: la copa son anillos abiertos, el tronco nace del centro
def m3():
    t = ""
    for r in (48, 36, 24, 12):
        t += f'<path d="M{60 - r} 64 A{r} {r} 0 0 1 {60 + r} 64" {LINEA}/>'
    return t + f'<path d="M60 64 V112" {LINEA}/>', ""


# 4 · P de anillos: el ojo de la P es un corte de tronco
def m4():
    p = f'<path d="M22 112 V12 H62 C90 12 106 30 106 50 C106 72 90 88 62 88 H40" {LINEA}/>'
    anillos = "".join(f'<path d="{anillo(64, 50, r, .02, k)}" {LINEA}/>' for k, r in enumerate((24, 12)))
    return p + anillos + '<circle cx="64" cy="50" r="4"/>', ""


# 5 · Sello: disco con anillos calados y pino en el corazón
def m5():
    cortes = "".join(f'<path d="{anillo(60, 60, r, .015, k)}" fill="none" stroke-width="5"/>' for k, r in enumerate((46, 37)))
    cortes += '<circle cx="60" cy="60" r="28"/>'
    tinta_pino = pino_ramas(60, 36, 86, 34, pisos=4, w0=5.5, w1=2.4, tronco=5.5)
    return '<circle cx="60" cy="60" r="55"/>', cortes + tinta_pino.replace("<path", '<path fill="#fff"')


# 6 · Del papel al árbol: la bobina se desenrolla y sube como tronco de un pino
def m6():
    pts = espiral(40, 86, 3, 22, 1, fin=0)  # termina a la derecha
    x, y = pts[-1]
    tronco = f'<path d="{poli(pts)} L{x:.2f} 40" {LINEA}/>'
    return tronco + pino_ramas(x, 8, 76, 46, pisos=4, w0=W, w1=3, tronco=0.1), ""


# 7 · Araucaria y anillos: sello con anillos y araucaria calada
def m7():
    cortes = "".join(f'<path d="{anillo(60, 60, r, .015, k)}" fill="none" stroke-width="5"/>' for k, r in enumerate((46, 37)))
    cortes += '<circle cx="60" cy="60" r="28"/>'
    a = araucaria(60, 44, 88, 34, w0=5, w1=2.2, tronco=5)
    return '<circle cx="60" cy="60" r="55"/>', cortes + a.replace("<path", '<path fill="#fff"')


MARCAS = {1: ("P espiral", m1), 2: ("Corte del tronco", m2), 4: ("P de anillos", m4),
          5: ("Sello: anillos y pino", m5), 6: ("Del papel al árbol", m6), 7: ("Sello: anillos y araucaria", m7)}


def logotipo(n, color=VERDE):
    from helvetica import NIVELES, lineas
    t, c = MARCAS[n][1]()
    d, w, _ = lineas(NIVELES[1][1], x=168)
    iso = f'<g transform="translate(4 20) scale(1.3)">{icono(f"n{n}", t, c, color)}</g>'
    return svg(168 + w + 24, 196, iso + f'<path d="{d}" fill="{color}" transform="translate(0 6)"/>')


if __name__ == "__main__":
    for n, (nombre, f) in MARCAS.items():
        t, c = f()
        guardar(f"R6-{n}.svg", svg(120, 120, icono(f"r6{n}", t, c, VERDE)))
        guardar(f"R6-{n}-logo.svg", logotipo(n))
        print(n, nombre)
