"""Genera el troquel del soporte plegable para portátil (prototipo en cartón).

Patrón tomado de la pieza plana del FIKLIK 2-in-1 Origami Laptop Stand:
una base lisa y una plancha plegable unidas por una bisagra en el borde largo.
La plancha tiene una tira central desde el borde libre hasta la mitad, y desde
cada esquina interior de la tira salen dos diagonales a las esquinas de su lado.

Salidas (mm, escala 1:1):
  troquel.svg   producción: capas CORTE (rojo) y HENDIDO (amarillo)
  troquel.dxf   lo mismo en DXF R12
  plano.svg     lámina A3 con cotas

Cambiar los parámetros y ejecutar:  python3 generar.py
"""
import math
from pathlib import Path

# ---------------------------------------------------------------- parámetros
W = 200.0      # ancho (modo vertical del original: 200 mm)
H = 136.0      # alto de la plancha plegable y de la base
YV = 68.0      # de la bisagra a las esquinas interiores de la tira (alto de pared ~70 mm)
TIRA = 34.0    # ancho de la tira central
BIS = 3.0      # separación entre los dos hendidos de la bisagra (espesor de las dos capas)
R = 4.0        # radio de las esquinas

OUT = Path(__file__).parent
CORTE = "#FF0000"
HENDIDO = "#FFFF00"          # amarillo puro para la máquina
HENDIDO_VISTA = "#E8B400"    # amarillo legible sobre blanco para la lámina

ALTO = 2 * H + BIS           # largo total de la pieza
Y0 = H + BIS                 # borde de la plancha plegable pegado a la bisagra
XL, XR = W / 2 - TIRA / 2, W / 2 + TIRA / 2
VL, VR = (XL, Y0 + YV), (XR, Y0 + YV)


def recorte_esquina(p, esquina):
    """Acorta el segmento p→esquina para que termine en el arco redondeado."""
    cx = R if esquina[0] == 0 else W - R
    cy = R if esquina[1] == 0 else ALTO - R
    dx, dy = esquina[0] - p[0], esquina[1] - p[1]
    fx, fy = p[0] - cx, p[1] - cy
    a = dx * dx + dy * dy
    b = 2 * (fx * dx + fy * dy)
    c = fx * fx + fy * fy - R * R
    t = (-b + math.sqrt(b * b - 4 * a * c)) / (2 * a)   # salida del círculo, del lado de la esquina
    return (p[0] + t * dx, p[1] + t * dy)


def geometria():
    cut = (f"M {R} 0 H {W-R} A {R} {R} 0 0 1 {W} {R} V {ALTO-R} "
           f"A {R} {R} 0 0 1 {W-R} {ALTO} H {R} A {R} {R} 0 0 1 0 {ALTO-R} "
           f"V {R} A {R} {R} 0 0 1 {R} 0 Z")
    hend = [
        # bisagra entre base y plancha
        ((0, H), (W, H)), ((0, Y0), (W, Y0)),
        # diagonales hacia las esquinas del lado de la bisagra
        (VL, (0, Y0)), (VR, (W, Y0)),
        # diagonales hacia las esquinas del borde libre
        (VL, recorte_esquina(VL, (0, ALTO))), (VR, recorte_esquina(VR, (W, ALTO))),
        # tira central
        (VL, VR), (VL, (XL, ALTO)), (VR, (XR, ALTO)),
    ]
    return cut, hend


def seg_svg(segs, **attrs):
    a = " ".join(f'{k.rstrip("_").replace("_", "-")}="{v}"' for k, v in attrs.items())
    return "\n".join(
        f'    <line x1="{p[0]:.3f}" y1="{p[1]:.3f}" x2="{q[0]:.3f}" y2="{q[1]:.3f}" {a}/>'
        for p, q in segs)


def troquel_svg(cut, hend):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     width="{W}mm" height="{ALTO}mm" viewBox="0 0 {W} {ALTO}">
  <g id="CORTE" inkscape:groupmode="layer" inkscape:label="CORTE">
    <path d="{cut}" fill="none" stroke="{CORTE}" stroke-width="0.25"/>
  </g>
  <g id="HENDIDO" inkscape:groupmode="layer" inkscape:label="HENDIDO">
{seg_svg(hend, fill="none", stroke=HENDIDO, stroke_width=0.25)}
  </g>
</svg>
'''


def troquel_kongsberg_svg(cut, hend):
    """Solo geometría para la mesa de corte: corte rojo y hendido amarillo, trazos continuos."""
    lineas = "\n".join(f'    <path d="M {p[0]:.3f} {p[1]:.3f} L {q[0]:.3f} {q[1]:.3f}"/>' for p, q in hend)
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{W}mm" height="{ALTO}mm" viewBox="0 0 {W} {ALTO}">
  <g id="CORTE" fill="none" stroke="{CORTE}" stroke-width="0.1">
    <path d="{cut}"/>
  </g>
  <g id="HENDIDO" fill="none" stroke="{HENDIDO}" stroke-width="0.1">
{lineas}
  </g>
</svg>
'''


