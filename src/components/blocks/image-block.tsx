'use client';

import { useState } from 'react';
import { resolveAssetUrl } from '@/lib/course/client';
import { ImageIcon } from 'lucide-react';

export function ImageBlock({
  src,
  alt = 'Minh họa bài học Python',
  part,
}: {
  src?: string;
  alt?: string;
  part?: number;
}) {
  const [error, setError] = useState(false);
  const resolvedSrc = resolveAssetUrl(src, part);

  return (
    <figure className="my-6 flex flex-col items-center">
      <div className="max-w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs p-2">
        {!error ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resolvedSrc}
            alt={alt}
            onError={() => setError(true)}
            className="max-h-[480px] w-auto object-contain mx-auto rounded-lg"
            loading="lazy"
          />
        ) : (
          <div className="py-10 px-8 flex flex-col items-center text-slate-400 gap-2">
            <ImageIcon className="w-8 h-8 text-slate-300" />
            <span className="text-xs">Hình ảnh minh họa: {src}</span>
          </div>
        )}
      </div>
      {alt && alt !== 'Minh họa bài học Python' && (
        <figcaption className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center italic">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}
