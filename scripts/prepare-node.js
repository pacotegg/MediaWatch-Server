/**
 * Deja en bin/ un Node.js con la version FIJADA, para que el instalador no dependa de que
 * el usuario tenga Node. El servidor usa node:sqlite y ejecuta TypeScript sin compilar, y el
 * Node que lleva Electron 34 es el 20.18, que no tiene node:sqlite: hay que llevar el nuestro.
 *
 * Se descarga de nodejs.org/dist y se comprueba contra SHASUMS256.txt de esa misma version.
 * Si bin/node ya existe con la version buena, no hace nada.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const NODE_VERSION = '26.4.0';

const binDir = path.join(__dirname, '../bin');
fs.mkdirSync(binDir, { recursive: true });

const isWin = process.platform === 'win32';
const destino = path.join(binDir, isWin ? 'node.exe' : 'node');

function versionDe(ejecutable) {
  try {
    return execFileSync(ejecutable, ['--version'], { encoding: 'utf8' }).trim();
  } catch {
    return null;
  }
}

async function descargar(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

async function main() {
  if (fs.existsSync(destino) && versionDe(destino) === `v${NODE_VERSION}`) {
    console.log(`node ${NODE_VERSION} ya presente en bin/`);
    return;
  }

  const base = `https://nodejs.org/dist/v${NODE_VERSION}`;
  const arch = process.arch === 'arm64' ? 'arm64' : 'x64';
  const archivo = isWin ? `win-${arch}/node.exe` : `node-v${NODE_VERSION}-${process.platform}-${arch}.tar.xz`;

  console.log(`Descargando ${base}/${archivo} ...`);
  const sumas = (await descargar(`${base}/SHASUMS256.txt`)).toString('utf8');
  const linea = sumas.split('\n').find((l) => l.trim().endsWith(`  ${archivo}`));
  if (!linea) throw new Error(`SHASUMS256.txt no lista ${archivo}`);
  const esperado = linea.trim().split(/\s+/)[0];

  const datos = await descargar(`${base}/${archivo}`);
  const real = sha256(datos);
  if (real !== esperado) throw new Error(`Checksum de ${archivo} no coincide: esperado ${esperado}, obtenido ${real}`);
  console.log(`Checksum OK (${real.slice(0, 16)}...)`);

  if (isWin) {
    fs.writeFileSync(destino, datos);
  } else {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'mw-node-'));
    const tar = path.join(tmp, 'node.tar.xz');
    fs.writeFileSync(tar, datos);
    execFileSync('tar', ['-xJf', tar, '-C', tmp, '--strip-components=2', `node-v${NODE_VERSION}-${process.platform}-${arch}/bin/node`]);
    fs.copyFileSync(path.join(tmp, 'node'), destino);
    fs.chmodSync(destino, 0o755);
    fs.rmSync(tmp, { recursive: true, force: true });
  }

  const v = versionDe(destino);
  if (v !== `v${NODE_VERSION}`) throw new Error(`bin/node dice ${v}, se esperaba v${NODE_VERSION}`);
  console.log(`bin/node listo: ${v}`);
}

main().catch((e) => {
  console.error('ERROR preparando node:', e.message);
  process.exit(1);
});
