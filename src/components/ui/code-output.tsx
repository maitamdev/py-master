'use client';

import { useState } from 'react';
import { Terminal, Copy, Trash2, Check } from 'lucide-react';
import type { ExecutionState } from '@/hooks/use-pyodide';

export function CodeOutput({
  output,
  state,
  status,
  onClear,
}: {
  output: string;
  state: ExecutionState;
  status: string;
  onClear: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const stateColors: Record<ExecutionState, string> = {
    idle: 'bg-slate-500',
    loading: 'bg-amber-500 animate-pulse',
    running: 'bg-sky-500 animate-pulse',
    done: 'bg-emerald-500',
    error: 'bg-rose-500',
  };

  return (
    <div className="h-full flex flex-col bg-[#0b0f17] text-slate-200 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#121824] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-300">Terminal Output</span>
          <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-slate-800/80 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${stateColors[state]}`} />
            <span className="text-slate-300">{status}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {output && (
            <button
              onClick={handleCopy}
              className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              title="Sao chép kết quả"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={onClear}
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Xóa màn hình"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Output Content */}
      <div className="flex-1 p-3.5 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed select-text">
        {output ? (
          <div className={state === 'error' ? 'text-rose-400' : 'text-slate-100'}>
            {output}
          </div>
        ) : (
          <div className="text-slate-600 italic">
            Chưa có kết quả. Bấm [Chạy mã (Run)] để thực thi chương trình Python.
          </div>
        )}
      </div>
    </div>
  );
}
