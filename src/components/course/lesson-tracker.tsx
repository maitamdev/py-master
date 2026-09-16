'use client';

import { useEffect } from 'react';
import { useProgress } from '@/hooks/use-progress';

export function LessonTracker({ lessonId, partNum }: { lessonId: string; partNum: number }) {
  const { setCurrentLesson, mounted } = useProgress();

  useEffect(() => {
    if (mounted && lessonId) {
      setCurrentLesson(lessonId, partNum);
    }
  }, [mounted, lessonId, partNum, setCurrentLesson]);

  return null;
}
