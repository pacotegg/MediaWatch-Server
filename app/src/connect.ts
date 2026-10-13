import { app, BrowserWindow, clipboard, ipcMain } from 'electron';
import { join } from 'node:path';
import QRCode from 'qrcode';
import { loadConfig, getLocalIP } from './config';
import { endurecerVentana } from './seguridad';

let connectWindow: BrowserWindow | null = null;

export async function openConnectWindow(): Promise<BrowserWindow> {
  if (connectWindow) {
    connectWindow.focus();
    return connectWindow;
  }

  connectWindow = new BrowserWindow({
    width: 440,
    height: 540,
    resizable: false,
    maximizable: false,
    title: 'Conectar dispositivos - MediaWatch',
    backgroundColor: '#0a0a0c',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload-connect.js'),
    },
  });

  const connectHtml = app.isPackaged
    ? join(process.resourcesPath, 'app/connect/index.html')
    : join(__dirname, '../app/connect/index.html');

  endurecerVentana(connectWindow);
  connectWindow.loadFile(connectHtml);

  connectWindow.on('closed', () => {
    connectWindow = null;
  });

  return connectWindow;
}

export function registerConnectIpc(): void {
  ipcMain.handle('connect:get-data', async () => {
    const config = loadConfig();
    const port = config.port || 8730;
    const ip = getLocalIP();
    const url = `http://${ip}:${port}`;

    let qrDataUrl = '';
    try {
      qrDataUrl = await QRCode.toDataURL(url, {
        margin: 2,
        width: 256,
        color: {
          dark: '#000000',
          light: '#ffffff',
        },
      });
    } catch (e) {
      console.error('Error generando QR:', e);
    }

    return {
      url,
      ip,
      port,
      qrDataUrl,
    };
  });

  ipcMain.handle('connect:copy-url', async (_e, text: string) => {
    clipboard.writeText(text);
    return true;
  });
}
