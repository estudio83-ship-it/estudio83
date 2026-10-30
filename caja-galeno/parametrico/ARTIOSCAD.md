# Galeno paramétrico · troquel 6463 → ArtiosCAD

Generador paramétrico de la caja tipo galeno (troquel 6463) con su interior para frascos, y la receta para rearmarla como diseño paramétrico nativo de ArtiosCAD.

## Qué hay acá

| Archivo | Para qué |
|---|---|
| `galeno.mjs` | El modelo: `generate(params)` arma el troquel completo; `toDxf` y `toCf2` lo exportan. |
| `plantilla-caja.json` | Las líneas y curvas del troquel 6463 original, que el modelo estira por zonas. |
| `generar.mjs` | Línea de comandos: escribe `.dxf` y `.cf2` con los parámetros que le pases. |
| `guia-artioscad.html` | Página para abrir en el navegador: variables, plano con fórmulas en vivo, descarga DXF/CF2. La escribe `guia.mjs` con la plantilla de `../../troqueles/`. |
| `diseno.mjs` | El galeno como diseño de la plantilla: textos, cotas de la vista simple, notas del plano, resumen y nombre de archivo. |
| `formulas.mjs` | Las fórmulas de cada cota; `guia.mjs` verifica que coincidan con la geometría. |
| `check.mjs` | Con la verificación común de `../../troqueles/verificar.mjs`, verifica que con los valores por defecto sale el troquel original (32 paneles y solapas) y que ninguna combinación deje líneas sueltas, cruzadas o superpuestas. |

```bash
node generar.mjs --Lb 356
node generar.mjs --L 400 --A 110 --H 300 --n 4 --Dc 70 --Dn 28 --p 72 --nombre GALENO-4F
node guia.mjs
node check.mjs   # 410 combinaciones: sin líneas sueltas, cruces ni superposiciones
```

## Abrirlo en ArtiosCAD

**DXF** (recomendado). Abrí el `.dxf` y, en las opciones de conversión DXF, asigná por capa:

| Capa | Color | Tipo de línea en ArtiosCAD |
|---|---|---|
| `CORTE` | 1 rojo | Corte (2 pt) |
| `HENDIDO` | 2 amarillo | Hendido (2 pt) |
| `PERFORADO` | 6 magenta | Perforado intermitente 5×5 |
| `COTAS` | 5 azul | Anotación (o no importar) |

Guardá esa tabla de conversión para reutilizarla con cada variante. Unidades: mm. Se troquela de dorso.

**CF2**. Se abre directo: cada línea trae su tipo (1 corte, 2 hendido, 3 perforado) y pointage 2 pt. Verificá en la primera importación que el tipo 3 se convierta al perforado 5×5 de tu biblioteca; si tu configuración usa otro código, cambialo en `toCf2` (`const type`).

## Variables

El troquel sale con la caja girada 90° a la derecha (tubo vertical) y el separador a su derecha, a 8 mm, con el largo vertical. El DXF lleva las líneas del troquel y sólo las cotas H y L (`--todas-las-cotas` para el resto).


| Grupo | Var | Qué es | Original |
|---|---|---|---|
| Botella | `Lb` | Largo de la botella (va acostada a lo largo de la caja) | 306 |
| Botella | `Dc` | ⌀ del cuerpo: agujero del tabique (hasta 100, y hasta A − 2e − 4 y H − 2e − 6) | 80 |
| Botella | `Dn` | ⌀ del cuello: ranura del tabique | 31 |
| Botella | `n` | Cantidad de botellas (hasta 6) | 3 |
| Botella | `p` | Paso entre ejes de botellas | 86 (el 6463 tiene 86,25) |
| Caja | `A` | Profundidad: ancho de los costados | 94 |
| Caja | `H` | Alto del frente entre hendidos (largo del tubo); sale de las botellas, se puede corregir | 274 |
| Caja | `t` | Puente de los tabiques | 28 |
| Cartón | `e` | Espesor: onda E 2 · B 3 · C 4 (el 6463 es onda B) | 3 |

El largo de la caja sale de la botella: `L = Lb + 3e + 5` (entra en el separador plegado, `L − 3e`, con 5 mm de juego). Con la botella del 6463 y onda B, L = 320.

El ancho también sale de las botellas: `H = n·p + 2e + 10`, redondeado al milímetro (10 es el juego lateral). Al cambiar `n` o `p` en la página, H se recalcula; después se puede ajustar a mano. En `generar.mjs`, si pasás `--n` o `--p` sin `--H`, H se calcula igual.

