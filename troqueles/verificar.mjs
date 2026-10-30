// Verificación de geometría común a todos los diseños:
//  · sin extremos sueltos: cada extremo de línea o arco toca otra línea;
//  · sin cruces: ninguna línea atraviesa a otra;
//  · sin líneas superpuestas.
// verificarDiseno(design, casos) recorre combinaciones de medidas y devuelve los problemas.

const TOL = 0.02;

// Segmentos de cada entidad (los arcos, en tramos cortos).
function piecesOf(e) {
  if (e.t === "L") return [[e.a, e.b]];
  let a1 = e.a1;
  while (a1 <= e.a0) a1 += 360;
  const n = Math.max(8, Math.ceil(((a1 - e.a0) * e.r) / 180));
  const at = (a) => [e.c[0] + e.r * Math.cos((a * Math.PI) / 180), e.c[1] + e.r * Math.sin((a * Math.PI) / 180)];
  return Array.from({ length: n }, (_, i) => [at(e.a0 + ((a1 - e.a0) * i) / n), at(e.a0 + ((a1 - e.a0) * (i + 1)) / n)]);
}
const ends = (e) => { const p = piecesOf(e); return [p[0][0], p[p.length - 1][1]]; };
const near = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < TOL;
function distToSeg(p, [a, b]) {
  const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
  const t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0;
  return Math.hypot(p[0] - (a[0] + dx * t), p[1] - (a[1] + dy * t));
}
// Un arco aproximado con cuerdas: para tocarlo alcanza con estar a menos que la flecha de la cuerda.
const sagOf = (e) => (e.t === "A" ? e.r * (1 - Math.cos((Math.PI / 180) * (180 / Math.max(1, e.r)) / 2)) + TOL : TOL);

export function inspect(model) {
  const ents = model.entities;
  const pcs = ents.map(piecesOf);
  const problems = [];
  // 1. Extremos sueltos.
  ents.forEach((e, i) => {
    for (const p of ends(e)) {
      const ok = ents.some((o, j) => j !== i && (ends(o).some((q) => near(p, q)) || pcs[j].some((s) => distToSeg(p, s) < sagOf(o))));
      if (!ok) problems.push(`extremo suelto en (${p[0].toFixed(2)}, ${p[1].toFixed(2)})`);
    }
  });
  // 2. Cruces y 3. superposiciones entre entidades distintas.
  const box = (list) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [p, q] of list) { a = Math.min(a, p[0], q[0]); b = Math.min(b, p[1], q[1]); c = Math.max(c, p[0], q[0]); d = Math.max(d, p[1], q[1]); } return [a - 1, b - 1, c + 1, d + 1]; };
  const boxes = pcs.map(box);
  for (let i = 0; i < ents.length; i++) for (let j = i + 1; j < ents.length; j++) {
    const A = boxes[i], B = boxes[j];
    if (A[2] < B[0] || B[2] < A[0] || A[3] < B[1] || B[3] < A[1]) continue;
    const endsIJ = [...ends(ents[i]), ...ends(ents[j])];
    for (const [p, q] of pcs[i]) for (const [r, s] of pcs[j]) {
      const d1 = (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
      const d2 = (q[0] - p[0]) * (s[1] - p[1]) - (q[1] - p[1]) * (s[0] - p[0]);
      const d3 = (s[0] - r[0]) * (p[1] - r[1]) - (s[1] - r[1]) * (p[0] - r[0]);
      const d4 = (s[0] - r[0]) * (q[1] - r[1]) - (s[1] - r[1]) * (q[0] - r[0]);
      const lpq = Math.hypot(q[0] - p[0], q[1] - p[1]), lrs = Math.hypot(s[0] - r[0], s[1] - r[1]);
      if (Math.abs(d1) / lpq < 1e-6 && Math.abs(d2) / lpq < 1e-6) {
        // Colineales: ¿se solapan?
        const ux = (q[0] - p[0]) / lpq, uy = (q[1] - p[1]) / lpq;
        const t = (z) => (z[0] - p[0]) * ux + (z[1] - p[1]) * uy;
        const lo = Math.max(0, Math.min(t(r), t(s))), hi = Math.min(lpq, Math.max(t(r), t(s)));
        if (hi - lo > TOL) problems.push(`líneas superpuestas cerca de (${p[0].toFixed(1)}, ${p[1].toFixed(1)})`);
        continue;
      }
      const tolA = TOL * lrs, tolB = TOL * lpq;
      if (((d1 > tolA && d2 < -tolA) || (d1 < -tolA && d2 > tolA)) && ((d3 > tolB && d4 < -tolB) || (d3 < -tolB && d4 > tolB))) {
        const den = (q[0] - p[0]) * (s[1] - r[1]) - (q[1] - p[1]) * (s[0] - r[0]);
        const u = ((r[0] - p[0]) * (s[1] - r[1]) - (r[1] - p[1]) * (s[0] - r[0])) / den;
        const x = [p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u];
        if (!endsIJ.some((z) => Math.hypot(z[0] - x[0], z[1] - x[1]) < 0.3)) problems.push(`cruce en (${x[0].toFixed(1)}, ${x[1].toFixed(1)})`);
      }
    }
  }
  return [...new Set(problems)];
}

// Casos: los que se pasen, los mínimos y máximos de cada variable y `aleatorios` combinaciones al azar.
export function verificarDiseno(design, { casos = [], aleatorios = 400, semilla = 6463, extra } = {}) {
  const all = [{}, ...casos, Object.fromEntries(design.PARAMS.map((q) => [q.key, q.min])), Object.fromEntries(design.PARAMS.map((q) => [q.key, q.max]))];
  let seed = semilla;
  const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = 0; i < aleatorios; i++) all.push(Object.fromEntries(design.PARAMS.map((q) => [q.key, q.min + rnd() * (q.max - q.min)])));
  const malos = [];
  all.forEach((params, i) => {
    const m = design.generate(params);
    const problems = [...inspect(m), ...(extra ? extra(m, i) : [])];
    if (problems.length) malos.push({ P: m.P, problems });
  });
  return { total: all.length, malos };
}

export function informar({ total, malos }) {
  for (const { P, problems } of malos) console.log("✗", JSON.stringify(P), "\n   ", problems.slice(0, 6).join("\n    "), problems.length > 6 ? `\n    … y ${problems.length - 6} más` : "");
  console.log(`${total} combinaciones · ${malos.length} con problemas`);
  return malos.length ? 1 : 0;
}
