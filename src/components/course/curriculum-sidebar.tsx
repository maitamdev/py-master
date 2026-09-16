'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, Layers } from 'lucide-react';
import type { CoursePart } from '@/types';
import { useProgress } from '@/hooks/use-progress';

export function CurriculumSidebar({
  parts,
  currentLessonId,
  currentPartNum,
}: {
  parts: CoursePart[];
  currentLessonId: string;
  currentPartNum: number;
}) {
  const [expandedPart, setExpandedPart] = useState<number>(currentPartNum);
  const { isLessonComplete, mounted } = useProgress();

  const togglePart = (pNum: number) => {
    setExpandedPart((prev) => (prev === pNum ? -1 : pNum));
  };

  return (
    <aside className="h-full flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none overflow-y-auto">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Layers className="w-4 h-4 text-sky-500" />
          <span>Mục lục khóa học</span>
        </div>
        <span className="text-[11px] text-slate-400">14 Phần</span>
      </div>

      <div className="flex-1 py-2 space-y-1">
        {parts.map((part) => {
          const isExpanded = expandedPart === part.part;
          const isCurrentPart = currentPartNum === part.part;
          const lessons = part.lessons.filter((l) => !l.is_index);
          const completedCount = mounted
            ? lessons.filter((l) => isLessonComplete(l.id)).length
            : 0;
          const allDone = lessons.length > 0 && completedCount === lessons.length;

          return (
            <div key={part.part} className="px-2">
              {/* Part Header Accordion */}
              <button
                onClick={() => togglePart(part.part)}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs font-semibold transition-colors ${
                  isCurrentPart
                    ? 'bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {allDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-[10px] font-mono shrink-0">
                      {part.part}
                    </span>
                  )}
                  <span className="truncate">
                    Phần {part.part}: {part.title_vi || part.title_original}
                  </span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Lessons Sublist */}
              {isExpanded && (
                <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-slate-200 dark:border-slate-800 ml-4 my-1">
                  {lessons.map((lesson) => {
                    const isActive = lesson.id === currentLessonId;
                    const isCompleted = mounted && isLessonComplete(lesson.id);

                    return (
                      <Link
                        key={lesson.id}
                        href={`/lesson/${lesson.id}`}
                        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isActive
                            ? 'bg-sky-500 text-white font-bold shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isActive ? 'text-white' : 'text-emerald-500'
                            }`}
                          />
                        ) : isActive ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          </div>
                        ) : (
                          <Circle className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span className="truncate">
                          {lesson.title_vi || lesson.title_original}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
