// Escribe galeno-parametrico.html: el generador con vista previa acotada y exportación DXF / CF2.
// node build.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
// --artefacto: versión para publicar en claude.ai, donde el visor no permite descargas: sólo copiar.
const ARTIFACT = process.argv.includes("--artefacto");
const outAt = process.argv.indexOf("--out");
const lib = readFileSync(join(HERE, "galeno.mjs"), "utf8").replace(/^export /gm, "");
const plantilla = readFileSync(join(HERE, "plantilla-caja.json"), "utf8");

const page = `<title>Galeno paramétrico</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
/* Mesa de diseño de troqueles: panel de variables a la izquierda, plano acotado a la derecha. */
:root{
  --paper:#f4f5f2;--sheet:#fcfcfa;--ink:#24282b;--soft:#6b7176;--rule:#c9ccc8;--crease:#8b9095;--accent:#1f5fbf;--warn:#a4441b;--field:#ffffff;
  --display:"Barlow Condensed","Arial Narrow",sans-serif;--body:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#7fb0ff;--warn:#f0956b;--field:#101214;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#7fb0ff;--warn:#f0956b;--field:#101214;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:15px/1.55 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1240px;margin:0 auto;padding-block:32px 56px;display:grid;gap:22px}
header{display:grid;gap:6px}
.tag{font:500 12px/1.3 var(--mono);color:var(--soft);letter-spacing:.06em;text-transform:uppercase}
h1{font:600 clamp(28px,4vw,40px)/1.05 var(--display);margin:0;text-wrap:balance}
h2{font:600 18px/1.2 var(--display);letter-spacing:.05em;text-transform:uppercase;margin:0}
.lede{color:var(--soft);max-width:68ch;margin:0}
.desk{display:grid;grid-template-columns:300px minmax(0,1fr);gap:22px;align-items:start}
@media (max-width:860px){.desk{grid-template-columns:minmax(0,1fr)}}
.sheet{background:var(--sheet);border:1px solid var(--rule);padding:16px;display:grid;gap:12px;min-width:0}
form{display:grid;gap:10px}
.var{display:grid;grid-template-columns:34px minmax(0,1fr) 82px;gap:4px 10px;align-items:center}
.var b{font:500 14px var(--mono);color:var(--accent)}
.var label{font-size:13px;color:var(--soft);line-height:1.25}
.var input{width:100%;font:500 14px var(--mono);color:var(--ink);background:var(--field);border:1px solid var(--rule);padding:6px 8px;text-align:right;font-variant-numeric:tabular-nums}
.var input:focus-visible,button:focus-visible{outline:2px solid var(--accent);outline-offset:1px}
.presets{display:flex;flex-wrap:wrap;gap:6px}
button{font:500 13px var(--body);color:var(--ink);background:transparent;border:1px solid var(--rule);padding:7px 10px;cursor:pointer}
button:hover{border-color:var(--ink)}
button.primary{background:var(--ink);color:var(--sheet);border-color:var(--ink)}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.facts{display:grid;grid-template-columns:auto minmax(0,1fr);gap:4px 12px;margin:0;font-size:13px}
.facts dt{color:var(--soft)}.facts dd{margin:0;font-family:var(--mono);font-variant-numeric:tabular-nums}
.warn{margin:0;padding:0;list-style:none;display:grid;gap:6px;color:var(--warn);font-size:13px}
.status{font:13px var(--mono);color:var(--soft);min-height:1.4em;margin:0}
.scroll{overflow-x:auto}
svg.plan{display:block;width:100%;min-width:620px;height:auto}
.plan .c{fill:none;stroke:var(--ink);stroke-width:1.1;vector-effect:non-scaling-stroke}
.plan .h{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.plan .p{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:2 3;vector-effect:non-scaling-stroke}
.plan .d{fill:none;stroke:var(--accent);stroke-width:.6;vector-effect:non-scaling-stroke}
.plan .ar{fill:var(--accent)}
.plan text{font:500 17px var(--mono);fill:var(--accent);text-anchor:middle}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:var(--soft)}
.legend span{display:inline-flex;align-items:center;gap:8px}
.legend svg{width:28px;height:8px}
.how{display:grid;gap:8px;color:var(--soft);max-width:75ch;margin:0;padding-left:1.2em}
.how b{color:var(--ink);font-weight:500}
code{font:13px var(--mono);color:var(--ink)}
</style>
<main>
  <header>
    <span class="tag">Troquel 6463 · caja tipo galeno · paramétrico</span>
    <h1>Galeno paramétrico para ArtiosCAD</h1>
    <p class="lede">Cambiá las variables y el troquel completo se rearma: tubo, cierres con tapa de pared doble, y el interior con los agujeros de los frascos. Exportá en DXF (capas CORTE, HENDIDO, PERFORADO, COTAS) o CF2 para abrir en ArtiosCAD.</p>
  </header>
  <div class="desk">
    <section class="sheet" aria-labelledby="vars">
      <h2 id="vars">Variables · mm</h2>
      <form id="form" autocomplete="off"></form>
      <div class="presets" aria-label="Medidas guardadas">
        <button type="button" data-preset='{"L":320}'>6463 original</button>
        <button type="button" data-preset='{"L":370}'>6463 +50</button>
      </div>
      <dl class="facts" id="facts"></dl>
      <ul class="warn" id="warn"></ul>
      <div class="actions">
${ARTIFACT ? "" : `<button type="button" class="primary" id="dl-dxf">Descargar DXF</button>
        <button type="button" id="dl-cf2">Descargar CF2</button>
        `}<button type="button"${ARTIFACT ? ' class="primary"' : ""} id="cp-dxf">Copiar DXF</button>
        <button type="button" id="cp-cf2">Copiar CF2</button>
      </div>
      <p class="status" id="status" role="status"></p>
    </section>
    <section class="sheet" aria-labelledby="plano">
      <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:6px 16px;align-items:baseline"><h2 id="plano">Plano acotado</h2><span class="tag" id="caption"></span></div>
      <div class="legend" aria-hidden="true">
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--ink)" stroke-width="1.4"/></svg>Corte</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="6 4"/></svg>Hendido</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="2 3"/></svg>Intermitente 5×5</span>
        <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--accent)" stroke-width="1.2"/></svg>Cota</span>
      </div>
      <div class="scroll" id="plan"></div>
    </section>
  </div>
  <section class="sheet" aria-labelledby="como">
    <h2 id="como">Cómo abrirlo en ArtiosCAD</h2>
    <ol class="how">
      <li><b>DXF:</b> Archivo › Abrir, tipo DXF. En las opciones de conversión asigná las capas: <code>CORTE</code> → corte, <code>HENDIDO</code> → hendido, <code>PERFORADO</code> → perforado (intermitente 5×5) y <code>COTAS</code> → anotación. Guardá la tabla de conversión para reutilizarla.</li>
      <li><b>CF2:</b> Archivo › Abrir, tipo CF2. Trae los tipos de línea en el archivo (1 corte, 2 hendido, 3 perforado) con pointage 2 pt; revisá en la primera importación que el perforado tome el patrón 5×5 de tu biblioteca.</li>
      <li><b>Paramétrico nativo:</b> la tabla de variables y fórmulas para rearmarlo como diseño paramétrico de ArtiosCAD está en <code>caja-galeno/parametrico/ARTIOSCAD.md</code>, en el repositorio del proyecto.</li>
    </ol>
  </section>
</main>
<script>
${lib}
const PLANTILLA = ${plantilla};
const form = document.getElementById("form");
const state = { ...DEFAULTS };
for (const p of PARAMS) {
  const row = document.createElement("div");
  row.className = "var";
  row.innerHTML = '<b>' + p.key + '</b><label for="v-' + p.key + '">' + p.label + '</label><input id="v-' + p.key + '" type="number" inputmode="decimal" min="' + p.min + '" max="' + p.max + '" step="' + p.step + '" value="' + DEFAULTS[p.key] + '">';
  form.appendChild(row);
}
const ns = "http://www.w3.org/2000/svg";
let model;
const fmtN = (v) => fmt(v);
function arrow(x0, y0, x1, y1) {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, s = Math.min(9, L / 4), w = s * 0.35;
  const h = (x, y, dx, dy) => "M" + x + " " + y + "L" + (x + dx * s - dy * w) + " " + (y + dy * s + dx * w) + "L" + (x + dx * s + dy * w) + " " + (y + dy * s - dx * w) + "Z";
  return h(x0, y0, ux, uy) + h(x1, y1, -ux, -uy);
}
function render() {
  for (const p of PARAMS) { const v = Number(document.getElementById("v-" + p.key).value); if (Number.isFinite(v) && v > 0) state[p.key] = p.key === "n" ? Math.max(1, Math.round(v)) : v; }
  model = generate(state, PLANTILLA);
  const b = model.info.bounds, pad = 30;
  const x0 = b.xMin - 30, x1 = b.xMax + 200, y0 = b.yMin - 170, y1 = b.yMax + 20;
  const Y = (y) => y1 - y;
  const f = (v) => (Math.round(v * 10) / 10).toString();
  const paths = { c: "", h: "", p: "" };
  for (const e of model.entities) {
    if (e.t === "L") paths[e.k] += "M" + f(e.a[0]) + " " + f(Y(e.a[1])) + "L" + f(e.b[0]) + " " + f(Y(e.b[1]));
    else {
      let sweep = e.a1 - e.a0; while (sweep <= 0) sweep += 360; while (sweep > 360) sweep -= 360;
      const r = (a) => [e.c[0] + e.r * Math.cos(a * Math.PI / 180), e.c[1] + e.r * Math.sin(a * Math.PI / 180)];
      const s = r(e.a0), t = r(e.a1);
      paths[e.k] += "M" + f(s[0]) + " " + f(Y(s[1])) + "A" + f(e.r) + " " + f(e.r) + " 0 " + (sweep > 180 ? 1 : 0) + " 0 " + f(t[0]) + " " + f(Y(t[1]));
    }
  }
  let dims = "";
  for (const d of model.dims) {
    const v = fmtN(d.value);
    if (d.dir === "h") {
      const y = Y(d.at);
      dims += '<path class="d" d="M' + f(d.x0) + " " + f(y - 8) + "V" + f(y + 8) + "M" + f(d.x1) + " " + f(y - 8) + "V" + f(y + 8) + "M" + f(d.x0) + " " + f(y) + "H" + f(d.x1) + '"/><path class="ar" d="' + arrow(d.x0, y, d.x1, y) + '"/><text x="' + f((d.x0 + d.x1) / 2) + '" y="' + f(y - 6) + '">' + v + "</text>";
    } else {
      const x = d.at, ym = Y((d.y0 + d.y1) / 2);
      dims += '<path class="d" d="M' + f(x - 8) + " " + f(Y(d.y0)) + "H" + f(x + 8) + "M" + f(x - 8) + " " + f(Y(d.y1)) + "H" + f(x + 8) + "M" + f(x) + " " + f(Y(d.y0)) + "V" + f(Y(d.y1)) + '"/><path class="ar" d="' + arrow(x, Y(d.y0), x, Y(d.y1)) + '"/><text x="' + f(x - 6) + '" y="' + f(ym) + '" transform="rotate(-90 ' + f(x - 6) + " " + f(ym) + ')">' + v + "</text>";
    }
  }
  document.getElementById("plan").innerHTML = '<svg class="plan" viewBox="' + f(x0) + " 0 " + f(x1 - x0) + " " + f(y1 - y0) + '" role="img" aria-label="Plano acotado del troquel galeno ' + model.info.caja + ' mm"><path class="c" d="' + paths.c + '"/><path class="h" d="' + paths.h + '"/><path class="p" d="' + paths.p + '"/>' + dims + "</svg>";
  document.getElementById("caption").textContent = "caja " + model.info.caja + " · plancha " + model.info.plancha;
  const facts = [["Caja", model.info.caja + " mm"], ["Plancha", model.info.plancha + " mm"], ["Frasco", model.info.frasco], ["Interior", model.info.interior]];
  document.getElementById("facts").innerHTML = facts.map(([k, v]) => "<dt>" + k + "</dt><dd>" + v + "</dd>").join("");
  document.getElementById("warn").innerHTML = model.warnings.map((w) => "<li>" + w + "</li>").join("");
}
const name = () => "GALENO-" + fmt(state.L) + "x" + fmt(state.A) + "x" + fmt(state.H);
const say = (t) => (document.getElementById("status").textContent = t);
function download(text, ext) {
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/octet-stream" }));
    a.download = name() + "." + ext;
    document.body.appendChild(a); a.click(); a.remove();
    say("Descarga iniciada: " + a.download + ". Si no aparece, usá Copiar y pegalo en un archivo ." + ext + ".");
  } catch (e) { say("No se pudo descargar aquí. Usá Copiar y pegalo en un archivo ." + ext + "."); }
}
async function copy(text, ext) {
  try { await navigator.clipboard.writeText(text); say("Copiado. Pegalo en un archivo de texto y guardalo como " + name() + "." + ext + "."); }
  catch (e) { say("El navegador no dejó copiar. Probá con Descargar."); }
}
form.addEventListener("input", render);
document.querySelectorAll("[data-preset]").forEach((b) => b.addEventListener("click", () => {
  const p = { ...DEFAULTS, ...JSON.parse(b.dataset.preset) };
  for (const k in p) document.getElementById("v-" + k).value = p[k];
  render(); say("Cargado: " + b.textContent + ".");
}));
document.getElementById("dl-dxf")?.addEventListener("click", () => download(toDxf(model, { name: name() }), "dxf"));
document.getElementById("dl-cf2")?.addEventListener("click", () => download(toCf2(model, { name: name() }), "cf2"));
document.getElementById("cp-dxf").addEventListener("click", () => copy(toDxf(model, { name: name() }), "dxf"));
document.getElementById("cp-cf2").addEventListener("click", () => copy(toCf2(model, { name: name() }), "cf2"));
render();
</script>
`;
const file = outAt > 0 ? process.argv[outAt + 1] : join(HERE, "galeno-parametrico.html");
writeFileSync(file, page);
console.log("wrote", file, (page.length / 1024).toFixed(0) + " KB");
