"""Opciones tipográficas para Araucaria y Anillos.

Uso:  python3 tipos.py
Salida: svg/T-<opción>-araucaria.svg y svg/T-<opción>-anillos.svg
"""
from fontTools.ttLib import TTFont

from generar import AQUI, SALIDA, TIERRA, VERDE, araucaria_copa, bobina_fibra, guardar, svg, texto

# (clave, nombre, archivo, interletra en Araucaria, interletra en Anillos[, caja])
# G y H usan FreeSans Bold como sustituto de Helvetica Bold (mismo diseño, licencia libre);
# para producción se reemplaza por la Helvetica Bold licenciada.
OPCIONES = [
    ("A", "Instrument Sans", "InstrumentSans-600", 0.20, -0.015),
    ("B", "Archivo Expandida", "Archivo-Expandida-600", 0.10, -0.02),
    ("C", "Bricolage Grotesque", "Bricolage-600", 0.16, -0.02),
    ("D", "Fraunces", "Fraunces-500", 0.12, -0.01),
    ("E", "Young Serif", "YoungSerif-400", 0.10, -0.01),
    ("F", "Big Shoulders Stencil", "BigShouldersStencil-700", 0.14, 0.02),
    ("G", "Helvetica Bold", "FreeSansBold", 0.12, -0.03),
    ("H", "Helvetica Bold minúsculas", "FreeSansBold", -0.03, -0.03, "minusculas"),
]
ALTO_CAJA = 44  # altura de mayúscula objetivo, igual para todas las opciones


def tamano(font):
    """Cuerpo para que la altura de mayúscula sea la misma en todas las fuentes."""
    return ALTO_CAJA * font["head"].unitsPerEm / font["OS/2"].sCapHeight


def logo_araucaria(font, interletra, caja=None):
    t = tamano(font)
    tr = t * interletra
    p1, p2 = ("papel", "misionero") if caja == "minusculas" else ("PAPEL", "MISIONERO")
    l1, w1, _ = texto(font, p1, t, 150, 86, tr)
    l2, w2, _ = texto(font, p2, t, 150, 146, tr)
    return svg(150 + max(w1, w2) + 24, 180, araucaria_copa(VERDE, 20, 12) + f'<path d="{l1} {l2}" fill="{VERDE}"/>')


def logo_anillos(font, interletra, caja=None):
    t = tamano(font) * 1.12
    tr = t * interletra
    p1, p2 = ("papel", "misionero") if caja == "minusculas" else ("Papel", "Misionero")
    l1, w1, _ = texto(font, p1, t, 150, 84, tr)
    l2, w2, _ = texto(font, p2, t, 150, 152, tr)
    return svg(150 + max(w1, w2) + 24, 186, bobina_fibra(TIERRA, 18, 8) + f'<path d="{l1} {l2}" fill="{VERDE}"/>')


if __name__ == "__main__":
    for clave, nombre, archivo, i_ara, i_ani, *caja in OPCIONES:
        caja = caja[0] if caja else None
        ext = ".ttf" if (AQUI / f"fuentes/{archivo}.ttf").exists() else ".woff"
        font = TTFont(AQUI / f"fuentes/{archivo}{ext}")
        if "OS/2" not in font or not getattr(font["OS/2"], "sCapHeight", 0):
            raise SystemExit(f"{archivo}: sin altura de mayúscula")
        guardar(f"T-{clave}-araucaria.svg", logo_araucaria(font, i_ara, caja))
        guardar(f"T-{clave}-anillos.svg", logo_anillos(font, i_ani, caja))
        print(clave, nombre)
