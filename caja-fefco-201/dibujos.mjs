// Dibujos del panel de variables, con el estilo del plano del troquel: la caja FEFCO 201 armada en
// isométrico con sus cotas (y la unión de las solapas al centro de la tapa), y un trozo de cartón
// corrugado con la onda elegida. Se redibujan con cada cambio.

const r1 = (v) => (Math.round(v * 10) / 10).toString();

// Punta de flecha con la punta en (x, y) y el cuerpo hacia (dx, dy).
const punta = (x, y, dx, dy, s = 5) => { const w = s * 0.38; return "M" + r1(x) + " " + r1(y) + "L" + r1(x + dx * s - dy * w) + " " + r1(y + dy * s + dx * w) + "L" + r1(x + dx * s + dy * w) + " " + r1(y + dy * s - dx * w) + "Z"; };
// Flechas cerradas en las dos puntas de una cota.
function flechas(x0, y0, x1, y1) {
  const n = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / n, uy = (y1 - y0) / n, s = Math.min(5, n / 3);
  return punta(x0, y0, ux, uy, s) + punta(x1, y1, -ux, -uy, s);
}

// Texto de una cota como en el plano: la letra de la variable y su valor.
const rotulo = (x, y, letra, v, rot) => '<text x="' + r1(x) + '" y="' + r1(y) + '" text-anchor="middle"' + (rot ? ' transform="rotate(' + r1(rot) + " " + r1(x) + " " + r1(y) + ')"' : "") + '><tspan class="fx">' + letra + '</tspan><tspan class="val"> = ' + Math.round(v) + "</tspan></text>";
const cota = (key, d, ar, tx) => '<g class="cota" data-var="' + key + '"><path d="' + d + '"/><path class="ar" d="' + ar + '"/>' + tx + "</g>";

// La caja armada en isométrico, a escala, con las medidas interiores: largo L, ancho A y alto H.
export function caja201Svg(P) {
  const W = 326, Hv = 210, c = Math.cos(Math.PI / 6), sn = 0.5;
  const L = P.L, A = P.A, H = P.H;
  const s = Math.min(232 / ((L + A) * c), 150 / ((L + A) * sn + H));
  const ox = W / 2 + 6 - ((L - A) * c * s) / 2, oy = (Hv - ((L + A) * sn + H) * s) / 2 - 4;
  // x: largo hacia la derecha-abajo; y: ancho hacia la izquierda-abajo; z: alto.
  const pt = (x, y, z) => [ox + (x - y) * c * s, oy + ((x + y) * sn - z + H) * s];
  const P2 = (q) => r1(q[0]) + " " + r1(q[1]);
  const poly = (ps) => "M" + ps.map((p) => P2(pt(...p))).join("L") + "Z";
  const caras = '<path class="pieza" d="' + poly([[0, 0, H], [L, 0, H], [L, A, H], [0, A, H]]) + '"/>' +
    '<path class="pieza lado" d="' + poly([[L, 0, 0], [L, A, 0], [L, A, H], [L, 0, H]]) + '"/>' +
    '<path class="pieza frente" d="' + poly([[0, A, 0], [L, A, 0], [L, A, H], [0, A, H]]) + '"/>';
  const borde = '<path class="filete" d="M' + P2(pt(L, A, H)) + "L" + P2(pt(L, A, 0)) + '"/>';
  // Las solapas de afuera se tocan al centro de la tapa, a lo largo: es un borde de corte, negro y continuo.
  const union = '<path class="union" d="M' + P2(pt(0, A / 2, H)) + "L" + P2(pt(L, A / 2, H)) + '"/>';
  const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
  // Cotas paralelas a las aristas, separadas 14 px por fuera.
  const paralela = (key, a, b, n, v) => {
    const a1 = off(a, n[0] * 14, n[1] * 14), b1 = off(b, n[0] * 14, n[1] * 14), ang = (Math.atan2(b1[1] - a1[1], b1[0] - a1[0]) * 180) / Math.PI;
    const m = [(a1[0] + b1[0]) / 2 + n[0] * 9, (a1[1] + b1[1]) / 2 + n[1] * 9 + 3];
    return cota(key, "M" + P2(off(a, n[0] * 3, n[1] * 3)) + "L" + P2(off(a, n[0] * 18, n[1] * 18)) + "M" + P2(off(b, n[0] * 3, n[1] * 3)) + "L" + P2(off(b, n[0] * 18, n[1] * 18)) + "M" + P2(a1) + "L" + P2(b1), flechas(a1[0], a1[1], b1[0], b1[1]), rotulo(m[0], m[1], key, v, ang > 90 || ang < -90 ? ang + 180 : ang));
  };
  // Normales hacia afuera en pantalla: el frente (y = A) baja a la izquierda, el lado (x = L) a la derecha.
  const cLargo = paralela("L", pt(0, A, 0), pt(L, A, 0), [-sn, c], L);
  const cAncho = paralela("A", pt(L, 0, 0), pt(L, A, 0), [sn, c], A);
  const xa = pt(0, A, 0)[0] - 16, y0 = pt(0, A, 0)[1], y1 = pt(0, A, H)[1];
  const cAlto = cota("H", "M" + P2(off(pt(0, A, 0), -3, 0)) + "H" + r1(xa - 5) + "M" + P2(off(pt(0, A, H), -3, 0)) + "H" + r1(xa - 5) + "M" + r1(xa) + " " + r1(y0) + "V" + r1(y1), flechas(xa, y1, xa, y0), rotulo(xa - 6, (y0 + y1) / 2, "H", H, -90));
  return '<svg viewBox="0 0 ' + W + " " + Hv + '" role="img" aria-label="Caja de ' + Math.round(L) + " × " + Math.round(A) + " × " + Math.round(H) + ' mm interiores (largo × ancho × alto)">' +
    caras + union + borde + cLargo + cAncho + cAlto + "</svg>";
}

