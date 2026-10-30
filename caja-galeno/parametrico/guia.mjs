// Escribe guia-artioscad.html: la guía del galeno paramétrico, interactiva.
// Cambiás las variables y se recalculan el plano anotado por fórmulas y las tablas.
// node guia.mjs [--artefacto --out archivo.html]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { generate } from "./galeno.mjs";
import { DIM_FORMULAS } from "./formulas.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ARTIFACT = process.argv.includes("--artefacto");
const outAt = process.argv.indexOf("--out");
const plantillaText = readFileSync(join(HERE, "plantilla-caja.json"), "utf8");

// Cada fórmula del plano tiene que dar lo que mide la geometría generada.
for (const params of [{}, { L: 370 }, { L: 400, A: 110, H: 300, t: 32, n: 4, Dc: 70, Dn: 28, p: 72 }, { L: 250, A: 70, H: 200, n: 2, Dc: 56, Dn: 22, p: 64 }]) {
  const m = generate(params, JSON.parse(plantillaText));
  for (const d of m.dims) {
    const entry = DIM_FORMULAS[d.src][d.name];
    if (!entry) continue;
    const want = entry[1](m.P);
    if (Math.abs(want - d.value) > 0.05) throw new Error(`fórmula ${entry[0]} (${d.name}) da ${want} y el plano mide ${d.value.toFixed(2)} con ${JSON.stringify(params)}`);
  }
}

const strip = (file) => readFileSync(join(HERE, file), "utf8").replace(/^export /gm, "");

