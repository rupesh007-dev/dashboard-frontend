const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-version'),
  quitAndInstall: () => ipcRenderer.invoke('quit-and-install'),
  
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', (_, val) => callback(val)),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', (_, val) => callback(val)),
  onDownloadProgress: (callback) => ipcRenderer.on('download-progress', (_, val) => callback(val)),
  onUpdateError: (callback) => ipcRenderer.on('update-error', (_, val) => callback(val)),
  
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),
});