import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('wizardApi', {
  selectFolder: () => ipcRenderer.invoke('wizard:select-folder'),
  getConfig: () => ipcRenderer.invoke('wizard:get-config'),
  saveAndStart: (data: any) => ipcRenderer.invoke('wizard:save-and-start', data),
});
