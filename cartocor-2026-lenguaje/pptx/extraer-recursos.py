# Prepara los recursos originales (extraídos de los decks 2025, 2026 y Arcor 2026) para la plantilla
import os, shutil
from PIL import Image, ImageFilter
B = '/tmp/claude-0/-home-user-estudio83/76984eb5-6892-50fe-8e69-894fe593cd33/scratchpad/'
O = B + 'build/asset/'
os.makedirs(O, exist_ok=True)
E26, E25, AR = B + 'ex26/c26-', B + 'ex25/c25-', B + 'arcor/un/ppt/media/'

def save(im, name, maxs=1600):
    im = im.copy()
    if max(im.size) > maxs: im.thumbnail((maxs, maxs), Image.LANCZOS)
    if name.endswith('.jpg'): im.convert('RGB').save(O + name, quality=84)
    else: im.save(O + name, optimize=True)

def cp(src, name, maxs=1600):
    save(Image.open(src).convert('RGBA') if name.endswith('.png') else Image.open(src).convert('RGB'), name, maxs)

def trim(im, pad=4):
    bb = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    if not bb: return im
    l, t, r, b = bb
    return im.crop((max(0, l - pad), max(0, t - pad), min(im.width, r + pad), min(im.height, b + pad)))

# ---- logos ----
cp(E26 + 'p01-o9.png', 'logo-cartocor-blanco.png')
save(trim(Image.open(AR + 'image129.png').convert('RGBA')), 'logo-cartocor-color.png')
save(trim(Image.open(AR + 'image64.png').convert('RGBA')), 'logo-grupo-arcor.png')
strip = Image.open(E26 + 'p03-o71.png').convert('RGBA')
tiles = {'cartocor': (30, 30, 343, 426), 'converflex': (342, 70, 578, 386), 'zucamor': (592, 70, 843, 386), 'papel-misionero': (858, 70, 1109, 386), 'puntapel': (1124, 70, 1375, 386)}
for k, box in tiles.items():
    t = strip.crop(box)
    save(t, f'ficha-{k}.png')
    # logo blanco recortado del fondo de la ficha
    px = t.load(); w, h = t.size
    lo = Image.new('RGBA', t.size, (0, 0, 0, 0)); lp = lo.load()
    for y in range(h):
        for x in range(w):
            r, g, b_, a = px[x, y]
            m = min(r, g, b_)
            if a > 200 and m > 150:
                al = int(min(255, max(0, (m - 150) * 255 / 90)))
                lp[x, y] = (255, 255, 255, al)
    lo = trim(lo, 6)
    save(lo, f'logo-{k}-blanco.png')
    # logo en el color de la ficha (para círculos blancos)
    col = t.getpixel((20, h // 2))[:3] if k != 'cartocor' else (1, 185, 70)
    if k == 'converflex': col = (37, 47, 96)
    c = Image.new('RGBA', lo.size, col + (0,)); c.putalpha(lo.getchannel('A')); save(c, f'logo-{k}-color.png')

# ---- formas originales ----
cp(E26 + 'p01-o10.png', 'esquina-doblada.png')
save(trim(Image.open(AR + 'image123.png').convert('RGBA')), 'caja-dibujada.png')
save(trim(Image.open(E26 + 'p02-o37.png').convert('RGBA')), 'caja-dibujada-2026.png')
cp(E26 + 'p06-o151.png', 'mancha-arena.png')
cp(AR + 'image8.png', 'panel-arena-dibujado.png', 2000)
cp(AR + 'image118.png', 'panel-dibujado.png')
cp(AR + 'image9.png', 'pill-celeste-dibujada.png')
cp(AR + 'image13.png', 'marco-circular-dibujado.png')
for n, f in [('verde', 'image54'), ('amarilla', 'image55'), ('celeste', 'image56')]: cp(AR + f + '.png', f'tarjeta-{n}.png', 1000)
cp(AR + 'image57.png', 'linea-puntos.png', 2000)
cp(AR + 'image63.png', 'conectores-valores.png', 1600)
cp(AR + 'image51.png', 'ola-azul-textura.png', 1600)
cp(AR + 'image7.png', 'ola-azul-ancha.png', 2400)
cp(AR + 'image1.png', 'fondo-azul-textura.jpg', 1920)
cp(AR + 'image94.png', 'pin-naranja.png')
cp(AR + 'image105.png', 'globo-ilustrado.png')
cp(AR + 'image4.png', 'linea-corazon.png', 1600)
cp(AR + 'image11.png', 'ilustracion-equipo.png', 800)

# ---- íconos de unidad originales (2026) ----
for n, f in [('corrugado', 'p03-o68'), ('flexibles', 'p03-o67'), ('papel', 'p03-o66'), ('kraft', 'p03-o69'), ('bolsas', 'p03-o65')]:
    save(trim(Image.open(E26 + f + '.png').convert('RGBA')), f'icono-{n}.png')
for n, f in [('corrugado', 'p04-o106'), ('bolsas', 'p04-o102'), ('papel', 'p04-o103'), ('bobina', 'p04-o104'), ('reciclado', 'p04-o105')]:
    save(trim(Image.open(E26 + f + '.png').convert('RGBA')), f'icono-{n}-blanco.png')
for n, f in [('fruta', 'p12-o338'), ('lacteos', 'p12-o339'), ('pollo', 'p12-o340'), ('carne', 'p12-o341')]:
    save(trim(Image.open(E26 + f + '.png').convert('RGBA')), f'icono-mercado-{n}.png')
# íconos dibujados (Arcor)
for n, f in [('planta', 'image81'), ('planta-naranja', 'image82'), ('flexible', 'image84'), ('energia', 'image86'), ('carton', 'image87'), ('agro', 'image88'), ('alimentos', 'image96')]:
    save(trim(Image.open(AR + f + '.png').convert('RGBA')), f'dibujo-{n}.png')

# ---- banderas y mapas ----
cp(E26 + 'p12-o347.png', 'bandera-argentina.png'); cp(E26 + 'p13-o357.png', 'bandera-chile.png'); cp(E26 + 'p13-o358.png', 'bandera-peru.png')
cp(E26 + 'p14-o392.png', 'bandera-chile-circulo.png'); cp(E26 + 'p14-o393.png', 'bandera-peru-circulo.png')
cp(AR + 'image77.png', 'mapa-argentina.png')
cp(E26 + 'p14-o378.png', 'mapa-sudamerica.png')
cp(E25 + 'p06-o48.png', 'mapa-provincias.png')

# ---- logos de clientes y certificaciones ----
import glob, re
cl = sorted(glob.glob(E26 + 'p1[5-7]-o*.png'), key=lambda f: int(re.findall(r'o(\d+)', f)[-1]))
skip = {'435', '451', '461', '471', '424'}
k = 0
for f in cl:
    o = re.findall(r'o(\d+)', f)[-1]
    if o in skip: continue
    k += 1; save(Image.open(f).convert('RGBA'), f'cliente-{k:02d}.png', 500)
for n, o in [('fsc', 'p19-o501'), ('fssc22000', 'p19-o502'), ('iso45001', 'p19-o503'), ('iso14001', 'p19-o504'), ('iso9001', 'p19-o505'), ('pefc', 'p19-o506')]:
    cp(E26 + o + '.png', f'cert-{n}.png', 500)
cp(E26 + 'p20-o554.png', 'qr-cartocor.png')

# ---- productos recortados (2025) ----
for i, o in enumerate(['p11-o102', 'p11-o106', 'p11-o110', 'p11-o116', 'p11-o119', 'p11-o123', 'p11-o126', 'p11-o87', 'p11-o91', 'p11-o95', 'p11-o98', 'p12-o133', 'p12-o141', 'p12-o145', 'p12-o157', 'p12-o166', 'p12-o170', 'p13-o196', 'p13-o200', 'p13-o206', 'p13-o210', 'p13-o214', 'p15-o255', 'p15-o259', 'p15-o263'], 1):
    save(trim(Image.open(E25 + o + '.png').convert('RGBA')), f'producto-{i:02d}.png', 700)
for n, o in [('maquina-tf-mini', 'p11-o247'), ('maquina-mav', 'p11-o248'), ('maquina-bf-dual', 'p11-o246'), ('bobinas-carton', 'p10-o230'), ('pallet', 'p10-o228'), ('display-pop', 'p10-o227'), ('bolsa-cemento', 'p06-o157')]:
    save(trim(Image.open(E26 + o + '.png').convert('RGBA')), f'producto-{n}.png', 800)
for i, o in enumerate(['p11-o251', 'p11-o252', 'p11-o253', 'p11-o254', 'p11-o255', 'p11-o256'], 1):
    save(trim(Image.open(E26 + o + '.png').convert('RGBA')), f'bandeja-{i}.png', 600)

# ---- fotos ----
for n, src in [('plantacion', E25 + 'p02-o16.png'), ('oficina', E25 + 'p03-o23.png'), ('operario', E25 + 'p09-o68.png'), ('manos-caja', E25 + 'p10-o72.png'), ('maquina', E25 + 'p23-o306.png'), ('pila-papel', E25 + 'p24-o309.png'), ('reunion', E25 + 'p26-o316.png'), ('bobina', E25 + 'p14-o222.png'), ('rollos', E25 + 'p14-o227.png'), ('tubos', E25 + 'p14-o229.png'), ('bosque-alto', E25 + 'p27-o319.png'),
               ('bosque', E26 + 'p01-o7.png'), ('bosque-camino', E26 + 'p20-o553.png'), ('bosque-sostenibilidad', E26 + 'p18-o489.png'), ('carton-onda', E26 + 'p05-o124.png'), ('rollos-reciclado', E26 + 'p05-o129.png'), ('plantines', E26 + 'p05-o130.png'), ('bolsas-industriales', E26 + 'p05-o131.png'), ('flexibles', E26 + 'p05-o132.png'), ('planta-corrugado', E26 + 'p14-o380.png'), ('corrugado-maquina', B + 'up/foto-corrugado.jpg')]:
    save(Image.open(src).convert('RGB'), f'foto-{n}.jpg', 1600)
print(len(os.listdir(O)), 'recursos')