def troquel_dxf(hend):
    """DXF R12 mínimo. El DXF usa Y hacia arriba, así que se invierte el eje."""
    out = ["0", "SECTION", "2", "HEADER",
           "9", "$ACADVER", "1", "AC1009",
           "9", "$INSUNITS", "70", "4",       # milímetros
           "9", "$MEASUREMENT", "70", "1",    # métrico
           "0", "ENDSEC",
           "0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LAYER", "70", "2"]
    for name, color in (("CORTE", 1), ("HENDIDO", 2)):
        out += ["0", "LAYER", "2", name, "70", "0", "62", str(color), "6", "CONTINUOUS"]
    out += ["0", "ENDTAB", "0", "ENDSEC", "0", "SECTION", "2", "ENTITIES"]

    def line(layer, p, q):
        out.extend(["0", "LINE", "8", layer, "62", "1" if layer == "CORTE" else "2",
                    "10", f"{p[0]:.4f}", "20", f"{ALTO-p[1]:.4f}", "30", "0",
                    "11", f"{q[0]:.4f}", "21", f"{ALTO-q[1]:.4f}", "31", "0"])

    def arc(cx, cy, a0, a1):
        out.extend(["0", "ARC", "8", "CORTE", "62", "1", "10", f"{cx:.4f}", "20", f"{ALTO-cy:.4f}",
                    "30", "0", "40", f"{R:.4f}", "50", f"{a0}", "51", f"{a1}"])

    line("CORTE", (R, 0), (W - R, 0))
    line("CORTE", (W, R), (W, ALTO - R))
    line("CORTE", (W - R, ALTO), (R, ALTO))
    line("CORTE", (0, ALTO - R), (0, R))
    arc(R, R, 90, 180)
    arc(W - R, R, 0, 90)
    arc(W - R, ALTO - R, 270, 360)
    arc(R, ALTO - R, 180, 270)
    for p, q in hend:
        line("HENDIDO", p, q)
    out += ["0", "ENDSEC", "0", "EOF"]
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------- lámina
def cota_h(x1, x2, y, texto, abajo=False):
    ty = y + 4.5 if abajo else y - 1.5
    return (f'<g class="cota"><line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" marker-start="url(#f)" '
            f'marker-end="url(#f)"/><text x="{(x1+x2)/2}" y="{ty}" text-anchor="middle">{texto}</text></g>')


def cota_v(y1, y2, x, texto):
    ym = (y1 + y2) / 2
    return (f'<g class="cota"><line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" marker-start="url(#f)" '
            f'marker-end="url(#f)"/><text x="{x-1.5}" y="{ym}" text-anchor="middle" '
            f'transform="rotate(-90 {x-1.5} {ym})">{texto}</text></g>')


def plano_svg(cut, hend):
    PW, PH = 297.0, 420.0          # A3 vertical
    ox, oy = 48.5, 70.0            # origen de la pieza en la lámina
    cotas = [
        cota_h(0, W, -6, f"{W:.0f}"),
        cota_v(0, ALTO, -8, f"{ALTO:.0f}"),
        cota_v(0, H, W + 8, f"{H:.0f}"),
        cota_v(H, Y0, W + 16, f"{BIS:.0f}"),
        cota_v(Y0, VL[1], W + 8, f"{YV:.0f}"),
        cota_v(VL[1], ALTO, W + 8, f"{H-YV:.0f}"),
        cota_h(XL, XR, ALTO + 6, f"{TIRA:.0f}", abajo=True),
        cota_h(0, XL, ALTO + 6, f"{XL:.0f}", abajo=True),
    ]
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="{PW}mm" height="{PH}mm" viewBox="0 0 {PW} {PH}">
  <defs>
    <marker id="f" viewBox="0 0 6 6" refX="3" refY="3" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
      <path d="M0 0 L6 3 L0 6 z" fill="#555"/>
    </marker>
    <style>
      text {{ font-family: Helvetica, Arial, sans-serif; fill: #222; }}
      .cota line {{ stroke: #777; stroke-width: 0.2; }}
      .cota text {{ font-size: 3.2px; fill: #555; }}
      .c {{ fill: none; stroke: {CORTE}; stroke-width: 0.5; }}
      .h {{ stroke: {HENDIDO_VISTA}; stroke-width: 0.6; stroke-dasharray: 3 1.5; }}
      .h1 {{ font-size: 7px; font-weight: bold; }}
      .t {{ font-size: 3.4px; }}
      .s {{ font-size: 2.8px; fill: #666; }}
    </style>
  </defs>
  <rect width="{PW}" height="{PH}" fill="#fff"/>
  <rect x="5" y="5" width="{PW-10}" height="{PH-10}" fill="none" stroke="#222" stroke-width="0.4"/>

  <g transform="translate({ox} {oy})">
    <path class="c" d="{cut}"/>
{seg_svg(hend, class_="h")}
    {"".join(cotas)}
    <text x="{W/2}" y="{H/2}" text-anchor="middle" class="s">base</text>
    <text x="{W/2}" y="{Y0+YV*0.45}" text-anchor="middle" class="s">plancha plegable</text>
    <text x="{W/2}" y="{H+BIS/2+1}" text-anchor="middle" class="s">bisagra</text>
  </g>

  <g transform="translate(20 30)">
    <text class="h1" x="0" y="0">Troquel — soporte plegable</text>
    <text class="t" x="0" y="8">Escala 1:1 · medidas en mm · imprimir al 100 % en A3 vertical</text>
    <line x1="180" y1="-2" x2="198" y2="-2" class="c"/>
    <text class="t" x="202" y="-0.8">Corte</text>
    <line x1="180" y1="6" x2="198" y2="6" class="h"/>
    <text class="t" x="202" y="7.2">Hendido</text>
  </g>
</svg>
'''


def main():
    cut, hend = geometria()
    (OUT / "troquel.svg").write_text(troquel_svg(cut, hend))
    (OUT / "troquel-kongsberg-xl.svg").write_text(troquel_kongsberg_svg(cut, hend))
    (OUT / "troquel.dxf").write_text(troquel_dxf(hend))
    (OUT / "troquel-kongsberg-xl.dxf").write_text(troquel_dxf(hend))
    (OUT / "plano.svg").write_text(plano_svg(cut, hend))
    print("Generados: troquel.svg, troquel-kongsberg-xl.svg, troquel.dxf, troquel-kongsberg-xl.dxf, plano.svg")


if __name__ == "__main__":
    main()
