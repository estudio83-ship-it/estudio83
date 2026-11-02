// Escribe guia-artioscad.html: la página interactiva del galeno paramétrico, armada con la
// plantilla de troqueles (../../troqueles). Verifica antes que cada fórmula dé lo que mide el plano.
// node guia.mjs [--proteger] [--fragmento] [--out archivo.html]
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { protegerPagina } from "../../troqueles/proteger.mjs";
import { documentoCompleto, prerender } from "../../troqueles/estatica.mjs";
import { armarPagina } from "../../troqueles/pagina.mjs";
import { crearDiseno } from "./diseno.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const outAt = process.argv.indexOf("--out");
const plantillaText = readFileSync(join(HERE, "plantilla-caja.json"), "utf8");

const abierta = armarPagina({
  design: crearDiseno(JSON.parse(plantillaText)),
  fuentes: ["galeno.mjs", "formulas.mjs", "dibujos.mjs", "diseno.mjs"].map((f) => join(HERE, f)),
  prologo: `const PLANTILLA = ${plantillaText};`,
  crear: "crearDiseno(PLANTILLA)",
});
// --proteger encripta la página con la clave de la variable de entorno TROQUEL_CLAVE.
const proteger = process.argv.includes("--proteger");
if (proteger && !process.env.TROQUEL_CLAVE) throw new Error("Falta la clave: TROQUEL_CLAVE='...' node ... --proteger");
// Por defecto sale el archivo para compartir: documento completo y ya dibujado (la vista previa del
// iPhone no ejecuta JavaScript). --fragmento deja sólo el contenido, para publicar en claude.ai.
const fragmento = process.argv.includes("--fragmento");
const contenido = proteger ? await protegerPagina(abierta, process.env.TROQUEL_CLAVE) : abierta;
const page = fragmento ? contenido : proteger ? documentoCompleto(contenido) : await prerender(abierta);
const file = outAt > 0 ? process.argv[outAt + 1] : join(HERE, "guia-artioscad.html");
writeFileSync(file, page);
console.log("wrote", file, (page.length / 1024).toFixed(0) + " KB" + (proteger ? " · protegida con clave" : "") + " · fórmulas verificadas contra la geometría");
