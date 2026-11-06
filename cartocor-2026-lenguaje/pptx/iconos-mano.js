// Íconos dibujados a mano alzada para Cartocor 2026.
// Cada ícono se define en una grilla de 100 × 100 como trazos (líneas, curvas, elipses).
// hand() los convierte en polilíneas con temblor natural de trazo y pequeño sobrepaso en los extremos,
// como los íconos de línea del institucional Arcor 2026.

// ---------- primitivas ----------
const L = (...c) => { const pts = []; for (let i = 0; i < c.length; i += 2) pts.push([c[i], c[i + 1]]); return { pts, over: true }; };
const LC = (...c) => ({ ...L(...c), closed: true });
function catmull(P, n = 10, closed = false) {
  const out = [], N = P.length, g = (i) => closed ? P[(i + N) % N] : P[Math.max(0, Math.min(N - 1, i))];
  const segs = closed ? N : N - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    for (let k = 0; k < n; k++) {
      const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3)));
    }
  }
  if (!closed) out.push(P[N - 1]);
  return out;
}
const C = (...c) => { const P = []; for (let i = 0; i < c.length; i += 2) P.push([c[i], c[i + 1]]); return { pts: catmull(P), over: false }; };
const CC = (...c) => { const P = []; for (let i = 0; i < c.length; i += 2) P.push([c[i], c[i + 1]]); return { pts: catmull(P, 10, true), over: false, closed: true }; };
// elipse o arco (grados, 0 = derecha, sentido horario porque y crece hacia abajo)
function E(cx, cy, rx, ry, a0 = 0, a1 = 360, rot = 0) {
  const pts = [], n = Math.max(8, Math.round(Math.abs(a1 - a0) / 8)), r = rot * Math.PI / 180;
  for (let i = 0; i <= n; i++) {
    const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180, x = rx * Math.cos(a), y = ry * Math.sin(a);
    pts.push([cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)]);
  }
  const full = Math.abs(a1 - a0) >= 360;
  return { pts, over: false, closed: false, loop: full };
}
// punta de flecha en el extremo de un trazo
function head(s, len = 6, ang = 32) {
  const P = s.pts, a = P[P.length - 1];
  let b = P[P.length - 2], k = 2;
  while (Math.hypot(a[0] - b[0], a[1] - b[1]) < 3 && k < P.length) b = P[P.length - ++k];
  const d = Math.atan2(a[1] - b[1], a[0] - b[0]), r = ang * Math.PI / 180;
  return L(a[0] - len * Math.cos(d - r), a[1] - len * Math.sin(d - r), a[0], a[1], a[0] - len * Math.cos(d + r), a[1] - len * Math.sin(d + r));
}
const arrow = (s, len, ang) => [s, head(s, len, ang)];
// línea punteada (costura)
function dash(x1, y1, x2, y2, n = 8) { const out = []; for (let i = 0; i < n; i++) { const t0 = i / n, t1 = (i + 0.55) / n; out.push({ ...L(x1 + (x2 - x1) * t0, y1 + (y2 - y1) * t0, x1 + (x2 - x1) * t1, y1 + (y2 - y1) * t1), over: false }); } return out; }
// pino de tres pisos
function pino(x, y, h) {
  const w = h * 0.62, t = h / 3.2;
  return [LC(x, y, x - w * 0.32, y + t, x - w * 0.18, y + t, x - w * 0.44, y + 2 * t, x - w * 0.28, y + 2 * t, x - w * 0.5, y + 3 * t, x + w * 0.5, y + 3 * t, x + w * 0.28, y + 2 * t, x + w * 0.44, y + 2 * t, x + w * 0.18, y + t, x + w * 0.32, y + t), L(x, y + 3 * t, x, y + h)];
}
// onda (canal del corrugado)
function onda(x1, y1, x2, y2, n = 6, a = 2.2) {
  const pts = [], dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), nx = -dy / len, ny = dx / len;
  for (let i = 0; i <= n * 8; i++) { const t = i / (n * 8), o = a * Math.sin(t * n * Math.PI * 2); pts.push([x1 + dx * t + nx * o, y1 + dy * t + ny * o]); }
  return { pts, over: false };
}

