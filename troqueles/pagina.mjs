// Plantilla de páginas de troqueles paramétricos: arma el HTML interactivo de cualquier diseño.
// El diseño pone la geometría y sus textos (ver LEEME.md); la página pone todo lo demás: variables con
// deslizadores que arrancan en el medio, plano con el cartón pintado, vista simple o con fórmulas,
// la variable que se toca y sus cotas en naranja (con fundido de 1,5 s al soltar), resumen de cinco
// tarjetas, tamaños fijos y descargas DXF/CF2.
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = dirname(fileURLToPath(import.meta.url));
// Los módulos se copian dentro de la página: sin import ni export, en orden.
const copiar = (file) => readFileSync(file, "utf8").replace(/^import [^;]*;\n/gm, "").replace(/^export /gm, "");

// Cada fórmula del plano tiene que dar lo que mide la geometría generada.
export function verificarFormulas(design) {
  for (const params of design.casosFormulas || [{}]) {
    const m = design.generate(params);
    for (const d of m.dims) {
      const entry = design.formulas[d.src] && design.formulas[d.src][d.name];
      if (!entry) continue;
      const want = entry[1](m.P);
      if (Math.abs(want - d.value) > 0.05) throw new Error(`fórmula ${entry[0]} (${d.name}) da ${want} y el plano mide ${d.value.toFixed(2)} con ${JSON.stringify(params)}`);
    }
  }
}

