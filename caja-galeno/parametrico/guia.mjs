// Escribe guia-artioscad.html: la guía del galeno paramétrico con el plano anotado por fórmulas.
// node guia.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULTS, PARAMS, generate, fmt } from "./galeno.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const model = generate({}, JSON.parse(readFileSync(join(HERE, "plantilla-caja.json"), "utf8")));

// Fórmula de cada cota del generador, por dirección y nombre.
const FORMULA = {
  h: { costado: "A", frente: "L + 3", contrafrente: "L", pegado: "A − 3", interior: "H − 6", caja: "3A + 2L", "plano total": "" },
  v: { lengüeta: "A − 4", pestaña: "10", tapa: "A", contrafrente: "H + 22", frente: "H", pared: "A − 6", puente: "t", tabique: "A − 6", panel: "L − 65", interior: "4A + 2t + L − 89", "plano total": "" },
};

const b = model.info.bounds;
// Las cotas totales del interior se corren afuera para dejar lugar a las etiquetas horizontales.
for (const d of model.dims) if (d.dir === "v" && d.at > b.xMax + 60) d.at += 100;
const X0 = b.xMin - 40, X1 = b.xMax + 330, Y0 = b.yMin - 175, Y1 = b.yMax + 30;
const Y = (y) => Y1 - y;
const f = (v) => (Math.round(v * 10) / 10).toString();
const paths = { c: "", h: "", p: "" };
for (const e of model.entities) {
  if (e.t === "L") paths[e.k] += `M${f(e.a[0])} ${f(Y(e.a[1]))}L${f(e.b[0])} ${f(Y(e.b[1]))}`;
  else {
    let sweep = e.a1 - e.a0;
    while (sweep <= 0) sweep += 360;
    while (sweep > 360) sweep -= 360;
    const at = (a) => [e.c[0] + e.r * Math.cos((a * Math.PI) / 180), e.c[1] + e.r * Math.sin((a * Math.PI) / 180)];
    const [s, t] = [at(e.a0), at(e.a1)];
    paths[e.k] += `M${f(s[0])} ${f(Y(s[1]))}A${f(e.r)} ${f(e.r)} 0 ${sweep > 180 ? 1 : 0} 0 ${f(t[0])} ${f(Y(t[1]))}`;
  }
}
const arrow = (x0, y0, x1, y1) => {
  const L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L, s = Math.min(9, L / 4), w = s * 0.35;
  const h = (x, y, dx, dy) => `M${f(x)} ${f(y)}L${f(x + dx * s - dy * w)} ${f(y + dy * s + dx * w)}L${f(x + dx * s + dy * w)} ${f(y + dy * s - dx * w)}Z`;
  return h(x0, y0, ux, uy) + h(x1, y1, -ux, -uy);
};
const plain = (d) => { const formula = FORMULA[d.dir][d.name], v = fmt(d.value); return formula && formula !== v ? `${formula} = ${v}` : v; };
const label = (d) => {
  const formula = FORMULA[d.dir][d.name];
  const v = fmt(d.value);
  return formula && formula !== v ? `<tspan class="fx">${formula}</tspan><tspan class="val"> = ${v}</tspan>` : `<tspan class="val">${v}</tspan>`;
};
const dims = model.dims
  .map((d) => {
    if (d.dir === "h") {
      const y = Y(d.at);
      return `<g class="dim"><path d="M${f(d.x0)} ${f(y - 8)}V${f(y + 8)}M${f(d.x1)} ${f(y - 8)}V${f(y + 8)}M${f(d.x0)} ${f(y)}H${f(d.x1)}"/><path class="ar" d="${arrow(d.x0, y, d.x1, y)}"/><text x="${f((d.x0 + d.x1) / 2)}" y="${f(y - 7)}">${label(d)}</text></g>`;
    }
    const x = d.at, ym = Y((d.y0 + d.y1) / 2);
    // Si la etiqueta no entra a lo largo del tramo, va horizontal al costado.
    const fits = plain(d).length * 10.4 < Math.abs(d.y1 - d.y0) - 12;
    if (!fits) return `<g class="dim"><path d="M${f(x - 8)} ${f(Y(d.y0))}H${f(x + 8)}M${f(x - 8)} ${f(Y(d.y1))}H${f(x + 8)}M${f(x)} ${f(Y(d.y0))}V${f(Y(d.y1))}"/><path class="ar" d="${arrow(x, Y(d.y0), x, Y(d.y1))}"/><text class="side" x="${f(x + 10)}" y="${f(ym + 6)}">${label(d)}</text></g>`;
    return `<g class="dim"><path d="M${f(x - 8)} ${f(Y(d.y0))}H${f(x + 8)}M${f(x - 8)} ${f(Y(d.y1))}H${f(x + 8)}M${f(x)} ${f(Y(d.y0))}V${f(Y(d.y1))}"/><path class="ar" d="${arrow(x, Y(d.y0), x, Y(d.y1))}"/><text x="${f(x - 7)}" y="${f(ym)}" transform="rotate(-90 ${f(x - 7)} ${f(ym)})">${label(d)}</text></g>`;
  })
  .join("");
