import fs from 'fs';
import path from 'path';
import type { Exercise } from '@/types';
import { getAllExercises } from './get-exercises';
import { extractTestsFromDescription } from './extract-tests';

/**
 * After loading an exercise, auto-generate test cases from <sample-output>
 * blocks in the description if the exercise doesn't already have tests.
 */
function enrichWithTests(exercise: Exercise): Exercise {
  if (exercise.tests && exercise.tests.length > 0) {
    return exercise;
  }

  // Try extracting from original description (more reliable formatting)
  let tests = extractTestsFromDescription(exercise.description_original || '');

  // Fallback to Vietnamese description
  if (tests.length === 0 && exercise.description_vi) {
    tests = extractTestsFromDescription(exercise.description_vi);
  }

  return {
    ...exercise,
    tests: tests.length > 0 ? tests : undefined,
  };
}

export async function getExercise(exerciseId: string): Promise<Exercise | null> {
  const all = await getAllExercises();

  // 1. Direct match by id
  const byId = all.find((e) => e.id === exerciseId);
  if (byId) return enrichWithTests(byId);

  // 2. Match by tmc_name
  const byTmc = all.find((e) => e.tmc_name === exerciseId);
  if (byTmc) return enrichWithTests(byTmc);

  // 3. Fallback: match if ID contains exerciseId
  const byPartial = all.find((e) => e.id.endsWith(exerciseId) || e.tmc_name?.endsWith(exerciseId));
  if (byPartial) return enrichWithTests(byPartial);

  // 4. Check filesystem
  const directPath = path.join(process.cwd(), 'content', 'exercises', `${exerciseId}.json`);
  if (fs.existsSync(directPath)) {
    const content = fs.readFileSync(directPath, 'utf-8');
    const exercise = JSON.parse(content) as Exercise;
    return enrichWithTests(exercise);
  }

  return null;
}

