'use client';

import { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Bot,
  Mic,
  Sparkles,
} from 'lucide-react';
import type { Lesson } from '@/types';
import { useProgress } from '@/hooks/use-progress';
import { BookmarkButton } from './bookmark-button';
import { NoteEditor } from './note-editor';
import { AITutorPanel } from '@/features/ai-tutor/ai-tutor-panel';
import { LiveTutorPanel } from '@/features/live-tutor/live-tutor-panel';

export function LessonToolsPanel({ lesson }: { lesson: Lesson }) {
  const { isLessonComplete, toggleLessonComplete, mounted } = useProgress();
  const [aiTutorOpen, setAiTutorOpen] = useState(false);
  const [liveTutorOpen, setLiveTutorOpen] = useState(false);

  const completed = mounted && isLessonComplete(lesson.id);

  const aiContext = {
    courseTitle: 'Khóa học Lập trình Python',
    partTitle: `Phần ${lesson.part}`,
    lessonTitle: lesson.title_vi || lesson.title_original,
    currentSection: lesson.title_vi,
  };

  return (
    <>
      <div className="space-y-6">
        {/* Completion Action Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Trạng thái bài học
            </span>
            <BookmarkButton
              type="lesson"
              targetId={lesson.id}
              title={lesson.title_vi || lesson.title_original}
              part={lesson.part}
              lessonId={lesson.id}
              path={`/lesson/${lesson.id}`}
            />
          </div>

          <button
            onClick={() => toggleLessonComplete(lesson.id)}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-xs ${
              completed
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/20'
            }`}
          >
            {completed ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Đã đánh dấu hoàn thành</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4" />
                <span>Đánh dấu đã hoàn thành</span>
              </>
            )}
          </button>
        </div>

        {/* AI Learning Companions Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-sky-50/50 dark:from-indigo-950/30 dark:to-slate-900 border border-indigo-200/80 dark:border-indigo-900/40 shadow-xs space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Học cùng Trợ lý AI</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Hỏi đáp thắc mắc, xin gợi ý giải bài hoặc luyện giao tiếp giọng nói trực tiếp.
          </p>

          <div className="space-y-2 pt-1">
            <button
              onClick={() => setAiTutorOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/80 hover:bg-indigo-50 dark:hover:bg-slate-750 transition-colors shadow-xs"
            >
              <Bot className="w-4 h-4" />
              <span>Hỏi Gia sư AI (Gemini)</span>
            </button>

            <button
              onClick={() => setLiveTutorOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-xs shadow-indigo-600/20"
            >
              <Mic className="w-4 h-4" />
              <span>Trò chuyện giọng nói với AI</span>
            </button>
          </div>
        </div>

        {/* Notes Editor for this lesson */}
        <NoteEditor
          lessonId={lesson.id}
          lessonTitle={lesson.title_vi || lesson.title_original}
          part={lesson.part}
        />
      </div>

      {/* AI Modals / Drawers */}
      <AITutorPanel
        context={aiContext}
        isOpen={aiTutorOpen}
        onClose={() => setAiTutorOpen(false)}
      />

      <LiveTutorPanel
        context={aiContext}
        isOpen={liveTutorOpen}
        onClose={() => setLiveTutorOpen(false)}
      />
    </>
  );
}
