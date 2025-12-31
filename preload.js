
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveAudioFile: (directory, filename, buffer) => 
    ipcRenderer.invoke('save-audio-file', { directory, filename, buffer }),
  openUpdateFolder: () => ipcRenderer.invoke('open-update-folder')
});