// Llamadas a piezas sin cota propia, en coordenadas del 6463 por defecto.
const callouts = [
  [530, 1090, "guardapolvo A + 26"],
  [944, 1090, "A + 28,5"],
  [112, 1050, "oreja × A/94"],
  [326, 1068, "contratapa A − 6"],
  [741.5, 1000, "traba 86,5 × 10"],
  [741.5, 1228, "diente 85 × 5"],
  [1218.1, 1059, "⌀Dc"],
  [1131.1, 1068, "Dn"],
  [1131.1, 600, "muesca 35 × 4"],
]
  .map(([x, y, t]) => `<text class="call" x="${f(x)}" y="${f(Y(y))}">${t}</text>`)
  .join("");
const plan = `<svg class="plan" viewBox="${f(X0)} 0 ${f(X1 - X0)} ${f(Y1 - Y0)}" role="img" aria-label="Troquel galeno 6463 con cada cota expresada en las variables L, A, H y t">
<path class="c" d="${paths.c}"/><path class="h" d="${paths.h}"/><path class="p" d="${paths.p}"/>${dims}${callouts}</svg>`;

const row = (cells) => `<tr>${cells.map((c, i) => `<td${i ? "" : ' class="k"'}>${c}</td>`).join("")}</tr>`;
const table = (head, rows) => `<div class="scroll"><table><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${rows.map(row).join("")}</tbody></table></div>`;

