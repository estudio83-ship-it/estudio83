"""Alternativas de isotipo para Papel Misionero (caja 120x120 cada una).

Uso:  python3 isos.py   →  svg/I-<letra>.svg
"""
from fontTools.ttLib import TTFont

from generar import AQUI, CRUDO, KRAFT, KRAFT_OSC, TIERRA, VERDE, araucaria_copa, guardar, svg, texto


def media_capa(x0, y, w, sag, th, c):
    """Media capa de follaje que nace del tronco (x0) y se abre hacia la derecha."""
    return (f'<path d="M{x0} {y + sag} Q{x0 + w * .55} {y + sag} {x0 + w} {y} '
            f'Q{x0 + w * .6} {y + sag + th * 1.6} {x0} {y + sag + th} Z" fill="{c}"/>')


ISOS = {
    "A": ("Araucaria en bobina",
          f'<circle cx="60" cy="60" r="56" fill="{VERDE}"/>' + araucaria_copa(CRUDO, 60 - 33, 14, 0.55)),
    "B": ("Pliegos apilados",
          "".join(f'<rect x="{60 - w / 2}" y="{y}" width="{w}" height="11" rx="2" fill="{VERDE}"/>'
                  for y, w in ((10, 108), (27, 86), (44, 64), (61, 42)))
          + f'<rect x="56" y="10" width="8" height="104" rx="2" fill="{VERDE}"/>'
          + f'<path d="M98 10 h12 v11 z" fill="{KRAFT}"/>'),
    "C": ("M plegada",
          f'<path d="M12 110 V14 L30 14 L60 52 L60 76 Z" fill="{KRAFT}"/>'
          f'<path d="M30 14 L60 52 L60 76 L12 14 Z" fill="{KRAFT_OSC}"/>'
          f'<path d="M108 110 V14 L90 14 L60 52 L60 76 Z" fill="{TIERRA}"/>'
          f'<path d="M90 14 L60 52 L60 76 L108 14 Z" fill="#8A3520"/>'),
    "D": ("Corte del tronco",
          f'<circle cx="60" cy="60" r="54" fill="none" stroke="{KRAFT}" stroke-width="8"/>'
          + "".join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke="{VERDE}" stroke-width="5"/>'
                    for cx, cy, r in ((59, 61, 40), (57, 63, 28), (55, 65, 16)))
          + f'<circle cx="54" cy="66" r="5" fill="{VERDE}"/>'
          + f'<path d="M66 54 L100 22" stroke="{CRUDO}" stroke-width="5" stroke-linecap="round"/>'),
    "E": ("Monograma pm", None),
    "F": ("Paisaje misionero",
          '<clipPath id="cf"><circle cx="60" cy="60" r="56"/></clipPath><g clip-path="url(#cf)">'
          f'<rect width="120" height="74" fill="{VERDE}"/><rect y="74" width="120" height="46" fill="{TIERRA}"/>'
          + araucaria_copa(CRUDO, 18, 26, 0.32) + araucaria_copa(CRUDO, 46, 12, 0.42) + araucaria_copa(CRUDO, 78, 30, 0.3)
          + "".join(f'<rect x="0" y="{y}" width="120" height="3" fill="{CRUDO}" opacity=".35"/>' for y in (84, 94, 104))
          + '</g>'),
    "G": ("Araucaria de fibras",
          f'<g fill="none" stroke="{VERDE}" stroke-width="3.4" stroke-linecap="round">'
          + "".join(f'<path d="M{60 - w / 2} {y + o} Q60 {y + 16 + o} {60 + w / 2} {y + o}"/>'
                    for y, w in ((10, 112), (30, 88), (48, 62), (64, 36)) for o in (0, 6))
          + "".join(f'<path d="M{x} 116 V{20}"/>' for x in (55, 60, 65)) + '</g>'),
}


def monograma():
    f = TTFont(AQUI / "fuentes/FreeSansBold.ttf")
    t = 76
    d, w, _ = texto(f, "pm", t, 0, 0, -4)
    x = 60 - w / 2
    d, _, _ = texto(f, "pm", t, x, 76, -4)
    return f'<path d="{d}" fill="{VERDE}"/><circle cx="{x + t * .3:.1f}" cy="{76 - t * .27:.1f}" r="5.5" fill="{TIERRA}"/>'


if __name__ == "__main__":
    for k, (nombre, cuerpo) in ISOS.items():
        guardar(f"I-{k}.svg", svg(120, 120, cuerpo if cuerpo else monograma()))
        print(k, nombre)
