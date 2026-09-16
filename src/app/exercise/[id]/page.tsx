import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllExercises, getExercise } from '@/lib/course';
import { ExerciseIDE } from '@/features/exercise/exercise-ide';

export async function generateStaticParams() {
  const exercises = await getAllExercises();
  return exercises.map((e) => ({
    id: e.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const exercise = await getExercise(id);
  if (!exercise) return { title: 'Không tìm thấy bài tập' };

  return {
    title: `Bài tập: ${exercise.title_vi || exercise.title_original} | Phần ${exercise.part}`,
    description: `Thực hành bài tập Python "${exercise.title_vi}" với trình biên dịch trực tiếp trên trình duyệt.`,
  };
}

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exercise = await getExercise(id);

  if (!exercise) {
    notFound();
  }

  return <ExerciseIDE exercise={exercise} />;
}
