import { app, dialog } from 'electron';
import { ServerManager } from './server';
import { createTray } from './tray';
import { openWizard, registerWizardIpc } from './wizard';
import { registerConnectIpc } from './connect';
import { loadConfig } from './config';

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  const serverManager = new ServerManager();

  app.on('second-instance', () => {
    // Si intentan abrir otra instancia, abrir el asistente o la web
    const config = loadConfig();
    if (config.libraries.length === 0) {
      openWizard(serverManager);
    }
  });

  app.whenReady().then(async () => {
    registerWizardIpc(serverManager);
    registerConnectIpc();
    createTray(serverManager);

    const config = loadConfig();

    // Si no hay bibliotecas configuradas, abrimos el asistente de primer arranque
    if (!config.libraries || config.libraries.length === 0) {
      openWizard(serverManager);
    } else {
      await serverManager.start();
    }
  });

  app.on('window-all-closed', () => {
    // No salir cuando se cierran las ventanas: la app sigue corriendo en la bandeja (System Tray)
  });

  app.on('before-quit', async () => {
    await serverManager.stop();
  });
}
