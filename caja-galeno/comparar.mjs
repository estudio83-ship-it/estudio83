// Lámina comparativa acotada: troquel 6463 original y +E, a la misma escala.
// node comparar.mjs [mm=50]  →  comparacion.html (página) y troquel-6463-comparacion.dxf (ambos planos acotados)
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import { ISO_CSS } from "./kit/iso-kit.mjs";
import { stretchDxf, stretchOf } from "./estirar.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const E = Number(process.argv[2] ?? 50);
const SRC = join(HERE, "troquel-6463.dxf");

// ---------- Cotas, en coordenadas del plano original ----------
// h: cota horizontal entre x de los puntos, dibujada a la altura `at` (y);
// v: cota vertical entre y de los puntos, dibujada en `at` (x).
const H = (x0, x1, at, name) => ({ dir: "h", a: [x0, at], b: [x1, at], at, name });
const V = (y0, y1, at, name) => ({ dir: "v", a: [at, y0], b: [at, y1], at, name });
const chainH = (xs, at, names) => xs.slice(1).map((x, i) => H(xs[i], x, at, names[i]));
const chainV = (ys, at, names) => ys.slice(1).map((y, i) => V(ys[i], y, at, names[i]));
const DIMS = [
  ...chainH([67.1, 161.1, 484.1, 578.1, 898.1, 989.1], 455, ["costado", "frente", "costado", "contrafrente", "pegado"]),
  H(997.1, 1265.1, 455, "interior"),
  H(67.1, 989.1, 395, "caja"),
  H(67.1, 1265.1, 335, "plano total"),
  H(233.6, 418.3, 1135, "contratapa"),
  H(586.1, 889.1, 1260, "lengüeta"),
  ...chainV([530, 620, 630, 724, 1020, 1114, 1124, 1214], 640, ["lengüeta", "pestaña", "tapa", "contrafrente", "tapa", "pestaña", "lengüeta"]),
  V(735, 1009, 300, "frente"),
  ...chainV([556, 644, 672, 760, 1015, 1103, 1131, 1219], 1310, ["pared", "puente", "tabique", "panel", "tabique", "puente", "pared"]),
  V(556, 1219, 1375, "interior"),
  V(525, 1219, 1440, "plano total"),
];

function dimsFor(e) {
  const map = stretchOf(e);
  // El punto «a» lleva la regla de estiramiento por su lado; las cotas sobre la pieza interior se corren con ella.
  return DIMS.map((d) => {
    const inInsert = d.dir === "v" && d.at > 990;
    const a = inInsert ? map([1100, d.a[1]]) : map(d.a);
    const b = inInsert ? map([1100, d.b[1]]) : map(d.b);
    if (d.dir === "h") return { ...d, x0: a[0], x1: b[0], at: d.at, value: b[0] - a[0] };
    const at = d.at > 990 ? d.at + e : map([d.at, 800])[0];
    return { ...d, y0: a[1], y1: b[1], at, value: b[1] - a[1] };
  });
}

const PLANS = [
  { e: 0, name: "Original", file: "troquel-6463.dxf", items: stretchDxf(SRC, 0), dims: dimsFor(0) },
  { e: E, name: `+${E} mm`, file: `troquel-6463-mas${E}.dxf`, items: stretchDxf(SRC, E), dims: dimsFor(E) },
];
PLANS[1].dims.forEach((d, i) => (d.changed = Math.abs(d.value - PLANS[0].dims[i].value) > 0.05));

const fmt = (v) => (Math.abs(v - Math.round(v)) < 0.05 ? String(Math.round(v)) : v.toFixed(1));