Derivadas: el separador plegado ocupa `L − 3e` de largo (si crece `t`, se achica el panel central `L − 3e − 2t`, la caja no cambia); frasco hasta `L − 3e − 5`; interior de `H − 2e` de ancho por `4A + L − 11e` de largo.

Todas las variables y medidas se manejan en milímetros enteros; las cotas del plano y del DXF se redondean al milímetro.

## Fórmulas para rearmarlo como paramétrico nativo

Si querés el diseño paramétrico dentro de ArtiosCAD (que el operador cambie L, A, H desde el catálogo de estándares), dibujalo en un diseño con variables `L`, `A`, `H` y acotá cada línea con estas fórmulas. Las compensaciones de espesor son las del 6463 (onda B, `e` = 3) escaladas por `e/3`: con onda E o C se recalculan solas.

### Tubo (de izquierda a derecha)

| Panel | Ancho |
|---|---|
| Costado exterior | `A` |
| Frente | `L + e` |
| Costado | `A` |
| Contrafrente | `L` |
| Solapa de pegado | `A − e` |

Alto de cada panel entre hendidos de cierre, referido al hendido inferior del contrafrente (0):

| Panel | Hendido inferior | Hendido superior | Alto |
|---|---|---|---|
| Contrafrente | 0 | `H + 22e/3` | `H + 22e/3` |
| Frente | `11e/3` | `H + 11e/3` | `H` |
| Costado exterior | `e` | `H + 19e/3` | `H + 16e/3` |
| Costado | `1,5e` | `H + 17,5e/3` | `H + 13e/3` |
| Solapa de pegado | `7e/3` | `H + 15e/3` | `H + 8e/3` |

### Cierres (iguales arriba y abajo)

| Pieza | Medida |
|---|---|
| Tapa (sobre el contrafrente) | `A` de profundo, ancho `L` |
| Pestaña de pared doble | `10e/3` de profundo |
| Lengüeta | `A − 4e/3` de profundo, ancho `L − 17`, diente central de 85 × 5 |
| Ranura de traba en el contrafrente | 86,5 × `10e/3`, centrada, pegada al hendido de la tapa |
| Contratapa (sobre el frente) | `A − 2e` de profundo; tramo recto `L − 135,3`; esquinas R30 y lados inclinados hasta el hendido |
| Guardapolvo del costado | `A + 26` de largo |
| Guardapolvo de la solapa de pegado | `A + 28,5` de largo |
| Oreja del costado exterior | la curva del 6463 escalada por `A / 94` (radios 134,8 · 101,04 · 16,78 × `A/94`) |

### Interior (pieza aparte, a 8 mm del tubo)

Ancho `Wi = H − 2e`. Filas desde el borde inferior:

| Fila | Alto | Línea superior |
|---|---|---|
| Pared exterior B | `A − 2e` | hendido |
| Puente B | `t` | hendido |
| Tabique B | `A − 2e` | intermitente 5×5 |
| Panel central | `L − 3e − 2t` | intermitente 5×5 |
| Tabique A | `A − 2e` | hendido |
| Puente A | `t` | hendido |
| Pared exterior A | `A − 2e` | borde |

Frascos en `Wi/2 + (i − (n−1)/2)·p`, alternados: los pares apoyan el cuerpo en el tabique A y el cuello en el B; los impares al revés.

- **Agujero del cuerpo:** círculo `Dc` centrado en el tabique; lengüeta de 33 de ancho que queda unida al panel central (sin intermitente en ese tramo) y llega hasta 13 antes del centro; muesca de 25 desde el círculo hasta el hendido del puente, cortada sobre el hendido.
- **Ranura del cuello:** fondo semicircular `Dn/2` en el centro del tabique; lados rectos hasta 23,8 antes del hendido; ensancha a 40 en el hendido y sigue abierta a 40 por todo el puente hasta el hendido siguiente, donde cierra con un corte.
- **Muesca de borde:** 35 × 4 en el borde de la pared exterior, del lado donde apoya el cuerpo.

## Límites

- El `.ARD` de ArtiosCAD es un formato cerrado: no se puede generar un paramétrico nativo desde afuera. El DXF/CF2 trae la geometría exacta para cada juego de variables; las fórmulas de arriba son para rearmarlo como paramétrico dentro de ArtiosCAD.
- Las compensaciones de espesor salen del 6463 (onda B) escaladas por `e/3`. Los espesores por onda (E 2 · B 3 · C 4) son de referencia: usá los de tu cartonera.
- La variante +50 que hizo `estirar.mjs` corría la ranura de traba y el diente 50 mm juntos (quedaban alineados pero 28,5 mm fuera del centro del contrafrente). Este generador reparte el estiramiento a ambos lados de la traba, así que con `--L 370` queda centrada.
