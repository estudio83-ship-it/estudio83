---
name: troquel-parametrico
description: >-
  Convierte un troquel de cartón (un DXF, un plano o la descripción de una caja) en un diseño paramétrico
  con su página interactiva para ArtiosCAD, usando la plantilla de troqueles/ del repositorio: variables con
  deslizadores, plano con cotas y fórmulas, resumen y descargas DXF/CF2. Usala cuando pidan hacer
  paramétrica una caja o un troquel, "otra como la caja galeno", sumar un diseño nuevo a la plantilla,
  o cambiar algo de la página de un troquel paramétrico.
---

# Troquel paramétrico

La plantilla vive en `troqueles/` (leé `troqueles/LEEME.md` antes de empezar: ahí está el contrato del
diseño). Hay dos diseños hechos para mirar: `troqueles/ejemplo-caja-americana/` (chico, el molde a copiar)
`caja-galeno/parametrico/` (completo, armado desde el DXF del troquel 6463) y `caja-fefco-201/`
(caja FEFCO 0201 dibujada desde cero, con dibujos de la caja y del cartón en el panel).

## Pasos

1. **Entender el troquel.** Si hay DXF, leelo con `readDxf` y `facesOf` de `caja-galeno/troquel.mjs`
   (colores 1 corte, 2 hendido, 6 intermitente) y contá paneles y solapas. Identificá qué medidas son
   variables (largo, ancho, alto, espesor, y las del producto que va adentro).
2. **Crear la carpeta del diseño** copiando `troqueles/ejemplo-caja-americana/` (`diseno.mjs`,
   `pagina.mjs`, `check.mjs`).
3. **Escribir `generate`.** Estirando las líneas del original por zonas o dibujando desde cero. Con los
   valores por defecto tiene que salir el troquel original (mismas piezas). Sin extremos sueltos, cruces
   ni superposiciones.
4. **Cotas y fórmulas.** Una cota por medida que el usuario reconoce, con su fórmula en `formulas`; en
   `simple` sólo las de las variables y los totales de la plancha.
5. **Verificar.** `node check.mjs` (cientos de combinaciones sin problemas) y `node pagina.mjs` (falla si
   una fórmula no coincide con el plano). Mirá la página con Playwright: vista simple, con fórmulas, y
   arrastrando un deslizador (la cota en naranja).
6. **Publicar** con `node pagina.mjs --out <scratchpad>/<nombre>.html` (con `--proteger` si lleva clave) y la herramienta
   Artifact con el permiso `downloads`. Si ya hay un artefacto de ese diseño, actualizalo por su URL.

## Lo que el usuario ya pidió (respetarlo en todos los diseños)

- Todo en español rioplatense. Medidas en mm enteros, sin decimales.
- Variables del producto primero (por ejemplo, Botella), después Caja y Cartón; títulos de grupo en negrita.
- Espesor por onda: E 2 mm, B 3 mm, C 4 mm.
- Deslizadores que arrancan en el medio; botones y campos tipo pastilla; Reset en naranja.
- Descargas DXF y CF2 en azul, sin zip. El DXF lleva sólo las líneas y las cotas principales.
- Plano simple al abrir; fórmulas sólo con el botón "Ver fórmulas".
- Cartón pintado en blanco; la variable que se toca y sus cotas en naranja fuerte y más gruesas;
  fundido de 1,5 s al soltar.
- Resumen ordenado y sin texto de sobra; tarjetas de igual alto.
- Tamaños fijos: Variables, Plano y Resumen no se mueven al cambiar valores. Nada entre Reset y las descargas.
- En notebook (1536 × 730, una T14 con escala 125 %) todo entra en una pantalla, sin desplazarse.
- Sin logos ni marcas de terceros en lo que se publica.
- Si piden clave, generar con `--proteger` y la clave en `TROQUEL_CLAVE` (nunca en el repositorio).
- Si una medida depende de otra (por ejemplo, el ancho de la cantidad de botellas), que se ajuste sola con
  `enlazar`, y que se pueda corregir a mano.
