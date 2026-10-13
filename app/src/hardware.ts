import { spawn } from 'node:child_process';

export type Aceleracion = 'qsv' | 'nvenc' | 'amf' | 'none';

export const ETIQUETA_ACELERACION: Record<Aceleracion, string> = {
  qsv: 'Intel Quick Sync',
  nvenc: 'NVIDIA NVENC',
  amf: 'AMD AMF',
  none: 'solo procesador (sin aceleración por GPU)',
};

// Orden de preferencia: una tarjeta dedicada gana a la gráfica integrada.
const PRUEBAS: Array<[Exclude<Aceleracion, 'none'>, string]> = [
  ['nvenc', 'h264_nvenc'],
  ['qsv', 'h264_qsv'],
  ['amf', 'h264_amf'],
];

/** Que ffmpeg incluya un codificador no prueba que haya GPU: hay que codificar de verdad unos fotogramas. */
function probar(ffmpeg: string, codificador: string): Promise<boolean> {
  return new Promise((resolve) => {
    const args = ['-hide_banner', '-loglevel', 'error', '-f', 'lavfi', '-i', 'testsrc2=size=640x360:rate=25', '-frames:v', '10', '-c:v', codificador, '-f', 'null', '-'];
    const p = spawn(ffmpeg, args, { windowsHide: true, stdio: 'ignore' });
    const limite = setTimeout(() => {
      p.kill();
      resolve(false);
    }, 15000);
    p.on('error', () => {
      clearTimeout(limite);
      resolve(false);
    });
    p.on('exit', (codigo) => {
      clearTimeout(limite);
      resolve(codigo === 0);
    });
  });
}

export async function detectarAceleracion(ffmpeg: string | undefined): Promise<Aceleracion> {
  if (!ffmpeg) return 'none';
  for (const [hw, codificador] of PRUEBAS) {
    if (await probar(ffmpeg, codificador)) return hw;
  }
  return 'none';
}
