const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  navigate: (url) => ipcRenderer.send('navigate', url),
  saveBookmark: (bookmark) => ipcRenderer.send('save-bookmark', bookmark),
  getBookmarks: () => ipcRenderer.send('get-bookmarks'),
  deleteBookmark: (id) => ipcRenderer.send('delete-bookmark', id),
  onBookmarksUpdate: (callback) => {
    ipcRenderer.on('bookmarks', (event, bookmarks) => callback(bookmarks));
    return () => {
      ipcRenderer.removeAllListeners('bookmarks');
    };
  }
});