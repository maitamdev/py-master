'use client';

import { Bookmark as BookmarkIcon } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';

export function BookmarkButton({
  type,
  targetId,
  title,
  part,
  lessonId,
  path,
  preview,
  className = '',
}: {
  type: 'lesson' | 'block' | 'exercise';
  targetId: string;
  title: string;
  part: number;
  lessonId?: string;
  path: string;
  preview?: string;
  className?: string;
}) {
  const { isBookmarked, toggleBookmark, mounted } = useBookmarks();

  if (!mounted) {
    return (
      <button className={`p-1.5 text-slate-400 hover:text-slate-600 rounded-lg ${className}`} disabled>
        <BookmarkIcon className="w-4 h-4" />
      </button>
    );
  }

  const bookmarked = isBookmarked(targetId);

  return (
    <button
      onClick={() =>
        toggleBookmark({
          type,
          targetId,
          title,
          part,
          lessonId,
          path,
          preview,
        })
      }
      className={`p-1.5 rounded-lg transition-colors ${
        bookmarked
          ? 'text-amber-500 hover:text-amber-600 bg-amber-50 dark:bg-amber-950/40'
          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
      } ${className}`}
      title={bookmarked ? 'Bỏ lưu đánh dấu' : 'Lưu đánh dấu bài học'}
      aria-label={bookmarked ? 'Bỏ lưu' : 'Đánh dấu'}
    >
      <BookmarkIcon className={`w-4 h-4 ${bookmarked ? 'fill-amber-500' : ''}`} />
    </button>
  );
}
