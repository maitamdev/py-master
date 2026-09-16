import fs from 'fs';
import path from 'path';
import type { Lesson } from '@/types';

let cachedLessonsList: Lesson[] | null = null;

export async function getAllLessons(): Promise<Lesson[]> {
  if (cachedLessonsList) {
    return cachedLessonsList;
  }

  const lessonsDir = path.join(process.cwd(), 'content', 'lessons');
  const files = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.json'));

  const lessons: Lesson[] = [];

  for (const file of files) {
    const filePath = path.join(lessonsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lesson = JSON.parse(content) as Lesson;
    lessons.push(lesson);
  }

  // Sort by part then order
  lessons.sort((a, b) => {
    if (a.part !== b.part) return a.part - b.part;
    return a.order - b.order;
  });

  cachedLessonsList = lessons;
  return lessons;
}

export async function getLessonsByPart(partNum: number | string): Promise<Lesson[]> {
  const pNum = typeof partNum === 'number' ? partNum : parseInt(String(partNum).replace('part-', ''), 10);
  const all = await getAllLessons();
  return all.filter((l) => l.part === pNum);
}