// design: el diseño ya creado (para verificar en Node).
// fuentes: archivos del diseño a copiar en la página, en orden de dependencia.
// prologo: código que va antes (por ejemplo, la plantilla JSON en una constante).
// crear: expresión que crea el diseño dentro de la página.
// artefacto: true para publicarla en claude.ai (descargas por el permiso "downloads").
export function armarPagina({ design, fuentes, prologo = "", crear, artefacto = false }) {
  verificarFormulas(design);
  const comunes = ["cad.mjs", "carton.mjs"].map((f) => copiar(join(AQUI, f))).join("\n");
  return `<title>${design.titulo}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
/* Estilo de la casa: tipografías y radios del sistema Cartocor en azul, cuadrícula técnica de 32 px,
   un solo tema claro. Descargas en azul, Reset en naranja, cartón en blanco, variable activa en naranja. */
:root{
  --paper:#fbfbfd;--sheet:#ffffff;--mint:#eef3fa;--soft-bg:#f3f6fa;--tint:#e5edf8;
  --ink:#0b1a2e;--soft:#3a4656;--rule:#cfdbea;--hairline:#d5dfeb;--crease:#6f7f92;--kraft:#ffffff;
  --accent:#1d5fbf;--accent-deep:#174f9f;--eyebrow:#174f9f;--on-accent:#ffffff;--grid:rgba(29,95,191,0.09);
  --blue:#1f78e0;--blue-deep:#1662bd;--on-blue:#ffffff;
  --warn:#a3471f;--note:#3a4656;--orange:#e8630a;--orange-deep:#c25105;--on-orange:#ffffff;--orange-soft:#fdeee3;--orange-ring:rgba(232,99,10,0.18);--field:#ffffff;--flash:#e5edf8;
  --shadow-float:0 10px 30px rgba(29,95,191,0.14);
  --display:Montserrat,Inter,sans-serif;--body:Inter,-apple-system,"Helvetica Neue",Arial,sans-serif;--mono:"IBM Plex Mono",ui-monospace,monospace;
  color-scheme:light;
}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:15px/1.5 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1240px;margin:0 auto;padding-block:40px 72px;display:grid;gap:22px}
header{display:grid;gap:10px}
.tag{font:500 12px/1.4 var(--mono);color:var(--soft);letter-spacing:.14em;text-transform:uppercase}
header .tag{color:var(--eyebrow);letter-spacing:.16em}
h1{font:700 clamp(34px,5vw,56px)/1.02 var(--display);letter-spacing:-.04em;margin:0;text-wrap:balance}
h1 span{display:block;color:var(--accent)}
h2{font:700 20px/1.15 var(--display);letter-spacing:-.02em;margin:0}
.sheet{background:var(--sheet);border:1px solid var(--rule);border-radius:28px;padding:22px;display:grid;gap:14px;min-width:0;align-content:start}
.sheet.plan-sheet{background-color:var(--mint);background-image:linear-gradient(var(--grid) 1px,transparent 1px),linear-gradient(90deg,var(--grid) 1px,transparent 1px);background-size:32px 32px}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;align-items:baseline}
.desk{display:grid;grid-template-columns:370px minmax(0,1fr);gap:22px;align-items:stretch}
@media (max-width:860px){.desk{grid-template-columns:minmax(0,1fr)}.plan-sheet #plan{height:420px}}
.plan-sheet{grid-template-rows:auto auto 1fr}
.plan-sheet #plan{display:block;height:620px;overflow:hidden}
form{display:grid;gap:9px}
.var{display:grid;grid-template-columns:30px minmax(0,1fr) 84px;gap:2px 10px;align-items:center}
.var b{font:500 14px var(--mono);color:var(--accent)}
.var label{font-size:14px;color:var(--soft);line-height:1.25}
.var input[type=number]{width:100%;font:500 14px var(--mono);color:var(--ink);background:var(--field);border:1px solid var(--rule);border-radius:980px;padding:6px 12px;text-align:right;font-variant-numeric:tabular-nums}
.var input[type=range]{grid-column:2 / 4;width:100%;accent-color:var(--accent);margin:0}
input:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.presets{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.presets.onda .tag{margin-right:4px}
h3.group{font:700 12px/1 var(--mono);letter-spacing:.16em;text-transform:uppercase;color:var(--eyebrow);margin:10px 0 0;padding-top:12px;border-top:1px solid var(--rule)}
h3.group:first-child{margin-top:0;padding-top:0;border-top:0}
button[aria-pressed="true"]{border-color:var(--accent);color:var(--accent);background:var(--flash);font-weight:600}
button{font:500 14px var(--body);color:var(--ink);background:var(--sheet);border:1px solid var(--rule);border-radius:980px;padding:8px 16px;cursor:pointer}
button:hover{border-color:var(--accent)}
button.primary{background:var(--blue);color:var(--on-blue);border-color:var(--blue);font-weight:600;box-shadow:var(--shadow-float)}
button.primary:hover{background:var(--blue-deep);border-color:var(--blue-deep)}
button.primary:disabled{opacity:.5;cursor:default}
button.reset{justify-self:start;background:var(--orange);color:var(--on-orange);border-color:var(--orange);font-weight:600;padding:7px 22px}
button.reset:hover{background:var(--orange-deep);border-color:var(--orange-deep)}

.right{display:grid;grid-template-rows:1fr auto;gap:22px;min-width:0}
.facts{margin:0;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}
@media (max-width:1200px){.facts{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:600px){.facts{grid-template-columns:repeat(2,minmax(0,1fr))}}
.facts .row{display:grid;align-content:start;gap:6px;padding:14px 13px;background:var(--soft-bg);border:1px solid var(--rule);border-radius:22px;min-width:0}
.facts dt{font:500 10.5px/1.3 var(--mono);letter-spacing:.1em;text-transform:uppercase;color:var(--eyebrow)}
.facts dd{margin:0;display:grid;gap:3px}
.facts dd strong{font:700 16px/1.2 var(--display);white-space:nowrap;letter-spacing:-.02em;color:var(--ink);font-variant-numeric:tabular-nums}
.facts dd span{font:500 12px/1.3 var(--body);color:var(--soft);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.side .actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:auto;padding-top:14px;border-top:1px solid var(--rule)}
.side .actions .status{grid-column:1 / -1}
.side{grid-template-rows:auto auto auto auto 1fr}
.status{font:13px var(--mono);color:var(--soft);min-height:1.4em;margin:0}

svg.plan{display:block;width:100%;height:100%}
.plan .k{fill:var(--kraft);stroke:var(--kraft);stroke-width:.8;stroke-linejoin:round;vector-effect:non-scaling-stroke}
.plan .c{fill:none;stroke:var(--ink);stroke-width:1.1;vector-effect:non-scaling-stroke}
.plan .h{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.plan .p{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:2 3;vector-effect:non-scaling-stroke}
.dim path{fill:none;stroke:var(--accent);stroke-width:.6;vector-effect:non-scaling-stroke}
.dim .ar{fill:var(--accent);stroke:none}
.dim text{font:500 17px var(--mono);text-anchor:middle}
.dim text.side{text-anchor:start;font-size:15px}
.dim text.side-l,.dim text.down{text-anchor:end;font-size:15px}
.plan.simple .dim text{font-size:22px}
.plan.simple .call{font-size:18px;fill:var(--accent);font-weight:600}
.head h2{margin-right:auto}
.head h2 .unit{font:500 13px var(--mono);color:var(--soft);letter-spacing:.08em;text-transform:uppercase;margin-left:6px}
.var,.var b,.var label,.var input[type=number],.var input[type=range]{transition:background-color 1.5s ease,color 1.5s ease,border-color 1.5s ease,box-shadow 1.5s ease,accent-color 1.5s ease}
.var.active,.var.active b,.var.active label,.var.active input{transition:none}
.var{border-radius:16px;margin:0 -8px;padding:4px 8px}
#plan .dim path,#plan .dim .ar,#plan .dim text,#plan .dim tspan,#plan .call{transition:stroke 1.5s ease,stroke-width 1.5s ease,fill 1.5s ease,font-size 1.5s ease}
#plan .active path,#plan .active .ar,#plan .active text,#plan .active tspan,#plan .call.active{transition:none}
@media (prefers-reduced-motion:reduce){.var,.var *,#plan *{transition:none!important}}
.var.active{background:var(--orange-soft)}
.var.active b,.var.active label{color:var(--orange-deep);font-weight:600}
.var.active input[type=number]{border-color:var(--orange);box-shadow:0 0 0 3px var(--orange-ring)}
.var.active input[type=range]{accent-color:var(--orange)}
.dim.active path{stroke:var(--orange);stroke-width:3.2}
.dim.active .ar{fill:var(--orange)}
.dim.active text .fx,.dim.active text .val{fill:var(--orange-deep);font-weight:700}
.dim.active text,.call.active{paint-order:stroke;stroke:var(--sheet);stroke-width:5px;stroke-linejoin:round}
.dim.active text{font-size:20px}
.plan.simple .dim.active text{font-size:28px}
.call.active{fill:var(--orange-deep);font-weight:700;font-size:22px}
.dim .fx{fill:var(--accent);font-weight:600}.dim .val{fill:var(--soft)}
.dim.hot .val{fill:var(--accent);font-weight:600}
.call{font:500 14px var(--mono);fill:var(--soft);text-anchor:middle}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:var(--soft)}
.legend span{display:inline-flex;align-items:center;gap:8px}.legend svg{width:28px;height:8px}
.legend [hidden]{display:none}
</style>
</style>
<main>
  <header>
    <span class="tag">${design.bajada}</span>
    <h1>${design.titulo}</h1>
  </header>

  <div class="desk">
    <section class="sheet side" aria-labelledby="t-vars">
      <h2 id="t-vars">Variables</h2>
      <form id="form" autocomplete="off"></form>
      <div class="presets onda" id="atajos" role="group"></div>
      <button type="button" class="reset" id="reset">Reset</button>
      <div class="actions">
        <button type="button" class="primary" id="dl-dxf">Descargar DXF</button>
        <button type="button" class="primary" id="dl-cf2">Descargar CF2</button>
        <p class="status" id="status" role="status"></p>
      </div>
    </section>
    <div class="right">
    <section class="sheet plan-sheet" aria-labelledby="t-plano">
      <div class="head"><h2 id="t-plano">Plano <span class="unit">mm</span></h2><button type="button" id="formulas" aria-pressed="false">Ver fórmulas</button></div>
      <div class="legend" aria-hidden="true">
        <span><svg viewBox="0 0 28 8"><rect x=".5" y=".5" width="27" height="7" rx="2" fill="var(--kraft)" stroke="var(--ink)" stroke-width="1"/></svg>Cartón</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--ink)" stroke-width="1.4"/></svg>Corte</span>
        <span data-k="h"><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="6 4"/></svg>Hendido</span>
        <span data-k="p"><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="2 3"/></svg>Intermitente 5×5</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--accent)" stroke-width="1.2"/></svg><span id="legend-dim">Cota de variable</span></span>
      </div>
      <div id="plan"></div>
    </section>
    <section class="sheet summary" aria-labelledby="t-res">
      <div class="head"><h2 id="t-res">Resumen</h2><span class="tag">mm</span></div>
      <dl class="facts" id="facts"></dl>
    </section>
    </div>
  </div>

</main>
<script>
${comunes}
${fuentes.map(copiar).join("\n")}
${prologo}
const DESIGN = ${crear};
const PARAMETROS = DESIGN.PARAMS, INICIAL = DESIGN.DEFAULTS;
const form = document.getElementById("form");
const state = { ...INICIAL };
let model;
let group = "";
for (const p of PARAMETROS) {
  if (p.group !== group) {
    group = p.group;
    const h = document.createElement("h3");
    h.className = "group";
    h.textContent = group;
    form.appendChild(h);
  }
  const row = document.createElement("div");
  row.className = "var";
  row.dataset.key = p.key;
  // El deslizador arranca en el medio: su rango se centra en el valor original y llega a los dos extremos.
  const half = Math.max(INICIAL[p.key] - p.min, p.max - INICIAL[p.key]);
  const rMin = INICIAL[p.key] - half, rMax = INICIAL[p.key] + half;
  row.innerHTML = '<b>' + p.key + '</b><label for="v-' + p.key + '">' + p.label + '</label><input id="v-' + p.key + '" type="number" inputmode="numeric" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + INICIAL[p.key] + '"><input id="r-' + p.key + '" type="range" aria-label="' + p.label + '" min="' + rMin + '" max="' + rMax + '" step="' + p.step + '" value="' + INICIAL[p.key] + '">';
  form.appendChild(row);
}
// Botones rápidos de una variable (por ejemplo, la onda del cartón).
const atajos = document.getElementById("atajos");
if (DESIGN.atajos) {
  atajos.setAttribute("aria-label", DESIGN.atajos.titulo);
  atajos.innerHTML = '<span class="tag">' + DESIGN.atajos.titulo + "</span>" + DESIGN.atajos.opciones.map(([n, v]) => '<button type="button" data-atajo="' + v + '">' + n + " · " + v + "</button>").join("");
} else atajos.remove();
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const mm = (v) => String(Math.round(v));
function arrow(x0, y0, x1, y1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, s = Math.min(9, L / 4), w = s * 0.35;
  const h = (x, y, dx, dy) => "M" + f1(x) + " " + f1(y) + "L" + f1(x + dx * s - dy * w) + " " + f1(y + dy * s + dx * w) + "L" + f1(x + dx * s + dy * w) + " " + f1(y + dy * s - dx * w) + "Z";
  return h(x0, y0, ux, uy) + h(x1, y1, -ux, -uy);
}
// Letras de variables que aparecen en una fórmula o llamada ("A − 4e/3" → A e).
const LETRAS = new RegExp(DESIGN.letras, "g");
const lettersOf = (txt) => (txt.match(LETRAS) || []).join(" ");
const formulaOf = (d) => (DESIGN.formulas[d.src] && DESIGN.formulas[d.src][d.name]) || null;
let activeVar = null;
function applyActive() {
  document.querySelectorAll(".var").forEach((row) => row.classList.toggle("active", row.dataset.key === activeVar));
  const want = activeVar ? DESIGN.toca[activeVar] || [] : [];
  document.querySelectorAll("#plan [data-vars]").forEach((el) => {
    const vars = el.dataset.vars ? el.dataset.vars.split(" ") : [];
    el.classList.toggle("active", vars.some((v) => want.includes(v)));
  });
}
let showFormulas = false;
function planSvg(prevDims) {
  const b = model.info.bounds;
  const cx = (b.xMin + b.xMax) / 2;
  // Cotas que se ven: todas con fórmulas; en la vista simple, una por cada clave de DESIGN.simple.
  const seen = new Set();
  const shown = model.dims.map((d, i) => [d, i]).filter(([d]) => {
    if (showFormulas) return true;
    const key = d.src + ":" + d.name;
    if (!(key in DESIGN.simple) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  // El marco abarca el troquel y las cotas visibles, con aire para los textos.
  let X0 = b.xMin, X1 = b.xMax, Y0 = b.yMin, Y1 = b.yMax;
  for (const [d] of shown) {
    if (d.dir === "h") { X0 = Math.min(X0, d.x0); X1 = Math.max(X1, d.x1); Y0 = Math.min(Y0, d.at); Y1 = Math.max(Y1, d.at); }
    else { X0 = Math.min(X0, d.at); X1 = Math.max(X1, d.at); Y0 = Math.min(Y0, d.y0); Y1 = Math.max(Y1, d.y1); }
  }
  X0 -= 60; X1 += showFormulas ? 125 : 110; Y0 -= 40; Y1 += 30;
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
  const kraft = cartonRings(model).map((r) => "M" + r.map((p) => f1(p[0]) + " " + f1(Y(p[1]))).join("L") + "Z").join("");
  const text = (d) => {
    const entry = formulaOf(d), v = mm(d.value);
    return entry && entry[0] !== v ? [entry[0] + " = " + v, '<tspan class="fx">' + entry[0] + '</tspan><tspan class="val"> = ' + v + "</tspan>"] : [v, '<tspan class="val">' + v + "</tspan>"];
  };
  const simpleText = (d) => {
    const letter = DESIGN.simple[d.src + ":" + d.name], v = mm(d.value);
    return letter ? [letter + " = " + v, '<tspan class="fx">' + letter + '</tspan><tspan class="val"> = ' + v + "</tspan>"] : [v, '<tspan class="val">' + v + "</tspan>"];
  };
  let dims = "";
  for (const [d, i] of shown) {
    const hot = (prevDims && prevDims[i] !== undefined && Math.abs(prevDims[i] - d.value) > 0.005 ? " hot" : "") + '" data-vars="' + lettersOf(formulaOf(d) ? formulaOf(d)[0] : "");
    const [plain, rich] = showFormulas ? text(d) : simpleText(d);
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
  }
  const calls = (DESIGN.llamadas ? DESIGN.llamadas(model) : []).filter((c) => showFormulas || c[2]);
  const callSvg = calls.map(([p, t]) => '<text class="call" data-vars="' + lettersOf(t) + '" x="' + f1(p[0]) + '" y="' + f1(Y(p[1])) + '">' + t + "</text>").join("");
  return '<svg class="plan' + (showFormulas ? "" : " simple") + '" viewBox="' + f1(X0) + " 0 " + f1(X1 - X0) + " " + f1(Y1 - Y0) + '" role="img" aria-label="' + DESIGN.describir(model) + (showFormulas ? ", con cada cota expresada en sus variables" : ", con las cotas de las variables") + '"><path class="k" d="' + kraft + '"/><path class="c" d="' + paths.c + '"/><path class="h" d="' + paths.h + '"/><path class="p" d="' + paths.p + '"/>' + dims + callSvg + "</svg>";
}
const setValue = (key, v) => { state[key] = v; document.getElementById("v-" + key).value = v; document.getElementById("r-" + key).value = v; };
let hotTimer = 0;
function render(source) {
  for (const p of PARAMETROS) {
    const num = document.getElementById("v-" + p.key), rng = document.getElementById("r-" + p.key);
    if (source === rng) num.value = rng.value; else if (source === num) rng.value = num.value;
    const v = Number(num.value);
    // Todo en milímetros enteros cuando el paso es de 1 o más.
    if (Number.isFinite(v) && v > 0) state[p.key] = p.step >= 1 ? Math.round(v) : v;
  }
  // Variables que siguen a otras (DESIGN.enlazar).
  const key = source && source.id ? source.id.slice(2) : null;
  if (key && DESIGN.enlazar) { const sigue = DESIGN.enlazar(state, key); if (sigue) for (const k in sigue) setValue(k, sigue[k]); }
  const prevDims = model ? model.dims.map((d) => d.value) : null;
  model = DESIGN.generate(state);
  // Rangos que dependen de las otras medidas: el deslizador no deja pasarlos.
  const lim = DESIGN.limits ? DESIGN.limits(model.P) : {};
  for (const p of PARAMETROS) {
    const [a, b2] = lim[p.key] || [p.min, p.max], rng = document.getElementById("r-" + p.key), num = document.getElementById("v-" + p.key);
    num.min = a; num.max = b2;
    rng.value = model.P[p.key];
    if (source === "commit" || source === rng) num.value = p.step >= 1 ? Math.round(model.P[p.key]) : model.P[p.key];
  }
  document.getElementById("plan").innerHTML = planSvg(prevDims);
  // La leyenda muestra sólo los tipos de línea que tiene el troquel.
  document.querySelectorAll(".legend [data-k]").forEach((el) => { el.hidden = !model.entities.some((e) => e.k === el.dataset.k); });
  applyActive();
  if (DESIGN.atajos) document.querySelectorAll("[data-atajo]").forEach((b) => b.setAttribute("aria-pressed", String(Math.abs(Number(b.dataset.atajo) - model.P[DESIGN.atajos.key]) < 1e-9)));
  document.getElementById("facts").innerHTML = DESIGN.resumen(model).map(([k, v, hint]) => '<div class="row"><dt>' + k + "</dt><dd><strong>" + v + "</strong><span>" + hint + "</span></dd></div>").join("");
  clearTimeout(hotTimer);
  hotTimer = setTimeout(() => document.querySelectorAll(".hot").forEach((e) => e.classList.remove("hot")), 1400);
}
const name = () => DESIGN.archivo(model);
const say = (t) => (document.getElementById("status").textContent = t);
${artefacto ? `// En claude.ai el visor guarda archivos sólo con el permiso de descargas. Se intenta el .dxf o .cf2
// directo; si el visor no acepta esa extensión, se guarda con .txt al final para renombrar.
let downloads = null;
window.claude?.use?.("downloads").then((d) => { downloads = d; }).catch(() => {});
async function download(text, ext) {
  if (!downloads) { say("Las descargas no están disponibles en esta vista."); return; }
  const file = name() + "." + ext;
  try {
    await downloads.save({ filename: file, data: text });
    say("Guardado " + file + ".");
  } catch (e) {
    if (e && e.code === "rejected_extension") {
      try {
        await downloads.save({ filename: file + ".txt", data: text });
        say("claude.ai no deja guardar ." + ext + ": se guardó " + file + ".txt. Borrale el .txt del nombre y abrilo en ArtiosCAD.");
      } catch (e2) { say(e2 && e2.code === "declined" ? "Descarga cancelada." : "No se pudo descargar."); }
      return;
    }
    say(e && e.code === "declined" ? "Descarga cancelada." : "No se pudo descargar (" + ((e && e.code) || "error") + ").");
  }
}` : `function download(text, ext) {
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/octet-stream" }));
    a.download = name() + "." + ext;
    document.body.appendChild(a); a.click(); a.remove();
    say("Descarga iniciada: " + a.download + ".");
  } catch (e) { say("No se pudo descargar."); }
}`}
document.getElementById("dl-dxf").addEventListener("click", () => download(DESIGN.dxf(model, name()), "dxf"));
document.getElementById("dl-cf2").addEventListener("click", () => download(DESIGN.cf2(model, name()), "cf2"));
form.addEventListener("input", (e) => render(e.target));
// Variable activa: mientras se toca o tiene el foco, ella y sus cotas se marcan en naranja.
const setActive = (key) => { if (activeVar !== key) { activeVar = key; applyActive(); } };
// Al soltar (dejar de arrastrar, terminar de escribir o salir del campo) vuelve a la normalidad con
// un fundido de 1,5 s; al tocar de nuevo, el naranja aparece al instante.
let releaseTimer = 0;
const hold = (key) => { clearTimeout(releaseTimer); setActive(key); };
const release = (delay = 0) => { clearTimeout(releaseTimer); releaseTimer = setTimeout(() => setActive(null), delay); };
form.addEventListener("pointerdown", (e) => { const row = e.target.closest(".var"); if (row) hold(row.dataset.key); });
document.addEventListener("pointerup", () => { if (activeVar) release(); });
document.addEventListener("pointercancel", () => { if (activeVar) release(); });
form.addEventListener("keydown", (e) => { const row = e.target.closest(".var"); if (row) hold(row.dataset.key); });
form.addEventListener("keyup", () => release(700));
form.addEventListener("change", () => release());
form.addEventListener("focusout", () => release());
document.getElementById("formulas").addEventListener("click", (e) => {
  showFormulas = !showFormulas;
  e.currentTarget.setAttribute("aria-pressed", String(showFormulas));
  e.currentTarget.textContent = showFormulas ? "Ocultar fórmulas" : "Ver fórmulas";
  document.getElementById("legend-dim").textContent = showFormulas ? "Fórmula = valor" : "Cota de variable";
  document.getElementById("plan").innerHTML = planSvg(null);
  applyActive();
});
form.addEventListener("change", () => render("commit"));
document.querySelectorAll("[data-atajo]").forEach((b) => b.addEventListener("click", () => {
  setValue(DESIGN.atajos.key, Number(b.dataset.atajo));
  render("commit"); say(DESIGN.atajos.titulo + " " + b.textContent.split(" · ")[0] + ": " + b.dataset.atajo + " mm.");
}));
document.getElementById("reset").addEventListener("click", () => {
  for (const k in INICIAL) setValue(k, INICIAL[k]);
  render("commit"); say("");
});
render();
</script>
`;
}
