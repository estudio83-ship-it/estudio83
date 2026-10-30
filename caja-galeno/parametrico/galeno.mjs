// Caja tipo galeno (troquel 6463) paramétrica.
// generate(params, plantilla) → { entities, dims, info, warnings }
// Unidades: mm. El troquel se arma en las coordenadas del plano original (x a la derecha, y hacia
// arriba); al final la caja se gira 90° a la derecha (tubo vertical) y el separador va a su derecha.
//
// La caja se arma desde la plantilla del troquel 6463 (sus mismas curvas y compensaciones) moviendo
// zonas rectas con L, A y H; las orejas curvas escalan con A. El interior se dibuja desde cero con
// las medidas de las botellas.

// La botella manda: su largo fija el largo de la caja, L = Lb + 3e + 5 (entra en el separador
// plegado, L − 3e, con 5 mm de juego). Con la botella del 6463 (306) y onda B, L = 320.
export const BOTTLE_GAP = 5;
export const DEFAULTS = {
  Lb: 306, // largo de la botella (va acostada a lo largo de la caja)
  Dc: 80, // ⌀ del cuerpo de la botella: agujero del tabique
  Dn: 31, // ⌀ del cuello de la botella: ranura del tabique
  n: 3, // botellas
  p: 86.25, // paso entre ejes de botellas
  A: 94, // profundidad de la caja (costados)
  H: 274, // alto del frente entre hendidos (largo del tubo)
  t: 28, // puente de los tabiques
  e: 3, // espesor del cartón: onda B (el 6463 está compensado para B)
};
export const lengthFor = (Lb, e) => Lb + 3 * e + BOTTLE_GAP;
// El ancho sale de las botellas: n pasos más las paredes y el juego lateral del 6463 (274 = 3 × 86,25 + 2 × 3 + 9,25).
export const SIDE_GAP = 9.25;
export const widthFor = (n, p, e) => n * p + 2 * e + SIDE_GAP;

// Espesores de referencia por onda (mm). Cada fabricante tiene los suyos: e se puede editar.
export const ONDAS = { E: 2, B: 3, C: 4 };

export const PARAMS = [
  { key: "Lb", group: "Botella", label: "Largo de la botella", min: 180, max: 690, step: 1 },
  { key: "Dc", group: "Botella", label: "⌀ cuerpo (agujero)", min: 36, max: 100, step: 0.5 },
  { key: "Dn", group: "Botella", label: "⌀ cuello (ranura)", min: 8, max: 38, step: 0.5 },
  { key: "n", group: "Botella", label: "Cantidad de botellas", min: 1, max: 6, step: 1 },
  { key: "p", group: "Botella", label: "Paso entre botellas", min: 20, max: 500, step: 0.25 },
  { key: "A", group: "Caja", label: "Profundidad (costados)", min: 60, max: 200, step: 1 },
  { key: "H", group: "Caja", label: "Alto del frente (tubo)", min: 120, max: 600, step: 1 },
  { key: "t", group: "Caja", label: "Puente de los tabiques", min: 10, max: 80, step: 1 },
  { key: "e", group: "Cartón", label: "Espesor del cartón", min: 1, max: 6, step: 0.1 },
];
const L_RANGE = [210, 700];

// Medidas fijas del troquel original que no dependen de los parámetros.
export const SEPARATOR_GAP = 5;
const FIX = { tongueW: 33, tongueFromCentre: 13, notchW: 25, flareW: 40, flareLen: 23.8, edgeNotchW: 35, edgeNotchD: 4, gap: 8 };

// Medidas del separador. El plegado ocupa siempre L − 3e de largo: si crece el puente t,
// se achica el panel central, así la caja no cambia.
export function derived(P) {
  const e = P.e, wall = P.A - 2 * e, folded = P.L - 3 * e, main = folded - 2 * P.t, Wi = P.H - 2 * e;
  return { wall, main, Wi, folded, bottle: folded - BOTTLE_GAP, insertLen: 4 * wall + 2 * P.t + main };
}

