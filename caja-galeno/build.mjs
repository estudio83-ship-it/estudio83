// Caja tipo galeno, troquel 6463: del plano DXF a la caja armada, en una figura isométrica.
// node build.mjs [--light] [--mas 50]  →  caja-galeno.html / caja-galeno-light.html
// --mas N: frasco N mm más largo (por defecto 50). Lee troquel-6463-masN.dxf, que escribe estirar.mjs;
// con --mas 0 usa el troquel original.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { readDxf, facesOf, hingeTree, faceAt } from "./troquel.mjs";
import { stretchOf } from "./estirar.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";
const argAt = process.argv.indexOf("--mas");
const E = argAt > 0 ? Number(process.argv[argAt + 1]) : 50;
// Todas las coordenadas de abajo son del plano original; «o» las lleva al plano estirado.
const o = stretchOf(E);
const kitScript = () => readFileSync(join(HERE, "kit/iso-kit.mjs"), "utf8").replace(/^export /gm, "");

// ---------- Verdad: el troquel ----------
const DXF = E ? `troquel-6463-mas${E}.dxf` : "troquel-6463.dxf";
const model = facesOf(readDxf(join(HERE, DXF)));
const BACK = faceAt(model, o([738, 872]));
const INSERT = faceAt(model, o([1131, 880]));
const tree = hingeTree(model, [BACK, INSERT]);
const at = (x, y) => faceAt(model, o([x, y]));

// Medidas del plano (mm): tubo (320 + E) × 94, alto 276 entre hendidos del frente.
const W = 320 + E, D = 94, H = 276;

// Papel de cada cara y su secuencia, en segundos de un ciclo de 20 s.
const ROLE = {};
const role = (face, name, step, t0, t1, angle) => (ROLE[face] = { name, step, t0, t1, angle });
role(at(530, 870), "costado", 5, 9.2, 10.2, 90);
role(at(320, 870), "frente", 5, 10.0, 11.1, 90);
role(at(110, 870), "costado", 5, 10.9, 11.9, 90);
role(at(940, 870), "solapa de pegado", 5, 8.6, 9.5, 90);
const end = (y, sign, step, t) => {
  role(at(320, y + sign * 40), "contratapa", step, t, t + 0.8, 90);
  role(at(530, y + sign * 60), "guardapolvo", step, t + 0.5, t + 1.3, 90);
  role(at(940, y + sign * 60), "guardapolvo", step, t + 0.65, t + 1.45, 90);
  role(at(110, y + sign * 40), "oreja", step, t + 0.8, t + 1.6, 90);
  role(at(738, y + sign * 50), "tapa", step, t + 1.4, t + 2.4, 90);
  role(at(738, y + sign * 99), "pestaña 10 mm", step, t + 2.1, t + 2.7, 90);
  role(at(738, y + sign * 150), "lengüeta", step, t + 2.4, t + 3.3, 90);
};
end(724, -1, 6, 12.1);
end(1020, 1, 7, 15.6);
model.faces.forEach((_, i) => {
  if (ROLE[i] || i === BACK || i === INSERT) return;
  const d = tree.depth[i];
  if (tree.kind[i] === "perf" || d === 1) role(i, "tabique", 2, 1.4, 2.6, 90);
  else if (d === 2) role(i, "puente 28 mm", 2, 2.3, 3.3, -90);
  else role(i, "pared exterior", 2, 3.0, 4.0, -90);
});
const missing = model.faces.map((_, i) => i).filter((i) => !ROLE[i] && i !== BACK && i !== INSERT);
if (missing.length) throw new Error("caras sin papel: " + missing);

const STEPS = ["troquel plano", "interior: tabiques", "interior al fondo", "frascos", "tubo y pegado", "cierre de fondo", "cierre de tapa"];
const STEP_AT = [0, 1.4, 4.1, 6.0, 8.4, 12.1, 15.6, 19.2];
const CYCLE = 20;

// Interior: del plano (x 997–1265, y 556–1219) al fondo de la caja, girado 90°.
const INSERT_FROM = [1131.1 + E, 887.5 + E / 2];
const INSERT_TO = [738 + E / 2, 872];
const MOVE = [4.1, 6.0];

// Frascos: cuerpo ⌀76 en el agujero ⌀80, cuello ⌀31 en la ranura ⌀31; largo 306 + E.
const LEN = 306 + E;
const AXIS_Z = 44.5;
const BOTTLES = [
  { y: 1045.6 - 259.1, from: 584, dir: 1 },
  { y: 1131.6 - 259.1, from: 892 + E, dir: -1 },
  { y: 1218.1 - 259.1, from: 584, dir: 1 },
];
const DROP = 230;
const BOTTLE_T = [[6.1, 7.4], [6.5, 7.8], [6.9, 8.2]];

