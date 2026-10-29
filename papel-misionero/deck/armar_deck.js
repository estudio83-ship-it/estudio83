// Deck de marcas finalistas de Papel Misionero: 3 secciones y una diapositiva por propuesta.
// Uso: node deck/armar_deck.js   →  marcas-finalistas.pptx
const fs = require("fs");
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const { applyTheme } = require("/root/.claude/skills/synced/e9b35989-4a9f-4c50-9016-fd9d1d55533d_95a2d566-ceb3-4477-933e-e0130402a89b/pptx/scripts/apply_theme.js");

const RAIZ = path.join(__dirname, "..");
const SALIDA = path.join(RAIZ, "marcas-finalistas.pptx");

const THEME = {
  name: "Papel Misionero",
  headFontFace: "Arial",
  bodyFontFace: "Arial",
  colors: {
    dk1: "1F3A2B", lt1: "FFFFFF", dk2: "12241A", lt2: "F2EADB",
    accent1: "B98A57", accent2: "B0452B", accent3: "8E6538", accent4: "5E7A66", accent5: "D8CDB9", accent6: "64625A",
    hlink: "B0452B", folHlink: "8E6538",
  },
};

const GRUPOS = [
  { titulo: "La P", claves: ["A1", "A4", "N1", "N3"],
    bajada: "La inicial como contenedor del origen. La P de Papel abraza el árbol, la bobina o la madera: el nombre y el territorio se leen en un mismo signo, propio e imposible de confundir con otras marcas forestales." },
  { titulo: "Sellos y contenedores", claves: ["A3", "A5", "N2", "N4", "N5"],
    bajada: "Formas cerradas que funcionan como garantía de procedencia. Son las más compactas y resistentes: se leen en tamaños mínimos, se estampan sobre kraft y resuelven perfiles digitales sin perder identidad." },
  { titulo: "Árbol solo", claves: ["A2", "P4", "P1", "P2", "P3"],
    bajada: "La silueta como signo. Sin contenedor ni letra, el árbol habla por sí mismo y se integra al logotipo con la mayor simplicidad. El desafío es la especie: araucaria como emblema o pino como materia prima." },
];
const CONCEPTOS = {
  A1: "Una sola línea dibuja la P y abraza a la araucaria, el árbol emblema de Misiones. El ojo de la letra se cierra sobre el tronco: marca y territorio en un mismo gesto. Liviana y elegante para la comunicación institucional.",
  A4: "La P de cuerpo pleno recorta la araucaria en negativo. Máxima pregnancia y resistencia en impresión flexográfica: funciona como sello sobre bolsas y bobinas.",
  N1: "El pliego se enrolla como una bobina y baja para formar la P. Habla del producto, el papel en movimiento, con un único trazo continuo, simple y memorable.",
  N3: "El ojo de la P es un corte de tronco: los anillos de crecimiento cuentan tiempo, madera y origen. Une la inicial con la materia prima.",
  A3: "La araucaria se recorta dentro de un arco, como una ventana a la selva. Compacta y legible a 16 px: la mejor versión para aplicaciones pequeñas.",
  A5: "El árbol calado en un círculo: un sello de procedencia, directo y versátil, pensado para estamparse sobre kraft.",
  N2: "Los anillos de crecimiento de un tronco real, levemente descentrados. Un símbolo abstracto y propio de la industria forestal, sin recurrir al dibujo del árbol.",
  N4: "El pino, la especie que se cultiva y se transforma en papel, en el corazón del tronco. Cuenta el ciclo completo: bosque, madera y fibra.",
  N5: "La misma construcción con la araucaria: el corte de la madera protege al árbol nativo, un mensaje de conservación de la selva paranaense.",
  A2: "La silueta inconfundible del pino Paraná: copa plana en capas y fuste alto. Reconocida en todo el litoral como símbolo misionero.",
  P4: "Versión vertical y estilizada de la araucaria, de trazo afinado. Liviana y elegante junto al logotipo.",
  P1: "El pino elliottii y taeda, materia prima de la compañía, dibujado con ramas que se afinan. Honestidad de origen: el árbol que se planta es el árbol que se muestra.",
  P2: "Más ramas y copa más ancha: mayor presencia y mejor equilibrio con el peso del logotipo en bold.",
  P3: "Trazos robustos pensados para la impresión en bolsas y los tamaños mínimos. La versión de mayor resistencia técnica.",
};
const PATRONES = [
  ["Pino de pisos", "Triángulos o chevrones apilados, solos o en círculo.", "Muy alta", "Genérico: se pierde entre cientos de marcas."],
  ["Letra con árbol", "El pino se recorta dentro de una inicial.", "Alta", "Recurso fuerte si la letra es propia: la P."],
  ["Líneas paralelas", "El árbol se dibuja con trazos o hebras.", "Media", "Elegante, pero se empasta en tamaños chicos."],
  ["Insignia vintage", "Escudos y grabados con estética de cabaña.", "Media", "Ajena a una industria papelera moderna."],
  ["Árbol orgánico", "Copas redondeadas y ramas de trazo afinado.", "Alta", "Calidez y oficio; el tono que adoptamos."],
  ["Piña y anillos", "La semilla o el corte del tronco como signo.", "Baja", "Espacio poco explorado: territorio propio."],
];
const NOMBRES = {
  A1: "P monolínea con araucaria", A2: "Araucaria de ramas", A3: "Araucaria en arco", A4: "P con araucaria calada", A5: "Araucaria en sello",
  N1: "P espiral", N2: "Corte del tronco", N3: "P de anillos", N4: "Sello: anillos y pino", N5: "Sello: anillos y araucaria",
  P1: "Pino", P2: "Pino pleno", P3: "Trazo pesado", P4: "Araucaria",
};

