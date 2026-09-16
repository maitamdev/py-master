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

  const firstUncompleted = lessons.find((l) => !isLessonComplete(l.id)) || lessons[0];
  const targetHref = firstUncompleted
    ? `/lesson/${firstUncompleted.id}`
    : `/course/part-${part.part}`;

  return (
    <div className="group relative flex flex-col bg-white dark:bg-white/[0.02] rounded-xl border border-slate-200/80 dark:border-white/[0.06] p-5 hover:border-blue-300/60 dark:hover:border-blue-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/[0.04]">
      {/* Top badges */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-500/[0.08] text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/[0.15]">
            {String(part.part).padStart(2, '0')}
          </span>
          {isAllCompleted && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Hoàn thành
            </span>
          )}
        </div>
      </div>

      {/* Part Title */}
      <Link href={`/course/part-${part.part}`} className="block flex-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        <h3 className="text-[15px] font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">
          {part.title_vi || part.title_original}
        </h3>
      </Link>

      {/* Stats */}
      <div className="flex items-center gap-3.5 text-xs text-slate-400 dark:text-slate-500 my-2">
        <div className="flex items-center gap-1">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{totalLessons} bài</span>
        </div>
        {exercisesCount > 0 && (
          <div className="flex items-center gap-1">
            <Code className="w-3.5 h-3.5" />
            <span>{exercisesCount} tập</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mt-2 mb-4">
        <ProgressBar
          value={completedInPart}
          max={totalLessons}
          showLabel={true}
          size="sm"
        />
      </div>

      {/* Action CTA */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-white/[0.04]">
        <Link
          href={`/course/part-${part.part}`}
          className="text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
        >
          Chi tiết
        </Link>
        <Link
          href={targetHref}
          className="btn-primary inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs"
        >
          <span>{completedInPart === 0 ? 'Bắt đầu' : isAllCompleted ? 'Xem lại' : 'Tiếp tục'}</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
