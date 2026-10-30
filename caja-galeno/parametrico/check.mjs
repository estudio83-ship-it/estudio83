// Compara el generador con el troquel original (valores por defecto) y con la variante +50.
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { generate, toDxf } from "./galeno.mjs";
import { readDxf, facesOf } from "../troquel.mjs";
const plantilla = JSON.parse(readFileSync(new URL("./plantilla-caja.json", import.meta.url)));
for (const params of [{}, { L: 370 }, { L: 400, A: 110, H: 300, n: 4, Dc: 70, Dn: 28, p: 72 }]) {
  const m = generate(params, plantilla);
  const tmp = new URL("./_check.dxf", import.meta.url);
  writeFileSync(tmp, toDxf(m, { dims: false }).replace(/CORTE/g, "Troquel").replace(/HENDIDO/g, "Troquel").replace(/PERFORADO/g, "Troquel"));
  const f = facesOf(readDxf(tmp.pathname));
  unlinkSync(tmp);
  console.log(JSON.stringify(params), "caras", f.faces.length, "aviso", m.warnings, m.info);
}
