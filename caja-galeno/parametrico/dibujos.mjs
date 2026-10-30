// Dibujos del panel de variables, con el estilo del plano del troquel: la botella parada y la caja
// armada con sus cotas, y un trozo de cartón corrugado en isométrico con la onda elegida.
// Se redibujan con cada cambio.

const r1 = (v) => (Math.round(v * 10) / 10).toString();

// Punta de flecha con la punta en (x, y) y el cuerpo hacia (dx, dy).
const punta = (x, y, dx, dy, s = 5) => { const w = s * 0.38; return "M" + r1(x) + " " + r1(y) + "L" + r1(x + dx * s - dy * w) + " " + r1(y + dy * s + dx * w) + "L" + r1(x + dx * s + dy * w) + " " + r1(y + dy * s - dx * w) + "Z"; };
// Flechas cerradas en las dos puntas de una cota.
function flechas(x0, y0, x1, y1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, s = Math.min(5, L / 3);
  return punta(x0, y0, ux, uy, s) + punta(x1, y1, -ux, -uy, s);
}

// Texto de una cota como en el plano: la letra de la variable y su valor.
const rotulo = (x, y, letra, v, rot) => '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="middle"' + (rot ? ' transform="rotate(' + rot + " " + r1(x) + " " + r1(y) + ')"' : "") + '><tspan class="fx">' + letra + '</tspan><tspan class="val"> = ' + Math.round(v) + "</tspan></text>";
const cota = (key, d, ar, tx) => '<g class="cota" data-var="' + key + '"><path d="' + d + '"/><path class="ar" d="' + ar + '"/>' + tx + "</g>";

// Botella de vino bordelesa parada, en alzado, dibujada como el troquel: blanca con su contorno. Cuerpo recto
// 60 % del alto, hombro 12 %, cuello con la cápsula y el anillo del pico arriba.
// La forma queda fija (la botella del 6463: 306 × ⌀80, cuello ⌀31); sólo cambian los valores de las cotas.
// Las medidas se escriben en campos sobre las cotas (botellaCampos da dónde va cada uno).
const FORMA = { Lb: 306, Dc: 80, Dn: 31 };
const BOT = { W: 326, H: 250, cx: 163, base: 176, alto: 160 };
export function botellaCampos() {
  const s = Math.min(BOT.alto / FORMA.Lb, 84 / FORMA.Dc), len = FORMA.Lb * s, R = (FORMA.Dc / 2) * s, rn = (FORMA.Dn / 2) * s;
  return {
    Lb: [BOT.cx - R - 72, BOT.base - len / 2],
    Dc: [BOT.cx, BOT.base + 32],
    Dn: [BOT.cx + rn + 80, BOT.base - 0.78 * len],
    n: [BOT.cx + R + 82, BOT.base - 0.3 * len],
  };
}
export function botellaSvg(P) {
  const { W, H, cx, base, alto } = BOT;
  const s = Math.min(alto / FORMA.Lb, 84 / FORMA.Dc);
  const len = FORMA.Lb * s, R = (FORMA.Dc / 2) * s, rn = (FORMA.Dn / 2) * s, top = base - len;
  const Y = (f) => base - f * len;
  const yb = Y(0.6), ys = Y(0.72), yc = Y(0.84), yN = Y(0.78), heel = Math.min(R * 0.3, 0.04 * len), ring = Math.max(2.2, 0.028 * len), rr = rn + Math.max(1.2, 1.6 * s), yr = top + ring;
  const k1 = yb - (yb - ys) * 0.55, k2 = ys + (yb - ys) * 0.45;
  const silueta = "M" + r1(cx - R + heel) + " " + r1(base) + "L" + r1(cx + R - heel) + " " + r1(base) +
    "Q" + r1(cx + R) + " " + r1(base) + " " + r1(cx + R) + " " + r1(base - heel) + "L" + r1(cx + R) + " " + r1(yb) +
    "C" + r1(cx + R) + " " + r1(k1) + " " + r1(cx + rn) + " " + r1(k2) + " " + r1(cx + rn) + " " + r1(ys) +
    "L" + r1(cx + rn) + " " + r1(yr) + "L" + r1(cx + rr) + " " + r1(yr) + "L" + r1(cx + rr) + " " + r1(top) +
    "L" + r1(cx - rr) + " " + r1(top) + "L" + r1(cx - rr) + " " + r1(yr) + "L" + r1(cx - rn) + " " + r1(yr) + "L" + r1(cx - rn) + " " + r1(ys) +
    "C" + r1(cx - rn) + " " + r1(k2) + " " + r1(cx - R) + " " + r1(k1) + " " + r1(cx - R) + " " + r1(yb) +
    "L" + r1(cx - R) + " " + r1(base - heel) + "Q" + r1(cx - R) + " " + r1(base) + " " + r1(cx - R + heel) + " " + r1(base) + "Z";
  // Bordes de la cápsula y del anillo del pico, de lado a lado del cuello.
  const lineas = "M" + r1(cx - rn) + " " + r1(yc) + "H" + r1(cx + rn) + "M" + r1(cx - rn) + " " + r1(yr) + "H" + r1(cx + rn);
  const q = botellaCampos(), xL = q.Lb[0], yD = q.Dc[1], xN = q.Dn[0] - 36;
  const cAlto = cota("Lb", "M" + r1(cx - R - 3) + " " + r1(base) + "H" + r1(xL - 5) + "M" + r1(cx - rr - 3) + " " + r1(top) + "H" + r1(xL - 5) + "M" + r1(xL) + " " + r1(top) + "V" + r1(base), flechas(xL, top, xL, base), "");
  const cDiam = cota("Dc", "M" + r1(cx - R) + " " + r1(base + 3) + "V" + r1(yD + 5) + "M" + r1(cx + R) + " " + r1(base + 3) + "V" + r1(yD + 5) + "M" + r1(cx - R) + " " + r1(yD) + "H" + r1(cx + R), flechas(cx - R, yD, cx + R, yD), "");
  // El cuello es chico: flechas por fuera, apuntando hacia adentro; la línea llega hasta su campo.
  const cCue = cota("Dn", "M" + r1(cx - rn - 12) + " " + r1(yN) + "H" + r1(cx - rn) + "M" + r1(cx + rn) + " " + r1(yN) + "H" + r1(xN), punta(cx - rn, yN, -1, 0) + punta(cx + rn, yN, 1, 0), "");
  // Rótulos chicos debajo de cada campo.
  const rot = (key, t) => '<text class="rotulo" data-var="' + key + '" x="' + r1(q[key][0]) + '" y="' + r1(q[key][1] + 27) + '" text-anchor="middle">' + t + "</text>";
  const rotulos = rot("Lb", "Alto") + rot("Dc", "⌀ botella") + rot("Dn", "⌀ cuello") + rot("n", "Cantidad");
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Botella de vino de ' + Math.round(P.Lb) + " mm de alto, ⌀" + Math.round(P.Dc) + " de cuerpo y ⌀" + Math.round(P.Dn) + " de cuello, " + Math.round(P.n) + ' en la caja">' +
    '<path class="pieza" d="' + silueta + '"/><path class="filete" d="' + lineas + '"/>' + cAlto + cDiam + cCue + rotulos + "</svg>";
}

