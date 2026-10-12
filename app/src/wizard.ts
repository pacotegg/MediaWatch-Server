import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
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

  const wizardHtml = join(__dirname, '../wizard/index.html');
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

  ipcMain.handle('wizard:get-config', () => {
    return loadConfig();
  });

  ipcMain.handle('wizard:save-and-start', async (_event, data: { libraries: Array<{ name: string; path: string; kind: 'movie' | 'show' }>; tmdbApiKey?: string; port?: number }) => {
    const current = loadConfig();
    current.libraries = data.libraries;
    if (data.tmdbApiKey) current.tmdbApiKey = data.tmdbApiKey;
    if (data.port) current.port = data.port;
    saveConfig(current);

    await serverManager.restart();
    const ready = await serverManager.waitForReady();

    if (wizardWindow) {
      wizardWindow.close();
      wizardWindow = null;
    }

    const port = current.port || 8730;
    shell.openExternal(`http://localhost:${port}`);

    return { success: ready };
  });
}
