// Despiece interactivo del altavoz IKEA FREKVENS Portable.
// Datos: desmontaje de iFixit (guía 130948). Unidades del mundo: 1 = 1 mm.
// node build.mjs [--light] [--audit]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";
import * as A from "./kit/audit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const THEME = process.argv.includes("--light") ? "light" : "dark";

const W = 960;
const H = 640;
const AZIMUTH = -40; // de frente y por la derecha, como la foto de catálogo
const ELEVATION = 30;

// ---------- el modelo: medidas y datos reales ----------
const SEAM = 50; // cuerpo inferior 50 x 50 mm / tapa de 34 mm
const T = 1.5; // pared
const BATTERY = { mah: 500, volts: 3.7, wh: 1.85, model: "PT802040" }; // etiqueta de la celda
const SPEAKER = { ohms: 4, watts: 2.5 };

const PIECES = {
  screws: { name: "Tornillos hexagonales", say: "4 tornillos hexagonales · unen las dos mitades", move: [306, 0, 0] },
  knob: { name: "Pomo de volumen", say: "pomo amarillo · encaja a presión en el eje del codificador", move: [0, 0, 102] },
  cap: { name: "Tapa superior", say: "tapa superior · enganchada con clips de plástico", move: [0, 0, 76] },
  front: { name: "Bandeja frontal", say: "bandeja frontal · rejilla y alojamiento del altavoz", move: [234, 0, 0] },
  clip: { name: "Clip", say: "clip de transporte · dos soportes", move: [0, -30, 0] },
  speaker: { name: "Altavoz", say: `altavoz dinámico ⌀30 mm · ${SPEAKER.ohms} Ω · ${String(SPEAKER.watts).replace(".", ",")} W`, move: [166, 0, 0] },
  battery: { name: "Batería", say: `batería Li-ion ${BATTERY.model} · ${BATTERY.mah} mAh · ${String(BATTERY.wh).replace(".", ",")} Wh · JST`, move: [114, 0, 0] },
  aux: { name: "Toma de audio y codificador", say: "toma de 3,5 mm y codificador · placas extraíbles", move: [62, 0, 28] },
  board: { name: "Placa base", say: "placa base · ATS2819 Bluetooth · TP4056 · flash cFeon · microUSB", move: [62, 0, 0] },
  back: { name: "Marco trasero", say: "marco trasero · 4 tetones roscados", move: [0, 0, 0] },
};
const STAGGER = ["screws", "knob", "cap", "front", "clip", "speaker", "battery", "aux", "board", "back"];
const SPRING = { stagger: 0.045, stiffness: 64, damping: 14.2, substeps: 4 };


// Sin base: el encuadre abarca sólo las piezas, montadas y separadas.
const EXTENT = [];
for (const [dx, dy, dz] of Object.values(PIECES).map((p) => p.move).concat([[0, 0, 0]]))
  for (const x of [-13, 13 + 1.6]) for (const y of [-25 - 8.6, 25]) for (const z of [0, 50]) EXTENT.push([x + dx, y + dy, z + dz]);
EXTENT.push([9.2, -16, 94.6 + 102], [-7.6, -13, 94.6 + 102], [13, -25, 84 + 76], [-13, 25, 84 + 76]);
const P = k.fitProjection(EXTENT, W, H, { pad: 34, headroom: 18, azimuth: AZIMUTH, elevation: ELEVATION });
const V = G.viewOf(P);
const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const path = (points3, closed = false) => k.pathOf(points3.map(at), closed);

// El marco trasero es la referencia fija: todo cuelga de ella.
const R = A.recorder(P, { order: STAGGER, spring: SPRING, ground: (shape) => shape.piece === "back" });
const record = R.solid;
function put(piece, ref, svg, shapes, { bias = 0, name } = {}) {
  R.put({ piece, ride: piece, at: ref, bias, svg, move: PIECES[piece].move, shapes, name: name ?? R.nameFor(`${piece}.item`) });
}