// ---------- Cámara ----------
const WIDTH = 640, HEIGHT = 400;
const MAT = { x: 10 - E, y: 470, w: 1330 + 2 * E, d: 840, r: 14 };
const MAT_H = 6;
const P = k.fitProjection([...k.boxCorners(MAT, -MAT_H - 18, 0), [738 + E / 2, 872, 330]], WIDTH, HEIGHT, { pad: 22, azimuth: 58, elevation: 32 });
const ZOOM = 1.85;
const FOCUS = [738 + E / 2, 872, 47];

const pt = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);

// ---------- Mesa y plancha de corte ----------
function bench() {
  const out = [`<path class="iso-halo" d="${k.haloOf(MAT, -MAT_H - 18, 18, P)}"/>`];
  const TABLE = k.insetPlan(MAT, -16);
  for (const [x, y] of [[TABLE.x + 40, TABLE.y + 40], [TABLE.x + TABLE.w - 40, TABLE.y + 40], [TABLE.x + 40, TABLE.y + TABLE.d - 40], [TABLE.x + TABLE.w - 40, TABLE.y + TABLE.d - 40]].sort((a, b) => k.depthOf([...a, 0], P) - k.depthOf([...b, 0], P)))
    out.push(S(k.cylinder(x, y, 18, -MAT_H - 30, 12, P, 28), { tone: "lo" }));
  out.push(S(k.slabOf(TABLE, -MAT_H - 18, 12, P, 6, 1.2), { tone: "mid" }));
  out.push(L(k.sideSeam(TABLE, -MAT_H - 12, P, 6), { tone: "faint" }));
  const screws = k.corners(TABLE, 14);
  out.push(k.dotsSvg(screws.map(([x, y]) => pt([x, y, -MAT_H - 6])), { size: 0.5, tone: "mid" }));
  out.push(S(k.slabOf(MAT, -MAT_H, MAT_H, P, 8, 0.8), { tone: "mid" }));
  // Retícula de la plancha: cada 50 mm, más marcada cada 250.
  const inner = k.insetPlan(MAT, 22);
  const minor = [], major = [];
  for (let x = Math.ceil(inner.x / 50) * 50; x <= inner.x + inner.w; x += 50) (x % 250 ? minor : major).push(k.lineOnTop([x, inner.y], [x, inner.y + inner.d], 0, P));
  for (let y = Math.ceil(inner.y / 50) * 50; y <= inner.y + inner.d; y += 50) (y % 250 ? minor : major).push(k.lineOnTop([inner.x, y], [inner.x + inner.w, y], 0, P));
  out.push(L(minor.join(""), { tone: "faint" }), L(major.join(""), { tone: "lo" }));
  out.push(L(k.planOutline(inner, 0, P, 4), { tone: "lo" }));
  // Reglas grabadas en el borde cercano (y) y el derecho (x), en mm.
  const ry = { x: inner.x, y: inner.y + inner.d + 2, w: inner.w, d: 16, r: 1 };
  const t1 = k.topTicks(ry.x + 6, ry.x + ry.w - 6, 10, 5, ry.y, 0, [4, 8], P);
  out.push(L(k.lineOnTop([ry.x, ry.y], [ry.x + ry.w, ry.y], 0, P), { tone: "lo" }));
  out.push(L(t1.minor, { tone: "faint" }), L(t1.major, { tone: "lo" }));
  const rx = { x: inner.x + inner.w + 2, y: inner.y, w: 16, d: inner.d };
  const t2 = k.topTicks(rx.y + 6, rx.y + rx.d - 6, 10, 5, rx.x, 0, [4, 8], P, "y");
  out.push(L(k.lineOnTop([rx.x, rx.y], [rx.x, rx.y + rx.d], 0, P), { tone: "lo" }));
  out.push(L(t2.minor, { tone: "faint" }), L(t2.major, { tone: "lo" }));
  // Marcas de registro en las cuatro esquinas de la retícula.
  const reg = k.corners(inner, 0).map(([x, y]) => k.ring(x, y, 7, 0, P, 20) + k.lineOnTop([x - 11, y], [x + 11, y], 0, P) + k.lineOnTop([x, y - 11], [x, y + 11], 0, P));
  out.push(L(reg.join(""), { tone: "lo" }));
  return out.join("");
}

