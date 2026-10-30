// Protege una página armada con armarPagina: la encripta con una clave (AES-GCM 256, clave derivada
// con PBKDF2-SHA256, 600 000 vueltas). El archivo que sale sólo muestra el título y un campo para la
// clave; sin ella el diseño, el generador y las fórmulas son ilegibles. Al cambiar la clave se vuelve
// a encriptar: la página nueva no abre con la clave vieja.
import { webcrypto } from "node:crypto";

const VUELTAS = 600000;
const b64 = (u8) => Buffer.from(u8).toString("base64");

// La página tiene: <title>, metas y links, <style>, <main> y <script>; se guardan por partes para
// armarla dentro del mismo documento (así el visor de claude.ai conserva sus permisos).
function partes(html) {
  const title = html.match(/<title>([\s\S]*?)<\/title>/)[1];
  const head = html.slice(html.indexOf("</title>") + 8, html.indexOf("<main>"));
  const main = html.slice(html.indexOf("<main>"), html.indexOf("</main>") + 7);
  const script = html.slice(html.indexOf("<script>") + 8, html.lastIndexOf("</script>"));
  return { title, head, main, script };
}

export async function protegerPagina(html, clave) {
  if (!clave || clave.length < 8) throw new Error("La clave tiene que tener al menos 8 caracteres.");
  const { title, head, main, script } = partes(html);
  const sal = webcrypto.getRandomValues(new Uint8Array(16)), iv = webcrypto.getRandomValues(new Uint8Array(12));
  const base = await webcrypto.subtle.importKey("raw", new TextEncoder().encode(clave), "PBKDF2", false, ["deriveKey"]);
  const key = await webcrypto.subtle.deriveKey({ name: "PBKDF2", salt: sal, iterations: VUELTAS, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const datos = new TextEncoder().encode(JSON.stringify({ head, main, script }));
  const cifrado = new Uint8Array(await webcrypto.subtle.encrypt({ name: "AES-GCM", iv }, key, datos));
  const sobre = JSON.stringify({ s: b64(sal), i: b64(iv), d: b64(cifrado), n: VUELTAS });
  return `<title>${title}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<script>
// El permiso de descargas de claude.ai se pide antes que nada; la página, al abrirse, usa esta misma respuesta.
window.__descargas = window.claude && window.claude.use ? window.claude.use("downloads") : null;
</script>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap">
<style>
:root{--paper:#fbfbfd;--sheet:#ffffff;--ink:#0b1a2e;--soft:#3a4656;--rule:#cfdbea;--blue:#1f78e0;--blue-deep:#1662bd;--orange-deep:#c25105;color-scheme:light}
body{margin:0;background:var(--paper);color:var(--ink);font:15px/1.5 Inter,-apple-system,"Helvetica Neue",Arial,sans-serif;padding:0 16px}
.llave{max-width:380px;margin:12vh auto 0;background:var(--sheet);border:1px solid var(--rule);border-radius:28px;padding:28px;display:grid;gap:14px}
.llave h1{font:700 28px/1.1 Montserrat,Inter,sans-serif;letter-spacing:-.03em;margin:0}
.llave p{margin:0;color:var(--soft);font-size:14px}
.llave input{font:500 15px "IBM Plex Mono",ui-monospace,monospace;border:1px solid var(--rule);border-radius:980px;padding:10px 16px;background:var(--sheet);color:var(--ink)}
.llave input:focus-visible,.llave button:focus-visible{outline:2px solid var(--blue);outline-offset:1px}
.llave button{font:600 15px Inter,sans-serif;color:#fff;background:var(--blue);border:1px solid var(--blue);border-radius:980px;padding:10px 16px;cursor:pointer}
.llave button:hover{background:var(--blue-deep)}
.llave button:disabled{opacity:.6;cursor:default}
.llave .error{color:var(--orange-deep);min-height:1.4em;font-size:14px}
</style>
<form class="llave" id="llave" autocomplete="off">
  <h1>${title}</h1>
  <p>Ingresá la clave para abrir el diseño.</p>
  <input id="clave" type="password" aria-label="Clave" autocomplete="current-password" required>
  <button type="submit" id="abrir">Abrir</button>
  <p class="error" id="error" role="alert"></p>
</form>
<script>
const SOBRE = ${sobre};
const bytes = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
document.getElementById("clave").focus();
document.getElementById("llave").addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const boton = document.getElementById("abrir"), error = document.getElementById("error");
  boton.disabled = true; boton.textContent = "Abriendo…"; error.textContent = "";
  try {
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(document.getElementById("clave").value), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: bytes(SOBRE.s), iterations: SOBRE.n, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const datos = JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: "AES-GCM", iv: bytes(SOBRE.i) }, key, bytes(SOBRE.d))));
    document.getElementById("llave").remove();
    document.head.insertAdjacentHTML("beforeend", datos.head);
    document.body.insertAdjacentHTML("afterbegin", datos.main);
    const s = document.createElement("script");
    s.textContent = datos.script;
    document.body.appendChild(s);
  } catch (e) {
    error.textContent = "Clave incorrecta.";
    boton.disabled = false; boton.textContent = "Abrir";
  }
});
</script>
`;
}
