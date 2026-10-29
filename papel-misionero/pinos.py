"""Isotipos del pino (Pinus elliottii y P. taeda) — sistema «Silvicultura Gráfica».

Reglas de construcción (ver filosofia-isotipos.md):
- Retícula de 120 unidades, área útil de 104 (márgenes de 8).
- Una sola tinta: cada icono es una silueta; los cortes se hacen con máscara,
  así el calado deja ver el fondo real (kraft, crudo o blanco).
- Calado mínimo de 5 unidades y trazo mínimo de 5, para resistir la ganancia de
  punto de la flexografía sobre kraft.
- Un mismo pino base (tres pisos de igual ángulo) se reutiliza en toda la familia.

Uso:  python3 pinos.py   →  svg/P<n>.svg (una tinta, verde selva)
"""
import math

from generar import VERDE, guardar, svg

CAL = 5  # calado mínimo (unidades)


def _mascara(id_, blanco, negro=""):
    """Grupo enmascarado: `blanco` es la tinta, `negro` lo que se calan."""
    return (f'<mask id="{id_}" maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">'
            f'<g fill="#fff" stroke="#fff">{blanco}</g><g fill="#000" stroke="#000">{negro}</g></mask>')


def icono(id_, blanco, negro, color):
    return _mascara(id_, blanco, negro) + f'<rect width="120" height="120" fill="{color}" mask="url(#{id_})"/>'


def pino(cx, top, alto, ancho, pisos=3, tronco=0.24, gap=CAL):
    """Pino base: pisos triangulares de igual ángulo, superpuestos y separados por un calado.
    Devuelve (tinta, calados)."""
    h_tronco = alto * tronco
    h_copa = alto - h_tronco
    paso = h_copa / (pisos + 1.1)
    th = paso * 2.1  # alto de cada piso
    tinta, cortes = "", ""
    for k in range(pisos):
        y = top + k * paso
        w = ancho * (0.56 + 0.44 * k / max(pisos - 1, 1))
        tri = f"M{cx} {y} L{cx + w / 2} {y + th} L{cx - w / 2} {y + th} Z"
        tinta += f'<path d="{tri}" stroke="none"/>'
        if k > 0:  # calado sobre el piso anterior, siguiendo el borde del piso nuevo
            cortes += (f'<path d="M{cx - w / 2} {y + th} L{cx} {y} L{cx + w / 2} {y + th}" fill="none" '
                       f'stroke-width="{gap}" stroke-linejoin="miter"/>')
            cortes += f'<path d="{tri}" fill="#fff" stroke="none"/>'
    base = top + (pisos - 1) * paso + th
    w_t = max(alto * 0.075, 6)
    tinta += f'<rect x="{cx - w_t / 2}" y="{base - 2}" width="{w_t}" height="{top + alto - base + 2}" rx="1.5" stroke="none"/>'
    return tinta, cortes


def p1():
    t, c = pino(60, 8, 104, 84)
    return t, c


def p2():
    """Pino adulto de plantación: fuste largo y podado, copa alta en matas horizontales."""
    t = '<rect x="56" y="34" width="8" height="78" rx="1.5"/>'
    for x, y, w in ((60, 10, 44), (40, 24, 40), (82, 22, 36), (60, 36, 56)):
        t += f'<rect x="{x - w / 2}" y="{y}" width="{w}" height="10" rx="5"/>'
    for x0, y0, x1, y1 in ((60, 58, 34, 34), (60, 50, 86, 31)):
        t += f'<path d="M{x0} {y0} L{x1} {y1}" fill="none" stroke-width="5" stroke-linecap="round"/>'
    c = "".join(f'<rect x="{x - w / 2 - 0.5}" y="{y - 2.5}" width="{w + 1}" height="2.5"/>' for x, y, w in ((60, 24, 18),))
    return t, c


def aguja(ang, largo, base=(60, 92), ancho=6.2):
    """Acícula: forma afinada, de ancho `ancho` en la base y punta redondeada."""
    bx, by = base
    a = math.radians(ang)
    tx, ty = bx + largo * math.sin(a), by - largo * math.cos(a)
    nx, ny = math.cos(a), math.sin(a)
    cx, cy = bx + largo * .55 * math.sin(a) - nx * ang * .08, by - largo * .55 * math.cos(a) - ny * ang * .08
    w = ancho / 2
    return (f'<path d="M{bx - nx * w:.2f} {by - ny * w:.2f} Q{cx - nx * w * .7:.2f} {cy - ny * w * .7:.2f} {tx:.2f} {ty:.2f} '
            f'Q{cx + nx * w * .7:.2f} {cy + ny * w * .7:.2f} {bx + nx * w:.2f} {by + ny * w:.2f} Z"/>')


def p3():
    t = aguja(-20, 86) + aguja(0, 86) + aguja(20, 86)
    t += '<rect x="52" y="90" width="16" height="22" rx="4"/>'
    c = '<rect x="52" y="97" width="16" height="3"/>'
    return t, c