// Plegadera de hueso y pote de cola, apoyados en la plancha.
function tools() {
  const out = [];
  const bone = { x: 620, y: 482, w: 250, d: 26, r: 12 };
  out.push(`<path class="iso-halo" d="${k.haloOf(bone, 0, 4, P)}" style="filter:blur(4px)"/>`);
  out.push(S(k.slabOf(bone, 0, 5, P, 8, 0.6), { tone: "mid" }));
  out.push(L(k.lineOnTop([bone.x + 30, bone.y + 13], [bone.x + bone.w - 40, bone.y + 13], 5, P), { tone: "faint" }));
  out.push(k.dotsSvg([pt([bone.x + 18, bone.y + 13, 5])], { size: 0.6, tone: "lo" }));
  const pot = [1060, 505];
  const F = G.frameAlong([pot[0], pot[1], 0], [0, 0, 1]);
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: pot[0] - 24, y: pot[1] - 24, w: 48, d: 48, r: 24 }, 0, 4, P)}" style="filter:blur(4px)"/>`);
  out.push(S(G.solidOf([[0, 22], [52, 22], [56, 19, 1], [60, 12], [66, 12], [70, 8], [86, 3]], F, P), { tone: "mid", inner: L(G.arcOf(F, 14, 22, P) + G.arcOf(F, 40, 22, P), { tone: "faint" }) }));
  out.push(L(G.ribsOf(F, 60, 66, 12, 18, P, { seams: true }), { tone: "lo" }));
  return out.join("");
}

// ---------- Frascos ----------
const BODY_R = 38, NECK_R = 15.5;
const PROFILE = [[0, 30], [1.5, 35, 1], [5, 38, 1], [228, 38], [236, 36.5, 1], [250, 29, 1], [262, 19, 1], [268, NECK_R], [292, NECK_R], [292, 17], [306, 17]].map(([s, r, f], i) => (i > 2 ? [s + E, r, f] : [s, r, f]).filter((v) => v !== undefined));
function bottle(b) {
  const F = G.frameAlong([b.from, b.y, AXIS_Z], [b.dir, 0, 0]);
  const label = L(G.arcOf(F, 40, BODY_R, P) + G.arcOf(F, 196 + E, BODY_R, P), { tone: "lo" });
  const out = [S(G.solidOf(PROFILE.slice(0, 9), F, P), { tone: "hi", inner: label })];
  out.push(L(G.ribsOf(F, 64, 172 + E, BODY_R, 3, P, { phase: 0.4, least: 0.5 }), { tone: "faint", free: true }));
  out.push(S(G.disc(274 + E, 278 + E, NECK_R + 1.2, F, P), { tone: "mid" }));
  out.push(S(G.disc(292 + E, 306 + E, 17, F, P), { tone: "mid" }));
  out.push(L(G.ribsOf(F, 292 + E, 306 + E, 17, 30, P, { seams: true }), { tone: "lo" }));
  return out.join("");
}

// ---------- Datos para el código vivo ----------
const FACES = model.faces.map((f, i) => ({
  ring: f.ring.map(([x, y]) => [+x.toFixed(2), +y.toFixed(2)]),
  kinds: f.kinds.map((kind) => kind[0]),
  parent: tree.parent[i],
  hinge: tree.hinge[i],
  role: ROLE[i] ?? null,
  insert: (() => { let j = i; while (tree.parent[j] >= 0) j = tree.parent[j]; return j === INSERT; })(),
}));

// Impresión en la cara exterior (lado de abajo del plano: «troquelar de dorso»).
const MARKS = [];
const mark = (face, side, pts, tone, extra = {}) => MARKS.push({ face, side, pts: pts.map(o), tone, ...extra });
const FRONT = at(320, 870);
{
  const [x0, x1, y0, y1] = [161.1 + 14, 484.1 - 14, 735 + 14, 1009 - 14];
  mark(FRONT, "down", [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]], "lo");
  mark(FRONT, "down", [[x0, 930], [x1, 930]], "lo");
  mark(FRONT, "down", [[x0, 905], [x1, 905]], "faint");
  for (const [y, len] of [[958, 150], [945, 210], [880, 120], [866, 180], [852, 90]]) mark(FRONT, "down", [[x0 + 22, y], [x0 + 22 + len, y]], "mid", { free: true });
}
const SIDE1 = at(110, 870);
for (let i = 0; i < 18; i++) {
  const x = 84 + i * 3.4 + (i % 3 === 0 ? 1 : 0);
  mark(SIDE1, "down", [[x, 770], [x, i % 4 === 0 ? 806 : 798]], "mid", { free: true });
}
// Cordón de cola en la cara interior del costado que recibe la solapa.
mark(SIDE1, "up", [[114, 745], [114, 999]], "lit", { glue: [8.0, 8.6] });
const LIDS = [at(738, 1070), at(738, 674)];
for (const lid of LIDS) {
  const y = lid === LIDS[0] ? 1067 : 677;
  mark(lid, "down", [[650, y - 12], [826, y - 12]], "lo");
  mark(lid, "down", [[662, y + 6], [770, y + 6]], "mid", { free: true });
}