// ---------- temblor de mano ----------
function rnd(seed) { let s = (seed * 2654435761) % 4294967296; return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296); }
function hand(strokes, seed = 1, amp = 0.55) {
  const R = rnd(seed + 7);
  return strokes.map((s) => {
    let P = s.pts.slice();
    if (s.closed && !s.loop) P.push(P[0]);
    // re-muestreo por longitud
    const res = [P[0]];
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], d = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(d / 2.2));
      for (let k = 1; k <= n; k++) res.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    // sobrepaso en extremos de líneas rectas (el trazo "se pasa" un poco)
    if (s.over && !s.closed && res.length > 1) {
      const ext = (a, b, e) => { const d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1; return [a[0] + (a[0] - b[0]) / d * e, a[1] + (a[1] - b[1]) / d * e]; };
      res.unshift(ext(res[0], res[1], 0.8 + R() * 1.2));
      res.push(ext(res[res.length - 1], res[res.length - 2], 0.8 + R() * 1.4));
    }
    // ruido suave perpendicular
    const f1 = 0.035 + R() * 0.03, f2 = 0.11 + R() * 0.06, p1 = R() * 6.28, p2 = R() * 6.28;
    let acc = 0;
    const out = res.map((q, i) => {
      if (i) acc += Math.hypot(q[0] - res[i - 1][0], q[1] - res[i - 1][1]);
      const a = res[Math.max(0, i - 1)], b = res[Math.min(res.length - 1, i + 1)];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / d, ny = (b[0] - a[0]) / d;
      const o = amp * (0.7 * Math.sin(acc * f1 * 6.28 / 6 + p1) + 0.3 * Math.sin(acc * f2 * 6.28 / 6 + p2));
      return [q[0] + nx * o, q[1] + ny * o];
    });
    // en elipses cerradas el trazo cierra con un pequeño cruce, como a mano
    if (s.loop) { const q = out[1]; out.push([q[0] + 1.2, q[1] + 0.6]); }
    return out;
  });
}