const page = `<title>Galeno 6463 para ArtiosCAD</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500&display=swap">
<style>
/* Ficha técnica de troquel: plano anotado arriba, tablas de fórmulas debajo, en dos columnas. */
:root{
  --paper:#f4f5f2;--sheet:#fcfcfa;--ink:#24282b;--soft:#6b7176;--rule:#c9ccc8;--crease:#8b9095;--accent:#1f5fbf;
  --display:"Barlow Condensed","Arial Narrow",sans-serif;--body:"IBM Plex Sans",system-ui,sans-serif;--mono:"IBM Plex Mono",ui-monospace,Menlo,monospace;
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#7fb0ff;color-scheme:dark}}
:root[data-theme="dark"]{--paper:#121416;--sheet:#181b1e;--ink:#dfe3e6;--soft:#8d959b;--rule:#33383d;--crease:#7c848a;--accent:#7fb0ff;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--paper);color:var(--ink);font:15px/1.55 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
main{max-width:1180px;margin:0 auto;padding-block:32px 64px;display:grid;gap:24px}
header{display:grid;gap:6px}
.tag{font:500 12px/1.3 var(--mono);color:var(--soft);letter-spacing:.06em;text-transform:uppercase}
h1{font:600 clamp(28px,4vw,42px)/1.05 var(--display);margin:0;text-wrap:balance}
h2{font:600 19px/1.2 var(--display);letter-spacing:.05em;text-transform:uppercase;margin:0}
h3{font:600 15px/1.3 var(--body);margin:0}
p{margin:0;max-width:70ch}
.lede{color:var(--soft)}
.sheet{background:var(--sheet);border:1px solid var(--rule);padding:18px;display:grid;gap:14px;min-width:0}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;gap:4px 16px;align-items:baseline}
.scroll{overflow-x:auto}
svg.plan{display:block;width:100%;min-width:680px;height:auto}
.plan .c{fill:none;stroke:var(--ink);stroke-width:1.1;vector-effect:non-scaling-stroke}
.plan .h{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:6 4;vector-effect:non-scaling-stroke}
.plan .p{fill:none;stroke:var(--crease);stroke-width:.9;stroke-dasharray:2 3;vector-effect:non-scaling-stroke}
.dim path{fill:none;stroke:var(--accent);stroke-width:.6;vector-effect:non-scaling-stroke}
.dim .ar{fill:var(--accent);stroke:none}
.dim text{font:500 17px var(--mono);text-anchor:middle}
.dim text.side{text-anchor:start;font-size:15px}
.dim .fx{fill:var(--accent);font-weight:600}.dim .val{fill:var(--soft)}
.call{font:500 14px var(--mono);fill:var(--soft);text-anchor:middle}
.legend{display:flex;flex-wrap:wrap;gap:6px 20px;font-size:13px;color:var(--soft)}
.legend span{display:inline-flex;align-items:center;gap:8px}.legend svg{width:28px;height:8px}
.cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:24px;align-items:start}
@media (max-width:820px){.cols{grid-template-columns:minmax(0,1fr)}}
table{width:100%;border-collapse:collapse;font-size:14px}
th{font:500 11.5px var(--mono);letter-spacing:.06em;text-transform:uppercase;color:var(--soft);text-align:left;padding:6px 8px;border-bottom:1px solid var(--rule)}
td{padding:6px 8px;border-bottom:1px solid var(--rule);vertical-align:top}
td:not(.k){font-family:var(--mono);font-variant-numeric:tabular-nums}
td.k{color:var(--ink)}
code,.v{font:500 13.5px var(--mono);color:var(--accent)}
ol,ul{margin:0;padding-left:1.2em;display:grid;gap:8px;max-width:72ch}
li b{font-weight:500}
.note{color:var(--soft);font-size:14px}
</style>
<main>
  <header>
    <span class="tag">Troquel 6463 · caja tipo galeno · guía de diseño paramétrico</span>
    <h1>Galeno 6463 para ArtiosCAD</h1>
    <p class="lede">Cada medida del troquel escrita en función de sus variables, para generarlo con el script o rearmarlo como diseño paramétrico dentro de ArtiosCAD. El plano muestra los valores del 6463 original.</p>
  </header>

  <section class="sheet" aria-labelledby="t-plano">
    <div class="head"><h2 id="t-plano">Plano con fórmulas</h2><span class="tag">L ${DEFAULTS.L} · A ${DEFAULTS.A} · H ${DEFAULTS.H} · t ${DEFAULTS.t} · mm</span></div>
    <div class="legend" aria-hidden="true">
      <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--ink)" stroke-width="1.4"/></svg>Corte</span>
      <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="6 4"/></svg>Hendido</span>
      <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--crease)" stroke-width="1.2" stroke-dasharray="2 3"/></svg>Intermitente 5×5</span>
      <span><svg viewBox="0 0 28 8"><path d="M0 4H28" stroke="var(--accent)" stroke-width="1.2"/></svg>Fórmula = valor</span>
    </div>
    <div class="scroll">${plan}</div>
  </section>

  <div class="cols">
    <section class="sheet" aria-labelledby="t-vars">
      <h2 id="t-vars">Variables</h2>
      ${table(["Var", "Qué es", "6463"], PARAMS.map((p) => [`<span class="v">${p.key}</span>`, p.label, String(DEFAULTS[p.key]).replace(".", ",")]))}
      <p class="note">El frasco entra hasta <span class="v">L − 14</span> de largo. El interior mide <span class="v">H − 6</span> de ancho y <span class="v">4A + 2t + L − 89</span> de largo; plegado ocupa <span class="v">L − 65 + 2t</span> × <span class="v">H − 6</span> × <span class="v">A − 6</span>.</p>
    </section>
    <section class="sheet" aria-labelledby="t-tubo">
      <h2 id="t-tubo">Tubo</h2>
      ${table(["Panel", "Ancho", "Alto entre hendidos", "Desde el hendido del contrafrente"], [
        ["Costado exterior", "A", "H + 16", "3"],
        ["Frente", "L + 3", "H", "11"],
        ["Costado", "A", "H + 13", "4,5"],
        ["Contrafrente", "L", "H + 22", "0"],
        ["Solapa de pegado", "A − 3", "H + 8", "7"],
      ])}
      <p class="note">Los corrimientos (3; 4,5; 7; 11) son las compensaciones de espesor del 6463, cartón de alrededor de 1,5 mm.</p>
    </section>
    <section class="sheet" aria-labelledby="t-cierre">
      <h2 id="t-cierre">Cierres, iguales en ambos extremos</h2>
      ${table(["Pieza", "Medida"], [
        ["Tapa, sobre el contrafrente", "A × L"],
        ["Pestaña de pared doble", "10"],
        ["Lengüeta", "(A − 4) × (L − 17)"],
        ["Diente de la lengüeta", "85 × 5, centrado"],
        ["Ranura de traba", "86,5 × 10, centrada, junto al hendido de la tapa"],
        ["Contratapa, sobre el frente", "A − 6; tramo recto L − 135,3; R30"],
        ["Guardapolvo del costado", "A + 26"],
        ["Guardapolvo de la solapa", "A + 28,5"],
        ["Oreja del costado exterior", "curva del 6463 × A/94 (R 134,8 · 101,04 · 16,78)"],
      ])}
    </section>
    <section class="sheet" aria-labelledby="t-int">
      <h2 id="t-int">Interior</h2>
      ${table(["Fila, desde abajo", "Alto", "Línea superior"], [
        ["Pared exterior B", "A − 6", "hendido"],
        ["Puente B", "t", "hendido"],
        ["Tabique B", "A − 6", "intermitente 5×5"],
        ["Panel central", "L − 65", "intermitente 5×5"],
        ["Tabique A", "A − 6", "hendido"],
        ["Puente A", "t", "hendido"],
        ["Pared exterior A", "A − 6", "borde"],
      ])}
      <ul>
        <li><b>Frascos</b> en <span class="v">Wi/2 + (i − (n − 1)/2)·p</span>, alternados: los pares apoyan el cuerpo en el tabique A y el cuello en el B.</li>
        <li><b>Agujero del cuerpo:</b> círculo <span class="v">Dc</span> en el centro del tabique, lengüeta de apoyo de 33 unida al panel hasta 13 antes del centro, y muesca de 25 hasta el hendido.</li>
        <li><b>Ranura del cuello:</b> fondo semicircular <span class="v">Dn/2</span>, lados rectos hasta 23,8 del hendido, boca de 40 abierta por todo el puente.</li>
        <li><b>Muesca de borde:</b> 35 × 4 en la pared exterior, del lado del cuerpo.</li>
      </ul>
    </section>
  </div>

  <div class="cols">
    <section class="sheet" aria-labelledby="t-abrir">
      <h2 id="t-abrir">Abrir en ArtiosCAD</h2>
      <ol>
        <li><b>DXF, recomendado.</b> Al importar, asigná <code>CORTE</code> a corte 2 pt, <code>HENDIDO</code> a hendido 2 pt, <code>PERFORADO</code> al perforado intermitente 5×5 y <code>COTAS</code> a anotación. Guardá la asignación para las próximas variantes. Unidades en mm; se troquela de dorso.</li>
        <li><b>CF2.</b> Cada línea trae su tipo (1 corte, 2 hendido, 3 perforado) con pointage 2 pt. No pude validar el formato en ArtiosCAD: probá primero el DXF y revisá que el perforado tome tu 5×5.</li>
        <li><b>Paramétrico nativo.</b> Creá las variables <span class="v">L</span>, <span class="v">A</span>, <span class="v">H</span> y <span class="v">t</span> en ArtiosCAD y acotá cada línea con las fórmulas de esta ficha.</li>
      </ol>
    </section>
    <section class="sheet" aria-labelledby="t-gen">
      <h2 id="t-gen">Generar otras medidas</h2>
      <p>Desde <code>caja-galeno/parametrico</code> en el repositorio:</p>
      <ul>
        <li><code>node generar.mjs --L 370</code> escribe el +50 en DXF y CF2.</li>
        <li><code>node generar.mjs --L 400 --A 110 --n 4 --Dc 70</code> cambia caja y frascos.</li>
        <li><code>galeno-parametrico.html</code> hace lo mismo en el navegador, con vista previa.</li>
      </ul>
      <p class="note">El <code>.ARD</code> de ArtiosCAD es un formato cerrado: el paramétrico nativo se arma dentro de ArtiosCAD con estas fórmulas.</p>
    </section>
  </div>
</main>
`;
writeFileSync(join(HERE, "guia-artioscad.html"), page);
console.log("wrote guia-artioscad.html", (page.length / 1024).toFixed(0) + " KB");
