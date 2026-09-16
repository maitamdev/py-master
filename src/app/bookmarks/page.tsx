'use client';

import Link from 'next/link';
import { Bookmark as BookmarkIcon, Trash2, ArrowRight, BookOpen, Terminal } from 'lucide-react';
import { useBookmarks } from '@/hooks/use-bookmarks';

export default function BookmarksPage() {
  const { bookmarks, removeBookmark, mounted } = useBookmarks();

  return (
    <div className="flex-1 py-10 md:py-14 bg-slate-50/50 dark:bg-[#090d16]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-500">
            <BookmarkIcon className="w-4 h-4 fill-amber-500" />
            <span>Đã lưu cá nhân</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Bài học & Bài tập đã đánh dấu
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Danh sách các nội dung quan trọng bạn đã lưu lại để tiện ôn tập bất cứ lúc nào.
          </p>
        </div>

        {!mounted ? (
          <div className="py-12 text-center text-sm text-slate-400">
            Đang tải danh sách đã lưu...
          </div>
        ) : bookmarks.length === 0 ? (
          /* Empty state */
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
              <BookmarkIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Bạn chưa lưu đánh dấu bài học nào
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Khi đang đọc bài học hoặc làm bài tập, bấm vào biểu tượng Bookmark để lưu lại những nội dung hay cần xem lại nhé!
              </p>
            </div>
            <Link
              href="/course"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white transition-colors"
            >
              <span>Khám phá khóa học</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((bm) => (
              <div
                key={bm.id}
                className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all group"
              >
                <Link href={bm.path} className="flex-1 min-w-0 flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-500 shrink-0 mt-0.5">
                    {bm.type === 'exercise' ? (
                      <Terminal className="w-4 h-4" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 uppercase tracking-wider">
                      Phần {bm.part} • {bm.type === 'exercise' ? 'Bài tập' : 'Bài học'}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                      {bm.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Lưu lúc: {new Date(bm.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={bm.path}
                    className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline px-2 py-1"
                  >
                    <span>Mở</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                  <button
                    onClick={() => removeBookmark(bm.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                    title="Xóa khỏi danh sách lưu"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
