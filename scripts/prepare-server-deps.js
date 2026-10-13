/**
 * Copia a build/server-deps/node_modules las dependencias de PRODUCCION del servidor.
 *
 * El servidor vive en un monorepo de npm: sus dependencias estan en core/node_modules, no en
 * core/server/node_modules, y el paquete excluye node_modules. Sin esto el servidor instalado
 * arranca con «Cannot find package 'fastify'». Se parte de lo que ya dejo `npm --prefix core ci`
 * y se copia solo el cierre de dependencias de produccion (npm ls --omit=dev).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const core = path.join(__dirname, '../core');
const origen = path.join(core, 'node_modules');
const destino = path.join(__dirname, '../build/server-deps/node_modules');

if (!fs.existsSync(origen)) {
  console.error('ERROR: falta core/node_modules. Ejecuta antes: npm --prefix core ci');
  process.exit(1);
}

const salida = execSync('npm ls --omit=dev --all --parseable --workspace server', {
  cwd: core,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
});

const rutas = salida
  .split('\n')
  .map((l) => l.trim())
  .filter(Boolean)
  .map((l) => path.resolve(l))
  .filter((p) => p.startsWith(origen + path.sep));

// @tvwatch/server es el propio workspace (un enlace), no una dependencia que copiar.
const paquetes = rutas.filter((p) => path.relative(origen, p) !== path.join('@tvwatch', 'server'));

if (paquetes.length === 0) {
  console.error('ERROR: npm ls no devolvio ninguna dependencia de produccion');
  process.exit(1);
}

fs.rmSync(path.join(__dirname, '../build/server-deps'), { recursive: true, force: true });
for (const p of paquetes) {
  fs.cpSync(p, path.join(destino, path.relative(origen, p)), { recursive: true, dereference: true });
}

for (const esencial of ['fastify', '@fastify/cookie', '@fastify/static', 'fast-xml-parser', 'qrcode']) {
  if (!fs.existsSync(path.join(destino, esencial, 'package.json'))) {
    console.error(`ERROR: falta ${esencial} en ${destino}`);
    process.exit(1);
  }
}
console.log(`Dependencias de produccion del servidor: ${paquetes.length} paquetes en build/server-deps/node_modules`);
