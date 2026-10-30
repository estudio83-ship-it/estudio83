// Ejemplo de diseño para la plantilla: caja americana (solapas que se tocan al centro, tipo 0201).
// Es el molde a copiar para un troquel nuevo: variables, geometría, cotas con fórmulas y textos.
import { escribirDxf, escribirCf2, limitesDe, mmEntero } from "../cad.mjs";

export const ONDAS_0201 = { E: 2, B: 3, C: 4 };
const PEGADO = 30; // ancho de la solapa de pegado
const BISEL = 10; // chaflán de la solapa de pegado

export function crearDiseno() {
  const PARAMS = [
    { key: "L", group: "Caja", label: "Largo interior", min: 100, max: 800, step: 1 },
    { key: "A", group: "Caja", label: "Ancho interior", min: 80, max: 600, step: 1 },
    { key: "H", group: "Caja", label: "Alto interior", min: 80, max: 800, step: 1 },
    { key: "e", group: "Cartón", label: "Espesor del cartón", min: 1, max: 6, step: 1 },
  ];
  const DEFAULTS = { L: 300, A: 200, H: 250, e: 3 };

  function generate(params) {
    const P = { ...DEFAULTS };
    for (const p of PARAMS) {
      const v = Number(params[p.key]);
      if (Number.isFinite(v)) P[p.key] = Math.min(p.max, Math.max(p.min, Math.round(v)));
    }
    const { L, A, H, e } = P;
    // Paneles y solapas compensados por el espesor; la ranura entre solapas mide e + 2.
    const wL = L + e, wA = A + e, alto = H + e, F = Math.round(wA / 2), g = (e + 2) / 2;
    const xs = [0, wL, wL + wA, 2 * wL + wA, 2 * wL + 2 * wA];
    const entities = [];
    const line = (k, a, b) => entities.push({ t: "L", k, a, b });
    for (const [y0, y1] of [[alto, alto + F], [0, -F]]) {
      for (let i = 0; i < 4; i++) {
        const xl = i === 0 ? xs[0] : xs[i] + g, xr = i === 3 ? xs[4] : xs[i + 1] - g;
        line("c", [xl, y1], [xr, y1]);
        line("c", [xl, y0], [xl, y1]);
        line("c", [xr, y0], [xr, y1]);
        line("h", [xl, y0], [xr, y0]);
        if (i < 3) line("c", [xr, y0], [xs[i + 1] + g, y0]);
      }
    }
    for (const x of xs.slice(0, 4)) line("h", [x, 0], [x, alto]);
    line("c", [xs[4], 0], [xs[4], alto]);
    line("c", [0, alto], [-PEGADO, alto - BISEL]);
    line("c", [-PEGADO, alto - BISEL], [-PEGADO, BISEL]);
    line("c", [-PEGADO, BISEL], [0, 0]);

    const bounds = limitesDe(entities);
    const dims = [];
    const h = (x0, x1, at, src, name) => dims.push({ dir: "h", x0, x1, at, value: x1 - x0, src, name });
    const v = (y0, y1, at, src, name) => dims.push({ dir: "v", y0, y1, at, value: y1 - y0, src, name });
    h(-PEGADO, 0, -F - 40, "h", "pegado");
    ["largo", "ancho", "largo", "ancho"].forEach((n, i) => h(xs[i], xs[i + 1], -F - 40, "h", n));
    v(0, alto, -PEGADO - 50, "v", "alto");
    v(alto, alto + F, -PEGADO - 50, "v", "solapa");
    v(-F, 0, -PEGADO - 50, "v", "solapa");
    h(bounds.xMin, bounds.xMax, -F - 100, "h", "plano total");
    v(bounds.yMin, bounds.yMax, -PEGADO - 110, "v", "plano total");
    return { P, entities, dims, info: { bounds, externa: [L + 2 * e, A + 2 * e, H + 2 * e], solapa: F } };
  }

  const ondaDe = (e) => Object.keys(ONDAS_0201).find((k) => ONDAS_0201[k] === e);
  return {
    titulo: "Caja americana",
    bajada: "Troquel paramétrico para ArtiosCAD",
    PARAMS,
    DEFAULTS,
    generate,
    atajos: { titulo: "Onda", key: "e", opciones: Object.entries(ONDAS_0201) },
    formulas: {
      h: { largo: ["L + e", (P) => P.L + P.e], ancho: ["A + e", (P) => P.A + P.e], pegado: ["30", () => PEGADO] },
      v: { alto: ["H + e", (P) => P.H + P.e], solapa: ["(A + e)/2", (P) => Math.round((P.A + P.e) / 2)] },
    },
    simple: { "h:largo": "L", "h:ancho": "A", "v:alto": "H", "h:plano total": "", "v:plano total": "" },
    letras: "(?<![A-Za-zÀ-ÿ])[LAHe](?![A-Za-zÀ-ÿ])",
    toca: { L: ["L"], A: ["A"], H: ["H"], e: ["e"] },
    resumen(model) {
      const P = model.P, b = model.info.bounds, x3 = (a) => a.map(mmEntero).join(" × "), onda = ondaDe(P.e);
      return [
        ["Tipo de cartón", onda ? "Onda " + onda : "Espesor propio", "espesor " + P.e + " mm"],
        ["Medidas internas", x3([P.L, P.A, P.H]), "L × A × H"],
        ["Medidas externas", x3(model.info.externa), "aproximadas"],
        ["Solapas", mmEntero(model.info.solapa), "se tocan al centro"],
        ["Plancha total", x3([b.xMax - b.xMin, b.yMax - b.yMin]), "ancho × alto"],
      ];
    },
    archivo: (model) => "AMERICANA-" + model.P.L + "x" + model.P.A + "x" + model.P.H + "-" + (ondaDe(model.P.e) ? "onda" + ondaDe(model.P.e) : "e" + model.P.e),
    // Al DXF van las líneas y las cotas de L, A y H (una de cada).
    dxf(model) {
      const una = (n) => model.dims.find((d) => d.name === n);
      const rot = { largo: "L=", ancho: "A=", alto: "H=" };
      return escribirDxf(model, { cotas: ["largo", "ancho", "alto"].map(una), rotulo: (d) => rot[d.name] + mmEntero(d.value) });
    },
    cf2: (model, name) => escribirCf2(model, { name }),
    describir: (model) => "Caja americana " + model.P.L + " × " + model.P.A + " × " + model.P.H + " mm",
    casosFormulas: [{}, { L: 500, A: 120, H: 400, e: 2 }, { L: 100, A: 600, H: 80, e: 6 }],
  };
}
