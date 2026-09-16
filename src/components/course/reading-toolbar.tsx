'use client';

import { useState } from 'react';
import { Maximize2, Minimize2, Share2, Check } from 'lucide-react';

export type FontSize = 'sm' | 'base' | 'lg';

export function ReadingToolbar({
  fontSize,
  onChangeFontSize,
  isZenMode,
  onToggleZen,
}: {
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  isZenMode: boolean;
  onToggleZen: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-xs text-slate-600 dark:text-slate-300">
      {/* Font Size controls */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 rounded-xl p-0.5">
        <button
          onClick={() => onChangeFontSize('sm')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
            fontSize === 'sm'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Cỡ chữ nhỏ (14px)"
        >
          A-
        </button>
        <button
          onClick={() => onChangeFontSize('base')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
            fontSize === 'base'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Cỡ chữ chuẩn (16px)"
        >
          A
        </button>
        <button
          onClick={() => onChangeFontSize('lg')}
          className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
            fontSize === 'lg'
              ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
          title="Cỡ chữ to (18px)"
        >
          A+
        </button>
      </div>

      <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

      {/* Zen Mode Button */}
      <button
        onClick={onToggleZen}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl font-medium transition-colors ${
          isZenMode
            ? 'bg-sky-50 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 font-bold border border-sky-300 dark:border-sky-800'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
        }`}
        title={isZenMode ? 'Thoát chế độ tập trung' : 'Bật chế độ tập trung (Zen Mode)'}
      >
        {isZenMode ? (
          <>
            <Minimize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Thoát Zen</span>
          </>
        ) : (
          <>
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Chế độ tập trung</span>
          </>
        )}
      </button>

      {/* Share / Copy Link */}
      <button
        onClick={handleShare}
        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        title="Sao chép liên kết bài học"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Share2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
