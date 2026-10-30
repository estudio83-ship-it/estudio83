// La caja tipo galeno como diseño de la plantilla de troqueles (../../troqueles/LEEME.md):
// todo lo que la página necesita saber de este troquel en particular.
import { DEFAULTS, PARAMS, ONDAS, generate, limits, widthFor, depthFor, pitchFor, toDxf, toCf2 } from "./galeno.mjs";
import { DIM_FORMULAS } from "./formulas.mjs";
import { botellaSvg, botellaCampos, cajaSvg, ondaSvg } from "./dibujos.mjs";

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
    // Las medidas de la caja acompañan a las botellas (después se pueden corregir a mano):
    // la cantidad mueve el ancho H; el diámetro mueve el alto A y el ancho H (el paso es Dc + 6).
    enlazar(s, key) {
      const ancho = Math.max(120, Math.min(600, widthFor(Math.min(6, s.n), pitchFor(s.Dc), s.e)));
      if (key === "n") return { H: ancho };
      if (key === "Dc") return { A: Math.max(60, Math.min(200, depthFor(s.Dc, s.e))), H: ancho };
      return null;
    },
    // Dibujos del panel: la botella con sus cotas y el cartón con su onda.
    figuras: { Botella: (P) => botellaSvg(P), Caja: (P) => cajaSvg(P), "Cartón": (P) => ondaSvg(P, ONDAS) },
    // Las medidas de la botella se escriben sobre sus cotas, con flechas para subir y bajar.
    campos: { Botella: () => botellaCampos() },
    estilos: `
.figura .pieza{fill:var(--sheet);stroke:var(--ink);stroke-width:1.1;stroke-linejoin:round}
.figura .pieza.lado{fill:var(--soft-bg)}
.figura .pieza.frente{fill:#f8fafc}
.figura .filete{fill:none;stroke:var(--ink);stroke-width:.8}
.figura .cota .fx{fill:var(--accent);font-weight:600}
.figura .cota .val{fill:var(--soft);font-weight:500}
.figura .rotulo{font:500 10.5px var(--mono);fill:var(--soft);paint-order:stroke;stroke:var(--soft-bg);stroke-width:5px;stroke-linejoin:round;transition:fill 1.5s ease}
.figura .rotulo.active{fill:var(--orange-deep);font-weight:700;transition:none}
.figura .cota.active .fx,.figura .cota.active .val{fill:var(--orange-deep);font-weight:700}
.figura .carton .sup{fill:var(--sheet)}
.figura .carton .lado{fill:var(--soft-bg)}
.figura .carton .corte{fill:var(--tint)}
.figura .carton .liner{fill:none;stroke:var(--soft);stroke-width:.7}
.figura .carton .onda{fill:none;stroke:var(--accent);stroke-width:1.4;stroke-linejoin:round}
.figura .carton .borde{fill:none;stroke:var(--ink);stroke-width:1;stroke-linejoin:round}
.figura .carton.active .onda{stroke:var(--orange)}
`,
    formulas: DIM_FORMULAS,
    // Vista simple: sólo las cotas de las variables que se cargan (con su letra) y los totales de la plancha.
    simple: { "h:costado": "A", "h:contrafrente": "L", "v:frente": "H", "v:puente": "t", "h:plano total": "", "v:plano total": "" },
    // Letras del plano y qué letras mueve cada variable del panel.
    letras: "Dc|Dn|(?<![A-Za-zÀ-ÿ])[LAHte](?![A-Za-zÀ-ÿ])",
    toca: { Lb: ["L"], Dc: ["Dc", "A", "H"], Dn: ["Dn"], n: ["Dc", "Dn", "H"], A: ["A"], H: ["H"], t: ["t"], e: ["e"] },
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
