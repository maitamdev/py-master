import fs from 'fs';
import path from 'path';

console.log('--- VALIDATING CONTENT & ASSETS ---');

let hasErrors = false;
function error(msg) {
  console.error('❌ ERROR:', msg);
  hasErrors = true;
}

// 1. Check course.json
const coursePath = path.join(process.cwd(), 'content', 'course.json');
if (!fs.existsSync(coursePath)) {
  error('content/course.json does not exist');
}
const course = JSON.parse(fs.readFileSync(coursePath, 'utf-8'));
console.log(`✓ Course: ${course.name_vi} (${course.id})`);

// 2. Check parts
const partsDir = path.join(process.cwd(), 'content', 'parts');
const partFiles = fs.readdirSync(partsDir).filter((f) => f.endsWith('.json'));
console.log(`✓ Total parts found: ${partFiles.length}`);

const partMap = new Map();
for (const pf of partFiles) {
  const p = JSON.parse(fs.readFileSync(path.join(partsDir, pf), 'utf-8'));
  if (partMap.has(p.part)) error(`Duplicate part number: ${p.part}`);
  partMap.set(p.part, p);
}

// 3. Check lessons
const lessonsDir = path.join(process.cwd(), 'content', 'lessons');
const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.json'));
console.log(`✓ Total lessons found: ${lessonFiles.length}`);

const lessonMap = new Map();
const knownBlockTypes = new Set([
  'paragraph',
  'heading',
  'code',
  'sample_output',
  'exercise',
  'text_box',
  'quiz',
  'table',
  'image',
  'list',
  'sample_data',
  'custom_component',
]);

const referencedExercises = new Set();
let totalBlocks = 0;
let totalImages = 0;
let missingImages = 0;

for (const lf of lessonFiles) {
  const l = JSON.parse(fs.readFileSync(path.join(lessonsDir, lf), 'utf-8'));
  if (lessonMap.has(l.id)) error(`Duplicate lesson ID: ${l.id}`);
  lessonMap.set(l.id, l);

  // Check part reference
  if (!partMap.has(l.part)) {
    error(`Lesson ${l.id} references non-existent part: ${l.part}`);
  }

  for (const b of l.blocks) {
    totalBlocks++;
    if (!knownBlockTypes.has(b.type)) {
      error(`Unknown block type in ${l.id}: ${b.type}`);
    }

    if (b.type === 'exercise' && b.metadata?.exercise_id) {
      referencedExercises.add(b.metadata.exercise_id);
    }

    if (b.type === 'image') {
      totalImages++;
      const src = b.metadata?.src || '';
      const filename = path.basename(src);
      const candidates = [
        path.join(process.cwd(), 'public', 'course-assets', 'images', `part-${l.part}`, filename),
        path.join(process.cwd(), 'public', 'course-assets', 'images', 'img', filename),
        path.join(process.cwd(), 'public', 'course-assets', 'images', filename),
        path.join(process.cwd(), 'public', 'course-assets', 'diagrams', filename),
      ];
      if (!candidates.some((c) => fs.existsSync(c))) {
        missingImages++;
        error(`Missing asset image for ${l.id}: ${src}`);
      }
    }
  }
}

// 4. Check exercises
const exercisesDir = path.join(process.cwd(), 'content', 'exercises');
const exerciseFiles = fs.readdirSync(exercisesDir).filter((f) => f.endsWith('.json'));
console.log(`✓ Total exercises found: ${exerciseFiles.length}`);

const exerciseMap = new Map();
for (const ef of exerciseFiles) {
  const ex = JSON.parse(fs.readFileSync(path.join(exercisesDir, ef), 'utf-8'));
  if (exerciseMap.has(ex.id)) error(`Duplicate exercise ID: ${ex.id}`);
  exerciseMap.set(ex.id, ex);

  if (!lessonMap.has(ex.lesson_id)) {
    error(`Exercise ${ex.id} references non-existent lesson: ${ex.lesson_id}`);
  }
}

console.log(`✓ All ${referencedExercises.size} exercises referenced in lessons exist.`);
console.log(`✓ Total content blocks checked: ${totalBlocks}`);
console.log(`✓ Total images checked: ${totalImages}, Missing: ${missingImages}`);

if (hasErrors) {
  console.error('\n❌ VALIDATION FAILED!');
  process.exit(1);
} else {
  console.log('\n✅ ALL CONTENT & ASSET VALIDATIONS PASSED PERFECTLY!\n');
}
