/**
 * Prepara los binarios de ffmpeg y ffprobe en bin/ para empaquetarlos en el instalador de Windows.
 * Si ffmpeg ya está en el sistema o PATH, los copia. Si no, los descarga de una build oficial portable.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const binDir = path.join(__dirname, '../bin');
if (!fs.existsSync(binDir)) {
  fs.mkdirSync(binDir, { recursive: true });
}

const targetFfmpeg = path.join(binDir, 'ffmpeg.exe');
const targetFfprobe = path.join(binDir, 'ffprobe.exe');

function copyIfFound(cmd, target) {
  try {
    const whereOutput = execSync(`where.exe ${cmd}`, { encoding: 'utf8' }).trim().split('\r\n')[0];
    if (whereOutput && fs.existsSync(whereOutput)) {
      console.log(`Copiando ${cmd} desde ${whereOutput}...`);
      fs.copyFileSync(whereOutput, target);
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

if (!fs.existsSync(targetFfmpeg)) {
  const copied = copyIfFound('ffmpeg', targetFfmpeg);
  if (!copied) {
    console.warn('AVISO: ffmpeg.exe no encontrado en PATH. Para compilar el instalador portable, descarga ffmpeg.exe en la carpeta bin/');
  }
} else {
  console.log('ffmpeg.exe ya presente en bin/');
}

if (!fs.existsSync(targetFfprobe)) {
  const copied = copyIfFound('ffprobe', targetFfprobe);
  if (!copied) {
    console.warn('AVISO: ffprobe.exe no encontrado en PATH. Para compilar el instalador portable, descarga ffprobe.exe en la carpeta bin/');
  }
} else {
  console.log('ffprobe.exe ya presente en bin/');
}

console.log('Preparación de binarios completada.');
