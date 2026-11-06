// Cartocor 2026 — plantilla PowerPoint (estética 2026, módulos 2025)
const path = require("path");
const pptxgen = require("pptxgenjs");
const sharp = require("sharp");
const { applyTheme } = require("/root/.claude/skills/synced/e9b35989-4a9f-4c50-9016-fd9d1d55533d_95a2d566-ceb3-4477-933e-e0130402a89b/pptx/scripts/apply_theme.js");

const SCR = "/tmp/claude-0/-home-user-estudio83/76984eb5-6892-50fe-8e69-894fe593cd33/scratchpad/";
const IMG = SCR + "build/img/";
const A = SCR + "build/asset/";
const fs = require("fs");
const { execFileSync } = require("child_process");
const CROPDIR = SCR + "build/crops/"; fs.mkdirSync(CROPDIR, { recursive: true });
// recorte exacto a la proporción del marco (evita fotos deformadas)
function fit(src, w, h) {
  const full = src.startsWith("/") ? src : A + src;
  const ext = full.endsWith(".png") ? ".png" : ".jpg";
  const out = CROPDIR + path.basename(full).replace(/\.\w+$/, "") + "-" + Math.round(w * 1000 / h) + ext;
  if (!fs.existsSync(out)) execFileSync("python3", ["-I", SCR + "build/crop.py", full, String(w), String(h), out]);
  return out;
}
function pngSize(file) { const b = fs.readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)]; }
// imagen encajada en una caja sin deformar (logos, íconos, recursos)
function enc(file, x, y, w, h, al = "c") {
  const full = file.startsWith("/") ? file : A + file;
  const [iw, ih] = pngSize(full); const k = Math.min(w / iw, h / ih), ww = iw * k, hh = ih * k;
  const xx = al === "l" ? x : al === "r" ? x + w - ww : x + (w - ww) / 2;
  return { path: full, x: xx, y: y + (h - hh) / 2, w: ww, h: hh };
}
const OUT = process.argv[2] || SCR + "build/Cartocor_2026_Plantilla.pptx";

const THEME = {
  name: "Cartocor 2026",
  headFontFace: "Raleway",
  bodyFontFace: "Raleway",
  colors: {
    dk1: "1F497D", lt1: "FFFFFF", dk2: "17375E", lt2: "F4F0ED",
    accent1: "99D25C", accent2: "EAC53A", accent3: "407BC7", accent4: "776496",
    accent5: "BF8527", accent6: "F79646", hlink: "407BC7", folHlink: "776496",
  },
};
// Colores fuera del tema (hex)
const HX = {
  gris: "7F7F7F", corrOsc: "5CAD3F", celeste: "9EBFDE", velo: "4C682C",
  cartocor: "01B946", converflex: "252F60", zucamor: "2E4A9D", misionero: "018E28", puntapel: "98C83E",
};
const LIGHT = "Raleway Light", CIFRAS = "Bahnschrift", MANO = "Om Telolet Om";

const p = (px) => +(px / 72).toFixed(4); // 960×540 px → 13,333×7,5 in

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Cartocor";
pres.company = "Cartocor";
pres.title = "Cartocor 2026 – Plantilla institucional";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const SH = pres.ShapeType;
const U = { // unidades de negocio
  corrugado: { col: C.accent1, nombre: "Corrugado", ico: "corrugado", icoCol: "tinta" },
  papel: { col: C.accent2, nombre: "Papel", ico: "papel", icoCol: "tinta" },
  kraft: { col: C.accent5, nombre: "Papel kraft", ico: "kraft", icoCol: "tinta" },
  flexibles: { col: C.accent3, nombre: "Flexibles", ico: "flexible", icoCol: "tinta" },
  bolsas: { col: C.accent4, nombre: "Bolsas industriales", ico: "bolsas", icoCol: "tinta" },
};

