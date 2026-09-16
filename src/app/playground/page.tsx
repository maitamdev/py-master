'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Square,
  RotateCcw,
  Terminal,
  Sparkles,
  FileCode,
  Download,
  Upload,
} from 'lucide-react';
import { CodeEditor } from '@/components/ui/code-editor';
import { CodeOutput } from '@/components/ui/code-output';
import { usePyodide } from '@/hooks/use-pyodide';
import { SnippetsDialog } from '@/features/playground/snippets-dialog';

const DEFAULT_PYTHON_CODE = `# Chào mừng bạn đến với Python Playground của PYTHON-MASTER!
# Bạn có thể tự do viết và chạy code Python trực tiếp trên trình duyệt.

def chao_mung(ten):
    return f"Xin chào {ten}! Chúc bạn học tốt Python!"

# Thử nghiệm hàm
thong_diep = chao_mung("Lập trình viên")
print(thong_diep)

# Tính tổng các số từ 1 đến 10
tong = sum(range(1, 11))
print("Tổng từ 1 đến 10 là:", tong)
`;

export default function PlaygroundPage() {
  const [code, setCode] = useState<string>(DEFAULT_PYTHON_CODE);
  const [inputsText, setInputsText] = useState<string>('');
  const [snippetsOpen, setSnippetsOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { runCode, stopExecution, resetOutput, output, state, status } = usePyodide();

  // Load saved code from buffer or previous session
  useEffect(() => {
    try {
      const buffer = window.localStorage.getItem('python-master:playground:buffer');
      if (buffer) {
        setCode(buffer);
        window.localStorage.removeItem('python-master:playground:buffer');
        return;
      }

      const saved = window.localStorage.getItem('python-master:playground:code');
      if (saved) {
        setCode(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Auto-save code on change
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    try {
      window.localStorage.setItem('python-master:playground:code', newCode);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRun = useCallback(() => {
    const inputs = inputsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    runCode(code, inputs);
  }, [code, inputsText, runCode]);

  // Keyboard shortcut Ctrl+Enter to run
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRun();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRun]);

  const handleReset = () => {
    if (confirm('Đặt lại trình soạn thảo về mẫu ban đầu?')) {
      handleCodeChange(DEFAULT_PYTHON_CODE);
      resetOutput();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playground.py';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
      {/* Hidden file input for uploading .py */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".py,.txt"
        className="hidden"
      />

      {/* Playground Top Action Bar */}
      <div className="h-14 px-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Python Playground</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                WASM Pyodide
              </span>
            </h1>
          </div>
        </div>

        {/* Snippets Gallery Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSnippetsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/80 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Kho mã mẫu (Snippets)</span>
          </button>
        </div>

        {/* File Actions & Execution Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1 border-r border-slate-800 pr-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Mở file Python từ máy tính"
            >
              <Upload className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Tải mã nguồn về máy (.py)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Đặt lại code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Đặt lại</span>
          </button>

          {state === 'running' ? (
            <button
              onClick={stopExecution}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Dừng</span>
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/30 transition-all hover:scale-102"
              title="Chạy code (Phím tắt: Ctrl + Enter)"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Chạy mã (Run)</span>
              <kbd className="hidden lg:inline-block ml-1 px-1.5 py-0.5 text-[9px] font-mono bg-sky-700 text-sky-100 rounded border border-sky-500">
                Ctrl+↵
              </kbd>
            </button>
          )}
        </div>
      </div>

      {/* Editor & Output Split Layout */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor Pane */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col border-b md:border-b-0 md:border-r border-slate-800">
          <div className="h-8 px-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-sky-400" />
              main.py
            </span>
            <span className="text-[11px] text-slate-500">Python 3 (Pyodide)</span>
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor value={code} onChange={handleCodeChange} />
          </div>
        </div>

        {/* Output & Stdin Pane */}
        <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col bg-[#0b0f17]">
          {/* Output Terminal */}
          <div className="flex-1 overflow-hidden p-2">
            <CodeOutput
              output={output}
              state={state}
              status={status}
              onClear={resetOutput}
            />
          </div>

          {/* Simulated Stdin Box */}
          <div className="h-24 p-3 border-t border-slate-800/80 bg-slate-900/40 text-xs flex flex-col">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
              Dữ liệu đầu vào mô phỏng (stdin cho input()) — Mỗi dòng 1 giá trị:
            </span>
            <textarea
              value={inputsText}
              onChange={(e) => setInputsText(e.target.value)}
              placeholder="Nhập giá trị giả lập cho lệnh input() tại đây (nếu chương trình có yêu cầu nhập dữ liệu)..."
              className="flex-1 w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-200 font-mono text-xs outline-none focus:border-sky-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Snippets Gallery Dialog */}
      <SnippetsDialog
        isOpen={snippetsOpen}
        onClose={() => setSnippetsOpen(false)}
        onSelectSnippet={(snippetCode) => {
          handleCodeChange(snippetCode);
          resetOutput();
        }}
      />
    </div>
  );
}
