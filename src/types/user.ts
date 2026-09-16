export interface LearningProgress {
  completedLessons: string[];
  completedExercises: string[];
  currentLesson?: string;
  currentPart?: number;
  lastVisitedAt: string;
}

export interface Bookmark {
  id: string;
  type: 'lesson' | 'block' | 'exercise';
  targetId: string;
  title: string;
  part: number;
  lessonId?: string;
  path: string;
  createdAt: string;
  preview?: string;
}

export interface Note {
  id: string;
  lessonId: string;
  lessonTitle: string;
  part: number;
  content: string;
  blockId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
}

export interface AIContext {
  courseTitle?: string;
  partTitle?: string;
  lessonTitle?: string;
  currentSection?: string;
  relevantLessonContent?: string;
  currentExercise?: {
    title: string;
    description: string;
    starterCode?: string;
  };
  studentQuestion?: string;
}
