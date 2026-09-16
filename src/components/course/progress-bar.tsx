'use client';

export function ProgressBar({
  value,
  max,
  showLabel = false,
  size = 'md',
}: {
  value: number;
  max: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const h = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className="w-full">
      <div className={`w-full ${h} rounded-full bg-slate-100 dark:bg-white/[0.04] overflow-hidden`}>
        <div
          className={`${h} rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 tabular-nums">
          {value}/{max} · {pct}%
        </div>
      )}
    </div>
  );
}
