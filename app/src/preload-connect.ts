import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('connectApi', {
  getData: () => ipcRenderer.invoke('connect:get-data'),
  copyUrl: (text: string) => ipcRenderer.invoke('connect:copy-url', text),
});
