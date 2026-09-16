export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'sample_output'
  | 'exercise'
  | 'text_box'
  | 'quiz'
  | 'table'
  | 'image'
  | 'list'
  | 'sample_data'
  | 'custom_component';

export interface BlockContent {
  language: string;
  content: string;
}

export interface BlockMetadata {
  variant?: string;
  name_original?: string;
  name_vi?: string;
  level?: number;
  lang?: string;
  raw_source?: string;
  src?: string;
  alt?: string;
  exercise_id?: string;
  exercise_type?: string;
  name?: string;
  tmc_name?: string;
  height?: string;
  quiz_id?: string;
  component_name?: string;
  attributes?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface LessonBlock {
  id: string;
  type: BlockType;
  order: number;
  source_hash: string;
  translation_status: 'translated' | 'not_applicable' | 'pending';
  original: BlockContent;
  translation: BlockContent;
  metadata?: BlockMetadata;
}

export interface LessonSummary {
  id: string;
  slug: string;
  is_index: boolean;
  title_original: string;
  title_vi: string;
  path: string;
  blocks_count: number;
  order?: number;
}

export interface Lesson {
  id: string;
  part: number;
  part_slug: string;
  slug: string;
  is_part_index: boolean;
  title_original: string;
  title_vi: string;
  path: string;
  source_path: string;
  source_hash: string;
  order: number;
  blocks_count: number;
  blocks: LessonBlock[];
}

export interface CoursePartSummary {
  part: number;
  slug: string;
  title_original: string;
  title_vi: string;
  lessons_count: number;
}

export interface CoursePart {
  part: number;
  slug: string;
  title_original: string;
  title_vi: string;
  lessons: LessonSummary[];
}

export interface ExerciseTest {
  id: string;
  name: string;
  input?: string;
  expected_output?: string;
  hidden?: boolean;
}

export interface Exercise {
  id: string;
  lesson_id: string;
  part: number;
  tmc_name: string;
  title_original: string;
  title_vi: string;
  exercise_type: 'in-browser-programming-exercise' | 'programming-exercise' | string;
  height?: string;
  description_original: string;
  description_vi: string;
  starter_code?: string | null;
  solution_code?: string | null;
  tests?: ExerciseTest[];
  grading_data_available: boolean;
  source_hash: string;
  order: number;
}

export interface Course {
  id: string;
  slug: string;
  name_en: string;
  name_vi: string;
  organization: string;
  department: string;
  platform: string;
  source_repository: string;
  source_commit: string;
  source_license: {
    material_template: string;
    course_material: string;
  };
  imported_at: string;
  total_parts: number;
  total_lessons: number;
  total_exercises: number;
  parts: CoursePartSummary[];
}

export interface Asset {
  filename: string;
  path: string;
  part?: number;
  type: 'image' | 'diagram';
}
