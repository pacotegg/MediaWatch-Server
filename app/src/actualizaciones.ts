import { app, Notification } from 'electron';
import { autoUpdater } from 'electron-updater';
import { appendFileSync } from 'node:fs';
import { EventEmitter } from 'node:events';
import { join } from 'node:path';
import { getDataDir } from './config';

/**
 * Actualización automática desde las releases de GitHub (electron-updater lee latest.yml, que
 * electron-builder publica junto al instalador). Se descarga sola en segundo plano y se instala al
 * salir de la app; desde la bandeja se puede forzar «Reiniciar para actualizar».
 *
 * Solo funciona con la app instalada (empaquetada): en desarrollo no hace nada.
 */
export type FaseActualizacion = 'inactiva' | 'buscando' | 'descargando' | 'lista' | 'al-dia' | 'error';
export type EstadoActualizacion = { fase: FaseActualizacion; version?: string; porcentaje?: number };

export const actualizaciones = new EventEmitter();
let estado: EstadoActualizacion = { fase: 'inactiva' };
const CADA_HORAS = 6;

function anotar(mensaje: string): void {
  try {
    appendFileSync(join(getDataDir(), 'actualizaciones.log'), `${new Date().toISOString()} ${mensaje}\n`);
  } catch {
    // Sin poder escribir el registro no hay nada más que hacer.
  }
}

function cambiar(nuevo: EstadoActualizacion): void {
  estado = nuevo;
  actualizaciones.emit('cambio');
}

export function estadoActualizacion(): EstadoActualizacion {
  return estado;
}

export function buscarActualizaciones(): void {
  if (!app.isPackaged) return;
  autoUpdater.checkForUpdates().catch((e: Error) => {
    anotar(`error al buscar: ${e.message}`);
    cambiar({ fase: 'error' });
  });
}

export function instalarYReiniciar(): void {
  // Instalación silenciosa y relanzar la app; el servidor se para en 'before-quit'.
  autoUpdater.quitAndInstall(true, true);
}

export function iniciarActualizaciones(): void {
  if (!app.isPackaged) return;

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.allowPrerelease = false;
  autoUpdater.logger = {
    info: (m?: unknown) => anotar(`info ${String(m)}`),
    warn: (m?: unknown) => anotar(`aviso ${String(m)}`),
    error: (m?: unknown) => anotar(`error ${String(m)}`),
    debug: () => undefined,
  };

  autoUpdater.on('checking-for-update', () => cambiar({ fase: 'buscando' }));
  autoUpdater.on('update-available', (i) => cambiar({ fase: 'descargando', version: i.version }));
  autoUpdater.on('update-not-available', () => cambiar({ fase: 'al-dia' }));
  autoUpdater.on('download-progress', (p) => cambiar({ fase: 'descargando', version: estado.version, porcentaje: Math.round(p.percent) }));
  autoUpdater.on('error', (e: Error) => {
    anotar(`error: ${e.message}`);
    cambiar({ fase: 'error' });
  });
  autoUpdater.on('update-downloaded', (i) => {
    cambiar({ fase: 'lista', version: i.version });
    if (Notification.isSupported()) {
      const aviso = new Notification({
        title: `MediaWatch Server ${i.version} listo`,
        body: 'Se instalará al cerrar la app. Pulsa aquí para reiniciar y actualizar ahora.',
      });
      aviso.on('click', () => instalarYReiniciar());
      aviso.show();
    }
  });

  // Sin prisa al arrancar (el servidor y el asistente primero) y luego cada pocas horas.
  setTimeout(buscarActualizaciones, 30_000);
  setInterval(buscarActualizaciones, CADA_HORAS * 3_600_000).unref();
}
