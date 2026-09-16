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
    <div className="w-full max-w-4xl mx-auto my-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-sky-900/40 via-blue-900/30 to-indigo-950/40 border border-sky-500/30 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="p-3 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/30 shrink-0 mt-0.5">
          <Play className="w-5 h-5 fill-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
              Tiếp tục bài học gần nhất
            </span>
            <span className="text-xs text-slate-400">• Đã hoàn thành {completedCount}/78 bài</span>
          </div>
          <h3 className="text-lg font-bold text-white mt-1">
            {lesson ? `Phần ${lesson.part}: ${lesson.title}` : 'Bắt đầu với Lập trình Python'}
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Tiếp tục tiến trình học của bạn từ nơi bạn đã dừng lại lần trước.
          </p>
        </div>
      </div>

      <Link
        href={`/lesson/${currentLessonId}`}
        className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20 transition-all shrink-0 hover:gap-3"
      >
        <span>Tiếp tục học</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