// La caja armada en isométrico, a escala, dibujada como el troquel: largo L (sale de la botella), ancho H
// (de la cantidad de botellas) y alto A (del diámetro).
export function cajaSvg(P) {
  const W = 326, Hv = 196, c = Math.cos(Math.PI / 6), sn = 0.5;
  const L = P.L, Hb = P.H, A = P.A;
  const s = Math.min(236 / ((L + Hb) * c), 136 / ((L + Hb) * sn + A));
  const ox = W / 2 + 6 - ((L - Hb) * c * s) / 2, oy = (Hv - ((L + Hb) * sn + A) * s) / 2 - 2;
  // x: largo hacia la derecha-abajo; y: ancho hacia la izquierda-abajo; z: alto.
  const pt = (x, y, z) => [ox + (x - y) * c * s, oy + ((x + y) * sn - z + A) * s];
  const P2 = (q) => r1(q[0]) + " " + r1(q[1]);
  const poly = (ps) => "M" + ps.map((p) => P2(pt(...p))).join("L") + "Z";
  const caras = '<path class="pieza" d="' + poly([[0, 0, A], [L, 0, A], [L, Hb, A], [0, Hb, A]]) + '"/>' +
    '<path class="pieza lado" d="' + poly([[L, 0, 0], [L, Hb, 0], [L, Hb, A], [L, 0, A]]) + '"/>' +
    '<path class="pieza frente" d="' + poly([[0, Hb, 0], [L, Hb, 0], [L, Hb, A], [0, Hb, A]]) + '"/>';
  const borde = '<path class="filete" d="M' + P2(pt(L, Hb, A)) + "L" + P2(pt(L, Hb, 0)) + '"/>';
  // Cotas paralelas a las aristas, separadas 14 px por fuera.
  const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
  const ux = [c, sn], uy = [-c, sn];
  const paralela = (key, a, b, n, letra, v) => {
    const a1 = off(a, n[0] * 14, n[1] * 14), b1 = off(b, n[0] * 14, n[1] * 14), ang = (Math.atan2(b1[1] - a1[1], b1[0] - a1[0]) * 180) / Math.PI;
    const m = [(a1[0] + b1[0]) / 2 + n[0] * 9, (a1[1] + b1[1]) / 2 + n[1] * 9 + 3];
    const rot = ang > 90 || ang < -90 ? ang + 180 : ang;
    return cota(key, "M" + P2(off(a, n[0] * 3, n[1] * 3)) + "L" + P2(off(a, n[0] * 18, n[1] * 18)) + "M" + P2(off(b, n[0] * 3, n[1] * 3)) + "L" + P2(off(b, n[0] * 18, n[1] * 18)) + "M" + P2(a1) + "L" + P2(b1), flechas(a1[0], a1[1], b1[0], b1[1]), rotulo(m[0], m[1], letra, v, rot));
  };
  // Normales hacia afuera en pantalla: frente (y = H) baja a la izquierda, lado (x = L) baja a la derecha.
  const nAncho = [-sn, c], nLargo = [sn, c];
  const cAncho = paralela("H", pt(L, 0, 0), pt(L, Hb, 0), [nLargo[0], nLargo[1]], "H", Hb);
  const cLargo = paralela("Lb", pt(0, Hb, 0), pt(L, Hb, 0), [nAncho[0], nAncho[1]], "L", L);
  const xa = pt(0, Hb, 0)[0] - 16;
  const cAlto = cota("A", "M" + P2(off(pt(0, Hb, 0), -3, 0)) + "H" + r1(xa - 5) + "M" + P2(off(pt(0, Hb, A), -3, 0)) + "H" + r1(xa - 5) + "M" + r1(xa) + " " + r1(pt(0, Hb, 0)[1]) + "V" + r1(pt(0, Hb, A)[1]), flechas(xa, pt(0, Hb, A)[1], xa, pt(0, Hb, 0)[1]), rotulo(xa - 6, (pt(0, Hb, 0)[1] + pt(0, Hb, A)[1]) / 2, "A", A, -90));
  return '<svg viewBox="0 0 ' + W + " " + Hv + '" role="img" aria-label="Caja de ' + Math.round(L) + " × " + Math.round(Hb) + " × " + Math.round(A) + ' mm (largo × ancho × alto)">' +
    caras + borde + cLargo + cAncho + cAlto + "</svg>";
}

