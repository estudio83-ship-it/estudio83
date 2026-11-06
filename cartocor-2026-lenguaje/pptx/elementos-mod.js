// Cartocor 2026 — Elementos de diseño: íconos dibujados a mano, recursos y esquemas (todo editable).
const M = require("./iconos-mano.js");
module.exports = function (ctx) {
const { pres, fit, enc, A, IMG } = ctx;
const THEME = {
  name: "Cartocor 2026", headFontFace: "Raleway", bodyFontFace: "Raleway",
  colors: { dk1: "1F497D", lt1: "FFFFFF", dk2: "17375E", lt2: "F4F0ED", accent1: "99D25C", accent2: "EAC53A", accent3: "407BC7", accent4: "776496", accent5: "BF8527", accent6: "F79646", hlink: "407BC7", folHlink: "776496" },
};
const T = THEME.colors;
const TINTA = T.dk1, TINTA2 = T.dk2, ARENA = T.lt2, GRIS = "7F7F7F", NAR = T.accent6, CELESTE = "9EBFDE", VERDE_OSC = "5CAD3F";
const UC = { corrugado: T.accent1, papel: T.accent2, kraft: T.accent5, flexibles: T.accent3, bolsas: T.accent4, automatizacion: CELESTE, forestal: VERDE_OSC, reciclado: "B4C7E7" };
const TINT = { corrugado: "E6F3D6", papel: "FBF2D2", kraft: "F2E5CF", flexibles: "D9E5F4", bolsas: "E4E0EC", celeste: "E5EEF7" };
const LIGHT = "Raleway Light", CIFRAS = "Bahnschrift", MANO = "Om Telolet Om";
const p = (px) => +(px / 72).toFixed(4);

const SH = pres.ShapeType, C = pres.SchemeColor;
const NONE = { type: "none" };
const G = (g, k) => `G·${g}·${k}`;
let SEED = 11;

// ---------- dibujo a mano alzada ----------
function rrPts(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2); const pts = [];
  const arc = (cx, cy, a0) => { for (let k = 0; k <= 6; k++) { const a = (a0 + 90 * k / 6) * Math.PI / 180; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
  arc(x + w - r, y + r, -90); arc(x + w - r, y + h - r, 0); arc(x + r, y + h - r, 90); arc(x + r, y + r, 180);
  return { pts, closed: true, over: false };
}
// dibuja trazos (en px de diapositiva) como UNA forma libre editable
function geo(s, paths, o = {}) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  paths.forEach((P) => P.forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }));
  const w = Math.max(1, x1 - x0), h = Math.max(1, y1 - y0);
  const points = [];
  paths.forEach((P) => { P.forEach(([x, y], i) => points.push({ x: p(x - x0), y: p(y - y0), ...(i === 0 ? { moveTo: true } : {}) })); if (o.fill) points.push({ close: true }); });
  s.addShape(SH.custGeom, {
    x: p(x0), y: p(y0), w: p(w), h: p(h), points,
    fill: o.fill ? { color: o.fill, transparency: o.tr || 0 } : NONE,
    line: o.noLine ? NONE : { color: o.color || TINTA, width: o.width || 1.5, ...(o.dash ? { dashType: o.dash } : {}) },
    objectName: o.name || "Trazo",
  });
}
const handPx = (strokes, amp = 1.1) => M.hand(strokes, SEED++, amp);
// ícono de la biblioteca en una caja cuadrada
function ico(s, key, x, y, size, o = {}) {
  const k = size / 100;
  const paths = M.icono(key, o.seed).map((P) => P.map(([a, b]) => [x + a * k, y + b * k]));
  geo(s, paths, { color: o.color || TINTA, width: o.width || Math.max(1, Math.min(2.75, size / 40)), name: o.name || "Ícono " + key });
}
// marco dibujado (relleno opcional + uno o dos trazos)
function marco(s, x, y, w, h, o = {}) {
  const r = o.r ?? 22, g = o.g || "Marco " + SEED;
  if (o.fill) geo(s, handPx([rrPts(x, y, w, h, r)], 1.2), { fill: o.fill, tr: o.tr, noLine: true, name: G(g, "Relleno") });
  if (o.color !== null) {
    geo(s, handPx([rrPts(x - 3, y - 2, w + 5, h + 3, r)], o.amp || 1.3), { color: o.color || TINTA, width: o.width || 1.4, name: G(g, "Trazo 1") });
    if (o.double !== false) geo(s, handPx([rrPts(x + 1, y + 2, w - 1, h - 3, r)], o.amp || 1.3), { color: o.color2 || o.color || TINTA2, width: (o.width || 1.4) * 0.75, name: G(g, "Trazo 2") });
  }
}
function circulo(s, cx, cy, r, o = {}) {
  const g = o.g || "Círculo " + SEED;
  if (o.fill) geo(s, handPx([{ ...M.E(cx, cy, r, r), closed: true, loop: false }], o.amp ?? 0.9), { fill: o.fill, tr: o.tr, noLine: true, name: G(g, "Relleno") });
  if (o.color !== null && o.color !== undefined) geo(s, handPx([M.E(cx + 0.6, cy - 0.4, r + 1.5, r + 1, -20, 350)], o.amp ?? 0.9), { color: o.color, width: o.width || 1.4, name: G(g, "Trazo") });
}
// ícono de unidad estilo 2026: círculo de color desplazado + dibujo en tinta encima
function icoUnidad(s, key, x, y, d, col, g) {
  g = g || "Ícono " + key;
  circulo(s, x + d * 0.43, y + d * 0.53, d * 0.43, { fill: col, g, amp: 0.6 });
  ico(s, key, x + d * 0.17, y - d * 0.02, d * 0.84, { name: G(g, "Dibujo") });
}
const txt = (s, t, x, y, w, h, o = {}) => s.addText(t, { x: p(x), y: p(y), w: p(w), h: p(h), margin: 0, isTextBox: true, fontSize: 11, color: TINTA, fontFace: "Raleway", ...o });
const cap = (s, t, x, y, w = 200, al = "left") => txt(s, t, x, y, w, 14, { fontSize: 8.5, italic: true, color: GRIS, align: al, objectName: "Rótulo" });
const titulo = (s, a, b) => s.addText(b ? [{ text: a + " ", options: { fontFace: LIGHT } }, { text: b, options: { bold: true } }] : [{ text: a, options: { bold: true } }], { placeholder: "title" });
function flecha(s, strokePts, o = {}) {
  const st = { pts: strokePts, over: false };
  geo(s, handPx([st, M.head(st, o.head || 9, 30)], o.amp || 1), { color: o.color || TINTA, width: o.width || 1.6, name: o.name || "Flecha dibujada", dash: o.dash });
}
const curva = (...c) => M.C(...c).pts;

