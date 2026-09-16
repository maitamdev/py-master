'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';

export function LessonNavigation({
  lessonId,
  prevLesson,
  nextLesson,
}: {
  lessonId: string;
  prevLesson: { id: string; slug: string; title: string } | null;
  nextLesson: { id: string; slug: string; title: string } | null;
}) {
  const { isLessonComplete, markLessonComplete, mounted } = useProgress();
  const completed = mounted && isLessonComplete(lessonId);

  return (
    <div className="mt-12 pt-8 border-t border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
      {prevLesson ? (
        <Link
          href={`/lesson/${prevLesson.id}`}
          className="w-full sm:w-auto inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          <div className="text-left">
            <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-normal">Bài trước</span>
            <span className="truncate max-w-[180px] inline-block">{prevLesson.title}</span>
          </div>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {nextLesson ? (
        <Link
          href={`/lesson/${nextLesson.id}`}
          onClick={() => {
            if (!completed) markLessonComplete(lessonId);
          }}
          className="w-full sm:w-auto btn-primary inline-flex items-center justify-end gap-2.5 px-5 py-2.5 text-xs"
        >
          <div className="text-right">
            <span className="block text-[10px] text-blue-200 font-normal">Hoàn thành & Tiếp</span>
            <span className="truncate max-w-[200px] inline-block">{nextLesson.title}</span>
          </div>
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <Link
          href="/course"
          onClick={() => {
            if (!completed) markLessonComplete(lessonId);
          }}
          className="w-full sm:w-auto inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:shadow-xl"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Hoàn thành toàn bộ khóa học!</span>
        </Link>
      )}
    </div>
  );
}