// Caja redondeada en planta, vertical.
function box(piece, name, [x0, y0, z0], [x1, y1, z1], { tone = "hi", r = 0.3, steps = 3, bevel = 0, crease, extra = "", inner = "", bias = 0, cut, className } = {}) {
  const plan = { x: x0, y: y0, w: x1 - x0, d: y1 - y0, r };
  const id = R.nameFor(`${piece}.${name}`);
  const shape = record(A.slab(plan, z0, z1 - z0, { name: id, ...(cut ? { cut } : {}) }, steps));
  const body = S(k.slabOf(plan, z0, z1 - z0, P, steps, bevel), { tone, crease, inner });
  put(piece, [(x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2], className ? `<g class="${className}">${body}${extra}</g>` : body + extra, [shape], { bias, name: id });
  return shape;
}

// Planta rectangular con esquinas redondeadas sólo en el lado x0 o x1.
function halfRing(x0, x1, y0, y1, r, side, steps = 4) {
  const arc = (cx, cy, a0) => Array.from({ length: steps + 1 }, (_, i) => {
    const a = a0 + (i / steps) * (Math.PI / 2);
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  if (side === "x0") return [[x1, y0], [x1, y1], ...arc(x0 + r, y1 - r, Math.PI / 2), ...arc(x0 + r, y0 + r, Math.PI)];
  return [...arc(x1 - r, y0 + r, -Math.PI / 2), ...arc(x1 - r, y1 - r, 0), [x0, y1], [x0, y0]];
}
function prism(piece, name, ring, z0, z1, { tone = "hi", bevel = 0, extra = "", inner = "", bias = 0, cut, ref, className } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  const shape = record(A.extruded(ring, z0, z1 - z0, { name: id, ...(cut ? { cut } : {}) }));
  const cx = ring.reduce((s, p) => s + p[0], 0) / ring.length;
  const cy = ring.reduce((s, p) => s + p[1], 0) / ring.length;
  const body = S(k.extrude(ring, z0, z1 - z0, P, { bevel }), { tone, inner }) + extra;
  put(piece, ref ?? [cx, cy, (z0 + z1) / 2], className ? `<g class="${className}">${body}</g>` : body, [shape], { bias, name: id });
  return shape;
}

// Pieza torneada sobre cualquier eje.
function turned(piece, name, F, profile, { tone = "hi", extra = "", inner = "", bias = 0, shape, className } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  const rec = record(shape ? { ...shape, name: id } : A.solid(F, profile, { name: id }));
  const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
  const body = S(G.solidOf(profile, F, P), { tone, inner });
  put(piece, G.add3(F.o, G.mul3(F.a, mid)), className ? `<g class="${className}">${body}${extra}</g>` : body + extra, [rec], { bias, name: id });
  return rec;
}
function post(piece, name, cx, cy, r, z0, z1, { tone = "hi", extra = "", inner = "", bias = 0, bevel = 0, shape, className } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  const rec = record(shape ? { ...shape, name: id } : A.cylinder(cx, cy, r, z0, z1 - z0, { name: id }));
  const body = S(k.cylinder(cx, cy, r, z0, z1 - z0, P, 40, bevel), { tone, inner });
  put(piece, [cx, cy, (z0 + z1) / 2], className ? `<g class="${className}">${body}${extra}</g>` : body + extra, [rec], { bias, name: id });
  return rec;
}

// Cable o varilla: un tubo por tramo, cada trozo ordenado por su profundidad.
function wire(piece, name, route, r, { tone = "hi", free = [false, false], limp = true, maxLength = 8, bundle, className } = {}) {
  const id = R.nameFor(`${piece}.${name}`);
  R.route(id, route, r, { owner: id, limp, free, bundle, piece, move: PIECES[piece].move, ride: piece });
  tubePieces(route, r, P, { maxLength, spacing: 1 }).forEach((part, index) =>
    R.put({ piece, ride: piece, at: part.mid, bias: 0, svg: className ? `<g class="${className}">${tubeSvg(part, { tone })}</g>` : tubeSvg(part, { tone }), move: PIECES[piece].move, shapes: [A.tube(part.points, part.radii)], name: `${id}:${index}`, route: id, chunk: index }),
  );
}

// Puntos en la cara vertical x = const (cara frontal / trasera).
const onX = (x, list) => list.map(([y, z]) => at([x, y, z]));
const holeX = (x, y, z, r, steps = 14) => k.sideRing([x, y, z], r, "x", P, steps);
const holeTop = (cx, cy, r, z, steps = 24) => k.ring(cx, cy, r, z, P, steps);
const voidPath = (d) => `<path class="fk-void" d="${d}"/>`;
const ALONG_X = [1, 0, 0];

// =====================================================================
// Medidas tomadas de la foto de catálogo del F1715 y de las fotos del
// desmontaje (iFixit 130948, pasos 6–8): cuerpo de 50 mm de ancho y 26 mm
// de fondo; abajo un cuerpo casi cuadrado de 50 x 50 mm y encima la tapa,
// un bloque de 34 mm con el logo IKEA®. Mirando de frente, el pomo y el
// clip metálico quedan a la derecha (lado -y del dibujo).
// =====================================================================
const XB = -13; // cara trasera
const XF = 13; // cara frontal
const SPLIT = -5; // junta entre marco trasero y bandeja frontal
const TOP = 84;
const BOSSES = [[-21.3, 5], [21.3, 5], [-21.3, 45], [21.3, 45]];
const STANDOFFS = [[-16.5, 46], [16.5, 46], [-16.5, 37.5], [16.5, 37.5]]; // dentro del marco (z < 50)
const BACK_IN = XB + T;
const BLACK = "fk-m-black";
const GREEN = "fk-m-green";
const METAL = "fk-m-metal";

// ---------- 10 · Marco trasero (no se mueve) ----------
{
  prism("back", "wall", halfRing(XB, BACK_IN, -25, 25, T, "x0", 3), 0, SEAM, { tone: "hi", ref: [XB + T / 2, 0, SEAM / 2], className: BLACK });
  box("back", "side-far", [BACK_IN, -25, 0], [SPLIT, -25 + T, SEAM], { r: 0.1, steps: 2, className: BLACK });
  box("back", "side-near", [BACK_IN, 25 - T, 0], [SPLIT, 25, SEAM], { r: 0.1, steps: 2, className: BLACK });
  box("back", "floor", [BACK_IN, -25 + T, 0], [SPLIT, 25 - T, T], { r: 0.1, steps: 2, tone: "mid", className: BLACK });
  for (const z of [17, 31]) box("back", "rib", [BACK_IN, -23.5, z], [BACK_IN + 1.2, 23.5, z + 1], { tone: "mid", r: 0.1, steps: 2, className: BLACK });
  // etiqueta blanca con código QR (foto del paso 7)
  const qr = [];
  for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) if ((i * 7 + j * 5 + i * j) % 3 !== 0 || i % 8 === 0 || j % 8 === 0) qr.push([-12 + i * 1.05, 4 + j * 1.05]);
  box("back", "qr-label", [BACK_IN, -14, 2.5], [BACK_IN + 0.3, 4, 15.5], {
    tone: "mid",
    r: 0.1,
    steps: 2,
    extra:
      Dots(onX(BACK_IN + 0.3, qr), { size: 0.55, tone: "hi" }) +
      Ln(k.segment([BACK_IN + 0.3, 1.5, 6], [BACK_IN + 0.3, -1, 6], P) + k.segment([BACK_IN + 0.3, 1.5, 9], [BACK_IN + 0.3, -1.6, 9], P) + k.segment([BACK_IN + 0.3, 1.5, 12], [BACK_IN + 0.3, -0.4, 12], P), { tone: "lo", free: true }),
  });
  for (const [y, z] of BOSSES) {
    const F = G.frameAlong([BACK_IN, y, z], ALONG_X);
    turned("back", "boss", F, [[0, 2.2], [SPLIT - BACK_IN, 2.2]], { tone: "mid", className: BLACK, shape: A.ring(F, 0, SPLIT - BACK_IN, 1.0, 2.2), extra: voidPath(holeX(SPLIT, y, z, 1.0, 20)) });
  }
  for (const [y, z] of STANDOFFS) turned("back", "standoff", G.frameAlong([BACK_IN, y, z], ALONG_X), [[0, 1.6], [0.5, 1.6]], { tone: "mid", className: BLACK });
}

// ---------- 9 · Placa base ----------
const FACE = BACK_IN + 1.5; // cara de componentes de la placa (x = -10)
{
  const pads = STANDOFFS.map(([y, z]) => at([FACE, y, z]));
  const rings = STANDOFFS.map(([y, z]) => holeX(FACE, y, z, 1.4, 16)).join("");
  // antena impresa (abajo, en el lado del logo, como en la foto del paso 8)
  const meander = [[-17, 35.4]];
  for (let i = 0; i < 6; i++) {
    const y = -16 + i * 1.6;
    meander.push([y, i % 2 ? 35.4 : 40], [y + 0.8, i % 2 ? 35.4 : 40]);
  }
  meander.push([-6.6, 40]);
  const trace = Ln(k.pathOf(onX(FACE, meander)), { tone: "mid" }) + Dots(onX(FACE, [meander[0], meander[meander.length - 1]]), { size: 0.7, tone: "hi" });
  const tracks = [
    [[0, 63], [3.5, 63], [3.5, 64], [5.5, 64]],
    [[-3, 60], [-3, 59.6], [8, 59.6], [8, 60]],
    [[-11, 62], [-11, 67.5], [-9, 67.5]],
  ];
  const trackSvg = tracks.map((t) => Ln(k.pathOf(onX(FACE, t)), { tone: "faint" })).join("") + Dots(onX(FACE, tracks.flatMap((t) => [t[0], t[t.length - 1]])), { size: 0.45, tone: "mid" });
  box("board", "pcb", [FACE - 1, -18.5, 34], [FACE, 18.5, 72], { tone: "hi", r: 0.6, steps: 2, className: GREEN, extra: Ln(rings, { tone: "lo" }) + Dots(pads, { size: 0.55 }) + trace + trackSvg });
  box("board", "pcb-neck", [FACE - 1, -11.5, 72], [FACE, 11.5, 82], { tone: "hi", r: 0.6, steps: 2, className: GREEN });

  const chip = (name, y0, y1, z0, z1, depth, opts = {}) => box("board", name, [FACE, y0, z0], [FACE + depth, y1, z1], { r: 0.2, steps: 2, tone: "hi", ...opts });
  // bloque de espuma negra entre la placa y la batería
  chip("foam", -18, 18, 41, 59, 5.5, { tone: "mid", r: 1, steps: 3, className: BLACK, extra: Dots(Array.from({ length: 60 }, (_, i) => at([FACE + 5.5, -17 + (i % 20) * 1.8, 43 + Math.floor(i / 20) * 6 + (i % 2) * 1.5])), { size: 0.4, tone: "hi" }) });
  chip("ats2819", -6, 0, 60, 66, 0.8, { className: BLACK, extra: Dots([at([FACE + 0.8, -5.2, 65.2])], { size: 0.5, tone: "hi" }) });
  const soic = (name, y0, y1, z0, z1) => {
    const legs = [];
    const feet = [];
    for (let i = 0; i < 4; i++) {
      const z = z0 + 0.8 + i * ((z1 - z0 - 1.6) / 3);
      legs.push(k.segment([FACE + 0.3, y0, z], [FACE + 0.3, y0 - 0.9, z], P), k.segment([FACE + 0.3, y1, z], [FACE + 0.3, y1 + 0.9, z], P));
      feet.push([y0 - 0.9, z], [y1 + 0.9, z]);
    }
    chip(name, y0, y1, z0, z1, 1.3, { className: BLACK, extra: Ln(legs.join(""), { tone: "mid" }) + Dots(onX(FACE + 0.3, feet), { size: 0.4, tone: "mid" }) + Dots([at([FACE + 1.3, y0 + 0.7, z1 - 0.7])], { size: 0.4, tone: "hi" }) });
  };
  soic("flash", -15, -11, 59.6, 65.6); // cFeon Q80B
  soic("tp4056", 5.5, 9.5, 59.6, 65.6); // cargador Li-ion
  chip("inductor", 11, 16, 63, 68, 2.2, { tone: "mid", className: BLACK, extra: Ln(holeX(FACE + 2.2, 13.5, 65.5, 1.6, 16), { tone: "lo" }) });
  chip("crystal", 1.5, 5, 66.5, 69, 1.1, { r: 0.8, steps: 4, className: METAL });
  for (const [y, z, w] of [[-9, 67, 1.6], [-7, 67, 1.6], [1.5, 61, 1.2], [3.3, 61, 1.2], [-17, 67, 1.2], [6, 76, 1.2], [-9.5, 76, 1.2], [14.5, 69.5, 1.2], [-16.5, 69.5, 1.2]])
    chip("smd", y, y + w, z, z + 0.9, 0.6, { tone: "mid", crease: "none" });
  // condensador electrolítico tumbado
  const CAPF = G.frameAlong([FACE, -4, 70], ALONG_X);
  turned("board", "elcap", CAPF, [[0, 2.4], [5.2, 2.4]], { tone: "hi", className: BLACK, inner: Ln(G.arcOf(CAPF, 1.2, 2.4, P), { tone: "faint" }), extra: Ln(k.segment(G.pointOf(CAPF, 5.2, 2.0, Math.PI / 2), G.pointOf(CAPF, 5.2, 2.0, -Math.PI / 2), P), { tone: "lo" }) });
  // micro-USB en el canto superior, boca hacia arriba
  box("board", "microusb", [FACE, -3.5, 75], [FACE + 2.7, 4, 82.4], { tone: "hi", r: 0.5, steps: 2, bevel: 0.3, className: METAL, extra: voidPath(k.planOutline({ x: FACE + 0.7, y: -2.7, w: 1.3, d: 5.9, r: 0.5 }, 82.4, P, 3)) });
  // pulsador de encendido (soldado a la placa)
  box("board", "button", [FACE, 7.6, 77.5], [FACE + 2.8, 10.6, 80], { tone: "mid", r: 0.3, className: METAL });
  post("board", "button-stem", FACE + 1.4, 9.1, 0.9, 80, 81.4, { tone: "hi", className: BLACK });
  // conectores JST de batería y altavoz (abajo)
  box("board", "jst-battery", [FACE, -4, 35], [-3, 1, 39.5], { tone: "mid", r: 0.3 });
  box("board", "jst-speaker", [FACE, 12, 35], [FACE + 3.5, 17, 39.5], { tone: "mid", r: 0.3 });
  // cabezales para las dos placas auxiliares
  box("board", "header-jack", [FACE, 12, 68.5], [FACE + 1, 17, 71], { tone: "mid", r: 0.2, className: BLACK });
  box("board", "header-enc", [FACE, -17, 66.5], [FACE + 1, -12, 69], { tone: "mid", r: 0.2, className: BLACK });
}

// ---------- 8 · Placas auxiliares: toma de 3,5 mm y codificador ----------
const JACK = [-1, 15.5];
const ENC = [-1, -14.5];
{
  const solder = (y0, y1, z) => Dots([[FACE + 3, y0], [FACE + 3, y1], [5, y0], [5, y1]].map(([x, y]) => at([x, y, z])), { size: 0.5, tone: "hi" });
  box("aux", "jack-pcb", [FACE + 1, 9.5, 71], [7, 21, 72], { tone: "hi", r: 0.6, steps: 2, className: GREEN, extra: solder(10.8, 20, 72) });
  box("aux", "jack-body", [-4.6, 11.4, 72], [2.6, 19.6, 78.4], { tone: "mid", r: 0.5, steps: 2, bevel: 0.3, className: BLACK, extra: voidPath(holeTop(JACK[0], JACK[1], 2.0, 78.4)) });
  box("aux", "enc-pcb", [FACE + 1, -21, 69], [7, -7, 70], { tone: "hi", r: 0.6, steps: 2, className: GREEN, extra: solder(-20, -8.4, 70) });
  // funda de goma negra alrededor del codificador (foto del paso 8)
  box("aux", "enc-boot", [-8.2, -20.6, 70], [6.2, -7.6, 75.2], { tone: "mid", r: 1.6, steps: 3, className: BLACK });
  box("aux", "enc-body", [-6, -19.5, 75.2], [4, -9.5, 77], { tone: "hi", r: 0.3, steps: 2, className: METAL, extra: Dots([at([-5.2, -18.7, 77]), at([3.2, -10.3, 77])], { size: 0.45 }) });
  post("aux", "enc-bushing", ENC[0], ENC[1], 3.4, 77, 79.4, { tone: "mid", className: METAL, inner: Ln([77.8, 78.6].map((z) => k.sideArc(ENC[0], ENC[1], 3.4, z, P, 24)).join(""), { tone: "lo" }) });
  post("aux", "enc-shaft", ENC[0], ENC[1], 3, 79.4, 87, {
    tone: "hi",
    className: METAL,
    inner: Ln(k.knurl(ENC[0], ENC[1], 3, 83, 86.6, 22, P, 0.25), { tone: "lo" }) + Ln(k.sideArc(ENC[0], ENC[1], 3, 83, P, 20), { tone: "faint" }),
    extra: Ln(k.lineOnTop([ENC[0] - 2.6, ENC[1]], [ENC[0] + 2.6, ENC[1]], 87, P), { tone: "lo" }),
  });
}

// ---------- 7 · Batería PT802040 ----------
const CELL = { x0: -4.5, x1: 3.5, y0: -20, y1: 20, z0: 40, z1: 60 };
{
  const fx = CELL.x1;
  const wrap = k.segment([fx, -13.5, CELL.z0], [fx, -13.5, CELL.z1], P) + k.segment([fx, -13.5, CELL.z1], [CELL.x0, -13.5, CELL.z1], P);
  const rules = [[-9.5, 56.1, 18], [-9.5, 53.9, 12], [-9.5, 51.7, 15], [-9.5, 49.5, 10], [-9.5, 47.3, 14]].map(([y, z, len]) => k.segment([fx, y, z], [fx, y + len, z], P)).join("");
  const qr = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) if ((i + 2 * j + i * j) % 3) qr.push([12 + i * 0.9, 42 + j * 0.9]);
  box("battery", "cell", [CELL.x0, CELL.y0, CELL.z0], [CELL.x1, CELL.y1, CELL.z1], {
    tone: "hi",
    r: 1.2,
    steps: 3,
    bevel: 0.5,
    className: "fk-m-label",
    inner: Ln(wrap, { tone: "faint" }),
    extra: Ln(rules, { tone: "lo", free: true }) + Dots(onX(fx, qr), { size: 0.4, tone: "mid" }),
  });
  // cinta de kapton ámbar sobre el circuito de protección
  box("battery", "pcm", [CELL.x0 + 1, -20.8, 41.5], [CELL.x1 - 1, -20, 51], { tone: "mid", r: 0.2, steps: 2, className: "fk-m-amber" });
  box("battery", "jst-plug", [-4.2, -7.2, 35.4], [-0.4, -4, 39.1], { tone: "hi", r: 0.3 });
  [["fk-m-red", -3.0], [BLACK, -1.2]].forEach(([cls, x]) => {
    const route = G.fillet([[x, -20.8, 42], [x, -22.2, 42], [x, -22.2, 37.25], [x, -7.2, 37.25]], 1.2, 7);
    wire("battery", "lead", route, 0.45, { free: [false, true], bundle: "battery.leads", className: cls });
  });
}

// ---------- 6 · Altavoz con aro de fijación de 3 patas ----------
const SPK = G.frameAlong([-0.5, 0, 22], ALONG_X);
const SPK_FRONT = 12; // cara delantera en x = 11.5, contra la pared frontal
{
  const profile = [[0, 5.5], [4, 5.5], [4, 6.6], [5, 6.6], [5, 7.2], [9.5, 14.2], [9.5, 15], [SPK_FRONT, 15]];
  const face = (r, tone) => Ln(G.circleOf(SPK, SPK_FRONT, r, P, 72), { tone });
  const cone = `<path class="fk-cone" d="${G.circleOf(SPK, SPK_FRONT, 13, P, 72)}"/><path class="fk-cap" d="${G.circleOf(SPK, SPK_FRONT, 5, P, 48)}"/>`;
  turned("speaker", "driver", SPK, profile, {
    tone: "hi",
    className: METAL,
    inner: Ln(G.arcOf(SPK, 4, 5.5, P), { tone: "faint" }),
    extra: cone + face(14.3, "mid") + face(13, "mid") + face(12, "lo") + face(11, "lo") + face(8.4, "faint") + face(6.6, "faint") + face(5, "mid") + face(2.8, "faint"),
  });
  const LUGS = [Math.PI / 6, (5 * Math.PI) / 6, (3 * Math.PI) / 2];
  const RINGF = G.frameOf([-0.5, 0, 22], ALONG_X, [0, 1, 0], [0, 0, 1]);
  for (const a of LUGS) {
    const F = G.frameAlong(G.pointOf(RINGF, 9.5, 17, a), ALONG_X);
    turned("speaker", "lug", F, [[-1.5, 2.4], [0, 2.4]], { tone: "mid", className: BLACK });
    turned("speaker", "lug-screw", F, [[-2.7, 1.2], [-1.5, 1.2]], { tone: "hi", bias: 0.4, className: BLACK, extra: voidPath(k.pathOf(Array.from({ length: 6 }, (_, i) => at(G.pointOf(F, -2.7, 0.5, (i * Math.PI) / 3))), true)) });
  }
  box("speaker", "terminal", [9, -3, 36.9], [11.5, 3, 39.4], { tone: "mid", r: 0.2, steps: 2, extra: Dots([at([10.25, -1.6, 39.4]), at([10.25, 1.6, 39.4])], { size: 0.6, tone: "hi" }) });
  const pores = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 12; j++) pores.push(at([0.8 + i * 1.0 + (j % 2) * 0.4, -12.6 + j * 2.25, 6]));
  box("speaker", "foam", [0, -14, T], [5.6, 14, 6], { tone: "mid", r: 1.2, steps: 3, className: BLACK, extra: Dots(pores, { size: 0.45, tone: "hi" }) });
  box("speaker", "plug", [FACE + 3.5, 12.5, 35.3], [-4, 16.5, 39.2], { tone: "hi", r: 0.3 });
  [["fk-m-red", 37.4], [BLACK, 38.4]].forEach(([cls, z]) => {
    const route = G.fillet([[9, 0, z], [3, 0, z], [3, 14.5, z], [-4, 14.5, z]], 2, 7, { P, tube: 0.45 });
    wire("speaker", "lead", route, 0.45, { free: [false, true], bundle: "speaker.leads", className: cls });
  });
}

