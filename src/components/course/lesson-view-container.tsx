'use client';

import { useState } from 'react';
import type { Lesson, CoursePart } from '@/types';
import { CurriculumSidebar } from './curriculum-sidebar';
import { LessonToolsPanel } from './lesson-tools-panel';
import { LessonToc } from './lesson-toc';
import { ReadingToolbar, type FontSize } from './reading-toolbar';
import { LessonBlockRenderer } from '@/components/blocks/lesson-block-renderer';
import { LessonNavigation } from './lesson-navigation';
import { Minimize2 } from 'lucide-react';

export function LessonViewContainer({
  lesson,
  parts,
  prevLesson = null,
  nextLesson = null,
  currentPartTitle,
}: {
  lesson: Lesson;
  parts: CoursePart[];
  prevLesson?: { id: string; slug: string; title: string } | null;
  nextLesson?: { id: string; slug: string; title: string } | null;
  currentPartTitle?: string;
}) {
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isZenMode, setIsZenMode] = useState<boolean>(false);

  const fontSizeClass = {
    sm: 'text-[14px] leading-relaxed',
    base: 'text-[16px] leading-relaxed',
    lg: 'text-[18px] leading-relaxed',
  }[fontSize];

  return (
    <div className="flex-1 flex max-w-[1600px] w-full mx-auto relative">
      {/* Floating Exit Button for Zen Mode */}
      {isZenMode && (
        <button
          onClick={() => setIsZenMode(false)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white dark:bg-white/90 dark:text-slate-900 shadow-2xl backdrop-blur-md text-xs font-bold hover:scale-105 transition-all"
        >
          <Minimize2 className="w-4 h-4" />
          <span>Thoát chế độ tập trung (Zen Mode)</span>
        </button>
      )}

      {/* Left Column: Curriculum Sidebar (Hidden in Zen Mode) */}
      {!isZenMode && (
        <div className="hidden lg:block w-72 shrink-0 sticky top-[105px] h-[calc(100vh-105px)] overflow-hidden">
          <CurriculumSidebar
            parts={parts}
            currentLessonId={lesson.id}
            currentPartNum={lesson.part}
          />
        </div>
      )}

      {/* Center Column: Main Lesson Content */}
      <main
        className={`flex-1 min-w-0 px-4 sm:px-8 py-8 flex justify-center transition-all ${
          isZenMode ? 'lg:px-24' : 'lg:px-12'
        }`}
      >
        <article className={`w-full transition-all ${isZenMode ? 'max-w-4xl' : 'max-w-3xl'}`}>
          {/* Top Reading Toolbar & Part Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 border border-sky-200/60 dark:border-sky-800/60">
                PHẦN {lesson.part} • BÀI {lesson.order}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {currentPartTitle}
              </span>
            </div>

            <ReadingToolbar
              fontSize={fontSize}
              onChangeFontSize={setFontSize}
              isZenMode={isZenMode}
              onToggleZen={() => setIsZenMode(!isZenMode)}
            />
          </div>

          {/* Lesson Title Header */}
          <header className="mb-8 pb-6 border-b border-slate-200 dark:border-slate-800 space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {lesson.title_vi || lesson.title_original}
            </h1>

            {lesson.title_original !== lesson.title_vi && (
              <p className="text-xs text-slate-400 italic">
                Tên gốc: {lesson.title_original}
              </p>
            )}
          </header>

          {/* Content Blocks with Dynamic Font Size */}
          <div className={`space-y-4 ${fontSizeClass}`}>
            {lesson.blocks.map((block) => (
              <LessonBlockRenderer
                key={block.id}
                block={block}
                partNum={lesson.part}
              />
            ))}
          </div>

          {/* Bottom Navigation */}
          <LessonNavigation
            lessonId={lesson.id}
            prevLesson={prevLesson}
            nextLesson={nextLesson}
          />
        </article>
      </main>

      {/* Right Column: TOC + Tools Panel (Hidden in Zen Mode) */}
      {!isZenMode && (
        <div className="hidden xl:block w-80 shrink-0 sticky top-[105px] h-[calc(100vh-105px)] p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/20 space-y-6">
          {/* Table of Contents */}
          <LessonToc blocks={lesson.blocks} />

          {/* Lesson Tools (Status, AI, Notes) */}
          <LessonToolsPanel lesson={lesson} />
        </div>
      )}
    </div>
  );
}
