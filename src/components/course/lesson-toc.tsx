'use client';

import { useState, useEffect } from 'react';
import { AlignLeft, ChevronRight } from 'lucide-react';
import type { LessonBlock } from '@/types';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

export function extractTocFromBlocks(blocks: LessonBlock[]): TocItem[] {
  const items: TocItem[] = [];
  for (const b of blocks) {
    if (b.type === 'heading') {
      const level = (b.metadata?.level as number) || 2;
      const title = b.translation?.content || b.original?.content || '';
      if (title.trim()) {
        items.push({
          id: b.id,
          title: title.trim(),
          level,
        });
      }
    }
  }
  return items;
}

export function LessonToc({ blocks }: { blocks: LessonBlock[] }) {
  const [activeId, setActiveId] = useState<string>('');
  const items = extractTocFromBlocks(blocks);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0.1,
      }
    );

    items.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length <= 1) return null;

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -90; // offset for sticky header
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveId(id);
    }
  };

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <AlignLeft className="w-3.5 h-3.5 text-sky-500" />
        <span>Mục lục bài học</span>
      </div>

      <nav className="space-y-1 max-h-[300px] overflow-y-auto pr-1 text-xs">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isH3 = item.level >= 3;

          return (
            <button
              key={item.id}
              onClick={() => scrollToHeading(item.id)}
              className={`w-full text-left py-1 px-2 rounded-lg transition-all flex items-start gap-1.5 ${
                isH3 ? 'pl-4 text-[11.5px]' : 'font-medium'
              } ${
                isActive
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 font-semibold border-l-2 border-sky-500'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <ChevronRight
                className={`w-3 h-3 shrink-0 mt-0.5 transition-transform ${
                  isActive ? 'text-sky-500 translate-x-0.5' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
              <span className="line-clamp-2 leading-snug">{item.title}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
