import fs from 'fs';
import path from 'path';
import type { Course } from '@/types';

let cachedCourse: Course | null = null;

export async function getCourse(): Promise<Course> {
  if (cachedCourse) {
    return cachedCourse;
  }

  const filePath = path.join(process.cwd(), 'content', 'course.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const course: Course = JSON.parse(fileContent);

  // Ensure parts are sorted logically by part number
  course.parts.sort((a, b) => a.part - b.part);

  cachedCourse = course;
  return course;
}
