// node pagina.mjs [--artefacto --out archivo.html] → caja-americana.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { armarPagina } from "../pagina.mjs";
import { crearDiseno } from "./diseno.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const outAt = process.argv.indexOf("--out");
const page = armarPagina({
  design: crearDiseno(),
  fuentes: [join(HERE, "diseno.mjs")],
  crear: "crearDiseno()",
  artefacto: process.argv.includes("--artefacto"),
});
const file = outAt > 0 ? process.argv[outAt + 1] : join(HERE, "caja-americana.html");
writeFileSync(file, page);
console.log("wrote", file, (page.length / 1024).toFixed(0) + " KB · fórmulas verificadas contra la geometría");
