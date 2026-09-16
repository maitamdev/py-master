'use client';

import { useMemo } from 'react';
import { Marked } from 'marked';
import { highlightPython } from '@/lib/syntax-highlighter';

// Create dedicated marked instance with custom code renderer
const customMarked = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = (lang || 'python').toLowerCase();
      const isPython = language === 'python' || language === 'py';
      const highlighted = isPython ? highlightPython(text) : text;
      return `<div class="my-4 rounded-2xl border border-slate-700/80 bg-[#0d1117] p-4 text-[13.5px] font-mono leading-relaxed overflow-x-auto shadow-lg"><pre class="text-slate-100 whitespace-pre">${highlighted}</pre></div>`;
    },
  },
});

export function MarkdownContent({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) {
  const html = useMemo(() => {
    if (!content) return '';
    try {
      return customMarked.parse(content) as string;
    } catch {
      return content;
    }
  }, [content]);

  return (
    <div
      className={`prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 leading-relaxed text-[15px] ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
