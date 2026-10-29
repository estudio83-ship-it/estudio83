"""Ronda 7: variantes de «Del papel al árbol» — la bobina se desenrolla en espiral
(la «cola») y sube como tronco del árbol. Se mantiene siempre la cola.
Uso:  python3 ronda7.py   →  svg/R7-<n>.svg y svg/R7-<n>-logo.svg
"""
from generar import VERDE, guardar, svg
from pinos import icono
from ronda4 import W, pino_ramas
from ronda5 import araucaria
from ronda6 import espiral, poli


def cola_arbol(copa="pino", tx=None, r=22, vueltas=1, alto_tronco=40, ancho=46, pisos=4, w=W, top=8, base=112, cola=True):
    """Tronco vertical en x=tx que termina abajo en una espiral (la cola) y arriba en la copa."""
    if tx is None:  # centra ópticamente el conjunto cola + copa en la caja
        tx = 60 + r - ancho / 4 if cola else 60
    cy = base - r - w / 2
    pts = espiral(tx - r, cy, 3, r, vueltas, fin=0)
    dx = tx - pts[-1][0]
    pts = [(x + dx, y) for x, y in pts]
    y_copa = top + (base - top) * 0.62
    linea = f'fill="none" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"'
    trazo = poli(pts) if cola else f"M{tx} {base - w / 2}"
    t = f'<path d="{trazo} L{tx:.2f} {top + 6:.2f}" {linea}/>'
    if copa == "pino":
        t += pino_ramas(tx, top, y_copa + 6, ancho, pisos=pisos, w0=w, w1=3, tronco=0.1)
    else:
        copa_a = araucaria(tx, top + 10, y_copa + 40, ancho, pisos=pisos, w0=w + 1, w1=2.6)
        t += copa_a[:copa_a.rfind("<path")]  # sin su tronco propio: el tronco es la cola
    return t


VARIANTES = {
    1: ("Original refinada", dict()),
    2: ("Cola más amplia", dict(r=26, vueltas=1, ancho=44)),
    3: ("Cola de dos vueltas (bobina)", dict(r=26, vueltas=2, ancho=44)),
    4: ("Pino más pleno", dict(pisos=5, ancho=58)),
    5: ("Trazo pesado", dict(w=10, pisos=4, ancho=52)),
    6: ("Con araucaria", dict(copa="araucaria", ancho=56, pisos=4)),
}

# Sin cola: el tronco baja recto
SIN_COLA = {
    1: ("Pino", dict(cola=False, ancho=50)),
    2: ("Pino pleno", dict(cola=False, pisos=5, ancho=62)),
    3: ("Trazo pesado", dict(cola=False, w=10, ancho=56)),
    4: ("Araucaria", dict(cola=False, copa="araucaria", ancho=60)),
}


def logotipo(n, color=VERDE, tabla=None):
    from helvetica import NIVELES, lineas
    d, w, _ = lineas(NIVELES[1][1], x=168)
    tabla = tabla or VARIANTES
    iso = f'<g transform="translate(4 20) scale(1.3)">{icono(f"c{n}", cola_arbol(**tabla[n][1]), "", color)}</g>'
    return svg(168 + w + 24, 196, iso + f'<path d="{d}" fill="{color}" transform="translate(0 6)"/>')


if __name__ == "__main__":
    for n, (nombre, kw) in VARIANTES.items():
        guardar(f"R7-{n}.svg", svg(120, 120, icono(f"r7{n}", cola_arbol(**kw), "", VERDE)))
        guardar(f"R7-{n}-logo.svg", logotipo(n))
        print(n, nombre)
    for n, (nombre, kw) in SIN_COLA.items():
        guardar(f"R8-{n}.svg", svg(120, 120, icono(f"r8{n}", cola_arbol(**kw), "", VERDE)))
        guardar(f"R8-{n}-logo.svg", logotipo(n, tabla=SIN_COLA))
