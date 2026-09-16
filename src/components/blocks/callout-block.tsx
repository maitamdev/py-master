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
  let icon = <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />;
  let borderClass = 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-500/[0.04]';
  let titleColor = 'text-blue-700 dark:text-blue-400';
  let defaultTitle = 'Thông tin lưu ý';

  if (variant === 'learningObjectives') {
    icon = <Target className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />;
    borderClass = 'border-l-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/[0.04]';
    titleColor = 'text-indigo-700 dark:text-indigo-400';
    defaultTitle = 'Mục tiêu học tập';
  } else if (variant === 'hint') {
    icon = <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />;
    borderClass = 'border-l-amber-500 bg-amber-50/50 dark:bg-amber-500/[0.04]';
    titleColor = 'text-amber-700 dark:text-amber-400';
    defaultTitle = 'Gợi ý quan trọng';
  } else if (variant === 'warning') {
    icon = <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
    borderClass = 'border-l-rose-500 bg-rose-50/50 dark:bg-rose-500/[0.04]';
    titleColor = 'text-rose-700 dark:text-rose-400';
    defaultTitle = 'Cảnh báo lỗi thường gặp';
  }

  return (
    <div className={`my-5 p-4 rounded-lg border-l-[3px] border border-slate-200/60 dark:border-white/[0.04] ${borderClass} flex items-start gap-3`}>
      {icon}
      <div className="flex-1 min-w-0">
        <h5 className={`text-[13px] font-bold mb-1 ${titleColor}`}>
          {title || defaultTitle}
        </h5>
        <MarkdownContent content={content} className="text-[13px]" />
      </div>
    </div>
  );
}
