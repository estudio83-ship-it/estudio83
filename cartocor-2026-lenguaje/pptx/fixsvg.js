// Reemplaza el PNG de respaldo de cada SVG por un render real (pptxgenjs escribe datos SVG en el .png)
const JSZip = require("jszip"); const sharp = require("sharp"); const fs = require("fs");
(async () => {
  const f = process.argv[2]; const zip = await JSZip.loadAsync(fs.readFileSync(f));
  const rels = Object.keys(zip.files).filter(n => /ppt\/slides\/_rels\/slide\d+\.xml\.rels$/.test(n));
  let n = 0;
  for (const r of rels) {
    const xml = await zip.file(r).async("string");
    const targets = [...xml.matchAll(/Id="(rId\d+)"[^>]*Target="\.\.\/media\/([^"]+)"/g)].map(m => [m[1], m[2]]);
    const byId = Object.fromEntries(targets);
    for (const [id, t] of targets) {
      if (!t.endsWith(".svg")) continue;
      const num = +id.slice(3), png = byId["rId" + (num - 1)];
      if (!png || !png.endsWith(".png")) continue;
      const svg = await zip.file("ppt/media/" + t).async("nodebuffer");
      zip.file("ppt/media/" + png, await sharp(svg).resize(192, 192).png().toBuffer()); n++;
    }
  }
  fs.writeFileSync(f, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
  console.log("svg fallbacks", n);
})();
