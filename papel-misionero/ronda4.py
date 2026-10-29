"""Ronda 4 de isotipos: menos opciones, construidas con curvas, trazos afinados y monolínea.

- Trazo base W = 7 (sobre 120), terminaciones redondeadas.
- `cinta` dibuja trazos que se afinan (ramas y acículas) como formas llenas.
Uso:  python3 ronda4.py   →  svg/R4-<n>.svg
"""
import math

from generar import VERDE, guardar, svg
from pinos import icono

W = 7


def _bez(p, t):
    (x0, y0), (x1, y1), (x2, y2), (x3, y3) = p
    u = 1 - t
    x = u**3 * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t**3 * x3
    y = u**3 * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t**3 * y3
    dx = 3 * u * u * (x1 - x0) + 6 * u * t * (x2 - x1) + 3 * t * t * (x3 - x2)
    dy = 3 * u * u * (y1 - y0) + 6 * u * t * (y2 - y1) + 3 * t * t * (y3 - y2)
    n = math.hypot(dx, dy) or 1
    return x, y, -dy / n, dx / n


def cinta(p, w0, w1, n=40):
    """Trazo lleno sobre una curva cúbica, de ancho w0 a w1, con punta redondeada."""
    izq, der = [], []
    for i in range(n + 1):
        t = i / n
        x, y, nx, ny = _bez(p, t)
        w = (w0 + (w1 - w0) * t ** 0.85) / 2
        izq.append((x + nx * w, y + ny * w))
        der.append((x - nx * w, y - ny * w))
    x, y, nx, ny = _bez(p, 1)
    r = w1 / 2
    tx, ty = ny, -nx  # tangente
    tx, ty = -tx, -ty
    punta = [(x + nx * r * math.cos(a) + tx * r * math.sin(a) * -1, y + ny * r * math.cos(a) + ty * r * math.sin(a) * -1)
             for a in [k * math.pi / 8 for k in range(1, 8)]]
    pts = izq + punta + der[::-1]
    return '<path d="M' + " L".join(f"{a:.2f} {b:.2f}" for a, b in pts) + ' Z"/>'


def rama(x0, y0, largo, ang, w0=6.5, w1=2.6, curva=0.0, lado=1):
    """Rama de pino: sale del tronco firme y la punta se levanta apenas (nunca cae)."""
    a = math.radians(ang)
    b = math.radians(ang - 4)  # casi recta: la punta apenas se levanta
    x1, y1 = x0 + lado * largo * .4 * math.sin(a), y0 - largo * .4 * math.cos(a)
    x3 = x1 + lado * largo * .6 * math.sin(b)
    y3 = y1 - largo * .6 * math.cos(b) - largo * curva
    x2, y2 = x1 + lado * largo * .3 * math.sin(a), y1 - largo * .3 * math.cos(a)
    return cinta(((x0, y0), (x1, y1), (x2, y2), (x3, y3)), w0, w1)


def pino_ramas(cx, top, base, ancho, pisos=5, ang=62, w0=6.5, w1=2.6, tronco=6.5, pie=None):
    """Pino de ramas: tronco afinado y pares de ramas cuyo largo dibuja un cono."""
    out = ""
    alto = base - top
    for k in range(pisos):
        f = (k + 1) / pisos
        y = top + alto * (0.12 + 0.62 * k / (pisos - 1))
        largo = ancho / 2 * (0.32 + 0.68 * f) / math.sin(math.radians(ang))
        out += rama(cx, y, largo, ang, w0, w1, lado=-1) + rama(cx, y, largo, ang, w0, w1, lado=1)
    pie = pie if pie is not None else base
    out += cinta(((cx, pie), (cx, pie - alto * .4), (cx, top + alto * .3), (cx, top)), tronco, 3.2)
    return out


# 1 · P monolínea: el ojo de la P se cierra sobre el tronco del pino
def m1():
    p = (f'<path d="M22 112 V12 H64 C92 12 106 30 106 52 C106 76 90 92 66 92" fill="none" '
         f'stroke-width="{W}" stroke-linecap="round" stroke-linejoin="round"/>')
    return p + pino_ramas(62, 22, 96, 46, pisos=5, w0=W, w1=3, tronco=W, pie=112), ""


# 2 · Pino de ramas sólido (abanico): versión plena para sellos y flexografía
def m2():
    return pino_ramas(60, 6, 114, 100, pisos=6, ang=56, w0=11, w1=4.2, tronco=11), ""


# 3 · Fascículo orgánico: tres acículas que se afinan, abiertas como una llama
def m3():
    t = ""
    for dx, cx1, cx2 in ((-1, -10, -30), (0, 0, 0), (1, 10, 30)):
        tip = (60 + dx * 40, 10 + abs(dx) * 8)
        t += cinta(((60 + dx * 4, 92), (60 + dx * 8, 66), (60 + dx * 20, 36), (60 + dx * 32, 10 + abs(dx) * 4)), 11, 2.8)
    t += '<rect x="50" y="88" width="20" height="24" rx="6"/>'
    return t, '<rect x="50" y="97" width="20" height="3.2"/>'


# 4 · Pino en arco: ventana de arco con el pino de ramas calado
def m4():
    arco = '<path d="M12 112 V54 A48 48 0 0 1 108 54 V112 Z"/>'
    return arco, pino_ramas(60, 20, 114, 66, pisos=5, w0=7, w1=3, tronco=7)


# 5 · P sólida (Helvetica) con el pino de ramas calado en el ojo y bajando por el asta
def m5():
    p = '<path d="M18 112 V8 H66 C92 8 106 24 106 44 C106 64 92 80 66 80 H44 V112 Z"/>'
    return p, pino_ramas(64, 18, 96, 50, pisos=5, w0=6, w1=2.8, tronco=6.5, pie=112)


MARCAS = {1: ("P monolínea con pino", m1), 2: ("Pino de ramas", m2), 3: ("Fascículo", m3),
          4: ("Pino en arco", m4), 5: ("P con pino calado", m5)}

if __name__ == "__main__":
    for n, (nombre, f) in MARCAS.items():
        t, c = f()
        guardar(f"R4-{n}.svg", svg(120, 120, icono(f"q{n}", t, c, VERDE)))
        print(n, nombre)


def logotipo(n, color=VERDE):
    """Isotipo + nombre en Helvetica por niveles (PAPEL regular espaciado / misionero bold)."""
    from helvetica import NIVELES, lineas
    t, c = MARCAS[n][1]()
    d, w, _ = lineas(NIVELES[1][1], x=168)
    iso = f'<g transform="translate(4 20) scale(1.3)">{icono(f"l{n}", t, c, color)}</g>'
    return svg(168 + w + 24, 196, iso + f'<path d="{d}" fill="{color}" transform="translate(0 6)"/>')


if __name__ == "__main__":
    for n in MARCAS:
        guardar(f"R4-{n}-logo.svg", logotipo(n))
