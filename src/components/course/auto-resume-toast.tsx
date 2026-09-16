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
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[94vw] max-w-lg animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="relative p-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white shadow-2xl shadow-sky-600/30 border border-sky-400/20 backdrop-blur-md">
        {/* Close button */}
        <button
          onClick={() => {
            setDismissed(true);
            setVisible(false);
          }}
          className="absolute top-2 right-2 p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-white/15 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-medium text-sky-100 opacity-90">
              Chào mừng bạn quay lại! • Đã hoàn thành {completedCount}/78 bài
            </p>
            <p className="text-sm font-bold truncate mt-0.5">
              Tiếp tục tiến trình học của bạn
            </p>
          </div>
          <Link
            href={`/lesson/${lessonId}`}
            onClick={() => setDismissed(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white text-sky-700 hover:bg-sky-50 shadow-md transition-all shrink-0 hover:gap-2"
          >
            <Play className="w-3.5 h-3.5 fill-sky-700" />
            <span>Học tiếp</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