// ---------- SVG ----------
const bottlesSvg = BOTTLES.map((b, i) => `<g data-bottle="${i}" opacity="0">${bottle(b)}</g>`).join("");
const backHalo = k.haloOf({ x: 578, y: 724, w: W, d: 296, r: 3 }, 0, D, P);
const LABEL = E ? `troquel 6463 +${E}` : "troquel 6463";
const svg = k.figureSvg({
  width: WIDTH,
  height: HEIGHT,
  label: `Caja tipo galeno del ${LABEL}, armada sobre una plancha de corte. El plano de cartón se pliega por sus hendidos: el interior levanta dos tabiques huecos de 28 mm y se apoya en el fondo, entran tres frascos alternados (cuerpo en el agujero de 80 mm, cuello en la ranura de 31 mm), el tubo se cierra sobre la solapa de pegado y cada extremo se cierra con contratapa, guardapolvos y una tapa de pared doble de 10 mm cuya lengüeta traba en la ranura del fondo. Caja de ${W} × ${D} × ${H} mm.`,
  body: [
    `<g data-part="scene">`,
    bench(),
    tools(),
    `<path data-part="box-halo" class="iso-halo" d="${backHalo}" opacity="0"/>`,
    `<g data-part="sheet"></g>`,
    `<g data-part="bottles" style="display:none">${bottlesSvg}</g>`,
    `</g>`,
  ],
});

const CSS = `
.cg-in{--anatomy-top:#202020;--anatomy-shade-0:#121212;--anatomy-shade-1:#151515;--anatomy-shade-2:#181818;--anatomy-shade-3:#1c1c1c}
.iso[data-theme="light"] .cg-in{--anatomy-top:#f1efe9;--anatomy-shade-0:#d6d3cb;--anatomy-shade-1:#dedbd3;--anatomy-shade-2:#e6e3dc;--anatomy-shade-3:#ece9e2}
.cg-face>.iso-fill{fill:var(--anatomy-paper)}
.iso-stage{outline:none;touch-action:pan-y;cursor:ew-resize;overflow:hidden;margin:-18px 0;padding:18px 0}
.iso-stage .iso-svg{overflow:hidden}
.iso-stage:focus-visible{box-shadow:0 0 0 1px var(--anatomy-mid)}
`;

const live = `
const P = ${JSON.stringify(P)};
const FACES = ${JSON.stringify(FACES)};
const MARKS = ${JSON.stringify(MARKS)};
const BOTTLES = ${JSON.stringify(BOTTLES)};
const BOTTLE_T = ${JSON.stringify(BOTTLE_T)};
const STEPS = ${JSON.stringify(STEPS)}, STEP_AT = ${JSON.stringify(STEP_AT)};
const CYCLE = ${CYCLE}, LEN = ${LEN}, DROP = ${DROP}, ZOOM = ${ZOOM};
const MOVE = ${JSON.stringify(MOVE)}, INSERT_FROM = ${JSON.stringify(INSERT_FROM)}, INSERT_TO = ${JSON.stringify(INSERT_TO)};
const FOCUS = ${JSON.stringify(FOCUS)}, AXIS_Z = ${AXIS_Z}, VIEW = [${WIDTH}, ${HEIGHT}];
const DIMS = "${W} × ${D} × ${H} mm";
${engine.toString()}
engine();
`;