// ---------- patrones ----------
function pillShapes(x, y, w, h) {
  const r = p(h) / 2;
  return [
    { rect: { x: p(x), y: p(y), w: p(w), h: p(h), fill: { color: ARENA }, line: NONE, rectRadius: r } },
    { roundRect: { x: p(x - 6), y: p(y - 4), w: p(w + 14), h: p(h + 6), rectRadius: r, fill: NONE, line: { color: TINTA, width: 1.4 }, rotate: -1.3 } },
    { roundRect: { x: p(x + 2), y: p(y + 1), w: p(w + 1), h: p(h + 5), rectRadius: r, fill: NONE, line: { color: TINTA2, width: 1.1 }, rotate: 0.9 } },
  ];
}
function masters() {
  const cj = enc("caja-dibujada.png", 30, 14, 80, 60), lg = enc("logo-cartocor-color.png", 850, 498, 76, 30);
  const pill = (x, y, w, h) => [
    { text: { text: "", options: { shape: SH.roundRect, x: p(x), y: p(y), w: p(w), h: p(h), rectRadius: p(h) / 2, fill: { color: ARENA }, line: NONE } } },
    { text: { text: "", options: { shape: SH.roundRect, x: p(x - 6), y: p(y - 4), w: p(w + 14), h: p(h + 6), rectRadius: p(h) / 2, fill: NONE, line: { color: TINTA, width: 1.4 }, rotate: -1.3 } } },
    { text: { text: "", options: { shape: SH.roundRect, x: p(x + 2), y: p(y + 1), w: p(w + 1), h: p(h + 5), rectRadius: p(h) / 2, fill: NONE, line: { color: TINTA2, width: 1.1 }, rotate: 0.9 } } },
  ];
  pres.defineSlideMaster({
    title: "ELEMENTOS", background: { color: "FFFFFF" },
    objects: [
      ...pill(84, 32, 420, 50),
      { image: { path: cj.path, x: p(cj.x), y: p(cj.y), w: p(cj.w), h: p(cj.h), altText: "Caja dibujada" } },
      { placeholder: { options: { name: "title", type: "title", x: p(100), y: p(32), w: p(390), h: p(50), fontSize: 22, color: TINTA, align: "center", valign: "middle", margin: 0, fontFace: "Raleway" }, text: "CONTEXTO Clave" } },
      { text: { text: "Cartocor 2026 · Elementos de diseño", options: { x: p(40), y: p(510), w: p(300), h: p(14), fontSize: 8, color: GRIS, margin: 0 } } },
      { image: { path: lg.path, x: p(lg.x), y: p(lg.y), w: p(lg.w), h: p(lg.h), altText: "Cartocor" } },
    ],
  });
  pres.defineSlideMaster({
    title: "SEPARADOR DIBUJADO", background: { color: "FFFFFF" },
    objects: [
      { text: { text: "", options: { shape: SH.ellipse, x: p(-180), y: p(-120), w: p(760), h: p(760), fill: { color: ARENA }, line: NONE } } },
      { placeholder: { options: { name: "title", type: "title", x: p(80), y: p(170), w: p(520), h: p(110), fontFace: MANO, fontSize: 60, color: TINTA, margin: 0, valign: "bottom" }, text: "Sección" } },
      { placeholder: { options: { name: "body", type: "body", x: p(80), y: p(290), w: p(420), h: p(60), fontSize: 15, color: GRIS, margin: 0, valign: "top" }, text: "Bajada de la sección" } },
      { image: { path: lg.path, x: p(lg.x), y: p(lg.y), w: p(lg.w), h: p(lg.h), altText: "Cartocor" } },
    ],
  });
  const esq = enc("esquina-doblada.png", 852, 415, 108, 137), lb = enc("logo-cartocor-blanco.png", 60, 440, 140, 60);
  pres.defineSlideMaster({
    title: "PORTADA ELEMENTOS", background: { path: IMG + "portada.jpg" },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: p(60), y: p(140), w: p(600), h: p(110), fontSize: 40, bold: true, color: "FFFFFF", margin: 0, valign: "bottom" }, text: "TÍTULO" } },
      { placeholder: { options: { name: "body", type: "body", x: p(60), y: p(258), w: p(560), h: p(60), fontFace: LIGHT, fontSize: 20, color: "FFFFFF", margin: 0, valign: "top" }, text: "Subtítulo" } },
      { image: { path: lb.path, x: p(lb.x), y: p(lb.y), w: p(lb.w), h: p(lb.h), altText: "Cartocor" } },
      { image: { path: esq.path, x: p(esq.x), y: p(esq.y), w: p(esq.w), h: p(esq.h), altText: "Esquina doblada" } },
    ],
  });
}
const slide = (sec, notas) => { const s = pres.addSlide({ masterName: "ELEMENTOS", sectionTitle: sec }); if (notas) s.addNotes(notas); return s; };
function separador(t, b, sec, icons) {
  pres.addSection({ title: sec });
  const s = pres.addSlide({ masterName: "SEPARADOR DIBUJADO", sectionTitle: sec });
  s.addText(t, { placeholder: "title" }); s.addText(b, { placeholder: "body" });
  icons.forEach(([k, x, y, d, c]) => icoUnidad(s, k, x, y, d, c));
  return s;
}

