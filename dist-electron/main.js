// electron/main.js
import { app, BrowserWindow, ipcMain } from "electron";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pkg from "electron-updater";
var { autoUpdater } = pkg;
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var isDev = process.env.NODE_ENV === "development";
var APP_ROOT = join(__dirname, "..");
var RENDERER_DIST = join(APP_ROOT, "dist");
var preloadPath = join(__dirname, "preload.js");
var mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    // icon: join(APP_ROOT, 'public', 'icon.png'), // Ensure icon exists
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: preloadPath
    },
    show: false
  });
  mainWindow.setMenu(null);
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(RENDERER_DIST, "index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    if (!isDev) {
      autoUpdater.checkForUpdates();
    }
  });
}
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;
autoUpdater.on("checking-for-update", () => {
  console.log("Checking for update...");
});
autoUpdater.on("update-available", () => {
  mainWindow?.webContents.send("update-available");
});
autoUpdater.on("update-not-available", () => {
  console.log("No update available.");
});
autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update-downloaded");
});
autoUpdater.on("error", (error) => {
  console.error("Update error:", error);
  mainWindow?.webContents.send("update-error", error.message);
});
autoUpdater.on("download-progress", (progressObj) => {
  mainWindow?.webContents.send("download-progress", progressObj);
});
ipcMain.handle("quit-and-install", () => {
  autoUpdater.quitAndInstall(false, true);
});
ipcMain.handle("get-version", () => {
  return app.getVersion();
});
app.whenReady().then(createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