// ---------- ÍCONOS ----------
const I = {};
// ===== NEGOCIOS =====
I.corrugado = () => [
  LC(14, 42, 50, 52, 50, 90, 14, 79), // frente
  L(50, 52, 86, 40, 86, 77, 50, 90), // lateral
  L(14, 42, 48, 32, 86, 40), // borde trasero
  L(14, 42, 3, 27, 37, 18, 48, 32), // solapa izquierda
  L(48, 32, 58, 14, 95, 22, 86, 40), // solapa trasera
  L(50, 52, 63, 66, 97, 54, 86, 40), // solapa derecha abierta hacia afuera
  onda(18, 47, 46, 56, 5, 1.6), // canal del cartón en el borde
  ...arrow(L(27, 74, 27, 60), 4), ...arrow(L(36, 77, 36, 63), 4), L(23, 79, 40, 83), // marca "este lado arriba"
];
I.papel = () => [
  E(70, 40, 9, 17), E(70, 40, 3.2, 6), E(70, 40, 6, 11.5, 30, 300),
  L(25, 23, 70, 23), L(25, 57, 70, 57), E(25, 40, 9, 17, 90, 270),
  L(25, 57, 11, 84, 66, 93, 79, 57.5), // hoja que se desenrolla
  ...arrow(E(86, 14, 10, 10, 150, 300), 4.5), ...arrow(E(86, 14, 10, 10, 330, 480), 4.5), // reciclado
];
I.kraft = () => [
  E(38, 22, 22, 7.5), E(38, 22, 5.5, 2), E(38, 22, 13.5, 4.6),
  L(16, 22, 16, 82), L(60, 22, 60, 82), E(38, 82, 22, 7.5, 0, 180),
  C(52, 28.5, 51, 50, 53, 70, 52, 88.5), // borde de la hoja
  ...pino(82, 30, 58),
];
I.flexibles = () => [
  L(29, 18, 71, 18),
  C(29, 18, 27, 45, 23, 70, 25, 84, 50, 89, 75, 84, 77, 70, 73, 45, 71, 18),
  L(29, 25, 71, 25), // sellado
  ...dash(31, 32, 69, 32, 9), // zipper
  L(71, 21, 67, 22.5, 71, 24), // muesca de apertura
  CC(50, 45, 61, 54, 58, 69, 50, 73, 42, 69, 39, 54), // ventana
  C(25, 79, 50, 84, 75, 79), // fuelle
];
I.bolsas = () => [
  L(80, 28, 88, 31, 89, 82, 79, 87), // bolsa de atrás
  CC(22, 23, 50, 20, 78, 23, 80, 55, 78, 86, 50, 89, 22, 86, 20, 55),
  ...dash(24, 30, 76, 30, 10), // costura
  L(22, 36, 34, 36, 34, 23), // válvula
  LC(33, 48, 67, 48, 67, 70, 33, 70), L(39, 56, 61, 56), L(39, 63, 54, 63),
];
I.automatizacion = () => [
  E(18, 82, 5, 5), E(82, 82, 5, 5), L(18, 77, 82, 77), L(18, 87, 82, 87),
  LC(54, 63, 68, 63, 68, 77, 54, 77), L(54, 63, 60, 57, 74, 57, 68, 63), L(74, 57, 74, 71, 68, 77),
  L(14, 77, 34, 77), E(24, 72, 7, 6, 180, 360),
  L(24, 66, 33, 40), E(34, 37, 3.6, 3.6), L(37, 35, 57, 28), E(60, 27, 3.2, 3.2),
  L(61, 30, 63, 42), L(57, 42, 69, 42), L(57, 42, 57, 48), L(69, 42, 69, 48),
];
I.forestal = () => [...pino(30, 18, 66), ...pino(56, 30, 52), ...pino(78, 42, 40), C(4, 86, 30, 82, 60, 87, 96, 82)];
I.reciclado = () => [
  ...arrow(E(50, 52, 38, 36, -80, 25), 7), ...arrow(E(50, 52, 38, 36, 45, 145), 7), ...arrow(E(50, 52, 38, 36, 165, 260), 7),
  LC(38, 48, 52, 52, 52, 68, 38, 64), L(52, 52, 64, 47, 64, 63, 52, 68), L(38, 48, 50, 44, 64, 47),
];
// ===== MERCADOS =====
I.fruta = () => [C(50, 30, 38, 24, 22, 32, 20, 52, 30, 78, 44, 84, 50, 80, 56, 84, 70, 78, 80, 52, 78, 32, 62, 24, 50, 30), C(50, 30, 48, 20, 52, 10), C(53, 18, 62, 8, 74, 10, 66, 20, 53, 18)];
I.lacteos = () => [L(36, 14, 64, 14), L(38, 14, 38, 26, 30, 38, 30, 86, 70, 86, 70, 38, 62, 26, 62, 14), L(30, 38, 70, 38), CC(42, 52, 58, 52, 58, 68, 42, 68), C(36, 60, 40, 57, 44, 60)];
I.carnes = () => [C(58, 64, 40, 62, 22, 50, 15, 32, 24, 15, 42, 12, 58, 24, 66, 42, 65, 56, 58, 64), L(57, 63, 66, 75), L(63, 57, 75, 66), E(69, 81, 6, 6), E(81, 69, 6, 6), C(26, 30, 32, 22, 40, 20)];
I.bebidas = () => [L(44, 10, 56, 10), L(44, 10, 44, 18, 38, 28, 36, 40, 36, 88, 64, 88, 64, 40, 62, 28, 56, 18, 56, 10), L(44, 16, 56, 16), LC(36, 50, 64, 50, 64, 70, 36, 70), C(40, 60, 46, 56, 52, 62, 58, 58)];
I.golosinas = () => [CC(32, 38, 50, 32, 68, 38, 72, 50, 68, 62, 50, 68, 32, 62, 28, 50), L(32, 40, 14, 30, 18, 50, 12, 70, 32, 60), L(68, 40, 88, 30, 82, 50, 88, 70, 68, 60), L(42, 40, 36, 58), L(52, 38, 46, 64), L(62, 40, 58, 60)];
I.agro = () => [C(50, 90, 49, 60, 50, 14), ...[0, 1, 2, 3, 4].flatMap((i) => [CC(50, 30 + i * 11, 40, 22 + i * 11, 38, 14 + i * 11, 48, 22 + i * 11), CC(50, 30 + i * 11, 60, 22 + i * 11, 62, 14 + i * 11, 52, 22 + i * 11)]), C(50, 80, 34, 70, 22, 72), C(50, 76, 66, 64, 80, 66)];
I.construccion = () => [L(8, 50, 50, 14, 92, 50), L(20, 40, 20, 88, 80, 88, 80, 40), L(8, 88, 92, 88), L(20, 58, 80, 58), L(20, 73, 80, 73), L(40, 58, 40, 73), L(60, 58, 60, 73), L(30, 73, 30, 88), L(50, 73, 50, 88), L(70, 73, 70, 88), L(66, 30, 66, 18, 74, 18, 74, 37)];
I.ecommerce = () => [L(8, 20, 20, 20, 30, 64, 80, 64), L(24, 32, 88, 32, 82, 54, 28, 54), E(36, 76, 5, 5), E(72, 76, 5, 5), LC(40, 22, 56, 22, 56, 32, 40, 32), L(40, 22, 44, 16, 60, 16, 56, 22), L(60, 16, 60, 26, 56, 32)];
I.higiene = () => [L(42, 20, 42, 12, 62, 12, 62, 16), L(46, 20, 54, 20), L(50, 20, 50, 30), C(36, 30, 64, 30), C(36, 30, 32, 40, 32, 86, 68, 86, 68, 40, 64, 30), CC(42, 52, 58, 52, 58, 70, 42, 70), E(76, 30, 4, 4), E(84, 42, 3, 3), E(72, 46, 2.5, 2.5)];
I.mascotas = () => [CC(50, 52, 64, 60, 68, 76, 58, 84, 50, 80, 42, 84, 32, 76, 36, 60), E(30, 42, 7, 9, 0, 360, -20), E(44, 30, 7, 9), E(58, 30, 7, 9), E(72, 42, 7, 9, 0, 360, 20)];
I.panificados = () => [CC(16, 50, 26, 30, 50, 22, 74, 30, 84, 50, 78, 66, 50, 72, 22, 66), C(32, 34, 36, 50, 32, 64), C(50, 28, 54, 46, 50, 68), C(68, 34, 72, 50, 68, 64)];
I.galletitas = () => [CC(50, 16, 72, 22, 84, 44, 78, 70, 56, 84, 30, 80, 16, 60, 20, 34), E(38, 38, 3, 3), E(60, 34, 3, 3), E(66, 56, 3, 3), E(42, 62, 3, 3), E(52, 48, 2.5, 2.5), E(56, 68, 2.5, 2.5)];
// ===== CORPORATIVOS Y SOSTENIBILIDAD =====
I.planta = () => [L(6, 88, 94, 88), L(10, 88, 10, 50, 30, 62, 30, 50, 50, 62, 50, 50, 70, 62, 70, 30, 82, 30, 82, 88), L(74, 30, 74, 16, 80, 16, 80, 30), LC(18, 70, 24, 70, 24, 78, 18, 78), LC(38, 70, 44, 70, 44, 78, 38, 78), LC(56, 70, 62, 70, 62, 78, 56, 78), C(76, 12, 72, 4, 82, 2, 88, 6, 96, 8, 94, 16, 84, 16)];
I.logistica = () => [LC(6, 30, 58, 30, 58, 72, 6, 72), L(58, 44, 78, 44, 92, 58, 92, 72, 58, 72), L(66, 44, 66, 58, 92, 58), E(22, 76, 7, 7), E(74, 76, 7, 7), L(14, 40, 30, 40), L(14, 50, 40, 50)];
I.exportacion = () => [E(50, 50, 36, 36), E(50, 50, 16, 36), L(14, 50, 86, 50), C(20, 30, 50, 34, 80, 30), C(20, 70, 50, 66, 80, 70), L(50, 14, 50, 86)];
I.equipo = () => [E(34, 34, 10, 11), C(14, 82, 16, 56, 34, 52, 52, 56, 54, 82), E(68, 38, 9, 10), C(56, 56, 70, 52, 86, 58, 88, 80)];
I.energia = () => [L(58, 6, 26, 54, 48, 54, 38, 94, 76, 40, 54, 40, 64, 6)];
I.eolica = () => [L(48, 92, 50, 40, 52, 92), E(50, 36, 4, 4), C(50, 32, 46, 18, 50, 4, 56, 18, 52, 32), C(54, 38, 68, 42, 80, 54, 64, 50, 50, 40), C(46, 38, 32, 44, 18, 52, 30, 40, 48, 34), L(36, 92, 64, 92)];
I.solar = () => [LC(12, 58, 70, 58, 86, 86, 28, 86), L(31, 58, 46, 86), L(50, 58, 66, 86), L(20, 72, 78, 72), E(74, 24, 10, 10), ...[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = a * Math.PI / 180; return L(74 + 14 * Math.cos(r), 24 + 14 * Math.sin(r), 74 + 20 * Math.cos(r), 24 + 20 * Math.sin(r)); })];
I.agua = () => [C(50, 8, 40, 30, 26, 50, 26, 64, 34, 82, 50, 88, 66, 82, 74, 64, 74, 50, 60, 30, 50, 8), C(38, 62, 40, 72, 48, 76)];
I.hoja = () => [C(18, 84, 22, 50, 46, 22, 86, 14, 82, 54, 56, 80, 18, 84), C(18, 84, 40, 60, 62, 40, 76, 26), C(44, 58, 42, 46, 46, 38), C(56, 48, 64, 50, 70, 48)];
I.certificacion = () => [E(50, 40, 24, 24), E(50, 40, 17, 17), L(42, 40, 48, 47, 60, 33), L(36, 60, 28, 90, 40, 84, 46, 94, 50, 64), L(64, 60, 72, 90, 60, 84, 54, 94, 50, 64)];
I.innovacion = () => [C(38, 66, 30, 54, 26, 40, 34, 22, 50, 16, 66, 22, 74, 40, 70, 54, 62, 66), L(38, 66, 62, 66), L(40, 74, 60, 74), L(42, 82, 58, 82), C(46, 88, 50, 90, 54, 88), C(42, 36, 46, 28, 54, 26)];
I.seguridad = () => [C(14, 66, 16, 40, 34, 24, 50, 22, 66, 24, 84, 40, 86, 66), L(8, 66, 92, 66, 92, 74, 8, 74), L(8, 66, 8, 74), L(44, 22, 44, 40, 56, 40, 56, 22), C(24, 56, 28, 40, 38, 32)];
I.calidad = () => [E(50, 50, 36, 36), L(32, 50, 45, 63, 70, 36)];
I.datos = () => [L(10, 10, 10, 88, 92, 88), LC(20, 64, 32, 64, 32, 88, 20, 88), LC(40, 48, 52, 48, 52, 88, 40, 88), LC(60, 32, 72, 32, 72, 88, 60, 88), ...arrow(C(18, 50, 40, 34, 58, 22, 86, 12), 6)];
I.ubicacion = () => [C(50, 92, 36, 70, 22, 52, 22, 36, 34, 14, 50, 10, 66, 14, 78, 36, 78, 52, 64, 70, 50, 92), E(50, 38, 11, 11)];
I.objetivo = () => [E(44, 56, 34, 34), E(44, 56, 22, 22), E(44, 56, 10, 10), L(44, 56, 84, 16), L(74, 16, 80, 20, 84, 27), L(80, 10, 86, 14, 90, 21)];
I.tiempo = () => [E(50, 52, 36, 36), L(50, 28, 50, 52, 66, 62), L(50, 12, 50, 16), L(36, 6, 64, 6)];
I.documento = () => [L(68, 10, 22, 10, 22, 90, 80, 90, 80, 22), L(68, 10, 80, 22, 68, 22, 68, 10), L(32, 36, 68, 36), L(32, 48, 68, 48), L(32, 60, 68, 60), L(32, 72, 54, 72)];
I.capacitacion = () => [LC(50, 18, 92, 36, 50, 54, 8, 36), C(24, 44, 24, 64, 50, 72, 76, 64, 76, 44), L(88, 38, 88, 64), E(88, 68, 3, 4)];
I.alianza = () => [L(4, 38, 20, 38, 22, 66, 4, 66), L(96, 38, 80, 38, 78, 66, 96, 66), C(21, 44, 34, 38, 46, 40, 60, 48, 68, 56, 64, 62, 56, 59), C(79, 44, 66, 38, 54, 40, 44, 46, 40, 52, 46, 56, 54, 52), C(22, 62, 34, 70, 46, 74, 58, 72, 68, 64, 78, 62), C(46, 62, 52, 67), C(52, 58, 60, 64)];
I.comunidad = () => [C(50, 84, 30, 70, 16, 54, 16, 38, 26, 26, 40, 26, 50, 38, 60, 26, 74, 26, 84, 38, 84, 54, 70, 70, 50, 84), C(28, 44, 32, 36, 40, 34)];
I.co2 = () => [C(20, 70, 8, 68, 6, 54, 16, 48, 18, 34, 32, 28, 42, 34, 50, 22, 68, 22, 76, 36, 90, 38, 96, 54, 88, 70, 20, 70), ...arrow(L(50, 76, 50, 96), 5)];

