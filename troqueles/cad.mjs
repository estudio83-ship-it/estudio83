// Salidas para ArtiosCAD, comunes a todos los diseños: DXF R12 por capas y CF2.
// Un modelo trae entities: { t: "L", k, a, b } o { t: "A", k, c, r, a0, a1 } (grados, antihorario),
// con k = "c" corte, "h" hendido, "p" perforado; y dims: { dir, x0, x1, y0, y1, at, value }.
// La página copia este archivo tal cual: los nombres no pueden chocar con los de un diseño.

export const CAPAS_CAD = { c: ["CORTE", 1], h: ["HENDIDO", 2], p: ["PERFORADO", 6] };
export const mmEntero = (v) => String(Math.round(v));

// cotas: lista de cotas a dibujar en la capa COTAS (color 7, blanco); rotulo(d) da el texto ("H=274").
export function escribirDxf(model, { cotas = [], rotulo = (d) => mmEntero(d.value) } = {}) {
  const out = [];
  const put = (c, v) => out.push(String(c).padStart(3), String(v));
  const f = (v) => (Math.round(v * 1e4) / 1e4).toString();
  put(0, "SECTION"); put(2, "HEADER"); put(9, "$ACADVER"); put(1, "AC1009"); put(9, "$INSUNITS"); put(70, 4); put(9, "$MEASUREMENT"); put(70, 1); put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "TABLES"); put(0, "TABLE"); put(2, "LAYER"); put(70, 4);
  for (const [n, c] of [...Object.values(CAPAS_CAD), ["COTAS", 7]]) { put(0, "LAYER"); put(2, n); put(70, 0); put(62, c); put(6, "CONTINUOUS"); }
  put(0, "ENDTAB"); put(0, "ENDSEC");
  put(0, "SECTION"); put(2, "ENTITIES");
  for (const e of model.entities) {
    const [layer, color] = CAPAS_CAD[e.k];
    if (e.t === "L") { put(0, "LINE"); put(8, layer); put(62, color); put(10, f(e.a[0])); put(20, f(e.a[1])); put(30, 0); put(11, f(e.b[0])); put(21, f(e.b[1])); put(31, 0); }
    else { put(0, "ARC"); put(8, layer); put(62, color); put(10, f(e.c[0])); put(20, f(e.c[1])); put(30, 0); put(40, f(e.r)); put(50, f(((e.a0 % 360) + 360) % 360)); put(51, f(((e.a1 % 360) + 360) % 360)); }
  }
  const line = (a, b) => { put(0, "LINE"); put(8, "COTAS"); put(62, 7); put(10, f(a[0])); put(20, f(a[1])); put(30, 0); put(11, f(b[0])); put(21, f(b[1])); put(31, 0); };
  const text = (at, s, rot) => { put(0, "TEXT"); put(8, "COTAS"); put(62, 7); put(10, f(at[0])); put(20, f(at[1])); put(30, 0); put(40, 10); put(1, s); if (rot) put(50, rot); put(72, 1); put(11, f(at[0])); put(21, f(at[1])); put(31, 0); };
  for (const d of cotas) {
    const v = rotulo(d);
    if (d.dir === "h") { line([d.x0, d.at], [d.x1, d.at]); line([d.x0, d.at - 7], [d.x0, d.at + 7]); line([d.x1, d.at - 7], [d.x1, d.at + 7]); text([(d.x0 + d.x1) / 2, d.at + 5], v); }
    else { line([d.at, d.y0], [d.at, d.y1]); line([d.at - 7, d.y0], [d.at + 7, d.y0]); line([d.at - 7, d.y1], [d.at + 7, d.y1]); text([d.at - 5, (d.y0 + d.y1) / 2], v, 90); }
  }
  put(0, "ENDSEC"); put(0, "EOF");
  return out.join("\r\n") + "\r\n";
}

// CF2 (Common Format 2): formato de intercambio de troquelería que ArtiosCAD importa.
// Tipo de línea: 1 corte, 2 hendido, 3 perforado. Pointage 2 pt. Arcos: dirección 1 antihorario.
export function escribirCf2(model, { name = "TROQUEL" } = {}) {
  const b = model.info.bounds;
  const f = (v) => (Math.round(v * 1e3) / 1e3).toFixed(3);
  const type = { c: 1, h: 2, p: 3 };
  const lines = ["$BOF", "V2", "ORDER", `MAIN,${name}`, "END", `MAIN,${name}`, "UM", `LL,${f(b.xMin)},${f(b.yMin)}`, `UR,${f(b.xMax)},${f(b.yMax)}`, "SCALE,1,1"];
  for (const e of model.entities) {
    if (e.t === "L") lines.push(`L,2,${type[e.k]},0,${f(e.a[0])},${f(e.a[1])},${f(e.b[0])},${f(e.b[1])},0,0`);
    else {
      const p = (a) => [e.c[0] + e.r * Math.cos((a * Math.PI) / 180), e.c[1] + e.r * Math.sin((a * Math.PI) / 180)];
      const [s, t] = [p(e.a0), p(e.a1)];
      lines.push(`A,2,${type[e.k]},0,${f(s[0])},${f(s[1])},${f(t[0])},${f(t[1])},${f(e.c[0])},${f(e.c[1])},1,0,0`);
    }
  }
  lines.push("END", "$EOF");
  return lines.join("\r\n") + "\r\n";
}

// Caja envolvente de las entidades (los arcos por puntos).
export function limitesDe(entities) {
  const pts = [];
  for (const e of entities) {
    if (e.t === "L") { pts.push(e.a, e.b); continue; }
    let sw = e.a1 - e.a0; while (sw <= 0) sw += 360;
    for (let i = 0; i <= 16; i++) { const a = ((e.a0 + (sw * i) / 16) * Math.PI) / 180; pts.push([e.c[0] + e.r * Math.cos(a), e.c[1] + e.r * Math.sin(a)]); }
  }
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  return { xMin: Math.min(...xs), xMax: Math.max(...xs), yMin: Math.min(...ys), yMax: Math.max(...ys) };
}
