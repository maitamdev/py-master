'use client';

export function ProgressBar({
  value,
  max,
  className = '',
  showLabel = false,
  size = 'md',
}: {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const heightClass = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';

  return (
    <div className={`w-full flex items-center gap-3 ${className}`}>
      <div className={`flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-mono font-medium text-slate-600 dark:text-slate-400 min-w-9 text-right">
          {percentage}%
        </span>
      )}
    </div>
  );
}
