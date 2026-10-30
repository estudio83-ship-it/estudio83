// node check.mjs [casos aleatorios = 200]
import { crearDiseno } from "./diseno.mjs";
import { verificarDiseno, informar } from "../verificar.mjs";

process.exit(informar(verificarDiseno(crearDiseno(), { aleatorios: Number(process.argv[2] ?? 200) })));