def p4():
    """Pino plegado: cada piso es un pliego doblado al medio; el pliegue es un calado fino."""
    t, c = "", ""
    for y, w, h in ((8, 52, 30), (28, 76, 36), (52, 104, 40)):
        t += f'<path d="M60 {y} L{60 + w / 2} {y + h} L{60 - w / 2} {y + h} Z"/>'
        c += f'<path d="M60 {y + 8} V{y + h}" fill="none" stroke-width="2.5"/>'
    for y, w, h in ((28, 76, 36), (52, 104, 40)):
        c += f'<path d="M{60 - w / 2} {y + h} L60 {y} L{60 + w / 2} {y + h}" fill="none" stroke-width="{CAL}"/>'
        c += f'<path d="M60 {y} L{60 + w / 2} {y + h} L{60 - w / 2} {y + h} Z" fill="#fff" stroke="none"/>'
    t += '<rect x="55" y="90" width="10" height="22" rx="1.5"/>'
    return t, c


def p5():
    """Piña: silueta ovoide con escamas en espiral (rombos) caladas."""
    forma = "M60 8 C84 18 92 52 84 80 C79 98 70 108 60 110 C50 108 41 98 36 80 C28 52 36 18 60 8 Z"
    t = f'<path d="{forma}"/>'
    c = "".join(f'<path d="M{x} -10 L{x + 140} 130" fill="none" stroke-width="3.2"/>'
                f'<path d="M{x + 140} -10 L{x} 130" fill="none" stroke-width="3.2"/>' for x in range(-140, 141, 15))
    c += f'<path d="{forma}" fill="none" stroke-width="0"/>'
    return t + '<rect x="56" y="106" width="8" height="8" rx="2"/>', c


def p6():
    """Hilera de plantación: cinco pinos base en ritmo de alturas, sobre el surco."""
    t, c = "", ""
    for cx, alto in ((16, 58), (38, 78), (60, 96), (82, 78), (104, 58)):
        a, b = pino(cx, 104 - alto, alto, alto * 0.4, pisos=3, gap=3.2)
        t += a
        c += b
    t += '<rect x="6" y="104" width="108" height="8" rx="1.5"/>'
    c += '<rect x="0" y="99.5" width="120" height="4.5"/>'
    return t, c


def p7():
    """Pino de fibras: tres hebras de fuste que suben y se abren en pisos de chevrones."""
    t = ""
    for k, (y, w) in enumerate(((10, 36), (30, 62), (50, 88), (70, 112))):
        for o in (0, 7):
            t += f'<path d="M{60 - w / 2} {y + 20 + o} L60 {y + o} L{60 + w / 2} {y + 20 + o}" fill="none" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round"/>'
    t += "".join(f'<path d="M{x} 112 V16" fill="none" stroke-width="3.6" stroke-linecap="round"/>' for x in (53, 60, 67))
    return t, ""


def p8():
    """Pino en sello: el pino base calado dentro de un disco."""
    a, b = pino(60, 18, 88, 66)
    return '<circle cx="60" cy="60" r="54"/>', a + b.replace('fill="#fff"', 'fill="#000"').replace('stroke-width', 'stroke="#fff" stroke-width')


def p9():
    """Pliego con plantación: hoja con esquina plegada y tres pinos calados."""
    hoja = "M14 8 H82 L112 38 V104 a8 8 0 0 1 -8 8 H16 a8 8 0 0 1 -8 -8 V16 a8 8 0 0 1 8 -8 Z"
    t = f'<path d="{hoja}"/>'
    c = '<path d="M82 8 V32 a6 6 0 0 0 6 6 H112" fill="none" stroke-width="4"/>'
    for cx, alto in ((34, 54), (60, 70), (86, 54)):
        a, b = pino(cx, 98 - alto, alto, alto * .48, gap=3.4)
        c += a + b.replace('fill="#fff"', 'fill="#000"').replace('stroke-width', 'stroke="#fff" stroke-width')
    return t, c


def p10():
    """Anillos y pino: anillos de crecimiento levemente descentrados, con el pino en el corazón."""
    t = '<circle cx="60" cy="60" r="54"/>'
    c = "".join(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="none" stroke-width="{CAL}"/>'
                for cx, cy, r in ((60, 60, 46), (59.5, 61, 37), (59, 62, 28.5)))
    a, b = pino(58.5, 41, 40, 26, gap=3)
    c += '<circle cx="59" cy="62" r="21"/>' + a.replace('<path', '<path fill="#fff"').replace('<rect', '<rect fill="#fff"') + b
    return t, c


PINOS = {
    1: ("Pino de pisos", p1), 2: ("Pino de plantación", p2), 3: ("Fascículo", p3), 4: ("Pino plegado", p4),
    5: ("Piña", p5), 6: ("Hilera", p6), 7: ("Pino de fibras", p7), 8: ("Pino en sello", p8),
    9: ("Pliego con plantación", p9), 10: ("Anillos y pino", p10),
}


def pieza(n, color=VERDE):
    t, c = PINOS[n][1]()
    return icono(f"m{n}", t, c, color)


if __name__ == "__main__":
    for n, (nombre, _) in PINOS.items():
        guardar(f"P{n}.svg", svg(120, 120, pieza(n)))
        print(n, nombre)
