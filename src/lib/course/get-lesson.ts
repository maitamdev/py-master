import fs from 'fs';
import path from 'path';
import type { Lesson } from '@/types';
import { getAllLessons } from './get-lessons';

export interface LessonWithNavigation {
  lesson: Lesson;
  prevLesson: { id: string; slug: string; title: string } | null;
  nextLesson: { id: string; slug: string; title: string } | null;
}

export async function getLesson(idOrSlug: string): Promise<Lesson | null> {
  const allLessons = await getAllLessons();

  // 1. Match by exact ID
  const byId = allLessons.find((l) => l.id === idOrSlug);
  if (byId) return byId;

  // 2. Match by slug (ignore 'part0X-' prefix if present or match clean slug)
  const bySlug = allLessons.find(
    (l) =>
      l.slug === idOrSlug ||
      l.id.endsWith(`-${idOrSlug}`) ||
      l.path.endsWith(`/${idOrSlug}`)
  );
  if (bySlug) return bySlug;

  // 3. Fallback direct file check
  const directPath = path.join(process.cwd(), 'content', 'lessons', `${idOrSlug}.json`);
  if (fs.existsSync(directPath)) {
    const content = fs.readFileSync(directPath, 'utf-8');
    return JSON.parse(content) as Lesson;
  }

  return null;
}

export async function getLessonWithNavigation(idOrSlug: string): Promise<LessonWithNavigation | null> {
  const lesson = await getLesson(idOrSlug);
  if (!lesson) return null;

  const allLessons = await getAllLessons();
  const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);

  const prev = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return {
    lesson,
    prevLesson: prev ? { id: prev.id, slug: prev.id, title: prev.title_vi || prev.title_original } : null,
    nextLesson: next ? { id: next.id, slug: next.id, title: next.title_vi || next.title_original } : null,
  };
}
