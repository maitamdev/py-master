'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProgress } from '@/hooks/use-progress';

export default function LearnPage() {
  const router = useRouter();
  const { progress, mounted } = useProgress();

  useEffect(() => {
    if (mounted) {
      const target = progress.currentLesson || 'part01-1-getting-started';
      router.replace(`/lesson/${target}`);
    }
  }, [mounted, progress.currentLesson, router]);

  return (
    <div className="flex-1 flex items-center justify-center p-8 text-sm text-slate-500">
      Đang chuyển hướng tới bài học của bạn...
    </div>
  );
}
