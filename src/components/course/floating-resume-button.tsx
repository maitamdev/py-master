'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Play } from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';

/**
 * Floating "Continue Learning" button shown on every page
 * except lesson/exercise pages (where user is already learning).
 * Only appears after the user has some progress.
 */
export function FloatingResumeButton() {
  const pathname = usePathname();
  const { progress, mounted } = useProgress();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!mounted) return;

    // Don't show on lesson, exercise, playground or learn pages
    if (
      pathname.startsWith('/lesson/') ||
      pathname.startsWith('/exercise/') ||
      pathname === '/playground' ||
      pathname === '/learn'
    ) {
      setShow(false);
      return;
    }

    // Only show if user has progress
    const hasProgress =
      progress.completedLessons.length > 0 ||
      progress.completedExercises.length > 0 ||
      (progress.currentLesson && progress.currentLesson !== 'part01-1-getting-started');

    setShow(!!hasProgress);
  }, [mounted, pathname, progress]);

  if (!show || !mounted) return null;

  const lessonId = progress.currentLesson || 'part01-1-getting-started';

  return (
    <Link
      href={`/lesson/${lessonId}`}
      className="fixed bottom-6 right-6 z-40 group flex items-center gap-2 px-4 py-3 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-xl shadow-sky-600/30 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-sky-500/40 border border-sky-400/20"
      title="Tiếp tục bài học gần nhất"
    >
      <div className="p-1 rounded-lg bg-white/15">
        <Play className="w-4 h-4 fill-white" />
      </div>
      <span className="hidden sm:inline">Học tiếp</span>
      <span className="sm:hidden">▶</span>
    </Link>
  );
}
