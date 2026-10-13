import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { join } from 'node:path';
import { ServerManager } from './server';
import { loadConfig, saveConfig } from './config';

let wizardWindow: BrowserWindow | null = null;

export function openWizard(serverManager: ServerManager): BrowserWindow {
  if (wizardWindow) {
    wizardWindow.focus();
    return wizardWindow;
  }

  wizardWindow = new BrowserWindow({
    width: 780,
    height: 640,
    resizable: false,
    maximizable: false,
    title: 'Configuración inicial - MediaWatch Server',
    backgroundColor: '#0a0a0c',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const wizardHtml = app.isPackaged
    ? join(process.resourcesPath, 'app/wizard/index.html')
    : join(__dirname, '../app/wizard/index.html');
  wizardWindow.loadFile(wizardHtml);

  wizardWindow.on('closed', () => {
    wizardWindow = null;
  });

  return wizardWindow;
}

export function registerWizardIpc(serverManager: ServerManager): void {
  ipcMain.handle('wizard:select-folder', async () => {
    if (!wizardWindow) return null;
    const result = await dialog.showOpenDialog(wizardWindow, {
      properties: ['openDirectory'],
      title: 'Seleccionar carpeta de biblioteca',
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  ipcMain.handle('wizard:open-external', async (_event, url: string) => {
    // Solo el enlace de la clave de TMDb del propio asistente; nada que llegue de fuera.
    if (url !== 'https://www.themoviedb.org/settings/api') return false;
    await shell.openExternal(url);
    return true;
  });

  ipcMain.handle('wizard:get-config', () => {
    return loadConfig();
  });

  ipcMain.handle('wizard:save-and-start', async (_event, data: { libraries: Array<{ name: string; path: string; kind: 'movie' | 'show' }>; tmdbApiKey?: string; port?: number }) => {
    if (data.port !== undefined && (!Number.isInteger(data.port) || data.port < 1024 || data.port > 65535)) {
      return { success: false, error: 'El puerto tiene que ser un número entre 1024 y 65535.' };
    }
    const current = loadConfig();
    current.libraries = data.libraries;
    if (data.tmdbApiKey) current.tmdbApiKey = data.tmdbApiKey;
    if (data.port) current.port = data.port;
    saveConfig(current);

    await serverManager.restart();
    // La primera vez el servidor crea la base de datos antes de responder: 30 s de margen.
    const ready = await serverManager.waitForReady(60, 500);
    if (!ready) {
      return { success: false, error: 'El servidor no ha arrancado. Revisa server.err en la carpeta de datos (menú de la bandeja).' };
    }

    if (wizardWindow) {
      wizardWindow.close();
      wizardWindow = null;
    }

    const port = current.port || 8730;
    shell.openExternal(`http://localhost:${port}`);

    return { success: true };
  });
}