// ---------- 4 · Bandeja frontal con rejilla ----------
const FRONT_IN = XF - T;
const SCREW_CUT = () => BOSSES.map(([y, z]) => A.disc(G.frameAlong([0, y, z], ALONG_X), -20, 20, 1.05, { name: "cut" }));
{
  const holes = [];
  const pitch = 2.3;
  for (let row = -7; row <= 7; row++) {
    const z = 22 + row * pitch * 0.866;
    for (let col = -7; col <= 7; col++) {
      const y = col * pitch + (row % 2 ? pitch / 2 : 0);
      if (Math.hypot(y, z - 22) <= 12.2) holes.push(holeX(XF, y, z, 0.85, 12));
    }
  }
  const grille = `<path class="fk-void" d="${holes.join("")}"/>`;
  const screwHoles = Ln(BOSSES.map(([y, z]) => holeX(XF, y, z, 2.1, 18)).join(""), { tone: "faint" });
  prism("front", "face", halfRing(FRONT_IN, XF, -25, 25, T, "x1", 3), 0, SEAM, { tone: "hi", className: BLACK, cut: SCREW_CUT(), extra: grille + screwHoles, ref: [XF - T / 2, 0, SEAM / 2] });
  box("front", "side-far", [SPLIT, -25, 0], [FRONT_IN, -25 + T, SEAM], { r: 0.1, steps: 2, className: BLACK });
  box("front", "side-near", [SPLIT, 25 - T, 0], [FRONT_IN, 25, SEAM], { r: 0.1, steps: 2, className: BLACK });
  box("front", "floor", [SPLIT, -25 + T, 0], [FRONT_IN, 25 - T, T], { r: 0.1, steps: 2, tone: "mid", className: BLACK });
  for (const z of [12, 24, 36]) box("front", "rib", [SPLIT + 2, -23.5, z], [FRONT_IN, -22.6, z + 0.8], { tone: "mid", r: 0.1, steps: 2, className: BLACK });
}