// =====================================================================
const NEG = [["corrugado", "Cartón corrugado", "Cartocor"], ["papel", "Papel reciclado", "Zucamor"], ["kraft", "Papel kraft", "Papel Misionero"], ["flexibles", "Envases flexibles", "Converflex"], ["bolsas", "Bolsas industriales", "Puntapel · Zucamor"], ["automatizacion", "Automatización", "Máquinas en clientes"], ["forestal", "Forestal", "23.000 ha propias"], ["reciclado", "Economía circular", "Cartón que vuelve a ser papel"]];
function iconos() {
  let s;
  // ---------- 2. Cómo se dibujan ----------
  pres.addSection({ title: "Íconos" });
  s = slide("Íconos", "Reglas de construcción de los íconos. Para cambiar el color: Formato de forma › Contorno. Para el grosor: Contorno › Grosor. Nunca rellenar el dibujo: el relleno va en el círculo de atrás.");
  titulo(s, "CÓMO SE", "dibujan");
  geo(s, [rrPts(40, 104, 300, 300, 26).pts.concat([rrPts(40, 104, 300, 300, 26).pts[0]])], { fill: ARENA, noLine: true, name: G("Grilla", "Fondo") });
  for (let i = 0; i <= 10; i++) {
    s.addShape(SH.line, { x: p(60 + i * 26), y: p(124), w: 0, h: p(260), line: { color: "D9D9D9", width: 0.5 }, objectName: G("Grilla", "V" + i) });
    s.addShape(SH.line, { x: p(60), y: p(124 + i * 26), w: p(260), h: 0, line: { color: "D9D9D9", width: 0.5 }, objectName: G("Grilla", "H" + i) });
  }
  ico(s, "corrugado", 60, 124, 260, { width: 3.2, name: G("Grilla", "Ícono") });
  cap(s, "Grilla de 100 × 100 · el dibujo ocupa todo el cuadro", 40, 410, 300);
  const reglas = [
    ["Una sola línea, sin relleno", "Contorno abierto como un dibujo a lápiz. El color de fondo va en un círculo aparte."],
    ["Trazo de 1,5 a 2,75 pt", "Proporcional al tamaño: 1,5 pt hasta 60 px, 2,25 pt a 100 px. Puntas y uniones redondeadas."],
    ["Temblor natural y sobrepaso", "Las rectas no son perfectas y se pasan un poco en las esquinas, como a mano alzada."],
    ["Perspectiva y volumen", "Cajas, bobinas y bolsas se dibujan en tres cuartos, como la caja del institucional."],
    ["Tinta, color de unidad o blanco", "Tinta sobre fondos claros, blanco sobre círculos de color. Nunca degradados."],
  ];
  reglas.forEach(([t, d], i) => {
    const y = 104 + i * 80, g = "Regla " + (i + 1);
    s.addText(String(i + 1), { shape: SH.ellipse, x: p(380), y: p(y + 4), w: p(30), h: p(30), fill: { color: TINTA }, line: NONE, fontFace: CIFRAS, bold: true, fontSize: 13, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: G(g, "Número") });
    txt(s, t, 424, y + 2, 300, 20, { bold: true, fontSize: 13, objectName: G(g, "Título") });
    txt(s, d, 424, y + 24, 320, 36, { fontSize: 10, color: GRIS, objectName: G(g, "Texto") });
  });
  // demos a la derecha
  ico(s, "papel", 790, 100, 56, { width: 1.6 });
  [1, 1.75, 2.75].forEach((w, i) => geo(s, handPx([M.L(770 + i * 4, 196 + i * 12, 900, 192 + i * 12)], 0.8), { width: w, name: "Grosor " + w }));
  geo(s, handPx([M.L(790, 270, 790, 330, 870, 330)], 1), { width: 2.2, name: "Esquina con sobrepaso" });
  ico(s, "flexibles", 770, 352, 50, { color: TINTA }); ico(s, "flexibles", 826, 352, 50, { color: T.accent3 });
  circulo(s, 905, 377, 26, { fill: T.accent3 }); ico(s, "flexibles", 885, 357, 40, { color: "FFFFFF" });

  // ---------- 3. Íconos de negocio ----------
  s = slide("Íconos", "Ícono de cada negocio en el estilo 2026: círculo del color de la unidad desplazado y dibujo en tinta por encima. Cada ícono es un grupo de dos formas.");
  titulo(s, "ÍCONOS de negocio");
  NEG.forEach(([k, n, b], i) => {
    const c = i % 4, r = Math.floor(i / 4), x = 70 + c * 220, y = 108 + r * 200, g = "Negocio " + n;
    icoUnidad(s, k, x + 25, y, 120, UC[k], g);
    txt(s, n, x - 10, y + 132, 190, 20, { bold: true, fontSize: 14, align: "center", objectName: G(g, "Nombre") });
    txt(s, b, x - 10, y + 153, 190, 16, { fontSize: 10, color: GRIS, align: "center", objectName: G(g, "Bajada") });
  });

  // ---------- 4. Variantes ----------
  s = slide("Íconos", "Cinco tratamientos para el mismo dibujo. Elegir uno por diapositiva y no mezclarlos.");
  titulo(s, "VARIANTES de uso");
  const filas = ["Línea tinta", "Línea en color", "Círculo desplazado", "Blanco sobre color", "Sello dibujado"];
  filas.forEach((f, r) => {
    const y = 96 + r * 80;
    if (r % 2 === 0) s.addShape(SH.roundRect, { x: p(36), y: p(y + 2), w: p(888), h: p(76), rectRadius: p(38), fill: { color: "FAF8F6" }, line: NONE, objectName: "Franja" });
    txt(s, f, 52, y + 30, 110, 20, { bold: true, fontSize: 11 });
    NEG.forEach(([k], i) => {
      const cx = 205 + i * 92, cy = y + 40, col = UC[k];
      if (r === 0) ico(s, k, cx - 28, cy - 28, 56);
      if (r === 1) ico(s, k, cx - 28, cy - 28, 56, { color: k === "papel" ? "D4A92A" : k === "reciclado" ? T.accent3 : col });
      if (r === 2) icoUnidad(s, k, cx - 32, cy - 34, 64, col);
      if (r === 3) { circulo(s, cx, cy, 31, { fill: k === "reciclado" ? T.accent3 : col, g: "Blanco " + k }); ico(s, k, cx - 21, cy - 21, 42, { color: "FFFFFF", name: G("Blanco " + k, "Dibujo") }); }
      if (r === 4) { circulo(s, cx, cy, 32, { fill: ARENA, color: TINTA, width: 1.2, g: "Sello " + k }); ico(s, k, cx - 21, cy - 21, 42, { name: G("Sello " + k, "Dibujo") }); }
    });
  });
  NEG.forEach(([k, n], i) => cap(s, n, 205 + i * 92 - 45, 498, 90, "center"));

  // ---------- 5. Fichas de negocio ----------
  s = slide("Íconos", "Ficha por negocio: marco dibujado con tinte de la unidad, ícono, cifra en Bahnschrift y dos líneas de detalle. Cifras del institucional 2026.");
  titulo(s, "FICHAS de negocio");
  const fichas = [["corrugado", "Cartón corrugado", "Cartocor", "900 M", "m² de cartón por año", "Cajas, bandejas y displays para fruta, carnes y bebidas."], ["papel", "Papel reciclado", "Zucamor", "175 KTn", "de papel reciclado por año", "Bobinas para corrugado con fibra recuperada."], ["kraft", "Papel kraft", "Papel Misionero", "85 KTn", "de papel kraft por año", "Fibra virgen de bosque propio para bolsas y sacos."], ["flexibles", "Envases flexibles", "Converflex", "15.000 t", "de material flexible por año", "Doypacks, films y laminados para alimentos."], ["bolsas", "Bolsas industriales", "Puntapel · Zucamor", "270 M", "de bolsas por año", "Bolsas multipliego para cemento, cal y agro."]];
  fichas.forEach(([k, n, b, v, u, d], i) => {
    const x = 40 + i * 178, y = 106, w = 164, h = 390, g = "Ficha " + n;
    marco(s, x, y, w, h, { fill: TINT[k], color: UC[k], color2: TINTA, r: 26, g });
    icoUnidad(s, k, x + 27, y + 22, 106, UC[k], g + " ícono");
    txt(s, n, x + 8, y + 140, w - 16, 20, { bold: true, fontSize: 13.5, align: "center", objectName: G(g + " texto", "Nombre") });
    txt(s, b, x + 8, y + 161, w - 16, 16, { fontSize: 10, color: GRIS, align: "center", objectName: G(g + " texto", "Marca") });
    geo(s, handPx([M.L(x + 30, y + 190, x + w - 30, y + 192)], 0.7), { color: UC[k], width: 1.4, name: G(g + " texto", "Divisor") });
    txt(s, v, x + 8, y + 202, w - 16, 40, { fontFace: CIFRAS, bold: true, fontSize: 30, align: "center", objectName: G(g + " texto", "Cifra") });
    txt(s, u, x + 8, y + 244, w - 16, 16, { fontSize: 10, align: "center", objectName: G(g + " texto", "Unidad") });
    txt(s, d, x + 16, y + 280, w - 32, 70, { fontSize: 10, color: GRIS, align: "center", objectName: G(g + " texto", "Detalle") });
  });

  // ---------- 6. Mercados ----------
  s = slide("Íconos", "Íconos de los mercados que atiende Cartocor. Sobre sello arena dibujado; se pueden usar solos en tinta.");
  titulo(s, "ÍCONOS de mercados");
  M.GRUPOS.mercados.forEach(([k, n], i) => {
    const c = i % 6, r = Math.floor(i / 6), cx = 110 + c * 148, cy = 180 + r * 196, g = "Mercado " + n;
    circulo(s, cx, cy, 58, { fill: ARENA, g, amp: 1.2 });
    ico(s, k, cx - 42, cy - 42, 84, { name: G(g, "Dibujo") });
    txt(s, n, cx - 70, cy + 68, 140, 20, { bold: true, fontSize: 12, align: "center", objectName: G(g, "Nombre") });
  });

  // ---------- 7. Corporativos ----------
  s = slide("Íconos", "Íconos corporativos, de sostenibilidad y de gestión. Mismo trazo que los de negocio.");
  titulo(s, "ÍCONOS", "corporativos");
  M.GRUPOS.corporativos.forEach(([k, n], i) => {
    const c = i % 8, r = Math.floor(i / 8), x = 52 + c * 110, y = 104 + r * 134;
    ico(s, k, x + 10, y, 70);
    txt(s, n, x - 10, y + 80, 110, 16, { fontSize: 10, color: GRIS, align: "center" });
  });
  txt(s, [{ text: "Tip: ", options: { bold: true } }, { text: "para pasar un ícono a blanco o a color de unidad, seleccionarlo y cambiar el Contorno de forma." }], 720, 380, 200, 70, { fontSize: 10, color: GRIS, valign: "middle" });

}
function recursos() {
  let s;
  // ---------- 8. Separador recursos ----------
  separador("Recursos dibujados", "Anotaciones, marcos, sellos y etiquetas a mano alzada.", "Recursos dibujados", [["forestal", 640, 150, 120, VERDE_OSC], ["kraft", 780, 250, 100, T.accent5], ["corrugado", 650, 320, 110, T.accent1]]);

  // ---------- 9. Anotaciones ----------
  s = slide("Recursos dibujados", "Anotaciones para señalar, enfatizar y conectar. Son formas libres: se estiran, se giran y se recolorean.");
  titulo(s, "ANOTACIONES a mano");
  const cel = (i) => ({ x: 40 + (i % 4) * 225, y: 100 + Math.floor(i / 4) * 138 });
  let q = cel(0); flecha(s, curva(q.x + 10, q.y + 90, q.x + 70, q.y + 30, q.x + 150, q.y + 26, q.x + 190, q.y + 60)); cap(s, "Flecha curva", q.x, q.y + 112);
  q = cel(1); flecha(s, curva(q.x + 10, q.y + 80, q.x + 70, q.y + 76, q.x + 100, q.y + 40, q.x + 80, q.y + 20, q.x + 62, q.y + 42, q.x + 100, q.y + 70, q.x + 190, q.y + 60)); cap(s, "Flecha con bucle", q.x, q.y + 112);
  q = cel(2); { const st = { pts: curva(q.x + 20, q.y + 60, q.x + 100, q.y + 40, q.x + 180, q.y + 60), over: false }; const rev = { pts: st.pts.slice().reverse(), over: false }; geo(s, handPx([st, M.head(st, 9), M.head(rev, 9)], 1), { width: 1.6, name: "Flecha doble" }); } cap(s, "Flecha doble", q.x, q.y + 112);
  q = cel(3); flecha(s, [[q.x + 20, q.y + 20], [q.x + 60, q.y + 80], [q.x + 100, q.y + 30], [q.x + 140, q.y + 86], [q.x + 190, q.y + 50]], { color: NAR }); cap(s, "Flecha en zigzag (acento)", q.x, q.y + 112);
  q = cel(4); txt(s, "clave", q.x + 50, q.y + 36, 110, 34, { bold: true, fontSize: 20, align: "center" }); geo(s, handPx([M.E(q.x + 105, q.y + 53, 70, 30, -30, 345)], 1.2), { color: NAR, width: 2, name: "Círculo de énfasis" }); cap(s, "Círculo de énfasis", q.x, q.y + 112);
  q = cel(5); txt(s, "Subrayados", q.x + 20, q.y + 10, 180, 22, { bold: true, fontSize: 15 }); geo(s, handPx([M.L(q.x + 20, q.y + 40, q.x + 180, q.y + 38)], 1), { color: T.accent1, width: 2.4, name: "Subrayado" });
  geo(s, handPx([M.L(q.x + 20, q.y + 60, q.x + 180, q.y + 58), M.L(q.x + 24, q.y + 66, q.x + 176, q.y + 65)], 0.9), { color: T.accent3, width: 1.6, name: "Subrayado doble" });
  geo(s, handPx([M.onda(q.x + 20, q.y + 86, q.x + 180, q.y + 86, 7, 3)], 0.6), { color: T.accent4, width: 1.8, name: "Subrayado ondulado" }); cap(s, "Simple · doble · ondulado", q.x, q.y + 112);
  q = cel(6); geo(s, handPx([M.L(q.x + 30, q.y + 50, q.x + 50, q.y + 74, q.x + 90, q.y + 24)], 1), { color: VERDE_OSC, width: 3, name: "Tilde" }); geo(s, handPx([M.L(q.x + 130, q.y + 26, q.x + 180, q.y + 76), M.L(q.x + 180, q.y + 24, q.x + 132, q.y + 78)], 1), { color: "C0504D", width: 3, name: "Cruz" }); cap(s, "Tilde y cruz", q.x, q.y + 112);
  q = cel(7); { const st = [], cx = q.x + 60, cy = q.y + 50; for (let k = 0; k < 5; k++) { const a = (-90 + k * 144) * Math.PI / 180; st.push([cx + 34 * Math.cos(a), cy + 34 * Math.sin(a)]); } geo(s, handPx([{ pts: st, closed: true, over: true }], 0.9), { color: T.accent2, width: 2, name: "Estrella" }); }
  { const cx = q.x + 160, cy = q.y + 50; geo(s, handPx([0, 60, 120].map((a) => { const r = a * Math.PI / 180; return M.L(cx - 20 * Math.cos(r), cy - 20 * Math.sin(r), cx + 20 * Math.cos(r), cy + 20 * Math.sin(r)); }), 0.7), { color: TINTA, width: 2, name: "Asterisco" }); }
  geo(s, handPx([M.L(q.x + 112, q.y + 14, q.x + 120, q.y + 26), M.L(q.x + 100, q.y + 36, q.x + 112, q.y + 40), M.L(q.x + 126, q.y + 10, q.x + 128, q.y + 22)], 0.5), { color: NAR, width: 1.8, name: "Chispas" }); cap(s, "Estrella · asterisco · chispas", q.x, q.y + 112);
  q = cel(8); ["Primer punto", "Segundo punto", "Tercer punto"].forEach((t, k) => txt(s, t, q.x + 20, q.y + 14 + k * 26, 120, 20, { fontSize: 11 }));
  geo(s, handPx([{ pts: curva(q.x + 140, q.y + 12, q.x + 152, q.y + 18, q.x + 150, q.y + 44, q.x + 162, q.y + 50, q.x + 150, q.y + 56, q.x + 152, q.y + 82, q.x + 140, q.y + 88), over: false }], 0.6), { width: 1.6, name: "Llave" });
  txt(s, "Grupo", q.x + 168, q.y + 40, 50, 20, { bold: true, fontSize: 11 }); cap(s, "Llave para agrupar", q.x, q.y + 112);
  q = cel(9); [T.accent1, T.accent2, T.accent3, T.accent4].forEach((c, k) => { const cx = q.x + 30 + k * 48, g = "Número " + (k + 1); circulo(s, cx, q.y + 50, 18, { color: c, width: 2, g }); txt(s, String(k + 1), cx - 18, q.y + 32, 36, 36, { fontFace: CIFRAS, bold: true, fontSize: 18, align: "center", valign: "middle", objectName: G(g, "Cifra") }); }); cap(s, "Números en círculo dibujado", q.x, q.y + 112);
  q = cel(10); geo(s, handPx([{ pts: [[q.x + 16, q.y + 40], [q.x + 196, q.y + 34], [q.x + 200, q.y + 64], [q.x + 14, q.y + 70]], closed: true, over: false }], 2), { fill: T.accent2, tr: 45, noLine: true, name: G("Resaltado", "Marcador") }); txt(s, "Texto resaltado", q.x + 20, q.y + 40, 180, 26, { bold: true, fontSize: 15, objectName: G("Resaltado", "Texto") }); cap(s, "Resaltador amarillo (45 % transparente)", q.x, q.y + 112);
  q = cel(11); flecha(s, curva(q.x + 14, q.y + 80, q.x + 60, q.y + 40, q.x + 120, q.y + 70, q.x + 190, q.y + 26), { dash: "dash", color: TINTA }); s.addShape(SH.ellipse, { x: p(q.x + 8), y: p(q.y + 74), w: p(12), h: p(12), fill: { color: NAR }, line: NONE, objectName: "Punto de inicio" }); cap(s, "Camino punteado", q.x, q.y + 112);

  // ---------- 10. Marcos y etiquetas ----------
  s = slide("Recursos dibujados", "Contenedores dibujados. El relleno y los dos trazos son formas separadas dentro de un grupo: se puede cambiar el color de cada una.");
  titulo(s, "MARCOS y etiquetas");
  marco(s, 50, 112, 190, 120, { fill: ARENA, g: "Marco arena" }); txt(s, "Marco arena · doble trazo", 66, 160, 160, 24, { fontSize: 11, align: "center" });
  marco(s, 270, 112, 190, 120, { fill: TINT.corrugado, color: T.accent1, color2: TINTA, g: "Marco unidad" }); txt(s, "Marco de unidad", 286, 160, 160, 24, { fontSize: 11, align: "center" });
  { const g = "Globo de diálogo", x = 492, y = 112, w = 200, h = 100; const P = rrPts(x, y, w, h, 24).pts; const i = P.findIndex((q2) => q2[1] > y + h - 1 && q2[0] < x + 60); const pts = P.slice(0, 14).concat([[x + 70, y + h], [x + 40, y + h + 28], [x + 50, y + h]]).concat(P.slice(14)); geo(s, handPx([{ pts, closed: true, over: false }], 1.2), { fill: "FFFFFF", color: TINTA, width: 1.5, name: G(g, "Globo") }); txt(s, "Globo de diálogo para citas", x + 16, y + 30, w - 32, 40, { fontSize: 11, align: "center", objectName: G(g, "Texto") }); }
  { const g = "Nota adhesiva"; s.addShape(SH.rect, { x: p(740), y: p(110), w: p(150), h: p(140), fill: { color: "FFF2B3" }, line: NONE, rotate: 3, shadow: { type: "outer", color: "1F497D", opacity: 0.18, blur: 6, offset: 3, angle: 90 }, objectName: G(g, "Papel") }); s.addShape(SH.rect, { x: p(785), y: p(100), w: p(62), h: p(20), fill: { color: "D9D9D9", transparency: 35 }, line: NONE, rotate: -4, objectName: G(g, "Cinta") }); txt(s, "Nota adhesiva con cinta", 752, 150, 126, 50, { fontFace: MANO, fontSize: 22, align: "center", rotate: 3, objectName: G(g, "Texto") }); }
  // sello dentado
  { const g = "Sello", cx = 140, cy = 380, pts = []; for (let k = 0; k < 48; k++) { const a = k / 48 * Math.PI * 2, r = k % 2 ? 78 : 70; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } geo(s, handPx([{ pts, closed: true, over: false }], 0.6), { fill: T.accent1, noLine: true, name: G(g, "Dentado") }); circulo(s, cx, cy, 58, { color: "FFFFFF", width: 1.4, g }); ico(s, "reciclado", cx - 26, cy - 46, 52, { color: "FFFFFF", name: G(g, "Ícono") }); txt(s, "100 % reciclable", cx - 50, cy + 8, 100, 30, { bold: true, fontSize: 12, color: "FFFFFF", align: "center", objectName: G(g, "Texto") }); }
  // cinta
  { const g = "Cinta", x = 260, y = 350, w = 250, h = 54; geo(s, handPx([{ pts: [[x - 30, y + 14], [x, y + 14], [x, y + h + 10], [x - 30, y + h + 10], [x - 16, y + 37]], closed: true, over: false }, { pts: [[x + w + 30, y + 14], [x + w, y + 14], [x + w, y + h + 10], [x + w + 30, y + h + 10], [x + w + 16, y + 37]], closed: true, over: false }], 0.8), { fill: TINTA2, noLine: true, name: G(g, "Puntas") }); geo(s, handPx([{ pts: [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], closed: true, over: false }], 1), { fill: TINTA, noLine: true, name: G(g, "Banda") }); txt(s, "PACKAGING SOSTENIBLE", x, y, w, h, { bold: true, fontSize: 14, color: "FFFFFF", align: "center", valign: "middle", objectName: G(g, "Texto") }); }
  // etiqueta colgante
  { const g = "Etiqueta", x = 580, y = 330; geo(s, handPx([{ pts: [[x + 30, y], [x + 150, y], [x + 150, y + 110], [x + 30, y + 110], [x, y + 55]], closed: true, over: true }], 1), { fill: TINT.papel, color: T.accent5, width: 1.5, name: G(g, "Cartón") }); circulo(s, x + 30, y + 55, 7, { color: T.accent5, width: 1.2, g }); geo(s, handPx([M.C(x + 24, y + 55, x - 10, y + 40, x - 20, y + 10, x - 4, y - 14)], 0.6), { color: GRIS, width: 1, name: G(g, "Hilo") }); txt(s, [{ text: "Kraft", options: { bold: true, fontSize: 15, breakLine: true } }, { text: "Etiqueta colgante", options: { fontSize: 10, color: GRIS } }], x + 46, y + 30, 100, 50, { valign: "middle", objectName: G(g, "Texto") }); }
  // pills dibujadas
  [["CORRUGADO", T.accent1], ["FLEXIBLES", T.accent3], ["BOLSAS", T.accent4]].forEach(([t, c], i) => { const g = "Pill " + t, x = 780, y = 320 + i * 56; marco(s, x, y, 130, 38, { r: 19, color: c, color2: c, fill: "FFFFFF", g }); txt(s, t, x, y, 130, 38, { bold: true, fontSize: 10, color: c, align: "center", valign: "middle", charSpacing: 1, objectName: G(g, "Texto") }); });
  cap(s, "Sello dentado · cinta · etiqueta colgante · pills dibujadas", 50, 488, 400);

}
function esquemas() {
  let s;
  // ---------- 11. Separador esquemas ----------
  separador("Esquemas", "Diagramas nuevos con íconos dibujados, listos para editar.", "Esquemas", [["reciclado", 650, 150, 120, "B4C7E7"], ["datos", 790, 260, 100, CELESTE], ["objetivo", 660, 330, 100, T.accent2]]);

  // ---------- 12. Ciclo de vida ----------
  s = slide("Esquemas", "Ciclo de vida con cinco etapas sobre un círculo dibujado. Las flechas son formas libres: para cambiar una etapa, reemplazar el ícono y el texto.");
  titulo(s, "CICLO de vida");
  { const cx = 480, cy = 312, R = 168, et = [["forestal", "Bosque propio", VERDE_OSC], ["kraft", "Papel", T.accent5], ["corrugado", "Caja", T.accent1], ["ecommerce", "Consumo", T.accent3], ["reciclado", "Reciclado", T.accent4]];
    et.forEach((e, i) => { const a0 = -90 + i * 72 + 20, a1 = -90 + (i + 1) * 72 - 20; flecha(s, M.E(cx, cy, R, R, a0, a1).pts, { color: TINTA, width: 1.8, name: "Flecha ciclo " + (i + 1) }); });
    circulo(s, cx, cy, 104, { fill: ARENA, g: "Centro", amp: 1.4 });
    txt(s, "Economía circular", cx - 100, cy - 36, 200, 40, { fontFace: MANO, fontSize: 30, align: "center", objectName: G("Centro", "Título") });
    txt(s, "Del bosque a la caja y de vuelta al papel", cx - 80, cy + 8, 160, 34, { fontSize: 10.5, color: GRIS, align: "center", objectName: G("Centro", "Texto") });
    et.forEach(([k, n, c], i) => { const a = (-90 + i * 72) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a), g = "Etapa " + n;
      circulo(s, x, y, 44, { fill: "FFFFFF", color: c, width: 2.2, g });
      ico(s, k, x - 30, y - 32, 60, { name: G(g, "Ícono") });
      const right = Math.cos(a) > 0.3, left = Math.cos(a) < -0.3;
      txt(s, n, right ? x + 52 : left ? x - 182 : x - 65, right || left ? y - 10 : y + 48, 130, 20, { bold: true, fontSize: 13, align: right ? "left" : left ? "right" : "center", objectName: G(g, "Nombre") }); });
  }

  // ---------- 13. Camino del proceso ----------
  s = slide("Esquemas", "Camino de proceso en ocho paradas. El camino es una sola línea punteada; las paradas son grupos que se pueden mover sobre él.");
  titulo(s, "CAMINO del proceso");
  geo(s, handPx([{ pts: curva(60, 160, 460, 155, 860, 160, 915, 236, 860, 312, 480, 316, 100, 312, 45, 390, 100, 466, 500, 464, 880, 466), over: false }], 1.5), { color: "C9BBAA", width: 3, dash: "dash", name: "Camino" });
  { const st = [["equipo", "Necesidad", 220, 158, T.accent3], ["innovacion", "Diseño", 520, 157, T.accent2], ["corrugado", "Prototipo", 800, 159, T.accent1], ["calidad", "Ensayo", 720, 314, T.accent4], ["planta", "Producción", 420, 315, VERDE_OSC], ["automatizacion", "Armado", 150, 312, CELESTE], ["logistica", "Logística", 380, 465, T.accent5], ["ubicacion", "Entrega", 700, 465, NAR]];
    st.forEach(([k, n, x, y, c], i) => { const g = "Parada " + n; circulo(s, x, y, 30, { fill: "FFFFFF", color: c, width: 2.2, g }); ico(s, k, x - 20, y - 21, 40, { name: G(g, "Ícono"), width: 1.4 });
      s.addText(String(i + 1), { shape: SH.ellipse, x: p(x + 16), y: p(y - 34), w: p(22), h: p(22), fill: { color: c }, line: NONE, fontFace: CIFRAS, bold: true, fontSize: 10, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: G(g, "Número") });
      txt(s, n, x - 60, y + 34, 120, 18, { bold: true, fontSize: 11.5, align: "center", objectName: G(g, "Nombre") }); });
  }

  // ---------- 14. Hub de mercados ----------
  s = slide("Esquemas", "Hub con el packaging al centro y ocho mercados alrededor. Los conectores son líneas dibujadas punteadas.");
  titulo(s, "HUB de mercados");
  { const cx = 480, cy = 305, mk = ["fruta", "lacteos", "carnes", "bebidas", "golosinas", "agro", "construccion", "ecommerce"], nm = Object.fromEntries(M.GRUPOS.mercados);
    mk.forEach((k, i) => { const a = (-90 + i * 45) * Math.PI / 180, x = cx + 300 * Math.cos(a), y = cy + 160 * Math.sin(a); const d = Math.hypot(x - cx, y - cy), ux = (x - cx) / d, uy = (y - cy) / d;
      geo(s, handPx([M.L(cx + ux * 92, cy + uy * 92, x - ux * 46, y - uy * 46)], 0.8), { color: GRIS, width: 1, dash: "dash", name: "Conector " + k }); });
    circulo(s, cx, cy, 86, { fill: ARENA, color: TINTA, width: 1.5, g: "Centro hub" });
    ico(s, "corrugado", cx - 46, cy - 62, 92, { name: G("Centro hub", "Ícono") });
    txt(s, "Packaging Cartocor", cx - 70, cy + 36, 140, 20, { bold: true, fontSize: 12, align: "center", objectName: G("Centro hub", "Texto") });
    mk.forEach((k, i) => { const a = (-90 + i * 45) * Math.PI / 180, x = cx + 300 * Math.cos(a), y = cy + 160 * Math.sin(a), g = "Mercado " + k, col = [T.accent1, T.accent2, T.accent4, T.accent3, NAR, VERDE_OSC, T.accent5, CELESTE][i];
      circulo(s, x, y, 40, { fill: "FFFFFF", color: col, width: 2, g }); ico(s, k, x - 27, y - 27, 54, { name: G(g, "Ícono"), width: 1.5 });
      const lado = Math.cos(a) > 0.2 || (Math.cos(a) > -0.2 && y < cy) ? "r" : Math.cos(a) < -0.2 ? "l" : "c";
      txt(s, nm[k], lado === "r" ? x + 48 : lado === "l" ? x - 168 : x - 60, lado === "c" ? (y < cy ? y - 64 : y + 44) : y - 9, 120, 18, { bold: true, fontSize: 11.5, align: lado === "r" ? "left" : lado === "l" ? "right" : "center", objectName: G(g, "Nombre") }); });
  }

  // ---------- 15. Flujo productivo ----------
  s = slide("Esquemas", "Flujo de tres columnas: insumos, proceso y producto. Las flechas gruesas son formas libres con relleno.");
  titulo(s, "FLUJO productivo");
  { const cols = [["Insumos", T.accent5, "kraft", [["forestal", "Fibra virgen de bosque propio"], ["reciclado", "Papel y cartón recuperado"], ["agua", "Agua tratada y reutilizada"]]], ["Proceso", T.accent3, "flexibles", [["planta", "Plantas papeleras y de conversión"], ["automatizacion", "Líneas automatizadas"], ["calidad", "Control de calidad certificado"]]], ["Producto", T.accent1, "corrugado", [["corrugado", "Cajas y displays"], ["flexibles", "Envases flexibles"], ["bolsas", "Bolsas industriales"]]]];
    cols.forEach(([h, c, tk, items], i) => { const x = 40 + i * 315, y = 104, w = 250, hh = 390, g = "Columna " + h;
      marco(s, x, y, w, hh, { fill: TINT[tk], color: c, color2: TINTA, g, r: 28 });
      txt(s, h, x, y + 18, w, 30, { fontFace: MANO, fontSize: 30, align: "center", objectName: G(g + " t", "Título") });
      geo(s, handPx([M.L(x + 80, y + 54, x + w - 80, y + 55)], 0.6), { color: c, width: 2, name: G(g + " t", "Subrayado") });
      items.forEach(([k, t], j) => { const yy = y + 80 + j * 100, gg = "Ítem " + t; circulo(s, x + 54, yy + 36, 34, { fill: "FFFFFF", g: gg }); ico(s, k, x + 28, yy + 10, 52, { name: G(gg, "Ícono"), width: 1.5 }); txt(s, t, x + 98, yy + 18, w - 110, 40, { fontSize: 11.5, valign: "middle", objectName: G(gg, "Texto") }); });
      if (i < 2) { const ax = x + w + 6, ay = 290; geo(s, handPx([{ pts: [[ax, ay - 12], [ax + 34, ay - 12], [ax + 34, ay - 26], [ax + 56, ay], [ax + 34, ay + 26], [ax + 34, ay + 12], [ax, ay + 12]], closed: true, over: false }], 0.8), { fill: TINTA, color: TINTA, width: 1, name: "Flecha gruesa " + (i + 1) }); }
    });
  }

  // ---------- 16. Matriz dibujada ----------
  s = slide("Esquemas", "Matriz de dos ejes dibujada a mano con burbujas por unidad. El tamaño de la burbuja indica el peso del negocio. Datos de ejemplo.");
  titulo(s, "MATRIZ", "de crecimiento");
  flecha(s, [[100, 482], [620, 480]], { width: 1.8, name: "Eje X" }); flecha(s, [[100, 482], [102, 112]], { width: 1.8, name: "Eje Y" });
  geo(s, handPx([M.L(360, 120, 362, 470), M.L(108, 300, 610, 298)], 0.8), { color: "BFBFBF", width: 1, dash: "dash", name: "Cuadrantes" });
  txt(s, "Participación de mercado", 380, 490, 240, 16, { fontSize: 10, color: GRIS, align: "right" });
  txt(s, "Crecimiento", 40, 110, 56, 16, { fontSize: 10, color: GRIS, align: "right" });
  [["Estrellas", 470, 130], ["Apuestas", 130, 130], ["Base", 470, 446], ["Revisar", 130, 446]].forEach(([t, x, y]) => txt(s, t, x, y, 120, 24, { fontFace: MANO, fontSize: 22, color: "A6A6A6" }));
  [["corrugado", 470, 220, 62], ["flexibles", 250, 210, 44], ["bolsas", 470, 380, 48], ["papel", 230, 380, 40], ["kraft", 320, 300, 34]].forEach(([k, x, y, r]) => { const g = "Burbuja " + k; circulo(s, x, y, r, { fill: UC[k], tr: 15, g }); ico(s, k, x - r * 0.62, y - r * 0.66, r * 1.24, { color: "FFFFFF", name: G(g, "Ícono"), width: Math.max(1.2, r / 30) }); });
  marco(s, 670, 110, 250, 370, { fill: ARENA, g: "Leyenda" });
  NEG.slice(0, 5).forEach(([k, n], i) => { const y = 136 + i * 66, g = "Leyenda " + n; circulo(s, 700, y + 18, 14, { fill: UC[k], g }); txt(s, n, 724, y + 6, 180, 18, { bold: true, fontSize: 11.5, objectName: G(g, "Nombre") }); txt(s, "Texto breve del negocio", 724, y + 26, 180, 16, { fontSize: 9.5, color: GRIS, objectName: G(g, "Texto") }); });

  // ---------- 17. Antes y después ----------
  s = slide("Esquemas", "Comparación antes / después con marcos dibujados y una flecha a mano. Textos de ejemplo.");
  titulo(s, "ANTES y después");
  { const izq = [["automatizacion", "Armado manual de cajas"], ["reciclado", "Menos fibra recuperada"], ["flexibles", "Envases multimaterial"], ["logistica", "Rutas sin optimizar"]], der = [["automatizacion", "Armado automático en el cliente"], ["reciclado", "Más fibra reciclada en cada caja"], ["flexibles", "Envases monomaterial reciclables"], ["logistica", "Logística optimizada"]];
    [[izq, 50, "Hoy", ARENA, TINTA, "C0504D", false], [der, 560, "2026", TINT.corrugado, T.accent1, VERDE_OSC, true]].forEach(([it, x, h, f, c, mc, ok]) => { const g = "Columna " + h;
      marco(s, x, 108, 350, 384, { fill: f, color: c, color2: TINTA, g });
      txt(s, h, x, 120, 350, 44, { fontFace: MANO, fontSize: 38, align: "center", objectName: G(g + " t", "Título") });
      it.forEach(([k, t], j) => { const y = 180 + j * 74, gg = h + " " + (j + 1); ico(s, k, x + 26, y, 50, { name: G(gg, "Ícono"), width: 1.4 }); txt(s, t, x + 88, y + 12, 200, 30, { fontSize: 12, valign: "middle", objectName: G(gg, "Texto") });
        geo(s, handPx(ok ? [M.L(x + 300, y + 26, x + 310, y + 38, x + 328, y + 12)] : [M.L(x + 302, y + 14, x + 326, y + 38), M.L(x + 326, y + 14, x + 303, y + 38)], 0.6), { color: mc, width: 2.4, name: G(gg, ok ? "Tilde" : "Cruz") }); });
    });
    flecha(s, curva(418, 300, 470, 270, 540, 300), { width: 3, head: 14, color: NAR, name: "Flecha antes-después" });
  }

  // ---------- 18. Pirámide ----------
  s = slide("Esquemas", "Pirámide de cuatro niveles dibujada a mano, con ícono por nivel y textos a la derecha unidos por líneas punteadas.");
  titulo(s, "PIRÁMIDE de valor");
  { const ax = 300, top = 110, base = 486, hw = 240, niv = [["comunidad", "Propósito", "Packaging que cuida a las personas y al planeta", CELESTE], ["equipo", "Clientes", "Soluciones a medida y cercanía", T.accent3], ["corrugado", "Soluciones", "Corrugado, papel, flexibles y bolsas", T.accent1], ["forestal", "Bosque y plantas", "23.000 ha propias y 17 sitios", T.accent5]];
    const hwAt = (y) => (y - top) / (base - top) * hw, step = (base - top) / 4;
    niv.forEach(([k, n, d, c], i) => { const y0 = top + i * step, y1 = y0 + step, g = "Nivel " + n;
      const pts = i === 0 ? [[ax, y0], [ax + hwAt(y1), y1], [ax - hwAt(y1), y1]] : [[ax - hwAt(y0), y0], [ax + hwAt(y0), y0], [ax + hwAt(y1), y1], [ax - hwAt(y1), y1]];
      geo(s, handPx([{ pts, closed: true, over: false }], 1), { fill: c, tr: 30, color: TINTA, width: 1.4, name: G(g, "Nivel") });
      const isz = i === 0 ? 44 : 54; ico(s, k, ax - isz / 2, (i === 0 ? y0 + 38 : y0 + (step - isz) / 2), isz, { name: G(g, "Ícono"), width: 1.5 });
      const ym = (y0 + y1) / 2 + (i === 0 ? 14 : 0);
      geo(s, handPx([M.L(ax + hwAt(ym) + 8, ym, 590, ym)], 0.5), { color: GRIS, width: 1, dash: "sysDot", name: G(g + " t", "Guía") });
      txt(s, n, 600, ym - 22, 320, 22, { bold: true, fontSize: 15, objectName: G(g + " t", "Nombre") }); txt(s, d, 600, ym + 2, 320, 18, { fontSize: 11, color: GRIS, objectName: G(g + " t", "Texto") }); });
  }

  // ---------- 19. Tablero ----------
  s = slide("Esquemas", "Tablero de indicadores: cuatro tarjetas con ícono, cifra, minigráfico dibujado y variación; abajo, una franja de datos de sostenibilidad. Cifras del institucional 2026; variaciones de ejemplo.");
  titulo(s, "TABLERO de indicadores");
  [["corrugado", "900 M", "m² de cartón por año", "+4 %", T.accent1], ["bolsas", "270 M", "bolsas industriales", "+6 %", T.accent4], ["flexibles", "15.000 t", "material flexible", "+8 %", T.accent3], ["automatizacion", "125", "máquinas en clientes", "+25 %", CELESTE]].forEach(([k, v, l, dv, c], i) => {
    const x = 40 + i * 225, y = 104, w = 210, h = 236, g = "Indicador " + l;
    marco(s, x, y, w, h, { fill: "FFFFFF", color: c, color2: TINTA, g });
    icoUnidad(s, k, x + 18, y + 18, 64, c, g + " ícono");
    s.addText(dv, { shape: SH.roundRect, x: p(x + w - 74), y: p(y + 24), w: p(56), h: p(24), rectRadius: p(12), fill: { color: TINT.corrugado }, line: NONE, fontFace: CIFRAS, bold: true, fontSize: 11, color: VERDE_OSC, align: "center", valign: "middle", margin: 0, objectName: G(g + " t", "Variación") });
    txt(s, v, x + 18, y + 94, w - 36, 40, { fontFace: CIFRAS, bold: true, fontSize: 32, objectName: G(g + " t", "Cifra") });
    txt(s, l, x + 18, y + 134, w - 36, 16, { fontSize: 10.5, color: GRIS, objectName: G(g + " t", "Rótulo") });
    const sp = [0, 1, 2, 3, 4, 5].map((j) => [x + 22 + j * 32, y + 206 - (j * 6 + [0, 8, 2, 12, 6, 16][j]) * (0.8 + i * 0.1)]);
    geo(s, handPx([{ pts: M.C(...sp.flat()).pts, over: false }], 0.5), { color: c, width: 2, name: G(g + " t", "Minigráfico") });
    s.addShape(SH.ellipse, { x: p(sp[5][0] - 5), y: p(sp[5][1] - 5), w: p(10), h: p(10), fill: { color: c }, line: NONE, objectName: G(g + " t", "Punto") });
  });
  marco(s, 40, 370, 880, 120, { fill: ARENA, g: "Franja sostenibilidad" });
  [["energia", "60 %", "energía renovable"], ["co2", "−14 %", "emisiones de CO₂ en transporte"], ["forestal", "600.000", "plantines por año"], ["reciclado", "180.000 t", "cartón reciclado por año"]].forEach(([k, v, l], i) => { const x = 66 + i * 216, g = "Dato " + l; ico(s, k, x, 396, 64, { name: G(g, "Ícono"), width: 1.6 }); txt(s, v, x + 72, 404, 130, 30, { fontFace: CIFRAS, bold: true, fontSize: 22, objectName: G(g, "Cifra") }); txt(s, l, x + 72, 434, 130, 30, { fontSize: 10, color: GRIS, objectName: G(g, "Rótulo") }); });

}
return { masters, iconos, recursos, esquemas };
};
