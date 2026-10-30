// Verifica el generador en muchas combinaciones de medidas con la verificación común
// (../../troqueles/verificar.mjs: sin extremos sueltos, cruces ni superposiciones) y además
// que con los valores del 6463 salga el troquel original (32 piezas).
// node check.mjs [casos aleatorios = 400]
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { toDxf } from "./galeno.mjs";
import { crearDiseno } from "./diseno.mjs";
import { readDxf, facesOf } from "../troquel.mjs";
import { verificarDiseno, informar } from "../../troqueles/verificar.mjs";

const design = crearDiseno(JSON.parse(readFileSync(new URL("./plantilla-caja.json", import.meta.url))));

function faces(model) {
  const tmp = new URL("./_check.dxf", import.meta.url);
  writeFileSync(tmp, toDxf(model, { dims: false }).replace(/CORTE|HENDIDO|PERFORADO/g, "Troquel"));
  const n = facesOf(readDxf(tmp.pathname)).faces.length;
  unlinkSync(tmp);
  return n;
}

const casos = [
  { p: 86.25 },
  { L: 370 },
  { L: 400, A: 110, H: 300, t: 32, n: 4, Dc: 70, Dn: 28, p: 72 },
  { Dc: 100, A: 110 },
  { Dc: 100, A: 200, H: 600, n: 6, p: 20 },
  { Dc: 100, A: 94 },
  { Dc: 36, Dn: 30, A: 60, H: 120, n: 6, p: 20 },
  { L: 210, A: 60, H: 120, t: 10 },
];
const result = verificarDiseno(design, {
  casos,
  aleatorios: Number(process.argv[2] ?? 400),
  extra: (m, i) => {
    if (i !== 1) return [];
    const n = faces(m);
    return n === 32 ? [] : [`el 6463 da ${n} piezas, no 32`];
  },
});
process.exit(informar(result));
