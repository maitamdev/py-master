'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Bookmark } from '@/types';
import { bookmarksRepo } from '@/lib/storage';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setBookmarks(bookmarksRepo.getBookmarks());

    const handleBookmarksChange = (e: Event) => {
      const customEvent = e as CustomEvent<Bookmark[]>;
      if (customEvent.detail) {
        setBookmarks(customEvent.detail);
      } else {
        setBookmarks(bookmarksRepo.getBookmarks());
      }
    };

    window.addEventListener('python-master:bookmarks-changed', handleBookmarksChange);
    return () => {
      window.removeEventListener('python-master:bookmarks-changed', handleBookmarksChange);
    };
  }, []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    bookmarksRepo.addBookmark(bookmark);
    setBookmarks(bookmarksRepo.getBookmarks());
  }, []);

  const removeBookmark = useCallback((id: string) => {
    bookmarksRepo.removeBookmark(id);
    setBookmarks(bookmarksRepo.getBookmarks());
  }, []);

  const toggleBookmark = useCallback((bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
    const res = bookmarksRepo.toggleBookmark(bookmark);
    setBookmarks(bookmarksRepo.getBookmarks());
    return res;
  }, []);

  const isBookmarked = useCallback(
    (targetId: string) => bookmarks.some((b) => b.targetId === targetId),
    [bookmarks]
  );

  return {
    bookmarks,
    mounted,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
  };
}
