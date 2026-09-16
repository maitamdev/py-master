'use client';

import React from 'react';
import type { LessonBlock } from '@/types';
import { MarkdownContent } from './markdown-content';
import { CodeBlock } from './code-block';
import { SampleOutputBlock } from './sample-output-block';
import { CalloutBlock } from './callout-block';
import { ExerciseBlock } from './exercise-block';
import { ImageBlock } from './image-block';
import { QuizBlock } from './quiz-block';

export function LessonBlockRenderer({
  block,
  partNum,
}: {
  block: LessonBlock;
  partNum: number;
}) {
  const content = block.translation?.content || block.original?.content || '';
  const meta = block.metadata || {};

  switch (block.type) {
    case 'heading': {
      const level = meta.level || 2;
      const HeadingTag = (`h${Math.min(Math.max(level, 1), 6)}` as unknown) as React.ElementType;
      const headingStyles: Record<number, string> = {
        1: 'text-2xl sm:text-3xl font-bold mt-10 mb-4 text-slate-900 dark:text-white tracking-tight scroll-mt-20',
        2: 'text-xl sm:text-2xl font-bold mt-8 mb-3 text-slate-900 dark:text-white tracking-tight scroll-mt-20',
        3: 'text-lg sm:text-xl font-bold mt-6 mb-2.5 text-slate-900 dark:text-slate-100 scroll-mt-20',
        4: 'text-base font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200 scroll-mt-20',
      };
      return (
        <HeadingTag id={block.id} className={headingStyles[level] || headingStyles[2]}>
          {content}
        </HeadingTag>
      );
    }

    case 'paragraph': {
      return (
        <div id={block.id} className="my-3 text-[15.5px] leading-relaxed text-slate-700 dark:text-slate-300">
          <MarkdownContent content={content} />
        </div>
      );
    }

    case 'code': {
      return (
        <div id={block.id}>
          <CodeBlock
            code={content}
            language={(meta.lang as string) || 'python'}
          />
        </div>
      );
    }

    case 'sample_output': {
      return (
        <div id={block.id}>
          <SampleOutputBlock output={content} />
        </div>
      );
    }

    case 'sample_data': {
      return (
        <div id={block.id}>
          <SampleOutputBlock output={content} />
        </div>
      );
    }

    case 'exercise': {
      const exId = (meta.exercise_id as string) || block.id;
      const exTitle = (meta.name as string) || '';
      return (
        <div id={block.id}>
          <ExerciseBlock exerciseId={exId} title={exTitle} content={content} />
        </div>
      );
    }

    case 'text_box': {
      const variant = (meta.variant as string) || 'info';
      const title = (meta.name_vi as string) || (meta.name_original as string) || undefined;
      return (
        <div id={block.id}>
          <CalloutBlock content={content} variant={variant} title={title} />
        </div>
      );
    }

    case 'image': {
      const src = (meta.src as string) || '';
      const alt = (meta.alt as string) || 'Minh họa bài học Python';
      return (
        <div id={block.id}>
          <ImageBlock src={src} alt={alt} part={partNum} />
        </div>
      );
    }

    case 'quiz': {
      return (
        <div id={block.id}>
          <QuizBlock question={content} />
        </div>
      );
    }

    case 'list': {
      return (
        <div id={block.id} className="my-3 pl-2">
          <MarkdownContent content={content} />
        </div>
      );
    }

    case 'table': {
      return (
        <div id={block.id} className="my-5 overflow-x-auto">
          <MarkdownContent content={content} />
        </div>
      );
    }

    case 'custom_component': {
      if (meta.component_name === 'pages-in-this-section') {
        return null; // The curriculum sidebar already displays pages in section
      }
      return (
        <div id={block.id} className="my-4">
          <MarkdownContent content={content} />
        </div>
      );
    }

    default: {
      return (
        <div id={block.id} className="my-3">
          <MarkdownContent content={content} />
        </div>
      );
    }
  }
}
