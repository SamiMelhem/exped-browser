interface Bookmark {
  id: string;
  title: string;
  url: string;
  icon?: string;
  createdAt: number;
}

interface ElectronAPI {
  navigate: (url: string) => void;
  saveBookmark: (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => void;
  getBookmarks: () => void;
  deleteBookmark: (id: string) => void;
  onBookmarksUpdate: (callback: (bookmarks: Bookmark[]) => void) => () => void;
}

interface Window {
  electron: ElectronAPI;
}