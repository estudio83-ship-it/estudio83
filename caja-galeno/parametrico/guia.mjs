// Escribe guia-artioscad.html: la página interactiva del galeno paramétrico, armada con la
// plantilla de troqueles (../../troqueles). Verifica antes que cada fórmula dé lo que mide el plano.
// node guia.mjs [--artefacto --out archivo.html]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { armarPagina } from "../../troqueles/pagina.mjs";
import { crearDiseno } from "./diseno.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const outAt = process.argv.indexOf("--out");
const plantillaText = readFileSync(join(HERE, "plantilla-caja.json"), "utf8");

const page = armarPagina({
  design: crearDiseno(JSON.parse(plantillaText)),
  fuentes: ["galeno.mjs", "formulas.mjs", "diseno.mjs"].map((f) => join(HERE, f)),
  prologo: `const PLANTILLA = ${plantillaText};`,
  crear: "crearDiseno(PLANTILLA)",
  artefacto: process.argv.includes("--artefacto"),
});
const file = outAt > 0 ? process.argv[outAt + 1] : join(HERE, "guia-artioscad.html");
writeFileSync(file, page);
console.log("wrote", file, (page.length / 1024).toFixed(0) + " KB · fórmulas verificadas contra la geometría");