// ---------- Plano en SVG (mm, y hacia arriba) ----------
const BOX = { x0: -60 - E, x1: 1480 + E, y0: 300, y1: 1300 };
function planSvg(plan) {
  const Y = (y) => BOX.y1 - y;
  const f = (v) => (Math.round(v * 10) / 10).toString();
  const paths = { 1: [], 2: [], 6: [] };
  for (const it of plan.items) {
    if (it.type === "LINE") paths[it.color]?.push(`M${f(it.a[0])} ${f(Y(it.a[1]))}L${f(it.b[0])} ${f(Y(it.b[1]))}`);
    else {
      const a0 = (it.a0 * Math.PI) / 180, a1 = (it.a1 * Math.PI) / 180;
      let sweep = a1 - a0;
      if (sweep <= 0) sweep += 2 * Math.PI;
      const p0 = [it.c[0] + it.r * Math.cos(a0), it.c[1] + it.r * Math.sin(a0)];
      const p1 = [it.c[0] + it.r * Math.cos(a1), it.c[1] + it.r * Math.sin(a1)];
      paths[it.color]?.push(`M${f(p0[0])} ${f(Y(p0[1]))}A${f(it.r)} ${f(it.r)} 0 ${sweep > Math.PI ? 1 : 0} 0 ${f(p1[0])} ${f(Y(p1[1]))}`);
    }
  }
  const dims = plan.dims.map((d) => {
    const cls = d.changed ? "dim changed" : "dim";
    const t = fmt(d.value);
    if (d.dir === "h") {
      const y = Y(d.at), xm = (d.x0 + d.x1) / 2;
      return `<g class="${cls}"><path d="M${f(d.x0)} ${f(y - 9)}V${f(y + 9)}M${f(d.x1)} ${f(y - 9)}V${f(y + 9)}M${f(d.x0)} ${f(y)}H${f(d.x1)}"/>${arrows(d.x0, y, d.x1, y)}<text x="${f(xm)}" y="${f(y - 7)}">${t}</text></g>`;
    }
    const x = d.at, ym = Y((d.y0 + d.y1) / 2);
    return `<g class="${cls}"><path d="M${f(x - 9)} ${f(Y(d.y0))}H${f(x + 9)}M${f(x - 9)} ${f(Y(d.y1))}H${f(x + 9)}M${f(x)} ${f(Y(d.y0))}V${f(Y(d.y1))}"/>${arrows(x, Y(d.y0), x, Y(d.y1))}<text x="${f(x - 7)}" y="${f(ym)}" transform="rotate(-90 ${f(x - 7)} ${f(ym)})">${t}</text></g>`;
  });
  // Llamadas a los detalles que no cambian.
  const notes = [
    [plan.e + 1218.1, 1059, "⌀80"],
    [plan.e + 1045.1, 716, "⌀31"],
    [741.5 + plan.e, 990, "86×10"],
  ].map(([x, y, t]) => `<text class="note" x="${f(x)}" y="${f(Y(y) + 4)}">${t}</text>`);
  return `<svg class="plan" viewBox="${BOX.x0} 0 ${BOX.x1 - BOX.x0} ${BOX.y1 - BOX.y0}" role="img" aria-label="Plano acotado del troquel 6463 ${plan.name}">
<path class="cut" d="${paths[1].join("")}"/><path class="crease" d="${paths[2].join("")}"/><path class="perf" d="${paths[6].join("")}"/>
${dims.join("")}${notes.join("")}</svg>`;
}
function arrows(x0, y0, x1, y1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, s = Math.min(9, L / 4), w = s * 0.35;
  const head = (x, y, dx, dy) => `M${x} ${y}L${x + dx * s - dy * w} ${y + dy * s + dx * w}L${x + dx * s + dy * w} ${y + dy * s - dx * w}Z`;
  return `<path class="arrow" d="${head(x0, y0, ux, uy)}${head(x1, y1, -ux, -uy)}"/>`;
}