async function png(nombre) {
  const svg = fs.readFileSync(path.join(RAIZ, "svg", `${nombre}.svg`), "utf8");
  const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  const buf = await sharp(Buffer.from(svg), { density: 600 }).resize({ width: 2000 }).png().toBuffer();
  return { data: "image/png;base64," + buf.toString("base64"), ratio: h / w };
}

(async () => {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pres.title = "Papel Misionero · marcas finalistas";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "PORTADA",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.4, w: 11.7, h: 1.6, fontSize: 48, bold: true, color: C.background2, valign: "bottom", margin: 0, align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.15, w: 11.7, h: 1.0, fontSize: 18, color: C.accent1, valign: "top", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "SECCION",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "num", type: "body", x: 0.8, y: 2.2, w: 6, h: 0.5, fontSize: 14, charSpacing: 4, color: C.accent1, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.8, w: 11.7, h: 1.4, fontSize: 54, bold: true, color: C.background2, valign: "top", margin: 0, align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.3, w: 9.6, h: 1.8, fontSize: 18, color: C.accent5, valign: "top", margin: 0, lineSpacingMultiple: 1.2 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "PROPUESTA",
    background: { color: C.background2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.4, w: 9.5, h: 0.75, fontSize: 30, bold: true, color: C.text1, valign: "middle", margin: 0, align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.5, y: 1.1, w: 9.5, h: 0.4, fontSize: 12, charSpacing: 3, color: C.accent6, valign: "top", margin: 0 }, text: "" } },
      { placeholder: { options: { name: "concepto", type: "body", x: 0.5, y: 1.55, w: 12.3, h: 0.85, fontSize: 15, color: C.text1, valign: "top", margin: 0, lineSpacingMultiple: 1.15 }, text: "" } },
      { text: { text: "PAPEL MISIONERO", options: { x: 0.5, y: 7.0, w: 6, h: 0.3, fontSize: 10, charSpacing: 3, color: C.accent6, margin: 0 } } },
    ],
    slideNumber: { x: 12.3, y: 7.0, w: 0.55, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
  });

  // Portada
  pres.addSection({ title: "Portada" });
  let s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Portada" });
  s.addText("Papel Misionero", { placeholder: "title" });
  s.addText("Marcas finalistas · negativo y una tinta sobre kraft · Helvetica por niveles", { placeholder: "body" });

  // Benchmark
  pres.addSection({ title: "Benchmark" });
  s = pres.addSlide({ masterName: "SECCION", sectionTitle: "Benchmark" });
  s.addText("PUNTO DE PARTIDA", { placeholder: "num" });
  s.addText("Benchmark de categoría", { placeholder: "title" });
  s.addText("Relevamos los tableros de referencia de marcas forestales y de madera. El árbol es el signo más usado de la categoría: diferenciarse exige contarlo desde lo que solo Papel Misionero tiene: la P, el papel y Misiones.", { placeholder: "body" });

  s = pres.addSlide({ masterName: "PROPUESTA", sectionTitle: "Benchmark" });
  s.addText("Seis recursos que se repiten", { placeholder: "title" });
  s.addText("BENCHMARK · RECURSOS DE LA CATEGORÍA", { placeholder: "body" });
  s.addText("Frecuencia estimada sobre el relevamiento de referencias aportadas.", { placeholder: "concepto" });
  PATRONES.forEach(([nombre, desc, frec, lectura], i) => {
    const x = 0.5 + (i % 3) * 4.15, y = 2.3 + Math.floor(i / 3) * 2.3;
    const destacado = i === 4 || i === 5 || i === 1;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.95, h: 2.1, fill: { color: destacado ? C.text1 : C.background1 }, line: { color: destacado ? C.text1 : C.accent5 }, rectRadius: 0.14, objectName: `Recurso ${nombre}` });
    s.addText([
      { text: nombre, options: { fontSize: 20, bold: true, color: destacado ? C.background2 : C.text1, breakLine: true } },
      { text: desc, options: { fontSize: 14, color: destacado ? C.accent5 : C.accent6, breakLine: true } },
      { text: `Frecuencia: ${frec}`, options: { fontSize: 13, bold: true, color: C.accent1, breakLine: true } },
      { text: lectura, options: { fontSize: 14, color: destacado ? C.background2 : C.text1 } },
    ], { x: x + 0.25, y: y + 0.2, w: 3.45, h: 1.7, valign: "top", margin: 0, paraSpaceAfter: 4, isTextBox: true, objectName: `Texto ${nombre}` });
  });

  s = pres.addSlide({ masterName: "PROPUESTA", sectionTitle: "Benchmark" });
  s.addText("Dónde se ubican las propuestas", { placeholder: "title" });
  s.addText("BENCHMARK · MAPA DE POSICIONAMIENTO", { placeholder: "body" });
  s.addText("La mayoría de la categoría se agrupa en lo literal y genérico. Las tres familias de propuestas ocupan el cuadrante propio de Papel Misionero.", { placeholder: "concepto" });
  const mx = 2.3, my = 2.5, mw = 9.4, mh = 4.05;
  s.addShape(pres.shapes.RECTANGLE, { x: mx, y: my, w: mw, h: mh, fill: { color: C.background1 }, line: { color: C.accent5 }, objectName: "Mapa" });
  s.addShape(pres.shapes.LINE, { x: mx + mw / 2, y: my, w: 0, h: mh, line: { color: C.accent5, width: 1 } });
  s.addShape(pres.shapes.LINE, { x: mx, y: my + mh / 2, w: mw, h: 0, line: { color: C.accent5, width: 1 } });
  const eje = (t, o) => s.addText(t, Object.assign({ fontSize: 11, charSpacing: 2, color: C.accent6, margin: 0, isTextBox: true }, o));
  eje("GENÉRICO DE LA CATEGORÍA", { x: mx, y: my + mh + 0.08, w: 3, h: 0.3 });
  eje("PROPIO DE PAPEL MISIONERO", { x: mx + mw - 3, y: my + mh + 0.08, w: 3, h: 0.3, align: "right" });
  eje("ABSTRACTO", { x: mx - 1.6, y: my, w: 1.45, h: 0.3, align: "right" });
  eje("LITERAL", { x: mx - 1.6, y: my + mh - 0.3, w: 1.45, h: 0.3, align: "right" });
  const punto = (t, fx, fy, nuestro) => {
    const d = nuestro ? 0.32 : 0.22, x = mx + mw * fx, y = my + mh * fy;
    s.addShape(pres.shapes.OVAL, { x: x - d / 2, y: y - d / 2, w: d, h: d, fill: { color: nuestro ? C.text1 : C.accent5 }, line: { color: nuestro ? C.text1 : C.accent5 }, objectName: `Punto ${t}` });
    s.addText(t, { x: x + d / 2 + 0.08, y: y - 0.17, w: 3.0, h: 0.36, fontSize: nuestro ? 15 : 13, bold: nuestro, color: nuestro ? C.text1 : C.accent6, margin: 0, isTextBox: true, objectName: `Rótulo ${t}` });
  };
  punto("Pino de pisos", 0.12, 0.84, false);
  punto("Insignia vintage", 0.22, 0.66, false);
  punto("Letra con árbol", 0.36, 0.56, false);
  punto("Líneas paralelas", 0.2, 0.3, false);
  punto("Árbol orgánico", 0.08, 0.5, false);
  punto("Árbol solo", 0.56, 0.72, true);
  punto("Sellos y contenedores", 0.62, 0.36, true);
  punto("La P", 0.78, 0.18, true);

  let n = 0;
  for (const [i, g] of GRUPOS.entries()) {
    pres.addSection({ title: g.titulo });
    s = pres.addSlide({ masterName: "SECCION", sectionTitle: g.titulo });
    s.addText(`SECCIÓN ${i + 1} · ${g.claves.length} PROPUESTAS`, { placeholder: "num" });
    s.addText(g.titulo, { placeholder: "title" });
    s.addText(g.bajada, { placeholder: "body" });

    for (const clave of g.claves) {
      n++;
      s = pres.addSlide({ masterName: "PROPUESTA", sectionTitle: g.titulo });
      s.addText(NOMBRES[clave], { placeholder: "title" });
      s.addText(`${g.titulo.toUpperCase()} · ${clave}`, { placeholder: "body" });
      s.addText(CONCEPTOS[clave], { placeholder: "concepto" });
      const paneles = [
        { x: 0.5, color: C.text1, img: `ID-${clave}-negativo`, rotulo: "NEGATIVO", rotColor: C.accent5 },
        { x: 6.78, color: C.accent1, img: `ID-${clave}-color`, rotulo: "UNA TINTA SOBRE KRAFT", rotColor: C.text2 },
      ];
      for (const p of paneles) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x, y: 2.55, w: 6.05, h: 4.2, fill: { color: p.color }, line: { color: p.color }, rectRadius: 0.18, objectName: `Panel ${p.rotulo.toLowerCase()}` });
        const im = await png(p.img);
        const w = 4.1, h = w * im.ratio;
        s.addImage({ data: im.data, x: p.x + (6.05 - w) / 2, y: 2.55 + (4.2 - h) / 2 - 0.1, w, h, altText: `${NOMBRES[clave]} · ${p.rotulo.toLowerCase()}`, objectName: `Logo ${p.rotulo.toLowerCase()}` });
        s.addText(p.rotulo, { x: p.x + 0.3, y: 6.25, w: 5, h: 0.3, fontSize: 10, charSpacing: 3, color: p.rotColor, margin: 0, isTextBox: true, objectName: "Rótulo" });
      }
      s.addNotes(`${NOMBRES[clave]} (${clave}), sección ${g.titulo}.`);
    }
  }

  // Sistema: paleta, tipografía, reglas y pruebas de color
  pres.addSection({ title: "Sistema" });
  s = pres.addSlide({ masterName: "SECCION", sectionTitle: "Sistema" });
  s.addText("COMÚN A TODAS LAS MARCAS", { placeholder: "num" });
  s.addText("Sistema de identidad", { placeholder: "title" });
  s.addText("Una paleta nacida del paisaje misionero, una tipografía en dos niveles y reglas pensadas para imprimir a una tinta sobre kraft.", { placeholder: "body" });

  s = pres.addSlide({ masterName: "PROPUESTA", sectionTitle: "Sistema" });
  s.addText("Paleta, tipografía y reglas", { placeholder: "title" });
  s.addText("SISTEMA · COMÚN A TODAS LAS MARCAS FINALISTAS", { placeholder: "body" });
  const COLORES = [
    ["Verde selva", "#1F3A2B · tinta principal", C.text1, C.background2],
    ["Kraft", "#B98A57 · soporte y acento", C.accent1, C.text1],
    ["Kraft oscuro", "#8E6538", C.accent3, C.background2],
    ["Tierra colorada", "#B0452B · acento", C.accent2, C.background2],
    ["Papel crudo", "#F2EADB · fondo", C.background2, C.text1],
  ];
  COLORES.forEach(([nombre, dato, fondo, tinta], i) => {
    const x = 0.5 + i * 2.5;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.75, w: 2.3, h: 2.3, fill: { color: fondo }, line: { color: i === 4 ? C.accent5 : fondo }, rectRadius: 0.12, objectName: `Color ${nombre}` });
    s.addText([{ text: nombre, options: { fontSize: 16, bold: true, breakLine: true } }, { text: dato, options: { fontSize: 12 } }],
      { x: x + 0.2, y: 3.15, w: 1.95, h: 0.75, color: tinta, valign: "bottom", margin: 0, isTextBox: true, objectName: `Dato ${nombre}` });
  });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.5, y: 4.3, w: 7.0, h: 2.45, fill: { color: C.background1 }, line: { color: C.background1 }, rectRadius: 0.12, objectName: "Tipografía" });
  s.addText([
    { text: "PAPEL", options: { fontSize: 16, charSpacing: 10, breakLine: true } },
    { text: "misionero", options: { fontSize: 66, bold: true, charSpacing: -2, breakLine: true } },
    { text: "Helvetica Regular espaciada + Helvetica Bold apretada. Dos niveles: el origen manda.", options: { fontSize: 12, color: C.accent6 } },
  ], { x: 0.85, y: 4.45, w: 6.4, h: 2.15, color: C.text1, valign: "middle", margin: 0, isTextBox: true, objectName: "Muestra tipográfica" });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 7.7, y: 4.3, w: 5.13, h: 2.45, fill: { color: C.background1 }, line: { color: C.background1 }, rectRadius: 0.12, objectName: "Reglas" });
  s.addText([
    { text: "Reglas", options: { fontSize: 16, bold: true, breakLine: true } },
    ...["Una sola tinta: verde selva, o kraft y crudo en negativo.", "Calado mínimo de 5 unidades para flexografía.", "Isotipo a 1,3 veces la altura del bloque de texto.", "Margen de respeto: la altura de «PAPEL» alrededor.", "Tamaño mínimo del isotipo: 16 px / 6 mm."]
      .map((t, i, a) => ({ text: t, options: { fontSize: 14, bullet: true, breakLine: i < a.length - 1 } })),
  ], { x: 8.0, y: 4.5, w: 4.6, h: 2.1, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 4, isTextBox: true, objectName: "Lista de reglas" });

  s = pres.addSlide({ masterName: "PROPUESTA", sectionTitle: "Sistema" });
  s.addText("Pruebas de color", { placeholder: "title" });
  s.addText("SISTEMA · ARAUCARIA DE RAMAS (A2)", { placeholder: "body" });
  s.addText("La misma marca en las combinaciones de la paleta: todas funcionan a una o dos tintas y conservan el contraste.", { placeholder: "concepto" });
  const PRUEBAS = [
    [C.text1, "Verde selva · kraft y crudo", C.accent5], [C.accent1, "Kraft · verde selva", C.text2], [C.background2, "Papel crudo · verde selva", C.accent6],
    [C.accent2, "Tierra colorada · crudo", C.background2], [C.accent3, "Kraft oscuro · crudo", C.background2], [C.background2, "Papel crudo · tierra y verde", C.accent6],
  ];
  for (const [i, [fondo, rotulo, rot]] of PRUEBAS.entries()) {
    const x = 0.5 + (i % 3) * 4.15, y = 2.3 + Math.floor(i / 3) * 2.3;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.95, h: 2.1, fill: { color: fondo }, line: { color: i === 2 || i === 5 ? C.accent5 : fondo }, rectRadius: 0.12, objectName: `Prueba ${rotulo}` });
    const im = await png(`COLOR-A2-${i + 1}`);
    const w = 2.9, h = w * im.ratio;
    s.addImage({ data: im.data, x: x + (3.95 - w) / 2, y: y + (2.1 - h) / 2 - 0.12, w, h, altText: `Araucaria de ramas · ${rotulo}`, objectName: `Logo ${rotulo}` });
    s.addText(rotulo.toUpperCase(), { x: x + 0.2, y: y + 1.72, w: 3.6, h: 0.25, fontSize: 10, charSpacing: 2, color: rot, margin: 0, isTextBox: true, objectName: "Rótulo" });
  }

  await pres.writeFile({ fileName: SALIDA });
  await applyTheme(SALIDA, THEME);
  console.log(`${SALIDA} · ${n} propuestas`);
})();