function engine() {
  const stage = document.querySelector(".iso-stage");
  const svg = stage.querySelector("svg");
  const scene = svg.querySelector('[data-part="scene"]');
  const sheet = svg.querySelector('[data-part="sheet"]');
  const bottleBox = svg.querySelector('[data-part="bottles"]');
  const halo = svg.querySelector('[data-part="box-halo"]');
  const readout = document.querySelector("[data-readout]");
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  const NS = "http://www.w3.org/2000/svg";
  const { sinA, cosA, sinE, cosE } = cameraOf(P);
  const V = [cosA * cosE, sinA * cosE, sinE];
  const LIGHT = (() => { const l = [-sinA, cosA, 1.2], n = Math.hypot(...l); return l.map((v) => v / n); })();
  const BANDS = [0, 0.2, 0.42, 0.62];
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const span = (t, a, b) => ease((t - a) / (b - a));

  // Matrices 3×4 [r00 r01 r02 tx, …].
  const mul = (A, B) => {
    const C = new Array(12);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) C[r * 4 + c] = A[r * 4] * B[c] + A[r * 4 + 1] * B[4 + c] + A[r * 4 + 2] * B[8 + c];
      C[r * 4 + 3] = A[r * 4] * B[3] + A[r * 4 + 1] * B[7] + A[r * 4 + 2] * B[11] + A[r * 4 + 3];
    }
    return C;
  };
  const apply = (M, [x, y, z = 0]) => [M[0] * x + M[1] * y + M[2] * z + M[3], M[4] * x + M[5] * y + M[6] * z + M[7], M[8] * x + M[9] * y + M[10] * z + M[11]];
  const ID = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
  const about = ([px, py], [dx, dy], th) => {
    const c = Math.cos(th), s = Math.sin(th), t = 1 - c;
    const R = [t * dx * dx + c, t * dx * dy, s * dy, 0, t * dx * dy, t * dy * dy + c, -s * dx, 0, -s * dy, s * dx, c, 0];
    const o = apply(R, [px, py, 0]);
    R[3] = px - o[0]; R[7] = py - o[1]; R[11] = -o[2];
    return R;
  };

  // Bisagras orientadas para que un ángulo positivo levante la cara hacia el lado de arriba del plano.
  FACES.forEach((f) => {
    const c = f.ring.reduce((s, p) => [s[0] + p[0] / f.ring.length, s[1] + p[1] / f.ring.length], [0, 0]);
    f.centre = c;
    if (!f.hinge) return;
    let [a, b] = f.hinge;
    let d = [b[0] - a[0], b[1] - a[1]];
    const n = Math.hypot(...d);
    d = [d[0] / n, d[1] / n];
    if (d[0] * (c[1] - a[1]) - d[1] * (c[0] - a[0]) < 0) d = [-d[0], -d[1]];
    f.axis = [a, d];
  });
  const order = [];
  const visit = (i) => { if (order.includes(i)) return; if (FACES[i].parent >= 0) visit(FACES[i].parent); order.push(i); };
  FACES.forEach((_, i) => visit(i));

  // Elementos persistentes.
  const make = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent && parent.appendChild(e); return e; };
  FACES.forEach((f, i) => {
    f.g = make("g", { class: "iso-solid cg-face" });
    f.fill = make("path", { class: "iso-fill" }, f.g);
    f.shade = make("path", { class: "iso-shade", "fill-rule": "evenodd" }, f.g);
    f.marks = MARKS.filter((m) => m.face === i).map((m) => ({ ...m, el: make("path", Object.assign({ class: "iso-line", "data-tone": m.tone }, m.free ? { "data-free": "" } : {}), f.g) }));
    f.crease = make("path", { class: "iso-line", "data-tone": "lo" }, f.g);
    f.perf = make("path", { class: "iso-line", "data-tone": "lo", "data-dashed": "" }, f.g);
    f.cut = make("path", { class: "iso-line iso-edge", "data-tone": "mid" }, f.g);
  });
  bottleBox.style.display = "";
  const bottles = BOTTLES.map((b, i) => ({ g: bottleBox.querySelector('[data-bottle="' + i + '"]'), b }));

  const pathOfPts = (pts, closed) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join("") + (closed ? "Z" : "");

  const hull = (pts) => {
    const q = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], hi = [];
    for (const p of q) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (const p of q.reverse()) { while (hi.length > 1 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  };
  const inPoly = (p, r) => {
    let hit = false;
    for (let i = 0, j = r.length - 1; i < r.length; j = i++)
      if (r[i][1] > p[1] !== r[j][1] > p[1] && p[0] < ((r[j][0] - r[i][0]) * (p[1] - r[i][1])) / (r[j][1] - r[i][1]) + r[i][0]) hit = !hit;
    return hit;
  };
  // Dos contornos se tapan si se cruzan sus bordes con margen o uno contiene un punto interior del otro.
  const overlap = (a, b) => {
    const m = 0.6;
    for (let i = 0; i < a.length; i++) {
      const p = a[i], q = a[(i + 1) % a.length];
      for (let j = 0; j < b.length; j++) {
        const r = b[j], s = b[(j + 1) % b.length];
        const d1 = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
        const d2 = (q[0] - p[0]) * (s[1] - p[1]) - (q[1] - p[1]) * (s[0] - p[0]);
        const d3 = (s[0] - r[0]) * (p[1] - r[1]) - (s[1] - r[1]) * (p[0] - r[0]);
        const d4 = (s[0] - r[0]) * (q[1] - r[1]) - (s[1] - r[1]) * (q[0] - r[0]);
        const la = Math.hypot(q[0] - p[0], q[1] - p[1]) * m, lb = Math.hypot(s[0] - r[0], s[1] - r[1]) * m;
        if (((d1 > lb && d2 < -lb) || (d1 < -lb && d2 > lb)) && ((d3 > la && d4 < -la) || (d3 < -la && d4 > la))) return true;
      }
    }
    const mid = (r) => { let x = 0, y = 0; for (const p of r) { x += p[0]; y += p[1]; } return [x / r.length, y / r.length]; };
    const ca = mid(a), cb = mid(b);
    return (inPoly(ca, a) && inPoly(ca, b)) || (inPoly(cb, b) && inPoly(cb, a));
  };

  function frame(t) {
    // Transformaciones de cada cara.
    const M = [];
    let active = null;
    for (const i of order) {
      const f = FACES[i];
      let T;
      if (f.parent < 0) {
        T = ID;
        if (f.insert) {
          const m = span(t, MOVE[0], MOVE[1]);
          const lift = Math.sin(Math.PI * m) * 150 + 0.6 * m;
          const phi = (Math.PI / 2) * span(t, MOVE[0] + 0.25, MOVE[1] - 0.25);
          const cx = INSERT_FROM[0] + (INSERT_TO[0] - INSERT_FROM[0]) * m, cy = INSERT_FROM[1] + (INSERT_TO[1] - INSERT_FROM[1]) * m;
          const c = Math.cos(phi), s = Math.sin(phi);
          T = [c, -s, 0, cx - (c * INSERT_FROM[0] - s * INSERT_FROM[1]), s, c, 0, cy - (s * INSERT_FROM[0] + c * INSERT_FROM[1]), 0, 0, 1, lift];
          if (t > MOVE[0] && t < MOVE[1]) active = { name: "interior", value: Math.round(phi * 180 / Math.PI) + "°", lit: i };
        }
      } else {
        const r = f.role;
        const p = span(t, r.t0, r.t1);
        T = mul(M[f.parent], about(f.axis[0], f.axis[1], (r.angle * Math.PI / 180) * p));
        if (t > r.t0 && t < r.t1 && (!active || r.t0 >= active.t0)) active = { name: r.name, value: Math.round(Math.abs(r.angle) * p) + "°", lit: i, t0: r.t0 };
      }
      M[i] = T;
    }

    // Geometría proyectada y orden de pintado.
    const items = [];
    FACES.forEach((f, i) => {
      const T = M[i];
      const w = f.ring.map((p) => apply(T, p));
      const n = [T[2], T[6], T[10]];
      const up = n[0] * V[0] + n[1] * V[1] + n[2] * V[2] > 0;
      const s = w.map((p) => iso(p, P));
      const o = apply(T, f.centre);
      items.push({ i, w, s, n, d: n[0] * o[0] + n[1] * o[1] + n[2] * o[2], up, depth: depthOf(o, P), T });
    });
    bottles.forEach((B, j) => {
      const [t0, t1] = BOTTLE_T[j];
      const p = span(t, t0, t1);
      const dz = (1 - p) * DROP;
      const op = Math.min(1, Math.max(0, (t - t0 + 0.35) / 0.35));
      B.g.setAttribute("transform", translateAlong(P, [0, 0, dz]));
      B.g.setAttribute("opacity", op.toFixed(3));
      B.g.style.display = op > 0 ? "" : "none";
      const x0 = Math.min(B.b.from, B.b.from + B.b.dir * LEN), x1 = Math.max(B.b.from, B.b.from + B.b.dir * LEN);
      const w = [];
      for (const x of [x0, x1]) for (const y of [B.b.y - 38, B.b.y + 38]) for (const z of [AXIS_Z - 38 + dz, AXIS_Z + 38 + dz]) w.push([x, y, z]);
      items.push({ bottle: B, w, s: w.map((q) => iso(q, P)), depth: depthOf([(x0 + x1) / 2, B.b.y, AXIS_Z + dz], P), hidden: op <= 0 });
      if (t > t0 && t < t1) active = active ?? { name: "frasco " + (j + 1), value: Math.round(DROP * (1 - p)) + " mm" };
    });
    const live = items.filter((it) => !it.hidden);
    live.forEach((it) => {
      let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity;
      for (const [x, y] of it.s) { if (x < a) a = x; if (y < b) b = y; if (x > c) c = x; if (y > d) d = y; }
      it.box = [a, b, c, d];
      const step = Math.max(1, Math.floor(it.s.length / 28));
      it.hull = it.bottle ? hull(it.s) : it.s.filter((_, q) => q % step === 0);
    });
    const side = (A, B) => {
      // +1: A delante de B (todo A del lado del observador del plano de B).
      const sv = Math.sign(B.n[0] * V[0] + B.n[1] * V[1] + B.n[2] * V[2]) || 1;
      let pos = 0, neg = 0;
      for (const p of A.w) {
        const v = (B.n[0] * p[0] + B.n[1] * p[1] + B.n[2] * p[2] - B.d) * sv;
        if (v > 0.3) pos++; else if (v < -0.3) neg++;
      }
      if (pos && !neg) return 1;
      if (neg && !pos) return -1;
      return 0;
    };
    const N = live.length, after = live.map(() => []), deg = live.map(() => 0);
    for (let x = 0; x < N; x++) for (let y = x + 1; y < N; y++) {
      const A = live[x], B = live[y];
      if (A.box[2] < B.box[0] || B.box[2] < A.box[0] || A.box[3] < B.box[1] || B.box[3] < A.box[1]) continue;
      if (!overlap(A.hull, B.hull)) continue;
      let r = B.n ? side(A, B) : 0;
      if (!r && A.n) r = -side(B, A);
      if (!r) { if (A.n && B.n) continue; r = A.depth > B.depth ? 1 : -1; }
      if (r > 0) { after[y].push(x); deg[x]++; } else { after[x].push(y); deg[y]++; }
    }
    const sorted = [], done = live.map(() => false);
    while (sorted.length < N) {
      let pick = -1;
      for (let x = 0; x < N; x++) if (!done[x] && deg[x] === 0 && (pick < 0 || live[x].depth < live[pick].depth)) pick = x;
      if (pick < 0) for (let x = 0; x < N; x++) if (!done[x] && (pick < 0 || live[x].depth < live[pick].depth)) pick = x;
      done[pick] = true; sorted.push(live[pick]);
      for (const y of after[pick]) deg[y]--;
    }

    // Pintar.
    let prev = null;
    for (const it of sorted) {
      const el = it.bottle ? it.bottle.g : FACES[it.i].g;
      const parent = it.bottle ? bottleBox : sheet;
      if (it.bottle) { /* los frascos viven en su propio grupo, pero se intercalan moviéndolos */ }
      if (el.parentNode !== sheet || el.previousSibling !== prev) sheet.insertBefore(el, prev ? prev.nextSibling : sheet.firstChild);
      prev = el;
      if (it.bottle) continue;
      const f = FACES[it.i];
      const outline = pathOfPts(it.s, true);
      f.fill.setAttribute("d", outline);
      f.shade.setAttribute("d", outline);
      const seen = it.up ? it.n : it.n.map((v) => -v);
      const score = seen[0] * LIGHT[0] + seen[1] * LIGHT[1] + seen[2] * LIGHT[2];
      if (seen[2] > 0.92) { f.shade.setAttribute("class", "iso-top"); f.shade.removeAttribute("data-shade"); }
      else { let b = 0; while (b < 4 && score >= BANDS[b]) b++; f.shade.setAttribute("class", "iso-shade"); f.shade.setAttribute("data-shade", String(Math.max(0, b - 1))); }
      f.g.classList.toggle("cg-in", it.up);
      const lit = active && active.lit === it.i;
      if (lit) f.g.setAttribute("data-lit", ""); else f.g.removeAttribute("data-lit");
      // Bordes por tipo: corte, hendido, intermitente.
      const runs = { c: [], h: [], p: [] };
      const n = it.s.length;
      for (let e = 0; e < n; e++) {
        const kind = f.kinds[e] === "c" ? "c" : f.kinds[e] === "p" ? "p" : "h";
        const a = it.s[e], b = it.s[(e + 1) % n];
        const list = runs[kind];
        const last = list[list.length - 1];
        if (last && last.end === e) { last.pts.push(b); last.end = e + 1; } else list.push({ pts: [a, b], end: e + 1 });
      }
      f.cut.setAttribute("d", runs.c.map((r) => pathOfPts(r.pts)).join(""));
      f.cut.setAttribute("data-tone", lit ? "lit" : "mid");
      f.crease.setAttribute("d", runs.h.map((r) => pathOfPts(r.pts)).join(""));
      f.perf.setAttribute("d", runs.p.map((r) => pathOfPts(r.pts)).join(""));
      for (const m of f.marks) {
        const show = (m.side === "up") === it.up;
        let op = show ? 1 : 0;
        if (m.glue) op *= span(t, m.glue[0], m.glue[1]);
        m.el.setAttribute("d", op > 0 ? pathOfPts(m.pts.map((p) => iso(apply(it.T, p), P))) : "");
        m.el.setAttribute("opacity", op.toFixed(2));
      }
    }

    // Cámara: acerca la caja cuando el interior ya está en el fondo.
    const z = 1 + (ZOOM - 1) * span(t, 4.4, 8.6);
    const [fx, fy] = iso(FOCUS, P);
    const cx = VIEW[0] / 2, cy = VIEW[1] / 2 + 14;
    scene.setAttribute("transform", "translate(" + (fx + (cx - fx) * span(t, 4.4, 8.6) - fx * z).toFixed(2) + " " + (fy + (cy - fy) * span(t, 4.4, 8.6) - fy * z).toFixed(2) + ") scale(" + z.toFixed(4) + ")");
    halo.setAttribute("opacity", span(t, 11, 12.5).toFixed(2));

    // Lectura.
    let step = 0;
    while (step < STEPS.length - 1 && t >= STEP_AT[step + 1]) step++;
    const text = t >= STEP_AT[STEPS.length] - 0.05 ? "7/7 caja armada · " + DIMS : (step + 1) + "/7 " + STEPS[step] + (active ? " · " + active.name + " " + active.value : "");
    if (readout.textContent !== text) readout.textContent = text;
    stage.setAttribute("aria-valuenow", String(step + 1));
    stage.setAttribute("aria-valuetext", text);
  }

  // Tiempo: recorrido en bucle (arma, sostiene, desarma) hasta que alguien toma el control.
  const HOLD = 3, BACK = 4;
  const LOOP = CYCLE + HOLD + BACK + 1.5;
  const tourAt = (c) => {
    c %= LOOP;
    if (c < CYCLE) return c;
    if (c < CYCLE + HOLD) return CYCLE;
    if (c < CYCLE + HOLD + BACK) return CYCLE * (1 - ease((c - CYCLE - HOLD) / BACK));
    return 0;
  };
  let t = 0, target = 0, clock = 0, touring = !still.matches, visible = false, raf = 0, last = 0, idle = 0;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    if (touring) { clock += dt; target = tourAt(clock); t = target; }
    else t = still.matches ? target : t + (target - t) * (1 - Math.exp(-dt / 0.22));
    if (Math.abs(target - t) < 0.002) t = target;
    frame(t);
    raf = visible && (touring || t !== target) ? requestAnimationFrame(tick) : 0;
  }
  const run = () => { if (!raf && visible) { last = 0; raf = requestAnimationFrame(tick); } };
  const steer = (to) => {
    touring = false; target = clamp(to, 0, CYCLE);
    clearTimeout(idle);
    idle = setTimeout(() => { if (still.matches) return; touring = true; clock = target; run(); }, 5000);
    run();
  };
  new IntersectionObserver((e) => { visible = e[e.length - 1].isIntersecting; if (visible) run(); }, { rootMargin: "120px 0px" }).observe(stage);
  stage.addEventListener("pointermove", (e) => {
    const r = svg.getBoundingClientRect();
    steer(clamp(((e.clientX - r.left) / r.width - 0.08) / 0.84, 0, 1) * CYCLE);
  });
  stage.addEventListener("keydown", (e) => {
    let here = 0;
    while (here < STEPS.length - 1 && target >= STEP_AT[here + 1] - 0.01) here++;
    let to = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") to = STEP_AT[Math.min(STEPS.length, here + 1)];
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = target > STEP_AT[here] + 0.01 ? STEP_AT[here] : STEP_AT[Math.max(0, here - 1)];
    if (e.key === "Home") to = 0;
    if (e.key === "End") to = CYCLE;
    if (to === null) return;
    e.preventDefault();
    steer(to);
  });
  if (still.matches) { t = target = CYCLE; }
  frame(t);
  window.__caja = { frame: (x) => { touring = false; t = target = x; frame(x); }, CYCLE };
}

