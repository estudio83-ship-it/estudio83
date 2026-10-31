// Beep corto al terminar cada respuesta de Claude (hook "Stop").
// Windows: beep por PowerShell. Linux/Mac: carácter de campana a la terminal.
const { execFile } = require('child_process');
const fs = require('fs');

if (process.platform === 'win32') {
  execFile('powershell', ['-NoProfile', '-Command', '[console]::beep(880,180)'], () => {});
} else {
  try {
    fs.writeFileSync('/dev/tty', '\x07');
  } catch {
    // Sin terminal (por ejemplo, en una sesión en la nube): no hacer nada.
  }
}
