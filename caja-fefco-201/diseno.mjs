// Caja FEFCO 0201 (caja americana: solapas que se tocan al centro) como diseño de la plantilla de
// troqueles (../troqueles/LEEME.md). Se dibuja desde cero con las medidas interiores y el espesor.
//
// Compensaciones (las de las tablas de onda B: L + 3, A + 3, H + 6):
//  · paneles de largo y de ancho, entre hendidos: L + e y A + e;
//  · alto entre los hendidos de las solapas: H + 2e (arriba y abajo van dos solapas, una sobre otra);
//  · solapas: (A + e)/2, se tocan al centro;
//  · ranuras entre solapas de e + 2; solapa de pegado g con biseles de 10;
//  · opcional: los hendidos de las solapas interiores (paneles de ancho) corridos d hacia afuera, arriba y
//    abajo; las puntas de todas las solapas siguen alineadas, así que las interiores miden (A + e)/2 − d.
import { escribirDxf, escribirCf2, limitesDe, mmEntero } from "../troqueles/cad.mjs";
import { caja201Svg, onda201Svg } from "./dibujos.mjs";

// Simples (E, B, C) y dobles (EB, BC): espesor de referencia en mm.
export const ONDAS_201 = { E: 2, B: 3, C: 4, EB: 5, BC: 7 };
export const BISEL_201 = 10; // biseles de la solapa de pegado, en las puntas

export const PARAMS_201 = [
  { key: "L", group: "Caja", label: "Largo interior", min: 100, max: 800, step: 1 },
  { key: "A", group: "Caja", label: "Ancho interior", min: 80, max: 600, step: 1 },
  { key: "H", group: "Caja", label: "Alto interior", min: 50, max: 800, step: 1 },
  { key: "g", group: "Caja", label: "Solapa de pegado", min: 25, max: 50, step: 1 },
  { key: "d", group: "Caja", label: "Desplazar hendidos", min: 0, max: 10, step: 1 },
  { key: "e", group: "Cartón", label: "Espesor del cartón", min: 1, max: 7, step: 1 },
];
export const DEFAULTS_201 = { L: 300, A: 200, H: 250, g: 35, d: 0, e: 3 };

// Medidas que salen de las variables.
export function medidas201(P) {
  const { L, A, H, e } = P;
  const largo = L + e, ancho = A + e, alto = H + 2 * e, solapa = Math.round((A + e) / 2), ranura = e + 2;
  return { largo, ancho, alto, solapa, ranura, externa: [L + 2 * e, A + 2 * e, H + 4 * e] };
}

export function generar201(params) {
  const P = { ...DEFAULTS_201 };
  for (const p of PARAMS_201) {
    const v = Number(params[p.key]);
    if (Number.isFinite(v)) P[p.key] = Math.min(p.max, Math.max(p.min, Math.round(v)));
  }
  const M = medidas201(P), { largo, ancho, alto, solapa: F } = M, r = M.ranura / 2, g = P.g;
  // Hendidos verticales: largo, ancho, largo, ancho (la solapa de pegado va a la izquierda del primer largo).
  const xs = [0, largo, largo + ancho, 2 * largo + ancho, 2 * largo + 2 * ancho];
  const entities = [];
  const line = (k, a, b) => entities.push({ t: "L", k, a, b });
  // Solapas de arriba y de abajo, separadas por ranuras que bajan hasta el hendido.
  for (const [y0, y1] of [[alto, alto + F], [0, -F]]) {
    for (let i = 0; i < 4; i++) {
      const xl = i === 0 ? xs[0] : xs[i] + r, xr = i === 3 ? xs[4] : xs[i + 1] - r;
      line("c", [xl, y1], [xr, y1]);
      line("c", [xl, y0], [xl, y1]);
      line("c", [xr, y0], [xr, y1]);
      // Paneles de ancho (1 y 3): el hendido de la solapa interior, corrido d hacia afuera.
      const yh = i % 2 ? y0 + Math.sign(y1 - y0) * P.d : y0;
      line("h", [xl, yh], [xr, yh]);
      if (i < 3) line("c", [xr, y0], [xs[i + 1] + r, y0]);
    }
  }
  for (const x of xs.slice(0, 4)) line("h", [x, 0], [x, alto]);
  line("c", [xs[4], 0], [xs[4], alto]);
  // Solapa de pegado con sus biseles.
  line("c", [0, alto], [-g, alto - BISEL_201]);
  line("c", [-g, alto - BISEL_201], [-g, BISEL_201]);
  line("c", [-g, BISEL_201], [0, 0]);

  const bounds = limitesDe(entities);
  const dims = [];
  const h = (x0, x1, at, name) => dims.push({ dir: "h", x0, x1, at, value: x1 - x0, src: "h", name });
  const v = (y0, y1, at, name) => dims.push({ dir: "v", y0, y1, at, value: y1 - y0, src: "v", name });
  h(-g, 0, alto + F + 30, "pegado");
  ["largo", "ancho", "largo", "ancho"].forEach((n, i) => h(xs[i], xs[i + 1], -F - 40, n));
  v(0, alto, -g - 50, "alto");
  v(alto, alto + F, -g - 50, "solapa");
  v(-F, 0, -g - 50, "solapa");
  v(alto + P.d, alto + F, xs[4] + 50, "solapa interior");
  h(bounds.xMin, bounds.xMax, -F - 100, "plano total");
  v(bounds.yMin, bounds.yMax, -g - 110, "plano total");
  return { P, entities, dims, info: { bounds, ...M, xs } };
}

