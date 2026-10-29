"""Arma navegable.html: la presentación interactiva, navegable por logo, en un solo archivo.

Uso:  python3 generar.py && python3 armar_navegable.py
Los SVG, las fuentes y la imagen de referencia se incrustan, así el archivo
funciona solo, sin carpetas al lado.
"""
import base64
import json
from pathlib import Path

AQUI = Path(__file__).parent


def uri(ruta, tipo):
    return f"data:{tipo};base64," + base64.b64encode((AQUI / ruta).read_bytes()).decode()


SVG = {p.stem: uri(p.relative_to(AQUI), "image/svg+xml") for p in sorted((AQUI / "svg").glob("*.svg"))}
FUENTES = {n: uri(f"fuentes/{n}.woff", "font/woff") for n in ("InstrumentSans-500", "InstrumentSans-600", "Fraunces-600")}
REFERENCIA = uri("referencia/logo-actual.png", "image/png")

# Contenido de cada logo. Los textos están escritos para el cliente.
LOGOS = [
    {
        "id": "araucaria",
        "nombre": "Araucaria",
        "etiqueta": "Camino 01",
        "mini": "R2-araucaria-simbolo",
        "lema": "El árbol de Misiones, en su silueta más fiel.",
        "concepto": (
            "En la primera versión, las ramas curvadas hacia arriba generaban una lectura ambigua: el símbolo "
            "podía interpretarse como una figura distinta a un árbol. Volvimos a la morfología real del pino Paraná "
            "adulto, cuya silueta es única en el paisaje misionero: un fuste recto y muy alto, coronado por una copa "
            "plana en forma de cáliz, construida por pisos de ramas que sostienen el follaje en sus extremos."
        ),
        "fondos": {"blanco": "R2-araucaria-color", "verde": "R2-araucaria-negativo", "kraft": "R2-araucaria-kraft"},
        "antes": "01-simbolo",
        "despues": "R2-araucaria-simbolo",
        "razones": [
            ("Copa plana", "El follaje se dibuja como capas llenas y ligeramente cóncavas que forman el cáliz característico de la especie. La silueta se lee como árbol aun a distancia."),
            ("Fuste largo", "El tronco ocupa más de la mitad de la altura y se afina hacia arriba, como en el árbol adulto. La proporción elimina lecturas ambiguas y aporta solidez."),
            ("Pisos que son pliegos", "Las capas apiladas de la copa evocan los pliegos de papel y las capas de una bolsa multipliego. El árbol y el producto conviven en un mismo trazo."),
        ],
        "versiones": [
            ("Horizontal con respaldo", "R2-araucaria-respaldo", "blanco"),
            ("Vertical", "R2-araucaria-vertical", "blanco"),
            ("Negativo", "R2-araucaria-negativo", "verde"),
            ("Una tinta sobre kraft", "R2-araucaria-kraft", "kraft"),
            ("Símbolo", "R2-araucaria-simbolo", "blanco"),
            ("Símbolo reducido", "R2-araucaria-simbolo-reducido", "blanco"),
        ],
        "escala": {"normal": "R2-araucaria-simbolo", "reducido": "R2-araucaria-simbolo-reducido", "umbral": 24},
        "apps": {"bolsa": "R2-araucaria-color", "etiqueta": "R2-araucaria-color", "avatar": "R2-araucaria-simbolo-claro", "cartel": "R2-araucaria-negativo"},
    },
    {
        "id": "anillos",
        "nombre": "Anillos",
        "etiqueta": "Camino 04",
        "mini": "R2-bobina-simbolo",
        "lema": "El papel que se enrolla y se vuelve marca.",
        "concepto": (
            "El concepto de los anillos de crecimiento convertidos en bobina fue bien recibido, pero la primera versión "
            "resultaba geométrica y distante: hablaba de círculos más que de papel. En esta instancia el símbolo se "
            "construye con la materia misma del producto. La P ya no está formada por anillos cerrados: es una espiral, "
            "la forma real que adopta un pliego al enrollarse en una bobina."
        ),
        "fondos": {"blanco": "R2-bobina-color", "verde": "R2-bobina-negativo", "kraft": "R2-bobina-kraft"},
        "antes": "04-simbolo",
        "despues": "R2-bobina-simbolo",
        "razones": [
            ("Una espiral, no círculos", "El pliego se enrolla sobre sí mismo y se desenrolla para formar el fuste de la P. Es el gesto de la bobina al entrar en la máquina: el papel en movimiento."),
            ("Tres hebras de fibra", "El trazo se divide en tres hebras paralelas: la fibra larga de pino que da resistencia al kraft, y los pliegos que componen cada bolsa multipliego."),
            ("Borde de fibra", "Las hebras terminan a distinta altura, como el borde de un papel rasgado donde asoman sus fibras. Un detalle que vuelve tangible la materia."),
        ],
        "versiones": [
            ("Horizontal con respaldo", "R2-bobina-respaldo", "blanco"),
            ("Vertical", "R2-bobina-vertical", "blanco"),
            ("Negativo", "R2-bobina-negativo", "verde"),
            ("Una tinta sobre kraft", "R2-bobina-kraft", "kraft"),
            ("Símbolo", "R2-bobina-simbolo", "blanco"),
            ("Símbolo reducido", "R2-bobina-simbolo-reducido", "blanco"),
        ],
        "escala": {"normal": "R2-bobina-simbolo", "reducido": "R2-bobina-simbolo-reducido", "umbral": 32},
        "apps": {"bolsa": "R2-bobina-monocromo", "etiqueta": "R2-bobina-color", "avatar": "R2-bobina-simbolo-claro", "cartel": "R2-bobina-negativo"},
    },
]

