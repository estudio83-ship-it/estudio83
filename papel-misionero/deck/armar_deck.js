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
  { titulo: "La P", bajada: "La inicial integra el árbol o el papel", claves: ["A1", "A4", "N1", "N3"] },
  { titulo: "Sellos y contenedores", bajada: "El símbolo dentro de una forma cerrada", claves: ["A3", "A5", "N2", "N4", "N5"] },
  { titulo: "Árbol solo", bajada: "La silueta del árbol como símbolo", claves: ["A2", "P4", "P1", "P2", "P3"] },
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
  pres.author = "Estudio 83";
  pres.company = "Estudio 83";
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const C = pres.SchemeColor;

  pres.defineSlideMaster({
    title: "PORTADA",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.4, w: 11.7, h: 1.6, fontSize: 48, bold: true, color: C.background2, valign: "bottom", margin: 0, align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.15, w: 11.7, h: 1.0, fontSize: 18, color: C.accent1, valign: "top", margin: 0 }, text: "" } },
      { text: { text: "ESTUDIO 83 · PARA CARTOCOR", options: { x: 0.8, y: 6.6, w: 8, h: 0.4, fontSize: 11, charSpacing: 4, color: C.accent5, margin: 0 } } },
    ],
  });
  pres.defineSlideMaster({
    title: "SECCION",
    background: { color: C.text1 },
    objects: [
      { placeholder: { options: { name: "num", type: "body", x: 0.8, y: 2.2, w: 6, h: 0.5, fontSize: 14, charSpacing: 4, color: C.accent1, margin: 0 }, text: "" } },
      { placeholder: { options: { name: "title", type: "title", x: 0.8, y: 2.8, w: 11.7, h: 1.4, fontSize: 54, bold: true, color: C.background2, valign: "top", margin: 0, align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.8, y: 4.3, w: 11.7, h: 0.8, fontSize: 20, color: C.accent5, valign: "top", margin: 0 }, text: "" } },
    ],
  });
  pres.defineSlideMaster({
    title: "PROPUESTA",
    background: { color: C.background2 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: 0.5, y: 0.4, w: 9.5, h: 0.75, fontSize: 30, bold: true, color: C.text1, valign: "middle", margin: 0, align: "left" }, text: "" } },
      { placeholder: { options: { name: "body", type: "body", x: 0.5, y: 1.1, w: 9.5, h: 0.4, fontSize: 12, charSpacing: 3, color: C.accent6, valign: "top", margin: 0 }, text: "" } },
      { text: { text: "ESTUDIO 83 · PAPEL MISIONERO", options: { x: 0.5, y: 7.0, w: 6, h: 0.3, fontSize: 10, charSpacing: 3, color: C.accent6, margin: 0 } } },
    ],
    slideNumber: { x: 12.3, y: 7.0, w: 0.55, h: 0.3, fontSize: 10, color: C.accent6, align: "right" },
  });

  // Portada
  pres.addSection({ title: "Portada" });
  let s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Portada" });
  s.addText("Papel Misionero", { placeholder: "title" });
  s.addText("Marcas finalistas · negativo y una tinta sobre kraft · Helvetica por niveles", { placeholder: "body" });

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
      const paneles = [
        { x: 0.5, color: C.text1, img: `ID-${clave}-negativo`, rotulo: "NEGATIVO", rotColor: C.accent5 },
        { x: 6.78, color: C.accent1, img: `ID-${clave}-color`, rotulo: "UNA TINTA SOBRE KRAFT", rotColor: C.text2 },
      ];
      for (const p of paneles) {
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: p.x, y: 1.75, w: 6.05, h: 5.0, fill: { color: p.color }, line: { color: p.color }, rectRadius: 0.18, objectName: `Panel ${p.rotulo.toLowerCase()}` });
        const im = await png(p.img);
        const w = 4.5, h = w * im.ratio;
        s.addImage({ data: im.data, x: p.x + (6.05 - w) / 2, y: 1.75 + (5.0 - h) / 2 - 0.1, w, h, altText: `${NOMBRES[clave]} · ${p.rotulo.toLowerCase()}`, objectName: `Logo ${p.rotulo.toLowerCase()}` });
        s.addText(p.rotulo, { x: p.x + 0.3, y: 6.25, w: 5, h: 0.3, fontSize: 10, charSpacing: 3, color: p.rotColor, margin: 0, isTextBox: true, objectName: "Rótulo" });
      }
      s.addNotes(`${NOMBRES[clave]} (${clave}), sección ${g.titulo}.`);
    }
  }

  await pres.writeFile({ fileName: SALIDA });
  await applyTheme(SALIDA, THEME);
  console.log(`${SALIDA} · ${n} propuestas`);
})();