// Rango válido de cada variable dado el resto, para que el troquel no tenga líneas cruzadas ni sueltas.
// El orden importa: Dc depende de A y H; Dn de Dc; n y p de Dc y H.
export function limits(P) {
  const st = Object.fromEntries(PARAMS.map((q) => [q.key, [q.min, q.max]]));
  const lim = { e: st.e, A: st.A, H: st.H };
  const cl = (v, [a, b]) => Math.min(b, Math.max(a, v));
  const e = cl(P.e, lim.e), A = cl(P.A, lim.A), H = cl(P.H, lim.H);
  // La caja que sale de la botella tiene que quedar entre 210 y 700 de largo.
  lim.Lb = [Math.max(st.Lb[0], L_RANGE[0] - 3 * e - BOTTLE_GAP), Math.min(st.Lb[1], L_RANGE[1] - 3 * e - BOTTLE_GAP)];
  const L = lengthFor(cl(P.Lb, lim.Lb), e);
  // El panel central del separador (L − 3e − 2t) no baja de 40.
  lim.t = [st.t[0], Math.max(st.t[0], Math.min(st.t[1], (L - 3 * e - 40) / 2))];
  lim.Dc = [st.Dc[0], Math.min(st.Dc[1], A - 2 * e - 4, H - 2 * e - 6)];
  const Dc = cl(P.Dc, lim.Dc);
  lim.Dn = [st.Dn[0], Math.min(st.Dn[1], Dc - 6)];
  const room = H - 2 * e - 6 - 2 * Math.max(Dc / 2, FIX.flareW / 2); // de centro a centro de las botellas extremas
  const pMin = Math.max(Dc + 2, Dc / 2 + FIX.flareW / 2 + 3);
  lim.n = [1, Math.max(1, Math.min(st.n[1], 1 + Math.floor(room / pMin + 1e-9)))];
  const n = cl(Math.round(P.n), lim.n);
  lim.p = n > 1 ? [pMin, Math.max(pMin, Math.min(st.p[1], room / (n - 1)))] : [pMin, Math.max(pMin, st.p[1])];
  return lim;
}

export function clampParams(params) {
  const P = { ...DEFAULTS, ...params };
  // Compatibilidad: si viene L (largo de caja) y no Lb, se deduce la botella.
  if (params && params.L !== undefined && params.Lb === undefined) P.Lb = params.L - 3 * P.e - BOTTLE_GAP;
  // Si cambian las botellas y no viene H, el ancho las acompaña.
  if (params && params.H === undefined && (params.n !== undefined || params.p !== undefined)) P.H = Math.max(120, widthFor(Math.round(P.n), P.p, P.e));
  const notes = [];
  const lim = limits(P);
  for (const key of ["e", "Lb", "A", "H", "t", "Dc", "Dn", "n", "p"]) {
    const [a, b] = limits(P)[key];
    let v = key === "n" ? Math.round(P[key]) : P[key];
    if (!Number.isFinite(v)) v = DEFAULTS[key];
    const c = Math.min(b, Math.max(a, v));
    if (Math.abs(c - P[key]) > 1e-9) notes.push(`${key} ajustado a ${Math.round(c * 100) / 100} (rango ${Math.round(a * 100) / 100}–${Math.round(b * 100) / 100} con estas medidas).`);
    P[key] = c;
    if (key === "Lb") P.L = lengthFor(P.Lb, P.e);
  }
  return { P, notes, limits: lim };
}

