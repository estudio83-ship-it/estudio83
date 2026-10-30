// La caja tipo galeno como diseño de la plantilla de troqueles (../../troqueles/LEEME.md):
// todo lo que la página necesita saber de este troquel en particular.
import { DEFAULTS, PARAMS, ONDAS, generate, limits, widthFor, toDxf, toCf2 } from "./galeno.mjs";
import { DIM_FORMULAS } from "./formulas.mjs";

export function crearDiseno(PLANTILLA) {
  return {
    titulo: "Caja tipo Galeno",
    bajada: "Troquel paramétrico para ArtiosCAD",
    PARAMS,
    DEFAULTS,
    generate: (state) => generate(state, PLANTILLA),
    limits,
    // Botones rápidos para el espesor.
    atajos: { titulo: "Onda", key: "e", opciones: Object.entries(ONDAS) },
    // Al cambiar la cantidad o el paso de las botellas, el ancho (H) se ajusta solo.
    enlazar: (s, key) => (key === "n" || key === "p" ? { H: Math.max(120, widthFor(Math.min(6, s.n), s.p, s.e)) } : null),
    formulas: DIM_FORMULAS,
    // Vista simple: sólo las cotas de las variables que se cargan (con su letra) y los totales de la plancha.
    simple: { "h:costado": "A", "h:contrafrente": "L", "v:frente": "H", "v:puente": "t", "h:plano total": "", "v:plano total": "" },
    // Letras del plano y qué letras mueve cada variable del panel.
    letras: "Dc|Dn|(?<![A-Za-zÀ-ÿ])[LAHte](?![A-Za-zÀ-ÿ])",
    toca: { Lb: ["L"], Dc: ["Dc"], Dn: ["Dn"], n: ["Dc", "Dn", "H"], p: ["Dc", "Dn", "H"], A: ["A"], H: ["H"], t: ["t"], e: ["e"] },
    // Notas sueltas sobre el plano: [punto, texto, visible en la vista simple].
    llamadas(model) {
      const map = (p) => model.anchors.rot(model.anchors.map(p)), ins = model.anchors.insert, r = ins.rows;
      const out = [
        [map([530, 1090]), "guardapolvo A + 26"],
        [map([944, 1090]), "A + 29"],
        [map([112, 1050]), "oreja × A/94"],
        [map([326, 1068]), "contratapa A − 2e"],
        [map([741.5, 1000]), "traba 87 × 10e/3"],
        [map([741.5, 1228]), "diente 85 × 5"],
        [ins.T([ins.x0 + ins.centres[0], ins.y0 + (r.p2 + r.c3) / 2]), "⌀Dc", true],
      ];
      if (ins.centres.length > 1) out.push([ins.T([ins.x0 + ins.centres[1], ins.y0 + (r.p2 + r.c3) / 2 + 9]), "Dn", true]);
      out.push([ins.T([ins.x0 + ins.centres[ins.centres.length > 1 ? 1 : 0], ins.y0 + r.c1 / 2]), "muesca 35 × 4"]);
      return out;
    },
    // Las cinco tarjetas del resumen: [título, valor, detalle].
    resumen(model) {
      const P = model.P, b = model.info.bounds, mm = (v) => String(Math.round(v)), x3 = (a) => a.map(mm).join(" × ");
      const onda = Object.keys(ONDAS).find((k) => Math.abs(ONDAS[k] - P.e) < 1e-9);
      return [
        ["Tipo de cartón", onda ? "Onda " + onda : "Espesor propio", "espesor " + mm(P.e) + " mm"],
        ["Botella", mm(P.Lb) + " × ⌀" + mm(P.Dc), P.n + (P.n > 1 ? " botellas" : " botella") + " · cuello ⌀" + mm(P.Dn)],
        ["Medidas internas", x3([P.L, P.A, P.H]), "L × A × H"],
        ["Medidas externas", x3(model.info.externa), "con paredes y cierres"],
        ["Plancha total", x3([b.xMax - b.xMin, b.yMax - b.yMin]), "ancho × alto"],
      ];
    },
    archivo(model) {
      const P = model.P, mm = (v) => String(Math.round(v));
      const onda = Object.keys(ONDAS).find((k) => Math.abs(ONDAS[k] - P.e) < 1e-9);
      return "GALENO-" + mm(P.L) + "x" + mm(P.A) + "x" + mm(P.H) + "-" + (onda ? "onda" + onda : "e" + mm(P.e));
    },
    dxf: (model) => toDxf(model),
    cf2: (model, name) => toCf2(model, { name }),
    describir: (model) => "Troquel galeno " + model.info.caja + " mm",
    // Combinaciones con las que se comprueba que cada fórmula dé lo que mide el plano.
    casosFormulas: [{}, { L: 370 }, { L: 400, A: 110, H: 300, t: 32, n: 4, Dc: 70, Dn: 28, p: 72 }, { L: 250, A: 70, H: 200, n: 2, Dc: 56, Dn: 22, p: 64 }, { e: 2 }, { e: 4 }, { e: 4, L: 370, t: 40 }, { e: 2, A: 120, H: 300, t: 15 }],
  };
}
