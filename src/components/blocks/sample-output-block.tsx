'use client';

import { Terminal } from 'lucide-react';

export function SampleOutputBlock({ output }: { output: string }) {
  return (
    <div className="my-4 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden text-xs">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-200/70 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-mono">
        <Terminal className="w-3.5 h-3.5" />
        <span className="font-semibold text-[11px] uppercase tracking-wider">
          Mẫu kết quả in ra màn hình (Sample Output)
        </span>
      </div>
      <div className="p-3.5 font-mono text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre leading-relaxed text-[13px]">
        {output}
      </div>
    </div>
  );
}
