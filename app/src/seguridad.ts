import { BrowserWindow, session } from 'electron';

/**
 * Las ventanas de la app solo muestran sus propias páginas locales (asistente y QR): no abren
 * otras ventanas ni navegan a ningún sitio. Así, aunque algún día una página llevase contenido
 * ajeno por error, no podría llevarse la ventana a otra parte ni abrir otras.
 */
export function endurecerVentana(win: BrowserWindow): void {
  win.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  win.webContents.on('will-navigate', (e) => e.preventDefault());
  win.webContents.on('will-attach-webview', (e) => e.preventDefault());
}

/** La app no necesita cámara, micrófono, geolocalización ni notificaciones web: se deniega todo. */
export function endurecerSesion(): void {
  session.defaultSession.setPermissionRequestHandler((_wc, _permiso, responder) => responder(false));
  session.defaultSession.setPermissionCheckHandler(() => false);
}