RONDA1 = [
    ("01", "Araucaria", "01-araucaria-color", "Evolución del símbolo vigente.", "araucaria"),
    ("02", "Pliego", "02-pliego-color", "La araucaria dentro de un pliego kraft.", None),
    ("03", "Misionero", "03-misionero-color", "La «i» de misionero como araucaria.", None),
    ("04", "Anillos", "04-anillos-color", "Anillos del árbol que forman la P.", "anillos"),
    ("05", "Sello de origen", "05-sello-horizontal", "Misiones, Argentina, 1975.", None),
]


def img(nombre, alt="", clase="", estilo=""):
    c = f' class="{clase}"' if clase else ""
    e = f' style="{estilo}"' if estilo else ""
    return f'<img src="{SVG[nombre]}" alt="{alt}"{c}{e}>'


def descarga(nombre, texto):
    return f'<a class="desc" href="{SVG[nombre]}" download="papel-misionero-{nombre}.svg">{texto}</a>'


def vista_logo(l):
    razones = "".join(f'<div class="razon"><b>{t}</b><p>{p}</p></div>' for t, p in l["razones"])
    versiones = "".join(
        f'<figure class="version {fondo}">{img(n, t)}<figcaption><span>{t}</span>{descarga(n, "SVG ↓")}</figcaption></figure>'
        for t, n, fondo in l["versiones"]
    )
    fondos = json.dumps({k: SVG[v] for k, v in l["fondos"].items()})
    esc = l["escala"]
    a = l["apps"]
    return f'''
<section class="vista" id="v-{l["id"]}" data-vista="{l["id"]}" hidden>
  <div class="hero" data-fondos='{fondos}'>
    <div class="hero-txt">
      <span class="num">{l["etiqueta"]} · Refinamiento</span>
      <h2>{l["nombre"]}</h2>
      <p class="lema">{l["lema"]}</p>
      <div class="fondos" role="group" aria-label="Fondo">
        <button class="on" data-fondo="blanco">Blanco</button>
        <button data-fondo="verde">Verde selva</button>
        <button data-fondo="kraft">Kraft</button>
      </div>
    </div>
    <div class="hero-logo blanco">{img(l["fondos"]["blanco"], l["nombre"])}</div>
  </div>

  <div class="bloque dos-col">
    <div><p class="eyebrow">Concepto</p><h3>Por qué cambió</h3></div>
    <p class="gris">{l["concepto"]}</p>
  </div>

  <div class="antes-despues">
    <figure class="ad">{img(l["antes"], "Primera instancia")}<figcaption>Primera instancia</figcaption></figure>
    <div class="flecha">→</div>
    <figure class="ad nuevo">{img(l["despues"], "Refinamiento")}<figcaption>Refinamiento</figcaption></figure>
  </div>
  <div class="razones">{razones}</div>

  <div class="bloque"><p class="eyebrow">Versiones</p><h3>Sistema de marca</h3></div>
  <div class="versiones">{versiones}</div>

  <div class="bloque escala-bloque">
    <div><p class="eyebrow">Escala</p><h3>De la fachada al favicon</h3>
      <p class="gris">Mové el control para ver el símbolo a distintos tamaños. Debajo de {esc["umbral"]} px se activa automáticamente la versión reducida, diseñada para mantener la lectura.</p>
      <label class="rango">Tamaño <input type="range" min="12" max="240" value="120" data-normal="{SVG[esc["normal"]]}" data-reducido="{SVG[esc["reducido"]]}" data-umbral="{esc["umbral"]}"><output>120 px</output></label>
      <p class="estado">Versión completa</p>
    </div>
    <div class="escala-vista">{img(esc["normal"], "Símbolo en escala", "escala-img", "height:120px")}</div>
  </div>

  <div class="bloque"><p class="eyebrow">Aplicaciones</p><h3>En uso</h3></div>
  <div class="apps">
    <figure class="app crudo"><div class="bolsa">{img(a["bolsa"], "Bolsa multipliego")}</div><figcaption>Bolsa multipliego 50 kg</figcaption></figure>
    <figure class="app blanco"><div class="bobina"><div class="etiqueta">{img(a["etiqueta"], "Etiqueta de bobina")}</div></div><figcaption>Etiqueta de bobina</figcaption></figure>
    <figure class="app blanco"><div class="avatar">{img(a["avatar"], "Perfil digital")}</div><figcaption>Perfil digital</figcaption></figure>
    <figure class="app crudo"><div class="cartel"><div class="placa">{img(a["cartel"], "Cartel de acceso")}</div></div><figcaption>Acceso a planta</figcaption></figure>
  </div>
</section>'''


