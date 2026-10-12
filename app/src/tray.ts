import { Tray, Menu, shell, app, nativeImage, clipboard } from 'electron';
import { join } from 'node:path';
import { ServerManager } from './server';
import { getDataDir, loadConfig, getLocalIP } from './config';
import { openWizard } from './wizard';

let tray: Tray | null = null;

export function createTray(serverManager: ServerManager): Tray {
  if (tray) return tray;

  const iconPath = app.isPackaged
    ? join(process.resourcesPath, 'assets/icon.png')
    : join(__dirname, '../assets/icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.resize({ width: 16, height: 16 }));

  tray.setToolTip('MediaWatch Server');

  const updateMenu = () => {
    const config = loadConfig();
    const port = config.port || 8730;
    const isRunning = serverManager.getStatus();
    const localIp = getLocalIP();
    const serverUrl = `http://localhost:${port}`;
    const networkUrl = `http://${localIp}:${port}`;

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isRunning ? '● Servidor activo' : '○ Servidor detenido',
        enabled: false,
      },
      { type: 'separator' },
      {
        label: 'Abrir MediaWatch en el navegador',
        click: () => {
          shell.openExternal(serverUrl);
        },
      },
      {
        label: `Copiar enlace local (${networkUrl})`,
        click: () => {
          clipboard.writeText(networkUrl);
        },
      },
      { type: 'separator' },
      {
        label: 'Asistente de configuración...',
        click: () => {
          openWizard(serverManager);
        },
      },
      {
        label: 'Abrir carpeta de datos y registros...',
        click: () => {
          shell.openPath(getDataDir());
        },
      },
      {
        label: 'Iniciar automáticamente con Windows',
        type: 'checkbox',
        checked: app.getLoginItemSettings().openAtLogin,
        click: (item) => {
          app.setLoginItemSettings({
            openAtLogin: item.checked,
          });
        },
      },
      { type: 'separator' },
      {
        label: isRunning ? 'Reiniciar servidor' : 'Iniciar servidor',
        click: async () => {
          if (isRunning) {
            await serverManager.restart();
          } else {
            await serverManager.start();
          }
          updateMenu();
        },
      },
      {
        label: 'Salir de MediaWatch Server',
        click: async () => {
          await serverManager.stop();
          app.quit();
        },
      },
    ]);

    tray?.setContextMenu(contextMenu);
  };

  tray.on('double-click', () => {
    const config = loadConfig();
    shell.openExternal(`http://localhost:${config.port || 8730}`);
  });

  updateMenu();

  // Actualizar periódicamente el estado
  setInterval(updateMenu, 3000);

  return tray;
}
