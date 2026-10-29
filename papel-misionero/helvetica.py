"""Exploración con Helvetica para Araucaria y Anillos.

Usa FreeSans (sustituto libre de Helvetica, mismo diseño). Para producción,
el texto se pasa a curvas con la Helvetica licenciada.
Uso:  python3 helvetica.py   →  svg/H<n>-araucaria.svg y svg/H<n>-anillos.svg
"""
from fontTools.ttLib import TTFont

from generar import AQUI, TIERRA, VERDE, araucaria_copa, bobina_fibra, guardar, svg, texto

BOLD = TTFont(AQUI / "fuentes/FreeSansBold.ttf")
REG = TTFont(AQUI / "fuentes/FreeSans.ttf")
CAP = 44  # altura de mayúscula de referencia
T = CAP * BOLD["head"].unitsPerEm / BOLD["OS/2"].sCapHeight


def lineas(spec, x=150):
    """spec: lista de (texto, fuente, cuerpo relativo, interletra, desplazamiento vertical). Devuelve (paths, ancho, alto)."""
    d, ancho, y = [], 0, 0
    for txt, font, rel, tr, dy in spec:
        y += dy
        p, w, _ = texto(font, txt, T * rel, x, y, T * rel * tr)
        d.append(p)
        ancho = max(ancho, w)
    return " ".join(d), ancho, y


# Cada opción: (nombre, líneas). dy acumula desde arriba; el símbolo ocupa ~150 px de alto.
OPCIONES = [
    ("Mayúsculas espaciadas", [("PAPEL", BOLD, 1, .12, 86), ("MISIONERO", BOLD, 1, .12, 60)]),
    ("Minúsculas apretadas", [("papel", BOLD, 1.1, -.03, 84), ("misionero", BOLD, 1.1, -.03, 62)]),
    ("Altas y bajas", [("Papel", BOLD, 1.1, -.03, 84), ("Misionero", BOLD, 1.1, -.03, 62)]),
    ("Una línea", [("papel misionero", BOLD, 1.05, -.03, 116)]),
    ("Regular + Bold", [("papel", REG, 1.1, -.02, 84), ("misionero", BOLD, 1.1, -.03, 62)]),
    ("Jerarquía", [("PAPEL", BOLD, .5, .42, 62), ("misionero", BOLD, 1.25, -.035, 76)]),
]

# Variantes con distintos niveles de jerarquía (la opción 6 y la 5, desarrolladas).
NIVELES = [
    ("PAPEL bold chico / misionero", [("PAPEL", BOLD, .5, .42, 62), ("misionero", BOLD, 1.25, -.035, 76)]),
    ("PAPEL regular chico / misionero", [("PAPEL", REG, .5, .42, 62), ("misionero", BOLD, 1.25, -.035, 76)]),
    ("misionero / PAPEL debajo", [("misionero", BOLD, 1.25, -.035, 92), ("PAPEL", REG, .5, .42, 40)]),
    ("PAPEL chico / Misionero", [("PAPEL", BOLD, .5, .42, 62), ("Misionero", BOLD, 1.2, -.035, 76)]),
    ("papel regular / misionero bold", [("papel", REG, 1.1, -.02, 80), ("misionero", BOLD, 1.1, -.03, 58)]),
    ("Tres niveles", [("PAPEL", BOLD, .5, .42, 54), ("misionero", BOLD, 1.25, -.035, 74), ("MISIONES · ARGENTINA", REG, .34, .3, 36)]),
]


def logo(simbolo, spec):
    d, w, y = lineas(spec)
    return svg(150 + w + 24, max(182, y + 24), simbolo + f'<path d="{d}" fill="{VERDE}"/>')


if __name__ == "__main__":
    for n, (nombre, spec) in enumerate(OPCIONES, 1):
        guardar(f"H{n}-araucaria.svg", logo(araucaria_copa(VERDE, 20, 12), spec))
        guardar(f"H{n}-anillos.svg", logo(bobina_fibra(TIERRA, 18, 8), spec))
        print(n, nombre)
    for n, (nombre, spec) in enumerate(NIVELES, 1):
        guardar(f"N{n}-araucaria.svg", logo(araucaria_copa(VERDE, 20, 12), spec))
        guardar(f"N{n}-anillos.svg", logo(bobina_fibra(TIERRA, 18, 8), spec))