const GRUPOS = {
  negocios: [["corrugado", "Cartón corrugado"], ["papel", "Papel reciclado"], ["kraft", "Papel kraft"], ["flexibles", "Envases flexibles"], ["bolsas", "Bolsas industriales"], ["automatizacion", "Automatización"], ["forestal", "Forestal"], ["reciclado", "Economía circular"]],
  mercados: [["fruta", "Frutas"], ["lacteos", "Lácteos"], ["carnes", "Carnes y aves"], ["bebidas", "Bebidas"], ["golosinas", "Golosinas"], ["galletitas", "Galletitas"], ["panificados", "Panificados"], ["agro", "Agro"], ["construccion", "Construcción"], ["ecommerce", "E-commerce"], ["higiene", "Higiene"], ["mascotas", "Mascotas"]],
  corporativos: [["planta", "Planta industrial"], ["logistica", "Logística"], ["exportacion", "Exportación"], ["equipo", "Personas"], ["energia", "Energía"], ["eolica", "Energía eólica"], ["solar", "Energía solar"], ["agua", "Agua"], ["hoja", "Sostenibilidad"], ["co2", "Emisiones"], ["certificacion", "Certificación"], ["calidad", "Calidad"], ["innovacion", "Innovación"], ["seguridad", "Seguridad"], ["datos", "Resultados"], ["objetivo", "Objetivos"], ["ubicacion", "Ubicación"], ["tiempo", "Tiempo"], ["documento", "Documento"], ["capacitacion", "Capacitación"], ["alianza", "Alianzas"], ["comunidad", "Comunidad"]],
};

function icono(nombre, seed) { return hand(I[nombre](), seed || nombre.length * 13); }
// SVG para vista previa
function svg(nombre, color = "#1F497D", sw = 2.2) {
  const paths = icono(nombre).map((pts) => `<path d="M${pts.map((q) => q[0].toFixed(2) + " " + q[1].toFixed(2)).join(" L")}" />`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 108 108" width="216" height="216"><g fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`;
}
module.exports = { I, GRUPOS, icono, svg, hand, E, L, LC, C, CC, head, arrow, dash, onda, pino };
