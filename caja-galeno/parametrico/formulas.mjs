// Fórmulas del galeno paramétrico: las mismas que muestra la guía, como funciones de las variables.
// DIM_FORMULAS etiqueta las cotas del plano; TABLES arma las tablas de la guía.

export const DIM_FORMULAS = {
  h: {
    costado: ["A", (P) => P.A],
    frente: ["L + 3", (P) => P.L + 3],
    contrafrente: ["L", (P) => P.L],
    pegado: ["A − 3", (P) => P.A - 3],
    interior: ["H − 6", (P) => P.H - 6],
    caja: ["3A + 2L", (P) => 3 * P.A + 2 * P.L],
  },
  v: {
    lengüeta: ["A − 4", (P) => P.A - 4],
    pestaña: ["10", () => 10],
    tapa: ["A", (P) => P.A],
    contrafrente: ["H + 22", (P) => P.H + 22],
    frente: ["H", (P) => P.H],
    pared: ["A − 6", (P) => P.A - 6],
    puente: ["t", (P) => P.t],
    tabique: ["A − 6", (P) => P.A - 6],
    panel: ["L − 65", (P) => P.L - 65],
    interior: ["4A + 2t + L − 89", (P) => 4 * P.A + 2 * P.t + P.L - 89],
  },
};

const x = (a, b) => `${fmtMm(a)} × ${fmtMm(b)}`;
export const fmtMm = (v) => (Math.abs(v - Math.round(v)) < 0.005 ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString().replace(".", ","));

// [pieza, fórmula, valor(P)]
export const TABLES = {
  tubo: [
    ["Costado exterior · ancho", "A", (P) => P.A],
    ["Frente · ancho", "L + 3", (P) => P.L + 3],
    ["Costado · ancho", "A", (P) => P.A],
    ["Contrafrente · ancho", "L", (P) => P.L],
    ["Solapa de pegado · ancho", "A − 3", (P) => P.A - 3],
    ["Contrafrente · alto", "H + 22", (P) => P.H + 22],
    ["Frente · alto", "H", (P) => P.H],
    ["Costado exterior · alto", "H + 16", (P) => P.H + 16],
    ["Costado · alto", "H + 13", (P) => P.H + 13],
    ["Solapa de pegado · alto", "H + 8", (P) => P.H + 8],
    ["Tubo abierto · ancho", "3A + 2L", (P) => 3 * P.A + 2 * P.L],
  ],
  cierres: [
    ["Tapa", "A × L", (P) => x(P.A, P.L)],
    ["Pestaña de pared doble", "10", () => 10],
    ["Lengüeta", "(A − 4) × (L − 17)", (P) => x(P.A - 4, P.L - 17)],
    ["Diente de la lengüeta", "85 × 5", () => x(85, 5)],
    ["Ranura de traba", "86,5 × 10", () => x(86.5, 10)],
    ["Contratapa · profundidad", "A − 6", (P) => P.A - 6],
    ["Contratapa · tramo recto", "L − 135,3", (P) => P.L - 135.3],
    ["Guardapolvo del costado", "A + 26", (P) => P.A + 26],
    ["Guardapolvo de la solapa", "A + 28,5", (P) => P.A + 28.5],
    ["Oreja · escala", "A / 94", (P) => P.A / 94],
  ],
  interior: [
    ["Ancho", "H − 6", (P) => P.H - 6],
    ["Pared exterior", "A − 6", (P) => P.A - 6],
    ["Puente", "t", (P) => P.t],
    ["Tabique", "A − 6", (P) => P.A - 6],
    ["Panel central", "L − 65", (P) => P.L - 65],
    ["Largo total", "4A + 2t + L − 89", (P) => 4 * P.A + 2 * P.t + P.L - 89],
    ["Plegado", "(L − 65 + 2t) × (H − 6) × (A − 6)", (P) => `${fmtMm(P.L - 65 + 2 * P.t)} × ${fmtMm(P.H - 6)} × ${fmtMm(P.A - 6)}`],
    ["Frasco · largo máximo", "L − 14", (P) => P.L - 14],
    ["Agujero del cuerpo", "⌀ Dc", (P) => P.Dc],
    ["Ranura del cuello", "Dn", (P) => P.Dn],
    ["Centros de los frascos", "Wi/2 + (i − (n − 1)/2)·p", (P) => Array.from({ length: P.n }, (_, i) => fmtMm((P.H - 6) / 2 + (i - (P.n - 1) / 2) * P.p)).join(" · ")],
  ],
};
