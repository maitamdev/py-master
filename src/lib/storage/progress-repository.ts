import type { LearningProgress } from '@/types';

export interface ProgressRepository {
  getProgress(): LearningProgress;
  markLessonComplete(lessonId: string): void;
  unmarkLessonComplete(lessonId: string): void;
  isLessonComplete(lessonId: string): boolean;
  markExerciseComplete(exerciseId: string): void;
  isExerciseComplete(exerciseId: string): boolean;
  setCurrentLesson(lessonId: string, partNum?: number): void;
  resetProgress(): void;
}

const STORAGE_KEY = 'python-master:progress';

const DEFAULT_PROGRESS: LearningProgress = {
  completedLessons: [],
  completedExercises: [],
  currentLesson: 'part01-1-getting-started',
  currentPart: 1,
  lastVisitedAt: new Date().toISOString(),
};

export class LocalProgressRepository implements ProgressRepository {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  getProgress(): LearningProgress {
    if (!this.isBrowser()) return DEFAULT_PROGRESS;
    try {
      const data = window.localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_PROGRESS;
      return JSON.parse(data) as LearningProgress;
    } catch {
      return DEFAULT_PROGRESS;
    }
  }

  private saveProgress(progress: LearningProgress): void {
    if (!this.isBrowser()) return;
    try {
      progress.lastVisitedAt = new Date().toISOString();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      window.dispatchEvent(new CustomEvent('python-master:progress-changed', { detail: progress }));
    } catch (err) {
      console.error('Failed to save progress to localStorage:', err);
    }
  }

  markLessonComplete(lessonId: string): void {
    const p = this.getProgress();
    if (!p.completedLessons.includes(lessonId)) {
      p.completedLessons.push(lessonId);
      this.saveProgress(p);
    }
  }

  unmarkLessonComplete(lessonId: string): void {
    const p = this.getProgress();
    p.completedLessons = p.completedLessons.filter((id) => id !== lessonId);
    this.saveProgress(p);
  }

  isLessonComplete(lessonId: string): boolean {
    const p = this.getProgress();
    return p.completedLessons.includes(lessonId);
  }

  markExerciseComplete(exerciseId: string): void {
    const p = this.getProgress();
    if (!p.completedExercises.includes(exerciseId)) {
      p.completedExercises.push(exerciseId);
      this.saveProgress(p);
    }
  }

  isExerciseComplete(exerciseId: string): boolean {
    const p = this.getProgress();
    return p.completedExercises.includes(exerciseId);
  }

  setCurrentLesson(lessonId: string, partNum?: number): void {
    const p = this.getProgress();
    p.currentLesson = lessonId;
    if (partNum) p.currentPart = partNum;
    this.saveProgress(p);
  }

  resetProgress(): void {
    this.saveProgress({
      completedLessons: [],
      completedExercises: [],
      currentLesson: 'part01-1-getting-started',
      currentPart: 1,
      lastVisitedAt: new Date().toISOString(),
    });
  }
}

export const progressRepo: ProgressRepository = new LocalProgressRepository();