const ondaDe = (e) => Object.keys(ONDAS_201).find((k) => ONDAS_201[k] === e);

export function crearDiseno() {
  return {
    titulo: "Caja FEFCO 201",
    bajada: "Troquel paramétrico para ArtiosCAD",
    PARAMS: PARAMS_201,
    DEFAULTS: DEFAULTS_201,
    generate: generar201,
    atajos: { titulo: "Onda", key: "e", opciones: Object.entries(ONDAS_201) },
    // Dibujos del panel: la caja armada con sus cotas y el cartón con su onda.
    figuras: { Caja: (P) => caja201Svg(P), "Cartón": (P) => onda201Svg(P, ONDAS_201) },
    estilos: `
.figura .pieza{fill:var(--sheet);stroke:var(--ink);stroke-width:1.1;stroke-linejoin:round}
.figura .pieza.lado{fill:var(--soft-bg)}
.figura .pieza.frente{fill:#f8fafc}
.figura .filete{fill:none;stroke:var(--ink);stroke-width:.8}
.figura .union{fill:none;stroke:var(--ink);stroke-width:1.1}
.figura .cota .fx{fill:var(--accent);font-weight:600}
.figura .cota .val{fill:var(--soft);font-weight:500}
.figura .cota.active .fx,.figura .cota.active .val{fill:var(--orange-deep);font-weight:700}
.figura .carton .sup{fill:var(--sheet)}
.figura .carton .lado{fill:var(--soft-bg)}
.figura .carton .corte{fill:var(--tint)}
.figura .carton .liner{fill:none;stroke:var(--soft);stroke-width:.7}
.figura .carton .onda{fill:none;stroke:var(--accent);stroke-width:1.4;stroke-linejoin:round}
.figura .carton .borde{fill:none;stroke:var(--ink);stroke-width:1;stroke-linejoin:round}
.figura .carton.active .onda{stroke:var(--orange)}
#atajos{flex-wrap:nowrap;gap:5px}
#atajos button{padding:7px 11px}
/* Cartón debajo de Caja, en una sola columna; en cada grupo, el dibujo a la izquierda y las variables a la derecha. */
@media (min-width:1100px){
  form{grid-template-columns:minmax(0,1fr)}
  form .grupo:nth-child(2){grid-row:auto}
  .grupo{grid-template-columns:230px minmax(0,1fr);column-gap:14px;align-items:center}
  .grupo h3.group{grid-column:1 / -1}
  .grupo > :not(h3):not(.figura){grid-column:2}
  .grupo[data-group="Caja"] .figura{grid-column:1;grid-row:2 / span 4}
  .grupo[data-group="Cartón"] .figura{grid-column:1;grid-row:2 / span 2}
}
`,
    formulas: {
      h: {
        largo: ["L + e", (P) => P.L + P.e],
        ancho: ["A + e", (P) => P.A + P.e],
        pegado: ["g", (P) => P.g],
        "plano total": ["2L + 2A + 4e + g", (P) => 2 * P.L + 2 * P.A + 4 * P.e + P.g],
      },
      v: {
        alto: ["H + 2e", (P) => P.H + 2 * P.e],
        solapa: ["(A + e)/2", (P) => Math.round((P.A + P.e) / 2)],
        "solapa interior": ["(A + e)/2 − d", (P) => Math.round((P.A + P.e) / 2) - P.d],
        "plano total": ["H + 2e + 2 × solapa", (P) => P.H + 2 * P.e + 2 * Math.round((P.A + P.e) / 2)],
      },
    },
    // Vista simple: las cotas de las variables (con su letra) y los totales de la plancha.
    simple: { "h:largo": "L", "h:ancho": "A", "v:alto": "H", "h:pegado": "g", "v:solapa interior": "", "h:plano total": "", "v:plano total": "" },
    letras: "(?<![A-Za-zÀ-ÿ])[LAHgde](?![A-Za-zÀ-ÿ])",
    toca: { L: ["L"], A: ["A"], H: ["H"], g: ["g"], d: ["d"], e: ["e"] },
    // Notas sobre el plano, sólo con las fórmulas a la vista.
    llamadas(model) {
      const { xs, alto, solapa } = model.info;
      return [
        [[(xs[0] + xs[1]) / 2, alto + solapa / 2], "solapa exterior"],
        [[(xs[1] + xs[2]) / 2, alto + solapa / 2], "solapa interior"],
        [[(xs[0] + xs[1]) / 2, -solapa / 2], "ranuras e + 2"],
        [[-model.P.g / 2, alto + 14], "bisel 10"],
        ...(model.P.d ? [[[(xs[3] + xs[4]) / 2, alto - 18], "hendido corrido d = " + model.P.d, true]] : []),
      ];
    },
    resumen(model) {
      const P = model.P, b = model.info.bounds, x3 = (a) => a.map(mmEntero).join(" × "), onda = ondaDe(P.e);
      return [
        ["Tipo de cartón", onda ? "Onda " + onda : "Espesor propio", "espesor " + P.e + " mm"],
        ["Medidas internas", x3([P.L, P.A, P.H]), "L × A × H"],
        ["Medidas externas", x3(model.info.externa), "aproximadas"],
        ["Solapas", mmEntero(model.info.solapa), P.d ? "interiores " + mmEntero(model.info.solapa - P.d) + " · d " + P.d : "se tocan al centro"],
        ["Plancha total", x3([b.xMax - b.xMin, b.yMax - b.yMin]), "ancho × alto"],
      ];
    },
    archivo: (model) => "FEFCO201-" + model.P.L + "x" + model.P.A + "x" + model.P.H + "-" + (ondaDe(model.P.e) ? "onda" + ondaDe(model.P.e) : "e" + model.P.e),
    // Al DXF van las líneas y las cotas de L, A y H (una de cada).
    dxf(model) {
      const una = (n) => model.dims.find((d) => d.name === n);
      const rot = { largo: "L=", ancho: "A=", alto: "H=" };
      return escribirDxf(model, { cotas: ["largo", "ancho", "alto"].map(una), rotulo: (d) => rot[d.name] + mmEntero(d.value) });
    },
    cf2: (model, nombre) => escribirCf2(model, { name: nombre }),
    describir: (model) => "Caja FEFCO 201 de " + model.P.L + " × " + model.P.A + " × " + model.P.H + " mm interiores",
    casosFormulas: [{}, { L: 500, A: 120, H: 400, g: 25, e: 2 }, { L: 100, A: 600, H: 50, g: 50, e: 7 }, { A: 201, e: 4 }, { d: 6 }, { A: 80, e: 1, d: 10 }],
  };
}
