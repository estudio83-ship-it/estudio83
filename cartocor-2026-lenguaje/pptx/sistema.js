// Cartocor 2026 — esquemas nuevos + sistema de diseño dentro de la presentación.
module.exports = function (ctx) {
  const { A, fit, enc, pres, C, SH, HX, p, LIGHT, CIFRAS, MANO, THEME } = ctx;
  const T = THEME.colors;
  const G = (g, k) => `G·${g}·${k}`;
  const NONE = { type: "none" };
  const txt = (s, t, x, y, w, h, o = {}) => s.addText(t, { x: p(x), y: p(y), w: p(w), h: p(h), margin: 0, isTextBox: true, fontSize: 11, color: C.text1, ...o });
  const titulo = (s, a, b) => s.addText([{ text: a + " ", options: { fontFace: LIGHT } }, { text: b, options: { bold: true } }], { placeholder: "title" });
  function img(s, file, x, y, w, h, name, o = {}) {
    const e = enc(file, x, y, w, h, o.al || "c");
    s.addImage({ path: e.path, x: p(e.x), y: p(e.y), w: p(e.w), h: p(e.h), altText: name, objectName: o.obj || name });
    return e;
  }
  const fotoC = (s, file, x, y, d, name, obj) => s.addImage({ path: fit(A + file, d, d), x: p(x), y: p(y), w: p(d), h: p(d), rounding: true, altText: name, objectName: obj || name });
  const line = (s, x, y, w, h, o = {}) => s.addShape(SH.line, { x: p(x), y: p(y), w: p(w), h: p(h), line: { color: o.color || T.dk1, width: o.width || 1.5, dashType: o.dash || "solid", ...(o.end ? { endArrowType: o.end } : {}) }, ...(o.flipV ? { flipV: true } : {}), objectName: o.obj || "Línea" });

  // ===================== ESQUEMAS =====================
  function esquemas() {
    pres.addSection({ title: "Esquemas" });
    const sec = { masterName: "SOLO TITULO", sectionTitle: "Esquemas" };

    // 1. Cadena de valor circular
    let s = pres.addSlide(sec);
    titulo(s, "CADENA", "de valor");
    const pasos = [
      ["foto-bosque.jpg", "Bosque", "23.000 ha de plantaciones propias", HX.corrOsc],
      ["foto-bobina.jpg", "Papel", "Kraft y reciclado para nuestras plantas", T.accent5],
      ["foto-carton-onda.jpg", "Corrugado", "Cajas, bandejas y displays", T.accent1],
      ["foto-manos-caja.jpg", "Cliente", "Alimentos, bebidas, agro e industria", T.accent3],
      ["foto-rollos-reciclado.jpg", "Reciclado", "El cartón usado vuelve como papel", T.accent2],
    ];
    pasos.forEach(([f, n, d, c], i) => {
      const x = 70 + i * 176, g = "Paso " + (i + 1);
      if (i < 4) line(s, x + 122, 200, 50, 0, { color: T.dk1, width: 1.5, dash: "sysDot", end: "triangle", obj: "Flecha" });
      s.addShape(SH.ellipse, { x: p(x - 6), y: p(134), w: p(132), h: p(132), fill: { color: c }, line: NONE, objectName: G(g, "Aro") });
      fotoC(s, f, x, 140, 120, n, G(g, "Foto"));
      s.addText(String(i + 1), { shape: SH.ellipse, x: p(x + 88), y: p(130), w: p(34), h: p(34), fill: { color: "FFFFFF" }, line: { color: c, width: 2 }, fontFace: CIFRAS, bold: true, fontSize: 14, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Número") });
      txt(s, n, x - 20, 278, 160, 22, { bold: true, fontSize: 15, align: "center", objectName: G(g, "Nombre") });
      txt(s, d, x - 20, 300, 160, 34, { fontSize: 10, color: HX.gris, align: "center", objectName: G(g, "Texto") });
    });
    // retorno circular
    line(s, 834, 340, 0, 70, { color: T.accent2, width: 2, dash: "dash", obj: G("Retorno", "Baja") });
    line(s, 130, 410, 704, 0, { color: T.accent2, width: 2, dash: "dash", obj: G("Retorno", "Vuelta") });
    line(s, 130, 340, 0, 70, { color: T.accent2, width: 2, dash: "dash", end: "triangle", flipV: true, obj: G("Retorno", "Sube") });
    s.addText([{ text: "ECONOMÍA ", options: { fontFace: LIGHT } }, { text: "circular", options: { bold: true } }, { text: "  ·  180.000 t de cartón reciclado por año", options: { fontSize: 11, color: HX.gris } }], { shape: SH.roundRect, x: p(250), y: p(390), w: p(460), h: p(40), rectRadius: p(20), fill: { color: C.background2 }, line: NONE, fontSize: 14, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: "Pill economía circular" });
    img(s, "dibujo-planta.png", 60, 440, 50, 60, "Dibujo planta");
    s.addNotes("Esquema de cadena de valor de 5 pasos con retorno. Cada paso es un grupo (aro + foto + número + textos): para cambiar la foto, clic derecho › Cambiar imagen.");

    // 2. Ecosistema de marcas
    s = pres.addSlide(sec);
    titulo(s, "ECOSISTEMA", "de marcas");
    s.addShape(SH.ellipse, { x: p(300), y: p(130), w: p(360), h: p(360), fill: { color: C.background2 }, line: NONE, objectName: "Halo arena" });
    const sat = [["converflex", "Converflex", "Envases flexibles", 230, 175, T.accent3, false], ["papel-misionero", "Papel Misionero", "Papel kraft", 730, 175, T.accent5, true], ["zucamor", "Zucamor", "Papel reciclado y bolsas", 230, 420, T.accent2, true], ["puntapel", "Puntapel", "Bolsas industriales", 730, 420, T.accent4, false]];
    const cx = 480, cy = 310;
    sat.forEach(([k, n, d, sx, sy, c, fv]) => {
      const x = Math.min(sx, cx), y = Math.min(sy, cy);
      line(s, x, y, Math.abs(sx - cx), Math.abs(sy - cy), { color: c, width: 2, dash: "dash", flipV: fv, obj: "Conector " + n });
    });
    s.addShape(SH.ellipse, { x: p(cx - 80), y: p(cy - 80), w: p(160), h: p(160), fill: { color: C.text1 }, line: { color: "FFFFFF", width: 6 }, objectName: G("Centro", "Círculo") });
    img(s, "logo-cartocor-blanco.png", cx - 55, cy - 40, 110, 66, "Logo Cartocor", { obj: G("Centro", "Logo") });
    txt(s, "Corrugado", cx - 60, cy + 30, 120, 18, { fontSize: 11, color: "FFFFFF", align: "center", objectName: G("Centro", "Unidad") });
    sat.forEach(([k, n, d, sx, sy, c]) => {
      const g = "Marca " + n, D = 104, left = sx < cx;
      s.addShape(SH.ellipse, { x: p(sx - D / 2), y: p(sy - D / 2), w: p(D), h: p(D), fill: { color: "FFFFFF" }, line: { color: c, width: 4 }, shadow: { type: "outer", color: "1F497D", opacity: 0.12, blur: 6, offset: 2, angle: 90 }, objectName: G(g, "Círculo") });
      img(s, `logo-${k}-color.png`, sx - 34, sy - 26, 68, 52, "Logo " + n, { obj: G(g, "Logo") });
      const tx = left ? sx - D / 2 - 175 : sx + D / 2 + 15;
      txt(s, n, tx, sy - 20, 160, 20, { bold: true, fontSize: 14, align: left ? "right" : "left", objectName: G(g, "Nombre") });
      txt(s, d, tx, sy + 2, 160, 18, { fontSize: 11, color: HX.gris, align: left ? "right" : "left", objectName: G(g, "Unidad") });
    });
    img(s, "logo-grupo-arcor.png", 830, 40, 90, 60, "Logo Grupo Arcor");
    txt(s, "parte de", 760, 62, 66, 16, { fontSize: 10, italic: true, color: HX.gris, align: "right" });
    s.addNotes("Hub con Cartocor al centro y cuatro marcas satélite. Los conectores son líneas punteadas en el color de cada unidad. Sirve también para clientes, plantas o procesos.");

    // 3. Pilares (Venn)
    s = pres.addSlide(sec);
    titulo(s, "NUESTROS", "Pilares");
    const venn = [["Calidad", T.accent3, 150, 120, "Procesos certificados y mejora continua"], ["Sostenibilidad", T.accent1, 330, 120, "Bosque propio y economía circular"], ["Innovación", T.accent2, 240, 270, "Automatización y nuevos materiales"]];
    venn.forEach(([n, c, x, y]) => s.addShape(SH.ellipse, { x: p(x), y: p(y), w: p(240), h: p(240), fill: { color: c, transparency: 35 }, line: { color: "FFFFFF", width: 3 }, objectName: G("Venn", "Círculo " + n) }));
    [["Calidad", 170, 190], ["Sostenibilidad", 400, 190], ["Innovación", 285, 430]].forEach(([n, x, y]) => txt(s, n, x, y, 150, 24, { bold: true, fontSize: 15, align: "center", objectName: G("Venn", "Rótulo " + n) }));
    s.addText("", { shape: SH.ellipse, x: p(325), y: p(250), w: p(80), h: p(80), fill: { color: "FFFFFF" }, line: NONE, objectName: G("Venn", "Centro") });
    img(s, "logo-cartocor-color.png", 333, 266, 64, 48, "Logo Cartocor", { obj: G("Venn", "Logo") });
    venn.forEach(([n, c, , , d], i) => {
      const y = 140 + i * 110, g = "Pilar " + n;
      s.addShape(SH.roundRect, { x: p(640), y: p(y), w: p(280), h: p(90), rectRadius: p(22), fill: { color: C.background2 }, line: NONE, objectName: G(g, "Panel") });
      s.addShape(SH.ellipse, { x: p(656), y: p(y + 25), w: p(40), h: p(40), fill: { color: c }, line: NONE, objectName: G(g, "Punto") });
      txt(s, n, 710, y + 18, 200, 22, { bold: true, fontSize: 14, objectName: G(g, "Título") });
      txt(s, d, 710, y + 42, 200, 34, { fontSize: 10.5, color: HX.gris, objectName: G(g, "Texto") });
    });
    s.addNotes("Diagrama de Venn de tres pilares con transparencia 35 %. El centro marca lo que comparten los tres. Los paneles de la derecha amplían cada pilar.");

    // 4. Escalera de crecimiento
    s = pres.addSlide(sec);
    titulo(s, "PLAN", "de crecimiento");
    const esc = [["2023", "Consolidar", "Integrar plantas y procesos de las cinco marcas.", T.accent1], ["2024", "Automatizar", "Máquinas armadoras en clientes de toda la región.", T.accent3], ["2025", "Expandir", "Nuevas líneas en Chile y Perú.", T.accent4], ["2026", "Liderar", "Referentes del packaging sostenible del Cono Sur.", T.accent2]];
    esc.forEach(([a, n, d, c], i) => {
      const x = 70 + i * 205, h = 110 + i * 60, y = 490 - h, g = "Escalón " + a;
      s.addShape(SH.round2SameRect, { x: p(x), y: p(y), w: p(190), h: p(h), rectRadius: p(18), fill: { color: C.background2 }, line: NONE, objectName: G(g, "Bloque") });
      s.addShape(SH.round2SameRect, { x: p(x), y: p(y), w: p(190), h: p(10), fill: { color: c }, line: NONE, objectName: G(g, "Borde") });
      s.addText(a, { shape: SH.roundRect, x: p(x + 50), y: p(y - 18), w: p(90), h: p(32), rectRadius: p(16), fill: { color: c }, line: NONE, fontFace: CIFRAS, bold: true, fontSize: 15, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: G(g, "Año") });
      txt(s, n, x + 14, y + 28, 162, 24, { bold: true, fontSize: 16, objectName: G(g, "Título") });
      txt(s, d, x + 14, y + 54, 162, 50, { fontSize: 10.5, color: HX.gris, objectName: G(g, "Texto") });
    });
    line(s, 90, 120, 730, 180, { color: T.dk1, width: 1.5, dash: "sysDot", end: "triangle", flipV: true, obj: "Tendencia" });
    img(s, "caja-dibujada.png", 840, 70, 80, 56, "Caja dibujada");
    s.addNotes("Escalera de 4 etapas. Cambiar años, verbos y textos; los escalones son grupos. Textos de ejemplo.");

    // 5. Roadmap trimestral
    s = pres.addSlide(sec);
    titulo(s, "ROADMAP", "2026");
    const X0 = 250, QW = 170;
    ["T1", "T2", "T3", "T4"].forEach((q, i) => {
      s.addText(q + " 2026", { shape: SH.roundRect, x: p(X0 + i * QW + 10), y: p(120), w: p(QW - 20), h: p(30), rectRadius: p(15), fill: { color: C.text1 }, line: NONE, fontSize: 12, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: "Trimestre " + q });
      if (i) line(s, X0 + i * QW, 160, 0, 330, { color: "D9D9D9", width: 0.75, obj: "Guía " + q });
    });
    const filas = [["Corrugado", T.accent1, [[0, 1.6, "Nueva onduladora"], [2.2, 3.8, "Línea de displays"]], [1.6]], ["Papel", T.accent2, [[0.5, 2.5, "Mayor reciclado"]], [2.5]], ["Flexibles", T.accent3, [[1, 3, "Envases monomaterial"]], [3]], ["Bolsas", T.accent4, [[0, 1, "Planta Perú"], [1.3, 4, "Bolsas con válvula"]], [1]], ["Automatización", HX.celeste, [[0.2, 3.6, "125 máquinas en clientes"]], [3.6]]];
    filas.forEach(([n, c, barras, hitos], r) => {
      const y = 170 + r * 64, g = "Fila " + n;
      s.addShape(SH.roundRect, { x: p(40), y: p(y), w: p(880), h: p(54), rectRadius: p(27), fill: { color: r % 2 ? "FFFFFF" : C.background2 }, line: NONE, objectName: "Franja " + n });
      s.addShape(SH.ellipse, { x: p(52), y: p(y + 12), w: p(30), h: p(30), fill: { color: c }, line: NONE, objectName: G(g, "Punto") });
      txt(s, n, 92, y + 15, 150, 24, { bold: true, fontSize: 13, objectName: G(g, "Nombre") });
      barras.forEach(([a, b, t]) => s.addText(t, { shape: SH.roundRect, x: p(X0 + a * QW + 4), y: p(y + 12), w: p((b - a) * QW - 8), h: p(30), rectRadius: p(15), fill: { color: c }, line: NONE, fontSize: 10.5, bold: true, color: c === T.accent2 || c === HX.celeste || c === T.accent1 ? T.dk1 : "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: "Barra " + t }));
      hitos.forEach((h) => s.addShape(SH.diamond, { x: p(X0 + h * QW - 9), y: p(y + 4), w: p(18), h: p(18), fill: { color: T.accent6 }, line: { color: "FFFFFF", width: 1.5 }, objectName: "Hito" }));
    });
    line(s, X0 + 1.8 * QW, 156, 0, 340, { color: T.accent6, width: 1.5, dash: "dash", obj: G("Hoy", "Línea") });
    s.addText("HOY", { shape: SH.roundRect, x: p(X0 + 1.8 * QW - 24), y: p(496), w: p(48), h: p(20), rectRadius: p(10), fill: { color: T.accent6 }, line: NONE, fontSize: 9, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: G("Hoy", "Etiqueta") });
    s.addShape(SH.diamond, { x: p(760), y: p(502), w: p(12), h: p(12), fill: { color: T.accent6 }, line: NONE, objectName: G("Leyenda", "Rombo") });
    txt(s, "Hito", 778, 500, 60, 16, { fontSize: 10, color: HX.gris, objectName: G("Leyenda", "Texto") });
    s.addNotes("Roadmap por unidad y trimestre. Cada trimestre mide 170 px: para mover una barra, arrastrarla; los rombos naranjas son hitos. Proyectos de ejemplo.");
  }

  // ===================== SISTEMA DE DISEÑO =====================
  function sistema() {
    pres.addSection({ title: "Sistema de diseño" });
    const sec = { masterName: "SOLO TITULO", sectionTitle: "Sistema de diseño" };
    let s = pres.addSlide({ masterName: "SEPARADOR TRANSVERSAL", sectionTitle: "Sistema de diseño" });
    s.addText("Sistema de diseño", { placeholder: "title" });
    s.addNotes("Esta sección documenta el sistema: color, tipografía, jerarquía, grilla, reglas y diseños del patrón. No se proyecta: se usa como guía al armar nuevas diapositivas.");

    // --- Paleta ---
    s = pres.addSlide(sec);
    titulo(s, "PALETA", "de color");
    const rgb = (h) => [0, 2, 4].map((i) => parseInt(h.substr(i, 2), 16)).join(" · ");
    const base = [["Tinta", "tinta", T.dk1, "Texto y títulos"], ["Tinta profunda", "tinta-profunda", T.dk2, "Segundo trazo"], ["Gris etiqueta", "gris-etiqueta", HX.gris, "Rótulos"], ["Papel", "papel", T.lt1, "Fondo de contenido"], ["Arena", "arena", T.lt2, "Manchas y paneles"], ["Acento", "acento", T.accent6, "Solo palabra clave KPI"]];
    const unid = [["Corrugado", "corrugado", T.accent1, "Cartocor"], ["Corrugado oscuro", "corrugado-oscuro", HX.corrOsc, "Totales y cifras"], ["Papel reciclado", "papel-reciclado", T.accent2, "Zucamor"], ["Kraft", "kraft", T.accent5, "Papel Misionero"], ["Flexible", "flexible", T.accent3, "Converflex"], ["Bolsas", "bolsas", T.accent4, "Puntapel · Zucamor"], ["Celeste", "celeste", HX.celeste, "Temas transversales"]];
    const fila = (lista, y, rot) => {
      txt(s, rot, 40, y, 300, 18, { bold: true, fontSize: 11, color: HX.gris, charSpacing: 2 });
      lista.forEach(([n, tk, hx, uso], i) => {
        const x = 40 + i * 126, g = "Color " + tk;
        s.addShape(SH.roundRect, { x: p(x), y: p(y + 24), w: p(114), h: p(70), rectRadius: p(14), fill: { color: hx }, line: hx === "FFFFFF" ? { color: "D9D9D9", width: 1 } : NONE, objectName: G(g, "Muestra") });
        txt(s, [{ text: n, options: { bold: true, fontSize: 11, breakLine: true } }, { text: "#" + hx, options: { fontFace: CIFRAS, fontSize: 10, breakLine: true } }, { text: "RGB " + rgb(hx), options: { fontFace: CIFRAS, fontSize: 8, color: HX.gris, breakLine: true } }, { text: uso, options: { fontSize: 8.5, italic: true, color: HX.gris } }], x, y + 98, 120, 62, { valign: "top", objectName: G(g, "Datos") });
      });
    };
    fila(base, 118, "BASE");
    fila(unid, 300, "UNIDADES DE NEGOCIO");
    txt(s, "Ya cargados en el tema: Diseño › Variantes › Colores › Cartocor 2026.", 40, 480, 500, 20, { fontSize: 10, italic: true, color: HX.gris });
    s.addNotes("Paleta completa con nombre, token, HEX y RGB. Los colores de tema (tinta, arena, unidades y acento) aparecen en todas las paletas de PowerPoint.");

    // --- Tipografías ---
    s = pres.addSlide(sec);
    titulo(s, "TIPOGRAFÍAS", "del sistema");
    const fam = [
      ["Raleway", "Raleway", "Aa", "Títulos, cuerpo y rótulos", [["Raleway Light", LIGHT, false], ["Raleway Regular", "Raleway", false], ["Raleway Bold", "Raleway", true]], "Google Fonts · gratuita", T.accent3],
      ["Bahnschrift", CIFRAS, "0123", "Cifras, tablas y gráficos", [["Bahnschrift Regular", CIFRAS, false], ["Bahnschrift Bold", CIFRAS, true], ["Mac: DIN Alternate", CIFRAS, false]], "Incluida en Windows 10/11", T.accent1],
      ["Om Telolet Om", MANO, "Aa", "Separadores y acentos", [["Separador de sección", MANO, false], ["Contenido · Misión", MANO, false], ["Nunca en datos", MANO, false]], "Fuente libre · plantilla 2025", T.accent2],
    ];
    fam.forEach(([n, face, muestra, rol, pesos, fuente, c], i) => {
      const x = 40 + i * 300, g = "Fuente " + n;
      s.addShape(SH.roundRect, { x: p(x), y: p(118), w: p(280), h: p(392), rectRadius: p(28), fill: { color: C.background2 }, line: NONE, objectName: G(g, "Panel") });
      s.addShape(SH.rect, { x: p(x + 24), y: p(140), w: p(40), h: p(6), fill: { color: c }, line: NONE, objectName: G(g, "Marca") });
      txt(s, muestra, x + 24, 150, 240, 96, { fontFace: face, fontSize: face === MANO ? 80 : 66, bold: face === CIFRAS, valign: "middle", objectName: G(g, "Muestra") });
      txt(s, n, x + 24, 252, 240, 30, { fontFace: face, fontSize: face === MANO ? 30 : 22, bold: face !== MANO, objectName: G(g, "Nombre") });
      txt(s, rol, x + 24, 284, 240, 18, { fontSize: 11, color: HX.gris, objectName: G(g, "Rol") });
      pesos.forEach(([pn, pf, b], j) => txt(s, pn, x + 24, 318 + j * 34, 240, 28, { fontFace: pf, bold: b, fontSize: pf === MANO ? 22 : 15, objectName: G(g, "Peso " + (j + 1)) }));
      txt(s, fuente, x + 24, 476, 240, 18, { fontSize: 9, italic: true, color: HX.gris, objectName: G(g, "Fuente") });
    });
    s.addNotes("Las tres familias del sistema con su nombre exacto para el menú de fuentes. Raleway se instala desde Google Fonts en todas las PC que proyecten; Bahnschrift viene con Windows; Om Telolet Om es libre.");

    // --- Jerarquía tipográfica ---
    s = pres.addSlide(sec);
    titulo(s, "JERARQUÍA", "de textos");
    const jer = [
      [[{ text: "CONTEXTO ", options: { fontFace: LIGHT } }, { text: "Clave", options: { bold: true } }], 26, "Título pill", "Raleway Light + Bold · 26 pt · mayúsculas"],
      [[{ text: "Separador", options: { fontFace: MANO } }], 40, "Título manuscrito", "Om Telolet Om · 40–64 pt · solo separadores"],
      [[{ text: "920 MMU$S", options: { fontFace: CIFRAS, bold: true } }], 34, "Cifra grande", "Bahnschrift Bold · 28–48 pt · con unidad"],
      [[{ text: "Subtítulo de bloque", options: { bold: true } }], 16, "Subtítulo", "Raleway Bold · 14–18 pt"],
      [[{ text: "Cuerpo de texto. Frases cortas, cuatro líneas como máximo.", options: {} }], 13, "Cuerpo", "Raleway Regular · 12–15 pt · tinta"],
      [[{ text: "Rótulo bajo ícono o gráfico", options: { color: HX.gris } }], 10, "Rótulo", "Raleway Regular · 9–11 pt · gris etiqueta"],
    ];
    jer.forEach(([runs, sz, n, spec], i) => {
      const y = 120 + i * 66, g = "Estilo " + n;
      s.addShape(SH.roundRect, { x: p(40), y: p(y), w: p(880), h: p(56), rectRadius: p(28), fill: { color: i % 2 ? "FFFFFF" : C.background2 }, line: NONE, objectName: G(g, "Franja") });
      txt(s, runs, 64, y + 4, 500, 48, { fontSize: sz, valign: "middle", objectName: G(g, "Ejemplo") });
      txt(s, n, 590, y + 8, 320, 20, { bold: true, fontSize: 12, objectName: G(g, "Nombre") });
      txt(s, spec, 590, y + 28, 320, 18, { fontSize: 10, color: HX.gris, objectName: G(g, "Especificación") });
    });
    s.addNotes("Seis estilos de texto. Copiar el ejemplo para tener el formato exacto, o usar Copiar formato.");

    // --- Grilla y espaciado ---
    s = pres.addSlide(sec);
    titulo(s, "GRILLA", "y espaciado");
    const k = 0.52, X = 40, Y = 130, W = 960 * k, H = 540 * k;
    s.addShape(SH.rect, { x: p(X), y: p(Y), w: p(W), h: p(H), fill: { color: "FFFFFF" }, line: { color: T.dk1, width: 1 }, shadow: { type: "outer", color: "1F497D", opacity: 0.15, blur: 8, offset: 3, angle: 90 }, objectName: G("Grilla", "Diapositiva") });
    const m = 40 * k, gw = (W - 2 * m - 11 * 20 * k) / 12;
    for (let i = 0; i < 12; i++) s.addShape(SH.rect, { x: p(X + m + i * (gw + 20 * k)), y: p(Y + m), w: p(gw), h: p(H - 2 * m), fill: { color: HX.celeste, transparency: 60 }, line: NONE, objectName: G("Grilla", "Columna " + (i + 1)) });
    s.addShape(SH.roundRect, { x: p(X + 84 * k), y: p(Y + 40 * k), w: p(400 * k), h: p(56 * k), rectRadius: p(14), fill: { color: C.background2 }, line: { color: T.dk1, width: 0.75 }, objectName: G("Grilla", "Zona título") });
    txt(s, "Zona de título", X + 84 * k, Y + 40 * k, 400 * k, 56 * k, { fontSize: 9, align: "center", valign: "middle", objectName: G("Grilla", "Rótulo título") });
    s.addShape(SH.rect, { x: p(X + m), y: p(Y + m), w: p(W - 2 * m), h: p(H - 2 * m), fill: { type: "none" }, line: { color: T.accent6, width: 1, dashType: "dash" }, objectName: G("Grilla", "Margen") });
    txt(s, "960 × 540 pt · 16:9 · 12 columnas · medianil 20 · margen 40", X, Y + H + 10, W, 18, { fontSize: 10, color: HX.gris });
    const esp = [["margen", 40, "Borde de la diapositiva"], ["paso-l", 32, "Entre bloques"], ["paso-m", 20, "Entre elementos hermanos"], ["paso-s", 10, "Ícono y rótulo"]];
    txt(s, "ESPACIADO", 580, 130, 200, 18, { bold: true, fontSize: 11, color: HX.gris, charSpacing: 2 });
    esp.forEach(([n, v, d], i) => {
      const y = 158 + i * 40, g = "Espacio " + n;
      s.addShape(SH.rect, { x: p(580), y: p(y + 4), w: p(v * 2), h: p(16), fill: { color: T.accent6 }, line: NONE, objectName: G(g, "Barra") });
      txt(s, [{ text: n + "  ", options: { bold: true } }, { text: v + " pt", options: { fontFace: CIFRAS } }], 680, y, 120, 22, { fontSize: 12, valign: "middle", objectName: G(g, "Nombre") });
      txt(s, d, 800, y, 130, 22, { fontSize: 10, color: HX.gris, valign: "middle", objectName: G(g, "Uso") });
    });
    txt(s, "RADIOS", 580, 330, 200, 18, { bold: true, fontSize: 11, color: HX.gris, charSpacing: 2 });
    [["pill", SH.roundRect, 100, 36, 18], ["panel 28", SH.roundRect, 80, 60, 28 * 0.6], ["ficha 12", SH.roundRect, 60, 60, 12 * 0.6], ["círculo", SH.ellipse, 60, 60, 0]].forEach(([n, sh, w, h, r], i) => {
      const x = [580, 694, 788, 862][i], g = "Radio " + n;
      s.addShape(sh, { x: p(x), y: p(360 + (60 - h) / 2), w: p(w), h: p(h), ...(sh === SH.roundRect ? { rectRadius: p(r) } : {}), fill: { color: C.background2 }, line: { color: T.dk1, width: 1 }, objectName: G(g, "Forma") });
      txt(s, n, x, 428, w + 10, 16, { fontSize: 9.5, color: HX.gris, objectName: G(g, "Rótulo") });
    });
    s.addNotes("Grilla de 12 columnas sobre el lienzo de 960 × 540 pt. Activar Vista › Guías: las guías del patrón coinciden con el margen de 40 pt.");

    // --- Reglas de uso ---
    s = pres.addSlide(sec);
    titulo(s, "REGLAS", "de uso");
    const si = ["Papel blanco con manchas arena", "Una palabra clave en Bold en cada título", "Cifras en Bahnschrift, siempre con unidad", "Logos y formas originales, en su proporción", "Cada unidad con su color, siempre el mismo"];
    const no = ["Fondos de color plano en diapositivas de contenido", "Naranja fuera de las notas KPI", "Manuscrita en datos o párrafos", "Estirar fotos o logos (usar Recortar › Rellenar)", "Sombras en títulos y notas"];
    [[si, "SÍ", HX.corrOsc, "✓", 40], [no, "NO", "C0504D", "✕", 495]].forEach(([lista, h, c, ic, x]) => {
      s.addText(h, { shape: SH.roundRect, x: p(x), y: p(118), w: p(80), h: p(32), rectRadius: p(16), fill: { color: c }, line: NONE, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: "Encabezado " + h });
      lista.forEach((t, i) => {
        const y = 164 + i * 66, g = h + " " + (i + 1);
        s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(425), h: p(54), rectRadius: p(27), fill: { color: C.background2 }, line: NONE, objectName: G(g, "Franja") });
        s.addText(ic, { shape: SH.ellipse, x: p(x + 12), y: p(y + 11), w: p(32), h: p(32), fill: { color: c }, line: NONE, fontSize: 14, bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0, objectName: G(g, "Ícono") });
        txt(s, t, x + 58, y + 8, 355, 38, { fontSize: 12.5, valign: "middle", objectName: G(g, "Texto") });
      });
    });
    s.addNotes("Cinco reglas para hacer y cinco para evitar. Rojo solo en esta diapositiva de guía; no forma parte de la paleta del deck.");

    // --- Diseños del patrón ---
    s = pres.addSlide(sec);
    titulo(s, "DISEÑOS", "del patrón");
    const lay = [["PORTADA", "Apertura con foto de bosque", HX.corrOsc], ["CONTENIDO", "Índice sobre plantación", HX.corrOsc], ["SEPARADOR ×5", "Corrugado, Papel, Flexibles, Bolsas, Transversal", T.accent1], ["PRESENTACIÓN DE NEGOCIO", "Fichas de marca e íconos", T.accent3], ["TÍTULO Y CONTENIDO", "Pill + cuerpo", T.dk1], ["SOLO TÍTULO", "Pill libre para esquemas", T.dk1], ["DATOS", "Tablas sin pill", T.accent5], ["TÍTULO CON OLA", "Pill + ola azul al pie", T.accent3], ["UNIDAD ×4", "Ficha por unidad de negocio", T.accent4], ["GALERÍA", "Páginas de elementos", HX.celeste], ["CIERRE", "¡Gracias! + QR", HX.corrOsc]];
    lay.forEach(([n, d, c], i) => {
      const col = i % 3, r = Math.floor(i / 3), x = 40 + col * 300, y = 120 + r * 98, g = "Diseño " + n;
      s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(284), h: p(84), rectRadius: p(20), fill: { color: C.background2 }, line: NONE, objectName: G(g, "Panel") });
      s.addShape(SH.rect, { x: p(x + 16), y: p(y + 16), w: p(72), h: p(52), fill: { color: "FFFFFF" }, line: { color: c, width: 1.5 }, objectName: G(g, "Miniatura") });
      s.addShape(SH.rect, { x: p(x + 16), y: p(y + 16), w: p(72), h: p(12), fill: { color: c }, line: NONE, objectName: G(g, "Barra") });
      txt(s, n, x + 100, y + 18, 176, 20, { bold: true, fontSize: 11.5, objectName: G(g, "Nombre") });
      txt(s, d, x + 100, y + 40, 176, 30, { fontSize: 9.5, color: HX.gris, objectName: G(g, "Uso") });
    });
    txt(s, "Inicio › Nueva diapositiva › elegir el diseño. Para cambiar uno existente: Inicio › Diseño.", 640, 430, 280, 50, { fontSize: 10, italic: true, color: HX.gris, valign: "middle" });
    s.addNotes("Mapa de los diseños del patrón de diapositivas y para qué se usa cada uno.");
  }

  return { esquemas, sistema };
};
