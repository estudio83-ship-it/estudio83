// Genera el troquel galeno con los parámetros dados, en DXF y CF2 para ArtiosCAD.
// node generar.mjs --Lb 356 --Dc 80 --Dn 31 --n 3 --p 86.25 --A 94 --H 274 --t 28 --e 3 [--nombre GALENO-370]
// Lb es el largo de la botella: la caja sale de L = Lb + 3e + 5. También acepta --L (largo de caja).
// El DXF lleva las líneas del troquel y las cotas H y L; [--sin-cotas] o [--todas-las-cotas] lo cambian.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULTS, generate, toDxf, toCf2 } from "./galeno.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : undefined; };
const params = {};
for (const key of [...Object.keys(DEFAULTS), "L"]) if (opt(key) !== undefined) params[key] = Number(opt(key));
const model = generate(params, JSON.parse(readFileSync(join(HERE, "plantilla-caja.json"), "utf8")));
const name = opt("nombre") ?? `GALENO-${model.P.L}x${model.P.A}x${model.P.H}`;
if (model.warnings.length) console.warn("Avisos:\n  " + model.warnings.join("\n  "));
writeFileSync(join(HERE, `${name}.dxf`), toDxf(model, { dims: args.includes("--sin-cotas") ? false : args.includes("--todas-las-cotas") ? true : "HL", name }));
writeFileSync(join(HERE, `${name}.cf2`), toCf2(model, { name }));
console.log(`wrote ${name}.dxf y ${name}.cf2 · caja ${model.info.caja} · plancha ${model.info.plancha} · ${model.info.botella}`);
