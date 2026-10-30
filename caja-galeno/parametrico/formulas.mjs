// Fórmulas del galeno paramétrico: las mismas que muestra la guía, como funciones de las variables.
// DIM_FORMULAS etiqueta las cotas del plano; TABLES arma las tablas de la guía.

export const DIM_FORMULAS = {
  h: {
    costado: ["A", (P) => P.A],
    frente: ["L + e", (P) => P.L + P.e],
    contrafrente: ["L", (P) => P.L],
    pegado: ["A − e", (P) => P.A - P.e],
    interior: ["H − 2e", (P) => P.H - 2 * P.e],
    caja: ["3A + 2L", (P) => 3 * P.A + 2 * P.L],
  },
  v: {
    lengüeta: ["A − 4e/3", (P) => P.A - (4 / 3) * P.e],
    pestaña: ["10e/3", (P) => (10 / 3) * P.e],
    tapa: ["A", (P) => P.A],
    contrafrente: ["H + 22e/3", (P) => P.H + (22 / 3) * P.e],
    frente: ["H", (P) => P.H],
    pared: ["A − 2e", (P) => P.A - 2 * P.e],
    puente: ["t", (P) => P.t],
    tabique: ["A − 2e", (P) => P.A - 2 * P.e],
    panel: ["L − 3e − 2t", (P) => P.L - 3 * P.e - 2 * P.t],
    interior: ["4A + L − 11e", (P) => 4 * P.A + P.L - 11 * P.e],
  },
};

const x = (a, b) => `${fmtMm(a)} × ${fmtMm(b)}`;
export const fmtMm = (v) => (Math.abs(v - Math.round(v)) < 0.005 ? String(Math.round(v)) : (Math.round(v * 100) / 100).toString().replace(".", ","));

// [pieza, fórmula, valor(P)]
export const TABLES = {
  tubo: [
    ["Costado exterior · ancho", "A", (P) => P.A],
    ["Frente · ancho", "L + e", (P) => P.L + P.e],
    ["Costado · ancho", "A", (P) => P.A],
    ["Contrafrente · ancho", "L", (P) => P.L],
    ["Solapa de pegado · ancho", "A − e", (P) => P.A - P.e],
    ["Contrafrente · alto", "H + 22e/3", (P) => P.H + (22 / 3) * P.e],
    ["Frente · alto", "H", (P) => P.H],
    ["Costado exterior · alto", "H + 16e/3", (P) => P.H + (16 / 3) * P.e],
    ["Costado · alto", "H + 13e/3", (P) => P.H + (13 / 3) * P.e],
    ["Solapa de pegado · alto", "H + 8e/3", (P) => P.H + (8 / 3) * P.e],
    ["Tubo abierto · ancho", "3A + 2L", (P) => 3 * P.A + 2 * P.L],
  ],
  cierres: [
    ["Tapa", "A × L", (P) => x(P.A, P.L)],
    ["Pestaña de pared doble", "10e/3", (P) => (10 / 3) * P.e],
    ["Lengüeta", "(A − 4e/3) × (L − 17)", (P) => x(P.A - (4 / 3) * P.e, P.L - 17)],
    ["Diente de la lengüeta", "85 × 5", () => x(85, 5)],
    ["Ranura de traba", "86,5 × 10e/3", (P) => x(86.5, (10 / 3) * P.e)],
    ["Contratapa · profundidad", "A − 2e", (P) => P.A - 2 * P.e],
    ["Contratapa · tramo recto", "L − 135,3", (P) => P.L - 135.3],
    ["Guardapolvo del costado", "A + 26", (P) => P.A + 26],
    ["Guardapolvo de la solapa", "A + 28,5", (P) => P.A + 28.5],
    ["Oreja · escala", "A / 94", (P) => P.A / 94],
  ],
  interior: [
    ["Ancho", "H − 2e", (P) => P.H - 2 * P.e],
    ["Pared exterior", "A − 2e", (P) => P.A - 2 * P.e],
    ["Puente", "t", (P) => P.t],
    ["Tabique", "A − 2e", (P) => P.A - 2 * P.e],
    ["Panel central", "L − 3e − 2t", (P) => P.L - 3 * P.e - 2 * P.t],
    ["Largo total", "4A + L − 11e", (P) => 4 * P.A + P.L - 11 * P.e],
    ["Plegado", "(L − 3e) × (H − 2e) × (A − 2e)", (P) => `${fmtMm(P.L - 3 * P.e)} × ${fmtMm(P.H - 2 * P.e)} × ${fmtMm(P.A - 2 * P.e)}`],
    ["Frasco · largo máximo", "L − 3e − 5", (P) => P.L - 3 * P.e - 5],
    ["Agujero del cuerpo", "⌀ Dc", (P) => P.Dc],
    ["Ranura del cuello", "Dn", (P) => P.Dn],
    ["Centros de los frascos", "Wi/2 + (i − (n − 1)/2)·p", (P) => Array.from({ length: P.n }, (_, i) => fmtMm((P.H - 2 * P.e) / 2 + (i - (P.n - 1) / 2) * P.p)).join(" · ")],
  ],
};