// ---------- Las dos cajas armadas, isométricas y acotadas ----------
const DEPTH = 94, LONG = 276;
const boxes = PLANS.map((p, i) => ({ ...p, W: 320 + p.e, x: i === 0 ? 0 : 320 + 160 }));
const allPts = boxes.flatMap((b) => k.boxCorners({ x: b.x, y: 0, w: b.W, d: LONG, r: 1 }, 0, DEPTH));
const P = k.fitProjection([...allPts, [boxes[1].x + boxes[1].W + 60, LONG + 60, 0], [-60, -60, 0]], 640, 300, { pad: 28, azimuth: 58, elevation: 30 });
function isoBoxes() {
  const pt = (p) => k.iso(p, P);
  const out = [];
  for (const b of boxes) {
    const plan = { x: b.x, y: 0, w: b.W, d: LONG, r: 1.5 };
    out.push(`<path class="iso-halo" d="${k.haloOf(plan, 0, DEPTH, P)}"/>`);
    out.push(k.solidSvg(k.slabOf(plan, 0, DEPTH, P, 2, 0.8), { tone: "hi", inner: k.lineSvg(k.sideSeam(plan, DEPTH - 10, P, 2), { tone: "faint" }) }));
    const inset = k.insetPlan(plan, 14);
    out.push(k.lineSvg(k.planOutline(inset, DEPTH, P, 2), { tone: "lo" }));
    for (const [yy, len] of [[200, 0.55], [186, 0.75], [120, 0.4]]) out.push(k.lineSvg(k.lineOnTop([inset.x + 20, yy], [inset.x + 20 + inset.w * len, yy], DEPTH, P), { tone: "mid", free: true }));
    // Cotas: ancho sobre la arista cercana, profundidad en la esquina, largo sobre el costado.
    const dim = (a, b, off, text, changed) => {
      const A = [a[0] + off[0], a[1] + off[1], a[2] + off[2]], B = [b[0] + off[0], b[1] + off[1], b[2] + off[2]];
      const [sa, sb] = [pt(A), pt(B)];
      const ext = k.segment(a, A, P) + k.segment(b, B, P);
      const mid = [(sa[0] + sb[0]) / 2, (sa[1] + sb[1]) / 2];
      const ang = (Math.atan2(sb[1] - sa[1], sb[0] - sa[0]) * 180) / Math.PI;
      const up = ang > 90 || ang < -90 ? ang + 180 : ang;
      return `<g class="iso-dim${changed ? " changed" : ""}"><path d="${ext}" class="ext"/><path d="M${sa[0]} ${sa[1]}L${sb[0]} ${sb[1]}"/>${arrows(sa[0], sa[1], sb[0], sb[1])}<text transform="translate(${mid[0].toFixed(1)} ${mid[1].toFixed(1)}) rotate(${up.toFixed(1)}) translate(0 -4)">${text}</text></g>`;
    };
    out.push(dim([b.x, LONG, 0], [b.x + b.W, LONG, 0], [0, 34, 0], `${b.W}`, b.e > 0));
    out.push(dim([b.x + b.W, LONG, 0], [b.x + b.W, 0, 0], [34, 0, 0], `${LONG}`, false));
    out.push(dim([b.x, LONG, 0], [b.x, LONG, DEPTH], [-26, 18, 0], `${DEPTH}`, false));
  }
  return `<svg class="iso-svg pair" viewBox="0 0 640 300" role="img" aria-label="Las dos cajas armadas: ${boxes.map((b) => `${b.W} × ${LONG} × ${DEPTH} mm`).join(" y ")}">${out.join("")}</svg>`;
}

// ---------- Tabla de diferencias ----------
const rows = PLANS[0].dims
  .map((d, i) => ({ name: `${d.name} · ${d.dir === "h" ? "ancho" : "alto"}`, a: d.value, b: PLANS[1].dims[i].value }))
  .filter((r, i, all) => all.findIndex((q) => q.name === r.name && Math.abs(q.a - r.a) < 0.05) === i);
const table = `<table><thead><tr><th>Pieza</th><th>Original</th><th>+${E}</th><th>Δ</th></tr></thead><tbody>${rows
  .map((r) => `<tr${Math.abs(r.b - r.a) > 0.05 ? ' class="changed"' : ""}><td>${r.name}</td><td>${fmt(r.a)}</td><td>${fmt(r.b)}</td><td>${Math.abs(r.b - r.a) > 0.05 ? "+" + fmt(r.b - r.a) : "—"}</td></tr>`)
  .join("")}</tbody></table>`;

