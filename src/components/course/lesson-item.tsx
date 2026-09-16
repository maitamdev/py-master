'use client';

import Link from 'next/link';
import { CheckCircle2, Circle, ArrowRight, Code } from 'lucide-react';
import type { LessonSummary } from '@/types';
import { useProgress } from '@/hooks/use-progress';

export function LessonItem({
  lesson,
  exerciseCount = 0,
}: {
  lesson: LessonSummary;
  partNum?: number;
  exerciseCount?: number;
}) {
  const { isLessonComplete, progress, mounted } = useProgress();

  const isCompleted = mounted && isLessonComplete(lesson.id);
  const isCurrent = mounted && progress.currentLesson === lesson.id;

  return (
    <Link
      href={`/lesson/${lesson.id}`}
      className={`group flex items-center justify-between p-4 rounded-xl border transition-all ${
        isCurrent
          ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 shadow-xs'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Status icon */}
        <div className="shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          ) : isCurrent ? (
            <div className="w-5 h-5 rounded-full border-2 border-sky-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            </div>
          ) : (
            <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          )}
        </div>

        {/* Title & Metadata */}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
              {lesson.title_vi || lesson.title_original}
            </h4>
            {isCurrent && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                Đang học
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            <span>{lesson.blocks_count} phần nội dung</span>
            {exerciseCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Code className="w-3 h-3" />
                  {exerciseCount} bài tập
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 pl-4">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors hidden sm:inline">
          {isCompleted ? 'Xem lại' : isCurrent ? 'Học tiếp' : 'Bắt đầu'}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}
