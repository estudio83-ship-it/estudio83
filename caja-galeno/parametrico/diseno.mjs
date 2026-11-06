// La caja tipo galeno como diseño de la plantilla de troqueles (../../troqueles/LEEME.md):
// todo lo que la página necesita saber de este troquel en particular.
import { DEFAULTS, PARAMS, ONDAS, generate, limits, widthFor, depthFor, pitchFor, lengthFor, toDxf, toCf2 } from "./galeno.mjs";
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
    // De menor a mayor complejidad: la caja sola; se suma la botella; se suma un separador (cuna o
    // acordeón), que necesita la botella.
    atajos: [
      { titulo: "Onda", key: "e", opciones: Object.entries(ONDAS), unidad: "mm" },
      { titulo: "Botella", key: "bot", opciones: [["Sin", 0], ["Con", 1]], arriba: true },
      { titulo: "Separador", key: "sep", opciones: [["Sin", 0], ["Cuna", 1], ["Acordeón", 2]], arriba: true },
    ],
    // Recuadros atenuados mientras no se usan; el puente es sólo de la cuna.
    apagado: (P, grupo) => (grupo === "Botella" && !P.bot) || (grupo === "Separador" && !P.sep),
    inactiva: (P, key) => key === "t" && P.sep !== 1,
    // Con botella, la caja la acompaña (después se puede corregir a mano): el alto de la botella mueve
    // el largo L; el ⌀ máximo mueve el alto A y, con la cantidad, el ancho H (paso = ⌀ máximo + 6).
    // Sumar un separador suma la botella; sacar la botella saca el separador.
    enlazar(s, key) {
      const out = {};
      let bot = s.bot === 1;
      if (key === "sep" && s.sep > 0 && !bot) { out.bot = 1; bot = true; }
      if (key === "bot" && s.bot === 0 && s.sep > 0) out.sep = 0;
      if (key === "Dc" && s.Dm < s.Dc) out.Dm = s.Dc;
      if (!bot) return out;
      const Dm = Math.max(s.Dm, s.Dc), todo = key === "bot" || key === "sep";
      if (todo || key === "Lb" || key === "e") out.L = Math.max(210, Math.min(700, lengthFor(s.Lb, s.e)));
      if (todo || key === "Dc" || key === "Dm" || key === "e") out.A = Math.max(60, Math.min(200, depthFor(Dm, s.e)));
      if (todo || key === "Dc" || key === "Dm" || key === "n" || key === "e") out.H = Math.max(120, Math.min(600, widthFor(Math.min(6, s.n), pitchFor(Dm), s.e)));
      return out;
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
.figura .rotulo{font:500 12px var(--mono);fill:var(--soft);paint-order:stroke;stroke:var(--soft-bg);stroke-width:5px;stroke-linejoin:round;transition:fill 1.5s ease}
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
    simple: { "h:costado": "A", "h:contrafrente": "L", "v:frente": "H", "v:puente": "t", "v:compartimento": "", "v:lomo": "", "h:plano total": "", "v:plano total": "" },
    // Letras del plano y qué letras mueve cada variable del panel.
    letras: ["Dc", "Dn", "L", "A", "H", "t", "e"],
    toca: { L: ["L"], Lb: ["L"], Dc: ["Dc"], Dm: ["A", "H"], Dn: ["Dn"], n: ["Dc", "Dn", "H"], A: ["A"], H: ["H"], t: ["t"], e: ["e"] },
    // Notas sueltas sobre el plano: [punto, texto, visible en la vista simple].
    llamadas(model) {
      const map = (p) => model.anchors.rot(model.anchors.map(p)), ins = model.anchors.insert, r = ins ? ins.rows : null;
      const caja = [
        [map([530, 1090]), "guardapolvo A + 26"],
        [map([944, 1090]), "A + 29"],
        [map([112, 1050]), "oreja × A/94"],
        [map([326, 1068]), "contratapa A − 2e"],
        [map([741.5, 1000]), "traba 87 × 10e/3"],
        [map([741.5, 1228]), "diente 85 × 5"],
      ];
      if (!ins || ins.tipo === "acordeon") return caja;
      const out = [
        ...caja,
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
        P.bot ? ["Botella", mm(P.Lb) + " × ⌀" + mm(P.Dm), P.n + (P.n > 1 ? " botellas" : " botella") + " · base ⌀" + mm(P.Dc)] : ["Botella", "Sin botella", "caja sola"],
        ["Medidas internas", x3([P.L, P.A, P.H]), "L × A × H"],
        ["Medidas externas", x3(model.info.externa), "con paredes y cierres"],
        ["Plancha total", x3([b.xMax - b.xMin, b.yMax - b.yMin]), P.sep === 2 ? "separador acordeón" : P.sep === 1 ? "separador cuna" : "sin separador"],
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
    casosFormulas: [{}, { L: 370, A: 110, H: 300 }, { e: 2 }, { e: 4 }, { sep: 1 }, { sep: 1, L: 370 }, { sep: 1, L: 400, A: 110, H: 300, t: 32, n: 4, Dc: 70, Dn: 28, p: 72 }, { sep: 1, L: 250, A: 70, H: 200, n: 2, Dc: 56, Dn: 22, p: 64 }, { sep: 1, e: 4, L: 370, t: 40 }, { sep: 1, e: 2, A: 120, H: 300, t: 15 }, { sep: 2 }, { sep: 2, n: 5, Dc: 70, Dm: 85, e: 4 }, { sep: 2, n: 1, A: 150 }, { bot: 1, Dc: 60, Dm: 95 }],
  };
}