// Trozo de cartón corrugado en isométrico: dos papeles lisos y la onda entre ellos, a la vista en el
// corte. La onda crece con el espesor (E 2, B 3, C 4: más alta y más espaciada).
export function ondaSvg(P, ondas) {
  const e = P.e, T = 6 + e * 3, pitch = 4 + e * 3, W = 120, D = 36, liner = 1.4, Tmax = 6 + 6 * 3;
  const c = Math.cos(Math.PI / 6), sn = Math.sin(Math.PI / 6);
  // Alto fijo (el del espesor máximo) para que el panel no cambie de tamaño; el trozo apoya abajo.
  const ox = 163 - ((W - D) * c) / 2, oy = 6 + Tmax - T, Hv = Tmax + (W + D) * sn + 30;
  const pt = (x, y, z) => r1(ox + (x - y) * c) + " " + r1(oy + (x + y) * sn - z + T);
  const poly = (ps) => "M" + ps.map((p) => pt(...p)).join("L") + "Z";
  const amp = (T - 2 * liner) / 2 - 0.6, mid = T / 2;
  // Onda en la cara del corte (y = D), de x = 0 a W.
  let onda = "";
  for (let i = 0; i <= 60; i++) { const x = (W * i) / 60; onda += (i ? "L" : "M") + pt(x, D, mid + amp * Math.sin((2 * Math.PI * x) / pitch)); }
  const onda0 = Object.keys(ondas).find((k) => ondas[k] === e);
  return '<svg viewBox="0 0 326 ' + r1(Hv) + '" role="img" aria-label="Cartón corrugado ' + (onda0 ? "onda " + onda0 : "") + ", " + e + ' mm">' +
    '<g data-var="e" class="carton">' +
    '<path class="sup" d="' + poly([[0, 0, T], [W, 0, T], [W, D, T], [0, D, T]]) + '"/>' +
    '<path class="lado" d="' + poly([[W, 0, 0], [W, D, 0], [W, D, T], [W, 0, T]]) + '"/>' +
    '<path class="corte" d="' + poly([[0, D, 0], [W, D, 0], [W, D, T], [0, D, T]]) + '"/>' +
    '<path class="liner" d="M' + pt(0, D, liner) + "L" + pt(W, D, liner) + "L" + pt(W, 0, liner) + "M" + pt(0, D, T - liner) + "L" + pt(W, D, T - liner) + "L" + pt(W, 0, T - liner) + '"/>' +
    '<path class="onda" d="' + onda + '"/>' +
    '<path class="borde" d="' + poly([[0, 0, T], [W, 0, T], [W, 0, 0], [W, D, 0], [0, D, 0], [0, D, T]]) + "M" + pt(0, D, T) + "L" + pt(W, D, T) + "L" + pt(W, 0, T) + "M" + pt(W, D, T) + "L" + pt(W, D, 0) + '"/>' +
    '<text class="tx" x="163" y="' + r1(Hv - 6) + '" text-anchor="middle">' + (onda0 ? "Onda " + onda0 + " · " : "") + e + " mm</text>" +
    "</g></svg>";
}
