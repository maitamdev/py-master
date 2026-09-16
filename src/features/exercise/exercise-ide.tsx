'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  Bot,
  Send,
  Terminal,
  Code,
  Square,
  FileCheck,
  Download,
  Upload,
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { Exercise } from '@/types';
import { CodeEditor } from '@/components/ui/code-editor';
import { CodeOutput } from '@/components/ui/code-output';
import { MarkdownContent } from '@/components/blocks/markdown-content';
import { usePyodide } from '@/hooks/use-pyodide';
import { useProgress } from '@/hooks/use-progress';
import {
  getSavedExerciseCode,
  saveExerciseCode,
  resetExerciseCode,
} from '@/lib/storage';
import { AITutorPanel } from '@/features/ai-tutor/ai-tutor-panel';
import { GradingResults } from './grading-results';
import { gradeExercise, type GradingResult } from '@/lib/grading/exercise-grader';

type SubmitPhase = 'idle' | 'running-tests' | 'graded';

export function ExerciseIDE({ exercise }: { exercise: Exercise }) {
  const [code, setCode] = useState<string>('');
  const [aiOpen, setAiOpen] = useState<boolean>(false);
  const [stdinText, setStdinText] = useState<string>('');
  const [submitPhase, setSubmitPhase] = useState<SubmitPhase>('idle');
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [bottomTab, setBottomTab] = useState<'output' | 'grading'>('output');
  const [showHints, setShowHints] = useState<boolean>(false);
  const [hintStep, setHintStep] = useState<number>(1);
  const [currentTestIndex, setCurrentTestIndex] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { runCode, stopExecution, resetOutput, output, state, status } = usePyodide();
  const { markExerciseComplete, isExerciseComplete, mounted } = useProgress();

  // Ref to collect outputs for multi-test submission
  const testOutputsRef = useRef<string[]>([]);
  const currentTestIndexRef = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);

  const tests = useMemo(() => exercise.tests || [], [exercise.tests]);
  const hasTests = tests.length > 0;

  // Load saved code on mount
  useEffect(() => {
    const saved = getSavedExerciseCode(exercise.id, exercise.starter_code);
    setCode(saved);
  }, [exercise.id, exercise.starter_code]);

  // Auto-save code
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    saveExerciseCode(exercise.id, newCode);
  };

  const handleResetCode = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại mã nguồn ban đầu của bài tập này?')) {
      const reset = resetExerciseCode(exercise.id, exercise.starter_code);
      setCode(reset);
      setGradingResult(null);
      setSubmitPhase('idle');
      setBottomTab('output');
    }
  };

  // Download .py file
  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exercise.id}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Upload .py file from user computer
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        handleCodeChange(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // "Chạy thử" — run with user-provided stdin
  const handleRun = useCallback(() => {
    setGradingResult(null);
    setSubmitPhase('idle');
    setBottomTab('output');
    const inputs = stdinText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    runCode(code, inputs);
  }, [stdinText, code, runCode]);

  // "Nộp bài" — run through all test cases sequentially
  const handleSubmit = useCallback(() => {
    if (!hasTests) {
      handleRun();
      return;
    }

    setGradingResult(null);
    setSubmitPhase('running-tests');
    testOutputsRef.current = [];
    currentTestIndexRef.current = 0;
    setCurrentTestIndex(0);
    isSubmittingRef.current = true;

    const firstTest = tests[0];
    const inputs = firstTest.input
      ? firstTest.input.split('\n').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];
    runCode(code, inputs);
  }, [hasTests, tests, code, runCode, handleRun]);

  // Keyboard shortcuts: Ctrl+Enter (Run), Ctrl+Shift+Enter (Submit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          handleSubmit();
        } else {
          handleRun();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun, handleSubmit]);

  // Handle submission test execution completion
  useEffect(() => {
    if (!isSubmittingRef.current) return;
    if (state !== 'done' && state !== 'error') return;

    testOutputsRef.current[currentTestIndexRef.current] = output;
    const nextIndex = currentTestIndexRef.current + 1;

    if (nextIndex < tests.length) {
      currentTestIndexRef.current = nextIndex;
      setCurrentTestIndex(nextIndex);
      const nextTest = tests[nextIndex];
      const inputs = nextTest.input
        ? nextTest.input.split('\n').map((s) => s.trim()).filter((s) => s.length > 0)
        : [];
      setTimeout(() => runCode(code, inputs), 100);
    } else {
      isSubmittingRef.current = false;
      const result = gradeExercise(testOutputsRef.current, tests);
      setGradingResult(result);
      setSubmitPhase('graded');
      setBottomTab('grading');

      if (result.passed) {
        markExerciseComplete(exercise.id);
      }
    }
  }, [state, output, tests, code, runCode, markExerciseComplete, exercise.id]);

  const isCompleted = mounted && isExerciseComplete(exercise.id);

  // Check if there is an error or failed tests to offer AI diagnostic
  const hasFailure =
    state === 'error' ||
    (submitPhase === 'graded' && gradingResult && !gradingResult.passed);

  // Format failed test cases details for deep AI diagnostic
  const failedTestDetails = gradingResult?.testResults
    ?.filter((d) => !d.passed)
    ?.map(
      (d, idx) =>
        `Test ${idx + 1} (${d.testName}):\n- Dữ liệu input: ${d.inputs ? `"${d.inputs}"` : '(không có input)'}\n- Kết quả kỳ vọng (Expected): "${d.expected}"\n- Kết quả thực tế của học viên (Actual): "${d.actual}"`
    )
    ?.join('\n\n');

  const isPygame = exercise.part >= 13;

  const aiContext = {
    courseTitle: 'PYTHON-MASTER',
    partTitle: `Phần ${exercise.part}`,
    lessonTitle: exercise.lesson_id,
    currentExercise: {
      title: exercise.title_vi || exercise.title_original,
      description: exercise.description_vi || exercise.description_original,
      studentCode: code,
      stdin: stdinText || undefined,
      currentOutput: output || undefined,
      failedTestDetails: failedTestDetails || undefined,
      gradingFeedback: gradingResult
        ? `${gradingResult.passedTests}/${gradingResult.totalTests} tests passed (${gradingResult.passed ? 'ĐẠT' : 'CHƯA ĐẠT'})`
        : undefined,
    },
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Hidden file input for uploading .py */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".py,.txt"
        className="hidden"
      />

      {/* Top Exercise Sub-header */}
      <div className="h-12 px-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/lesson/${exercise.lesson_id}`}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quay lại bài học</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
            {exercise.id}
          </span>
          <h1 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
            {exercise.title_vi || exercise.title_original}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/60 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đã hoàn thành</span>
            </span>
          )}

          <button
            onClick={() => setAiOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 border border-indigo-200 dark:border-indigo-800 transition-colors"
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hỏi Gia sư AI</span>
          </button>
        </div>
      </div>

      {/* Split Workstation: Left (Prompt & Hints) | Right (IDE & Terminal) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Exercise Prompt */}
        <div className="w-full lg:w-5/12 h-1/2 lg:h-full border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 overflow-y-auto">
          <div className="space-y-5 max-w-xl">
            {isPygame && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <span>🎮 Bài tập Pygame đồ họa</span>
                </div>
                <p className="text-[11.5px] leading-relaxed text-amber-700 dark:text-amber-300">
                  Bài tập này sử dụng thư viện giao diện đồ họa. Để hiển thị cửa sổ game tương tác trực quan đầy đủ, bạn nên bấm <strong>&quot;Tải code .py&quot;</strong> trên thanh công cụ và chạy trực tiếp trên máy tính cá nhân (VS Code / Python).
                </p>
              </div>
            )}

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                Đề bài thực hành
              </span>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                {exercise.title_vi || exercise.title_original}
              </h2>
            </div>

            <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed space-y-3">
              <MarkdownContent
                content={exercise.description_vi || exercise.description_original}
              />
            </div>

            {/* Hints Accordion */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowHints(!showHints)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-all"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Gợi ý phương pháp giải bài tập</span>
                </div>
                {showHints ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHints && (
                <div className="mt-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                    <button
                      onClick={() => setHintStep(1)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        hintStep === 1
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Gợi ý 1: Đọc kỹ yêu cầu
                    </button>
                    <button
                      onClick={() => setHintStep(2)}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                        hintStep === 2
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Gợi ý 2: Hướng thuật toán
                    </button>
                  </div>

                  {hintStep === 1 ? (
                    <div className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        1. Xác định dữ liệu vào & ra (I/O):
                      </p>
                      <p>
                        Xem kỹ mẫu đầu ra (sample output) trong đề bài. Nếu có lời nhắc nhập, hãy chú ý chính xác từng khoảng trắng và dấu hai chấm.
                      </p>
                      <p>
                        Sử dụng <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">input()</code> để nhận dữ liệu từ bàn phím và ép kiểu thích hợp như <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">int(...)</code> hoặc <code className="font-mono bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded">float(...)</code> nếu đề bài tính toán số học.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        2. Cấu trúc logic xử lý:
                      </p>
                      <p>
                        Chia bài toán thành 3 bước tuần tự: <strong>Nhập dữ liệu ➔ Xử lý tính toán hoặc lặp điều kiện ➔ In kết quả chuẩn format</strong>.
                      </p>
                      <p>
                        Nếu kết quả không khớp, hãy bấm tab <strong>&quot;Kết quả chấm&quot;</strong> bên dưới để xem sự khác biệt giữa Output thực tế và Expected Output.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Test Cases Info */}
            {hasTests && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                  <FileCheck className="w-3.5 h-3.5 text-sky-500" />
                  Bài tập có {tests.length} test case
                </h3>
                <div className="space-y-1.5">
                  {tests.filter((t) => !t.hidden).map((t) => (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px]"
                    >
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {t.name}
                      </span>
                      {t.input && (
                        <div className="mt-1 text-slate-500">
                          <span className="font-medium">Input:</span>{' '}
                          <code className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono">
                            {t.input.replace(/\n/g, ', ')}
                          </code>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Code Editor + Output/Grading */}
        <div className="w-full lg:w-7/12 h-1/2 lg:h-full flex flex-col overflow-hidden bg-slate-950 relative">
          {/* Editor Action Toolbar */}
          <div className="h-11 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-300 font-mono">
                <Code className="w-3.5 h-3.5 text-sky-400" />
                <span>main.py</span>
              </div>

              {/* File Upload / Download buttons */}
              <div className="hidden sm:flex items-center gap-1 border-l border-slate-800 pl-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Mở file .py từ máy tính"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDownloadCode}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  title="Tải code về máy (.py)"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                title="Đặt lại code ban đầu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đặt lại</span>
              </button>

              {state === 'running' ? (
                <button
                  onClick={stopExecution}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Dừng</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleRun}
                    disabled={submitPhase === 'running-tests'}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-semibold transition-all"
                    title="Chạy thử code (Phím tắt: Ctrl + Enter)"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Chạy thử</span>
                    <kbd className="hidden xl:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-600">
                      Ctrl+↵
                    </kbd>
                  </button>

                  <button
                    onClick={handleSubmit}
                    disabled={submitPhase === 'running-tests' || !code.trim()}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-all shadow-md shadow-emerald-600/20"
                    title="Nộp bài chấm điểm (Phím tắt: Ctrl + Shift + Enter)"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Nộp bài</span>
                    <kbd className="hidden xl:inline-block ml-1 px-1 py-0.2 text-[9px] font-mono bg-emerald-700 text-emerald-100 rounded border border-emerald-500">
                      Ctrl+⇧+↵
                    </kbd>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Monaco / Lite Code Editor */}
          <div className="flex-1 min-h-[120px] overflow-hidden flex flex-col">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>

          {/* Stdin Input (for manual run) */}
          {submitPhase !== 'running-tests' && (
            <div className="h-16 px-3 py-2 border-t border-slate-800 bg-slate-900/60 text-xs flex flex-col shrink-0">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-0.5">
                Dữ liệu đầu vào mô phỏng (stdin) — Mỗi dòng 1 giá trị:
              </span>
              <textarea
                value={stdinText}
                onChange={(e) => setStdinText(e.target.value)}
                placeholder="Nhập giá trị cho input() tại đây (nếu có)..."
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 font-mono text-xs outline-none focus:border-sky-500 resize-none"
              />
            </div>
          )}

          {/* Error / AI Diagnostic Banner */}
          {hasFailure && (
            <div className="px-4 py-2 bg-gradient-to-r from-rose-950/80 to-indigo-950/80 border-t border-rose-900/60 flex items-center justify-between gap-3 shrink-0 text-xs">
              <div className="flex items-center gap-2 text-rose-300 font-medium">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="line-clamp-1">Gặp khó khăn với lỗi hoặc Test case chưa qua?</span>
              </div>
              <button
                onClick={() => setAiOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-xs transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Nhờ AI giải thích lỗi</span>
              </button>
            </div>
          )}

          {/* Bottom Section: Output Tab / Grading Tab */}
          <div className="h-52 sm:h-56 shrink-0 border-t border-slate-800 flex flex-col">
            {/* Tab Switcher */}
            <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-center gap-0 shrink-0 text-[11px]">
              <button
                onClick={() => setBottomTab('output')}
                className={`px-4 h-full font-semibold transition-colors border-b-2 ${
                  bottomTab === 'output'
                    ? 'text-sky-400 border-sky-400 bg-slate-800/50'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3 h-3" />
                  Output
                </span>
              </button>
              <button
                onClick={() => setBottomTab('grading')}
                className={`px-4 h-full font-semibold transition-colors border-b-2 ${
                  bottomTab === 'grading'
                    ? 'text-emerald-400 border-emerald-400 bg-slate-800/50'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileCheck className="w-3 h-3" />
                  Kết quả chấm
                  {gradingResult && (
                    <span
                      className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold ${
                        gradingResult.passed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {gradingResult.passedTests}/{gradingResult.totalTests}
                    </span>
                  )}
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {bottomTab === 'output' ? (
                <CodeOutput
                  output={output}
                  state={submitPhase === 'running-tests' ? 'running' : state}
                  status={
                    submitPhase === 'running-tests'
                      ? `Đang chạy test ${currentTestIndex + 1}/${tests.length}...`
                      : status
                  }
                  onClear={resetOutput}
                />
              ) : gradingResult ? (
                <GradingResults
                  result={gradingResult}
                  onRetry={() => {
                    setGradingResult(null);
                    setSubmitPhase('idle');
                    setBottomTab('output');
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-slate-500">
                  <div className="text-center space-y-2">
                    <FileCheck className="w-8 h-8 mx-auto text-slate-600" />
                    <p>Bấm <strong>&quot;Nộp bài&quot;</strong> để chạy test cases và kiểm tra kết quả.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Tutor Drawer */}
      <AITutorPanel
        context={aiContext}
        isOpen={aiOpen}
        onClose={() => setAiOpen(false)}
      />
    </div>
  );
}