// ---------- 5 · Tornillos hexagonales M2 (4, negros) ----------
for (const [y, z] of BOSSES) {
  const F = G.frameAlong([XF, y, z], ALONG_X);
  const hex = Array.from({ length: 6 }, (_, i) => at(G.pointOf(F, 1.6, 0.85, (i * Math.PI) / 3 + 0.3)));
  turned("screws", "shank", F, [[-18, 1.0], [0, 1.0]], { tone: "hi", className: BLACK, inner: Ln([-16.5, -15, -13.5, -12, -10.5, -9, -7.5, -6, -4.5].map((s) => G.arcOf(F, s, 1.0, P)).join(""), { tone: "faint" }) });
  turned("screws", "head", F, [[0, 1.9], [1.6, 1.9]], { tone: "hi", bias: 0.5, className: BLACK, extra: voidPath(k.pathOf(hex, true)) });
}

// ---------- 3 · Tapa superior y 2 · pomo amarillo ----------
{
  const holes =
    voidPath(holeTop(JACK[0], JACK[1], 2.3, TOP)) +
    voidPath(k.planOutline({ x: FACE + 0.5, y: -3.1, w: 1.7, d: 6.7, r: 0.7 }, TOP, P, 3)) +
    voidPath(holeTop(ENC[0], ENC[1], 3.7, TOP, 32));
  // logo blanco a la izquierda, justo encima de la junta (foto de catálogo)
  const logo = `<g class="fk-logo">${k.faceTextSvg(k.sideMatrix([XF, 21.5, 0], 56.2, P, "right"), "IKEA", { size: 7.6 })}${k.faceTextSvg(k.sideMatrix([XF, 4.6, 0], 61.4, P, "right"), "®", { size: 3 })}</g>`;
  const cuts = [A.cylinder(JACK[0], JACK[1], 3.05, TOP - 3, 4), A.cylinder(ENC[0], ENC[1], 3.65, TOP - 3, 4)];
  const id = R.nameFor("cap.shell");
  const shapes = [
    record(A.slab({ x: XB, y: -25, w: XF - XB, d: 50, r: T }, TOP - T, T, { name: `${id}.top`, cut: cuts }, 3)),
    record(A.box([XB, -25, SEAM], [XF, -25 + T, TOP - T], { name: `${id}.far` })),
    record(A.box([XB, 25 - T, SEAM], [XF, 25, TOP - T], { name: `${id}.near` })),
    record(A.box([XB, -25 + T, SEAM], [XB + T, 25 - T, TOP - T], { name: `${id}.back` })),
    record(A.box([XF - T, -25 + T, SEAM], [XF, 25 - T, TOP - T], { name: `${id}.front` })),
  ];
  // taladros del extremo derecho donde se atornilla el clip
  const side = voidPath(k.sideRing([-1, -25, 60], 0.9, "y", P, 14) + k.sideRing([-1, -25, 76], 0.9, "y", P, 14));
  put("cap", [0, 0, (SEAM + TOP) / 2], `<g class="${BLACK}">${S(k.slabOf({ x: XB, y: -25, w: XF - XB, d: 50, r: T }, SEAM, TOP - SEAM, P, 3, 0.6), { tone: "hi" }) + holes + side}</g>` + logo, shapes, { name: id });
  for (const s of [-1, 1]) {
    const y0 = s > 0 ? 22.5 : -23.5;
    box("cap", "clip-tab", [2, y0, 44], [9, y0 + 1, SEAM], { tone: "mid", r: 0.2, steps: 2, className: BLACK });
    const h0 = s > 0 ? 21.7 : -22.5;
    box("cap", "clip-hook", [2, h0, 47.5], [9, h0 + 0.8, 49.5], { tone: "mid", r: 0.2, steps: 2, className: BLACK });
  }
  // pomo amarillo: cilindro con una barra de agarre que sobresale por delante
  const FZ = G.frameOf([ENC[0], ENC[1], 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const kid = R.nameFor("knob.body");
  const kshapes = [record(A.ring(FZ, TOP, TOP + 3.6, 3, 7.5, { name: `${kid}.bore` })), record(A.disc(FZ, TOP + 3.6, TOP + 8, 7.5, { name: `${kid}.cap` }))];
  put("knob", [ENC[0], ENC[1], TOP + 4], `<g class="fk-yellow">${S(k.cylinder(ENC[0], ENC[1], 7.5, TOP, 8, P, 56, 0.6), { tone: "hi" })}</g>`, kshapes, { name: kid });
  box("knob", "grip", [ENC[0] - 6.6, ENC[1] - 1.5, TOP + 8], [ENC[0] + 10.2, ENC[1] + 1.5, TOP + 10.6], { tone: "hi", r: 1.2, steps: 3, bevel: 0.3, className: "fk-yellow" });
  box("knob", "grip-nose", [ENC[0] + 7.5, ENC[1] - 1.5, TOP + 2.6], [ENC[0] + 10.2, ENC[1] + 1.5, TOP + 8], { tone: "hi", r: 0.6, steps: 2, className: "fk-yellow" });
}

// ---------- Clip metálico en el extremo derecho de la tapa ----------
{
  for (const zc of [60, 76]) {
    box("clip", "mount", [-4.5, -27, zc - 3], [2.5, -25, zc + 3], { tone: "mid", r: 0.6, steps: 2, bevel: 0.3, className: METAL, extra: Dots([at([-1, -27, zc])], { size: 0.6, tone: "lo" }) });
    box("clip", "arm", [-2.5, -32, zc - 1], [0.5, -27, zc + 1], { tone: "hi", r: 0.4, steps: 2, className: METAL });
  }
  box("clip", "strap", [-2.5, -33.6, 58.8], [0.5, -32, 77.2], { tone: "hi", r: 0.6, steps: 2, bevel: 0.3, className: METAL });
}

// ---------- orden de pintado, datos y página ----------
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item, index) => {
  const [mx, my, mz] = item.move;
  return `<g class="it" data-piece="${item.piece}" data-k="${item.key.toFixed(2)}" data-m="${mx.toFixed(1)},${my.toFixed(1)},${mz.toFixed(1)}" data-i="${index}">${item.svg}</g>`;
});