const page = `<title>Galeno 6463 para ArtiosCAD</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
/* Ficha técnica viva: variables a la izquierda, plano con fórmulas a la derecha, tablas fórmula/valor debajo. */
:root{
  --paper:#f4f5f2;--sheet:#fcfcfa;--ink:#24282b;--soft:#6b7176;--rule:#c9ccc8;--crease:#8b9095;--accent:#1f6fd6;--accent-deep:#1558b0;--on-accent:#ffffff;--warn:#a4441b;--note:#6b7176;--field:#ffffff;--flash:#e3ecfa;
  --display:"Barlow Condensed","Arial Narrow",sans-serif;--body:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#4ba3ff;--accent-deep:#7dbcff;--on-accent:#06121f;--warn:#f0956b;--note:#8d959b;--field:#101214;--flash:#1d2a3d;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#4ba3ff;--accent-deep:#7dbcff;--on-accent:#06121f;--warn:#f0956b;--note:#8d959b;--field:#101214;--flash:#1d2a3d;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:15px/1.55 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1240px;margin:0 auto;padding-block:32px 64px;display:grid;gap:22px}
header{display:grid;gap:6px}
.tag{font:500 12px/1.3 var(--mono);color:var(--soft);letter-spacing:.06em;text-transform:uppercase}
h1{font:600 clamp(28px,4vw,42px)/1.05 var(--display);margin:0;text-wrap:balance}
h2{font:600 18px/1.2 var(--display);letter-spacing:.05em;text-transform:uppercase;margin:0}
p{margin:0;max-width:70ch}
.lede{color:var(--soft)}
.sheet{background:var(--sheet);border:1px solid var(--rule);padding:16px;display:grid;gap:12px;min-width:0;align-content:start}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;align-items:baseline}
.desk{display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px;align-items:start}
@media (max-width:860px){.desk{grid-template-columns:minmax(0,1fr)}}
.side{position:sticky;top:calc(env(safe-area-inset-top,0px) + 12px)}
@media (max-width:860px){.side{position:static}}
form{display:grid;gap:9px}
.var{display:grid;grid-template-columns:30px minmax(0,1fr) 84px;gap:2px 10px;align-items:center}
.var b{font:500 14px var(--mono);color:var(--accent)}
.var label{font-size:13px;color:var(--soft);line-height:1.25}
.var input[type=number]{width:100%;font:500 14px var(--mono);color:var(--ink);background:var(--field);border:1px solid var(--rule);padding:6px 8px;text-align:right;font-variant-numeric:tabular-nums}
.var input[type=range]{grid-column:2 / 4;width:100%;accent-color:var(--accent);margin:0}
input:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.presets{display:flex;flex-wrap:wrap;gap:6px}
button{font:500 13px var(--body);color:var(--ink);background:transparent;border:1px solid var(--rule);padding:7px 10px;cursor:pointer}
button:hover{border-color:var(--ink)}
button.primary{background:var(--accent);color:var(--on-accent);border-color:var(--accent);font-weight:600}
button.primary:hover{background:var(--accent-deep);border-color:var(--accent-deep)}
button.primary:disabled{opacity:.5;cursor:default}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.facts{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;margin:0;font-size:13px}
.facts dt{color:var(--soft)}.facts dd{margin:0;font-family:var(--mono);font-variant-numeric:tabular-nums}
.warn{margin:0;padding:0;list-style:none;display:grid;gap:6px;color:var(--warn);font-size:13px}
.warn li.note{color:var(--note)}
.status{font:13px var(--mono);color:var(--soft);min-height:1.4em;margin:0}
.scroll{overflow-x:auto}
svg.plan{display:block;width:100%;min-width:680px;height:auto}
.plan .c{fill:none;stroke:var(--ink);stroke-width:1.1;vector-effect:non-scaling-stroke}
.plan .h{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.plan .p{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:2 3;vector-effect:non-scaling-stroke}
.dim path{fill:none;stroke:var(--accent);stroke-width:.6;vector-effect:non-scaling-stroke}
.dim .ar{fill:var(--accent);stroke:none}
.dim text{font:500 17px var(--mono);text-anchor:middle}
.dim text.side{text-anchor:start;font-size:15px}
.dim text.side-l,.dim text.down{text-anchor:end;font-size:15px}
.dim .fx{fill:var(--accent);font-weight:600}.dim .val{fill:var(--soft)}
.dim.hot .val{fill:var(--accent);font-weight:600}
.call{font:500 14px var(--mono);fill:var(--soft);text-anchor:middle}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:var(--soft)}
.legend span{display:inline-flex;align-items:center;gap:8px}.legend svg{width:28px;height:8px}
.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:start}
.cols .wide{grid-column:1 / -1}
.cols .wide .scroll{columns:2 360px;column-gap:28px}
@media (max-width:720px){.cols{grid-template-columns:minmax(0,1fr)}}
.two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px;align-items:start}
@media (max-width:820px){.two{grid-template-columns:minmax(0,1fr)}}
table{width:100%;border-collapse:collapse;font-size:13.5px}
th{font:500 11px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--soft);text-align:left;padding:5px 6px;border-bottom:1px solid var(--rule)}
th:last-child,td:last-child{text-align:right}
td{padding:5px 6px;border-bottom:1px solid var(--rule);vertical-align:top}
td.f{font:500 12.5px var(--mono);color:var(--accent)}
td.v{font:500 13px var(--mono);font-variant-numeric:tabular-nums;white-space:nowrap}
tr.hot td.v{background:var(--flash)}
@media (prefers-reduced-motion:no-preference){td.v{transition:background-color .6s}}
code,.vv{font:500 13px var(--mono);color:var(--accent)}
ol,ul{margin:0;padding-left:1.2em;display:grid;gap:8px;max-width:72ch}
li b{font-weight:500}
.note{color:var(--soft);font-size:13.5px}
</style>
<main>
  <header>
    <span class="tag">Troquel 6463 · caja tipo galeno · guía de diseño paramétrico</span>
    <h1>Galeno 6463 para ArtiosCAD</h1>
    <p class="lede">Mové las variables y el troquel se rearma con cada cota escrita en su fórmula y su valor; lo que cambió se marca en azul. El DXF descargado lleva sólo las líneas del troquel y las cotas H y L.</p>
  </header>

  <div class="desk">
    <section class="sheet side" aria-labelledby="t-vars">
      <h2 id="t-vars">Variables · mm</h2>
      <form id="form" autocomplete="off"></form>
      <div class="presets" aria-label="Medidas guardadas">
        <button type="button" data-preset='{"L":320}'>6463 original</button>
        <button type="button" data-preset='{"L":370}'>6463 +50</button>
      </div>
      <dl class="facts" id="facts"></dl>
      <ul class="warn" id="warn"></ul>
      <div class="actions">
        <button type="button" class="primary" id="dl-dxf">Descargar DXF</button>
        <button type="button" class="primary" id="dl-cf2">Descargar CF2</button>
        <button type="button" id="cp-dxf">Copiar DXF</button>
        <button type="button" id="cp-cf2">Copiar CF2</button>
      </div>
      <p class="status" id="status" role="status"></p>
    </section>
    <section class="sheet" aria-labelledby="t-plano">
      <div class="head"><h2 id="t-plano">Plano con fórmulas</h2><span class="tag" id="caption"></span></div>
      <div class="legend" aria-hidden="true">
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--ink)" stroke-width="1.4"/></svg>Corte</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="6 4"/></svg>Hendido</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="2 3"/></svg>Intermitente 5×5</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--accent)" stroke-width="1.2"/></svg>Fórmula = valor</span>
      </div>
      <div class="scroll" id="plan"></div>
    </section>
  </div>

</main>
<script>
${strip("galeno.mjs")}
${strip("formulas.mjs")}
const PLANTILLA = ${plantillaText};
const form = document.getElementById("form");
const state = { ...DEFAULTS };
let model, last = null;
for (const p of PARAMS) {
  const row = document.createElement("div");
  row.className = "var";
  row.innerHTML = '<b>' + p.key + '</b><label for="v-' + p.key + '">' + p.label + '</label><input id="v-' + p.key + '" type="number" inputmode="decimal" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + DEFAULTS[p.key] + '"><input id="r-' + p.key + '" type="range" aria-label="' + p.label + '" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + DEFAULTS[p.key] + '">';
  form.appendChild(row);
}
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const fmtV = (v) => (typeof v === "number" ? fmtMm(v) : v);
function arrow(x0, y0, x1, y1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, s = Math.min(9, L / 4), w = s * 0.35;
  const h = (x, y, dx, dy) => "M" + f1(x) + " " + f1(y) + "L" + f1(x + dx * s - dy * w) + " " + f1(y + dy * s + dx * w) + "L" + f1(x + dx * s + dy * w) + " " + f1(y + dy * s - dx * w) + "Z";
  return h(x0, y0, ux, uy) + h(x1, y1, -ux, -uy);
}
function planSvg(prevDims) {
  const b = model.info.bounds;
  const X0 = b.xMin - 270, X1 = b.xMax + 300, Y0 = b.yMin - 110, Y1 = b.yMax + 30;
  const cx = (b.xMin + b.xMax) / 2;
  const Y = (y) => Y1 - y;
  const paths = { c: "", h: "", p: "" };
  for (const e of model.entities) {
    if (e.t === "L") paths[e.k] += "M" + f1(e.a[0]) + " " + f1(Y(e.a[1])) + "L" + f1(e.b[0]) + " " + f1(Y(e.b[1]));
    else {
      let sweep = e.a1 - e.a0; while (sweep <= 0) sweep += 360; while (sweep > 360) sweep -= 360;
      const at = (a) => [e.c[0] + e.r * Math.cos(a * Math.PI / 180), e.c[1] + e.r * Math.sin(a * Math.PI / 180)];
      const s = at(e.a0), t = at(e.a1);
      paths[e.k] += "M" + f1(s[0]) + " " + f1(Y(s[1])) + "A" + f1(e.r) + " " + f1(e.r) + " 0 " + (sweep > 180 ? 1 : 0) + " 0 " + f1(t[0]) + " " + f1(Y(t[1]));
    }
  }
  const text = (d) => {
    const entry = DIM_FORMULAS[d.src][d.name], v = fmt(d.value).replace(".", ",");
    return entry && entry[0] !== v ? [entry[0] + " = " + v, '<tspan class="fx">' + entry[0] + '</tspan><tspan class="val"> = ' + v + "</tspan>"] : [v, '<tspan class="val">' + v + "</tspan>"];
  };
  let dims = "";
  model.dims.forEach((d, i) => {
    const hot = prevDims && prevDims[i] !== undefined && Math.abs(prevDims[i] - d.value) > 0.005 ? " hot" : "";
    const [plain, rich] = text(d);
    const fits = plain.length * 10.4 < Math.abs(d.dir === "h" ? d.x1 - d.x0 : d.y1 - d.y0) - 12;
    if (d.dir === "h") {
      const y = Y(d.at), xm = (d.x0 + d.x1) / 2;
      const base = '<g class="dim' + hot + '"><path d="M' + f1(d.x0) + " " + f1(y - 8) + "V" + f1(y + 8) + "M" + f1(d.x1) + " " + f1(y - 8) + "V" + f1(y + 8) + "M" + f1(d.x0) + " " + f1(y) + "H" + f1(d.x1) + '"/><path class="ar" d="' + arrow(d.x0, y, d.x1, y) + '"/>';
      // Si no entra a lo largo, la etiqueta baja en vertical desde la cota.
      dims += fits
        ? base + '<text x="' + f1(xm) + '" y="' + f1(y - 7) + '">' + rich + "</text></g>"
        : base + '<text class="down" x="' + f1(xm + 5) + '" y="' + f1(y + 12) + '" transform="rotate(-90 ' + f1(xm + 5) + " " + f1(y + 12) + ')">' + rich + "</text></g>";
    } else {
      const x = d.at, ym = Y((d.y0 + d.y1) / 2);
      const base = '<g class="dim' + hot + '"><path d="M' + f1(x - 8) + " " + f1(Y(d.y0)) + "H" + f1(x + 8) + "M" + f1(x - 8) + " " + f1(Y(d.y1)) + "H" + f1(x + 8) + "M" + f1(x) + " " + f1(Y(d.y0)) + "V" + f1(Y(d.y1)) + '"/><path class="ar" d="' + arrow(x, Y(d.y0), x, Y(d.y1)) + '"/>';
      const left = x < cx;
      dims += fits
        ? base + '<text x="' + f1(x - 7) + '" y="' + f1(ym) + '" transform="rotate(-90 ' + f1(x - 7) + " " + f1(ym) + ')">' + rich + "</text></g>"
        : base + '<text class="' + (left ? "side-l" : "side") + '" x="' + f1(left ? x - 10 : x + 10) + '" y="' + f1(ym + 6) + '">' + rich + "</text></g>";
    }
  });
  const map = (p) => model.anchors.rot(model.anchors.map(p)), ins = model.anchors.insert, r = ins.rows, rot = model.anchors.rot;
  const calls = [
    [map([530, 1090]), "guardapolvo A + 26"],
    [map([944, 1090]), "A + 28,5"],
    [map([112, 1050]), "oreja × A/94"],
    [map([326, 1068]), "contratapa A − 6"],
    [map([741.5, 1000]), "traba 86,5 × 10"],
    [map([741.5, 1228]), "diente 85 × 5"],
    [ins.T([ins.x0 + ins.centres[0], ins.y0 + (r.p2 + r.c3) / 2]), "⌀Dc"],
  ];
  if (ins.centres.length > 1) calls.push([ins.T([ins.x0 + ins.centres[1], ins.y0 + (r.p2 + r.c3) / 2 + 9]), "Dn"]);
  calls.push([ins.T([ins.x0 + ins.centres[ins.centres.length > 1 ? 1 : 0], ins.y0 + r.c1 / 2]), "muesca 35 × 4"]);
  const callSvg = calls.map(([p, t]) => '<text class="call" x="' + f1(p[0]) + '" y="' + f1(Y(p[1])) + '">' + t + "</text>").join("");
  return '<svg class="plan" viewBox="' + f1(X0) + " 0 " + f1(X1 - X0) + " " + f1(Y1 - Y0) + '" role="img" aria-label="Troquel galeno ' + model.info.caja + ' mm con cada cota expresada en sus variables"><path class="c" d="' + paths.c + '"/><path class="h" d="' + paths.h + '"/><path class="p" d="' + paths.p + '"/>' + dims + callSvg + "</svg>";
}
const prevTables = {};
function tableHtml(key) {
  const rows = TABLES[key].map(([name, formula, fn]) => [name, formula, fmtV(fn(state))]);
  const before = prevTables[key];
  prevTables[key] = rows.map((r) => r[2]);
  return "<div class=\\"scroll\\"><table><thead><tr><th>Pieza</th><th>Fórmula</th><th>mm</th></tr></thead><tbody>" + rows.map((r, i) => "<tr" + (before && before[i] !== r[2] ? ' class="hot"' : "") + "><td>" + r[0] + '</td><td class="f">' + r[1] + '</td><td class="v">' + r[2] + "</td></tr>").join("") + "</tbody></table></div>";
}
let hotTimer = 0;
function render(source) {
  for (const p of PARAMS) {
    const num = document.getElementById("v-" + p.key), rng = document.getElementById("r-" + p.key);
    if (source === rng) num.value = rng.value; else if (source === num) rng.value = num.value;
    const v = Number(num.value);
    if (Number.isFinite(v) && v > 0) state[p.key] = p.key === "n" ? Math.max(1, Math.round(v)) : v;
  }
  const prevDims = model ? model.dims.map((d) => d.value) : null;
  model = generate(state, PLANTILLA);
  // Rangos que dependen de las otras medidas: el deslizador no deja pasarlos.
  const lim = limits(model.P);
  for (const p of PARAMS) {
    const [a, b2] = lim[p.key], rng = document.getElementById("r-" + p.key), num = document.getElementById("v-" + p.key);
    rng.min = num.min = Math.round(a * 100) / 100; rng.max = num.max = Math.round(b2 * 100) / 100;
    rng.value = model.P[p.key];
    if (source === "commit") num.value = Math.round(model.P[p.key] * 100) / 100;
  }
  document.getElementById("plan").innerHTML = planSvg(prevDims);
  document.getElementById("caption").textContent = "L " + fmtMm(state.L) + " · A " + fmtMm(state.A) + " · H " + fmtMm(state.H) + " · t " + fmtMm(state.t) + " · plancha " + model.info.plancha;
  const facts = [["Caja", model.info.caja + " mm"], ["Plancha", model.info.plancha + " mm"], ["Frasco", model.info.frasco], ["Interior", model.info.interior]];
  document.getElementById("facts").innerHTML = facts.map(([k, v]) => "<dt>" + k + "</dt><dd>" + v + "</dd>").join("");
  document.getElementById("warn").innerHTML = model.notes.map((w) => '<li class="note">' + w + "</li>").join("") + model.warnings.map((w) => "<li>" + w + "</li>").join("");
  clearTimeout(hotTimer);
  hotTimer = setTimeout(() => document.querySelectorAll(".hot").forEach((e) => e.classList.remove("hot")), 1400);
}
const name = () => "GALENO-" + fmtMm(state.L) + "x" + fmtMm(state.A) + "x" + fmtMm(state.H);
const say = (t) => (document.getElementById("status").textContent = t);
${ARTIFACT ? `// En claude.ai el visor guarda archivos sólo con el permiso de descargas. Se intenta el .dxf o .cf2
// directo; si el visor no acepta esa extensión, se guarda con .txt al final para renombrar.
let downloads = null;
window.claude?.use?.("downloads").then((d) => { downloads = d; }).catch(() => {});
async function download(text, ext) {
  if (!downloads) { say("Las descargas no están disponibles en esta vista. Usá Copiar y pegalo en un archivo ." + ext + "."); return; }
  const file = name() + "." + ext;
  try {
    await downloads.save({ filename: file, data: text });
    say("Guardado " + file + ".");
  } catch (e) {
    if (e && e.code === "rejected_extension") {
      try {
        await downloads.save({ filename: file + ".txt", data: text });
        say("claude.ai no deja guardar ." + ext + ": se guardó " + file + ".txt. Borrale el .txt del nombre y abrilo en ArtiosCAD.");
      } catch (e2) { say(e2 && e2.code === "declined" ? "Descarga cancelada." : "No se pudo descargar. Usá Copiar."); }
      return;
    }
    say(e && e.code === "declined" ? "Descarga cancelada." : "No se pudo descargar (" + ((e && e.code) || "error") + "). Usá Copiar y pegalo en un archivo ." + ext + ".");
  }
}` : `function download(text, ext) {
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/octet-stream" }));
    a.download = name() + "." + ext;
    document.body.appendChild(a); a.click(); a.remove();
    say("Descarga iniciada: " + a.download + ".");
  } catch (e) { say("No se pudo descargar. Usá Copiar y pegalo en un archivo ." + ext + "."); }
}`}
document.getElementById("dl-dxf").addEventListener("click", () => download(toDxf(model, { name: name() }), "dxf"));
document.getElementById("dl-cf2").addEventListener("click", () => download(toCf2(model, { name: name() }), "cf2"));
async function copy(text, ext) {
  try { await navigator.clipboard.writeText(text); say("Copiado. Pegalo en un archivo de texto y guardalo como " + name() + "." + ext + "."); }
  catch (e) { say("El navegador no dejó copiar."); }
}
document.getElementById("cp-dxf").addEventListener("click", () => copy(toDxf(model, { name: name() }), "dxf"));
document.getElementById("cp-cf2").addEventListener("click", () => copy(toCf2(model, { name: name() }), "cf2"));
form.addEventListener("input", (e) => render(e.target));
form.addEventListener("change", () => render("commit"));
document.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => {
  const p = { ...DEFAULTS, ...JSON.parse(b.dataset.preset) };
  for (const k in p) { document.getElementById("v-" + k).value = p[k]; document.getElementById("r-" + k).value = p[k]; }
  render(); say("Cargado: " + b.textContent + ".");
}));
render();
</script>
`;
const file = outAt > 0 ? process.argv[outAt + 1] : join(HERE, "guia-artioscad.html");
writeFileSync(file, page);
console.log("wrote", file, (page.length / 1024).toFixed(0) + " KB · fórmulas verificadas contra la geometría");
