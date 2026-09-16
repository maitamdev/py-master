'use client';

import { CheckCircle2, XCircle, ChevronDown, ChevronRight, Trophy } from 'lucide-react';
import { useState } from 'react';
import type { GradingResult } from '@/lib/grading/exercise-grader';

export function GradingResults({
  result,
  onRetry,
}: {
  result: GradingResult;
  onRetry: () => void;
}) {
  const [expandedTests, setExpandedTests] = useState<Set<string>>(
    // Auto-expand failed tests
    new Set(result.testResults.filter((r) => !r.passed).map((r) => r.testId))
  );

  const toggleTest = (testId: string) => {
    setExpandedTests((prev) => {
      const next = new Set(prev);
      if (next.has(testId)) {
        next.delete(testId);
      } else {
        next.add(testId);
      }
      return next;
    });
  };

  if (result.totalTests === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-400">
        {result.summary}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Summary Header */}
      <div
        className={`px-4 py-3 flex items-center justify-between border-b ${
          result.passed
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {result.passed ? (
            <Trophy className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <XCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          )}
          <div>
            <span
              className={`text-sm font-bold ${
                result.passed
                  ? 'text-emerald-800 dark:text-emerald-200'
                  : 'text-amber-800 dark:text-amber-200'
              }`}
            >
              {result.passed ? 'Nộp bài thành công!' : 'Chưa đạt — Hãy thử lại'}
            </span>
            <p
              className={`text-[11px] ${
                result.passed
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {result.summary}
            </p>
          </div>
        </div>

        {!result.passed && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition-colors"
          >
            Sửa code & thử lại
          </button>
        )}
      </div>

      {/* Test Results List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {result.testResults.map((tr) => {
          const isExpanded = expandedTests.has(tr.testId);

          return (
            <div
              key={tr.testId}
              className={`rounded-xl border overflow-hidden transition-all ${
                tr.passed
                  ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20'
              }`}
            >
              {/* Test Header */}
              <button
                onClick={() => toggleTest(tr.testId)}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold text-left"
              >
                {tr.passed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                )}
                <span
                  className={
                    tr.passed
                      ? 'text-emerald-800 dark:text-emerald-200'
                      : 'text-rose-800 dark:text-rose-200'
                  }
                >
                  {tr.testName}
                </span>
                <span className="ml-auto text-[10px] font-normal text-slate-400">
                  {tr.passed ? 'Đạt' : 'Không đạt'}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                )}
              </button>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-slate-200/50 dark:border-slate-800/50 pt-2">
                  {tr.inputs && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Dữ liệu đầu vào (stdin)
                      </span>
                      <pre className="mt-1 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {tr.inputs}
                      </pre>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        Output mong đợi
                      </span>
                      <pre className="mt-1 p-2 rounded-lg bg-emerald-100/60 dark:bg-emerald-950/40 text-[11px] font-mono text-emerald-800 dark:text-emerald-200 whitespace-pre-wrap border border-emerald-200/50 dark:border-emerald-800/50">
                        {tr.expected || '(trống)'}
                      </pre>
                    </div>
                    <div>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          tr.passed
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        Output thực tế
                      </span>
                      <pre
                        className={`mt-1 p-2 rounded-lg text-[11px] font-mono whitespace-pre-wrap border ${
                          tr.passed
                            ? 'bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200/50 dark:border-emerald-800/50'
                            : 'bg-rose-100/60 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200/50 dark:border-rose-800/50'
                        }`}
                      >
                        {tr.actual || '(trống)'}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
