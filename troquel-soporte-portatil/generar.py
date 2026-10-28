"""Genera el troquel del soporte plegable para portátil (prototipo en cartón).

Salidas (todas en mm, escala 1:1):
  troquel.svg   archivo de producción: solo líneas, capas CORTE / HENDIDO
  troquel.dxf   el mismo dibujo en DXF R12 (capas CORTE, HENDIDO_MONTANA, HENDIDO_VALLE)
  plano.svg     lámina de presentación con cotas, leyenda y perfiles de plegado

Cambiar los parámetros de abajo y volver a ejecutar:  python3 generar.py
"""
import math
from pathlib import Path

# ---------------------------------------------------------------- parámetros
W = 250.0      # ancho de la plancha (a lo largo del portátil)
H = 180.0      # alto de la plancha
R = 4.0        # radio de las esquinas
E = 70.0       # avance de las diagonales del "waterbomb" hacia el centro
T = 18.0       # ancho de la ranura del modo vertical (grosor portátil + holgura)
P = 35.0       # profundidad de la ranura (alto de las paredes)

A = H / 2      # eje central (cumbrera del modo atril)
OUT = Path(__file__).parent

CORTE = "#FF0000"
HENDIDO = "#FFFF00"          # amarillo puro para la máquina
HENDIDO_VISTA = "#E8B400"    # amarillo legible sobre blanco para la lámina


def x_diag(y):
    """x de la diagonal izquierda a la altura y (simétrica respecto a A)."""
    k = abs(A - y)
    return E * (1 - k / A)


def corner_hit(cx, cy, ux, uy):
    """Punto donde la diagonal que sale de la esquina corta el arco redondeado."""
    # diagonal: p = s*u desde la esquina (0,0) local; arco centrado en (R,R)
    b = -2 * R * (ux + uy)
    c = R * R
    s = (-b - math.sqrt(b * b - 4 * c)) / 2
    return cx + s * ux, cy + s * uy


def geometria():
    """Devuelve (cortes, montañas, valles). Cortes como path SVG, pliegues como segmentos."""
    cut = (f"M {R} 0 H {W-R} A {R} {R} 0 0 1 {W} {R} V {H-R} "
           f"A {R} {R} 0 0 1 {W-R} {H} H {R} A {R} {R} 0 0 1 0 {H-R} "
           f"V {R} A {R} {R} 0 0 1 {R} 0 Z")

    L = math.hypot(E, A)
    ux, uy = E / L, A / L
    montana, valle = [], []

    # diagonales del waterbomb (montaña): de cada esquina al vértice (E, A)
    for sx, sy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
        x0 = 0 if sx == 1 else W
        y0 = 0 if sy == 1 else H
        px, py = corner_hit(0, 0, ux, uy)
        p = (x0 + sx * px, y0 + sy * py)
        v = (E if sx == 1 else W - E, A)
        montana.append((p, v))

    # cumbrera central (montaña) y tramos extremos (valle)
    montana.append(((E, A), (W - E, A)))
    valle.append(((0, A), (E, A)))
    valle.append(((W - E, A), (W, A)))

    # ranura del modo vertical: labios (montaña) y fondo (valle), a todo el ancho
    # (en modo vertical las diagonales quedan planas y la pieza es un perfil extruido)
    for d in (-1, 1):
        y = A + d * (T / 2 + P)
        montana.append(((0, y), (W, y)))
        y = A + d * T / 2
        valle.append(((0, y), (W, y)))

    return cut, montana, valle


def seg_svg(segs, **attrs):
    a = " ".join(f'{k.rstrip("_").replace("_", "-")}="{v}"' for k, v in attrs.items())
    return "\n".join(
        f'    <line x1="{p[0]:.3f}" y1="{p[1]:.3f}" x2="{q[0]:.3f}" y2="{q[1]:.3f}" {a}/>'
        for p, q in segs)


def troquel_svg(cut, montana, valle):
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape"
     width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}">
  <g id="CORTE" inkscape:groupmode="layer" inkscape:label="CORTE">
    <path d="{cut}" fill="none" stroke="{CORTE}" stroke-width="0.25"/>
  </g>
  <g id="HENDIDO" inkscape:groupmode="layer" inkscape:label="HENDIDO">
   <g id="HENDIDO_MONTANA" inkscape:label="HENDIDO_MONTANA">
{seg_svg(montana, fill="none", stroke=HENDIDO, stroke_width=0.25)}
   </g>
   <g id="HENDIDO_VALLE" inkscape:label="HENDIDO_VALLE">
{seg_svg(valle, fill="none", stroke=HENDIDO, stroke_width=0.25)}
   </g>
  </g>
