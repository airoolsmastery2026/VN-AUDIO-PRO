
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  // Thêm các API cần thiết để giao tiếp với OS tại đây
});
