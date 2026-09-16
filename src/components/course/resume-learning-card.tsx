'use client';

import Link from 'next/link';
import { Play, ArrowRight } from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';

export function ResumeLearningCard({
  lessonsMap,
}: {
  lessonsMap: Record<string, { title: string; part: number; slug: string }>;
}) {
  const { progress, mounted } = useProgress();

  if (!mounted || !progress.currentLesson) return null;

  const currentLessonId = progress.currentLesson;
  const lesson = lessonsMap[currentLessonId];
  const completedCount = progress.completedLessons.length;

  return (
    <div className="w-full max-w-3xl mx-auto mt-8 p-5 rounded-xl bg-white dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
          <Play className="w-4 h-4 fill-current" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Tiếp tục học
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">• {completedCount}/78 bài</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
            {lesson ? `Phần ${lesson.part}: ${lesson.title}` : 'Bắt đầu với Python'}
          </h3>
        </div>
      </div>

      <Link
        href={`/lesson/${currentLessonId}`}
        className="btn-primary inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs shrink-0"
      >
        <span>Tiếp tục</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}