def vista_comparar():
    cols = "".join(
        f'''<div class="comp-col">
      <button class="comp-titulo" data-ir="{l["id"]}">{l["etiqueta"]} · {l["nombre"]} →</button>
      <div class="comp-panel blanco">{img(l["fondos"]["blanco"], l["nombre"])}</div>
      <div class="comp-panel verde">{img(l["fondos"]["verde"], l["nombre"] + " negativo")}</div>
      <div class="comp-panel kraft">{img(l["fondos"]["kraft"], l["nombre"] + " sobre kraft")}</div>
      <div class="comp-panel crudo"><div class="bolsa">{img(l["apps"]["bolsa"], "Bolsa")}</div></div>
    </div>'''
        for l in LOGOS
    )
    return f'''
<section class="vista" id="v-comparar" data-vista="comparar" hidden>
  <div class="bloque dos-col">
    <div><p class="eyebrow">Lado a lado</p><h2 class="h2-chico">Dos caminos sólidos para decidir.</h2></div>
    <p class="gris">Araucaria preserva la memoria de la marca y la proyecta con una silueta inconfundible del territorio. Anillos construye un signo nuevo y propio, nacido del producto y su materia. Ambos comparten paleta, tipografía y lógica de sistema.</p>
  </div>
  <div class="comp">{cols}</div>
  <div class="bloque dos-col arriba">
    <div><p class="eyebrow">Próximos pasos</p><h3>Cómo seguimos</h3></div>
    <ol class="pasos">
      <li>Elección del camino definitivo junto al equipo de Cartocor.</li>
      <li>Pruebas de impresión flexográfica a una tinta sobre sack kraft y kraftliner.</li>
      <li>Ajuste óptico final del símbolo y del logotipo, y archivos de producción.</li>
      <li>Validación con la Fundación Selva Misionera y diálogo con las comunidades de la reserva.</li>
      <li>Manual de identidad y aplicaciones: bolsas, bobinas, flota, señalética, indumentaria y digital.</li>
    </ol>
  </div>
</section>'''


