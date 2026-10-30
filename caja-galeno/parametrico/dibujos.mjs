// Dibujos del panel de variables: la botella en alzado (acostada, como va en la caja) con sus cotas,
// y un trozo de cartón corrugado en isométrico con la onda elegida. Se redibujan con cada cambio.

const r1 = (v) => (Math.round(v * 10) / 10).toString();

// Punta de flecha con la punta en (x, y) y el cuerpo hacia (dx, dy).
const punta = (x, y, dx, dy, s = 5) => { const w = s * 0.38; return "M" + r1(x) + " " + r1(y) + "L" + r1(x + dx * s - dy * w) + " " + r1(y + dy * s + dx * w) + "L" + r1(x + dx * s + dy * w) + " " + r1(y + dy * s - dx * w) + "Z"; };
// Flechas cerradas en las dos puntas de una cota.
function flechas(x0, y0, x1, y1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, s = Math.min(5, L / 3);
  return punta(x0, y0, ux, uy, s) + punta(x1, y1, -ux, -uy, s);
}

// Botella de vino bordelesa parada, en alzado, a escala (el mismo factor para alto y diámetros, así
// mantiene sus proporciones reales). Cuerpo recto 60 % del alto, hombro 12 %, cuello con la cápsula
// y el anillo del pico arriba. Las cotas dejan lugar para los campos que se escriben sobre ellas.
export const BOTELLA_VB = [326, 272];
function botellaGeo(P) {
  const [W, H] = BOTELLA_VB, cx = 172, base = 214, alto = 190;
  const s = Math.min(alto / P.Lb, 92 / P.Dc);
  const len = P.Lb * s, R = (P.Dc / 2) * s, rn = Math.max(1.4, (P.Dn / 2) * s);
  // Altura del cuello donde va su cota: entre el hombro (72 %) y la cápsula (84 %).
  return { W, H, cx, base, s, len, R, rn, top: base - len, yN: base - 0.78 * len };
}
export function botellaCampos(P) {
  const g = botellaGeo(P);
  return {
    Lb: [g.cx - g.R - 42, g.base - g.len / 2],
    Dc: [g.cx, g.base + 22],
    Dn: [g.cx + g.rn + 50, g.yN],
    n: [g.cx + g.R + 58, g.base - g.len * 0.25],
  };
}
export function botellaSvg(P) {
  const { W, H, cx, base, s, len, R, rn, top, yN } = botellaGeo(P);
  const Y = (f) => base - f * len;
  const yb = Y(0.6), ys = Y(0.72), heel = Math.min(R * 0.3, 0.04 * len), ring = Math.max(2.2, 0.028 * len), rr = rn + Math.max(1.2, 1.6 * s), yr = top + ring;
  // Contorno: base con talón redondeado, cuerpo, hombro en curva, cuello y anillo del pico.
  const lado = (k) => [
    "L" + r1(cx + k * R) + " " + r1(base - heel),
    "L" + r1(cx + k * R) + " " + r1(yb),
    "C" + r1(cx + k * R) + " " + r1(yb - (yb - ys) * 0.55) + " " + r1(cx + k * rn) + " " + r1(ys + (yb - ys) * 0.45) + " " + r1(cx + k * rn) + " " + r1(ys),
    "L" + r1(cx + k * rn) + " " + r1(yr), "L" + r1(cx + k * rr) + " " + r1(yr), "L" + r1(cx + k * rr) + " " + r1(top),
  ];
  const der = lado(1);
  // Lado izquierdo, de arriba hacia abajo.
  const izqPath = "L" + r1(cx - rr) + " " + r1(yr) + "L" + r1(cx - rn) + " " + r1(yr) + "L" + r1(cx - rn) + " " + r1(ys) +
    "C" + r1(cx - rn) + " " + r1(ys + (yb - ys) * 0.45) + " " + r1(cx - R) + " " + r1(yb - (yb - ys) * 0.55) + " " + r1(cx - R) + " " + r1(yb) +
    "L" + r1(cx - R) + " " + r1(base - heel) + "Q" + r1(cx - R) + " " + r1(base) + " " + r1(cx - R + heel) + " " + r1(base) + "Z";
  const silueta = "M" + r1(cx - R + heel) + " " + r1(base) + "L" + r1(cx + R - heel) + " " + r1(base) + "Q" + r1(cx + R) + " " + r1(base) + " " + r1(cx + R) + " " + r1(base - heel) + der.slice(1).join("") + "L" + r1(cx - rr) + " " + r1(top) + izqPath;
  // Cápsula sobre el pico (hasta el 84 % del alto) y brillos del vidrio.
  const yc = Y(0.84);
  const cap = "M" + r1(cx - rn) + " " + r1(yc) + "L" + r1(cx + rn) + " " + r1(yc) + "L" + r1(cx + rn) + " " + r1(yr) + "L" + r1(cx + rr) + " " + r1(yr) + "L" + r1(cx + rr) + " " + r1(top) + "L" + r1(cx - rr) + " " + r1(top) + "L" + r1(cx - rr) + " " + r1(yr) + "L" + r1(cx - rn) + " " + r1(yr) + "Z";
  const brillo = "M" + r1(cx - R * 0.62) + " " + r1(base - heel - 4) + "V" + r1(yb + 2) + "M" + r1(cx + R * 0.7) + " " + r1(base - heel - 10) + "V" + r1(base - len * 0.35);
  // Cotas: alto a la izquierda, diámetro del cuerpo abajo, del cuello arriba; los campos van sobre ellas.
  const xL = cx - R - 42, yD = base + 22;
  const cota = (key, d, ar) => '<g class="cota" data-var="' + key + '"><path d="' + d + '"/><path class="ar" d="' + ar + '"/></g>';
  const cotaAlto = cota("Lb", "M" + r1(cx - R - 3) + " " + r1(base) + "H" + r1(xL - 5) + "M" + r1(cx - rr - 3) + " " + r1(top) + "H" + r1(xL - 5) + "M" + r1(xL) + " " + r1(top) + "V" + r1(base), flechas(xL, top, xL, base));
  const cotaDiam = cota("Dc", "M" + r1(cx - R) + " " + r1(base + 3) + "V" + r1(yD + 5) + "M" + r1(cx + R) + " " + r1(base + 3) + "V" + r1(yD + 5) + "M" + r1(cx - R) + " " + r1(yD) + "H" + r1(cx + R), flechas(cx - R, yD, cx + R, yD));
  // El cuello es chico: flechas por fuera, apuntando hacia adentro.
  const cotaCue = cota("Dn", "M" + r1(cx - rn - 14) + " " + r1(yN) + "H" + r1(cx - rn) + "M" + r1(cx + rn) + " " + r1(yN) + "H" + r1(cx + rn + 18), punta(cx - rn, yN, -1, 0) + punta(cx + rn, yN, 1, 0));
  const rot = (key, x, y, t) => '<text class="rotulo" data-var="' + key + '" x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="middle">' + t + "</text>";
  const q = botellaCampos(P);
  return '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Botella de vino de ' + Math.round(P.Lb) + " mm de alto, ⌀" + Math.round(P.Dc) + " de cuerpo y ⌀" + Math.round(P.Dn) + " de cuello, " + Math.round(P.n) + ' en la caja">' +
    '<path class="vidrio" d="' + silueta + '"/>' +
    '<path class="brillo" d="' + brillo + '"/>' +
    '<path class="capsula" d="' + cap + '"/>' +
    '<path class="contorno" d="' + silueta + '"/>' +
    cotaAlto + cotaDiam + cotaCue +
    rot("Lb", q.Lb[0] - 37, q.Lb[1] + 4, "Alto").replace('text-anchor="middle"', 'text-anchor="end"') + rot("Dc", q.Dc[0], q.Dc[1] + 30, "⌀ botella") + rot("Dn", q.Dn[0], q.Dn[1] - 21, "⌀ cuello") + rot("n", q.n[0], q.n[1] - 21, "Cantidad") +
    "</svg>";
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
  // Líneas de pegado de la onda sobre la cara de arriba, a lo largo de las canaletas.
  let canal = "";
  for (let x = pitch / 4; x < W - 1; x += pitch) canal += "M" + pt(x, 0, T) + "L" + pt(x, D, T);
  const onda0 = Object.keys(ondas).find((k) => ondas[k] === e);
  return '<svg viewBox="0 0 326 ' + r1(Hv) + '" role="img" aria-label="Cartón corrugado ' + (onda0 ? "onda " + onda0 : "") + ", " + e + ' mm">' +
    '<g data-var="e" class="carton">' +
    '<path class="sup" d="' + poly([[0, 0, T], [W, 0, T], [W, D, T], [0, D, T]]) + '"/>' +
    '<path class="canal" d="' + canal + '"/>' +
    '<path class="lado" d="' + poly([[W, 0, 0], [W, D, 0], [W, D, T], [W, 0, T]]) + '"/>' +
    '<path class="corte" d="' + poly([[0, D, 0], [W, D, 0], [W, D, T], [0, D, T]]) + '"/>' +
    '<path class="liner" d="M' + pt(0, D, liner) + "L" + pt(W, D, liner) + "L" + pt(W, 0, liner) + "M" + pt(0, D, T - liner) + "L" + pt(W, D, T - liner) + "L" + pt(W, 0, T - liner) + '"/>' +
    '<path class="onda" d="' + onda + '"/>' +
    '<path class="borde" d="' + poly([[0, 0, T], [W, 0, T], [W, 0, 0], [W, D, 0], [0, D, 0], [0, D, T]]) + "M" + pt(0, D, T) + "L" + pt(W, D, T) + "L" + pt(W, 0, T) + "M" + pt(W, D, T) + "L" + pt(W, D, 0) + '"/>' +
    '<text class="tx" x="163" y="' + r1(Hv - 6) + '" text-anchor="middle">' + (onda0 ? "Onda " + onda0 + " · " : "") + e + " mm</text>" +
    "</g></svg>";
}
