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
    <div className="my-5 rounded-2xl border border-slate-700/80 bg-[#0d1117] text-slate-100 shadow-xl overflow-hidden group">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          <span className="ml-2 font-mono font-medium text-slate-400 capitalize">
            {language}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Sao chép mã"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Đã chép!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </>
            )}
          </button>

          {/* Run Button */}
          {showRun && (
            <button
              onClick={handleRunInPlayground}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-600/30 hover:bg-sky-600/50 text-sky-300 border border-sky-500/30 transition-all font-medium hover:scale-105"
              title="Chạy thử mã trong Playground"
            >
              <Play className="w-3.5 h-3.5 fill-sky-300" />
              <span>Chạy thử</span>
            </button>
          )}
        </div>
      </div>

      {/* Code content with Syntax Highlighting */}
      <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono selection:bg-sky-500/30">
        {isPython ? (
          <pre
            className="text-slate-100 whitespace-pre"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre className="text-slate-100 whitespace-pre">{code}</pre>
        )}
      </div>
    </div>
  );
}
