import { app, BrowserWindow, ipcMain } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development';
// Adjust paths based on build structure
const APP_ROOT = join(__dirname, '..');
const RENDERER_DIST = join(APP_ROOT, 'dist');

const preloadPath = join(__dirname, 'preload.js');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    // icon: join(APP_ROOT, 'public', 'icon.png'), // Ensure icon exists
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath,
    },
    show: false,
  });

  mainWindow.setMenu(null);

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(RENDERER_DIST, 'index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // CHECK FOR UPDATES IMMEDIATELY ON LAUNCH (Production Only)
    if (!isDev) {
      autoUpdater.checkForUpdates();
    }
  });
}

// --- AUTO UPDATER CONFIG ---
autoUpdater.autoDownload = true; // Automatically download
autoUpdater.autoInstallOnAppQuit = true;

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available');
});

autoUpdater.on('update-not-available', () => {
  console.log('No update available.');
});

autoUpdater.on('update-downloaded', () => {
  // Notify UI that update is ready to be installed
  mainWindow?.webContents.send('update-downloaded');
});

autoUpdater.on('error', (error) => {
  console.error('Update error:', error);
  mainWindow?.webContents.send('update-error', error.message);
});

autoUpdater.on('download-progress', (progressObj) => {
  mainWindow?.webContents.send('download-progress', progressObj);
});

// IPC Handlers
ipcMain.handle('quit-and-install', () => {
  autoUpdater.quitAndInstall(false, true); // Force run after install
});

ipcMain.handle('get-version', () => {
  return app.getVersion();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});