'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Terminal,
  CheckCircle2,
  ArrowRight,
  Play,
  Square,
  RotateCcw,
  Code,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProgress } from '@/hooks/use-progress';
import { usePyodide } from '@/hooks/use-pyodide';
import { getSavedExerciseCode, saveExerciseCode, resetExerciseCode } from '@/lib/storage';
import { CodeEditor } from '@/components/ui/code-editor';
import { CodeOutput } from '@/components/ui/code-output';
import { MarkdownContent } from './markdown-content';

export function ExerciseBlock({
  exerciseId,
  title,
  content,
}: {
  exerciseId: string;
  title?: string;
  content: string;
}) {
  const { isExerciseComplete, mounted } = useProgress();
  const completed = mounted && isExerciseComplete(exerciseId);

  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [code, setCode] = useState<string>('');
  const { runCode, stopExecution, resetOutput, output, state, status } = usePyodide();

  // Load saved code on mount or when editor is opened
  useEffect(() => {
    if (mounted && exerciseId) {
      const saved = getSavedExerciseCode(exerciseId);
      setCode(saved || '# Viết mã Python giải bài tập tại đây:\n\n');
    }
  }, [mounted, exerciseId]);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveExerciseCode(exerciseId, newCode);
  };

  const handleRun = useCallback(() => {
    if (!code.trim()) return;
    runCode(code);
  }, [code, runCode]);

  const handleReset = () => {
    if (confirm('Đặt lại mã nguồn bài tập này về mặc định?')) {
      const reset = resetExerciseCode(exerciseId);
      setCode(reset || '# Viết mã Python giải bài tập tại đây:\n\n');
      resetOutput();
    }
  };

  return (
    <div className="my-6 rounded-2xl border border-sky-200 dark:border-sky-900/60 bg-gradient-to-br from-sky-50/70 to-blue-50/40 dark:from-sky-950/30 dark:to-slate-900 p-5 shadow-xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-sky-100 dark:border-sky-900/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-sky-500 text-white shadow-xs">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Bài tập lập trình thực hành
              </span>
              {completed && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-3 h-3" />
                  Đã hoàn thành
                </span>
              )}
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {title || 'Bài tập Python'}
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsEditorOpen(!isEditorOpen)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 shadow-xs transition-colors cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-sky-500" />
            <span>{isEditorOpen ? 'Thu gọn code' : 'Viết code tại đây'}</span>
            {isEditorOpen ? (
              <ChevronUp className="w-3 h-3 text-slate-400" />
            ) : (
              <ChevronDown className="w-3 h-3 text-slate-400" />
            )}
          </button>

          <Link
            href={`/exercise/${exerciseId}`}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white shadow-xs shadow-sky-600/30 transition-all hover:gap-2"
            title="Mở phòng thực hành đầy đủ với các bộ Test Case chấm tự động"
          >
            <span>Phòng Test IDE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Description */}
      <div className="mt-3.5 text-sm">
        <MarkdownContent content={content} />
      </div>

      {/* Embedded Live Code Editor & Runner */}
      {isEditorOpen && (
        <div className="mt-5 pt-4 border-t border-sky-200/80 dark:border-sky-900/60 space-y-3 animate-in fade-in-50 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <Code className="w-4 h-4 text-sky-500" />
              <span>Khung viết code trực tiếp</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-2.5 py-1 rounded-lg text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
                title="Đặt lại code ban đầu"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Đặt lại</span>
              </button>

              {state === 'running' ? (
                <button
                  type="button"
                  onClick={stopExecution}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1.5 transition-colors"
                >
                  <Square className="w-3 h-3" />
                  <span>Dừng</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleRun}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-sky-600 hover:bg-sky-500 text-white flex items-center gap-1.5 shadow-xs shadow-sky-600/30 transition-colors"
                >
                  <Play className="w-3 h-3" />
                  <span>Chạy thử (Run)</span>
                </button>
              )}
            </div>
          </div>

          {/* Editor Container */}
          <div className="h-80 rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex flex-col">
            <CodeEditor
              value={code}
              onChange={handleCodeChange}
              height="100%"
              showModeToggle={true}
            />
          </div>

          {/* Inline Output */}
          <div className="h-44 rounded-xl overflow-hidden border border-slate-800">
            <CodeOutput
              output={output}
              state={state}
              status={status}
              onClear={resetOutput}
            />
          </div>

          {/* Link to full test grader */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>Mã nguồn được lưu tự động trên trình duyệt.</span>
            <Link
              href={`/exercise/${exerciseId}`}
              className="text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Nộp bài & Chấm toàn bộ Test Cases tại phòng IDE</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
