Lenguaje visual para la presentación de Cartocor de este año. Toma la **estética** del institucional 2026 (blanco limpio, Raleway, azul tinta, manchas arena, títulos en pill dibujada a mano, fotos de bosque) y la aplica a los **módulos** de la plantilla 2025 (portada, contenido, separadores, ficha por unidad, barras, donuts, timeline, tres columnas, burbujas, resumen de performance, cierre).

## Principios

1. **El papel es blanco.** Las diapositivas de contenido van sobre `papel`. El color aparece en manchas `arena`, en círculos y en barras, nunca como fondo plano de una diapositiva de contenido.
2. **Lo dibujado a mano es la firma.** Pills de título con doble trazo, la caja abierta en línea, elipses y notas con contorno irregular. Todo lo demás es geométrico y limpio.
3. **Cada unidad tiene un color y siempre el mismo.** Corrugado verde, Papel amarillo (kraft ocre), Flexibles azul, Bolsas violeta. El color dice de qué negocio se habla antes que el texto.
4. **El bosque abre y cierra.** Portada, contenido, sostenibilidad y cierre usan fotos de plantación propia. Las fotos de planta industrial van en separadores y fondos.
5. **Pocas palabras, cifras grandes.** Un título, un párrafo de 4 líneas como máximo, y datos en notas, barras o burbujas.

## Formato de la diapositiva

- 16:9 panorámico de PowerPoint: 13,333 × 7,5 in (960 × 540 pt). Todas las medidas de este sistema están en px de ese lienzo (1 px = 1 pt).
- Margen exterior `margen` (40 pt). Separación entre bloques `paso-l` (32), entre elementos hermanos `paso-m` (20), ícono-rótulo `paso-s` (10).
- El institucional 2026 se armó en un lienzo personalizado de 1583 × 891 pt. Para el deck nuevo usar el estándar panorámico: escala bien a cualquier proyector y a PDF.

## Color

| Rol | Token | Uso |
|---|---|---|
| Texto y títulos | `tinta` #1F497D | Todo el texto sobre `papel` y `arena`. |
| Trazo secundario | `tinta-profunda` #17375E | Segundo trazo de pills y elipses. |
| Rótulos | `gris-etiqueta` #7F7F7F | Rótulos bajo íconos y títulos de tabla, 18 px o más. |
| Fondo | `papel` #FFFFFF | Fondo de contenido. |
| Mancha | `arena` #F4F0ED | Pills, notas, manchas, paneles. |
| Acento | `acento` #F79646 | Solo la palabra clave dentro de una nota KPI. |
| Corrugado | `corrugado` #99D25C · `corrugado-oscuro` #5CAD3F | Unidad Corrugado / Cartocor. El oscuro para totales y cifras. |
| Papel | `papel-reciclado` #EAC53A · `kraft` #BF8527 | Papel reciclado y papel kraft (Papel Misionero). |
| Flexibles | `flexible` #407BC7 | Converflex. |
| Bolsas | `bolsas` #776496 | Bolsas industriales (Puntapel, Zucamor). |
| Transversal | `celeste` #9EBFDE | Separadores de temas corporativos (RR. HH., automatización). |

- Los colores `marca-*` son solo para las fichas de marca; no se usan como colores de unidad.
- `velo-bosque` y `vidrio` son capas translúcidas sobre foto.
- Contraste: el texto sobre `corrugado` y `papel-reciclado` es bajo. Ahí usar `tinta`, o `papel` en semibold de 19 pt o más (así lo usa el original en las barras de ventas).

## Tipografía

| Familia | Token | En PowerPoint | Para qué |
|---|---|---|---|
| Raleway | `texto` | Raleway (Google Fonts, instalar en todas las PC que proyecten) | Títulos, cuerpo, rótulos. Es la tipografía del deck. |
| Bahnschrift | `cifras` | Bahnschrift (viene con Windows 10/11) | Tablas, barras y cifras grandes. En Mac reemplazar por DIN Alternate. |
| Om Telolet Om | `manuscrita` | Om Telolet Om (fuente libre, la de la plantilla 2025) | Solo separadores de sección, "Contenido" y la diapositiva de sostenibilidad. |

- Títulos de diapositiva en `titulo-pill` (una palabra, mayúsculas) o `titulo-pill-mixto`: contexto en Light mayúsculas y palabra clave en Bold ("PACKAGING **Highlights**", "OUR **Solutions**", "AUTOMATION **Solutions**"). Es el patrón tipográfico central del 2026.
- Cuerpo en `cuerpo` (15 pt), centrado cuando va bajo una pill y alineado a la izquierda en paneles. Nombres de marca en Bold.
- Cifras en `cifra-grande` o `cifra-tabla`, con números tabulares.
- La manuscrita no se usa nunca en datos ni en párrafos. En 2025 era la voz principal; en 2026 queda como acento.
- Las vistas previas web cargan Barlow y Amatic SC como sustitutos de Bahnschrift y Om Telolet Om.

## Formas

