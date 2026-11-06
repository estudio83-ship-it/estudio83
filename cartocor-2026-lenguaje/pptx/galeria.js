// Cartocor 2026 — módulos institucionales (estilo Arcor 2026) + galería de elementos editables.
// Convención: objectName "G·<grupo>·<pieza>" → el post-proceso agrupa las piezas consecutivas de un mismo grupo.
const fs = require("fs");
const path = require("path");

module.exports = function (ctx) {
  const { A, fit, enc, pres, C, SH, HX, U, p, ICONS, IMG, SCR, LIGHT, CIFRAS, MANO, THEME, circIcon, pillShapes, drawObjs } = ctx;
  const T = THEME.colors;
  const TINT = { corrugado: "E6F3D6", papel: "FBF2D2", flexibles: "D9E5F4", bolsas: "E4E0EC", celeste: "E5EEF7", kraft: "F2E5CF" };
  const UCOL = { corrugado: C.accent1, papel: C.accent2, flexibles: C.accent3, bolsas: C.accent4, kraft: C.accent5 };
  const UHEX = { corrugado: T.accent1, papel: T.accent2, flexibles: T.accent3, bolsas: T.accent4, kraft: T.accent5, celeste: HX.celeste };
  const CG = process.env.NOFREE ? SH.rect : SH.custGeom;
  let gid = 0;
  const G = (grupo, pieza) => `G·${grupo}·${pieza}`;
  const newG = (base) => `${base} ${++gid}`;

  // ---------- geometría dibujada a mano (freeforms editables) ----------
  function prng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
  // contorno de rectángulo redondeado con temblor de trazo; devuelve puntos en pulgadas relativos a la caja
  function wobblyRectPts(w, h, r, amp, seed, n = 140) {
    const R = prng(seed), f1 = 3 + R() * 3, f2 = 9 + R() * 5, ph1 = R() * 6, ph2 = R() * 6;
    const m = amp + 1, W = w - 2 * m, H = h - 2 * m; r = Math.min(r, W / 2, H / 2);
    const segs = [W - 2 * r, Math.PI * r / 2, H - 2 * r, Math.PI * r / 2, W - 2 * r, Math.PI * r / 2, H - 2 * r, Math.PI * r / 2];
    const per = segs.reduce((a, b) => a + b, 0);
    const pt = (d) => { // punto y normal a distancia d del perímetro
      let i = 0; while (d > segs[i] && i < 7) { d -= segs[i]; i++; }
      const corners = [[W - r, r], [W - r, H - r], [r, H - r], [r, r]];
      switch (i) {
        case 0: return [r + d, 0, 0, -1];
        case 2: return [W, r + d, 1, 0];
        case 4: return [W - r - d, H, 0, 1];
        case 6: return [0, H - r - d, -1, 0];
        default: { const k = (i - 1) / 2, [cx, cy] = corners[k], a0 = -Math.PI / 2 + k * Math.PI / 2, a = a0 + d / r; return [cx + r * Math.cos(a), cy + r * Math.sin(a), Math.cos(a), Math.sin(a)]; }
      }
    };
    const pts = [];
    for (let j = 0; j < n; j++) {
      const t = j / n, [x, y, nx, ny] = pt(t * per);
      const o = amp * (0.6 * Math.sin(t * Math.PI * 2 * f1 + ph1) + 0.4 * Math.sin(t * Math.PI * 2 * f2 + ph2));
      pts.push({ x: p(m + x + nx * o), y: p(m + y + ny * o) });
    }
    pts.push({ close: true });
    return pts;
  }
  function blobPts(w, h, seed, n = 100) {
    const R = prng(seed), a = R() * 6, b = R() * 6, c = R() * 6;
    const pts = [];
    for (let j = 0; j < n; j++) {
      const th = j / n * Math.PI * 2;
      const k = 0.9 + 0.06 * Math.sin(3 * th + a) + 0.04 * Math.sin(5 * th + b) + 0.02 * Math.sin(2 * th + c);
      pts.push({ x: p(w / 2 + (w / 2) * k * Math.cos(th)), y: p(h / 2 + (h / 2) * k * Math.sin(th)) });
    }
    pts.push({ close: true });
    return pts;
  }
  function wavePts(w, h, top, amp, ciclos, fase = 0) {
    const pts = [];
    for (let j = 0; j <= 80; j++) { const x = w * j / 80; pts.push({ x: p(x), y: p(top + amp * Math.sin(j / 80 * Math.PI * 2 * ciclos + fase)) }); }
    pts.push({ x: p(w), y: p(h) }, { x: p(0), y: p(h) }, { close: true });
    return pts;
  }
  // curva abierta suave por puntos (px relativos a la caja)
  function curvePts(list) {
    const pts = [{ x: p(list[0][0]), y: p(list[0][1]) }];
    for (let i = 1; i < list.length; i++) {
      const [x0, y0] = list[i - 1], [x1, y1] = list[i], dx = (x1 - x0) / 2;
      pts.push({ x: p(x1), y: p(y1), curve: { type: "cubic", x1: p(x0 + dx), y1: p(y0), x2: p(x1 - dx), y2: p(y1) } });
    }
    return pts;
  }
  const free = (s, x, y, w, h, points, o) => process.env.NOFREE ? s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(w), h: p(h), rectRadius: 0.1, fill: o.fill, line: { color: (o.line || {}).color || C.text1, width: 1 }, objectName: o.objectName }) : s.addShape(CG, { x: p(x), y: p(y), w: p(w), h: p(h), points, ...o });

  function sketchPanel(s, x, y, w, h, { r = 26, fill = C.background2, line = C.accent6, lw = 1.3, seed = 1, grupo, doble = true } = {}) {
    const g = grupo || newG("Panel dibujado");
    free(s, x, y, w, h, wobblyRectPts(w, h, r, 2.2, seed), { fill: fill ? { color: fill } : { type: "none" }, line: { color: line, width: lw }, objectName: G(g, "Relleno y trazo") });
    if (doble) free(s, x - 3, y + 2, w + 5, h - 1, wobblyRectPts(w + 5, h - 1, r, 2.6, seed + 7), { fill: { type: "none" }, line: { color: line, width: lw * 0.7 }, objectName: G(g, "Segundo trazo") });
    return g;
  }
  // Caja abierta dibujada como vector editable (viewBox 96×72)
  const CAJA_LINES = [
    [[22, 30], [22, 56], [52, 67], [52, 40], "c"], [[52, 40], [78, 28], [78, 54], [52, 67]],
    [[22, 30], [6, 18], [36, 10], [52, 22], "c"], [[52, 22], [66, 8], [88, 16], [78, 28]],
    [[36, 10], [52, 22], [78, 28]], [[21.5, 31], [52.5, 39.5], [77, 27.5]],
  ];
  function cajaVector(s, x, y, w, grupo, color = C.text1) {
    const k = w / 96, pts = [];
    for (const ln of CAJA_LINES) {
      ln.forEach((q, i) => {
        if (q === "c") pts.push({ close: true });
        else pts.push(i === 0 ? { x: p(q[0] * k), y: p(q[1] * k), moveTo: true } : { x: p(q[0] * k), y: p(q[1] * k) });
      });
    }
    free(s, x, y, w, w * 0.75, pts, { fill: { type: "none" }, line: { color, width: 1.3 }, objectName: grupo ? G(grupo, "Caja dibujada") : "Caja dibujada" });
  }
  function pillTitulo(s, x, y, w, h, runs, grupo, cajaW = 80) {
    const g = grupo || newG("Título pill");
    const r = p(h) / 2;
    s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(w), h: p(h), rectRadius: r, fill: { color: C.background2 }, line: { type: "none" }, objectName: G(g, "Pill") });
    s.addShape(SH.roundRect, { x: p(x - 6), y: p(y - 4), w: p(w + 14), h: p(h + 6), rectRadius: r, fill: { type: "none" }, line: { color: C.text1, width: 1.4 }, rotate: -1.3, objectName: G(g, "Trazo 1") });
    s.addShape(SH.roundRect, { x: p(x + 2), y: p(y + 1), w: p(w + 1), h: p(h + 5), rectRadius: r, fill: { type: "none" }, line: { color: C.text2, width: 1.1 }, rotate: 0.9, objectName: G(g, "Trazo 2") });
    if (cajaW) cajaVector(s, x - cajaW * 0.6, y - cajaW * 0.18, cajaW, g);
    s.addText(runs, { x: p(x + 16), y: p(y), w: p(w - 32), h: p(h), fontSize: h > 60 ? 30 : 22, color: C.text1, align: "center", valign: "middle", margin: 0, fit: "shrink", objectName: G(g, "Texto") });
    return g;
  }
  const mixto = (a, b) => [{ text: a + " ", options: { fontFace: LIGHT } }, { text: b, options: { bold: true } }];
  function etiqueta(s, x, y, w, texto, colr, grupo) {
    const g = grupo || newG("Etiqueta");
    s.addText(texto, { shape: SH.roundRect, x: p(x), y: p(y), w: p(w), h: p(30), rectRadius: p(15), fill: { color: C.background1 }, line: { color: colr, width: 1.5 }, fontSize: 12, bold: true, color: colr, charSpacing: 1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Etiqueta") });
    s.addShape(SH.roundRect, { x: p(x + 3), y: p(y + 3), w: p(w - 2), h: p(29), rectRadius: p(15), fill: { type: "none" }, line: { color: colr, width: 0.8 }, rotate: 1, objectName: G(g, "Trazo") });
  }
  function cap(s, text, x, y, w = 200) {
    s.addText(text, { x: p(x), y: p(y), w: p(w), h: p(16), fontSize: 9, italic: true, color: HX.gris, margin: 0, isTextBox: true, objectName: "Rótulo de galería" });
  }
  function galeriaSlide(titulo, nota) {
    const s = pres.addSlide({ masterName: "GALERIA", sectionTitle: "Galería de elementos" });
    s.addText(titulo, { placeholder: "title" });
    if (nota) s.addNotes(nota);
    return s;
  }
  function svgIcon(name, hex = "#1F497D", sw = 1.6) {
    if (process.env.NOSVG) return null;
    const f = path.join(__dirname, "node_modules/lucide-static/icons", name + ".svg");
    if (!fs.existsSync(f)) return null;
    let t = fs.readFileSync(f, "utf8").replace(/<!--.*?-->/s, "").replace(/stroke="currentColor"/, `stroke="${hex}"`).replace(/stroke-width="2"/, `stroke-width="${sw}"`).replace(/width="24"/, 'width="96"').replace(/height="24"/, 'height="96"').replace(/class="[^"]*"/, "");
    return "image/svg+xml;base64," + Buffer.from(t).toString("base64");
  }
  function puntoLinea(s, x, y, w, colores, grupo) { // línea ondulada con puntos de color (estilo Arcor)
    const g = grupo || newG("Línea con puntos");
    const list = []; for (let i = 0; i <= 6; i++) list.push([w * i / 6, 14 + 10 * Math.sin(i * 1.3)]);
    free(s, x, y, w, 40, curvePts(list), { fill: { type: "none" }, line: { color: C.text1, width: 1.2 }, objectName: G(g, "Línea") });
    colores.forEach((c, i) => {
      const t = (i + 0.5) / colores.length, xi = w * t, yi = 14 + 10 * Math.sin(t * 6 * 1.3);
      s.addShape(SH.ellipse, { x: p(x + xi - 9), y: p(y + yi - 9), w: p(18), h: p(18), fill: { color: c }, line: { color: C.background1, width: 1.5 }, objectName: G(g, "Punto " + (i + 1)) });
    });
    return g;
  }
  function pin(s, x, y, col, grupo, d = 26) { // pin de mapa: lágrima girada + centro blanco
    const g = grupo || newG("Pin");
    s.addShape(SH.teardrop, { x: p(x), y: p(y), w: p(d), h: p(d), fill: { color: col }, line: { type: "none" }, rotate: 135, objectName: G(g, "Gota") });
    s.addShape(SH.ellipse, { x: p(x + d * 0.3), y: p(y + d * 0.3), w: p(d * 0.4), h: p(d * 0.4), fill: { color: C.background1 }, line: { type: "none" }, objectName: G(g, "Centro") });
  }
  function fotoCirculo(s, x, y, d, foto, ringCol, grupo, badge) {
    const g = grupo || newG("Foto circular");
    s.addShape(SH.ellipse, { x: p(x - 4), y: p(y - 4), w: p(d + 8), h: p(d + 8), fill: { color: C.background1 }, line: { color: ringCol, width: 1.5 }, objectName: G(g, "Aro") });
    s.addImage({ path: fit(foto, d, d), x: p(x), y: p(y), w: p(d), h: p(d), rounding: true, altText: "Foto", objectName: G(g, "Foto") });
    if (badge) {
      const u = U[badge], bd = d * 0.34, bx = x + d - bd * 0.75, by = y + d - bd * 0.85;
      s.addShape(SH.ellipse, { x: p(bx), y: p(by), w: p(bd), h: p(bd), fill: { color: u.col }, line: { color: C.background1, width: 2 }, objectName: G(g, "Insignia") });
      s.addImage({ data: ICONS[u.ico + "-" + u.icoCol], x: p(bx + bd * 0.2), y: p(by + bd * 0.2), w: p(bd * 0.6), h: p(bd * 0.6), altText: "Ícono " + u.nombre, objectName: G(g, "Ícono") });
    }
    return g;
  }
  const FOTO = { bosque: SCR + "up/foto-bosque.jpg", corr: SCR + "up/foto-corrugado.jpg", bob: SCR + "up/foto-bobina-kraft.jpg" };

  // ---------- layouts nuevos ----------
  pres.defineSlideMaster({
    title: "GALERIA", background: { color: C.background1 },
    objects: [
      { placeholder: { options: { name: "title", type: "title", x: p(40), y: p(18), w: p(700), h: p(30), fontSize: 18, bold: true, color: HX.gris, align: "left", valign: "middle", margin: 0 }, text: "GALERÍA" } },
      { text: { text: "Galería Cartocor 2026 · copiar y pegar · todo es editable", options: { x: p(560), y: p(516), w: p(360), h: p(16), fontSize: 8, italic: true, color: HX.gris, align: "right", margin: 0 } } },
    ],
  });
  pres.defineSlideMaster({
    title: "TITULO CON OLA", background: { color: C.background1 },
    objects: [
      { text: { text: "", options: { shape: CG, x: 0, y: p(440), w: p(960), h: p(100), points: wavePts(960, 100, 40, 14, 1.3, 0.6), fill: { color: C.text1 }, line: { type: "none" } } } },
      { text: { text: "", options: { shape: CG, x: 0, y: p(430), w: p(960), h: p(110), points: wavePts(960, 110, 40, 12, 1.1, 2.1), fill: { color: C.text2, transparency: 55 }, line: { type: "none" } } } },
      { placeholder: { options: { name: "title", type: "title", x: p(120), y: p(28), w: p(720), h: p(46), fontSize: 30, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0 }, text: "TÍTULO CENTRADO" } },
      { placeholder: { options: { name: "body", type: "body", x: p(160), y: p(78), w: p(640), h: p(44), fontSize: 15, color: C.text1, align: "center", valign: "top", margin: 0 }, text: "Bajada en una o dos líneas" } },
    ],
  });

  // =====================================================================
  // MÓDULOS INSTITUCIONALES (del institucional Arcor 2026, en estilo Cartocor)
  // =====================================================================
  function modulos() {
    pres.addSection({ title: "Institucional" });
    // Historia
    let s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Institucional" });
    s.addText(mixto("NUESTRA", "Historia"), { placeholder: "title" });
    s.addShape(CG, { x: 0, y: p(430), w: p(960), h: p(110), points: wavePts(960, 110, 40, 14, 1.3, 0.6), fill: { color: C.text1 }, line: { type: "none" }, objectName: "Ola inferior" });
    sketchPanel(s, 50, 130, 860, 280, { seed: 3, grupo: "Panel historia" });
    s.addShape(SH.line, { x: p(50), y: p(258), w: p(860), h: 0, line: { color: HX.celeste, width: 1 }, objectName: "Línea de tiempo" });
    const hitos = [["1951", "Arcor abre su primera planta en Arroyito, Córdoba.", FOTO.bosque], ["1980", "Nace Cartocor con la planta de cartón corrugado de Paraná, Entre Ríos.", FOTO.corr], ["2017", "Adquisición de Zucamor: mayor productor de papel reciclado del país.", FOTO.bob], ["2026", "17 sitios y 920 MMU$S de ventas estimadas en Packaging.", FOTO.bosque]];
    hitos.forEach(([y, t, f], i) => timelineItem(s, 95 + i * 205, 140, y, t, f, "Hito " + y));
    s.addNotes("Línea de tiempo del institucional Arcor 2026 adaptada. Fechas de Arcor y Cartocor tomadas de ese deck; la de 2026 sale del institucional Cartocor. Reemplazar las fotos por fotos de archivo.");

    // Misión, visión, propósito
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Institucional" });
    s.addText(mixto("NUESTRA", "Filosofía"), { placeholder: "title" });
    s.addShape(CG, { x: 0, y: p(440), w: p(960), h: p(100), points: wavePts(960, 100, 40, 14, 1.3, 0.6), fill: { color: C.text1 }, line: { type: "none" }, objectName: "Ola inferior" });
    puntoLinea(s, 40, 120, 880, [C.accent1, C.accent2, C.accent3], "Línea con puntos");
    const mvp = [["Misión", "corrugado", "Brindar a las personas de todo el mundo la oportunidad de disfrutar alimentos y golosinas de calidad, ricos y saludables."], ["Visión", "papel", "Ser la empresa líder de alimentos y golosinas de Latinoamérica, reconocida internacionalmente por sus prácticas sostenibles."], ["Propósito", "flexibles", "Hacer accesibles las tendencias en alimentación para que todos puedan vivir mejor."]];
    mvp.forEach(([t, u, txt], i) => tarjetaMVP(s, 60 + i * 290, 170, 260, 230, t, u, txt));
    s.addNotes("Textos de Misión, Visión y Propósito del Grupo Arcor (institucional 2026), traducidos. Confirmar si Cartocor usa los del grupo.");

    // Valores (hub)
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Institucional" });
    s.addText(mixto("NUESTROS", "Valores"), { placeholder: "title" });
    hub(s, 480, 300, ["Integridad", "Espíritu emprendedor", "Cercanía", "Innovación", "Calidad", "Orientación a resultados", "Conexión humana", "Diversidad"], true);
    s.addNotes("Valores del Grupo Arcor (institucional 2026). El centro lleva el logo; cada valor puede llevar una línea de texto debajo.");

    // Somos Grupo Arcor (tres divisiones)
    s = pres.addSlide({ masterName: "TITULO CON OLA", sectionTitle: "Institucional" });
    s.addText("SOMOS GRUPO ARCOR", { placeholder: "title" });
    s.addText([{ text: "Un grupo multinacional líder con " }, { text: "tres divisiones conectadas estratégicamente", options: { bold: true } }, { text: " e impulsadas por la innovación." }], { placeholder: "body" });
    s.addShape(SH.roundRect, { x: p(60), y: p(140), w: p(840), h: p(270), rectRadius: p(40), fill: { color: TINT.celeste }, line: { type: "none" }, objectName: "Fondo celeste" });
    [["CONSUMO MASIVO", "Alimentos y golosinas de calidad con marcas presentes en más de 100 países.", "shopping-cart"], ["AGRONEGOCIOS", "Soluciones de ingredientes para alimentos, bebidas, papel y nutrición animal.", "sprout"], ["PACKAGING", "Cartocor, Converflex, Zucamor, Puntapel y Papel Misionero: líderes en el Cono Sur.", "package"]].forEach(([t, d, ic], i) => {
      const x = 90 + i * 270, g = "División " + t;
      sketchPanel(s, x, 160, 240, 230, { fill: C.background1, line: C.text1, seed: 11 + i, grupo: g });
      const icon = svgIcon(ic); if (icon) s.addImage({ data: icon, x: p(x + 95), y: p(176), w: p(50), h: p(50), altText: t, objectName: G(g, "Ícono") });
      etiqueta(s, x + 30, 236, 180, t, C.accent6, g);
      s.addText(d, { x: p(x + 18), y: p(280), w: p(204), h: p(96), fontSize: 13, color: C.text1, align: "center", valign: "top", margin: 0, objectName: G(g, "Texto") });
    });
    s.addNotes("Diapositiva del institucional Arcor 2026 en estilo Cartocor, con la ola inferior en azul tinta.");

    // Plantas (mapa)
    s = pres.addSlide({ masterName: "SOLO TITULO", sectionTitle: "Institucional" });
    s.addText(mixto("NUESTRAS", "Plantas"), { placeholder: "title" });
    mapa(s, 375, 116, true, 400);
    s.addNotes("Mapa base del institucional Arcor 2026. Ubicaciones de Cartocor y Papel Misionero tomadas de ese mapa: verificar contra el listado oficial de plantas.");
  }

  function timelineItem(s, x, y, anio, texto, foto, g) {
    fotoCirculo(s, x + 30, y + 10, 90, foto, C.accent6, g);
    s.addText(anio, { x: p(x), y: p(y + 108), w: p(150), h: p(28), fontFace: CIFRAS, fontSize: 22, bold: true, color: C.text1, align: "center", margin: 0, objectName: G(g, "Año") });
    s.addShape(SH.line, { x: p(x + 75), y: p(y + 136), w: 0, h: p(14), line: { color: C.text1, width: 1 }, objectName: G(g, "Marca") });
    s.addShape(SH.ellipse, { x: p(x + 72), y: p(y + 147), w: p(6), h: p(6), fill: { color: C.text1 }, line: { type: "none" }, objectName: G(g, "Punto") });
    s.addText(texto, { x: p(x), y: p(y + 160), w: p(150), h: p(70), fontSize: 12, color: C.text1, align: "center", valign: "top", margin: 0, objectName: G(g, "Texto") });
  }
  function tarjetaMVP(s, x, y, w, h, titulo, u, texto) {
    const g = "Tarjeta " + titulo, col = UCOL[u];
    s.addText(titulo, { x: p(x), y: p(y - 10), w: p(w), h: p(50), fontFace: MANO, fontSize: 38, color: col, align: "center", valign: "middle", margin: 0, objectName: G(g, "Título") });
    sketchPanel(s, x, y + 46, w, h - 46, { fill: TINT[u], line: col, seed: titulo.length * 3, grupo: g });
    s.addText(texto, { x: p(x + 20), y: p(y + 60), w: p(w - 40), h: p(h - 74), fontSize: 14, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Texto") });
  }
  function hub(s, cx, cy, nodos, conLogo, escala = 1) {
    const g = "Esquema radial";
    const R = 180 * escala, Ry = 150 * escala, cols = [C.accent1, C.accent2, C.accent3, C.accent4, C.accent6, C.accent5];
    nodos.forEach((n, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / nodos.length, nx = cx + R * 1.55 * Math.cos(a), ny = cy + Ry * Math.sin(a);
      const x0 = Math.min(cx, nx), y0 = Math.min(cy, ny), w = Math.max(Math.abs(nx - cx), 4), h = Math.max(Math.abs(ny - cy), 4);
      const sx = cx < nx ? 0 : w, sy = cy < ny ? 0 : h, ex = w - sx, ey = h - sy;
      free(s, x0, y0, w, h, curvePts([[sx, sy], [ex, ey]]), { fill: { type: "none" }, line: { color: HX.celeste, width: 1.5, dashType: "sysDot" }, objectName: G(g, "Conector " + (i + 1)) });
      const c = cols[i % cols.length];
      s.addShape(SH.ellipse, { x: p(nx - 7), y: p(ny - 7), w: p(14), h: p(14), fill: { color: c }, line: { color: C.background1, width: 1.5 }, objectName: G(g, "Punto " + (i + 1)) });
      const tx = nx + (Math.cos(a) >= -0.01 ? 12 : -152), al = Math.cos(a) >= -0.01 ? "left" : "right";
      s.addText(n, { x: p(Math.abs(Math.cos(a)) < 0.2 ? nx - 80 : tx), y: p(Math.abs(Math.cos(a)) < 0.2 ? (Math.sin(a) < 0 ? ny - 40 : ny + 10) : ny - 16), w: p(Math.abs(Math.cos(a)) < 0.2 ? 160 : 140), h: p(32), fontFace: MANO, fontSize: 24 * Math.max(escala, 0.75), color: c, align: Math.abs(Math.cos(a)) < 0.2 ? "center" : al, valign: "middle", margin: 0, objectName: G(g, "Nodo " + n) });
    });
    const d = 120 * escala;
    s.addShape(SH.ellipse, { x: p(cx - d / 2 - 10), y: p(cy - d / 2 - 10), w: p(d + 20), h: p(d + 20), fill: { color: C.background2 }, line: { type: "none" }, objectName: G(g, "Halo") });
    s.addShape(SH.ellipse, { x: p(cx - d / 2), y: p(cy - d / 2), w: p(d), h: p(d), fill: { color: C.text1 }, line: { type: "none" }, objectName: G(g, "Centro") });
    if (conLogo) s.addImage({ path: SCR + "img/logo-cartocor-blanco.png", x: p(cx - d * 0.4), y: p(cy - d * 0.12), w: p(d * 0.8), h: p(d * 0.8 * 425 / 1382), altText: "Cartocor", objectName: G(g, "Logo") });
    else s.addText("Centro", { x: p(cx - d / 2), y: p(cy - d / 2), w: p(d), h: p(d), fontSize: 14, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Texto centro") });
  }
  const PLANTAS = [ // [provincia, plantas, x, y] — x/y como fracción de la imagen del mapa
    ["MISIONES", "PAPEL MISIONERO · Puerto Mineral", 0.90, 0.11], ["ENTRE RÍOS", "CARTOCOR · Paraná", 0.68, 0.24],
    ["CÓRDOBA", "CARTOCOR · Arroyito, Villa del Totoral", 0.46, 0.235], ["SAN LUIS", "PAPEL MISIONERO · San Luis", 0.33, 0.30],
    ["SAN JUAN", "CARTOCOR · San Juan", 0.22, 0.22], ["MENDOZA", "CARTOCOR · Mendoza", 0.22, 0.29],
    ["BUENOS AIRES", "CARTOCOR · Luján, Quilmes, Ranelagh", 0.74, 0.33],
  ];
  function mapa(s, mx, my, conLista, h = 420) {
    const w = h * 984 / 1923;
    s.addImage({ path: A + "mapa-argentina.png", x: p(mx), y: p(my), w: p(w), h: p(h), altText: "Mapa de Argentina", objectName: "Mapa Argentina" });
    PLANTAS.forEach(([prov, txt, fx, fy]) => pin(s, mx + fx * w - 11, my + fy * h - 22, C.accent6, "Pin " + prov, 22));
    if (!conLista) return;
    PLANTAS.forEach(([prov, txt], i) => {
      const left = i < 4, x = left ? 40 : 660, y = 116 + (left ? i : i - 4) * 94, g = "Ubicación " + prov;
      s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(260), h: p(76), rectRadius: p(18), fill: { color: C.background1 }, line: { color: C.accent6, width: 1.2 }, objectName: G(g, "Caja") });
      s.addText([{ text: prov, options: { bold: true, color: C.accent6, fontSize: 12, breakLine: true } }, { text: txt, options: { color: C.text1, fontSize: 12 } }], { x: p(x + 60), y: p(y + 7), w: p(192), h: p(62), valign: "middle", margin: 0, objectName: G(g, "Texto") });
      const u = txt.startsWith("PAPEL") ? "kraft" : "corrugado";
      s.addShape(SH.ellipse, { x: p(x + 12), y: p(y + 18), w: p(40), h: p(40), fill: { color: UCOL[u] }, line: { type: "none" }, objectName: G(g, "Círculo") });
      s.addImage({ data: ICONS[U[u].ico + "-tinta"], x: p(x + 20), y: p(y + 26), w: p(24), h: p(24), altText: U[u].nombre, objectName: G(g, "Ícono") });
    });
  }

  // =====================================================================
  // GALERÍA
  // =====================================================================
  function galeria() {
    pres.addSection({ title: "Galería de elementos" });

    // G1 Títulos y etiquetas
    let s = galeriaSlide("TÍTULOS Y ETIQUETAS", "Cada pieza es un grupo: copiar, pegar y cambiar el texto. La caja abierta es un vector editable (Editar puntos).");
    pillTitulo(s, 110, 70, 360, 60, mixto("PACKAGING", "Highlights"), "Título pill grande"); cap(s, "Título pill · contexto Light + palabra clave Bold", 60, 140, 300);
    pillTitulo(s, 600, 74, 260, 50, [{ text: "PACKAGING", options: { bold: true } }], "Título pill una palabra", 66); cap(s, "Título pill · una palabra", 560, 136);
    pillTitulo(s, 110, 190, 230, 44, mixto("OUR", "Solutions"), "Título pill chico", 58); cap(s, "Título pill chico", 60, 244);
    s.addText("Título manuscrito", { x: p(420), y: p(180), w: p(300), h: p(50), fontFace: MANO, fontSize: 40, color: C.text1, margin: 0, objectName: G("Título manuscrito", "Texto") });
    free(s, 420, 228, 260, 16, curvePts([[0, 8], [65, 2], [130, 12], [195, 3], [260, 9]]), { fill: { type: "none" }, line: { color: C.accent1, width: 2.2 }, objectName: G("Título manuscrito", "Subrayado") });
    cap(s, "Título manuscrito + subrayado ondulado (separadores, valores)", 420, 250, 320);
    [["CORRUGADO", "corrugado"], ["PAPEL", "papel"], ["FLEXIBLES", "flexibles"], ["BOLSAS", "bolsas"], ["KRAFT", "kraft"]].forEach(([t, u], i) => etiqueta(s, 60 + i * 150, 300, 130, t, UCOL[u], "Etiqueta " + t));
    etiqueta(s, 810, 300, 110, "DESTACADO", C.accent6, "Etiqueta destacada");
    cap(s, "Etiquetas de unidad (pill con contorno doble)", 60, 338, 300);
    [1, 2, 3].forEach((n, i) => {
      const g = "Encabezado numerado " + n, x = 60 + i * 300;
      s.addText(String(n), { shape: SH.ellipse, x: p(x), y: p(380), w: p(44), h: p(44), fill: { color: [C.accent1, C.accent3, C.accent4][i] }, line: { type: "none" }, fontFace: CIFRAS, fontSize: 22, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Número") });
      s.addText([{ text: "Encabezado de bloque", options: { bold: true, fontSize: 16, breakLine: true } }, { text: "Bajada breve en una línea", options: { fontSize: 12 } }], { x: p(x + 56), y: p(378), w: p(220), h: p(48), color: C.text1, valign: "middle", margin: 0, objectName: G(g, "Texto") });
    });
    cap(s, "Encabezados numerados (solo cuando hay secuencia)", 60, 432, 300);
    cajaVector(s, 760, 410, 100, null); cap(s, "Caja dibujada (vector)", 760, 488, 140);
    s.addText("PACKAGING SALES – MMU$S", { x: p(420), y: p(450), w: p(300), h: p(26), fontSize: 18, bold: true, color: HX.gris, margin: 0, objectName: "Título de datos" });
    cap(s, "Título de diapositiva de datos (sin pill)", 420, 478, 260);

    // G2 Contenedores y fondos
    s = galeriaSlide("CONTENEDORES Y FONDOS", "Los paneles dibujados son formas libres: Editar puntos para ajustar el trazo. Cambiar relleno y contorno desde Formato de forma.");
    sketchPanel(s, 40, 60, 260, 150, { seed: 5, grupo: "Panel arena trazo naranja" }); cap(s, "Panel arena · trazo naranja (líneas de tiempo)", 40, 214, 260);
    sketchPanel(s, 340, 60, 260, 150, { seed: 9, line: C.text1, grupo: "Panel arena trazo tinta" }); cap(s, "Panel arena · trazo tinta", 340, 214);
    sketchPanel(s, 640, 60, 280, 150, { seed: 13, fill: C.background1, line: C.text1, grupo: "Panel blanco trazo tinta" }); cap(s, "Panel blanco · trazo tinta (divisiones)", 640, 214, 260);
    ["corrugado", "papel", "flexibles", "bolsas", "celeste"].forEach((u, i) => {
      sketchPanel(s, 40 + i * 180, 250, 160, 100, { seed: 20 + i, fill: TINT[u], line: UHEX[u] === HX.celeste ? HX.celeste : UCOL[u], grupo: "Tarjeta tinte " + u });
      s.addText(u === "celeste" ? "Transversal" : U[u].nombre, { x: p(50 + i * 180), y: p(285), w: p(140), h: p(30), fontFace: MANO, fontSize: 24, color: UHEX[u] === HX.celeste ? C.text2 : UCOL[u], align: "center", margin: 0, objectName: G("Tarjeta tinte " + u, "Título") });
    });
    cap(s, "Tarjetas con tinte de unidad (misión / visión / propósito)", 40, 354, 360);
    free(s, 40, 380, 220, 120, blobPts(220, 120, 4), { fill: { color: C.background2 }, line: { type: "none" }, objectName: "Mancha arena 1" });
    free(s, 280, 384, 150, 112, blobPts(150, 112, 8), { fill: { color: C.background2 }, line: { type: "none" }, objectName: "Mancha arena 2" });
    cap(s, "Manchas orgánicas (detrás de fotos y tablas)", 40, 500, 300);
    s.addShape(SH.roundRect, { x: p(460), y: p(386), w: p(160), h: p(100), rectRadius: p(22), fill: { color: C.background2 }, line: { color: C.background1, width: 1 }, shadow: { type: "outer", color: "000000", opacity: 0.12, blur: 8, offset: 2, angle: 90 }, objectName: "Panel vidrio" });
    cap(s, "Panel vidrio (sobre foto: 20 % transparencia)", 460, 490, 200);
    free(s, 650, 400, 270, 90, wavePts(270, 90, 30, 9, 1.2, 0.6), { fill: { color: C.text1 }, line: { type: "none" }, objectName: G("Ola inferior", "Ola") });
    free(s, 650, 394, 270, 96, wavePts(270, 96, 30, 8, 1, 2.1), { fill: { color: C.text2, transparency: 55 }, line: { type: "none" }, objectName: G("Ola inferior", "Ola transparente") });
    cap(s, "Ola inferior (estirar al ancho de la diapositiva)", 650, 494, 260);

    // G3 Cifras y KPI
    s = galeriaSlide("CIFRAS Y KPI", "Cambiar la cifra y el rótulo. Colores de unidad: verde Corrugado, amarillo Papel, azul Flexibles, violeta Bolsas.");
    const notaG = (x, y, a, b, c, d) => { const g = newG("Nota KPI"); ctxNota(s, x, y, 230, 70, a, b, c, d, g); };
    notaG(40, 60, "900 millones", "m² de ", "cartón corrugado", " por año"); notaG(40, 150, "23.000 ha", "de ", "plantaciones", " propias");
    cap(s, "Nota KPI (palabra clave en naranja)", 40, 226);
    [["Ventas", "920", "MMU$S", C.background2, C.text1], ["Cajas", "118 M", "+25 %", C.accent3, C.background1], ["Máquinas", "125", "instaladas", C.accent1, C.text1], ["Sitios", "17", "plantas", C.accent2, C.text1], ["Bolsas", "270 M", "por año", C.accent4, C.background1]].forEach(([l, v, sub, bg, fg], i) => {
      s.addText([{ text: l, options: { fontSize: 13, breakLine: true } }, { text: v, options: { fontFace: CIFRAS, fontSize: 30, bold: true, breakLine: true } }, { text: sub, options: { fontSize: 11 } }], { shape: SH.roundRect, x: p(300 + i * 126), y: p(60), w: p(114), h: p(150), rectRadius: p(22), fill: { color: bg }, line: { type: "none" }, color: fg, align: "center", valign: "middle", margin: 4, objectName: "Ficha KPI " + l });
    });
    cap(s, "Fichas KPI (resumen de performance)", 300, 214);
    [[40, 260, 150, C.accent1, "60 %", "energía renovable"], [200, 280, 120, C.accent3, "18 %", "rótulo"], [330, 300, 96, C.accent4, "550", "rótulo"]].forEach(([x, y, d, c, v, l]) => {
      s.addText([{ text: v, options: { fontFace: CIFRAS, fontSize: d > 120 ? 30 : 22, bold: true, color: c, breakLine: true } }, { text: l, options: { fontSize: 11, color: C.text1 } }], { shape: SH.ellipse, x: p(x), y: p(y), w: p(d), h: p(d), fill: { color: C.background2 }, line: { type: "none" }, align: "center", valign: "middle", margin: 6, objectName: "Burbuja dato " + v });
    });
    cap(s, "Burbujas de dato (3 tamaños)", 40, 416);
    { const g = "Cifra grande"; s.addText("+25 %", { x: p(460), y: p(262), w: p(200), h: p(70), fontFace: CIFRAS, fontSize: 60, bold: true, color: HX.corrOsc, margin: 0, objectName: G(g, "Cifra") }); s.addText("cajas armadas vs. 2025", { x: p(462), y: p(332), w: p(200), h: p(22), fontSize: 14, color: C.text1, margin: 0, objectName: G(g, "Rótulo") }); }
    cap(s, "Cifra protagonista (60 pt + rótulo)", 460, 358);
    { const g = "Chip variación"; s.addShape(SH.ellipse, { x: p(700), y: p(260), w: p(90), h: p(90), fill: { color: C.accent1 }, line: { type: "none" }, objectName: G(g, "Círculo") }); s.addText("+25 %", { x: p(700), y: p(278), w: p(90), h: p(30), fontFace: CIFRAS, fontSize: 20, bold: true, color: C.text1, align: "center", margin: 0, objectName: G(g, "Cifra") }); free(s, 722, 312, 46, 18, [{ x: 0, y: p(16) }, { x: p(14), y: p(6) }, { x: p(26), y: p(12) }, { x: p(44), y: 0 }], { fill: { type: "none" }, line: { color: C.text1, width: 2, endArrowType: "triangle" }, objectName: G(g, "Flecha") }); }
    { const g = "Chip baja"; s.addShape(SH.ellipse, { x: p(810), y: p(260), w: p(90), h: p(90), fill: { color: C.background2 }, line: { color: C.accent6, width: 1.5 }, objectName: G(g, "Círculo") }); s.addText("−8 %", { x: p(810), y: p(278), w: p(90), h: p(30), fontFace: CIFRAS, fontSize: 20, bold: true, color: C.accent6, align: "center", margin: 0, objectName: G(g, "Cifra") }); free(s, 832, 312, 46, 18, [{ x: 0, y: 0 }, { x: p(14), y: p(10) }, { x: p(26), y: p(4) }, { x: p(44), y: p(16) }], { fill: { type: "none" }, line: { color: C.accent6, width: 2, endArrowType: "triangle" }, objectName: G(g, "Flecha") }); }
    cap(s, "Chips de variación (sube / baja)", 700, 354);
    [["CORRUGADO", "600", "620", C.accent1], ["PAPEL", "150", "160", C.accent2], ["FLEXIBLES", "64", "80", C.accent3], ["BOLSAS", "56", "60", C.accent4]].forEach(([l, a, b, c], i) => {
      const g = "Barra unidad " + l, y = 400 + i * 26;
      s.addShape(SH.rect, { x: p(460), y: p(y), w: p(380), h: p(22), fill: { color: c }, line: { type: "none" }, objectName: G(g, "Barra") });
      s.addText(l, { x: p(470), y: p(y), w: p(200), h: p(22), fontFace: CIFRAS, fontSize: 13, bold: true, color: C.background1, charSpacing: 1, valign: "middle", margin: 0, objectName: G(g, "Rótulo") });
      s.addText(a, { x: p(680), y: p(y), w: p(70), h: p(22), fontFace: CIFRAS, fontSize: 13, bold: true, color: C.background1, align: "right", valign: "middle", margin: 0, objectName: G(g, "Valor 1") });
      s.addText(b, { x: p(760), y: p(y), w: p(70), h: p(22), fontFace: CIFRAS, fontSize: 13, bold: true, color: C.background1, align: "right", valign: "middle", margin: 0, objectName: G(g, "Valor 2") });
    });
    cap(s, "Barras por unidad (tabla de ventas)", 460, 506);
    [["Corrugado", C.accent1], ["Papel", C.accent2], ["Flexibles", C.accent3], ["Bolsas", C.accent4], ["Kraft", C.accent5]].forEach(([l, c], i) => {
      const g = "Leyenda"; s.addShape(SH.ellipse, { x: p(40 + (i % 2) * 110), y: p(440 + Math.floor(i / 2) * 22), w: p(12), h: p(12), fill: { color: c }, line: { type: "none" }, objectName: G(g, "Punto " + l) });
      s.addText(l, { x: p(58 + (i % 2) * 110), y: p(436 + Math.floor(i / 2) * 22), w: p(90), h: p(20), fontSize: 12, color: C.text1, valign: "middle", margin: 0, objectName: G(g, "Texto " + l) });
    });
    cap(s, "Leyenda de unidades", 40, 506, 140);

    // G4 Gráficos nativos
    s = galeriaSlide("GRÁFICOS NATIVOS", "Gráficos de PowerPoint: clic derecho > Editar datos. Copiarlos conserva el estilo; las fuentes siguen el tema.");
    const base = { showLegend: false, catAxisLabelColor: T.dk1, valAxisLabelColor: T.dk1, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 10, valAxisLabelFontSize: 9, valGridLine: { color: "E6E1DC", size: 0.5 }, catGridLine: { style: "none" }, dataLabelFontFace: "+mn-lt", dataLabelFontSize: 10, dataLabelColor: T.dk1, showTitle: true, titleFontFace: "+mn-lt", titleFontSize: 12, titleColor: T.dk1 };
    if (!process.env.NOCHART) {
    s.addChart(pres.charts.BAR, [{ name: "Millones de cajas", labels: ["2025", "2026(P)"], values: [94, 118] }], { ...base, x: p(30), y: p(56), w: p(290), h: p(210), barDir: "col", chartColors: [T.accent3], title: "Millones de cajas armadas", showValue: true, dataLabelPosition: "outEnd", barGapWidthPct: 80, valAxisHidden: true, valGridLine: { style: "none" }, objectName: "Gráfico columnas" });
    s.addChart(pres.charts.BAR, [{ name: "Máquinas", labels: ["Pollo", "Carne", "Otros", "Lácteos", "Fruta"], values: [35, 29, 15, 11, 35] }], { ...base, x: p(335), y: p(56), w: p(290), h: p(210), barDir: "bar", chartColors: [T.dk2], title: "Máquinas por mercado", showValue: true, dataLabelPosition: "outEnd", valAxisHidden: true, valGridLine: { style: "none" }, objectName: "Gráfico barras" });
    s.addChart(pres.charts.DOUGHNUT, [{ name: "Destino", labels: ["Intra-negocio", "Grupo Arcor", "Terceros"], values: [150, 95, 675] }], { ...base, x: p(640), y: p(56), w: p(290), h: p(210), holeSize: 60, chartColors: [T.accent3, T.accent4, T.accent1], title: "Destino de ventas 2026(e)", showValue: true, showLegend: true, legendPos: "r", legendFontFace: "+mn-lt", legendFontSize: 10, legendColor: T.dk1, dataLabelColor: "FFFFFF", dataBorder: { pt: 2, color: "FFFFFF" }, objectName: "Gráfico anillo" });
    s.addChart(pres.charts.LINE, [{ name: "Corrugado", labels: ["2022", "2023", "2024", "2025", "2026(e)"], values: [540, 560, 585, 600, 620] }, { name: "Papel", labels: ["2022", "2023", "2024", "2025", "2026(e)"], values: [130, 138, 145, 150, 160] }], { ...base, x: p(30), y: p(280), w: p(290), h: p(220), chartColors: [T.accent1, T.accent2], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 7, title: "Evolución de ventas (ejemplo)", showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 10, legendColor: T.dk1, objectName: "Gráfico líneas" });
    s.addChart(pres.charts.BAR, [{ name: "Corrugado", labels: ["2025", "2026(e)"], values: [600, 620] }, { name: "Papel", labels: ["2025", "2026(e)"], values: [150, 160] }, { name: "Flexibles", labels: ["2025", "2026(e)"], values: [64, 80] }, { name: "Bolsas", labels: ["2025", "2026(e)"], values: [56, 60] }], { ...base, x: p(335), y: p(280), w: p(290), h: p(220), barDir: "col", barGrouping: "stacked", chartColors: [T.accent1, T.accent2, T.accent3, T.accent4], title: "Ventas por unidad – MMU$S", showValue: true, dataLabelPosition: "ctr", dataLabelColor: "FFFFFF", showLegend: true, legendPos: "b", legendFontFace: "+mn-lt", legendFontSize: 10, legendColor: T.dk1, objectName: "Gráfico apilado" });
    const th = { fill: { color: T.dk1 }, color: "FFFFFF", bold: true, fontSize: 11, align: "center", valign: "middle" };
    const td = (t, o = {}) => ({ text: t, options: { fontSize: 11, color: T.dk1, align: "center", valign: "middle", fill: { color: o.fill || "FFFFFF" }, bold: o.bold } });
    s.addTable([
      [{ text: "Unidad", options: { ...th, align: "left" } }, { text: "2025", options: th }, { text: "2026(e)", options: th }, { text: "Var.", options: th }],
      [{ text: "Corrugado", options: { fontSize: 11, color: T.dk1, fill: { color: "FFFFFF" } } }, td("600"), td("620"), td("+3 %")],
      [{ text: "Papel", options: { fontSize: 11, color: T.dk1, fill: { color: T.lt2 } } }, td("150", { fill: T.lt2 }), td("160", { fill: T.lt2 }), td("+7 %", { fill: T.lt2 })],
      [{ text: "Flexibles", options: { fontSize: 11, color: T.dk1, fill: { color: "FFFFFF" } } }, td("64"), td("80"), td("+25 %")],
      [{ text: "Bolsas", options: { fontSize: 11, color: T.dk1, fill: { color: T.lt2 } } }, td("56", { fill: T.lt2 }), td("60", { fill: T.lt2 }), td("+7 %", { fill: T.lt2 })],
      [{ text: "Total", options: { fontSize: 12, bold: true, color: HX.corrOsc, fill: { color: "FFFFFF" } } }, td("870", { bold: true }), td("920", { bold: true }), td("+6 %", { bold: true })],
    ], { x: p(645), y: p(300), w: p(280), colW: [p(100), p(60), p(60), p(60)], rowH: p(28), border: { type: "solid", pt: 0.5, color: "E6E1DC" }, fontFace: "Raleway", objectName: "Tabla estilo" });
    }
    cap(s, "Tabla nativa (encabezado tinta, filas arena alternadas)", 645, 480, 280);

    // G5 Línea de tiempo
    s = galeriaSlide("LÍNEA DE TIEMPO", "Cada hito es un grupo (foto + año + marca + texto). Para cambiar la foto: clic derecho > Cambiar imagen.");
    sketchPanel(s, 40, 50, 880, 250, { seed: 31, grupo: "Panel línea de tiempo" });
    s.addShape(SH.line, { x: p(40), y: p(178), w: p(880), h: 0, line: { color: HX.celeste, width: 1 }, objectName: "Línea horizontal" });
    [["1951", "Texto del hito en dos o tres líneas.", FOTO.bosque], ["1980", "Texto del hito en dos o tres líneas.", FOTO.corr], ["2017", "Texto del hito en dos o tres líneas.", FOTO.bob], ["2026", "Texto del hito en dos o tres líneas.", FOTO.bosque]].forEach(([y, t, f], i) => timelineItem(s, 90 + i * 210, 60, y, t, f, "Hito " + y));
    cap(s, "Línea de tiempo con fotos (4 hitos)", 40, 304, 300);
    // variante compacta: años en pills sobre línea punteada
    free(s, 40, 410, 880, 30, curvePts([[0, 15], [880, 15]]), { fill: { type: "none" }, line: { color: C.text1, width: 1.5, dashType: "sysDot" }, objectName: G("Línea compacta", "Línea") });
    ["2022", "2023", "2024", "2025", "2026"].forEach((y, i) => {
      const x = 60 + i * 190, c = [C.accent1, C.accent2, C.accent3, C.accent4, C.accent6][i];
      s.addText(y, { shape: SH.roundRect, x: p(x), y: p(410), w: p(90), h: p(30), rectRadius: p(15), fill: { color: c }, line: { type: "none" }, fontFace: CIFRAS, fontSize: 15, bold: true, color: i === 2 || i === 3 ? C.background1 : C.text1, align: "center", valign: "middle", margin: 0, objectName: G("Línea compacta", "Año " + y) });
      s.addText("Hito breve", { x: p(x - 20), y: p(446), w: p(130), h: p(36), fontSize: 12, color: C.text1, align: "center", valign: "top", margin: 0, objectName: G("Línea compacta", "Texto " + y) });
    });
    cap(s, "Línea compacta (años en pill)", 40, 490);

    // G6 Procesos y ciclos
    s = galeriaSlide("PROCESOS Y CICLOS", "Conectores dibujados como curvas editables. Para más pasos, duplicar un paso y estirar la línea.");
    free(s, 80, 85, 600, 20, curvePts([[0, 10], [600, 10]]), { fill: { type: "none" }, line: { color: HX.celeste, width: 2, dashType: "sysDot" }, objectName: G("Proceso circular", "Línea") });
    ["Fibra", "Papel", "Cartón", "Caja"].forEach((t, i) => {
      const x = 50 + i * 200, c = [C.accent5, C.accent2, C.accent1, C.accent3][i];
      s.addText(String(i + 1), { shape: SH.ellipse, x: p(x), y: p(65), w: p(60), h: p(60), fill: { color: c }, line: { color: C.background1, width: 3 }, fontFace: CIFRAS, fontSize: 24, bold: true, color: C.background1, align: "center", valign: "middle", margin: 0, objectName: G("Proceso circular", "Paso " + (i + 1)) });
      s.addText([{ text: t, options: { bold: true, fontSize: 15, breakLine: true } }, { text: "Descripción breve", options: { fontSize: 12 } }], { x: p(x - 35), y: p(132), w: p(130), h: p(44), color: C.text1, align: "center", valign: "top", margin: 0, objectName: G("Proceso circular", "Texto " + (i + 1)) });
    });
    cap(s, "Proceso en pasos numerados", 40, 180);
    ["Diagnóstico", "Diseño", "Prototipo", "Producción", "Entrega"].forEach((t, i) => {
      const c = [C.accent1, C.accent2, C.accent3, C.accent4, C.text1][i];
      s.addText(t, { shape: SH.chevron, x: p(40 + i * 118), y: p(220), w: p(128), h: p(56), fill: { color: c }, line: { type: "none" }, fontSize: 12, bold: true, color: i === 0 || i === 1 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 0, objectName: G("Proceso chevrones", "Etapa " + (i + 1)) });
    });
    cap(s, "Chevrones (etapas)", 40, 282);
    // ciclo
    const ccx = 790, ccy = 370, rr = 92;
    const ciclo = [["Reciclado", C.accent1], ["Papel", C.accent2], ["Packaging", C.accent3], ["Consumo", C.accent4]];
    ciclo.forEach(([t, c], i) => {
      const a = -Math.PI / 2 + i * Math.PI / 2, a2 = a + Math.PI / 2;
      const p1 = [ccx + rr * Math.cos(a + 0.42), ccy + rr * Math.sin(a + 0.42)], p2 = [ccx + rr * Math.cos(a2 - 0.42), ccy + rr * Math.sin(a2 - 0.42)];
      const am = (a + a2) / 2, pm = [ccx + rr * 1.05 * Math.cos(am), ccy + rr * 1.05 * Math.sin(am)];
      const xs = [p1[0], p2[0], pm[0]], ys = [p1[1], p2[1], pm[1]], x0 = Math.min(...xs) - 2, y0 = Math.min(...ys) - 2, w = Math.max(...xs) - x0 + 2, h = Math.max(...ys) - y0 + 2;
      free(s, x0, y0, w, h, [{ x: p(p1[0] - x0), y: p(p1[1] - y0) }, { x: p(p2[0] - x0), y: p(p2[1] - y0), curve: { type: "quadratic", x1: p(2 * pm[0] - (p1[0] + p2[0]) / 2 - x0), y1: p(2 * pm[1] - (p1[1] + p2[1]) / 2 - y0) } }], { fill: { type: "none" }, line: { color: C.text1, width: 1.6, endArrowType: "triangle" }, objectName: G("Ciclo", "Flecha " + (i + 1)) });
      s.addText(t, { shape: SH.ellipse, x: p(ccx + rr * Math.cos(a) - 40), y: p(ccy + rr * Math.sin(a) - 40), w: p(80), h: p(80), fill: { color: c }, line: { color: C.background1, width: 3 }, fontSize: 10, fit: "none", bold: true, color: i < 2 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 2, objectName: G("Ciclo", "Nodo " + t) });
    });
    s.addText("Economía circular", { x: p(ccx - 55), y: p(ccy - 30), w: p(110), h: p(60), fontFace: MANO, fontSize: 24, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: G("Ciclo", "Centro") });
    cap(s, "Ciclo de 4 etapas", 560, 476, 100);
    // embudo / pirámide
    [["Clientes potenciales", 420], ["Propuestas", 340], ["Pedidos", 260], ["Clientes", 180]].forEach(([t, w], i) => {
      s.addText(t, { shape: SH.roundRect, rectRadius: p(21), x: p(40 + (420 - w) / 2), y: p(320 + i * 46), w: p(w), h: p(42), fill: { color: [C.text1, C.accent3, C.accent1, C.accent2][i] }, line: { type: "none" }, fontSize: 13, bold: true, color: i < 2 ? C.background1 : C.text1, align: "center", valign: "middle", margin: 0, objectName: G("Embudo", "Nivel " + (i + 1)) });
    });
    cap(s, "Embudo (4 niveles)", 40, 506);

    // G7 Esquemas
    s = galeriaSlide("ESQUEMAS", "Esquema radial (valores), matriz 2×2, organigrama y comparativo. Todos agrupados: Desagrupar para mover piezas sueltas.");
    hub(s, 230, 280, ["Nodo 1", "Nodo 2", "Nodo 3", "Nodo 4", "Nodo 5", "Nodo 6"], false, 0.62);
    cap(s, "Esquema radial (valores, ejes estratégicos)", 40, 490, 260);
    // matriz 2x2
    { const g = "Matriz 2x2", x = 480, y = 70, q = 90;
      [[0, 0, TINT.corrugado, "Alto / Bajo"], [1, 0, TINT.flexibles, "Alto / Alto"], [0, 1, TINT.bolsas, "Bajo / Bajo"], [1, 1, TINT.papel, "Bajo / Alto"]].forEach(([i, j, c, t]) => s.addText(t, { shape: SH.roundRect, x: p(x + i * (q + 8)), y: p(y + j * (q + 8)), w: p(q), h: p(q), rectRadius: p(16), fill: { color: c }, line: { type: "none" }, fontSize: 12, bold: true, color: C.text1, align: "center", valign: "middle", margin: 4, objectName: G(g, "Cuadrante " + t) }));
      s.addShape(SH.line, { x: p(x - 14), y: p(y + 2 * q + 22), w: p(2 * q + 22), h: 0, line: { color: C.text1, width: 1.2, endArrowType: "triangle" }, objectName: G(g, "Eje X") });
      s.addShape(SH.line, { x: p(x - 14), y: p(y - 6), w: 0, h: p(2 * q + 28), line: { color: C.text1, width: 1.2, beginArrowType: "triangle" }, objectName: G(g, "Eje Y") });
      s.addText("Eje X", { x: p(x + q), y: p(y + 2 * q + 24), w: p(q), h: p(18), fontSize: 11, color: C.text1, align: "right", margin: 0, objectName: G(g, "Rótulo X") });
      s.addText("Eje Y", { x: p(x - 60), y: p(y - 6), w: p(44), h: p(18), fontSize: 11, color: C.text1, align: "right", margin: 0, objectName: G(g, "Rótulo Y") });
    }
    cap(s, "Matriz 2×2", 466, 290);
    // organigrama
    { const g = "Organigrama", ox = 795;
      const caja = (x, y, t, sub, c, fg) => s.addText([{ text: t, options: { bold: true, fontSize: 11, breakLine: true } }, { text: sub, options: { fontSize: 9 } }], { shape: SH.roundRect, x: p(x), y: p(y), w: p(70), h: p(44), rectRadius: p(12), fill: { color: c }, line: { type: "none" }, color: fg, align: "center", valign: "middle", margin: 2, objectName: G(g, "Caja " + t) });
      caja(ox, 70, "Dirección", "Nombre", C.text1, C.background1);
      s.addShape(SH.line, { x: p(ox + 35), y: p(114), w: 0, h: p(16), line: { color: C.text1, width: 1 }, objectName: G(g, "Línea 1") });
      s.addShape(SH.line, { x: p(ox - 40), y: p(130), w: p(150), h: 0, line: { color: C.text1, width: 1 }, objectName: G(g, "Línea 2") });
      [[ox - 75, "Área 1", C.accent1], [ox, "Área 2", C.accent3], [ox + 75, "Área 3", C.accent4]].forEach(([x, t, c], i) => {
        s.addShape(SH.line, { x: p(x + 35), y: p(130), w: 0, h: p(16), line: { color: C.text1, width: 1 }, objectName: G(g, "Bajada " + (i + 1)) });
        caja(x, 146, t, "Nombre", c, i === 0 ? C.text1 : C.background1);
      });
    }
    cap(s, "Organigrama (1 + 3)", 720, 196);
    // comparativo
    { const g = "Comparativo";
      sketchPanel(s, 500, 320, 180, 170, { seed: 41, fill: C.background2, line: HX.gris, grupo: g });
      sketchPanel(s, 740, 320, 180, 170, { seed: 43, fill: TINT.corrugado, line: C.accent1, grupo: g });
      s.addText([{ text: "2025", options: { fontFace: CIFRAS, fontSize: 26, bold: true, breakLine: true } }, { text: "Situación inicial: tres líneas de texto.", options: { fontSize: 12 } }], { x: p(515), y: p(335), w: p(150), h: p(140), color: C.text1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Antes") });
      s.addText([{ text: "2026", options: { fontFace: CIFRAS, fontSize: 26, bold: true, color: HX.corrOsc, breakLine: true } }, { text: "Situación objetivo: tres líneas de texto.", options: { fontSize: 12 } }], { x: p(755), y: p(335), w: p(150), h: p(140), color: C.text1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Después") });
      s.addShape(SH.rightArrow, { x: p(690), y: p(390), w: p(42), h: p(30), fill: { color: C.accent6 }, line: { type: "none" }, objectName: G(g, "Flecha") });
    }
    cap(s, "Comparativo antes / después", 500, 494);

    // G8 Tarjetas y módulos de texto
    s = galeriaSlide("TARJETAS Y MÓDULOS DE TEXTO", "Misión / visión / propósito, tres columnas con elipse y divisiones con ícono.");
    puntoLinea(s, 40, 50, 880, [C.accent1, C.accent2, C.accent3], "Línea con puntos");
    cap(s, "Línea ondulada con puntos de color", 40, 92);
    [["Misión", "corrugado"], ["Visión", "papel"], ["Propósito", "flexibles"]].forEach(([t, u], i) => tarjetaMVP(s, 40 + i * 300, 110, 260, 170, t, u, "Texto de la tarjeta en tres o cuatro líneas, centrado."));
    cap(s, "Tarjeta con título manuscrito y tinte de unidad", 40, 284, 300);
    [["Clientes", "Crecer en exportación", C.accent3], ["Operaciones", "Eficiencia", C.accent4], ["Sostenibilidad", "Economía circular", C.accent1]].forEach(([sup, tit, c], i) => {
      const x = 40 + i * 300, g = "Columna con elipse " + (i + 1);
      s.addShape(SH.roundRect, { x: p(x), y: p(370), w: p(260), h: p(130), rectRadius: p(22), fill: { color: C.background2 }, line: { type: "none" }, objectName: G(g, "Panel") });
      s.addShape(SH.ellipse, { x: p(x + 30), y: p(312), w: p(200), h: p(84), fill: { color: C.background1 }, line: { color: c, width: 3.5 }, rotate: -4, objectName: G(g, "Elipse") });
      s.addShape(SH.ellipse, { x: p(x + 34), y: p(315), w: p(194), h: p(78), fill: { type: "none" }, line: { color: c, width: 1.6 }, rotate: 3, objectName: G(g, "Elipse trazo") });
      s.addText([{ text: sup, options: { fontSize: 11, breakLine: true } }, { text: tit, options: { fontSize: 16, bold: true } }], { x: p(x + 45), y: p(322), w: p(170), h: p(64), color: C.text1, align: "center", valign: "middle", margin: 0, objectName: G(g, "Encabezado") });
      s.addText("Texto breve de la columna, hasta cuarenta palabras.", { x: p(x + 20), y: p(410), w: p(220), h: p(80), fontSize: 13, color: C.text1, align: "center", valign: "top", margin: 0, objectName: G(g, "Texto") });
    });
    cap(s, "Columna con encabezado en elipse dibujada", 40, 504, 300);

    // G9 Mapa
    s = galeriaSlide("MAPA Y UBICACIONES", "Mapa base (imagen) + pines y cajas editables. Mover los pines sobre el mapa; cada caja es un grupo.");
    mapa(s, 360, 60, false, 440);
    pin(s, 60, 70, C.accent6, "Pin naranja"); pin(s, 100, 70, C.accent1, "Pin corrugado"); pin(s, 140, 70, C.accent3, "Pin flexibles"); pin(s, 180, 70, C.accent4, "Pin bolsas"); pin(s, 220, 70, C.text1, "Pin tinta");
    cap(s, "Pines (girados 135°)", 60, 104);
    { const g = "Punto de ubicación"; s.addShape(SH.ellipse, { x: p(260), y: p(74), w: p(18), h: p(18), fill: { color: C.accent3 }, line: { color: C.background1, width: 2 }, objectName: G(g, "Punto") }); }
    PLANTAS.slice(0, 3).forEach(([prov, txt], i) => {
      const x = 40, y = 140 + i * 100, g = "Caja ubicación " + (i + 1);
      s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(250), h: p(78), rectRadius: p(18), fill: { color: C.background1 }, line: { color: C.accent6, width: 1.2 }, objectName: G(g, "Caja") });
      s.addText([{ text: prov, options: { bold: true, color: C.accent6, fontSize: 12, breakLine: true } }, { text: txt, options: { color: C.text1, fontSize: 12 } }], { x: p(x + 58), y: p(y + 8), w: p(184), h: p(62), valign: "middle", margin: 0, objectName: G(g, "Texto") });
      const u = txt.startsWith("PAPEL") ? "kraft" : "corrugado";
      s.addShape(SH.ellipse, { x: p(x + 10), y: p(y + 17), w: p(40), h: p(40), fill: { color: UCOL[u] }, line: { type: "none" }, objectName: G(g, "Círculo") });
      s.addImage({ data: ICONS[U[u].ico + "-tinta"], x: p(x + 18), y: p(y + 25), w: p(24), h: p(24), altText: U[u].nombre, objectName: G(g, "Ícono") });
    });
    cap(s, "Cajas de ubicación (provincia + planta)", 40, 440, 250);
    [["corrugado", "Corrugado"], ["kraft", "Papel"], ["flexibles", "Flexibles"], ["bolsas", "Bolsas"]].forEach(([u, l], i) => {
      const g = "Leyenda del mapa", y = 120 + i * 50;
      s.addShape(SH.ellipse, { x: p(660), y: p(y), w: p(36), h: p(36), fill: { color: UCOL[u] }, line: { type: "none" }, objectName: G(g, "Círculo " + l) });
      s.addImage({ data: ICONS[U[u].ico + "-" + U[u].icoCol], x: p(667), y: p(y + 7), w: p(22), h: p(22), altText: l, objectName: G(g, "Ícono " + l) });
      s.addText(l, { x: p(706), y: p(y), w: p(140), h: p(36), fontSize: 13, color: C.text1, valign: "middle", margin: 0, objectName: G(g, "Texto " + l) });
    });
    cap(s, "Leyenda de unidades", 660, 322);
    { const g = "Banderas de país"; [["Argentina", 660], ["Chile", 760], ["Perú", 860]].forEach(([t, x]) => s.addText(t, { shape: SH.roundRect, x: p(x - 10), y: p(370), w: p(90), h: p(28), rectRadius: p(14), fill: { color: C.background2 }, line: { type: "none" }, fontSize: 12, bold: true, color: C.text1, align: "center", valign: "middle", margin: 0, objectName: G(g, t) })); }
    cap(s, "Rótulos de país", 650, 402);

    // G10 Íconos
    s = galeriaSlide("ÍCONOS", "Íconos SVG: recolorear con Formato de gráfico > Contorno, o clic derecho > Convertir en forma para editarlos. Íconos de unidad: PNG en círculo de color.");
    Object.keys(U).forEach((u, i) => {
      circIcon(s, u, 40 + i * 100, 60, 64, G("Ícono unidad " + u, "Círculo"));
      s.addText(U[u].nombre, { x: p(24 + i * 100), y: p(130), w: p(96), h: p(28), fontSize: 10, color: HX.gris, align: "center", valign: "top", margin: 0, objectName: G("Ícono unidad " + u, "Rótulo") });
    });
    cap(s, "Íconos de unidad (en círculo)", 40, 160);
    Object.keys(U).forEach((u, i) => {
      s.addShape(SH.ellipse, { x: p(560 + i * 76), y: p(64), w: p(58), h: p(58), fill: { color: C.background1 }, line: { color: U[u].col, width: 2 }, objectName: G("Ícono contorno " + u, "Aro") });
      s.addImage({ data: ICONS[U[u].ico + "-tinta"], x: p(574 + i * 76), y: p(78), w: p(30), h: p(30), altText: U[u].nombre, objectName: G("Ícono contorno " + u, "Ícono") });
    });
    cap(s, "Variante en aro", 560, 130);
    const lib = [["factory", "Planta"], ["warehouse", "Depósito"], ["truck", "Logística"], ["ship", "Exportación"], ["forklift", "Autoelevador"], ["package", "Producto"], ["container", "Contenedor"], ["settings", "Proceso"], ["hard-hat", "Seguridad"], ["users", "Personas"], ["handshake", "Alianzas"], ["graduation-cap", "Capacitación"],
      ["leaf", "Hoja"], ["tree-pine", "Pino"], ["trees", "Bosque"], ["sprout", "Plantín"], ["recycle", "Reciclado"], ["droplet", "Agua"], ["zap", "Energía"], ["sun", "Solar"], ["wind", "Eólica"], ["flame", "Térmica"], ["globe", "Mundo"], ["map-pin", "Ubicación"],
      ["target", "Objetivo"], ["trending-up", "Crecimiento"], ["trending-down", "Baja"], ["bar-chart-3", "Resultados"], ["award", "Calidad"], ["shield-check", "Certificación"], ["circle-check", "Cumplido"], ["lightbulb", "Innovación"], ["rocket", "Lanzamiento"], ["search", "Análisis"], ["clock", "Tiempo"], ["calendar", "Fecha"],
      ["shopping-cart", "Consumo"], ["printer", "Impresión"], ["scissors", "Troquelado"], ["layers", "Capas"], ["scale", "Balance"], ["thermometer", "Temperatura"], ["heart", "Cuidado"], ["message-circle", "Comunicación"], ["phone", "Contacto"], ["mail", "Correo"], ["file-text", "Documento"], ["building-2", "Oficinas"]];
    lib.forEach(([n, l], i) => {
      const col = i % 12, row = Math.floor(i / 12), x = 40 + col * 74, y = 190 + row * 78, d = svgIcon(n);
      if (!d) return;
      s.addImage({ data: d, x: p(x + 19), y: p(y), w: p(36), h: p(36), altText: l, objectName: "Ícono " + l });
      s.addText(l, { x: p(x), y: p(y + 40), w: p(74), h: p(16), fontSize: 9, color: HX.gris, align: "center", margin: 0, objectName: "Rótulo " + l });
    });

    // G11 Marcadores, conectores y fotos
    s = galeriaSlide("MARCADORES, CONECTORES Y FOTOS", "Fotos: clic derecho > Cambiar imagen; el recorte circular se mantiene.");
    [1, 2, 3, 4, 5, 6].forEach((n, i) => s.addText(String(n), { shape: SH.ellipse, x: p(40 + i * 50), y: p(60), w: p(40), h: p(40), fill: { color: [C.accent1, C.accent2, C.accent3, C.accent4, C.accent6, C.text1][i] }, line: { type: "none" }, fontFace: CIFRAS, fontSize: 20, bold: true, color: i === 0 || i === 1 ? C.text1 : C.background1, align: "center", valign: "middle", margin: 0, objectName: "Número " + n }));
    cap(s, "Números en círculo", 40, 104);
    { const ck = svgIcon("circle-check", "#5CAD3F", 2); if (ck) s.addImage({ data: ck, x: p(360), y: p(60), w: p(40), h: p(40), altText: "Sí", objectName: "Tilde" }); const x2 = svgIcon("circle-x", "#F79646", 2); if (x2) s.addImage({ data: x2, x: p(410), y: p(60), w: p(40), h: p(40), altText: "No", objectName: "Cruz" }); }
    cap(s, "Sí / No", 360, 104, 100);
    free(s, 490, 50, 160, 60, curvePts([[0, 50], [70, 8], [150, 30]]), { fill: { type: "none" }, line: { color: C.text1, width: 1.8, endArrowType: "triangle" }, objectName: "Flecha dibujada curva" });
    free(s, 670, 50, 120, 60, curvePts([[0, 10], [60, 50], [120, 20]]), { fill: { type: "none" }, line: { color: C.accent6, width: 1.8, dashType: "sysDot", endArrowType: "triangle" }, objectName: "Flecha punteada" });
    s.addShape(SH.rightArrow, { x: p(810), y: p(62), w: p(60), h: p(34), fill: { color: C.accent1 }, line: { type: "none" }, objectName: "Flecha bloque" });
    cap(s, "Flechas (curva, punteada, bloque)", 490, 114);
    { const g = "Línea curva blanca"; s.addShape(SH.rect, { x: p(40), y: p(140), w: p(420), h: p(60), fill: { color: C.text2 }, line: { type: "none" }, objectName: "Fondo de muestra" }); free(s, 40, 150, 420, 40, curvePts([[0, 28], [140, 8], [280, 34], [420, 18]]), { fill: { type: "none" }, line: { color: C.background1, width: 1.4 }, objectName: "Línea curva blanca" }); }
    cap(s, "Línea curva blanca (sobre fotos)", 40, 204);
    free(s, 500, 150, 420, 40, curvePts([[0, 20], [105, 6], [210, 30], [315, 8], [420, 22]]), { fill: { type: "none" }, line: { color: HX.celeste, width: 2, dashType: "sysDot" }, objectName: "Conector punteado" });
    cap(s, "Conector punteado", 500, 204);
    fotoCirculo(s, 50, 250, 110, FOTO.corr, C.accent6, "Foto circular con aro"); cap(s, "Foto circular + aro", 40, 372);
    fotoCirculo(s, 210, 250, 110, FOTO.bob, C.accent5, "Foto circular con insignia", "kraft"); cap(s, "Foto + insignia de unidad", 200, 372);
    { const g = "Sello de unidad", x = 370, y = 250, d = 110; s.addShape(SH.ellipse, { x: p(x - 5), y: p(y - 5), w: p(d + 10), h: p(d + 10), fill: { color: C.accent1 }, line: { type: "none" }, objectName: G(g, "Aro") }); s.addImage({ path: fit(FOTO.corr, d, d), x: p(x), y: p(y), w: p(d), h: p(d), rounding: true, altText: "Corrugado", objectName: G(g, "Foto") }); s.addText("Corrugado", { x: p(x), y: p(y), w: p(d), h: p(d), fontFace: MANO, fontSize: 26, color: C.background1, align: "center", valign: "middle", margin: 0, shadow: { type: "outer", color: "000000", opacity: 0.5, blur: 4, offset: 1, angle: 90 }, objectName: G(g, "Texto") }); }
    cap(s, "Sello de unidad", 370, 372);
    { const g = "Foto con marco", x = 530, y = 250; s.addShape(SH.rect, { x: p(x), y: p(y), w: p(150), h: p(110), fill: { color: C.background1 }, line: { type: "none" }, rotate: -3, shadow: { type: "outer", color: "1F497D", opacity: 0.2, blur: 10, offset: 4, angle: 90 }, objectName: G(g, "Marco") }); s.addImage({ path: fit(FOTO.bob, 138, 98), x: p(x + 6), y: p(y + 6), w: p(138), h: p(98), rotate: -3, altText: "Foto", objectName: G(g, "Foto") }); }
    cap(s, "Foto con marco (collage)", 530, 372);
    { const g = "Foto con corte ondulado", x = 720, y = 240, w = 200, h = 130; s.addImage({ path: fit(FOTO.bosque, w, h), x: p(x), y: p(y), w: p(w), h: p(h), altText: "Foto", objectName: G(g, "Foto") }); const pts = [{ x: p(w * 0.72), y: 0 }]; for (let j = 1; j <= 30; j++) pts.push({ x: p(w * 0.72 + 14 * Math.sin(j / 30 * Math.PI * 2.2)), y: p(h * j / 30) }); pts.push({ x: p(w), y: p(h) }, { x: p(w), y: 0 }, { close: true }); free(s, x, y, w, h, pts, { fill: { color: C.background1 }, line: { type: "none" }, objectName: G(g, "Corte blanco") }); }
    cap(s, "Corte ondulado (forma blanca sobre foto)", 720, 372, 200);
    ["CARTOCOR", "CONVERFLEX", "ZUCAMOR", "PAPEL MISIONERO", "PUNTAPEL"].forEach((m, i) => {
      const c = [HX.cartocor, HX.converflex, HX.zucamor, HX.misionero, HX.puntapel][i];
      s.addText(m, { shape: SH.roundRect, x: p(40 + i * 84), y: p(410), w: p(72), h: p(80), rectRadius: p(12), fill: { color: c }, line: { type: "none" }, fontSize: 8, bold: true, color: C.background1, align: "center", valign: "middle", margin: 2, objectName: "Ficha de marca " + m });
      s.addText(m, { shape: SH.ellipse, x: p(480 + i * 70), y: p(420), w: p(60), h: p(60), fill: { color: C.background1 }, line: { color: C.background2, width: 1.5 }, fontSize: 6, bold: true, color: c, align: "center", valign: "middle", margin: 1, objectName: "Círculo de marca " + m });
    });
    cap(s, "Fichas de marca · círculos de logo (reemplazar por logos oficiales)", 40, 494, 420);
  }
  function ctxNota(s, x, y, w, h, cifra, antes, clave, despues, g) {
    s.addShape(SH.roundRect, { x: p(x), y: p(y), w: p(w), h: p(h), rectRadius: p(h) / 2, fill: { color: C.background2 }, line: { type: "none" }, objectName: G(g, "Fondo") });
    s.addShape(SH.roundRect, { x: p(x - 2), y: p(y - 2), w: p(w + 4), h: p(h + 4), rectRadius: p(h + 4) / 2, fill: { type: "none" }, line: { color: C.accent6, width: 1.1 }, rotate: -0.8, objectName: G(g, "Trazo") });
    s.addText([{ text: cifra, options: { bold: true, fontSize: 18, breakLine: true } }, { text: antes, options: { fontSize: 12 } }, { text: clave, options: { fontSize: 12, bold: true, color: C.accent6 } }, { text: despues, options: { fontSize: 12 } }], { x: p(x), y: p(y), w: p(w), h: p(h), align: "center", valign: "middle", color: C.text1, margin: 0, objectName: G(g, "Texto") });
  }

  return { modulos, galeria };
};