export function validate(P) {
  const d = derived(P), w = [];
  const R = P.Dc / 2;
  if (P.Dc > d.wall - 4) w.push(`El agujero de ⌀${P.Dc} no entra en el tabique de ${d.wall} (A − 2e): dejá al menos 2 mm por lado.`);
  if (P.Dn >= P.Dc) w.push(`La ranura del cuello (${P.Dn}) tiene que ser menor que el agujero del cuerpo (${P.Dc}).`);
  if (FIX.flareW <= P.Dn) w.push(`La ranura del cuello (${P.Dn}) es más ancha que la boca de 40 mm de la ranura.`);
  if (R < FIX.tongueW / 2 + 1) w.push(`Con ⌀${P.Dc} la lengüeta de apoyo de 33 mm no cabe en el agujero.`);
  const span = (P.n - 1) * P.p + P.Dc;
  if (span > d.Wi - 6) w.push(`${P.n} botellas con paso ${P.p} ocupan ${span.toFixed(1)} mm y el interior mide ${d.Wi} (H − 2e).`);
  if (P.n > 1 && P.p < P.Dc + 2) w.push(`El paso (${P.p}) es menor que el agujero más 2 mm: los agujeros se tocan.`);
  if (d.main < 40) w.push(`El panel entre tabiques queda en ${d.main} mm (L − 3e − 2t).`);
  return w;
}

// ---------- Caja: mapa por zonas sobre la plantilla ----------
// Compensaciones de espesor del 6463, que está hecho para onda B (e = 3): corrimiento de los hendidos
// de cierre de cada panel respecto del contrafrente. Con otro espesor se escalan por e / 3.
const PANELS = [
  { name: "costado exterior", to: 161.1, off: 3 },
  { name: "frente", to: 484.1, off: 11 },
  { name: "costado", to: 578.1, off: 4.5 },
  { name: "contrafrente", to: 898.1, off: 0 },
  { name: "solapa de pegado", to: Infinity, off: 7 },
];
const E_B = 3;

// Panel al que pertenece un punto. Junto a un límite entre paneles, el punto es del panel cuyo
// hendido de cierre le queda más cerca: así cada esquina se mueve con su panel.
function panelOf([x, y]) {
  let i = PANELS.findIndex((q) => x < q.to);
  const k = PANELS.findIndex((q) => Math.abs(x - q.to) < 5);
  if (k >= 0 && k < PANELS.length - 1) {
    const creaseY = (j) => (y > 872 ? 1020 - PANELS[j].off : 724 + PANELS[j].off);
    i = Math.abs(y - creaseY(k)) <= Math.abs(y - creaseY(k + 1)) ? k : k + 1;
  }
  return i;
}

function boxMap(P) {
  const dL = P.L - 320, dA = P.A - 94, dH = P.H - 274;
  const de = P.e - E_B, s = P.e / E_B;
  const sA = P.A / 94;
  const base = ([x, y]) => {
    let sx = 0;
    if (x < 531) sx -= dA; // costado
    if (x < 330) sx -= dL + de; // frente: L + e
    if (x < 114) sx -= dA; // costado exterior
    if (x > 640) sx += dL / 2; // contrafrente (dos franjas: la traba queda centrada)
    if (x > 840) sx += dL / 2;
    if (x > 943) sx += dA - de; // solapa de pegado: A − e
    // Hendidos de cierre: el contrafrente mide H + 22e/3 y cada panel se corre off·e/3 hacia adentro.
    const off = PANELS[panelOf([x, y])].off;
    let sy = y > 872 ? dH + 22 * (s - 1) - off * (s - 1) : off * (s - 1);
    if (x >= 165 && x <= 484.1) {
      if (y > 1040) sy += dA - 2 * de; // contratapa: A − 2e
      if (y < 704) sy -= dA - 2 * de;
    } else if (x > 484.1) {
      if (y > 1067) sy += dA; // tapa (A) y guardapolvos
      if (y > 1119 && x > 570 && x < 905) sy += (10 / 3) * de; // pestaña de pared doble: 10e/3
      if (y > 1169) sy += dA - (4 / 3) * de; // lengüeta: A − 4e/3
      if (y < 677) sy -= dA;
      if (y < 625 && x > 570 && x < 905) sy -= (10 / 3) * de;
      if (y < 575) sy -= dA - (4 / 3) * de;
      // Ranura de traba: alto 10e/3, pegada al hendido de la tapa.
      if (x > 690 && x < 795 && y > 1005 && y < 1015) sy -= (10 / 3) * de;
      if (x > 690 && x < 795 && y > 729 && y < 739) sy += (10 / 3) * de;
    }
    return [x + sx, y + sy];
  };
  const ear = ([x, y]) => (x < 165 && (y > 1012 || y < 732) ? (y > 872 ? [161.1, 1017] : [161.1, 727]) : null);
  const map = (p) => {
    const a = ear(p);
    if (!a) return base(p);
    const A2 = base(a);
    return [A2[0] + (p[0] - a[0]) * sA, A2[1] + (p[1] - a[1]) * sA];
  };
  return { map, ear, sA };
}