const unit = (vector) => {
  const o = at([0, 0, 0]);
  const p = at(vector);
  return [p[0] - o[0], p[1] - o[1]];
};
const ORDER = ["knob", "cap", "aux", "board", "battery", "speaker", "front", "screws", "clip", "back"];
const DATA = {
  V,
  EX: unit([1, 0, 0]),
  EY: unit([0, 1, 0]),
  EZ: unit([0, 0, 1]),
  pieces: Object.fromEntries(Object.entries(PIECES).map(([id, piece]) => [id, { name: piece.name, say: piece.say }])),
  stagger: STAGGER,
  spring: SPRING,
  order: ORDER,
  rest: "FREKVENS Portable · 5 × 10 cm · montado",
  apart: `despiece · ${ORDER.length} conjuntos`,
};

const LABEL =
  "Despiece del altavoz Bluetooth IKEA FREKVENS Portable. Montado es una caja negra de unos 5 por 10 cm con un pomo amarillo arriba. Al separarse, el pomo y la tapa superior suben, y hacia delante salen los cuatro tornillos hexagonales, la bandeja frontal con la rejilla, el altavoz de 4 ohmios y 2,5 vatios, la batería de 500 mAh con su conector JST, las placas de la toma de audio y del codificador, y la placa base con el chip ATS2819 y el puerto microUSB. El marco trasero queda quieto y el clip sale por un lado.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body: [`<g class="fk-parts">${groups.join("")}</g>`] });
