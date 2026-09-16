'use client';

import { useState, useEffect, useCallback } from 'react';
import type { LearningProgress } from '@/types';
import { progressRepo } from '@/lib/storage';

export function useProgress() {
  const [progress, setProgress] = useState<LearningProgress>({
    completedLessons: [],
    completedExercises: [],
    currentLesson: 'part01-1-getting-started',
    currentPart: 1,
    lastVisitedAt: '',
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setProgress(progressRepo.getProgress());

    const handleProgressChange = (e: Event) => {
      const customEvent = e as CustomEvent<LearningProgress>;
      if (customEvent.detail) {
        setProgress(customEvent.detail);
      } else {
        setProgress(progressRepo.getProgress());
      }
    };

    window.addEventListener('python-master:progress-changed', handleProgressChange);
    return () => {
      window.removeEventListener('python-master:progress-changed', handleProgressChange);
    };
  }, []);

  const markLessonComplete = useCallback((lessonId: string) => {
    progressRepo.markLessonComplete(lessonId);
    setProgress(progressRepo.getProgress());
  }, []);

  const unmarkLessonComplete = useCallback((lessonId: string) => {
    progressRepo.unmarkLessonComplete(lessonId);
    setProgress(progressRepo.getProgress());
  }, []);

  const toggleLessonComplete = useCallback((lessonId: string) => {
    if (progressRepo.isLessonComplete(lessonId)) {
      progressRepo.unmarkLessonComplete(lessonId);
    } else {
      progressRepo.markLessonComplete(lessonId);
    }
    setProgress(progressRepo.getProgress());
  }, []);

  const markExerciseComplete = useCallback((exerciseId: string) => {
    progressRepo.markExerciseComplete(exerciseId);
    setProgress(progressRepo.getProgress());
  }, []);

  const isLessonComplete = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons]
  );

  const isExerciseComplete = useCallback(
    (exerciseId: string) => progress.completedExercises.includes(exerciseId),
    [progress.completedExercises]
  );

  const setCurrentLesson = useCallback((lessonId: string, partNum?: number) => {
    progressRepo.setCurrentLesson(lessonId, partNum);
    setProgress(progressRepo.getProgress());
  }, []);

  const resetProgress = useCallback(() => {
    progressRepo.resetProgress();
    setProgress(progressRepo.getProgress());
  }, []);

  return {
    progress,
    mounted,
    markLessonComplete,
    unmarkLessonComplete,
    toggleLessonComplete,
    markExerciseComplete,
    isLessonComplete,
    isExerciseComplete,
    setCurrentLesson,
    resetProgress,
  };
}