function box(P, plantilla, out, problems) {
  const { map, ear, sA } = boxMap(P);
  for (const e of plantilla) {
    if (e[0] === "L") {
      out.push({ t: "L", k: e[1], a: map([e[2], e[3]]), b: map([e[4], e[5]]) });
    } else {
      const [, k, cx, cy, r, a0, a1] = e;
      let mid = a0 + (((a1 - a0) % 360) + 360) % 360 / 2;
      const m = [cx + r * Math.cos((mid * Math.PI) / 180), cy + r * Math.sin((mid * Math.PI) / 180)];
      const anchor = ear(m);
      let c, R;
      if (anchor) {
        const A2 = map(anchor);
        c = [A2[0] + (cx - anchor[0]) * sA, A2[1] + (cy - anchor[1]) * sA];
        R = r * sA;
      } else {
        const d = [map(m)[0] - m[0], map(m)[1] - m[1]];
        c = [cx + d[0], cy + d[1]];
        R = r;
      }
      // Los extremos del arco tienen que caer donde caen las líneas vecinas.
      for (const ang of [a0, a1]) {
        const p0 = [cx + r * Math.cos((ang * Math.PI) / 180), cy + r * Math.sin((ang * Math.PI) / 180)];
        const want = map(p0), got = [c[0] + R * Math.cos((ang * Math.PI) / 180), c[1] + R * Math.sin((ang * Math.PI) / 180)];
        const err = Math.hypot(want[0] - got[0], want[1] - got[1]);
        if (err > 0.05) problems.push(`arco en (${cx}, ${cy}) desplazado ${err.toFixed(2)} mm`);
      }
      out.push({ t: "A", k, c, r: R, a0, a1 });
    }
  }
  return map;
}

