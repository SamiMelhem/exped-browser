const { contextBridge, ipcRenderer } = require('electron');

// Safely expose specific APIs to renderer
contextBridge.exposeInMainWorld('electron', {
  // Navigation
  navigate: (url) => {
    if (typeof url === 'string') {
      ipcRenderer.send('navigate', url);
    }
  },
  
  // Bookmarks
  saveBookmark: (bookmark) => {
    if (bookmark && typeof bookmark === 'object') {
      ipcRenderer.send('save-bookmark', bookmark);
    }
  },
  
  getBookmarks: () => ipcRenderer.send('get-bookmarks'),
  
  deleteBookmark: (id) => {
    if (typeof id === 'string') {
      ipcRenderer.send('delete-bookmark', id);
    }
  },
  
  onBookmarksUpdate: (callback) => {
    if (typeof callback === 'function') {
      const subscription = (event, bookmarks) => callback(bookmarks);
      ipcRenderer.on('bookmarks', subscription);
      return () => {
        ipcRenderer.removeListener('bookmarks', subscription);
      };
    }
    return () => {};
  }
});