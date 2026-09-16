'use client';

import { Target, Lightbulb, Info, AlertTriangle } from 'lucide-react';
import { MarkdownContent } from './markdown-content';

export function CalloutBlock({
  content,
  variant = 'info',
  title,
}: {
  content: string;
  variant?: string;
  title?: string;
}) {
  let icon = <Info className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />;
  let borderClass = 'border-sky-300 dark:border-sky-800 bg-sky-50/60 dark:bg-sky-950/30';
  let titleColor = 'text-sky-900 dark:text-sky-300';
  let defaultTitle = 'Thông tin lưu ý';

  if (variant === 'learningObjectives') {
    icon = <Target className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />;
    borderClass = 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/70 dark:bg-indigo-950/30';
    titleColor = 'text-indigo-900 dark:text-indigo-300';
    defaultTitle = 'Mục tiêu học tập';
  } else if (variant === 'hint') {
    icon = <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />;
    borderClass = 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30';
    titleColor = 'text-amber-900 dark:text-amber-300';
    defaultTitle = 'Gợi ý quan trọng';
  } else if (variant === 'warning') {
    icon = <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />;
    borderClass = 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30';
    titleColor = 'text-rose-900 dark:text-rose-300';
    defaultTitle = 'Cảnh báo lỗi thường gặp';
  }

  return (
    <div className={`my-5 p-4 rounded-xl border ${borderClass} flex items-start gap-3.5 shadow-xs`}>
      {icon}
      <div className="flex-1 min-w-0">
        <h5 className={`text-sm font-bold mb-1.5 ${titleColor}`}>
          {title || defaultTitle}
        </h5>
        <MarkdownContent content={content} className="text-sm" />
      </div>
    </div>
  );
}