// ---------- Interior ----------
function insert(P, x0, y0, out) {
  const d = derived(P);
  const { wall, main, Wi } = d;
  const t = P.t;
  const c1 = wall, c2 = wall + t, p1 = 2 * wall + t, p2 = p1 + main, c3 = p2 + wall, c4 = c3 + t, top = c4 + wall;
  const R = P.Dc / 2, hn = P.Dn / 2, hf = FIX.flareW / 2;
  const L = (k, u0, v0, u1, v1) => out.push({ t: "L", k, a: [x0 + u0, y0 + v0], b: [x0 + u1, y0 + v1] });
  const Arc = (k, u, v, r, a0, a1) => out.push({ t: "A", k, c: [x0 + u, y0 + v], r, a0, a1 });
  const deg = (v) => (Math.acos(v) * 180) / Math.PI;
  const centres = Array.from({ length: P.n }, (_, i) => Wi / 2 + (i - (P.n - 1) / 2) * P.p);
  const gaps = { c1: [], c2: [], p1: [], p2: [], c3: [], c4: [], bottom: [], top: [] };

  // Lado A: tabique entre p2 (intermitente) y c3 (hendido); lado B: entre c2 (hendido) y p1 (intermitente).
  const sides = {
    A: { vp: p2, vc: c3, far: c4, s: 1, rowP: "p2", rowC: "c3", rowFar: "c4", edge: "top" },
    B: { vp: p1, vc: c2, far: c1, s: -1, rowP: "p1", rowC: "c2", rowFar: "c1", edge: "bottom" },
  };
  centres.forEach((u, i) => {
    const baseSide = i % 2 === 0 ? "A" : "B";
    const neckSide = baseSide === "A" ? "B" : "A";
    // Agujero del cuerpo con lengüeta de apoyo y muesca al hendido.
    {
      const S = sides[baseSide], vm = (S.vp + S.vc) / 2, ht = FIX.tongueW / 2, hn2 = FIX.notchW / 2;
      const aT = deg(ht / R), aN = deg(hn2 / R);
      if (S.s > 0) { Arc("c", u, vm, R, 360 - aT, aN); Arc("c", u, vm, R, 180 - aN, 180 + aT); }
      else { Arc("c", u, vm, R, 180 - aT, 180 + aN); Arc("c", u, vm, R, 360 - aN, aT); }
      // La lengüeta termina dentro del agujero: 13 antes del centro, o menos si el agujero es chico.
      const vt = vm - S.s * Math.min(FIX.tongueFromCentre, Math.sqrt(R * R - ht * ht) - 3);
      L("c", u - ht, S.vp, u - ht, vt); L("c", u + ht, S.vp, u + ht, vt); L("c", u - ht, vt, u + ht, vt);
      gaps[S.rowP].push([u - ht, u + ht]);
      const vn = vm + S.s * Math.sqrt(R * R - hn2 * hn2);
      L("c", u - hn2, vn, u - hn2, S.vc); L("c", u + hn2, vn, u + hn2, S.vc); L("c", u - hn2, S.vc, u + hn2, S.vc);
      gaps[S.rowC].push([u - hn2, u + hn2]);
      // Muesca en el borde exterior, del lado de la base.
      const hw = FIX.edgeNotchW / 2, dd = FIX.edgeNotchD;
      const ve = S.edge === "top" ? top : 0, vi = S.edge === "top" ? top - dd : dd;
      L("c", u - hw, ve, u - hw, vi); L("c", u - hw, vi, u + hw, vi); L("c", u + hw, vi, u + hw, ve);
      gaps[S.edge].push([u - hw, u + hw]);
    }
    // Ranura del cuello, abierta hacia el puente.
    {
      const S = sides[neckSide], vm = (S.vp + S.vc) / 2, vf = S.vc - S.s * FIX.flareLen;
      if (S.s > 0) Arc("c", u, vm, hn, 180, 360); else Arc("c", u, vm, hn, 0, 180);
      L("c", u - hn, vm, u - hn, vf); L("c", u + hn, vm, u + hn, vf);
      L("c", u - hn, vf, u - hf, S.vc); L("c", u + hn, vf, u + hf, S.vc);
      L("c", u - hf, S.vc, u - hf, S.far); L("c", u + hf, S.vc, u + hf, S.far); L("c", u - hf, S.far, u + hf, S.far);
      gaps[S.rowC].push([u - hf, u + hf]);
      gaps[S.rowFar].push([u - hf, u + hf]);
    }
  });
  const row = (k, v, list) => {
    const g = [...list].sort((a, b) => a[0] - b[0]);
    let at = 0;
    for (const [a, b] of g) { if (a > at + 0.01) L(k, at, v, a, v); at = Math.max(at, b); }
    if (at < Wi - 0.01) L(k, at, v, Wi, v);
  };
  row("h", c1, gaps.c1); row("h", c2, gaps.c2); row("p", p1, gaps.p1); row("p", p2, gaps.p2); row("h", c3, gaps.c3); row("h", c4, gaps.c4);
  row("c", 0, gaps.bottom); row("c", top, gaps.top);
  L("c", 0, 0, 0, top); L("c", Wi, 0, Wi, top);
  return { rows: { c1, c2, p1, p2, c3, c4, top }, centres, x0, y0 };
}