const PARTS = ORDER.map((id, index) => `<button type="button" class="fk-part" data-part="${id}"><span class="fk-num">${String(index + 1).padStart(2, "0")}</span>${PIECES[id].name}</button>`).join("");
const corners = `<div class="iso-plate-corners" aria-hidden="true"><span class="iso-plate-corner" data-corner="fig">Fig 1</span><span class="iso-plate-corner" data-corner="title">IKEA FREKVENS Portable · despiece</span><span class="iso-plate-corner" data-corner="hint" data-hint>Pasa el cursor para despiezar</span><span class="iso-plate-corner" data-corner="readout" data-readout>${DATA.rest}</span></div>`;
const stage = `<div class="fk-stage" tabindex="0" role="slider" aria-label="Despiece del FREKVENS Portable. Pasa el cursor o usa las flechas para separar las piezas una a una; Espacio abre o cierra, Escape lo vuelve a montar." aria-valuemin="0" aria-valuemax="${ORDER.length}" aria-valuenow="0" aria-valuetext="${DATA.rest}">${svg}</div>`;
const caption = `Desmontaje según iFixit. La tapa superior sale con púas de apertura porque está enganchada con clips de plástico; cuatro tornillos hexagonales unen la bandeja frontal con el marco trasero. Dentro: un altavoz dinámico de ${SPEAKER.ohms} Ω y ${String(SPEAKER.watts).replace(".", ",")} W sujeto con un aro de tres patas, una batería de iones de litio ${BATTERY.model} de ${BATTERY.mah} mAh a ${String(BATTERY.volts).replace(".", ",")} V (${String(BATTERY.wh).replace(".", ",")} Wh según su etiqueta) envuelta en espuma y enchufada con un conector JST, y la placa base con el ATS2819 de Actions (Bluetooth y audio en un chip), una flash cFeon Q80B y el cargador TP4056. La toma de 3,5 mm y el codificador de volumen van en placas que se extraen por separado; el microUSB y el pulsador de encendido están soldados a la placa base.`;
const body = `<figure class="iso-figure fk"><div class="iso-plate">${corners}${stage}</div><figcaption class="iso-legend"><span class="fk-parts-list">${PARTS}</span><span class="iso-caption">${caption}</span></figcaption></figure>`;