// ---------- íconos (línea) ----------
const STROKE = 'fill="none" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
const ICON_SVG = {
  corrugado: '<path d="M24 7 41 15.5V33L24 41.5 7 33V15.5Z"/><path d="M7 15.5 24 24l17-8.5M24 24v17.5M15.5 11.2 32.5 19.7v6"/>',
  flexible: '<path d="M14 14h12l5-6 4 3.5-4 4.5V41a2 2 0 0 1-2 2H16a2 2 0 0 1-2-2Z"/><rect x="18" y="20" width="9" height="17" rx="1"/><path d="M20.5 25h4M20.5 29h4M20.5 33h4"/>',
  papel: '<path d="M12 6h17l8 8v28H12Z"/><path d="M29 6v8h8"/>',
  bolsas: '<path d="M13 8h22l2 34H11Z"/><path d="M13.5 13h21" stroke-dasharray="2 2.5"/><rect x="17" y="19" width="14" height="17" rx="1"/><path d="M19.5 32.5 24 25.5l4.5 7Z"/>',
};
const CAJA_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 72"><g fill="none" stroke="#1F497D" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M22 30v26l30 11V40Z"/><path d="M52 40l26-12v26L52 67"/><path d="M22 30 6 18l30-8 16 12Z"/><path d="M52 22l14-14 22 8-10 12"/><path d="M36 10l16 12 26 6"/><path d="M21.5 31 52.5 39.5 77 27.5" opacity=".7"/><path d="M30 44c-3 4 0 10 3 6s1-9-3-6Z"/></g></svg>';
const ICONS = {};
async function png(svg, w, h) {
  const buf = await sharp(Buffer.from(svg)).resize(w, h).png().toBuffer();
  return "image/png;base64," + buf.toString("base64");
}
async function prepIcons() {
  // íconos originales del institucional 2026 (línea oscura) + versión blanca recoloreada
  const files = { corrugado: "icono-corrugado.png", papel: "icono-papel.png", flexible: "icono-flexibles.png", bolsas: "icono-bolsas.png", kraft: "icono-kraft.png" };
  for (const [k, f] of Object.entries(files)) {
    const buf = fs.readFileSync(A + f);
    const sq = await sharp(buf).resize(256, 256, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
    ICONS[k + "-tinta"] = "image/png;base64," + sq.toString("base64");
    const alpha = await sharp(sq).extractChannel(3).toBuffer();
    const white = await sharp({ create: { width: 256, height: 256, channels: 3, background: "#ffffff" } }).joinChannel(alpha).png().toBuffer();
    ICONS[k + "-blanco"] = "image/png;base64," + white.toString("base64");
  }
  const cj = fs.readFileSync(A + "caja-dibujada.png");
  ICONS.caja = "image/png;base64," + cj.toString("base64");
  ICONS.cajaSize = pngSize(A + "caja-dibujada.png");
}

// ---------- piezas reutilizables ----------
// Pill dibujada (relleno arena + dos trazos a mano). Devuelve objetos para layouts o dibuja en un slide.
function pillShapes(x, y, w, h) {
  const r = p(h) / 2;
  return [
    { text: { text: "", options: { shape: SH.roundRect, x: p(x), y: p(y), w: p(w), h: p(h), rectRadius: r, fill: { color: C.background2 }, line: { type: "none" } } } },
    { text: { text: "", options: { shape: SH.roundRect, x: p(x - 6), y: p(y - 4), w: p(w + 14), h: p(h + 6), rectRadius: r, fill: { type: "none" }, line: { color: C.text1, width: 1.4 }, rotate: -1.3 } } },
    { text: { text: "", options: { shape: SH.roundRect, x: p(x + 2), y: p(y + 1), w: p(w + 1), h: p(h + 5), rectRadius: r, fill: { type: "none" }, line: { color: C.text2, width: 1.1 }, rotate: 0.9 } } },
  ];
}
function drawObjs(slide, objs) {
  for (const o of objs) {
    if (o.text) slide.addText(o.text.text, { ...o.text.options });
    else if (o.image) slide.addImage({ ...o.image });
  }
}
const caja = (x, y, w = 96) => ({ image: { data: ICONS.caja, x: p(x), y: p(y), w: p(w), h: p(w * ICONS.cajaSize[1] / ICONS.cajaSize[0]), altText: "Caja dibujada" } });
const trazo = (y, x = 0, w = 960) => ({ image: { path: IMG + "trazo-blanco.png", x: p(x), y: p(y), w: p(w), h: p(60) } });
const logo = (x, y, h = 34) => ({ image: { path: A + "logo-cartocor-blanco.png", x: p(x), y: p(y), w: p(h * 1382 / 425), h: p(h), altText: "Cartocor" } });
const logoEnc = (file, x, y, w, h) => { const e = enc(file, x, y, w, h); return { image: { path: e.path, x: p(e.x), y: p(e.y), w: p(e.w), h: p(e.h), altText: file.replace(/^logo-|\.png$/g, "") } }; };
function circIcon(slide, unidad, x, y, d, name) {
  const u = U[unidad];
  // estilo 2026: círculo de color desplazado abajo-izquierda y dibujo de línea encima
  slide.addShape(SH.ellipse, { x: p(x), y: p(y + d * 0.08), w: p(d * 0.92), h: p(d * 0.92), fill: { color: u.col }, line: { type: "none" }, objectName: name || "Círculo " + u.nombre });
  const s = d * 0.78;
  slide.addImage({ data: ICONS[u.ico + "-" + u.icoCol], x: p(x + d * 0.2), y: p(y - d * 0.02), w: p(s), h: p(s), altText: "Ícono " + u.nombre, objectName: "Ícono " + u.nombre });
}
function nota(slide, x, y, w, h, cifra, antes, clave, despues) {
  slide.addText("", { shape: SH.roundRect, x: p(x), y: p(y), w: p(w), h: p(h), rectRadius: p(h) / 2, fill: { color: C.background2 }, line: { type: "none" }, objectName: "Nota fondo" });
  slide.addText("", { shape: SH.roundRect, x: p(x - 2), y: p(y - 2), w: p(w + 4), h: p(h + 4), rectRadius: p(h + 4) / 2, fill: { type: "none" }, line: { color: C.accent6, width: 1.1 }, rotate: -0.8, objectName: "Nota trazo" });
  slide.addText([
    { text: cifra, options: { bold: true, fontSize: 19, breakLine: true } },
    { text: antes, options: { fontSize: 13 } },
    { text: clave, options: { fontSize: 13, bold: true, color: C.accent6 } },
    { text: despues, options: { fontSize: 13 } },
  ], { x: p(x), y: p(y), w: p(w), h: p(h), align: "center", valign: "middle", color: C.text1, margin: 0, isTextBox: true, objectName: "Nota texto" });
}

function marcasCirculo(slide, x0, y, d, paso) {
  ["cartocor", "converflex", "zucamor", "papel-misionero", "puntapel"].forEach((k, i) => {
    const x = x0 + i * paso;
    slide.addShape(SH.ellipse, { x: p(x), y: p(y), w: p(d), h: p(d), fill: { color: C.background1 }, line: { color: C.background2, width: 1 }, objectName: "Círculo marca " + k });
    const e = enc("logo-" + k + "-color.png", x + d * 0.14, y + d * 0.2, d * 0.72, d * 0.6);
    slide.addImage({ path: e.path, x: p(e.x), y: p(e.y), w: p(e.w), h: p(e.h), altText: "Logo " + k, objectName: "Logo " + k });
  });
}

// ---------- layouts ----------
function defineLayouts() {
  const BG_FOTO = (f) => ({ path: IMG + f });
  const ph = (name, type, o, text = "") => ({ placeholder: { options: { name, type, ...o }, text } });

  pres.defineSlideMaster({
    title: "PORTADA", background: BG_FOTO("portada.jpg"),
    objects: [
      logo(40, 410), trazo(450),
      { image: { path: A + "esquina-doblada.png", x: p(852), y: p(415), w: p(108), h: p(108 * 952 / 750), altText: "Esquina doblada" } },
      ph("title", "title", { x: p(400), y: p(66), w: p(504), h: p(72), fontSize: 60, bold: true, color: C.background1, align: "right", valign: "bottom", charSpacing: 0.5, margin: 0 }, "PACKAGING"),
      ph("body", "body", { x: p(400), y: p(146), w: p(504), h: p(40), fontFace: LIGHT, fontSize: 30, color: C.background1, align: "right", valign: "top", margin: 0 }, "Presentación institucional"),
      ph("anio", "body", { x: p(600), y: p(188), w: p(304), h: p(52), fontSize: 40, bold: true, color: C.background1, align: "right", valign: "top", margin: 0 }, "2026"),
    ],
  });

  pres.defineSlideMaster({
    title: "CONTENIDO", background: BG_FOTO("bosque.jpg"),
    objects: [
      { rect: { x: 0, y: 0, w: p(620), h: p(540), fill: { color: C.text2, transparency: 40 } } },
      trazo(92, 0, 620),
      ph("title", "title", { x: p(56), y: p(30), w: p(500), h: p(70), fontFace: MANO, fontSize: 54, color: C.background1, valign: "middle", margin: 0 }, "Contenido"),
      ph("body", "body", { x: p(56), y: p(160), w: p(520), h: p(300), fontSize: 20, color: C.background1, valign: "top", margin: 0, paraSpaceAfter: 10 }, "Temas de la presentación"),
    ],
  });

  const seps = [
    ["SEPARADOR CORRUGADO", C.accent1, "sep-corrugado.jpg", "corrugado-blanco"],
    ["SEPARADOR PAPEL", C.accent2, "sep-bobina.jpg", "papel-blanco"],
    ["SEPARADOR FLEXIBLES", C.accent3, "sep-flexibles.jpg", "flexible-blanco"],
    ["SEPARADOR BOLSAS", C.accent4, "sep-bolsas.jpg", "bolsas-blanco"],
    ["SEPARADOR TRANSVERSAL", HX.celeste, "sep-transversal.jpg", null],
  ];
  for (const [t, col, foto, ico] of seps) {
    const objs = [
      { text: { text: "", options: { shape: SH.ellipse, x: p(-150), y: p(-190), w: p(560), h: p(560), fill: { color: col, transparency: 8 }, line: { type: "none" } } } },
      trazo(456, 140, 820), logo(800, 466, 28),
      ph("title", "title", { x: p(48), y: p(48), w: p(340), h: p(150), fontFace: MANO, fontSize: 64, color: C.background1, valign: "top", margin: 0 }, "Sección"),
    ];
    if (ico) {
      objs.push({ text: { text: "", options: { shape: SH.ellipse, x: p(48), y: p(434), w: p(62), h: p(62), fill: { color: C.background1, transparency: 75 }, line: { type: "none" } } } });
      objs.push({ image: { data: ICONS[ico], x: p(48 + 13), y: p(434 + 13), w: p(36), h: p(36) } });
    }
    pres.defineSlideMaster({ title: t, background: BG_FOTO(foto), objects: objs });
  }

  pres.defineSlideMaster({
    title: "PRESENTACION DE NEGOCIO", background: { color: C.background1 },
    objects: [
      { image: { path: IMG + "presentacion-foto.png", x: 0, y: 0, w: p(430), h: p(540) } },
      logo(40, 390, 30),
      ...pillShapes(520, 66, 380, 66), caja(470, 46),
      ph("title", "title", { x: p(540), y: p(66), w: p(340), h: p(66), fontSize: 32, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0 }, "TÍTULO"),
      ph("body", "body", { x: p(480), y: p(170), w: p(440), h: p(110), fontSize: 15, color: C.text1, align: "center", valign: "top", margin: 0 }, "Párrafo de presentación, hasta cuatro líneas."),
    ],
  });

  pres.defineSlideMaster({
    title: "TITULO Y CONTENIDO", background: { color: C.background1 },
    objects: [
      ...pillShapes(84, 40, 400, 56), caja(36, 26, 80),
      ph("title", "title", { x: p(100), y: p(40), w: p(370), h: p(56), fontSize: 26, color: C.text1, align: "center", valign: "middle", margin: 0 }, "CONTEXTO Clave"),
      ph("body", "body", { x: p(40), y: p(140), w: p(880), h: p(360), fontSize: 16, color: C.text1, valign: "top", margin: 0, paraSpaceAfter: 8 }, "Contenido"),
    ],
  });

  pres.defineSlideMaster({
    title: "SOLO TITULO", background: { color: C.background1 },
    objects: [
      ...pillShapes(84, 40, 400, 56), caja(36, 26, 80),
      ph("title", "title", { x: p(100), y: p(40), w: p(370), h: p(56), fontSize: 26, color: C.text1, align: "center", valign: "middle", margin: 0 }, "CONTEXTO Clave"),
    ],
  });

  pres.defineSlideMaster({
    title: "DATOS", background: { color: C.background1 },
    objects: [
      { text: { text: "", options: { shape: SH.roundRect, x: p(60), y: p(90), w: p(840), h: p(420), rectRadius: p(28), fill: { color: C.background2 }, line: { type: "none" } } } },
      ph("title", "title", { x: p(40), y: p(30), w: p(700), h: p(36), fontSize: 20, bold: true, color: HX.gris, align: "left", valign: "middle", margin: 0 }, "TÍTULO DE DATOS – UNIDAD"),
    ],
  });

  for (const [k, marca, mcol, lg] of [["corrugado", "CARTOCOR", HX.cartocor, "logo-cartocor-color.png"], ["flexibles", "CONVERFLEX", HX.converflex, "logo-converflex-color.png"], ["papel", "PAPEL MISIONERO", HX.misionero, "logo-papel-misionero-color.png"], ["bolsas", "PUNTAPEL", HX.puntapel, "logo-puntapel-color.png"]]) {
    pres.defineSlideMaster({
      title: "UNIDAD " + U[k].nombre.toUpperCase().split(" ")[0], background: { color: C.background1 },
      objects: [
        { text: { text: "", options: { shape: SH.ellipse, x: p(-180), y: p(-200), w: p(520), h: p(520), fill: { color: U[k].col }, line: { type: "none" } } } },
        { text: { text: "", options: { shape: SH.ellipse, x: p(24), y: p(22), w: p(96), h: p(96), fill: { color: C.background1 }, line: { type: "none" } } } },
        logoEnc(lg, 34, 46, 76, 48),
        { text: { text: "", options: { shape: SH.roundRect, x: p(110), y: p(200), w: p(800), h: p(300), rectRadius: p(120), fill: { color: C.background2 }, line: { type: "none" } } } },
        ph("title", "title", { x: p(360), y: p(40), w: p(380), h: p(60), fontSize: 26, bold: true, color: C.text1, valign: "middle", margin: 0 }, U[k].nombre),
        ph("body", "body", { x: p(150), y: p(472), w: p(720), h: p(30), fontSize: 15, color: C.text1, valign: "middle", margin: 0 }, "Cifra clave de la unidad"),
      ],
    });
  }

  pres.defineSlideMaster({
    title: "CIERRE", background: BG_FOTO("bosque.jpg"),
    objects: [
      { text: { text: "", options: { shape: SH.roundRect, x: p(220), y: p(200), w: p(520), h: p(120), rectRadius: p(12), fill: { color: HX.velo, transparency: 28 }, line: { type: "none" } } } },
      logo(40, 466),
      { text: { text: "", options: { shape: SH.roundRect, x: p(834), y: p(420), w: p(90), h: p(100), rectRadius: p(12), fill: { color: C.background1 }, line: { type: "none" } } } },
      { image: { path: A + "qr-cartocor.png", x: p(844), y: p(426), w: p(70), h: p(70), altText: "QR cartocor.com" } },
      { text: { text: "Cartocor.com", options: { x: p(834), y: p(498), w: p(90), h: p(16), fontSize: 8, color: C.text1, align: "center", margin: 0 } } },
      ph("title", "title", { x: p(220), y: p(200), w: p(520), h: p(120), fontSize: 52, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0 }, "¡GRACIAS!"),
    ],
  });
}

// ---------- slides de ejemplo ----------
async function build() {
  await prepIcons();
  defineLayouts();

  if (process.env.ELEMENTOS) { // PPT de elementos de diseño: íconos a mano, recursos, galería y esquemas
    pres.title = "Cartocor 2026 – Elementos de diseño";
    const EL = require("./elementos-mod.js")({ pres, fit, enc, A, IMG });
    EL.masters();
    pres.addSection({ title: "Apertura" });
    const s0 = pres.addSlide({ masterName: "PORTADA ELEMENTOS", sectionTitle: "Apertura" });
    s0.addText("ELEMENTOS DE DISEÑO", { placeholder: "title" });
    s0.addText("Íconos de negocio, recursos dibujados, galería y esquemas · 2026", { placeholder: "body" });
    s0.addNotes("Biblioteca de elementos del lenguaje Cartocor 2026. Todo es editable: los íconos y trazos son formas libres (clic derecho › Modificar puntos) y los elementos compuestos están agrupados para copiar y pegar.");
    EL.iconos();
    EL.recursos();
    const GALE = require("./galeria.js")({ A, fit, enc, pres, C, SH, HX, U, p, ICONS, IMG, SCR, LIGHT, CIFRAS, MANO, THEME, circIcon, pillShapes, drawObjs });
    GALE.galeria();
    EL.esquemas();
    await pres.writeFile({ fileName: OUT });
    await applyTheme(OUT, THEME);
    console.log("ok", OUT);
    return;
  }

  // 1. Portada
  pres.addSection({ title: "Apertura" });
  let s = pres.addSlide({ masterName: "PORTADA", sectionTitle: "Apertura" });
  s.addText("PACKAGING", { placeholder: "title" });
  s.addText("Presentación institucional", { placeholder: "body" });
  s.addText("2026", { placeholder: "anio" });
  s.addNotes("Portada: una palabra en mayúsculas, subtítulo en Raleway Light y el año. Solo fotos de bosque o plantación propia.");

  // 2. Contenido
  s = pres.addSlide({ masterName: "CONTENIDO", sectionTitle: "Apertura" });
  s.addText("Contenido", { placeholder: "title" });
  s.addText([
    { text: "Quiénes somos", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Resultados 2025 y estimado 2026", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Nuestras soluciones", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Automatización", options: { bullet: { type: "number" }, breakLine: true } },
    { text: "Sostenibilidad", options: { bullet: { type: "number" } } },
  ], { placeholder: "body" });
  marcasCirculo(s, 500, 426, 76, 84);
  s.addNotes("Círculos con los logos de las cinco marcas, como en la plantilla 2025.");

  // 3. Presentación de negocio
  pres.addSection({ title: "Quiénes somos" });
  s = pres.addSlide({ masterName: "PRESENTACION DE NEGOCIO", sectionTitle: "Quiénes somos" });
  s.addText("PACKAGING", { placeholder: "title" });
  s.addText([
    { text: "Nuestro negocio de Packaging desarrolla soluciones que nos posicionan entre las empresas líderes del Cono Sur, con las marcas " },
    { text: "Cartocor", options: { bold: true } }, { text: ", " }, { text: "Converflex", options: { bold: true } }, { text: ", " },
    { text: "Zucamor", options: { bold: true } }, { text: ", " }, { text: "Puntapel", options: { bold: true } }, { text: " y " },
    { text: "Papel Misionero", options: { bold: true } }, { text: "." },
  ], { placeholder: "body" });
  const marcas = [["CARTOCOR", HX.cartocor, "corrugado", "Corrugado"], ["CONVERFLEX", HX.converflex, "flexibles", "Flexibles"], ["ZUCAMOR", HX.zucamor, "papel", "Papel reciclado"], ["PAPEL MISIONERO", HX.misionero, "kraft", "Papel kraft"], ["PUNTAPEL", HX.puntapel, "bolsas", "Bolsas industriales"]];
  marcas.forEach(([m, col, u, lab], i) => {
    const x = 482 + i * 88;
    const fk = ["cartocor", "converflex", "zucamor", "papel-misionero", "puntapel"][i];
    s.addImage({ path: A + "ficha-" + fk + ".png", x: p(x + 6), y: p(i === 0 ? 290 : 298), w: p(i === 0 ? 70 : 64), h: p(i === 0 ? 88 : 81), altText: "Logo " + m, objectName: "Ficha " + m });
    circIcon(s, u, x + 8, 392, 60);
    s.addText(lab, { x: p(x - 8), y: p(456), w: p(92), h: p(36), fontSize: 11, color: HX.gris, align: "center", valign: "top", margin: 0, isTextBox: true, objectName: "Rótulo " + lab });
  });
  s.addNotes("Fichas de marca originales del institucional 2026 (Cartocor más grande, como en el original) con el ícono de cada unidad debajo.");

  // 4. Separador
  pres.addSection({ title: "Resultados" });
  s = pres.addSlide({ masterName: "SEPARADOR CORRUGADO", sectionTitle: "Resultados" });
  s.addText("Resultados 2026", { placeholder: "title" });
  s.addNotes("Separador: elegir el diseño del color de la unidad (Corrugado, Papel, Flexibles, Bolsas) o Transversal. La foto se cambia con Formato del fondo.");

  // 5. Ventas por negocio (BarrasNegocio)
  s = pres.addSlide({ masterName: "DATOS", sectionTitle: "Resultados" });
  s.addText("VENTAS PACKAGING – MMU$S", { placeholder: "title" });
  const cx = 110, cw = 740, c1 = 560, c2 = 690, colW = 120;
  s.addText([{ text: "2025", options: {} }], { x: p(c1), y: p(112), w: p(colW), h: p(30), fontFace: CIFRAS, fontSize: 20, color: C.text1, align: "right", margin: 0, isTextBox: true });
  s.addText("2026(e)", { x: p(c2), y: p(112), w: p(colW), h: p(30), fontFace: CIFRAS, fontSize: 20, color: C.text1, align: "right", margin: 0, isTextBox: true });
  const filas = [["CORRUGADO", 600, 620, C.accent1], ["PAPEL", 150, 160, C.accent2], ["FLEXIBLES", 64, 80, C.accent3], ["BOLSAS INDUSTRIALES", 56, 60, C.accent4]];
  filas.forEach(([lab, a, b, col], i) => {
    const y = 148 + i * 40;
    s.addShape(SH.rect, { x: p(cx), y: p(y), w: p(cw), h: p(32), fill: { color: col }, line: { type: "none" }, objectName: "Barra " + lab });
    s.addText(lab, { x: p(cx + 14), y: p(y), w: p(400), h: p(32), fontFace: CIFRAS, fontSize: 19, bold: true, color: C.background1, charSpacing: 1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(String(a), { x: p(c1), y: p(y), w: p(colW), h: p(32), fontFace: CIFRAS, fontSize: 19, bold: true, color: C.background1, align: "right", valign: "middle", margin: 0, isTextBox: true });
    s.addText(String(b), { x: p(c2), y: p(y), w: p(colW), h: p(32), fontFace: CIFRAS, fontSize: 19, bold: true, color: C.background1, align: "right", valign: "middle", margin: 0, isTextBox: true });
  });
  const tot = [["VENTAS TOTALES", "870", "920", 24, HX.corrOsc, true], ["INTRA-NEGOCIO", "145", "150", 16, C.text1, false], ["VENTAS TRANSFERIDAS", "725", "770", 16, C.text1, false], ["VENTAS A GRUPO ARCOR", "85", "95", 16, C.text1, false], ["VENTAS A TERCEROS", "640", "675", 16, C.text1, false]];
  let ty = 322;
  tot.forEach(([lab, a, b, fs, col, bold]) => {
    const h = fs + 12;
    s.addText(lab, { x: p(cx + 14), y: p(ty), w: p(420), h: p(h), fontFace: CIFRAS, fontSize: fs, bold, color: col, charSpacing: 1, valign: "middle", margin: 0, isTextBox: true });
    s.addText(a, { x: p(c1), y: p(ty), w: p(colW), h: p(h), fontFace: CIFRAS, fontSize: fs, bold, color: col, align: "right", valign: "middle", margin: 0, isTextBox: true });
    s.addText(b, { x: p(c2), y: p(ty), w: p(colW), h: p(h), fontFace: CIFRAS, fontSize: fs, bold, color: col, align: "right", valign: "middle", margin: 0, isTextBox: true });
    ty += h + (bold ? 8 : 2);
  });
  s.addNotes("Cifras del institucional 2026 (MMU$S). 2026(e) = estimado.");

  // 6. Highlights (NotasKpi)
  s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Resultados" });
  s.addText([{ text: "PACKAGING ", options: { fontFace: LIGHT } }, { text: "Highlights", options: { bold: true } }], { placeholder: "title" });
  s.addShape(SH.roundRect, { x: p(50), y: p(200), w: p(560), h: p(170), rectRadius: p(70), fill: { color: C.background2 }, line: { type: "none" }, objectName: "Mancha arena" });
  s.addImage({ path: fit(SCR + "up/foto-corrugado.jpg", 210, 210), x: p(70), y: p(150), w: p(210), h: p(210), rounding: true, altText: "Cartón corrugado", objectName: "Foto corrugado" });
  s.addImage({ path: fit(SCR + "up/foto-bobina-kraft.jpg", 190, 190), x: p(320), y: p(170), w: p(190), h: p(190), rounding: true, altText: "Bobinas de papel kraft", objectName: "Foto bobina" });
  circIcon(s, "corrugado", 222, 302, 66);
  circIcon(s, "kraft", 462, 314, 56);
  s.addText("Corrugado", { x: p(110), y: p(392), w: p(130), h: p(24), fontSize: 13, color: HX.gris, align: "center", margin: 0, isTextBox: true });
  s.addText("Papel kraft", { x: p(350), y: p(392), w: p(130), h: p(24), fontSize: 13, color: HX.gris, align: "center", margin: 0, isTextBox: true });
  const notas = [["900 millones", "m² de ", "cartón corrugado", " por año"], ["270 millones", "", "bolsas industriales", " por año"], ["15.000 t", "de ", "material flexible", " por año"], ["23.000 ha", "de ", "plantaciones forestales", " propias"], ["175 + 85 KTn", "", "papel reciclado / kraft", " por año"]];
  notas.forEach((n, i) => nota(s, 640, 40 + i * 94, 280, 72, ...n));
  s.addNotes("Cifras del institucional 2026. La palabra clave de cada nota va en naranja; es el único uso del naranja en el deck.");

  // 7. Destino de ventas (Donuts)
  s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Resultados" });
  s.addText([{ text: "DESTINO ", options: { fontFace: LIGHT } }, { text: "de ventas", options: { bold: true } }], { placeholder: "title" });
  s.addShape(SH.roundRect, { x: p(80), y: p(130), w: p(800), h: p(370), rectRadius: p(28), fill: { color: C.background2 }, line: { type: "none" }, objectName: "Panel arena" });
  const dcol = [THEME.colors.accent3, THEME.colors.accent4, THEME.colors.accent1];
  [["2025", [145, 85, 640], "870"], ["2026(e)", [150, 95, 675], "920"]].forEach(([anio, vals, total], i) => {
    const x = 130 + i * 300;
    s.addChart(pres.charts.DOUGHNUT, [{ name: anio, labels: ["Intra-negocio", "Grupo Arcor", "Terceros"], values: vals }], {
      x: p(x), y: p(150), w: p(250), h: p(250), holeSize: 62, chartColors: dcol, showLegend: false, showTitle: false,
      showValue: true, showPercent: false, dataLabelColor: "FFFFFF", dataLabelFontSize: 12, dataLabelFontFace: "+mn-lt", dataLabelFontBold: true,
      dataBorder: { pt: 2, color: "F4F0ED" }, objectName: "Anillo " + anio,
    });
    s.addText([{ text: total, options: { fontFace: CIFRAS, fontSize: 30, bold: true, breakLine: true } }, { text: "MMU$S", options: { fontSize: 11 } }], { x: p(x + 75), y: p(245), w: p(100), h: p(60), color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(anio, { x: p(x), y: p(410), w: p(250), h: p(34), fontFace: CIFRAS, fontSize: 22, bold: true, color: C.text1, align: "center", margin: 0, isTextBox: true });
  });
  [["Intra-negocio", C.accent3], ["Grupo Arcor", C.accent4], ["Terceros", C.accent1]].forEach(([lab, col], i) => {
    const y = 230 + i * 42;
    s.addShape(SH.ellipse, { x: p(712), y: p(y + 4), w: p(18), h: p(18), fill: { color: col }, line: { type: "none" }, objectName: "Leyenda " + lab });
    s.addText(lab, { x: p(740), y: p(y), w: p(130), h: p(26), fontSize: 15, color: C.text1, valign: "middle", margin: 0, isTextBox: true });
  });
  s.addNotes("Anillos nativos de PowerPoint: clic derecho > Editar datos para actualizar. Cifras del institucional 2026.");

  // 8. Resumen de performance
  s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Resultados" });
  s.background = { path: IMG + "fondo-desenfocado.jpg" };
  s.addText([{ text: "RESUMEN ", options: { fontFace: LIGHT } }, { text: "Performance", options: { bold: true } }], { placeholder: "title" });
  s.addShape(SH.roundRect, { x: p(40), y: p(150), w: p(880), h: p(260), rectRadius: p(28), fill: { color: C.background1, transparency: 22 }, line: { type: "none" }, objectName: "Panel vidrio" });
  const fichas = [["Ventas", "920", "MMU$S 2026(e)", C.background2, C.text1], ["Cajas armadas", "118 M", "+25 % vs. 2025", C.accent3, C.background1], ["Máquinas", "125", "instaladas en clientes", C.accent1, C.text1], ["Sitios", "17", "plantas y oficinas", C.accent2, C.text1]];
  fichas.forEach(([lab, val, sub, bg, fg], i) => {
    const x = 68 + i * 210;
    s.addText([
      { text: lab, options: { fontSize: 15, breakLine: true } },
      { text: val, options: { fontFace: CIFRAS, fontSize: 40, bold: true, breakLine: true } },
      { text: sub, options: { fontSize: 13 } },
    ], { shape: SH.roundRect, x: p(x), y: p(178), w: p(194), h: p(204), rectRadius: p(28), fill: { color: bg }, line: { type: "none" }, color: fg, align: "center", valign: "middle", margin: 6, objectName: "Ficha " + lab });
  });
  marcasCirculo(s, 320, 440, 58, 66);
  s.addNotes("Siempre cuatro fichas. Cifras del institucional 2026 (cajas armadas: Argentina).");

  // 9. Separador soluciones
  pres.addSection({ title: "Soluciones" });
  s = pres.addSlide({ masterName: "SEPARADOR PAPEL", sectionTitle: "Soluciones" });
  s.addText("Nuestras soluciones", { placeholder: "title" });

  // 10. Unidad de negocio
  s = pres.addSlide({ masterName: "UNIDAD CORRUGADO", sectionTitle: "Soluciones" });
  s.addText("Cartón corrugado", { placeholder: "title" });
  s.addText([{ text: "Fruta, carnes, bebidas y displays POP", options: { bold: true } }, { text: " · 900 millones de m² por año" }], { placeholder: "body" });
  s.addShape(SH.ellipse, { x: p(788), y: p(24), w: p(140), h: p(140), fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Aro sello" });
  s.addImage({ path: fit(SCR + "up/foto-corrugado.jpg", 130, 130), x: p(793), y: p(29), w: p(130), h: p(130), rounding: true, altText: "Cartón corrugado", objectName: "Sello foto" });
  s.addText("Corrugado", { x: p(793), y: p(29), w: p(130), h: p(130), fontFace: MANO, fontSize: 30, color: C.background1, align: "center", valign: "middle", margin: 0, isTextBox: true, shadow: { type: "outer", color: "000000", opacity: 0.5, blur: 4, offset: 1, angle: 90 }, objectName: "Sello texto" });
  circIcon(s, "corrugado", 890, 20, 44);
  // collage de productos recortados (originales de la plantilla 2025)
  [["producto-display-pop.png", 140, 205, 110, 200], ["producto-05.png", 250, 290, 120, 110], ["producto-07.png", 360, 230, 140, 110], ["producto-12.png", 500, 300, 150, 100], ["producto-09.png", 640, 220, 100, 110], ["producto-03.png", 730, 300, 130, 140], ["producto-16.png", 330, 350, 140, 110], ["producto-pallet.png", 800, 220, 90, 100]].forEach(([f, x, y, w, h], i) => {
    const e = enc(f, x, y, w, h);
    s.addImage({ path: e.path, x: p(e.x), y: p(e.y), w: p(e.w), h: p(e.h), shadow: { type: "outer", color: "1F497D", opacity: 0.22, blur: 10, offset: 4, angle: 90 }, altText: "Producto de packaging", objectName: "Producto " + (i + 1) });
  });
  s.addNotes("Collage con productos recortados de la plantilla 2025. Reemplazar por los productos del cliente o de la unidad (PNG sin fondo, con sombra).");

  // 11. Timeline
  pres.addSection({ title: "Automatización" });
  s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Automatización" });
  s.addText([{ text: "CAJAS ", options: { fontFace: LIGHT } }, { text: "armadas", options: { bold: true } }], { placeholder: "title" });
  // arcos punteados
  s.addShape(SH.arc, { x: p(70), y: p(170), w: p(380), h: p(320), angleRange: [180, 300], line: { color: HX.celeste, width: 3, dashType: "sysDot" }, objectName: "Arco 2025" });
  s.addShape(SH.arc, { x: p(470), y: p(150), w: p(380), h: p(300), angleRange: [20, 160], line: { color: C.accent1, width: 3, dashType: "sysDot" }, objectName: "Arco 2026" });
  s.addText("2025", { x: p(40), y: p(440), w: p(160), h: p(50), fontFace: CIFRAS, fontSize: 40, bold: true, color: C.accent3, margin: 0, isTextBox: true });
  s.addText("Año base", { x: p(40), y: p(488), w: p(160), h: p(24), fontSize: 15, color: C.accent3, margin: 0, isTextBox: true });
  s.addText("2026", { x: p(760), y: p(120), w: p(160), h: p(50), fontFace: CIFRAS, fontSize: 40, bold: true, color: HX.corrOsc, align: "right", margin: 0, isTextBox: true });
  s.addText("Proyectado", { x: p(760), y: p(168), w: p(160), h: p(24), fontSize: 15, color: HX.corrOsc, align: "right", margin: 0, isTextBox: true });
  s.addShape(SH.ellipse, { x: p(420), y: p(250), w: p(100), h: p(100), fill: { color: C.background2 }, line: { type: "none" }, objectName: "Halo bisagra" });
  circIcon(s, "corrugado", 430, 260, 80);
  [[90, 230, 120, "94 M", "cajas armadas · Argentina"], [230, 160, 110, "6,2 M", "cajas · Chile y Perú"], [250, 340, 110, "125", "máquinas proyectadas"]].forEach(([x, y, d, a, b]) => {
    s.addText([{ text: a, options: { fontFace: CIFRAS, fontSize: 22, bold: true, breakLine: true } }, { text: b, options: { fontSize: 11 } }], { shape: SH.ellipse, x: p(x), y: p(y), w: p(d), h: p(d), fill: { color: C.background2 }, line: { type: "none" }, color: C.text1, align: "center", valign: "middle", margin: 6, objectName: "Hito " + a });
  });
  [[560, 200, "118 M", "cajas armadas · Argentina (+25 %)"], [700, 300, "13,5 M", "cajas · Chile y Perú"], [560, 380, "125", "máquinas por mercado"]].forEach(([x, y, a, b]) => {
    s.addText([{ text: a, options: { fontFace: CIFRAS, fontSize: 22, bold: true, breakLine: true } }, { text: b, options: { fontSize: 12 } }], { x: p(x), y: p(y), w: p(180), h: p(60), color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
  });
  s.addNotes("Cifras del institucional 2026 (Automation Solutions): millones de cajas armadas por las máquinas de Cartocor en clientes.");

  // 12. Tres columnas
  pres.addSection({ title: "Sostenibilidad" });
  s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Sostenibilidad" });
  s.addText([{ text: "FOCO EN ", options: { fontFace: LIGHT } }, { text: "Sostenibilidad", options: { bold: true } }], { placeholder: "title" });
  const cols3 = [[C.accent2, "Abastecimiento", "sostenible", ["Más de 10.000 ha protegidas", "Conservación de la biodiversidad", "Certificaciones PEFC y FSC"]],
    [C.accent1, "Economía", "circular", ["60 % de la energía usada es renovable", "Procesamiento de polietileno posconsumo", "Más de 180.000 t de cartón reciclado por año"]],
    [C.accent4, "Cuidado del", "ambiente", ["Recuperación de 4.700 ha de bosque nativo", "14 % menos emisiones de CO₂ en transporte desde 2017", "600.000 plantines producidos por año"]]];
  cols3.forEach(([colr, sup, tit, items], i) => {
    const x = 50 + i * 296;
    s.addShape(SH.roundRect, { x: p(x), y: p(200), w: p(268), h: p(300), rectRadius: p(28), fill: { color: C.background2 }, line: { type: "none" }, objectName: "Panel " + tit });
    s.addShape(SH.ellipse, { x: p(x + 24), y: p(130), w: p(220), h: p(110), fill: { color: C.background1 }, line: { color: colr, width: 3.5 }, rotate: -4, objectName: "Elipse " + tit });
    s.addShape(SH.ellipse, { x: p(x + 28), y: p(133), w: p(214), h: p(104), fill: { type: "none" }, line: { color: colr, width: 1.6 }, rotate: 3, objectName: "Elipse trazo " + tit });
    s.addText([{ text: sup + " ", options: { fontSize: 15 } }, { text: tit, options: { fontSize: 20, bold: true } }], { x: p(x + 40), y: p(140), w: p(188), h: p(90), color: C.text1, align: "center", valign: "middle", margin: 0, isTextBox: true });
    s.addText(items.map((t, j) => ({ text: t, options: { bullet: { indent: 12 }, breakLine: j < items.length - 1 } })), { x: p(x + 22), y: p(262), w: p(228), h: p(220), fontSize: 14, color: C.text1, valign: "top", paraSpaceAfter: 8, margin: 0, isTextBox: true });
  });
  s.addNotes("Contenido de la lámina de sostenibilidad del institucional 2026.");

  // 13. Burbujas de datos
  s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Sostenibilidad" });
  s.addText([{ text: "SOSTENIBILIDAD ", options: { fontFace: LIGHT } }, { text: "en cifras", options: { bold: true } }], { placeholder: "title" });
  s.addImage({ path: fit(IMG + "bosque.jpg", 520, 620), x: p(560), y: p(-40), w: p(520), h: p(620), rounding: true, altText: "Plantación de pinos", objectName: "Foto bosque" });
  [[60, 160, 190, C.accent1, "60 %", "energía renovable"], [270, 140, 160, C.accent3, "180.000 t", "cartón reciclado por año"], [150, 340, 150, C.accent4, "14 %", "menos CO₂ en transporte"], [330, 320, 170, HX.corrOsc, "600.000", "plantines por año"]].forEach(([x, y, d, c, v, l]) => {
    s.addText([{ text: v, options: { fontFace: CIFRAS, fontSize: v.length > 6 ? 22 : (d > 165 ? 34 : 28), bold: true, color: c, breakLine: true } }, { text: l, options: { fontSize: 12, color: C.text1 } }], { shape: SH.ellipse, x: p(x), y: p(y), w: p(d), h: p(d), fill: { color: C.background2 }, line: { type: "none" }, align: "center", valign: "middle", margin: 10, objectName: "Burbuja " + v });
  });
  s.addNotes("El tamaño de la burbuja marca la importancia del dato, no su valor.");

  const GAL = require("./galeria.js")({ A, fit, enc, pres, C, SH, HX, U, p, ICONS, IMG, SCR, LIGHT, CIFRAS, MANO, THEME, circIcon, pillShapes, drawObjs });
  GAL.modulos();
  const ORI = require("./originales.js")({ A, fit, enc, pres, C, SH, HX, p, LIGHT, CIFRAS, MANO, circIcon });
  ORI.modulos();
  const SIS = require("./sistema.js")({ A, fit, enc, pres, C, SH, HX, p, LIGHT, CIFRAS, MANO, THEME });
  SIS.esquemas();

  // 14. Cierre
  pres.addSection({ title: "Cierre" });
  s = pres.addSlide({ masterName: "CIERRE", sectionTitle: "Cierre" });
  s.addText("¡GRACIAS!", { placeholder: "title" });
  s.addText([{ text: "QR", options: { bold: true, fontSize: 18, breakLine: true } }, { text: "cartocor.com", options: { fontSize: 9 } }], { shape: SH.roundRect, x: p(834), y: p(424), w: p(86), h: p(96), rectRadius: p(12), fill: { color: C.background1 }, line: { type: "none" }, color: C.text1, align: "center", valign: "middle", margin: 2, objectName: "Lugar del QR" });
  s.addNotes("Reemplazar el recuadro por el QR real a cartocor.com.");

  SIS.sistema();
  GAL.galeria();
  ORI.galeria();

  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("ok", OUT);
}
build().catch((e) => { console.error(e); process.exit(1); });
