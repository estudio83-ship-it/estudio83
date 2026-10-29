// Lee el troquel DXF y lo convierte en caras (paneles y solapas) unidas por hendidos.
import { readFileSync } from "node:fs";

const KIND = { 1: "cut", 2: "crease", 6: "perf" };

export function readDxf(file) {
  const lines = readFileSync(file, "latin1").split(/\r?\n/);
  const pairs = [];
  for (let i = 0; i + 1 < lines.length; i += 2) pairs.push([Number(lines[i].trim()), lines[i + 1]]);
  const start = pairs.findIndex(([c, v], i) => c === 2 && v.trim() === "ENTITIES" && pairs[i - 1][1].trim() === "SECTION");
  const segments = [];
  let entity = null;
  const flush = () => {
    if (!entity || entity.layer !== "Troquel") return;
    const kind = KIND[entity.color];
    if (!kind) return;
    if (entity.type === "LINE") segments.push({ a: [entity[10], entity[20]], b: [entity[11], entity[21]], kind });
    if (entity.type === "ARC") {
      const [cx, cy, r] = [entity[10], entity[20], entity[40]];
      let a0 = (entity[50] * Math.PI) / 180, a1 = (entity[51] * Math.PI) / 180;
      if (a1 <= a0) a1 += Math.PI * 2;
      const n = Math.max(2, Math.ceil(((a1 - a0) * r) / (r < 5 ? 0.3 : 2.5)));
      for (let i = 0; i < n; i++) {
        const t0 = a0 + ((a1 - a0) * i) / n, t1 = a0 + ((a1 - a0) * (i + 1)) / n;
        segments.push({ a: [cx + r * Math.cos(t0), cy + r * Math.sin(t0)], b: [cx + r * Math.cos(t1), cy + r * Math.sin(t1)], kind });
      }
    }
  };
  for (let i = start + 1; i < pairs.length; i++) {
    const [code, raw] = pairs[i];
    const value = raw.trim();
    if (code === 0) {
      flush();
      if (value === "ENDSEC") break;
      entity = { type: value, color: 256 };
      continue;
    }
    if (!entity) continue;
    if (code === 8) entity.layer = value;
    else if (code === 62) entity.color = Number(value);
    else if ([10, 20, 11, 21, 40, 50, 51].includes(code)) entity[code] ??= Number(value);
  }
  return segments;
}

const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1];

// Parte cada segmento donde lo toca otro (uniones en T y cruces) y suelda vértices cercanos.
function planarGraph(segments, tol = 0.2) {
  const cuts = segments.map(() => [0, 1]);
  segments.forEach((s, i) => {
    const d = sub(s.b, s.a), len2 = dot(d, d);
    segments.forEach((o, j) => {
      if (i === j) return;
      for (const p of [o.a, o.b]) {
        const t = dot(sub(p, s.a), d) / len2;
        if (t <= 1e-4 || t >= 1 - 1e-4) continue;
        const q = [s.a[0] + d[0] * t, s.a[1] + d[1] * t];
        if (Math.hypot(q[0] - p[0], q[1] - p[1]) < tol) cuts[i].push(t);
      }
      const e = sub(o.b, o.a), den = cross(d, e);
      if (Math.abs(den) < 1e-9) return;
      const t = cross(sub(o.a, s.a), e) / den, u = cross(sub(o.a, s.a), d) / den;
      if (t > 1e-4 && t < 1 - 1e-4 && u > 1e-4 && u < 1 - 1e-4) cuts[i].push(t);
    });
  });
  const verts = [];
  const vid = (p) => {
    for (let k = 0; k < verts.length; k++) if (Math.hypot(verts[k][0] - p[0], verts[k][1] - p[1]) < tol) return k;
    verts.push([p[0], p[1]]);
    return verts.length - 1;
  };
  const edges = new Map();
  segments.forEach((s, i) => {
    const ts = [...new Set(cuts[i].map((t) => Math.round(t * 1e6) / 1e6))].sort((a, b) => a - b);
    for (let k = 0; k + 1 < ts.length; k++) {
      const p = (t) => [s.a[0] + (s.b[0] - s.a[0]) * t, s.a[1] + (s.b[1] - s.a[1]) * t];
      const u = vid(p(ts[k])), v = vid(p(ts[k + 1]));
      if (u === v) continue;
      const key = u < v ? `${u},${v}` : `${v},${u}`;
      const prev = edges.get(key);
      if (!prev || prev.kind !== "cut") edges.set(key, { u: Math.min(u, v), v: Math.max(u, v), kind: s.kind });
    }
  });
  return { verts, edges: [...edges.values()] };
}