const CSS = readFileSync(join(HERE, "fk.css"), "utf8");
const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA));
const page = k.pageHtml({ title: "IKEA FREKVENS Portable · despiece", theme: THEME, body: `<style>${CSS}</style>${body}`, script: LIVE, width: 1000 }).replace('<html lang="en">', '<html lang="es">');
const name = THEME === "light" ? "frekvens-portable-light.html" : "frekvens-portable.html";
writeFileSync(join(HERE, name), page);

// Versión para publicar como Artifact: sin esqueleto propio y con el tema del visor.
// Claro por defecto; los valores oscuros del kit y de fk.css se copian bajo prefers-color-scheme y data-theme.
if (THEME === "light") {
  const blockOf = (css, selector) => {
    const at = css.indexOf(`${selector}{`) >= 0 ? css.indexOf(`${selector}{`) : css.indexOf(`${selector} {`);
    return css.slice(css.indexOf("{", at) + 1, css.indexOf("}", at));
  };
  const darkKit = blockOf(k.ISO_CSS, "\n.iso");
  const darkFk = blockOf(CSS, ".fk");
  // reglas de fk.css escritas para el tema oscuro del kit (.iso sin data-theme="light")
  const darkRules = [...CSS.matchAll(/\.iso:not\(\[data-theme="light"\]\)([^{]*)\{([^}]*)\}/g)].map(([, sel, decl]) => `.iso[data-theme="light"]${sel}{${decl}}`).join("");
  const dark = `.iso[data-theme="light"]{${darkKit}}.iso[data-theme="light"] .fk{${darkFk}}${darkRules}`;
  const scoped = (prefix) => dark.replace(/\.iso\[data-theme="light"\]/g, `${prefix} .iso[data-theme="light"]`);
  const shell = `
:root{--fk-page:#f2f2ef}
@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--fk-page:#0b0b0b;color-scheme:dark}${scoped(':root:not([data-theme="light"])')}}
:root[data-theme="dark"]{--fk-page:#0b0b0b;color-scheme:dark}
${scoped(':root[data-theme="dark"]')}
body{background:var(--fk-page)}
.fk-page{box-sizing:border-box;max-width:1032px;margin:0 auto;padding-block:40px 64px;padding-left:max(16px, env(safe-area-inset-left, 0px));padding-right:max(16px, env(safe-area-inset-right, 0px));background:var(--anatomy-page);color:var(--anatomy-text);font:14px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;-webkit-font-smoothing:antialiased}
.fk-page *{box-sizing:border-box}
`;
  const artifact = `<title>FREKVENS Portable</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>${k.ISO_CSS}${shell}</style>
<style>${CSS}</style>
<main class="iso fk-page" data-theme="light">${body}</main>
<script type="module">${LIVE.replace(/<\/(script)/gi, "<\\/$1")}</script>
`;
  writeFileSync(join(HERE, "frekvens-portable-artifact.html"), artifact);
  console.log("wrote frekvens-portable-artifact.html");
}
console.log("wrote", name, `${(page.length / 1024).toFixed(0)} KB`, `${R.items.length} items`, `${R.solids.length} solids`);

// Pares anidados que sólo existen montados, ocultos por las carcasas cerradas:
// la caña del tornillo dentro de su tetón y del agujero frontal, y la placa dentro de la tapa.
A.auditOrExit(R, P, {
  allow: [
    ["screws.shank*", "front.face*"],
    ["screws.shank*", "back.boss*"],
    ["cap.shell*", "board.*"],
    ["cap.shell*", "aux.*"],
    ["cap.shell*", "battery.*"],
  ],
});