def vista_ronda1():
    tarjetas = "".join(
        f'''<figure class="r1 {'elegida' if ir else ''}" {f'data-ir="{ir}" tabindex="0" role="button"' if ir else ''}>
      <div class="r1-logo">{img(n, t)}</div>
      <figcaption><span class="num">{num}</span><b>{t}</b><span class="gris">{d}</span>{'<em>Seleccionada → ver refinamiento</em>' if ir else ''}</figcaption>
    </figure>'''
        for num, t, n, d, ir in RONDA1
    )
    return f'''
<section class="vista" id="v-ronda1" data-vista="ronda1" hidden>
  <div class="bloque dos-col">
    <div><p class="eyebrow">Primera instancia</p><h2 class="h2-chico">De cinco caminos a dos.</h2></div>
    <p class="gris">La primera presentación exploró cinco caminos a partir de la investigación sobre la compañía y su territorio. Avanzaron Araucaria, por su continuidad con la identidad vigente y su arraigo territorial, y Anillos, por su capacidad de diferenciación.</p>
  </div>
  <div class="ronda1">{tarjetas}</div>
  <div class="bloque dos-col">
    <div><p class="eyebrow">Punto de partida</p><h3>Identidad vigente</h3></div>
    <div class="vigente"><img src="{REFERENCIA}" alt="Identidad vigente de Papel Misionero"><p class="gris">La araucaria y la sigla PM son activos con memoria. Ambos caminos seleccionados preservan el árbol o la inicial como ancla de la marca.</p></div>
  </div>
</section>'''


def nav():
    items = "".join(
        f'<a href="#{l["id"]}" data-nav="{l["id"]}"><img src="{SVG[l["mini"]]}" alt=""><span>{l["nombre"]}</span></a>' for l in LOGOS
    )
    return (items + '<a href="#comparar" data-nav="comparar"><span class="ico">⇆</span><span>Lado a lado</span></a>'
            '<a href="#ronda1" data-nav="ronda1"><span class="ico">5</span><span>Primera instancia</span></a>')