// Puntos de un arco (extremos y cuadrantes que recorre), para medir la plancha.
function arcPoints(e) {
  let a1 = e.a1;
  while (a1 <= e.a0) a1 += 360;
  const out = [];
  // Extremos exactos: los ángulos cardinales que el arco recorre.
  for (let q = Math.ceil(e.a0 / 90) * 90; q < a1; q += 90) out.push([e.c[0] + e.r * Math.cos((q * Math.PI) / 180), e.c[1] + e.r * Math.sin((q * Math.PI) / 180)]);
  for (let a = e.a0; a < a1; a += 1) out.push([e.c[0] + e.r * Math.cos((a * Math.PI) / 180), e.c[1] + e.r * Math.sin((a * Math.PI) / 180)]);
  out.push([e.c[0] + e.r * Math.cos((a1 * Math.PI) / 180), e.c[1] + e.r * Math.sin((a1 * Math.PI) / 180)]);
  return out;
}

// ---------- Todo ----------
export function generate(params, plantilla) {
  const { P, notes } = clampParams(params);
  const entities = [], problems = [];
  const map = box(P, plantilla, entities, problems);
  const right = map([989.1, 900])[0];
  const bottom = map([700, 525])[1];
  const nBox = entities.length;
  const ins = insert(P, right + FIX.gap, bottom + 31, entities);
  const d = derived(P);
  // Cotas de la caja (en coordenadas del plano original, antes del giro).
  const X = (x) => map([x, 900])[0];
  const Yb = (y) => map([700, y])[1];
  const Yf = (y) => map([300, y])[1];
  const boxDims = [];
  const H_ = (list, x0, x1, at, name) => list.push({ dir: "h", x0, x1, at, name, value: x1 - x0 });
  const V_ = (list, y0, y1, at, name) => list.push({ dir: "v", y0, y1, at, name, value: y1 - y0 });
  const cols = [67.1, 161.1, 484.1, 578.1, 898.1, 989.1].map(X);
  const names = ["costado", "frente", "costado", "contrafrente", "pegado"];
  const ptsOf = (list) => list.flatMap((e) => (e.t === "L" ? [e.a, e.b] : arcPoints(e)));
  const yMin0 = Math.min(...ptsOf(entities.slice(0, nBox)).map((q) => q[1]));
  cols.slice(1).forEach((x, i) => H_(boxDims, cols[i], x, yMin0 - 40, names[i]));
  H_(boxDims, cols[0], cols[5], yMin0 - 160, "caja");
  const lidX = (X(586.1) + X(698)) / 2;
  [530, 620, 630, 724, 1020, 1114, 1124, 1214].map(Yb).forEach((y, i, all) => i && V_(boxDims, all[i - 1], y, lidX, ["lengüeta", "pestaña", "tapa", "contrafrente", "tapa", "pestaña", "lengüeta"][i - 1]));
  V_(boxDims, Yf(735), Yf(1009), X(300), "frente");

  // La caja se gira 90° a la derecha: (x, y) → (y, −x). El tubo queda vertical.
  const rot = ([x, y]) => [y, -x];
  for (const e of entities.slice(0, nBox)) {
    if (e.t === "L") { e.a = rot(e.a); e.b = rot(e.b); }
    else { e.c = rot(e.c); e.a0 -= 90; e.a1 -= 90; }
  }
  const dims = boxDims.map((q) => (q.dir === "h"
    ? { dir: "v", src: "h", y0: -q.x1, y1: -q.x0, at: q.at, name: q.name, value: q.value }
    : { dir: "h", src: "v", x0: q.y0, x1: q.y1, at: -q.at, name: q.name, value: q.value }));
  const boxPts = ptsOf(entities.slice(0, nBox));
  const bx = { xMin: Math.min(...boxPts.map((q) => q[0])), xMax: Math.max(...boxPts.map((q) => q[0])), yMin: Math.min(...boxPts.map((q) => q[1])), yMax: Math.max(...boxPts.map((q) => q[1])) };

  // El separador queda a la derecha de la caja con su largo vertical
  // (girado 90° respecto de como quedaba debajo de la caja).
  const r = ins.rows;
  // Pegado a la caja (5 mm de separación de corte) y centrado en su altura.
  const tx = bx.xMax + SEPARATOR_GAP - ins.x0, ty = (bx.yMax + bx.yMin) / 2 - (ins.y0 + r.top / 2);
  const insT = ([x, y]) => [x + tx, y + ty];
  for (const e of entities.slice(nBox)) {
    if (e.t === "L") { e.a = insT(e.a); e.b = insT(e.b); }
    else e.c = insT(e.c);
  }
  const ix0 = ins.x0 + tx, ix1 = ix0 + d.Wi, iy0 = ins.y0 + ty;
  H_(dims, ix0, ix1, iy0 - 40, "interior");
  dims[dims.length - 1].src = "h";
  [0, r.c1, r.c2, r.p1, r.p2, r.c3, r.c4, r.top].map((v) => iy0 + v).forEach((y, i, all) => {
    if (!i) return;
    V_(dims, all[i - 1], y, ix1 + 45, ["pared", "puente", "tabique", "panel", "tabique", "puente", "pared"][i - 1]);
    dims[dims.length - 1].src = "v";
  });
  V_(dims, iy0, iy0 + r.top, ix1 + 175, "interior");
  dims[dims.length - 1].src = "v";

  const all = ptsOf(entities);
  const xMin = Math.min(...all.map((q) => q[0])), xMax = Math.max(...all.map((q) => q[0])), yMin = Math.min(...all.map((q) => q[1])), yMax = Math.max(...all.map((q) => q[1]));
  H_(dims, xMin, xMax, yMin - 70, "plano total");
  dims[dims.length - 1].src = "h";
  V_(dims, yMin, yMax, xMin - 210, "plano total");
  dims[dims.length - 1].src = "v";
  const info = {
    caja: `${P.L} × ${P.A} × ${P.H}`,
    // Exterior del tubo armado: dos paredes en largo y profundidad; en alto, el contrafrente entre
    // los hendidos de las tapas (incluye los cierres de pared doble).
    externa: [P.L + 2 * P.e, P.A + 2 * P.e, P.H + (22 / 3) * P.e],
    plancha: `${(xMax - xMin).toFixed(1)} × ${(yMax - yMin).toFixed(1)}`,
    botella: `${P.n} × ${P.Lb} de largo · ⌀ ${P.Dc} cuerpo · ⌀ ${P.Dn} cuello`,
    interior: `${d.Wi} × ${d.insertLen} (plegado ${d.folded} × ${d.Wi} × ${d.wall})`,
    bounds: { xMin, xMax, yMin, yMax },
  };
  ins.T = insT;
  return { P, entities, dims, info, anchors: { map, insert: ins, rot }, notes, warnings: [...validate(P), ...problems] };
}

