// Verifica el generador en muchas combinaciones de medidas con la verificación común
// (../troqueles/verificar.mjs: sin extremos sueltos, cruces ni superposiciones) y además que cada
// caja tenga sus 13 piezas: 4 paneles, 8 solapas y la solapa de pegado.
// node check.mjs [casos aleatorios = 400]
import { writeFileSync, unlinkSync } from "node:fs";
import { crearDiseno } from "./diseno.mjs";
import { readDxf, facesOf } from "../caja-galeno/troquel.mjs";
import { escribirDxf } from "../troqueles/cad.mjs";
import { verificarDiseno, informar } from "../troqueles/verificar.mjs";

function piezas(model) {
  const tmp = new URL("./_check.dxf", import.meta.url);
  writeFileSync(tmp, escribirDxf(model).replace(/CORTE|HENDIDO|PERFORADO/g, "Troquel"));
  const n = facesOf(readDxf(tmp.pathname)).faces.length;
  unlinkSync(tmp);
  return n;
}

const result = verificarDiseno(crearDiseno(), {
  casos: [{ e: 2 }, { e: 4 }, { L: 800, A: 80, H: 50, g: 50, e: 7 }, { L: 100, A: 600, H: 800, g: 25, e: 1 }],
  aleatorios: Number(process.argv[2] ?? 400),
  extra: (m, i) => {
    if (i % 20 !== 0 && i > 6) return [];
    const n = piezas(m);
    return n === 13 ? [] : [`da ${n} piezas, no 13`];
  },
});
process.exit(informar(result));
