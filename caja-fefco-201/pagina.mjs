// node pagina.mjs [--proteger] [--out archivo.html] → caja-fefco-201.html
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { protegerPagina } from "../troqueles/proteger.mjs";
import { armarPagina } from "../troqueles/pagina.mjs";
import { crearDiseno } from "./diseno.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const outAt = process.argv.indexOf("--out");
const abierta = armarPagina({
  design: crearDiseno(),
  fuentes: ["dibujos.mjs", "diseno.mjs"].map((f) => join(HERE, f)),
  crear: "crearDiseno()",
});
// --proteger encripta la página con la clave de la variable de entorno TROQUEL_CLAVE.
const proteger = process.argv.includes("--proteger");
if (proteger && !process.env.TROQUEL_CLAVE) throw new Error("Falta la clave: TROQUEL_CLAVE='...' node ... --proteger");
const page = proteger ? await protegerPagina(abierta, process.env.TROQUEL_CLAVE) : abierta;
const file = outAt > 0 ? process.argv[outAt + 1] : join(HERE, "caja-fefco-201.html");
writeFileSync(file, page);
console.log("wrote", file, (page.length / 1024).toFixed(0) + " KB" + (proteger ? " · protegida con clave" : "") + " · fórmulas verificadas contra la geometría");
