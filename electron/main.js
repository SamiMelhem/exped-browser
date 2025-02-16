const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      webviewTag: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // In development, load from Vite dev server
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load from built files
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Handle navigation events
  ipcMain.on('navigate', (event, url) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    win.loadURL(url);
  });

  // Handle bookmark operations
  ipcMain.on('save-bookmark', (event, bookmark) => {
    const bookmarks = store.get('bookmarks', []);
    store.set('bookmarks', [...bookmarks, bookmark]);
  });

  ipcMain.on('get-bookmarks', (event) => {
    event.reply('bookmarks', store.get('bookmarks', []));
  });

  ipcMain.on('delete-bookmark', (event, bookmarkId) => {
    const bookmarks = store.get('bookmarks', []);
    store.set('bookmarks', bookmarks.filter(b => b.id !== bookmarkId));
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});