import fs from 'fs';
import path from 'path';
import type { Exercise } from '@/types';

let cachedExercisesList: Exercise[] | null = null;

export async function getAllExercises(): Promise<Exercise[]> {
  if (cachedExercisesList) {
    return cachedExercisesList;
  }

  const exercisesDir = path.join(process.cwd(), 'content', 'exercises');
  const files = fs.readdirSync(exercisesDir).filter((f) => f.endsWith('.json'));

  const exercises: Exercise[] = [];
  const map = new Map<string, Exercise>();

  for (const file of files) {
    const filePath = path.join(exercisesDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const exercise = JSON.parse(content) as Exercise;
    exercises.push(exercise);
    map.set(exercise.id, exercise);
    if (exercise.tmc_name) {
      map.set(exercise.tmc_name, exercise);
    }
  }

  exercises.sort((a, b) => {
    if (a.part !== b.part) return a.part - b.part;
    return a.order - b.order;
  });

  cachedExercisesList = exercises;
  return exercises;
}

export async function getExercisesByLesson(lessonId: string): Promise<Exercise[]> {
  const all = await getAllExercises();
  return all.filter((e) => e.lesson_id === lessonId);
}

export async function getExercisesByPart(partNum: number): Promise<Exercise[]> {
  const all = await getAllExercises();
  return all.filter((e) => e.part === partNum);
}