const area = (ring) => ring.reduce((s, p, i) => s + cross(p, ring[(i + 1) % ring.length]), 0) / 2;

function inside(p, ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

// Caras del grafo plano: las que tienen algún hendido son material; las que son sólo corte, huecos.
export function facesOf(segments) {
  const { verts, edges } = planarGraph(segments);
  const out = verts.map(() => []);
  const half = [];
  edges.forEach((e, i) => {
    for (const [a, b] of [[e.u, e.v], [e.v, e.u]]) {
      const h = { from: a, to: b, edge: i, angle: Math.atan2(verts[b][1] - verts[a][1], verts[b][0] - verts[a][0]) };
      half.push(h);
      out[a].push(h);
    }
  });
  out.forEach((list) => list.sort((p, q) => p.angle - q.angle));
  const twin = (h) => out[h.to].find((o) => o.to === h.from && o.edge === h.edge);
  const seen = new Set();
  const loops = [];
  for (const h0 of half) {
    if (seen.has(h0)) continue;
    const loop = [];
    let h = h0;
    while (!seen.has(h)) {
      seen.add(h);
      loop.push(h);
      const t = twin(h), list = out[h.to], at = list.indexOf(t);
      h = list[(at - 1 + list.length) % list.length];
    }
    loops.push(loop);
  }
  const faces = [];
  const shells = [];
  for (const loop of loops) {
    const ring = loop.map((h) => verts[h.from]);
    const a = area(ring);
    const kinds = loop.map((h) => edges[h.edge].kind);
    const item = { ring, area: a, kinds, edges: loop.map((h) => h.edge) };
    if (a > 0 && kinds.some((k) => k !== "cut")) faces.push(item);
    else if (a < 0) shells.push(item);
  }
  // Componentes sueltas dentro de una cara (huecos no conectados) pasan a ser huecos de esa cara.
  for (const f of faces) f.holes = [];
  for (const s of shells) {
    const host = faces.filter((f) => inside(s.ring[0], f.ring) && Math.abs(f.area) > Math.abs(s.area)).sort((p, q) => p.area - q.area)[0];
    if (host) host.holes.push(s.ring);
  }
  return { verts, edges, faces };
}

// Árbol de bisagras: cada cara cuelga de la vecina más cercana a la raíz por un hendido compartido.
export function hingeTree(model, roots) {
  const { verts, edges, faces } = model;
  const byEdge = new Map();
  faces.forEach((f, i) => f.edges.forEach((e, k) => { if (f.kinds[k] !== "cut") (byEdge.get(e) ?? byEdge.set(e, []).get(e)).push(i); }));
  const parent = faces.map(() => -1), hinge = faces.map(() => null), kindOf = faces.map(() => null), depth = faces.map(() => -1);
  const queue = [...roots];
  roots.forEach((r) => (depth[r] = 0));
  while (queue.length) {
    const at = queue.shift();
    const shared = new Map();
    faces[at].edges.forEach((e, k) => {
      if (faces[at].kinds[k] === "cut") return;
      for (const other of byEdge.get(e) ?? []) if (other !== at && depth[other] < 0) (shared.get(other) ?? shared.set(other, []).get(other)).push(e);
    });
    for (const [child, list] of shared) {
      const pts = list.flatMap((e) => [verts[edges[e].u], verts[edges[e].v]]);
      const a = pts[0];
      let far = a, best = 0;
      for (const p of pts) { const d = Math.hypot(p[0] - a[0], p[1] - a[1]); if (d > best) { best = d; far = p; } }
      let near = far; best = 0;
      for (const p of pts) { const d = Math.hypot(p[0] - far[0], p[1] - far[1]); if (d > best) { best = d; near = p; } }
      parent[child] = at; hinge[child] = [near, far]; kindOf[child] = edges[list[0]].kind; depth[child] = depth[at] + 1;
      queue.push(child);
    }
  }
  return { parent, hinge, kind: kindOf, depth };
}

export function faceAt(model, p) {
  return model.faces.findIndex((f) => inside(p, f.ring));
}
