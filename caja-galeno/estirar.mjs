// Estira el troquel 6463 para un frasco más largo y escribe un DXF R12 limpio.
// node estirar.mjs [mm=50]  →  troquel-6463-mas<mm>.dxf
//
// El frasco va acostado a lo ancho de la caja (los 320 mm). Para alargarlo hay que:
//  · ensanchar el contrafrente y el frente: todo lo que está a la izquierda de x=330 (dentro del frente)
//    se corre −E y lo que está a la derecha de x=650 (dentro del contrafrente) +E; tapas, pestañas, lengüetas
//    y contratapas se estiran con ellos, y la ranura y el diente de la traba siguen alineados;
//  · alargar el panel central del interior: lo que está arriba de y=887.5 en la pieza interior sube +E.
// Agujeros, ranuras, tabiques y profundidad (94) no cambian.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export const CUTS = { frontAt: 330, backAt: 650, insertFrom: 990, insertAt: 887.5, insertTop: 1225 };

// Mapeo de un punto del plano original al estirado.
export function stretchOf(E) {
  return ([x, y]) => {
    if (x > CUTS.insertFrom) return [x + E, y > CUTS.insertAt && y < CUTS.insertTop ? y + E : y];
    return [x < CUTS.frontAt ? x - E : x > CUTS.backAt ? x + E : x, y];
  };
}

function entities(file) {
  const lines = readFileSync(file, "latin1").split(/\r?\n/);
  const pairs = [];
  for (let i = 0; i + 1 < lines.length; i += 2) pairs.push([Number(lines[i].trim()), lines[i + 1].trim()]);
  const start = pairs.findIndex(([c, v], i) => c === 2 && v === "ENTITIES" && pairs[i - 1][1] === "SECTION");
  const out = [];
  let e = null;
  for (let i = start + 1; i < pairs.length; i++) {
    const [code, value] = pairs[i];
    if (code === 0) {
      if (e) out.push(e);
      if (value === "ENDSEC") break;
      e = { type: value, color: 256 };
    } else if (e) {
      if (code === 8) e.layer = value;
      else if (code === 62) e.color = Number(value);
      else if ([10, 20, 11, 21, 40, 50, 51].includes(code)) e[code] ??= Number(value);
    }
  }
  return out.filter((x) => x.layer === "Troquel" && (x.type === "LINE" || x.type === "ARC"));
}

export function stretchDxf(src, E) {
  const map = stretchOf(E);
  const items = [];
  for (const e of entities(src)) {
    if (e.type === "LINE") {
      const a = map([e[10], e[20]]), b = map([e[11], e[21]]);
      items.push({ type: "LINE", color: e.color, a, b });
    } else {
      // Un arco no puede cruzar una línea de estiramiento: se movería deformado.
      const pts = [];
      let a0 = e[50], a1 = e[51];
      if (a1 <= a0) a1 += 360;
      for (let t = a0; t <= a1 + 1e-9; t += (a1 - a0) / 16) pts.push([e[10] + e[40] * Math.cos((t * Math.PI) / 180), e[20] + e[40] * Math.sin((t * Math.PI) / 180)]);
      const moves = new Set(pts.map((p) => { const q = map(p); return `${(q[0] - p[0]).toFixed(3)},${(q[1] - p[1]).toFixed(3)}`; }));
      if (moves.size > 1) throw new Error(`un arco cruza una línea de estiramiento en (${e[10]}, ${e[20]})`);
      const c = map([e[10], e[20]]);
      items.push({ type: "ARC", color: e.color, c, r: e[40], a0: e[50], a1: e[51] });
    }
  }
  return items;
}

function dxfR12(items, notes) {
  const out = [];
  const put = (code, value) => out.push(String(code).padStart(3), String(value));
  const f = (v) => (Math.round(v * 1e4) / 1e4).toString();
  put(0, "SECTION"); put(2, "HEADER");
  put(9, "$ACADVER"); put(1, "AC1009");
  put(9, "$INSUNITS"); put(70, 4);
  put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "TABLES");
  put(0, "TABLE"); put(2, "LAYER"); put(70, 2);
  for (const [name, color] of [["Troquel", 4], ["Referencias", 5]]) { put(0, "LAYER"); put(2, name); put(70, 0); put(62, color); put(6, "CONTINUOUS"); }
  put(0, "ENDTAB");
  put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "ENTITIES");
  for (const it of items) {
    if (it.type === "LINE") {
      put(0, "LINE"); put(8, "Troquel"); put(62, it.color);
      put(10, f(it.a[0])); put(20, f(it.a[1])); put(30, 0); put(11, f(it.b[0])); put(21, f(it.b[1])); put(31, 0);
    } else {
      put(0, "ARC"); put(8, "Troquel"); put(62, it.color);
      put(10, f(it.c[0])); put(20, f(it.c[1])); put(30, 0); put(40, f(it.r)); put(50, f(it.a0)); put(51, f(it.a1));
    }
  }
  for (const n of notes) { put(0, "TEXT"); put(8, "Referencias"); put(10, f(n.at[0])); put(20, f(n.at[1])); put(30, 0); put(40, n.h); put(1, n.text); }
  put(0, "ENDSEC");
  put(0, "EOF");
  return out.join("\r\n") + "\r\n";
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const E = Number(process.argv[2] ?? 50);
  const items = stretchDxf(join(HERE, "troquel-6463.dxf"), E);
  const W = 320 + E;
  const notes = [
    { at: [30, 1330], h: 14, text: `TROQUEL 6463 +${E} (frasco ${E} mm mas largo)` },
    { at: [30, 1305], h: 8, text: `Caja ${W} x 94 x 276 mm - frente ${323 + E} - contrafrente ${W} - interior 268 x ${663 + E}, panel central ${255 + E}` },
    { at: [30, 1288], h: 8, text: "Colores: 1 corte - 2 hendido - 6 intermitente 5x5. Troquelar de dorso." },
  ];
  const file = `troquel-6463-mas${E}.dxf`;
  writeFileSync(join(HERE, file), dxfR12(items, notes));
  console.log("wrote", file, items.length, "entidades");
}