- **Pill dibujada** (`TituloPill`): relleno `arena`, dos contornos en `tinta`/`tinta-profunda` de 1,2–1,5 pt girados ±1°, caja abierta en línea superpuesta a la izquierda.
- **Nota KPI** (`NotasKpi`): pill `arena` con un contorno `acento` irregular.
- **Mancha arena**: forma orgánica de bordes redondeados detrás de fotos, tablas y collages. Nunca un rectángulo con esquinas rectas.
- **Círculos**: fotos circulares, círculos de ícono, burbujas de dato y el gran círculo de color de los separadores.
- **Curvas**: corte ondulado de las fotos verticales con una línea paralela en `corrugado`; línea curva blanca de 1,4 pt sobre fotos de portada y separadores.
- **Esquina doblada**: solo en la portada, abajo a la derecha.
- Radios: `radio-pill` para pills y barras, `radio-panel` (28) para paneles, `radio-ficha` (12) para fichas de marca, `radio-circulo` para todo lo circular.
- Sombra: solo `sombra-producto` en productos recortados y collages, y `sombra-panel` en paneles de vidrio. Los títulos y las notas no llevan sombra.

## Iconografía

Íconos de línea (trazo de 2,2 sobre una grilla de 48) dentro de un círculo del color de la unidad: caja (Corrugado), envase doypack (Flexibles), hoja con esquina doblada (Papel reciclado y Kraft), bolsa con etiqueta (Bolsas). Ver `IconosNegocio`. No se usan emojis ni íconos rellenos. Los íconos de este sistema son redibujos simplificados de los del deck 2026: para el archivo final conviene exportar los originales desde el .pptx fuente.

## Fotografía

- Bosque y plantación propia: portada, contenido, sostenibilidad, cierre. Luz natural, verdes cálidos.
- Planta industrial (onduladora, bobinas, máquinas): separadores de sección y fondos desenfocados (`foto-borrosa` + velo blanco al 55 %).
- Producto: recortado sin fondo, con `sombra-producto`, agrupado sobre una mancha `arena` o en góndola.
- Fotos de clientes o marcas de terceros solo con autorización comercial.

## Tono y textos

- Un idioma por deck: el institucional 2026 está en inglés y la plantilla 2025 en español. No mezclar.
- Títulos cortos en mayúsculas con la palabra clave en Bold. Frases afirmativas en primera persona del plural ("Nuestro negocio de Packaging desarrolla soluciones…").
- Cifras siempre con unidad: m², KTn, MMU$S, hectáreas. En español: punto de miles y coma decimal (15.000; 6,2 M). En inglés: coma de miles (15,000).
- Años con su estado: 2025, 2026(e) estimado, 2026(P) proyectado.

## Cómo pasar cada módulo de 2025 a la estética 2026

| Módulo 2025 | Qué se mantiene | Qué cambia con 2026 |
|---|---|---|
| Portada | Foto de bosque, logo blanco, línea curva | Título en Raleway Bold mayúsculas + subtítulo Light + año; esquina doblada |
| Contenido | Foto de plantación, lista numerada, círculos de marcas | Velo azul tinta para legibilidad |
| Estrategia / separadores "PRUEBA 2025" | Gran círculo de color en la esquina, manuscrita | Círculo en el color de la unidad; ícono de línea |
| Tema 2 – Cartón (barras) | Barras de color por unidad | Tabla completa con total y desglose sobre mancha arena |
| Timeline 2025 → 2026 | Arcos punteados y burbujas | Burbujas arena, cifras en Bahnschrift |
| Tres columnas "Prueba Texto" | Encabezado en círculo dibujado | Elipse con doble trazo; paneles arena en lugar de grises |
| Texto 1 / Texto 2 (burbujas) | Burbujas de cifras + foto | Burbujas arena, color por unidad |
| Unidad de negocio | Cuarto de círculo de color, logo, sello circular, collage | Collage sobre mancha arena con sombra de producto |
| Donuts | Tres anillos negocio / terceros | Panel arena, centro con total |
| Resumen performance | Cuatro fichas sobre vidrio | Fichas en colores de unidad, cifras en Bahnschrift |
| Panel + pill | Paneles blancos sobre foto desenfocada | El título pasa a `TituloPill` |
| Cierre | Bosque, logo, QR | Recuadro translúcido `velo-bosque` con "¡Gracias!" |

El mapa de plantas por provincia (2025, "Ver / Ver") se mantiene como imagen: usar el mapa original y cambiar los rótulos a Raleway `tinta` con puntos en el color de cada unidad.

## Configuración del tema en PowerPoint

Crear un tema nuevo (Diseño › Variantes › Colores › Personalizar colores) con estos valores, para que gráficos y tablas tomen la paleta solos:

| Ranura de Office | Valor | Token |
|---|---|---|
| Texto/fondo oscuro 1 | #1F497D | `tinta` |
| Texto/fondo claro 1 | #FFFFFF | `papel` |
| Texto/fondo oscuro 2 | #17375E | `tinta-profunda` |
| Texto/fondo claro 2 | #F4F0ED | `arena` |
| Énfasis 1 | #99D25C | `corrugado` |
| Énfasis 2 | #EAC53A | `papel-reciclado` |
| Énfasis 3 | #407BC7 | `flexible` |
| Énfasis 4 | #776496 | `bolsas` |
| Énfasis 5 | #BF8527 | `kraft` |
| Énfasis 6 | #F79646 | `acento` |
| Hipervínculo / visitado | #407BC7 / #776496 | |

Fuentes del tema: Títulos Raleway, Cuerpo Raleway.

Diseños del patrón de diapositivas (uno por módulo): Portada · Contenido · Separador (×5 colores) · Presentación de negocio · Título + contenido (con `TituloPill`) · Datos (tabla sin pill) · Tres columnas · Unidad de negocio (×4 colores) · Cierre. La pill dibujada y la caja se guardan agrupadas en el patrón, no como imagen.
