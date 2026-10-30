# Plantilla de troqueles paramétricos

Todo lo que tiene la página de la Caja tipo Galeno, listo para usar con cualquier otro troquel. Cada diseño pone su geometría y sus textos; la plantilla pone la página, la salida para ArtiosCAD y las verificaciones.

| Archivo | Para qué |
|---|---|
| `pagina.mjs` | `armarPagina(...)`: arma el HTML interactivo de un diseño (variables, plano, resumen, descargas). |
| `cad.mjs` | `escribirDxf` y `escribirCf2` (capas CORTE / HENDIDO / PERFORADO / COTAS, las cotas en blanco), `limitesDe`, `mmEntero`. |
| `carton.mjs` | Encuentra las superficies de cartón del troquel para pintarlas en el plano. |
| `proteger.mjs` | `protegerPagina(html, clave)`: encripta la página; sin la clave no se puede abrir ni leer. |
| `verificar.mjs` | `verificarDiseno(...)`: prueba cientos de combinaciones de medidas: sin líneas sueltas, cruzadas ni superpuestas. |
| `ejemplo-caja-americana/` | Un diseño completo y chico (caja americana) para copiar como punto de partida. |

Diseños hechos con la plantilla: `ejemplo-caja-americana/` y `../caja-galeno/parametrico/` (la Caja tipo Galeno).

## Lo que trae cada página

- Variables agrupadas (en negrita), con número y deslizador; los deslizadores arrancan en el medio. Todo en milímetros enteros.
- Botones rápidos de una variable (la onda del cartón: E 2, B 3, C 4) y Reset en naranja.
- Plano con el cartón en blanco, cortes, hendidos e intermitentes. Arranca simple (sólo las cotas de las variables, con su letra) y el botón "Ver fórmulas" muestra cada cota como fórmula = valor.
- Mientras se toca una variable, ella y sus cotas se marcan en naranja fuerte; al soltar vuelve con un fundido de 1,5 s.
- Resumen de cinco tarjetas.
- Descargas DXF y CF2 en azul, sin zip. El DXF lleva sólo las líneas y las cotas que el diseño elija.
- Tamaños fijos: Variables, Plano y Resumen no cambian de tamaño al mover nada; el dibujo se escala adentro.
- Nada aparece entre Reset y las descargas.

## Proteger una página con clave

```bash
TROQUEL_CLAVE='la-clave' node caja-galeno/parametrico/guia.mjs --proteger --out caja-galeno.html
```

La página sale encriptada (AES-GCM 256, clave derivada con PBKDF2-SHA256 de 600 000 vueltas): muestra sólo el título y un campo para la clave, y sin ella el diseño, el generador y las fórmulas son ilegibles. Para cambiar la clave se vuelve a generar con la nueva y se reemplaza el archivo publicado: la versión nueva no abre con la clave vieja. Las copias que alguien ya tenga guardadas siguen abriendo con la clave vieja (un archivo que ya se entregó no se puede revocar). La clave nunca va al repositorio.

## Hacer un diseño nuevo

1. Copiá `ejemplo-caja-americana/` con otro nombre (o creá la carpeta del diseño donde quieras).
2. En `diseno.mjs`, `crearDiseno()` devuelve el diseño. Campos:

| Campo | Qué es |
|---|---|
| `titulo`, `bajada` | Título grande y la línea de arriba. |
| `PARAMS` | `[{ key, group, label, min, max, step, oculto }]`, en el orden del panel; `group` arma los recuadros. `oculto: true` para una variable que sólo se elige con atajos (sin fila). |
| `DEFAULTS` | Valor inicial de cada variable (el del troquel original). |
| `generate(state)` | Devuelve el modelo: `{ P, entities, dims, info: { bounds } }` (ver abajo). |
| `limits(P)` | Opcional. Rangos que dependen de otras medidas: `{ key: [min, max] }`. |
| `enlazar(state, key)` | Opcional. Variables que siguen a otra: devuelve `{ H: ... }` cuando cambia `key`. |
| `atajos` | Opcional. `{ titulo, key, opciones: [[nombre, valor], ...], unidad }`, o una lista de esos; los botones muestran sólo el nombre y van en el recuadro del grupo de su variable. |
| `inactiva(P, key)` | Opcional. `true` si la variable no se usa con estos valores: su fila queda atenuada y bloqueada (sin cambiar el tamaño del panel). |
| `figuras` | Opcional. `{ grupo: (P) => svg }`: un dibujo debajo del título del grupo, redibujado con cada cambio. Las cotas del dibujo llevan `class="cota" data-var="clave"` para marcarse en naranja con su variable. El alto del SVG tiene que ser fijo. |
| `campos` | Opcional. `{ grupo: (P) => ({ clave: [x, y] }) }`: esas variables se escriben sobre su cota en el dibujo del grupo (en unidades del viewBox), sin fila ni deslizador. |
| `estilos` | Opcional. CSS propio del diseño (los colores de sus dibujos). |
| `formulas` | `{ h: { nombre: ["L + e", (P) => P.L + P.e] }, v: { ... } }`: la fórmula de cada cota. |
| `simple` | Cotas de la vista simple: `{ "h:largo": "L", "h:plano total": "" }` (la letra que se muestra). |
| `letras` | Expresión regular con las letras de las variables en las fórmulas. |
| `toca` | `{ variable: [letras] }`: qué cotas se marcan en naranja al tocar cada variable. |
| `llamadas(model)` | Opcional. Notas sobre el plano: `[[punto, texto, visibleEnSimple]]`. |
| `resumen(model)` | Las cinco tarjetas: `[[título, valor, detalle]]`. |
| `archivo(model)` | Nombre de los archivos que se descargan, sin extensión. |
| `dxf(model, nombre)`, `cf2(model, nombre)` | Texto de cada archivo (con `escribirDxf` / `escribirCf2`). |
| `describir(model)` | Descripción del plano para lectores de pantalla. |
| `casosFormulas` | Combinaciones con las que se comprueba que cada fórmula dé lo que mide el plano. |

**Modelo.** `entities`: líneas `{ t: "L", k, a: [x, y], b: [x, y] }` y arcos `{ t: "A", k, c: [x, y], r, a0, a1 }` (grados, antihorario), con `k` = `"c"` corte, `"h"` hendido, `"p"` perforado. Las líneas se tocan sólo en sus extremos o con un extremo sobre otra línea (uniones en T); no se cruzan ni se superponen. `dims`: `{ dir: "h", x0, x1, at, value, src: "h", name }` o `{ dir: "v", y0, y1, at, value, src: "v", name }`; `name` es la clave de `formulas` y de `simple`. Medidas en mm, y hacia arriba.

3. `pagina.mjs` del diseño llama a `armarPagina({ design, fuentes, crear })`; `check.mjs` llama a `verificarDiseno`.

```bash
node troqueles/ejemplo-caja-americana/check.mjs
node troqueles/ejemplo-caja-americana/pagina.mjs
TROQUEL_CLAVE='la-clave' node troqueles/ejemplo-caja-americana/pagina.mjs --proteger --out caja-americana.html
```

La misma página sirve para publicar en claude.ai (las descargas usan el permiso "downloads"; .dxf y .cf2 se guardan con .txt al final) y para abrir en el navegador (descarga directa).

**Reglas de los archivos que van a la página.** Se copian dentro del HTML sin `import` ni `export`, así que: sólo pueden importar de `troqueles/` o de otros archivos que también estén en `fuentes`; y no pueden declarar nombres que ya use la plantilla (`DESIGN`, `PARAMETROS`, `INICIAL`, `state`, `model`, `render`, `planSvg`, `mm`, `f1`, `name`, `say`, `download` y los de `cad.mjs` y `carton.mjs`).

## Partir de un DXF existente

Así se hizo el galeno a partir del troquel 6463 (ver `../caja-galeno/`):

1. Leer el DXF con `readDxf` de `../caja-galeno/troquel.mjs` (capa del troquel; color 1 corte, 2 hendido, 6 intermitente) y encontrar paneles y solapas con `facesOf`.
2. Guardar las líneas como plantilla JSON y soldar los extremos que no cierran (en el 6463 había huecos de 0,06 mm).
3. Escribir `generate` estirando la plantilla por zonas (cada variable mueve las líneas de su lado) o dibujando las piezas desde cero cuando es más simple (así se hizo el separador).
4. Comprobar que con los valores originales salga el mismo troquel (mismas piezas) y correr `verificarDiseno` con cientos de combinaciones.
