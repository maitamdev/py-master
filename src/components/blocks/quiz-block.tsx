'use client';

import { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle } from 'lucide-react';
import { MarkdownContent } from './markdown-content';

export function QuizBlock({
  question,
  options = [],
  correctIndex,
  explanation,
}: {
  question: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="my-6 p-5 rounded-2xl border border-violet-200 dark:border-violet-900/60 bg-violet-50/40 dark:bg-violet-950/20 shadow-xs">
      <div className="flex items-center gap-2 mb-3 text-violet-700 dark:text-violet-300 font-semibold text-xs uppercase tracking-wider">
        <HelpCircle className="w-4 h-4" />
        <span>Câu hỏi kiểm tra nhanh</span>
      </div>

      <div className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-4">
        <MarkdownContent content={question || 'Kiểm tra kiến thức bạn vừa đọc:'} />
      </div>

      {options.length > 0 && (
        <div className="space-y-2 mb-4">
          {options.map((opt, idx) => {
            const isSelected = selected === idx;
            const isCorrect = submitted && idx === correctIndex;
            const isWrong = submitted && isSelected && idx !== correctIndex;

            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => setSelected(idx)}
                className={`w-full text-left p-3 rounded-xl text-xs font-medium border transition-all flex items-center justify-between gap-3 ${
                  isCorrect
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 text-emerald-800 dark:text-emerald-200'
                    : isWrong
                    ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-500 text-rose-800 dark:text-rose-200'
                    : isSelected
                    ? 'bg-violet-100 dark:bg-violet-900/40 border-violet-500 text-violet-900 dark:text-violet-100'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-violet-300 text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{opt}</span>
                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                {isWrong && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {options.length > 0 && !submitted && selected !== null && (
        <button
          onClick={() => setSubmitted(true)}
          className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white transition-colors"
        >
          Kiểm tra đáp án
        </button>
      )}

      {submitted && explanation && (
        <div className="mt-3 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-slate-200">Giải thích: </span>
          {explanation}
        </div>
      )}
    </div>
  );
}
