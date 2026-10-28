// Arranca Playwright MCP con la configuración correcta según dónde se ejecute:
// - En Claude Code en la nube usa el Chromium que ya trae la máquina (/opt/pw-browsers),
//   sin sandbox (la nube no lo permite) y sin ventana.
// - En la PC usa el navegador que Playwright instala normalmente.
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

const VERSION = "0.0.83"; // versión fija de @playwright/mcp; actualizar a mano
const args = ["-y", `@playwright/mcp@${VERSION}`];

const base = "/opt/pw-browsers";
if (fs.existsSync(base)) {
  const dir = fs.readdirSync(base).find((d) => /^chromium-\d+$/.test(d));
  const exe = dir && path.join(base, dir, "chrome-linux64", "chrome");
  if (exe && fs.existsSync(exe)) args.push("--executable-path", exe);
  args.push("--headless", "--no-sandbox", "--isolated");
}

const npx = process.platform === "win32" ? "npx.cmd" : "npx";
const p = spawn(npx, args, { stdio: "inherit", shell: process.platform === "win32" });
p.on("exit", (code) => process.exit(code ?? 0));
