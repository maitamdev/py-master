'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play, X, BookOpen } from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';

/**
 * Auto-resume toast: Shows a floating banner when user returns to site,
 * reminding them to continue from where they left off.
 * Only shows on non-lesson/non-exercise pages when there is saved progress.
 */
export function AutoResumeToast() {
  const pathname = usePathname();
  const { progress, mounted } = useProgress();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!mounted || dismissed) return;

    // Don't show on lesson or exercise pages (user is already learning)
    if (
      pathname.startsWith('/lesson/') ||
      pathname.startsWith('/exercise/') ||
      pathname === '/learn'
    ) {
      return;
    }

    // Only show if user has a saved currentLesson AND has visited before
    const hasProgress =
      progress.currentLesson &&
      progress.currentLesson !== 'part01-1-getting-started';
    const hasAnyCompleted =
      progress.completedLessons.length > 0 || progress.completedExercises.length > 0;

    if (hasProgress || hasAnyCompleted) {
      // Small delay for smoother UX
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [mounted, pathname, progress, dismissed]);

  if (!visible || dismissed || !mounted) return null;

  const lessonId = progress.currentLesson || 'part01-1-getting-started';
  const completedCount = progress.completedLessons.length;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg animate-slide-up">
      <div className="relative p-4 rounded-xl bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-white/[0.08] shadow-2xl shadow-black/10 dark:shadow-black/40 backdrop-blur-xl">
        {/* Close button */}
        <button
          onClick={() => {
            setDismissed(true);
            setVisible(false);
          }}
          className="absolute top-2.5 right-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Chào mừng quay lại • {completedCount}/78 bài
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate mt-0.5">
              Tiếp tục tiến trình học
            </p>
          </div>
          <Link
            href={`/lesson/${lessonId}`}
            onClick={() => setDismissed(true)}
            className="btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs shrink-0"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Học tiếp</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