// ---------- Salidas ----------
const LAYERS = { c: ["CORTE", 1], h: ["HENDIDO", 2], p: ["PERFORADO", 6] };

// Cotas que van al DXF: por defecto sólo H (alto del frente) y L (ancho del contrafrente).
const HL = (d) => (d.src === "v" && d.name === "frente") || (d.src === "h" && d.name === "contrafrente");
const HL_LABEL = (d) => (d.name === "frente" ? "H=" : "L=");

export function toDxf(model, { dims = "HL", name = "GALENO" } = {}) {
  const out = [];
  const put = (c, v) => out.push(String(c).padStart(3), String(v));
  const f = (v) => (Math.round(v * 1e4) / 1e4).toString();
  put(0, "SECTION"); put(2, "HEADER"); put(9, "$ACADVER"); put(1, "AC1009"); put(9, "$INSUNITS"); put(70, 4); put(9, "$MEASUREMENT"); put(70, 1); put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "TABLES"); put(0, "TABLE"); put(2, "LAYER"); put(70, 4);
  for (const [n, c] of [...Object.values(LAYERS), ["COTAS", 5]]) { put(0, "LAYER"); put(2, n); put(70, 0); put(62, c); put(6, "CONTINUOUS"); }
  put(0, "ENDTAB"); put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "ENTITIES");
  for (const e of model.entities) {
    const [layer, color] = LAYERS[e.k];
    if (e.t === "L") { put(0, "LINE"); put(8, layer); put(62, color); put(10, f(e.a[0])); put(20, f(e.a[1])); put(30, 0); put(11, f(e.b[0])); put(21, f(e.b[1])); put(31, 0); }
    else { put(0, "ARC"); put(8, layer); put(62, color); put(10, f(e.c[0])); put(20, f(e.c[1])); put(30, 0); put(40, f(e.r)); put(50, f(((e.a0 % 360) + 360) % 360)); put(51, f(((e.a1 % 360) + 360) % 360)); }
  }
  if (dims) {
    const line = (a, b) => { put(0, "LINE"); put(8, "COTAS"); put(62, 5); put(10, f(a[0])); put(20, f(a[1])); put(30, 0); put(11, f(b[0])); put(21, f(b[1])); put(31, 0); };
    const text = (at, s, rot) => { put(0, "TEXT"); put(8, "COTAS"); put(62, 5); put(10, f(at[0])); put(20, f(at[1])); put(30, 0); put(40, 10); put(1, s); if (rot) put(50, rot); put(72, 1); put(11, f(at[0])); put(21, f(at[1])); put(31, 0); };
    for (const d of model.dims.filter(dims === "HL" ? HL : () => true)) {
      const v = (dims === "HL" ? HL_LABEL(d) : "") + fmt(d.value);
      if (d.dir === "h") { line([d.x0, d.at], [d.x1, d.at]); line([d.x0, d.at - 7], [d.x0, d.at + 7]); line([d.x1, d.at - 7], [d.x1, d.at + 7]); text([(d.x0 + d.x1) / 2, d.at + 5], v); }
      else { line([d.at, d.y0], [d.at, d.y1]); line([d.at - 7, d.y0], [d.at + 7, d.y0]); line([d.at - 7, d.y1], [d.at + 7, d.y1]); text([d.at - 5, (d.y0 + d.y1) / 2], v, 90); }
    }
  }
  put(0, "ENDSEC"); put(0, "EOF");
  return out.join("\r\n") + "\r\n";
}

