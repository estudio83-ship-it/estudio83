// Superficie de cartón del troquel: las caras del grafo plano que tienen algún hendido o intermitente,
// con sus huecos. Es la misma regla que facesOf de ../troquel.mjs, con una grilla para que alcance
// a redibujarse mientras se arrastra un deslizador.

export function cartonRings(model) {
  const segs = [];
  for (const e of model.entities) {
    if (e.t === "L") { segs.push([e.a, e.b, e.k]); continue; }
    let sweep = e.a1 - e.a0; while (sweep <= 0) sweep += 360; while (sweep > 360) sweep -= 360;
    const a0 = (e.a0 * Math.PI) / 180, sw = (sweep * Math.PI) / 180;
    const n = Math.max(2, Math.ceil((sw * e.r) / (e.r < 5 ? 0.6 : 4)));
    const at = (i) => [e.c[0] + e.r * Math.cos(a0 + (sw * i) / n), e.c[1] + e.r * Math.sin(a0 + (sw * i) / n)];
    for (let i = 0; i < n; i++) segs.push([at(i), at(i + 1), e.k]);
  }
  const tol = 0.2, cell = 40;
  const key = (x, y) => Math.floor(x / cell) + "," + Math.floor(y / cell);
  // Grilla de segmentos por caja envolvente.
  const grid = new Map();
  segs.forEach((s, i) => {
    const x0 = Math.min(s[0][0], s[1][0]) - tol, x1 = Math.max(s[0][0], s[1][0]) + tol;
    const y0 = Math.min(s[0][1], s[1][1]) - tol, y1 = Math.max(s[0][1], s[1][1]) + tol;
    for (let gx = Math.floor(x0 / cell); gx <= Math.floor(x1 / cell); gx++)
      for (let gy = Math.floor(y0 / cell); gy <= Math.floor(y1 / cell); gy++) {
        const k = gx + "," + gy;
        if (!grid.has(k)) grid.set(k, []);
        grid.get(k).push(i);
      }
  });
  const near = (i) => {
    const s = segs[i], found = new Set();
    const x0 = Math.min(s[0][0], s[1][0]) - tol, x1 = Math.max(s[0][0], s[1][0]) + tol;
    const y0 = Math.min(s[0][1], s[1][1]) - tol, y1 = Math.max(s[0][1], s[1][1]) + tol;
    for (let gx = Math.floor(x0 / cell); gx <= Math.floor(x1 / cell); gx++)
      for (let gy = Math.floor(y0 / cell); gy <= Math.floor(y1 / cell); gy++) for (const j of grid.get(gx + "," + gy) || []) if (j !== i) found.add(j);
    return found;
  };
  // Parte cada segmento donde lo toca otro (uniones en T y cruces).
  const cuts = segs.map(() => [0, 1]);
  segs.forEach((s, i) => {
    const dx = s[1][0] - s[0][0], dy = s[1][1] - s[0][1], len2 = dx * dx + dy * dy;
    for (const j of near(i)) {
      const o = segs[j];
      for (const p of [o[0], o[1]]) {
        const t = ((p[0] - s[0][0]) * dx + (p[1] - s[0][1]) * dy) / len2;
        if (t <= 1e-4 || t >= 1 - 1e-4) continue;
        if (Math.hypot(s[0][0] + dx * t - p[0], s[0][1] + dy * t - p[1]) < tol) cuts[i].push(t);
      }
      const ex = o[1][0] - o[0][0], ey = o[1][1] - o[0][1], den = dx * ey - dy * ex;
      if (Math.abs(den) < 1e-9) continue;
      const wx = o[0][0] - s[0][0], wy = o[0][1] - s[0][1];
      const t = (wx * ey - wy * ex) / den, u = (wx * dy - wy * dx) / den;
      if (t > 1e-4 && t < 1 - 1e-4 && u > 1e-4 && u < 1 - 1e-4) cuts[i].push(t);
    }
  });
  // Vértices soldados con una grilla fina.
  const verts = [], vgrid = new Map();
  const vid = (p) => {
    const gx = Math.floor(p[0] / 1), gy = Math.floor(p[1] / 1);
    for (let a = gx - 1; a <= gx + 1; a++) for (let b = gy - 1; b <= gy + 1; b++)
      for (const k of vgrid.get(a + "," + b) || []) if (Math.hypot(verts[k][0] - p[0], verts[k][1] - p[1]) < tol) return k;
    verts.push(p);
    const k = gx + "," + gy;
    if (!vgrid.has(k)) vgrid.set(k, []);
    vgrid.get(k).push(verts.length - 1);
    return verts.length - 1;
  };
  const edges = new Map();
  segs.forEach((s, i) => {
    const ts = [...new Set(cuts[i].map((t) => Math.round(t * 1e6) / 1e6))].sort((a, b) => a - b);
    const pt = (t) => [s[0][0] + (s[1][0] - s[0][0]) * t, s[0][1] + (s[1][1] - s[0][1]) * t];
    for (let k = 0; k + 1 < ts.length; k++) {
      const u = vid(pt(ts[k])), v = vid(pt(ts[k + 1]));
      if (u === v) continue;
      const id = u < v ? u + "," + v : v + "," + u, prev = edges.get(id);
      if (!prev || prev.k !== "c") edges.set(id, { u, v, k: s[2] });
    }
  });
  // Caras por recorrido de medias aristas.
  const out = verts.map(() => []), half = [];
  [...edges.values()].forEach((e) => {
    for (const [a, b] of [[e.u, e.v], [e.v, e.u]]) {
      const h = { from: a, to: b, e, ang: Math.atan2(verts[b][1] - verts[a][1], verts[b][0] - verts[a][0]) };
      half.push(h);
      out[a].push(h);
    }
  });
  out.forEach((l) => l.sort((p, q) => p.ang - q.ang));
  const seen = new Set(), rings = [];
  for (const h0 of half) {
    if (seen.has(h0)) continue;
    const ring = [];
    let h = h0, material = false;
    while (!seen.has(h)) {
      seen.add(h);
      ring.push(verts[h.from]);
      if (h.e.k !== "c") material = true;
      const list = out[h.to], at = list.findIndex((o) => o.to === h.from && o.e === h.e);
      h = list[(at - 1 + list.length) % list.length];
    }
    let area = 0;
    for (let i = 0; i < ring.length; i++) { const p = ring[i], q = ring[(i + 1) % ring.length]; area += p[0] * q[1] - p[1] * q[0]; }
    // Material: caras con área positiva y algún hendido; las de puro corte son huecos.
    if (area > 0 && material) rings.push(ring);
  }
  return rings;
}