</svg>
'''


def troquel_dxf(montana, valle):
    """DXF R12 mínimo. El DXF usa Y hacia arriba, así que se invierte el eje."""
    out = ["0", "SECTION", "2", "TABLES", "0", "TABLE", "2", "LAYER", "70", "3"]
    for name, color in (("CORTE", 1), ("HENDIDO_MONTANA", 2), ("HENDIDO_VALLE", 2)):
        out += ["0", "LAYER", "2", name, "70", "0", "62", str(color), "6", "CONTINUOUS"]
    out += ["0", "ENDTAB", "0", "ENDSEC", "0", "SECTION", "2", "ENTITIES"]

    def line(layer, p, q):
        out.extend(["0", "LINE", "8", layer,
                    "10", f"{p[0]:.4f}", "20", f"{H-p[1]:.4f}", "30", "0",
                    "11", f"{q[0]:.4f}", "21", f"{H-q[1]:.4f}", "31", "0"])

    def arc(cx, cy, a0, a1):
        out.extend(["0", "ARC", "8", "CORTE", "10", f"{cx:.4f}", "20", f"{H-cy:.4f}",
                    "30", "0", "40", f"{R:.4f}", "50", f"{a0}", "51", f"{a1}"])

    line("CORTE", (R, 0), (W - R, 0))
    line("CORTE", (W, R), (W, H - R))
    line("CORTE", (W - R, H), (R, H))
    line("CORTE", (0, H - R), (0, R))
    # ángulos en el sistema Y-arriba
    arc(R, R, 90, 180)
    arc(W - R, R, 0, 90)
    arc(W - R, H - R, 270, 360)
    arc(R, H - R, 180, 270)
    for p, q in montana:
        line("HENDIDO_MONTANA", p, q)
    for p, q in valle:
        line("HENDIDO_VALLE", p, q)
    out += ["0", "ENDSEC", "0", "EOF"]
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------- lámina
def cota_h(x1, x2, y, texto, off=0):
    return (f'<g class="cota"><line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" marker-start="url(#f)" '
            f'marker-end="url(#f)"/><text x="{(x1+x2)/2}" y="{y-1.5+off}" text-anchor="middle">{texto}</text></g>')


def cota_v(y1, y2, x, texto):
    ym = (y1 + y2) / 2
    return (f'<g class="cota"><line x1="{x}" y1="{y1}" x2="{x}" y2="{y2}" marker-start="url(#f)" '
            f'marker-end="url(#f)"/><text x="{x-1.5}" y="{ym}" text-anchor="middle" '
            f'transform="rotate(-90 {x-1.5} {ym})">{texto}</text></g>')


HT = 70.0      # alto de la cumbrera en modo atril


def modelo_atril():
    """Caras 3D del modo atril (x a lo largo, y transversal, z arriba).

    Los dos trapecios centrales giran rígidos sobre las patas; cada fuelle
    (dos triángulos entre diagonal y valle) se mete hacia adentro.
    """
    yf = math.sqrt(A * A - HT * HT)
    k = E * E + HT * HT
    q = (2 * HT * HT * E / k, 2 * HT ** 3 / k - HT)   # vértice (0, A) metido adentro
    def esp(pt):  # simetría respecto al centro de la plancha
        return (W - pt[0], pt[1], pt[2])
    c1, c2, r1, qq = (0, -yf, 0), (0, yf, 0), (E, 0, HT), (q[0], 0, q[1])
    def pliegues(lado):  # hendidos de la ranura que quedan planos sobre el faldón
        out = []
        for v in (A - T / 2 - P, A - T / 2):
            t = v / A
            y, z = lado * yf * (1 - t), HT * t
            out.append(((x_diag(v), y, z), (W - x_diag(v), y, z)))
        return out
    caras = [
        ([(0, -yf, 0), (W, -yf, 0), (W - E, 0, HT), (E, 0, HT)], pliegues(-1)),
        ([(0, yf, 0), (W, yf, 0), (W - E, 0, HT), (E, 0, HT)], pliegues(1)),
        [c1, r1, qq], [c2, r1, qq],
        [esp(c1), esp(r1), esp(qq)], [esp(c2), esp(r1), esp(qq)],
    ]
    return caras


def modelo_ranura():
    """Caras 3D del modo vertical: el perfil de la ranura extruido a lo ancho."""
    run = math.sqrt(max((A - T / 2 - P) ** 2 - P ** 2, 0))
    perfil = [(-T/2 - run, 0), (-T/2, P), (-T/2, 0), (T/2, 0), (T/2, P), (T/2 + run, 0)]
    return [[(0, a[0], a[1]), (W, a[0], a[1]), (W, b[0], b[1]), (0, b[0], b[1])]
            for a, b in zip(perfil, perfil[1:])]


def vista_3d(caras, caja_w, caja_h, az=208, el=30, dist=800):
    """Perspectiva en línea fina (hairline) con caras blancas ordenadas por profundidad."""
    a, e = math.radians(az), math.radians(el)
    cx, cy = W / 2, 0
    # base de cámara
    fwd = (math.cos(e) * math.sin(a), math.cos(e) * math.cos(a), math.sin(e))   # hacia la cámara
    right = (-math.cos(a), math.sin(a), 0)
    up = (-math.sin(e) * math.sin(a), -math.sin(e) * math.cos(a), math.cos(e))

    def proy(p):
        d = (p[0] - cx, p[1] - cy, p[2])
        z = dist - sum(d[i] * fwd[i] for i in range(3))
        f = dist / z
        return (f * sum(d[i] * right[i] for i in range(3)),
                -f * sum(d[i] * up[i] for i in range(3)), z)

    poli = []
    for c in caras:
        c, lineas = c if isinstance(c, tuple) else (c, [])
        pts = [proy(p) for p in c]
        lin = [[proy(p)[:2] for p in l] for l in lineas]
        poli.append((sum(p[2] for p in pts) / len(pts), [(p[0], p[1]) for p in pts], lin))
    poli.sort(key=lambda t: -t[0])
    xs = [x for _, ps, _ in poli for x, _ in ps]
    ys = [y for _, ps, _ in poli for _, y in ps]
    esc = min(caja_w / (max(xs) - min(xs)), caja_h / (max(ys) - min(ys)))
    ox = (caja_w - (max(xs) - min(xs)) * esc) / 2 - min(xs) * esc
    oy = (caja_h - (max(ys) - min(ys)) * esc) / 2 - min(ys) * esc
    out = []
    for _, ps, lin in poli:
        d = " ".join(f"{ox + x * esc:.2f},{oy + y * esc:.2f}" for x, y in ps)
        out.append(f'<polygon class="h3d" points="{d}"/>')
        for (x1, y1), (x2, y2) in lin:
            out.append(f'<line class="h3p" x1="{ox + x1 * esc:.2f}" y1="{oy + y1 * esc:.2f}" '
                       f'x2="{ox + x2 * esc:.2f}" y2="{oy + y2 * esc:.2f}"/>')
    return "\n    ".join(out), esc


def plano_svg(cut, montana, valle):
    PW, PH = 420.0, 297.0          # A3 apaisado
    ox, oy = 30.0, 45.0            # origen de la plancha en la lámina
    m = seg_svg(montana, class_="m")
    v = seg_svg(valle, class_="v")
    yl1, yl2 = A - T/2 - P, A + T/2 + P
    yf1, yf2 = A - T/2, A + T/2

    cotas = [
        cota_h(0, W, -8, f"{W:.0f}"),
        cota_v(0, H, -8, f"{H:.0f}"),
        cota_h(0, E, H + 8, f"{E:.0f}", off=6),
        cota_v(yl1, yf1, W + 8, f"{P:.0f}"),
        cota_v(yf1, yf2, W + 8, f"{T:.0f}"),
        cota_v(0, A, W + 18, f"{A:.0f}"),
    ]

    v_atril, _ = vista_3d(modelo_atril(), 100, 48)
    v_ranura, _ = vista_3d(modelo_ranura(), 100, 48)

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
      .m {{ stroke: {HENDIDO_VISTA}; stroke-width: 0.6; stroke-dasharray: 5 1.5 0.8 1.5; }}
      .v {{ stroke: {HENDIDO_VISTA}; stroke-width: 0.6; stroke-dasharray: 3 1.5; }}
      .zona {{ fill: #f3f6f9; }}
      .h3d {{ fill: #fff; stroke: #1a1a1a; stroke-width: 0.15; stroke-linejoin: round; }}
      .h3p {{ stroke: #999; stroke-width: 0.1; stroke-dasharray: 1 0.6; }}
      .h1 {{ font-size: 7px; font-weight: bold; }}
      .h2 {{ font-size: 4.2px; font-weight: bold; }}
      .t {{ font-size: 3.4px; }}
      .s {{ font-size: 2.8px; fill: #666; }}
    </style>
  </defs>
  <rect width="{PW}" height="{PH}" fill="#fff"/>
  <rect x="5" y="5" width="{PW-10}" height="{PH-10}" fill="none" stroke="#222" stroke-width="0.4"/>
  <text x="15" y="20" class="h1">Troquel — soporte plegable para portátil (prototipo v2)</text>
  <text x="15" y="27" class="t">Escala 1:1 · medidas en mm · imprimir al 100 % en A3 sin ajustar a página</text>

  <g transform="translate({ox} {oy})">
    <path class="c" d="{cut}"/>
{m}
{v}
    {"".join(cotas)}
    <text x="{W/2}" y="{A-T/2-P/2+1}" text-anchor="middle" class="s">pared de ranura</text>
    <text x="{W/2}" y="{A-3}" text-anchor="middle" class="s">fondo de ranura</text>
    <text x="{W/2}" y="{A+T/2+P/2+1}" text-anchor="middle" class="s">pared de ranura</text>
    <text x="{E*0.38}" y="{A-24}" text-anchor="middle" class="s">fuelle</text>
    <text x="{W-E*0.38}" y="{A-24}" text-anchor="middle" class="s">fuelle</text>
    <text x="{W/2}" y="10" text-anchor="middle" class="s">pata (apoyo en mesa)</text>
    <text x="{W/2}" y="{H-6}" text-anchor="middle" class="s">pata (apoyo en mesa)</text>
  </g>

  <!-- leyenda -->
  <g transform="translate(305 50)">
    <text class="h2" x="0" y="0">Leyenda</text>
    <line x1="0" y1="8" x2="18" y2="8" class="c"/>
    <text class="t" x="22" y="9.2">Corte (rojo)</text>
    <line x1="0" y1="16" x2="18" y2="16" class="m"/>
    <text class="t" x="22" y="17.2">Hendido — pliegue montaña</text>
    <line x1="0" y1="24" x2="18" y2="24" class="v"/>
    <text class="t" x="22" y="25.2">Hendido — pliegue valle</text>
    <text class="s" x="0" y="33">Montaña/valle vistos desde la cara exterior</text>
    <text class="s" x="0" y="37">(la cara gris de las fotos). En el archivo de</text>
    <text class="s" x="0" y="41">producción todo el hendido va en amarillo continuo.</text>

    <text class="h2" x="0" y="58">Parámetros</text>
    <text class="t" x="0" y="66">Plancha {W:.0f} × {H:.0f} · radio esquinas {R:.0f}</text>
    <text class="t" x="0" y="72">Diagonales: de cada esquina a ({E:.0f}, {A:.0f})</text>
    <text class="t" x="0" y="78">Ranura: ancho {T:.0f} · profundidad {P:.0f}</text>
    <text class="t" x="0" y="84">Material sugerido: cartón gris 1,5 mm</text>
    <text class="t" x="0" y="90">o microcanal E (canal paralelo a {W:.0f})</text>
  </g>

  <!-- vistas 3D -->
  <g transform="translate(305 150)">
    <text class="h2" x="0" y="0">Armado — modo atril</text>
    <g transform="translate(0 5)">
    {v_atril}
    </g>
    <text class="s" x="0" y="58">Cumbrera {HT:.0f} mm arriba; los fuelles se meten hacia adentro.</text>
  </g>
  <g transform="translate(305 216)">
    <text class="h2" x="0" y="0">Armado — modo vertical</text>
    <g transform="translate(0 5)">
    {v_ranura}
    </g>
    <text class="s" x="0" y="58">Ranura de {T:.0f} × {P:.0f} mm; diagonales planas.</text>
  </g>

  <text x="15" y="{PH-12}" class="s">Diseño inferido de fotografías: verificar primero con un corte en papel o cartulina antes de pasar a cartón.</text>
</svg>
'''


def main():
    cut, montana, valle = geometria()
    (OUT / "troquel.svg").write_text(troquel_svg(cut, montana, valle))
    (OUT / "troquel.dxf").write_text(troquel_dxf(montana, valle))
    (OUT / "plano.svg").write_text(plano_svg(cut, montana, valle))
    print("Generados: troquel.svg, troquel.dxf, plano.svg")


if __name__ == "__main__":
    main()
