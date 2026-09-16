'use client';

import Link from 'next/link';
import { BookOpen, CheckCircle2, ArrowRight, Code } from 'lucide-react';
import type { CoursePart } from '@/types';
import { useProgress } from '@/hooks/use-progress';
import { ProgressBar } from './progress-bar';

export function PartCard({
  part,
  exercisesCount = 0,
}: {
  part: CoursePart;
  exercisesCount?: number;
}) {
  const { isLessonComplete, mounted } = useProgress();

  const lessons = part.lessons.filter((l) => !l.is_index);
  const completedInPart = mounted
    ? lessons.filter((l) => isLessonComplete(l.id)).length
    : 0;

  const totalLessons = lessons.length;
  const isAllCompleted = totalLessons > 0 && completedInPart === totalLessons;

  // Next uncompleted lesson or first lesson
  const firstUncompleted = lessons.find((l) => !isLessonComplete(l.id)) || lessons[0];
  const targetHref = firstUncompleted
    ? `/lesson/${firstUncompleted.id}`
    : `/course/part-${part.part}`;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 hover:shadow-xl hover:border-sky-500/40 dark:hover:border-sky-500/40 transition-all duration-200">
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-md bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/40">
            PHẦN {part.part}
          </span>
          {isAllCompleted && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Đã xong
            </span>
          )}
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {totalLessons} bài học
        </span>
      </div>

      {/* Part Title */}
      <Link href={`/course/part-${part.part}`} className="block flex-1 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">
          {part.title_vi || part.title_original}
        </h3>
      </Link>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 my-3">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>{totalLessons} bài học</span>
        </div>
        {exercisesCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Code className="w-3.5 h-3.5 text-slate-400" />
            <span>{exercisesCount} bài tập</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-2 mb-5">
        <ProgressBar
          value={completedInPart}
          max={totalLessons}
          showLabel={true}
          size="sm"
        />
        <div className="text-[11px] text-slate-400 mt-1">
          {completedInPart} trên {totalLessons} bài đã hoàn thành
        </div>
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80 gap-2">
        <Link
          href={`/course/part-${part.part}`}
          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          Xem chi tiết
        </Link>
        <Link
          href={targetHref}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs shadow-sky-600/30 transition-all hover:gap-2"
        >
          <span>{completedInPart === 0 ? 'Bắt đầu học' : isAllCompleted ? 'Xem lại' : 'Tiếp tục'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
