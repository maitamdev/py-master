'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from '@/hooks/use-theme';
import { Code, Sparkles } from 'lucide-react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
});

export function CodeEditor({
  value,
  onChange,
  height = '100%',
  readOnly = false,
  showModeToggle = true,
}: {
  value: string;
  onChange?: (val: string) => void;
  height?: string;
  readOnly?: boolean;
  showModeToggle?: boolean;
}) {
  const { resolvedTheme } = useTheme();
  const [editorMode, setEditorMode] = useState<'monaco' | 'lite'>('lite');
  const [monacoAvailable, setMonacoAvailable] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Check if Monaco can load; default to lite for instant typing
  useEffect(() => {
    let active = true;
    import('@monaco-editor/react')
      .then(() => {
        if (active) {
          setMonacoAvailable(true);
        }
      })
      .catch(() => {
        if (active) {
          setEditorMode('lite');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Sync scrolling between line numbers and textarea in Lite mode
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Sync scroll if user scrolls over line numbers gutter
  const handleLineNumbersWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop += e.deltaY;
    }
  };

  // Handle Tab key in Lite editor (indent 4 spaces)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return;
    if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;

      if (e.shiftKey) {
        // Shift+Tab: Unindent 4 spaces if possible
        const lines = value.substring(0, start).split('\n');
        const currentLine = lines[lines.length - 1];
        if (currentLine.startsWith('    ')) {
          const beforeLine = value.substring(0, start - 4);
          const afterCursor = value.substring(start);
          const newValue = beforeLine + afterCursor;
          onChange?.(newValue);
          setTimeout(() => {
            target.selectionStart = target.selectionEnd = Math.max(0, start - 4);
          }, 0);
        }
      } else {
        // Tab: Insert 4 spaces
        const newValue = value.substring(0, start) + '    ' + value.substring(end);
        onChange?.(newValue);
        setTimeout(() => {
          target.selectionStart = target.selectionEnd = start + 4;
        }, 0);
      }
    }
  };

  const lineCount = Math.max(1, (value || '').split('\n').length);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1);

  return (
    <div
      className="relative flex-1 min-h-0 w-full h-full overflow-hidden rounded-xl bg-[#0d1117] border border-slate-800 flex flex-col group"
      style={{ height: height || '100%', minHeight: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget && textareaRef.current) {
          textareaRef.current.focus();
        }
      }}
    >
      {/* Mode Switcher pill */}
      {showModeToggle && (
        <div className="absolute top-2.5 right-3 z-20 flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-2 py-1 rounded-lg border border-slate-800 text-[10px] text-slate-400 select-none pointer-events-auto shadow-md">
          {monacoAvailable ? (
            <button
              type="button"
              onClick={() => setEditorMode(editorMode === 'monaco' ? 'lite' : 'monaco')}
              className="flex items-center gap-1 hover:text-sky-400 transition-colors font-medium cursor-pointer"
              title="Chuyển đổi giữa trình soạn thảo Monaco và Lite Editor"
            >
              {editorMode === 'monaco' ? (
                <>
                  <Sparkles className="w-3 h-3 text-sky-400" />
                  <span className="text-sky-400">Monaco IDE</span>
                </>
              ) : (
                <>
                  <Code className="w-3 h-3 text-slate-400" />
                  <span>Lite Editor</span>
                </>
              )}
            </button>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <Code className="w-3 h-3" />
              <span>Python Editor</span>
            </span>
          )}
        </div>
      )}

      {editorMode === 'monaco' && monacoAvailable ? (
        <div className="flex-1 min-h-0 w-full h-full">
          <MonacoEditor
            height="100%"
            language="python"
            theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
            value={value}
            onChange={(val) => onChange?.(val || '')}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              readOnly,
              tabSize: 4,
              insertSpaces: true,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          />
        </div>
      ) : (
        /* Instant Responsive Lite Editor */
        <div
          className="flex-1 min-h-0 w-full h-full flex bg-[#0d1117] text-[#e6edf3] font-mono text-sm select-text overflow-hidden"
          onClick={() => textareaRef.current?.focus()}
        >
          {/* Line Numbers Column */}
          <div
            ref={lineNumbersRef}
            onWheel={handleLineNumbersWheel}
            className="w-12 py-3 pr-3 select-none text-right font-mono text-xs text-slate-600 bg-slate-950/60 border-r border-slate-800/80 overflow-hidden shrink-0 h-full"
            style={{ scrollbarWidth: 'none' }}
          >
            {lineNumbers.map((n) => (
              <div key={n} className="leading-6 h-6">
                {n}
              </div>
            ))}
          </div>

          {/* Textarea Code Input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            readOnly={readOnly}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            placeholder="# Nhập mã nguồn Python tại đây..."
            className="flex-1 min-h-0 w-full h-full py-3 pl-3 pr-28 bg-transparent text-[#e6edf3] font-mono text-sm leading-6 resize-none outline-none border-none whitespace-pre overflow-auto focus:ring-0 selection:bg-blue-500/25"
            style={{
              tabSize: 4,
              fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            }}
          />
        </div>
      )}
    </div>
  );
}