// ---------- Página ----------
const page = `<title>Troquel 6463 comparado</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
/* Lámina de taller: papel de plano, tinta grafito, cotas que cambian en azul de plano. */
:root{
  --paper:#f4f5f2;--sheet:#fcfcfa;--ink:#24282b;--soft:#6b7176;--rule:#c9ccc8;--crease:#8b9095;--accent:#1f5fbf;
  --display:"Barlow Condensed","Arial Narrow",sans-serif;--body:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#7fb0ff;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#7fb0ff;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:15px/1.55 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1080px;margin:0 auto;padding-block:36px 64px;display:grid;gap:28px}
header{display:grid;gap:6px}
h1{font:600 clamp(28px,4vw,40px)/1.05 var(--display);letter-spacing:.01em;margin:0;text-wrap:balance}
h2{font:600 20px/1.2 var(--display);letter-spacing:.04em;text-transform:uppercase;margin:0}
.lede{color:var(--soft);max-width:65ch;margin:0}
.sheet{background:var(--sheet);border:1px solid var(--rule);padding:18px 18px 12px;display:grid;gap:10px;min-width:0}
.sheet-head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;align-items:baseline}
.tag{font:500 12px/1 var(--mono);color:var(--soft);letter-spacing:.06em;text-transform:uppercase}
.scroll{overflow-x:auto}
.plan{display:block;width:100%;min-width:640px;height:auto}
.plan .cut{fill:none;stroke:var(--ink);stroke-width:1.1;vector-effect:non-scaling-stroke}
.plan .crease{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.plan .perf{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:2 3;vector-effect:non-scaling-stroke}
.dim path{fill:none;stroke:var(--soft);stroke-width:.6;vector-effect:non-scaling-stroke}
.dim .arrow,.iso-dim .arrow{fill:var(--soft);stroke:none}
.dim text{font:500 19px var(--mono);fill:var(--soft);text-anchor:middle;font-variant-numeric:tabular-nums}
.dim.changed path{stroke:var(--accent)}.dim.changed .arrow{fill:var(--accent)}.dim.changed text{fill:var(--accent);font-weight:600}
.note{font:500 16px var(--mono);fill:var(--soft);text-anchor:middle}
.pair{display:block;width:100%;height:auto;max-width:900px;margin:0 auto}
.iso-dim path{fill:none;stroke:var(--soft);stroke-width:.6;vector-effect:non-scaling-stroke}
.iso-dim .ext{stroke-dasharray:2 2}
.iso-dim text{font:500 11px var(--mono);fill:var(--soft);text-anchor:middle}
.iso-dim.changed path{stroke:var(--accent)}.iso-dim.changed .arrow{fill:var(--accent)}.iso-dim.changed text{fill:var(--accent);font-weight:600}
.legend{display:flex;flex-wrap:wrap;gap:6px 22px;font:13px var(--body);color:var(--soft)}
.legend span{display:inline-flex;align-items:center;gap:8px}
.legend svg{width:28px;height:8px}
.legend .c{stroke:var(--ink)}.legend .h{stroke:var(--crease);stroke-dasharray:6 4}.legend .p{stroke:var(--crease);stroke-dasharray:2 3}.legend .a{stroke:var(--accent)}
.grid{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(0,1fr);gap:28px;align-items:start}
@media (max-width:820px){.grid{grid-template-columns:minmax(0,1fr)}}
table{width:100%;border-collapse:collapse;font:14px var(--body);font-variant-numeric:tabular-nums}
th{font:500 12px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--soft);text-align:right;padding:6px 8px;border-bottom:1px solid var(--rule)}
th:first-child,td:first-child{text-align:left}
td{padding:6px 8px;border-bottom:1px solid var(--rule);text-align:right;font-family:var(--mono)}
td:first-child{font-family:var(--body)}
tr.changed td{color:var(--accent)}tr.changed td:first-child{color:var(--ink)}
.facts{display:grid;gap:10px;margin:0;padding:0;list-style:none;color:var(--soft);max-width:60ch}
.facts b{color:var(--ink);font-weight:500}
.iso{--anatomy-paper:var(--sheet)}
${ISO_CSS}
</style>
<main>
  <header>
    <span class="tag">Troquel 6463 · caja tipo galeno · cotas en mm</span>
    <h1>Original y +${E}: el mismo troquel, un frasco ${E} mm más largo</h1>
    <p class="lede">Los dos planos a la misma escala, uno sobre el otro, para que los ${E} mm se vean donde aparecen. En azul, las cotas que cambian; todo lo demás queda igual.</p>
  </header>
  <div class="legend" aria-hidden="true">
    <span><svg viewBox="0 0 28 8"><path class="c" d="M0 4H28" stroke-width="1.4"/></svg>Corte</span>
    <span><svg viewBox="0 0 28 8"><path class="h" d="M0 4H28" stroke-width="1.2"/></svg>Hendido</span>
    <span><svg viewBox="0 0 28 8"><path class="p" d="M0 4H28" stroke-width="1.2"/></svg>Intermitente 5×5</span>
    <span><svg viewBox="0 0 28 8"><path class="a" d="M0 4H28" stroke-width="1.4"/></svg>Cota que cambia</span>
  </div>
  ${PLANS.map((p) => `<section class="sheet"><div class="sheet-head"><h2>${p.name}</h2><span class="tag">${p.file} · caja ${320 + p.e} × 94 × 276</span></div><div class="scroll">${planSvg(p)}</div></section>`).join("\n  ")}
  <section class="sheet"><div class="sheet-head"><h2>Armadas</h2><span class="tag">misma escala · ${boxes.map((b) => `${b.W} × ${LONG} × ${DEPTH}`).join(" y ")}</span></div><div class="iso">${isoBoxes()}</div></section>
  <div class="grid">
    <section class="sheet"><div class="sheet-head"><h2>Diferencias</h2><span class="tag">mm</span></div>${table}</section>
  <ul class="facts">
    <li><b>Dónde se estira.</b> Una franja dentro del frente y otra dentro del contrafrente crecen ${E} mm cada una; la pieza interior crece ${E} mm en el panel entre tabiques.</li>
    <li><b>Qué no cambia.</b> Profundidad 94, alto 276, costados, solapa de pegado, guardapolvos, orejas, tabiques de 28, agujeros ⌀80, ranuras ⌀31 y la traba de 86 × 10, que se corre junto con su diente.</li>
    <li><b>Archivos.</b> ${PLANS.map((p) => p.file).join(" y ")}; los dos acotados juntos en troquel-6463-comparacion.dxf (capas Troquel, Cotas y Cotas_cambian).</li>
  </ul>
  </div>
</main>
<script>(function(){const r=document.documentElement,m=matchMedia("(prefers-color-scheme: dark)"),s=()=>{const t=r.dataset.theme||(m.matches?"dark":"light");document.querySelectorAll(".iso").forEach((e)=>e.dataset.theme=t)};s();m.addEventListener("change",s);new MutationObserver(s).observe(r,{attributes:true,attributeFilter:["data-theme"]})})()</script>
`;
writeFileSync(join(HERE, "comparacion.html"), page);

