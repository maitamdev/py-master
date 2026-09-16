import type { Bookmark } from '@/types';

const STORAGE_KEY = 'python-master:bookmarks';

export class LocalBookmarksRepository {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getBookmarks(): Bookmark[] {
    if (!this.isBrowser()) return [];
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      return data ? (JSON.parse(data) as Bookmark[]) : [];
    } catch {
      return [];
    }
  }

  private saveBookmarks(bookmarks: Bookmark[]): void {
    if (!this.isBrowser()) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
      window.dispatchEvent(new CustomEvent('python-master:bookmarks-changed', { detail: bookmarks }));
    } catch (err) {
      console.error('Failed to save bookmarks:', err);
    }
  }

  addBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): void {
    const bookmarks = this.getBookmarks();
    const id = `bm-${bookmark.type}-${bookmark.targetId}`;
    if (!bookmarks.some((b) => b.id === id)) {
      bookmarks.unshift({
        ...bookmark,
        id,
        createdAt: new Date().toISOString(),
      });
      this.saveBookmarks(bookmarks);
    }
  }

  removeBookmark(id: string): void {
    const bookmarks = this.getBookmarks().filter((b) => b.id !== id);
    this.saveBookmarks(bookmarks);
  }

  isBookmarked(targetId: string): boolean {
    return this.getBookmarks().some((b) => b.targetId === targetId);
  }

  toggleBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): boolean {
    const id = `bm-${bookmark.type}-${bookmark.targetId}`;
    if (this.isBookmarked(bookmark.targetId)) {
      this.removeBookmark(id);
      return false;
    } else {
      this.addBookmark(bookmark);
      return true;
    }
  }
}

export const bookmarksRepo = new LocalBookmarksRepository();
