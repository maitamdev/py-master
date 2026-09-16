'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Check, Play } from 'lucide-react';
import { highlightPython } from '@/lib/syntax-highlighter';

export function CodeBlock({
  code,
  language = 'python',
  showRun = true,
}: {
  code: string;
  language?: string;
  showRun?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleRunInPlayground = () => {
    try {
      window.localStorage.setItem('python-master:playground:buffer', code);
    } catch (e) {
      console.error(e);
    }
    router.push('/playground');
  };

  const isPython = language.toLowerCase() === 'python' || language.toLowerCase() === 'py';

  const highlightedHtml = useMemo(() => {
    if (isPython) {
      return highlightPython(code);
    }
    return code;
  }, [code, isPython]);

  return (
    <div className="my-5 rounded-xl border border-slate-200/80 dark:border-white/[0.06] bg-[#0d1117] text-slate-100 overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/[0.04] text-xs">
        <span className="font-mono text-slate-500 text-[11px] uppercase tracking-wider">
          {language}
        </span>

        <div className="flex items-center gap-1">
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.06] transition-all"
            title="Sao chép"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Đã chép</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sao chép</span>
              </>
            )}
          </button>

          {/* Run */}
          {showRun && (
            <button
              onClick={handleRunInPlayground}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 transition-all text-[11px] font-medium"
              title="Chạy thử trong Playground"
            >
              <Play className="w-3 h-3 fill-blue-400" />
              <span>Chạy thử</span>
            </button>
          )}
        </div>
      </div>

      {/* Code */}
      <div className="p-4 overflow-x-auto text-[13px] leading-relaxed font-mono selection:bg-blue-500/25">
        {isPython ? (
          <pre
            className="text-slate-200 whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="text-slate-200 whitespace-pre">{code}</pre>
        )}
      </div>
    </div>
  );
}