// Trozo de cartón corrugado en isométrico: dos papeles lisos y la onda entre ellos, a la vista en el
// corte. La onda crece con el espesor (E 2, B 3, C 4: más alta y más espaciada); las dobles (EB 5, BC 7)
// llevan dos ondas y un papel en el medio.
export function onda201Svg(P, ondas) {
  const k = 0.8, e = P.e, T = (6 + e * 3) * k, W = 120 * k, D = 36 * k, liner = 1.4 * k, Tmax = (6 + 7 * 3) * k;
  const c = Math.cos(Math.PI / 6), sn = Math.sin(Math.PI / 6);
  // Alto fijo (el del espesor máximo) para que el panel no cambie de tamaño; el trozo apoya abajo.
  const ox = 163 - ((W - D) * c) / 2, oy = 6 + Tmax - T, Hv = Tmax + (W + D) * sn + 30;
  const pt = (x, y, z) => r1(ox + (x - y) * c) + " " + r1(oy + (x + y) * sn - z + T);
  const poly = (ps) => "M" + ps.map((p) => pt(...p)).join("L") + "Z";
  // Onda doble (EB, BC): dos ondas separadas por un papel del medio, cada una con su alto y su paso.
  const tipo = Object.keys(ondas).find((n) => ondas[n] === e);
  const capas = tipo && tipo.length === 2 ? [...tipo].map((n) => ondas[n]) : [e];
  const util = T - (capas.length + 1) * liner, total = capas.reduce((a, b) => a + b, 0);
  let onda = "", lisos = "", z0 = liner;
  capas.forEach((ec, j) => {
    const alto = (util * ec) / total, amp = alto / 2 - 0.4, mid = z0 + alto / 2, paso = (4 + ec * 3) * k * (capas.length > 1 ? 0.8 : 1);
    for (let i = 0; i <= 60; i++) { const x = (W * i) / 60; onda += (i ? "L" : "M") + pt(x, D, mid + amp * Math.sin((2 * Math.PI * x) / paso)); }
    z0 += alto + liner;
    if (j < capas.length - 1) lisos += "M" + pt(0, D, z0 - liner / 2) + "L" + pt(W, D, z0 - liner / 2) + "L" + pt(W, 0, z0 - liner / 2);
  });
  return '<svg viewBox="0 0 326 ' + r1(Hv) + '" role="img" aria-label="Cartón corrugado ' + (tipo ? "onda " + tipo : "") + ", " + e + ' mm">' +
    '<g data-var="e" class="carton">' +
    '<path class="sup" d="' + poly([[0, 0, T], [W, 0, T], [W, D, T], [0, D, T]]) + '"/>' +
    '<path class="lado" d="' + poly([[W, 0, 0], [W, D, 0], [W, D, T], [W, 0, T]]) + '"/>' +
    '<path class="corte" d="' + poly([[0, D, 0], [W, D, 0], [W, D, T], [0, D, T]]) + '"/>' +
    '<path class="liner" d="M' + pt(0, D, liner) + "L" + pt(W, D, liner) + "L" + pt(W, 0, liner) + "M" + pt(0, D, T - liner) + "L" + pt(W, D, T - liner) + "L" + pt(W, 0, T - liner) + lisos + '"/>' +
    '<path class="onda" d="' + onda + '"/>' +
    '<path class="borde" d="' + poly([[0, 0, T], [W, 0, T], [W, 0, 0], [W, D, 0], [0, D, 0], [0, D, T]]) + "M" + pt(0, D, T) + "L" + pt(W, D, T) + "L" + pt(W, 0, T) + "M" + pt(W, D, T) + "L" + pt(W, D, 0) + '"/>' +
    '<text class="tx" x="163" y="' + r1(Hv - 6) + '" text-anchor="middle">' + (tipo ? "Onda " + tipo + " · " : "") + e + " mm</text>" +
    "</g></svg>";
}
