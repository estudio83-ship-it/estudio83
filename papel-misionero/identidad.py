"""Identidad comparada: cada marca finalista aplicada en negativo, sobre kraft y en piezas.

Uso:  python3 identidad.py   →  svg/ID-<clave>-{color,negativo,kraft,iso-claro}.svg
"""
from generar import CRUDO, KRAFT, VERDE, guardar, svg
from helvetica import NIVELES, lineas
from pinos import icono
import ronda5
import ronda6
import ronda7

# (clave, familia, nombre, función que devuelve (tinta, calados))
MARCAS = (
    [(f"A{i}", "Araucaria", nm, f) for i, (nm, f) in enumerate(ronda5.MARCAS.values(), 1)]
    + [(f"N{i}", "Anillos", nm, f) for i, (nm, f) in enumerate((v for k, v in ronda6.MARCAS.items() if k != 6), 1)]
    + [(f"P{i}", "Pino", nm, (lambda kw=kw: (ronda7.cola_arbol(**kw), ""))) for i, (nm, kw) in enumerate(ronda7.SIN_COLA.values(), 1)]
)


def lockup(clave, f, simbolo, letras):
    t, c = f()
    d, w, _ = lineas(NIVELES[1][1], x=168)
    iso = f'<g transform="translate(4 20) scale(1.3)">{icono(f"i{clave}{simbolo[1:]}", t, c, simbolo)}</g>'
    return svg(168 + w + 24, 196, iso + f'<path d="{d}" fill="{letras}" transform="translate(0 6)"/>')


if __name__ == "__main__":
    for clave, fam, nombre, f in MARCAS:
        guardar(f"ID-{clave}-color.svg", lockup(clave, f, VERDE, VERDE))
        guardar(f"ID-{clave}-negativo.svg", lockup(clave, f, KRAFT, CRUDO))
        t, c = f()
        guardar(f"ID-{clave}-iso-claro.svg", svg(120, 120, icono(f"c{clave}", t, c, KRAFT)))
        guardar(f"ID-{clave}-iso.svg", svg(120, 120, icono(f"v{clave}", t, c, VERDE)))
        print(clave, fam, nombre)