// ---------- DXF con los dos planos acotados ----------
const GAP = 1150; // el +E va debajo del original
function dxf() {
  const out = [];
  const put = (c, v) => out.push(String(c).padStart(3), String(v));
  const f = (v) => (Math.round(v * 1e4) / 1e4).toString();
  const line = (layer, color, a, b) => { put(0, "LINE"); put(8, layer); put(62, color); put(10, f(a[0])); put(20, f(a[1])); put(30, 0); put(11, f(b[0])); put(21, f(b[1])); put(31, 0); };
  const text = (layer, at, h, t, rot = 0, center = true) => { put(0, "TEXT"); put(8, layer); put(10, f(at[0])); put(20, f(at[1])); put(30, 0); put(40, h); put(1, t); if (rot) put(50, rot); if (center) { put(72, 1); put(11, f(at[0])); put(21, f(at[1])); put(31, 0); } };
  put(0, "SECTION"); put(2, "HEADER"); put(9, "$ACADVER"); put(1, "AC1009"); put(9, "$INSUNITS"); put(70, 4); put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "TABLES"); put(0, "TABLE"); put(2, "LAYER"); put(70, 3);
  for (const [n, c] of [["Troquel", 4], ["Cotas", 5], ["Cotas_cambian", 3]]) { put(0, "LAYER"); put(2, n); put(70, 0); put(62, c); put(6, "CONTINUOUS"); }
  put(0, "ENDTAB"); put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "ENTITIES");
  PLANS.forEach((p, i) => {
    const dy = i === 0 ? 0 : -GAP;
    for (const it of p.items) {
      if (it.type === "LINE") line("Troquel", it.color, [it.a[0], it.a[1] + dy], [it.b[0], it.b[1] + dy]);
      else { put(0, "ARC"); put(8, "Troquel"); put(62, it.color); put(10, f(it.c[0])); put(20, f(it.c[1] + dy)); put(30, 0); put(40, f(it.r)); put(50, f(it.a0)); put(51, f(it.a1)); }
    }
    text("Cotas", [-40 - p.e, 1285 + dy], 22, `TROQUEL 6463 ${p.e ? "+" + p.e : "ORIGINAL"} - caja ${320 + p.e} x 94 x 276 mm`, 0, false);
    for (const d of p.dims) {
      const layer = d.changed ? "Cotas_cambian" : "Cotas";
      if (d.dir === "h") {
        const y = d.at + dy;
        line(layer, 256, [d.x0, y], [d.x1, y]); line(layer, 256, [d.x0, y - 9], [d.x0, y + 9]); line(layer, 256, [d.x1, y - 9], [d.x1, y + 9]);
        text(layer, [(d.x0 + d.x1) / 2, y + 6], 12, fmt(d.value));
      } else {
        const x = d.at;
        line(layer, 256, [x, d.y0 + dy], [x, d.y1 + dy]); line(layer, 256, [x - 9, d.y0 + dy], [x + 9, d.y0 + dy]); line(layer, 256, [x - 9, d.y1 + dy], [x + 9, d.y1 + dy]);
        text(layer, [x - 6, (d.y0 + d.y1) / 2 + dy], 12, fmt(d.value), 90);
      }
    }
  });
  put(0, "ENDSEC"); put(0, "EOF");
  return out.join("\r\n") + "\r\n";
}
writeFileSync(join(HERE, "troquel-6463-comparacion.dxf"), dxf());
console.log("wrote comparacion.html, troquel-6463-comparacion.dxf");
console.log(rows.map((r) => `${r.name}: ${fmt(r.a)} → ${fmt(r.b)}`).join("\n"));
