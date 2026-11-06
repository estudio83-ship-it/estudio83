// Cartocor 2026 — módulos con recursos originales (logos, formas dibujadas, íconos, productos, fotos)
// y páginas de galería con esos recursos listos para copiar.
module.exports = function (ctx) {
  const { A, fit, enc, pres, C, SH, HX, p, LIGHT, CIFRAS, MANO, circIcon } = ctx;
  const SOMBRA = () => ({ type: "outer", color: "1F497D", opacity: 0.22, blur: 8, offset: 4, angle: 90 });
  const UC = { corrugado: C.accent1, papel: C.accent2, flexibles: C.accent3, bolsas: C.accent4, kraft: C.accent5 };
  const MARCAS = ["cartocor", "converflex", "zucamor", "papel-misionero", "puntapel"];
  const NOMBRE = { cartocor: "Cartocor", converflex: "Converflex", zucamor: "Zucamor", "papel-misionero": "Papel Misionero", puntapel: "Puntapel" };

  // imagen PNG encajada sin deformar
  function img(s, file, x, y, w, h, name, o = {}) {
    const e = enc(file, x, y, w, h, o.al || "c");
    s.addImage({ path: e.path, x: p(e.x), y: p(e.y), w: p(e.w), h: p(e.h), altText: name, objectName: o.obj || name, ...(o.shadow ? { shadow: SOMBRA() } : {}), ...(o.rotate ? { rotate: o.rotate } : {}) });
    return e;
  }
  // foto recortada exacta (sin estirar)
  function foto(s, file, x, y, w, h, name, o = {}) {
    s.addImage({ path: fit(file, w, h), x: p(x), y: p(y), w: p(w), h: p(h), altText: name, objectName: o.obj || name, ...(o.round ? { rounding: true } : {}) });
  }
  const txt = (s, t, x, y, w, h, o = {}) => s.addText(t, { x: p(x), y: p(y), w: p(w), h: p(h), margin: 0, isTextBox: true, fontSize: 11, color: C.text1, ...o });
  const cap = (s, t, x, y, w = 200) => txt(s, t, x, y, w, 14, { fontSize: 8, italic: true, color: HX.gris, objectName: "Rótulo de galería" });
  const titulo = (s, a, b) => s.addText([{ text: a + " ", options: { fontFace: LIGHT } }, { text: b, options: { bold: true } }], { placeholder: "title" });
  const galSlide = (t, nota) => { const s = pres.addSlide({ masterName: "GALERIA", sectionTitle: "Galería de elementos" }); s.addText(t, { placeholder: "title" }); if (nota) s.addNotes(nota); return s; };
  const G = (g, k) => `G·${g}·${k}`;
  let gid = 0;

  // ================= MÓDULOS DETALLADOS =================
  function modulos() {
    pres.addSection({ title: "Módulos con recursos originales" });
    // --- Nuestras soluciones: collage de producto sobre mancha original ---
    let s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Módulos con recursos originales" });
    titulo(s, "NUESTRAS", "Soluciones");
    img(s, "mancha-arena.png", 30, 150, 900, 350, "Mancha arena original");
    const col = [
      ["corrugado", "Cajas y displays", ["producto-display-pop.png", "producto-02.png", "producto-pallet.png"]],
      ["papel", "Papel y bobinas", ["producto-bobinas-carton.png", "producto-12.png"]],
      ["flexibles", "Envases flexibles", ["producto-18.png", "producto-20.png"]],
      ["bolsas", "Bolsas industriales", ["producto-bolsa-cemento.png", "producto-24.png"]],
    ];
    col.forEach(([u, nom, prods], i) => {
      const x0 = 60 + i * 220;
      prods.forEach((f, j) => img(s, f, x0 + j * (190 / prods.length) - 8, 205 + (j % 2) * 40, 210 / prods.length + 40, 170, "Producto " + nom, { shadow: true }));
      circIcon(s, u === "papel" ? "papel" : u, x0 + 10, 410, 46);
      txt(s, nom, x0 + 64, 418, 150, 20, { bold: true, fontSize: 13 });
      txt(s, ["900 M m² por año", "175 + 85 KTn por año", "15.000 t por año", "270 M bolsas por año"][i], x0 + 64, 438, 150, 16, { fontSize: 10, color: HX.gris });
    });
    txt(s, "Diseñamos y fabricamos packaging para alimentos, bebidas, higiene, agro e industria en todo el Cono Sur.", 520, 60, 400, 50, { fontSize: 12, color: HX.gris, valign: "middle" });
    s.addNotes("Collage con recortes de producto originales (2025/2026) sobre la mancha arena dibujada del 2026. Cambiar los recortes por los de cada cliente.");

    // --- Automatización: máquinas reales, bandejas y presencia regional ---
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Módulos con recursos originales" });
    titulo(s, "AUTOMATION", "Solutions");
    img(s, "panel-arena-dibujado.png", 30, 120, 640, 260, "Panel arena dibujado");
    [["producto-maquina-tf-mini.png", "TF Mini", "Formadora de bandejas"], ["producto-maquina-mav.png", "MAV", "Armadora vertical"], ["producto-maquina-bf-dual.png", "BF Dual", "Formadora doble"]].forEach(([f, n, d], i) => {
      const x = 70 + i * 200;
      img(s, f, x, 150, 170, 150, "Máquina " + n, { shadow: true });
      txt(s, n, x, 310, 170, 20, { bold: true, fontSize: 14, align: "center" });
      txt(s, d, x, 330, 170, 16, { fontSize: 10, color: HX.gris, align: "center" });
    });
    for (let i = 0; i < 6; i++) img(s, `bandeja-${i + 1}.png`, 50 + i * 104, 400, 96, 70, "Bandeja " + (i + 1), { shadow: true });
    cap(s, "Formatos de bandeja que arman nuestras máquinas", 50, 478, 300);
    // tarjeta de cifra + banderas
    s.addShape(SH.roundRect, { x: p(710), y: p(130), w: p(210), h: p(150), rectRadius: p(24), fill: { color: C.accent3 }, line: { type: "none" }, objectName: "Tarjeta cifra" });
    txt(s, [{ text: "125", options: { fontFace: CIFRAS, fontSize: 48, bold: true, color: "FFFFFF", breakLine: true } }, { text: "máquinas instaladas en clientes", options: { fontSize: 12, color: "FFFFFF" } }], 720, 145, 190, 120, { align: "center", valign: "middle" });
    [["bandera-argentina.png", "Argentina"], ["bandera-chile-circulo.png", "Chile"], ["bandera-peru-circulo.png", "Perú"]].forEach(([f, n], i) => {
      const x = 715 + i * 70;
      s.addShape(SH.ellipse, { x: p(x), y: p(310), w: p(56), h: p(56), fill: { color: "FFFFFF" }, line: { color: C.background2, width: 2 }, objectName: G("Bandera " + n, "Aro") });
      foto(s, A + f, x + 6, 316, 44, 44, "Bandera " + n, { round: true, obj: G("Bandera " + n, "Bandera") });
      txt(s, n, x - 7, 372, 70, 16, { fontSize: 10, align: "center", color: HX.gris });
    });
    img(s, "globo-ilustrado.png", 730, 400, 170, 100, "Globo ilustrado");
    s.addNotes("Máquinas y bandejas tomadas del institucional 2026. Las banderas marcan los países con máquinas instaladas.");

    // --- Clientes ---
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Módulos con recursos originales" });
    titulo(s, "NUESTROS", "Clientes");
    img(s, "panel-arena-dibujado.png", 30, 110, 900, 400, "Panel arena dibujado");
    for (let i = 0; i < 24; i++) {
      const c = i % 8, r = Math.floor(i / 8), x = 90 + c * 100, y = 160 + r * 100;
      const g = "Cliente " + (i + 1);
      s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(86), h: p(80), rectRadius: p(12), fill: { color: "FFFFFF" }, line: { type: "none" }, shadow: { type: "outer", color: "1F497D", opacity: 0.1, blur: 6, offset: 2, angle: 90 }, objectName: G(g, "Ficha") });
      img(s, `cliente-${String(i + 1).padStart(2, "0")}.png`, x + 8, y + 10, 70, 60, "Logo cliente", { obj: G(g, "Logo") });
    }
    s.addNotes("Muro de logos de clientes del institucional 2026. Usar solo con autorización comercial.");

    // --- Certificaciones por unidad ---
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Módulos con recursos originales" });
    titulo(s, "NUESTRAS", "Certificaciones");
    const certs = [["cert-fsc.png", "FSC"], ["cert-pefc.png", "PEFC"], ["cert-iso9001.png", "ISO 9001"], ["cert-iso14001.png", "ISO 14001"], ["cert-iso45001.png", "ISO 45001"], ["cert-fssc22000.png", "FSSC 22000"]];
    const unid = [["cartocor", "Corrugado", C.accent1], ["papel-misionero", "Papel", C.accent2], ["converflex", "Flexibles", C.accent3], ["zucamor", "Bolsas", C.accent4]];
    const tiene = [[1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0], [0, 0, 1, 1, 1, 1], [1, 0, 1, 1, 1, 0]];
    s.addShape(SH.roundRect, { x: p(40), y: p(120), w: p(880), h: p(390), rectRadius: p(28), fill: { color: C.background2 }, line: { type: "none" }, objectName: "Panel arena" });
    certs.forEach(([f, n], j) => { img(s, f, 250 + j * 110, 135, 70, 60, n); txt(s, n, 235 + j * 110, 198, 100, 14, { fontSize: 9, align: "center", color: HX.gris }); });
    unid.forEach(([k, n, c], i) => {
      const y = 235 + i * 66;
      s.addShape(SH.roundRect, { x: p(60), y: p(y), w: p(840), h: p(54), rectRadius: p(27), fill: { color: "FFFFFF" }, line: { type: "none" }, objectName: "Fila " + n });
      s.addShape(SH.ellipse, { x: p(70), y: p(y + 5), w: p(44), h: p(44), fill: { color: c }, line: { type: "none" }, objectName: "Punto " + n });
      txt(s, n, 124, y + 17, 100, 20, { bold: true, fontSize: 13 });
      tiene[i].forEach((t, j) => s.addText(t ? "✓" : "–", { shape: SH.ellipse, x: p(270 + j * 110), y: p(y + 12), w: p(30), h: p(30), fill: { color: t ? c : "FFFFFF" }, line: t ? { type: "none" } : { color: C.background2, width: 1 }, color: t ? "FFFFFF" : HX.gris, fontSize: 13, bold: true, align: "center", valign: "middle", margin: 0, objectName: "Marca " + n }));
    });
    s.addNotes("Matriz de certificaciones por unidad. Los datos son de ejemplo: completar con el estado vigente.");

    // --- Sostenibilidad sobre foto de bosque ---
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Módulos con recursos originales" });
    s.background = { path: fit(A + "foto-bosque-sostenibilidad.jpg", 960, 540) };
    titulo(s, "NUESTRO", "Bosque");
    s.addShape(SH.rect, { x: 0, y: p(330), w: p(960), h: p(210), fill: { color: "1F497D", transparency: 25 }, line: { type: "none" }, objectName: "Velo azul" });
    foto(s, A + "ola-azul-ancha.png", 0, 296, 960, 60, "Ola azul dibujada");
    [["23.000 ha", "de plantaciones propias", C.accent1], ["600.000", "plantines por año", C.accent2], ["4.700 ha", "de bosque nativo protegido", C.accent3]].forEach(([v, l, c], i) => {
      const x = 120 + i * 260;
      img(s, "marco-circular-dibujado.png", x - 14, 352, 178, 168, "Marco circular dibujado", { obj: G("Dato " + i, "Marco") });
      s.addText([{ text: v, options: { fontFace: CIFRAS, fontSize: 19, bold: true, color: "FFFFFF", breakLine: true } }, { text: l, options: { fontSize: 10, color: "FFFFFF" } }], { shape: SH.ellipse, x: p(x + 8), y: p(370), w: p(134), h: p(134), fill: { color: c, transparency: 10 }, line: { type: "none" }, align: "center", valign: "middle", margin: 6, objectName: G("Dato " + i, "Círculo") });
    });
    img(s, "dibujo-planta.png", 860, 40, 60, 70, "Dibujo planta");
    s.addNotes("Foto de bosque del institucional 2026 a sangre, con velo azul tinta, ola dibujada y tres cifras en marcos circulares originales.");

    // --- Presencia regional ---
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Módulos con recursos originales" });
    titulo(s, "PRESENCIA", "Regional");
    s.addShape(SH.ellipse, { x: p(470), y: p(110), w: p(420), h: p(420), fill: { color: C.background2 }, line: { type: "none" }, objectName: "Círculo arena" });
    const m = img(s, "mapa-argentina.png", 520, 115, 320, 410, "Mapa Argentina");
    [[0.86, 0.13], [0.74, 0.30], [0.74, 0.40], [0.52, 0.28], [0.26, 0.27], [0.27, 0.35]].forEach(([fx, fy], i) => img(s, "pin-naranja.png", m.x + m.w * fx - 9, m.y + m.h * fy - 22, 18, 22, "Pin " + (i + 1)));
    [["bandera-argentina.png", "Argentina", "14 plantas · Corrugado, Papel, Flexibles, Bolsas"], ["bandera-chile.png", "Chile", "2 plantas · Corrugado, Bolsas"], ["bandera-peru.png", "Perú", "1 planta · Bolsas industriales"]].forEach(([f, n, d], i) => {
      const y = 112 + i * 132;
      const e = img(s, "tarjeta-" + ["verde", "amarilla", "celeste"][i] + ".png", 60, y, 360, 124, "Tarjeta dibujada", { al: "l", obj: G("País " + n, "Tarjeta") });
      foto(s, A + f, e.x + 22, y + 26, 48, 32, "Bandera " + n, { obj: G("País " + n, "Bandera") });
      txt(s, n, e.x + 80, y + 28, e.w - 100, 26, { bold: true, fontSize: 16, valign: "middle", objectName: G("País " + n, "Nombre") });
      txt(s, d, e.x + 22, y + 66, e.w - 44, 34, { fontSize: 10, color: HX.gris, objectName: G("País " + n, "Detalle") });
    });
    txt(s, "Plantas industriales, forestales y oficinas comerciales en el Cono Sur.", 300, 130, 170, 120, { fontSize: 12, color: HX.gris, valign: "middle" });
    s.addNotes("Mapa, pines, banderas y tarjetas dibujadas originales. Mover los pines para marcar cada planta.");
  }

  // ================= GALERÍA DE RECURSOS ORIGINALES =================
  function galeria() {
    // Logos y marcas
    let s = galSlide("LOGOS Y MARCAS", "Logos originales recortados del institucional 2026. Usar siempre estas imágenes; no redibujar ni deformar (mantener proporción con Mayús).");
    MARCAS.forEach((k, i) => { img(s, `ficha-${k}.png`, 40 + i * 120, 60, 104, 130, "Ficha " + NOMBRE[k]); cap(s, "Ficha " + NOMBRE[k], 40 + i * 120, 194, 110); });
    s.addShape(SH.roundRect, { x: p(40), y: p(225), w: p(580), h: p(80), rectRadius: p(16), fill: { color: C.text1 }, line: { type: "none" }, objectName: "Fondo tinta" });
    MARCAS.forEach((k, i) => img(s, `logo-${k}-blanco.png`, 56 + i * 112, 240, 96, 50, "Logo " + NOMBRE[k] + " blanco"));
    cap(s, "Logos en blanco · sobre foto, tinta o color de unidad", 40, 310, 300);
    MARCAS.forEach((k, i) => {
      const x = 50 + i * 112, g = "Marca círculo " + k;
      s.addShape(SH.ellipse, { x: p(x), y: p(340), w: p(84), h: p(84), fill: { color: "FFFFFF" }, line: { color: C.background2, width: 1.5 }, shadow: { type: "outer", color: "1F497D", opacity: 0.12, blur: 6, offset: 2, angle: 90 }, objectName: G(g, "Círculo") });
      img(s, `logo-${k}-color.png`, x + 12, 355, 60, 54, "Logo " + NOMBRE[k], { obj: G(g, "Logo") });
    });
    cap(s, "Logo en color dentro de círculo blanco (contenido, resumen)", 40, 432, 320);
    s.addShape(SH.roundRect, { x: p(660), y: p(60), w: p(260), h: p(170), rectRadius: p(20), fill: { color: C.background2 }, line: { type: "none" }, objectName: "Panel arena" });
    img(s, "logo-cartocor-color.png", 690, 80, 200, 130, "Logo Cartocor color");
    cap(s, "Cartocor en color · fondos claros", 660, 236);
    s.addShape(SH.roundRect, { x: p(660), y: p(270), w: p(260), h: p(170), rectRadius: p(20), fill: { color: "FFFFFF" }, line: { color: C.background2, width: 1.5 }, objectName: "Panel blanco" });
    img(s, "logo-grupo-arcor.png", 700, 290, 180, 130, "Logo Grupo Arcor");
    cap(s, "Grupo Arcor · respaldo corporativo", 660, 446);

    // Formas dibujadas originales
    s = galSlide("FORMAS DIBUJADAS ORIGINALES", "Formas a mano alzada del 2026 y de la referencia Arcor. Se pueden escalar y recolorear (Formato de imagen › Color). La esquina doblada va solo en portada.");
    const F = [
      ["esquina-doblada.png", 40, 60, 90, 115, "Esquina doblada (portada)"], ["caja-dibujada.png", 160, 70, 110, 80, "Caja abierta dibujada"], ["caja-dibujada-2026.png", 290, 70, 110, 80, "Caja 2026"],
      ["marco-circular-dibujado.png", 420, 60, 110, 100, "Marco circular"], ["pill-celeste-dibujada.png", 550, 75, 200, 60, "Pill celeste dibujada"], ["panel-dibujado.png", 770, 60, 150, 90, "Panel dibujado"],
      ["mancha-arena.png", 40, 200, 280, 110, "Mancha arena"], ["panel-arena-dibujado.png", 340, 200, 280, 110, "Panel arena dibujado"], ["ola-azul-textura.png", 640, 195, 280, 120, "Ola azul con textura"],
      ["tarjeta-verde.png", 40, 345, 160, 95, "Tarjeta verde"], ["tarjeta-amarilla.png", 215, 345, 160, 95, "Tarjeta amarilla"], ["tarjeta-celeste.png", 390, 345, 160, 95, "Tarjeta celeste"],
      ["conectores-valores.png", 570, 340, 180, 100, "Conectores de valores"], ["globo-ilustrado.png", 770, 345, 150, 95, "Globo ilustrado"],
      ["linea-puntos.png", 40, 465, 300, 40, "Línea de puntos"], ["ola-azul-ancha.png", 360, 465, 300, 40, "Ola azul ancha"], ["linea-corazon.png", 680, 470, 140, 34, "Línea corazón"], ["pin-naranja.png", 850, 460, 40, 46, "Pin"],
    ];
    F.forEach(([f, x, y, w, h, n]) => { const e = img(s, f, x, y, w, h, n); cap(s, n, x, Math.max(y + h, e.y + e.h) + 2, w + 20); });

    // Íconos originales
    s = galSlide("ÍCONOS ORIGINALES", "Íconos dibujados del institucional 2026 y de la referencia Arcor. Unidad: ícono en tinta sobre círculo de color desplazado.");
    [["corrugado", "Corrugado"], ["flexibles", "Flexibles"], ["papel", "Papel reciclado"], ["kraft", "Papel kraft"], ["bolsas", "Bolsas"]].forEach(([k, n], i) => {
      const x = 50 + i * 120;
      circIcon(s, k, x, 70, 80, G("Ícono " + n, "Círculo"));
      cap(s, n, x, 160, 100);
    });
    [["corrugado", C.accent1], ["bolsas", C.accent4], ["papel", C.accent2], ["bobina", C.accent5], ["reciclado", C.accent3]].forEach(([k, c], i) => {
      const x = 50 + i * 120, g = "Ícono blanco " + k;
      s.addShape(SH.ellipse, { x: p(x), y: p(200), w: p(80), h: p(80), fill: { color: c }, line: { type: "none" }, objectName: G(g, "Círculo") });
      img(s, `icono-${k}-blanco.png`, x + 18, 218, 44, 44, "Ícono " + k, { obj: G(g, "Ícono") });
      cap(s, "Blanco · " + k, x, 286, 100);
    });
    cap(s, "Unidades de negocio · tinta sobre color", 660, 100, 260);
    cap(s, "Versión blanca sobre círculo lleno", 660, 236, 260);
    ["fruta", "lacteos", "pollo", "carne"].forEach((k, i) => { img(s, `icono-mercado-${k}.png`, 50 + i * 110, 330, 80, 70, "Mercado " + k); cap(s, "Mercado · " + k, 50 + i * 110, 404, 100); });
    ["planta", "planta-naranja", "flexible", "energia", "carton", "agro", "alimentos"].forEach((k, i) => { img(s, `dibujo-${k}.png`, 50 + i * 120, 440, 70, 54, "Dibujo " + k); cap(s, "Dibujo · " + k, 40 + i * 120, 498, 110); });
    cap(s, "Mercados (2026)", 520, 365, 160);

    // Banderas y mapas
    s = galSlide("BANDERAS Y MAPAS", "Mapas y banderas originales. Para marcar plantas usar el pin naranja o círculos del color de la unidad.");
    [["mapa-argentina.png", 40, 60, 170, 400, "Mapa Argentina"], ["mapa-provincias.png", 230, 60, 260, 400, "Mapa por provincias"], ["mapa-sudamerica.png", 510, 60, 260, 230, "Mapa Sudamérica"]].forEach(([f, x, y, w, h, n]) => { const e = img(s, f, x, y, w, h, n); cap(s, n, x, e.y + e.h + 4, w); });
    [["bandera-argentina.png", "Argentina"], ["bandera-chile.png", "Chile"], ["bandera-peru.png", "Perú"]].forEach(([f, n], i) => { foto(s, A + f, 520 + i * 90, 340, 72, 46, "Bandera " + n); cap(s, n, 520 + i * 90, 390, 80); });
    foto(s, A + "bandera-chile-circulo.png", 800, 340, 50, 50, "Bandera Chile círculo", { round: true });
    foto(s, A + "bandera-peru-circulo.png", 860, 340, 50, 50, "Bandera Perú círculo", { round: true });
    cap(s, "Banderas en círculo", 800, 394, 120);
    for (let i = 0; i < 5; i++) img(s, "pin-naranja.png", 520 + i * 40, 440, 24, 30, "Pin naranja");
    cap(s, "Pin naranja original", 520, 474, 160);

    // Productos
    s = galSlide("PRODUCTOS RECORTADOS", "Recortes sin fondo de los decks 2025 y 2026. Llevan sombra de producto (Formato › Efectos › Sombra exterior, tinta 22 %).");
    for (let i = 0; i < 25; i++) { const c = i % 9, r = Math.floor(i / 9); img(s, `producto-${String(i + 1).padStart(2, "0")}.png`, 40 + c * 100, 60 + r * 100, 86, 86, "Producto " + (i + 1), { shadow: true }); }
    ["maquina-tf-mini", "maquina-mav", "maquina-bf-dual", "bobinas-carton", "pallet", "display-pop", "bolsa-cemento"].forEach((k, i) => { img(s, `producto-${k}.png`, 40 + i * 128, 370, 110, 100, k, { shadow: true }); cap(s, k.replace(/-/g, " "), 40 + i * 128, 474, 120); });

    // Fotos
    s = galSlide("FOTOGRAFÍA", "Fotos originales. Bosque para apertura, contenido, sostenibilidad y cierre; planta industrial para separadores y fondos. Recortar con Recortar › Rellenar, nunca estirar.");
    const fotos = ["bosque", "bosque-alto", "bosque-camino", "bosque-sostenibilidad", "plantacion", "plantines", "carton-onda", "corrugado-maquina", "planta-corrugado", "bobina", "rollos", "rollos-reciclado", "tubos", "pila-papel", "maquina", "operario", "manos-caja", "oficina", "reunion", "bolsas-industriales", "flexibles"];
    fotos.forEach((k, i) => { const c = i % 7, r = Math.floor(i / 7), x = 40 + c * 128, y = 60 + r * 150; foto(s, A + `foto-${k}.jpg`, x, y, 116, 116, "Foto " + k); cap(s, k.replace(/-/g, " "), x, y + 118, 116); });

    // Clientes y certificaciones
    s = galSlide("CLIENTES Y CERTIFICACIONES", "Logos de clientes y sellos de certificación. Clientes: solo con autorización comercial.");
    for (let i = 0; i < 40; i++) { const c = i % 10, r = Math.floor(i / 10); img(s, `cliente-${String(i + 1).padStart(2, "0")}.png`, 40 + c * 88, 60 + r * 70, 76, 56, "Cliente " + (i + 1)); }
    [["fsc", "FSC"], ["pefc", "PEFC"], ["iso9001", "ISO 9001"], ["iso14001", "ISO 14001"], ["iso45001", "ISO 45001"], ["fssc22000", "FSSC 22000"]].forEach(([k, n], i) => { img(s, `cert-${k}.png`, 60 + i * 120, 360, 80, 80, n); cap(s, n, 60 + i * 120, 444, 100); });
    img(s, "qr-cartocor.png", 800, 350, 100, 100, "QR cartocor.com"); cap(s, "QR cartocor.com", 800, 454, 110);
  }

  return { modulos, galeria };
};
