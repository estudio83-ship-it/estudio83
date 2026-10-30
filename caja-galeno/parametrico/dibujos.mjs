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

// Botella de vino tipo bordelesa, base a la izquierda y pico a la derecha. Proporciones de una
// bordelesa de 750 ml: cuerpo 60 % del alto, hombro 12 %, cuello y pico el resto; anillo en el pico.
export function botellaSvg(P) {
  const W = 326, Hv = 124, left = 34, right = 30, cy = 50;
  const s = Math.min((W - left - right) / P.Lb, 64 / P.Dc);
  const len = P.Lb * s, R = (P.Dc / 2) * s, rn = Math.max(1.2, (P.Dn / 2) * s);
  const x0 = left + (W - left - right - len) / 2, X = (f) => x0 + f * len;
  const xb = X(0.6), xs = X(0.72), heel = Math.min(R * 0.35, 0.05 * len), ring = Math.max(2, 0.03 * len), rr = rn + Math.max(1, 1.6 * s);
  const xr = x0 + len - ring;
  // Contorno: base con talón redondeado, cuerpo, hombro en curva, cuello y anillo del pico.
  const top = [
    "M" + r1(x0) + " " + r1(cy - R + heel),
    "Q" + r1(x0) + " " + r1(cy - R) + " " + r1(x0 + heel) + " " + r1(cy - R),
    "L" + r1(xb) + " " + r1(cy - R),
    "C" + r1(xb + (xs - xb) * 0.55) + " " + r1(cy - R) + " " + r1(xs - (xs - xb) * 0.45) + " " + r1(cy - rn) + " " + r1(xs) + " " + r1(cy - rn),
    "L" + r1(xr) + " " + r1(cy - rn), "L" + r1(xr) + " " + r1(cy - rr), "L" + r1(x0 + len) + " " + r1(cy - rr),
  ];
  const bottom = [
    "L" + r1(x0 + len) + " " + r1(cy + rr), "L" + r1(xr) + " " + r1(cy + rr), "L" + r1(xr) + " " + r1(cy + rn),
    "L" + r1(xs) + " " + r1(cy + rn),
    "C" + r1(xs - (xs - xb) * 0.45) + " " + r1(cy + rn) + " " + r1(xb + (xs - xb) * 0.55) + " " + r1(cy + R) + " " + r1(xb) + " " + r1(cy + R),
    "L" + r1(x0 + heel) + " " + r1(cy + R),
    "Q" + r1(x0) + " " + r1(cy + R) + " " + r1(x0) + " " + r1(cy + R - heel), "Z",
  ];
  const cuerpo = top.join("") + bottom.join("");
  // Cápsula sobre el pico, etiqueta con su texto en rayas, brillo del vidrio.
  const xc = X(0.84), cap = "M" + r1(xc) + " " + r1(cy - rn) + "L" + r1(xr) + " " + r1(cy - rn) + "L" + r1(xr) + " " + r1(cy - rr) + "L" + r1(x0 + len) + " " + r1(cy - rr) + "L" + r1(x0 + len) + " " + r1(cy + rr) + "L" + r1(xr) + " " + r1(cy + rr) + "L" + r1(xr) + " " + r1(cy + rn) + "L" + r1(xc) + " " + r1(cy + rn) + "Z";
  const lx0 = X(0.16), lx1 = X(0.5), lh = R * 0.78;
  const rayas = [-0.35, 0, 0.3].map((f, i) => "M" + r1(lx0 + (lx1 - lx0) * (i === 1 ? 0.18 : 0.28)) + " " + r1(cy + f * lh) + "H" + r1(lx1 - (lx1 - lx0) * (i === 1 ? 0.18 : 0.28))).join("");
  const brillo = "M" + r1(X(0.06)) + " " + r1(cy - R * 0.62) + "H" + r1(X(0.13)) + "M" + r1(X(0.53)) + " " + r1(cy - R * 0.62) + "H" + r1(xb + (xs - xb) * 0.2);
  // Cotas: alto debajo, diámetro del cuerpo a la izquierda, diámetro del cuello a la derecha.
  const yL = cy + R + 16, xD = x0 - 12, xN = x0 + len + 12;
  const cota = (key, d, ar, tx) => '<g class="cota" data-var="' + key + '"><path d="' + d + '"/><path class="ar" d="' + ar + '"/>' + tx + "</g>";
  const alto = cota("Lb",
    "M" + r1(x0) + " " + r1(cy + R + 3) + "V" + r1(yL + 4) + "M" + r1(x0 + len) + " " + r1(cy + rr + 3) + "V" + r1(yL + 4) + "M" + r1(x0) + " " + r1(yL) + "H" + r1(x0 + len),
    flechas(x0, yL, x0 + len, yL),
    '<text x="' + r1(x0 + len / 2) + '" y="' + r1(yL + 13) + '" text-anchor="middle">Alto ' + Math.round(P.Lb) + "</text>");
  const diam = cota("Dc",
    "M" + r1(x0 + heel) + " " + r1(cy - R) + "H" + r1(xD - 4) + "M" + r1(x0 + heel) + " " + r1(cy + R) + "H" + r1(xD - 4) + "M" + r1(xD) + " " + r1(cy - R) + "V" + r1(cy + R),
    flechas(xD, cy - R, xD, cy + R),
    '<text x="' + r1(xD - 6) + '" y="' + r1(cy) + '" text-anchor="middle" transform="rotate(-90 ' + r1(xD - 6) + " " + r1(cy) + ')">⌀ ' + Math.round(P.Dc) + "</text>");
  // El cuello es chico: la cota va por fuera con las flechas hacia adentro.
  const cue = cota("Dn",
    "M" + r1(xr - 1) + " " + r1(cy - rn) + "H" + r1(xN + 4) + "M" + r1(xr - 1) + " " + r1(cy + rn) + "H" + r1(xN + 4) + "M" + r1(xN) + " " + r1(cy - rn - 9) + "V" + r1(cy - rn) + "M" + r1(xN) + " " + r1(cy + rn) + "V" + r1(cy + rn + 9),
    punta(xN, cy - rn, 0, -1) + punta(xN, cy + rn, 0, 1),
    '<text x="' + r1(xN + 4) + '" y="' + r1(cy - rn - 13) + '" text-anchor="middle">⌀ ' + Math.round(P.Dn) + "</text>");
  const cant = '<g class="cota" data-var="n"><text x="' + r1(W - 4) + '" y="' + r1(cy + R + 29) + '" text-anchor="end">× ' + Math.round(P.n) + "</text></g>";
  return '<svg viewBox="0 0 ' + W + " " + Hv + '" role="img" aria-label="Botella de ' + Math.round(P.Lb) + " mm de alto, ⌀" + Math.round(P.Dc) + " de cuerpo y ⌀" + Math.round(P.Dn) + " de cuello, " + Math.round(P.n) + ' en la caja">' +
    '<path class="vidrio" d="' + cuerpo + '"/>' +
    '<rect class="etiqueta" x="' + r1(lx0) + '" y="' + r1(cy - lh) + '" width="' + r1(lx1 - lx0) + '" height="' + r1(2 * lh) + '" rx="1.5"/>' +
    '<path class="raya" d="' + rayas + '"/>' +
    '<path class="capsula" d="' + cap + '"/>' +
    '<path class="brillo" d="' + brillo + '"/>' +
    '<path class="contorno" d="' + cuerpo + '"/>' +
    alto + diam + cue + cant + "</svg>";
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
