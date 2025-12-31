
const { app, BrowserWindow, session, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "VN AUDIO PRO - Neural Voice Studio",
    icon: path.join(__dirname, 'icon.ico'), // Đảm bảo bạn có file icon.ico
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset', // Giao diện hiện đại cho macOS/Windows 11
  });

  // Load ứng dụng
  // Trong môi trường development, load từ localhost. Trong production, load file index.html
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, 'index.html')}`;

  mainWindow.loadURL(startUrl);

  // Xóa menu mặc định để trông chuyên nghiệp hơn
  mainWindow.setMenuBarVisibility(false);

  // Mở link ngoài bằng trình duyệt mặc định của hệ thống
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// IPC Handlers for Auto-Save & System Integration
ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory']
  });
  if (result.canceled) return null;
  return result.filePaths[0];
});

ipcMain.handle('save-audio-file', async (event, { directory, filename, buffer }) => {
  try {
    const filePath = path.join(directory, filename);
    await fs.promises.writeFile(filePath, Buffer.from(buffer));
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Save failed:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('open-update-folder', async () => {
  // Opens the folder where the app executable or updates might be located
  // Adjust path as needed for your build structure
  const p = path.join(app.getPath('exe'), '..'); 
  await shell.openPath(p);
});

// Cấp quyền Micro cho ứng dụng Desktop
app.whenReady().then(() => {
  session.defaultSession.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'media') return true;
    return false;
  });

  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') callback(true);
    else callback(false);
  });

  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
