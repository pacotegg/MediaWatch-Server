import { Tray, Menu, shell, app, nativeImage, clipboard, Notification } from 'electron';
import { join } from 'node:path';
import { ServerManager } from './server';
import { getDataDir, loadConfig, getLocalIP } from './config';
import { openWizard } from './wizard';
import { openConnectWindow } from './connect';

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
        label: isRunning ? '● Servidor activo' : serverManager.getGaveUp() ? '⚠ Detenido: demasiados fallos seguidos' : '○ Servidor detenido',
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
      {
        label: 'Conectar móvil o tablet (Código QR)...',
        click: () => {
          openConnectWindow();
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
        label: 'Ver registro de errores (server.err)',
        click: () => {
          shell.openPath(join(getDataDir(), 'server.err'));
        },
      },
      {
        label: 'Abrir carpeta de datos y registros...',
        click: () => {
          shell.openPath(getDataDir());
        },
      },
      {
        label: process.platform === 'win32' ? 'Iniciar automáticamente con Windows' : 'Iniciar automáticamente con el sistema',
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

  // Si el servidor se cae varias veces seguidas deja de reiniciarse: hay que avisar, no esperar a que
  // alguien mire la bandeja y vea «detenido».
  serverManager.on('gave-up', () => {
    if (Notification.isSupported()) {
      const aviso = new Notification({
        title: 'MediaWatch Server se ha detenido',
        body: 'El servidor falló varias veces seguidas y no se reinicia más. Pulsa para ver el registro de errores.',
      });
      aviso.on('click', () => shell.openPath(join(getDataDir(), 'server.err')));
      aviso.show();
    }
    updateMenu();
  });

  tray.on('double-click', () => {
    const config = loadConfig();
    shell.openExternal(`http://localhost:${config.port || 8730}`);
  });

  updateMenu();

  // Actualizar el estado, pero solo reconstruir el menú si algo ha cambiado: hacerlo cada 3 s
  // cerraba el menú mientras el usuario lo tenía abierto.
  let ultimoEstado = '';
  setInterval(() => {
    const cfg = loadConfig();
    const estado = `${serverManager.getStatus()}|${serverManager.getGaveUp()}|${getLocalIP()}|${cfg.port || 8730}`;
    if (estado === ultimoEstado) return;
    ultimoEstado = estado;
    updateMenu();
  }, 3000);

  return tray;
}