// CF2 (Common Format 2): formato de intercambio de troquelería que ArtiosCAD importa.
// Tipo de línea: 1 corte, 2 hendido, 3 perforado. Pointage 2 pt. Arcos: dirección 1 antihorario.
export function toCf2(model, { name = "GALENO" } = {}) {
  const b = model.info.bounds;
  const f = (v) => (Math.round(v * 1e3) / 1e3).toFixed(3);
  const type = { c: 1, h: 2, p: 3 };
  const lines = ["$BOF", "V2", "ORDER", `MAIN,${name}`, "END", `MAIN,${name}`, "UM", `LL,${f(b.xMin)},${f(b.yMin)}`, `UR,${f(b.xMax)},${f(b.yMax)}`, "SCALE,1,1"];
  for (const e of model.entities) {
    if (e.t === "L") lines.push(`L,2,${type[e.k]},0,${f(e.a[0])},${f(e.a[1])},${f(e.b[0])},${f(e.b[1])},0,0`);
    else {
      const p = (a) => [e.c[0] + e.r * Math.cos((a * Math.PI) / 180), e.c[1] + e.r * Math.sin((a * Math.PI) / 180)];
      const [s, t] = [p(e.a0), p(e.a1)];
      lines.push(`A,2,${type[e.k]},0,${f(s[0])},${f(s[1])},${f(t[0])},${f(t[1])},${f(e.c[0])},${f(e.c[1])},1,0,0`);
    }
  }
  lines.push("END", "$EOF");
  return lines.join("\r\n") + "\r\n";
}

export const fmt = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));