const body = k.plateHtml({
  fig: "Fig 1",
  title: `Caja galeno · ${LABEL}`,
  hint: "Mové el puntero para armarla",
  readout: "1/7 troquel plano",
  keys: [
    { mark: "edge", label: "Corte" },
    { mark: "dim", label: "Hendido" },
    { mark: "dashed", label: "Intermitente 5×5" },
    { mark: "lit", label: "La solapa que se está plegando" },
  ],
  caption: `El plano DXF del ${LABEL} plegado por sus propios hendidos${E ? `: el original estirado ${E} mm a lo ancho para un frasco de ${LEN} mm, ${E} mm más largo` : ""}. Un tubo de ${W} × ${D} mm y ${H} mm de alto: frente, dos costados, contrafrente y solapa de pegado. Cada extremo cierra con contratapa, guardapolvos, y una tapa de pared doble cuya pestaña de 10 mm cubre el espesor y cuya lengüeta traba en la ranura de 86 × 10 mm del fondo. El interior, de una sola pieza, forma dos tabiques huecos de 28 mm que sostienen tres frascos alternados: el cuerpo en un agujero de ⌀80 y el cuello en una ranura de ⌀31, con ${255 + E} mm de panel entre tabiques.`,
  body: `<div class="iso-stage" tabindex="0" role="slider" aria-label="Caja galeno: flechas para avanzar o retroceder un paso del armado" aria-valuemin="1" aria-valuemax="7" aria-valuenow="1">${svg}</div>`,
});

const file = theme === "light" ? "caja-galeno-light.html" : "caja-galeno.html";
const page = k.pageHtml({ title: "Caja galeno", theme, body, script: kitScript() + live, width: 720 }).replace("</style>", CSS + "</style>").replace('<html lang="en">', '<html lang="es">');
writeFileSync(join(HERE, file), page);
console.log("wrote", file, (page.length / 1024).toFixed(0) + " KB");