HTML = f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Papel Misionero — Identidad</title>
<style>
  @font-face {{ font-family: "Instrument Sans"; font-weight: 500; src: url({FUENTES["InstrumentSans-500"]}) format("woff"); }}
  @font-face {{ font-family: "Instrument Sans"; font-weight: 600; src: url({FUENTES["InstrumentSans-600"]}) format("woff"); }}
  @font-face {{ font-family: "Fraunces"; font-weight: 600; src: url({FUENTES["Fraunces-600"]}) format("woff"); }}
  :root {{
    --verde: #1F3A2B; --kraft: #B98A57; --kraft-osc: #8E6538; --tierra: #B0452B; --crudo: #F2EADB;
    --tinta: #1B1F1C; --gris: #64625A; --linea: #D8CDB9; --blanco: #FFFFFF;
  }}
  * {{ box-sizing: border-box; }}
  html {{ scroll-behavior: smooth; }}
  body {{ margin: 0; background: var(--crudo); color: var(--tinta); font: 500 16px/1.55 "Instrument Sans", sans-serif; }}
  h1, h2, h3 {{ font-family: "Fraunces", serif; font-weight: 600; color: var(--verde); margin: 0; letter-spacing: -0.015em; }}
  p {{ margin: 0 0 12px; }}
  button {{ font: inherit; cursor: pointer; }}
  .gris {{ color: var(--gris); }}
  .eyebrow {{ font-weight: 600; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--tierra); margin: 0 0 14px; }}
  .num {{ font-weight: 600; font-size: 12px; letter-spacing: .2em; text-transform: uppercase; color: var(--tierra); display: block; margin-bottom: 12px; }}

  /* Barra de navegación por logo */
  header {{ position: sticky; top: 0; z-index: 10; background: rgba(242,234,219,.94); backdrop-filter: blur(8px); border-bottom: 1px solid var(--linea); }}
  .barra {{ max-width: 1240px; margin: 0 auto; padding: 10px 32px; display: flex; align-items: center; gap: 24px; }}
  .marca {{ font: 600 17px/1.1 "Fraunces", serif; color: var(--verde); white-space: nowrap; }}
  .marca small {{ display: block; font: 500 11px/1.4 "Instrument Sans"; letter-spacing: .12em; text-transform: uppercase; color: var(--gris); }}
  nav {{ display: flex; gap: 6px; margin-left: auto; overflow-x: auto; scrollbar-width: none; }}
  nav a {{ display: flex; align-items: center; gap: 10px; padding: 8px 14px 8px 10px; border-radius: 999px; text-decoration: none; color: var(--tinta); font-size: 14px; font-weight: 600; white-space: nowrap; border: 1px solid transparent; transition: background .2s, border-color .2s; }}
  nav a img {{ height: 28px; width: 28px; object-fit: contain; }}
  nav a .ico {{ width: 28px; height: 28px; display: grid; place-items: center; border-radius: 50%; background: #fff; color: var(--verde); font-size: 14px; }}
  nav a:hover {{ border-color: var(--linea); }}
  nav a[aria-current="page"] {{ background: var(--verde); color: var(--crudo); }}
  nav a[aria-current="page"] img {{ background: var(--crudo); border-radius: 50%; padding: 2px; }}

  main {{ max-width: 1240px; margin: 0 auto; padding: 0 32px 80px; }}
  .vista {{ animation: entrar .45s ease both; }}
  @keyframes entrar {{ from {{ opacity: 0; transform: translateY(10px); }} to {{ opacity: 1; transform: none; }} }}

  .hero {{ display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; align-items: center; padding: 56px 0 40px; }}
  .hero h2 {{ font-size: clamp(56px, 8vw, 104px); line-height: .95; }}
  .lema {{ font-size: 20px; color: var(--gris); margin: 16px 0 28px; max-width: 26ch; }}
  .fondos {{ display: flex; gap: 6px; flex-wrap: wrap; }}
  .fondos button {{ border: 1px solid var(--linea); background: #fff; border-radius: 999px; padding: 7px 14px; font-size: 13px; color: var(--tinta); }}
  .fondos button.on {{ background: var(--verde); color: var(--crudo); border-color: var(--verde); }}
  .hero-logo {{ border-radius: 18px; min-height: 380px; display: grid; place-items: center; padding: 48px; transition: background .35s; }}
  .hero-logo img {{ width: 100%; max-width: 560px; height: auto; }}
  .blanco {{ background: var(--blanco); }} .verde {{ background: var(--verde); }} .kraft {{ background: var(--kraft); }} .crudo {{ background: #EAE0CD; }}

  .bloque {{ padding: 64px 0 28px; }}
  .bloque h3 {{ font-size: 34px; line-height: 1.05; }}
  .dos-col {{ display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px; align-items: end; border-top: 1px solid var(--linea); margin-top: 32px; }}
  .dos-col p {{ margin: 0; max-width: 64ch; }}
  .vista > .dos-col:first-child {{ border-top: 0; margin-top: 0; }}
  .dos-col.arriba {{ align-items: start; }}
  .h2-chico {{ font-size: 46px; line-height: 1.02; }}

  .antes-despues {{ display: grid; grid-template-columns: 1fr auto 1fr; gap: 20px; align-items: center; margin-top: 24px; }}
  .ad {{ margin: 0; background: #fff; border-radius: 14px; padding: 36px; display: grid; justify-items: center; gap: 16px; }}
  .ad img {{ height: 180px; width: auto; }}
  .ad figcaption {{ font-size: 12px; letter-spacing: .16em; text-transform: uppercase; color: var(--gris); }}
  .ad.nuevo {{ outline: 2px solid var(--verde); }}
  .flecha {{ font: 600 36px/1 "Fraunces", serif; color: var(--kraft); }}
  .razones {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 32px; }}
  .razon {{ border-top: 1.5px solid var(--verde); padding-top: 16px; }}
  .razon b {{ display: block; font: 600 21px/1.2 "Fraunces", serif; color: var(--verde); margin-bottom: 8px; }}
  .razon p {{ font-size: 15px; color: var(--gris); margin: 0; }}

  .versiones {{ display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }}
  .version {{ margin: 0; border-radius: 12px; min-height: 220px; display: grid; grid-template-rows: 1fr auto; overflow: hidden; }}
  .version img {{ max-width: 78%; max-height: 150px; place-self: center; margin: 28px 0 8px; }}
  .version figcaption {{ display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--gris); }}
  .version.verde figcaption {{ color: #B9C4BA; }} .version.kraft figcaption {{ color: #5A3F22; }}
  .desc {{ font-size: 11px; font-weight: 600; letter-spacing: .1em; color: inherit; text-decoration: none; border: 1px solid currentColor; border-radius: 999px; padding: 3px 9px; opacity: .8; }}
  .desc:hover {{ opacity: 1; }}

  .escala-bloque {{ display: grid; grid-template-columns: 1fr 1.4fr; gap: 48px; align-items: center; border-top: 1px solid var(--linea); margin-top: 48px; }}
  .rango {{ display: flex; align-items: center; gap: 14px; margin-top: 20px; font-size: 13px; font-weight: 600; }}
  .rango input {{ flex: 1; accent-color: var(--verde); }}
  .rango output {{ font-variant-numeric: tabular-nums; min-width: 56px; text-align: right; }}
  .estado {{ font-size: 13px; color: var(--tierra); font-weight: 600; margin-top: 10px; }}
  .escala-vista {{ background: #fff; border-radius: 14px; height: 300px; display: grid; place-items: center; overflow: hidden; }}
  .escala-img {{ width: auto; transition: height .08s; }}

  .apps {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }}
  .app {{ margin: 0; border-radius: 12px; min-height: 330px; display: grid; grid-template-rows: 1fr auto; place-items: center; padding: 24px 16px 12px; }}
  .app figcaption {{ font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--gris); justify-self: start; }}
  .bolsa {{ width: 170px; height: 230px; position: relative; display: grid; place-items: center; border-radius: 3px;
    background: linear-gradient(90deg, #9F7446, var(--kraft) 14%, #C79B69 50%, var(--kraft) 86%, #9F7446); box-shadow: 0 18px 30px -18px rgba(0,0,0,.55); }}
  .bolsa::before {{ content: ""; position: absolute; inset: 0 0 auto 0; height: 16px; background: repeating-linear-gradient(90deg, rgba(0,0,0,.18) 0 5px, transparent 5px 10px); }}
  .bolsa::after {{ content: "50 KG"; position: absolute; bottom: 14px; font: 600 10px/1 "Instrument Sans"; letter-spacing: .2em; color: var(--verde); opacity: .75; }}
  .bolsa img {{ width: 76%; margin-top: -16px; }}
  .bobina {{ width: 200px; height: 200px; border-radius: 50%; display: grid; place-items: center; position: relative;
    background: repeating-radial-gradient(circle, #B58654 0 2px, #A97B4A 2px 4px); box-shadow: 0 18px 30px -18px rgba(0,0,0,.55); }}
  .bobina::after {{ content: ""; position: absolute; width: 40px; height: 40px; border-radius: 50%; background: #6B4A2A; box-shadow: inset 0 0 0 6px #8E6538; }}
  .bobina .etiqueta {{ position: absolute; top: 18px; background: #fff; border-radius: 6px; padding: 8px 12px; width: 132px; display: grid; place-items: center; box-shadow: 0 4px 10px -6px rgba(0,0,0,.4); }}
  .bobina .etiqueta img {{ max-height: 48px; max-width: 100%; }}
  .avatar {{ width: 130px; height: 130px; border-radius: 30px; background: var(--verde); display: grid; place-items: center; box-shadow: 0 18px 30px -20px rgba(0,0,0,.6); }}
  .avatar img {{ height: 66%; width: auto; }}
  .cartel {{ width: 100%; max-width: 250px; position: relative; padding-bottom: 60px; }}
  .cartel .placa {{ background: var(--verde); border-radius: 4px; padding: 18px 20px; display: grid; place-items: center; position: relative; z-index: 1; box-shadow: 0 16px 24px -16px rgba(0,0,0,.5); }}
  .cartel .placa img {{ width: 100%; }}
  .cartel::before, .cartel::after {{ content: ""; position: absolute; bottom: 0; width: 7px; height: 80px; background: #6E6A60; }}
  .cartel::before {{ left: 22%; }} .cartel::after {{ right: 22%; }}

  .comp {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }}
  .comp-col {{ display: grid; gap: 12px; }}
  .comp-titulo {{ background: none; border: 0; text-align: left; padding: 0; font: 600 26px/1.1 "Fraunces", serif; color: var(--verde); }}
  .comp-titulo:hover {{ color: var(--tierra); }}
  .comp-panel {{ border-radius: 12px; min-height: 220px; display: grid; place-items: center; padding: 32px; }}
  .comp-panel > img {{ max-width: 82%; max-height: 150px; }}
  .pasos {{ counter-reset: p; list-style: none; padding: 0; margin: 0; }}
  .pasos li {{ counter-increment: p; display: grid; grid-template-columns: 44px 1fr; padding: 14px 0; border-top: 1px solid var(--linea); }}
  .pasos li::before {{ content: counter(p, decimal-leading-zero); font: 600 17px/1.5 "Fraunces", serif; color: var(--tierra); }}

  .ronda1 {{ display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }}
  .r1 {{ margin: 0; background: #fff; border-radius: 12px; overflow: hidden; display: grid; grid-template-rows: 170px auto; opacity: .6; }}
  .r1.elegida {{ opacity: 1; outline: 2px solid var(--verde); cursor: pointer; transition: transform .2s; }}
  .r1.elegida:hover, .r1.elegida:focus-visible {{ transform: translateY(-3px); }}
  .r1-logo {{ display: grid; place-items: center; padding: 20px; border-bottom: 1px solid var(--linea); }}
  .r1-logo img {{ max-width: 100%; max-height: 120px; }}
  .r1 figcaption {{ padding: 14px 16px 18px; display: grid; gap: 4px; font-size: 13px; }}
  .r1 figcaption .num {{ margin: 0; }}
  .r1 figcaption b {{ font: 600 19px/1.2 "Fraunces", serif; color: var(--verde); }}
  .r1 em {{ font-style: normal; font-weight: 600; color: var(--tierra); margin-top: 6px; }}
  .vigente {{ display: grid; grid-template-columns: 180px 1fr; gap: 24px; align-items: center; }}
  .vigente img {{ width: 100%; border-radius: 8px; }}

  .pie {{ display: flex; justify-content: space-between; gap: 20px; max-width: 1240px; margin: 0 auto; padding: 28px 32px 40px; border-top: 1px solid var(--linea); font-size: 13px; color: var(--gris); }}
  .teclas kbd {{ font: 600 11px/1 "Instrument Sans"; border: 1px solid var(--linea); border-radius: 4px; padding: 3px 6px; background: #fff; }}

  @media (max-width: 900px) {{
    .barra {{ padding: 8px 16px; flex-wrap: wrap; gap: 8px; }}
    nav {{ margin-left: 0; width: 100%; }}
    main {{ padding: 0 16px 64px; }}
    .hero, .dos-col, .escala-bloque, .antes-despues, .razones, .comp, .vigente {{ grid-template-columns: 1fr; }}
    .hero {{ padding-top: 32px; }}
    .hero-logo {{ min-height: 240px; padding: 28px; }}
    .versiones, .apps {{ grid-template-columns: 1fr 1fr; }}
    .ronda1 {{ grid-template-columns: 1fr 1fr; }}
    .flecha {{ transform: rotate(90deg); justify-self: center; }}
    .ad img {{ height: 130px; }}
    .pie {{ flex-direction: column; padding: 24px 16px; }}
  }}
  @media (max-width: 520px) {{ .versiones, .apps, .ronda1 {{ grid-template-columns: 1fr; }} }}
  @media (prefers-reduced-motion: reduce) {{ .vista {{ animation: none; }} html {{ scroll-behavior: auto; }} }}
</style>
</head>
<body>
<header>
  <div class="barra">
    <div class="marca">Papel Misionero<small>Estudio 83 · Identidad · Segunda instancia</small></div>
    <nav aria-label="Navegar por logo">{nav()}</nav>
  </div>
</header>
<main>
{"".join(vista_logo(l) for l in LOGOS)}
{vista_comparar()}
{vista_ronda1()}
</main>
<div class="pie"><span>Estudio 83 · Propuesta confidencial preparada para Cartocor — Grupo Arcor</span><span class="teclas">Navegá con <kbd>←</kbd> <kbd>→</kbd></span></div>
<script>
(() => {{
  const orden = [...document.querySelectorAll("[data-vista]")].map(v => v.dataset.vista);
  const mostrar = (id, subir = true) => {{
    if (!orden.includes(id)) id = orden[0];
    document.querySelectorAll("[data-vista]").forEach(v => v.hidden = v.dataset.vista !== id);
    document.querySelectorAll("[data-nav]").forEach(a => {{
      if (a.dataset.nav === id) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    }});
    if (subir) window.scrollTo({{ top: 0 }});
  }};
  const ir = id => {{ if (location.hash !== "#" + id) location.hash = id; else mostrar(id); }};
  window.addEventListener("hashchange", () => mostrar(location.hash.slice(1)));
  mostrar(location.hash.slice(1), false);

  document.addEventListener("keydown", e => {{
    if (e.target.closest("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const actual = orden.indexOf(document.querySelector("[data-vista]:not([hidden])").dataset.vista);
    const paso = e.key === "ArrowRight" ? 1 : -1;
    ir(orden[(actual + paso + orden.length) % orden.length]);
  }});
  document.querySelectorAll("[data-ir]").forEach(el => {{
    el.addEventListener("click", () => ir(el.dataset.ir));
    el.addEventListener("keydown", e => {{ if (e.key === "Enter" || e.key === " ") {{ e.preventDefault(); ir(el.dataset.ir); }} }});
  }});

  // Fondo del logo principal
  document.querySelectorAll(".hero").forEach(h => {{
    const fondos = JSON.parse(h.dataset.fondos);
    const caja = h.querySelector(".hero-logo");
    h.querySelectorAll("[data-fondo]").forEach(b => b.addEventListener("click", () => {{
      h.querySelectorAll("[data-fondo]").forEach(x => x.classList.toggle("on", x === b));
      caja.className = "hero-logo " + b.dataset.fondo;
      caja.querySelector("img").src = fondos[b.dataset.fondo];
    }}));
  }});

  // Control de escala: debajo del umbral usa la versión reducida
  document.querySelectorAll(".escala-bloque").forEach(bl => {{
    const r = bl.querySelector("input"), o = bl.querySelector("output"), est = bl.querySelector(".estado"), im = bl.querySelector(".escala-img");
    const umbral = +r.dataset.umbral;
    const act = () => {{
      const v = +r.value, red = v < umbral;
      im.style.height = v + "px";
      im.src = red ? r.dataset.reducido : r.dataset.normal;
      o.textContent = v + " px";
      est.textContent = red ? "Versión reducida" : "Versión completa";
    }};
    r.addEventListener("input", act); act();
  }});
}})();
</script>
</body>
</html>
'''

(AQUI / "navegable.html").write_text(HTML, encoding="utf-8")
print(f"navegable.html: {len(HTML) / 1024:.0f} KB")
