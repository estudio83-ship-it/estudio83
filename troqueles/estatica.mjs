// Archivo para compartir: documento HTML completo (con la línea viewport para celulares) y con la página
// ya dibujada con los valores iniciales. La vista previa del iPhone (WhatsApp, Mail, Archivos) no ejecuta
// JavaScript: así igual muestra el plano, las variables y el resumen. Si el navegador ejecuta JavaScript,
// la página se rearma desde su molde y queda interactiva como siempre.
// Usa el Chromium de Playwright para dibujarla una vez.

// Sirve también para la página protegida con clave (que no tiene <main> hasta que se abre).
export function documentoCompleto(pagina) {
  return '<!doctype html>\n<html lang="es">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n</head>\n<body>\n' + pagina + "</body>\n</html>\n";
}

export async function prerender(pagina) {
  const doc = documentoCompleto(pagina);
  // Playwright suele estar instalado de forma global: se busca con require (respeta NODE_PATH).
  let chromium;
  try {
    const { createRequire } = await import("node:module");
    ({ chromium } = createRequire(import.meta.url)("playwright"));
  } catch {
    console.warn("Sin Playwright: el archivo sale completo pero sin dibujar (en la vista previa del iPhone se verá vacío).");
    return doc;
  }
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1536, height: 730 } });
    await page.setContent(doc, { waitUntil: "load" });
    await page.waitForSelector("#plan svg");
    const dibujada = await page.evaluate(() => document.querySelector("main").innerHTML);
    const a = doc.indexOf("<main>") + 6, b = doc.indexOf("</main>");
    const molde = doc.slice(a, b);
    // El script empieza devolviendo la página a su molde y la arma de nuevo, interactiva.
    // Si algo falla al rearmarla (un navegador viejo), vuelve a mostrar la página ya dibujada.
    const arranque = '<script>\nvar dibujoInicial = document.querySelector("main").innerHTML;\ndocument.querySelector("main").innerHTML = document.getElementById("molde-pagina").innerHTML;\ntry {\n';
    const cierre = '\n} catch (err) {\n  document.querySelector("main").innerHTML = dibujoInicial;\n  if (window.console) console.error(err);\n}\n';
    const i = doc.indexOf("<script>", b), j = doc.lastIndexOf("</script>");
    return doc.slice(0, a) + dibujada + "</main>\n<template id=\"molde-pagina\">" + molde + "</template>\n" + arranque + doc.slice(i + "<script>\n".length, j) + cierre + doc.slice(j);
  } finally {
    await browser.close();
  }
}
