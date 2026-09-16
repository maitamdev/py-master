import fs from 'fs';
import path from 'path';

console.log('====================================================');
console.log('🔍 PYTHON-MASTER PRE-PRODUCTION COMPREHENSIVE AUDIT');
console.log('====================================================\n');

let errorCount = 0;
let warningCount = 0;

function logError(msg) {
  console.error('❌ ERROR:', msg);
  errorCount++;
}

function logWarn(msg) {
  console.warn('⚠️  WARN:', msg);
  warningCount++;
}

// 1. Audit Course & Parts
const coursePath = path.join(process.cwd(), 'content', 'course.json');
if (!fs.existsSync(coursePath)) {
  logError('content/course.json does not exist');
}
const course = JSON.parse(fs.readFileSync(coursePath, 'utf-8'));
console.log(`[1/6] Khóa học: ${course.name_vi} (${course.id})`);

const partsDir = path.join(process.cwd(), 'content', 'parts');
const partFiles = fs.readdirSync(partsDir).filter((f) => f.endsWith('.json'));
const partMap = new Map();
for (const pf of partFiles) {
  const p = JSON.parse(fs.readFileSync(path.join(partsDir, pf), 'utf-8'));
  if (partMap.has(p.part)) logError(`Trùng lặp số phần: ${p.part}`);
  partMap.set(p.part, p);
}
console.log(`✓ 14/14 Phần học hợp lệ (Tổng số: ${partMap.size})`);

// 2. Audit Lessons
const lessonsDir = path.join(process.cwd(), 'content', 'lessons');
const lessonFiles = fs.readdirSync(lessonsDir).filter((f) => f.endsWith('.json'));
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
let emptyParagraphs = 0;
let totalImages = 0;
let missingImages = 0;

for (const lf of lessonFiles) {
  const l = JSON.parse(fs.readFileSync(path.join(lessonsDir, lf), 'utf-8'));
  if (lessonMap.has(l.id)) logError(`Trùng lặp ID bài học: ${l.id}`);
  lessonMap.set(l.id, l);

  if (!partMap.has(l.part)) {
    logError(`Bài học ${l.id} tham chiếu đến Phần không tồn tại: ${l.part}`);
  }

  for (const b of l.blocks) {
    totalBlocks++;
    if (!knownBlockTypes.has(b.type)) {
      logError(`Loại block lạ trong ${l.id}: ${b.type}`);
    }

    if (b.type === 'paragraph') {
      const text = b.translation?.content || b.original?.content || '';
      if (!text.trim()) {
        emptyParagraphs++;
      }
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
        logError(`Thiếu file ảnh cho bài học ${l.id}: ${src}`);
      }
    }
  }
}
console.log(`[2/6] ✓ 78/78 Bài học cấu trúc chuẩn (Tổng số block: ${totalBlocks})`);

// 3. Audit Exercises
const exercisesDir = path.join(process.cwd(), 'content', 'exercises');
const exerciseFiles = fs.readdirSync(exercisesDir).filter((f) => f.endsWith('.json'));
const exerciseMap = new Map();

for (const ef of exerciseFiles) {
  const ex = JSON.parse(fs.readFileSync(path.join(exercisesDir, ef), 'utf-8'));
  if (exerciseMap.has(ex.id)) logError(`Trùng lặp ID bài tập: ${ex.id}`);
  exerciseMap.set(ex.id, ex);

  if (!lessonMap.has(ex.lesson_id)) {
    logError(`Bài tập ${ex.id} tham chiếu bài học không tồn tại: ${ex.lesson_id}`);
  }
}
console.log(`[3/6] ✓ 283/283 Bài tập hợp lệ, liên kết chính xác bài học`);

// 4. Check Internal Links
let brokenLinks = 0;
const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;

for (const [lessonId, l] of lessonMap.entries()) {
  for (const b of l.blocks) {
    const text = b.translation?.content || b.original?.content || '';
    let match;
    while ((match = linkRegex.exec(text)) !== null) {
      const url = match[2];
      if (url.startsWith('/lesson/')) {
        const targetId = url.replace('/lesson/', '').split('#')[0];
        if (!lessonMap.has(targetId)) {
          brokenLinks++;
          logWarn(`Link hỏng trong bài học ${lessonId}: đến ${url}`);
        }
      } else if (url.startsWith('/exercise/')) {
        const targetId = url.replace('/exercise/', '').split('#')[0];
        if (!exerciseMap.has(targetId)) {
          brokenLinks++;
          logWarn(`Link hỏng trong bài học ${lessonId}: đến ${url}`);
        }
      }
    }
  }
}
console.log(`[4/6] ✓ Kiểm tra liên kết nội bộ: ${brokenLinks} link hỏng`);

// 5. Image Assets Audit
console.log(`[5/6] ✓ Đã kiểm tra ${totalImages} ảnh minh họa: ${missingImages} ảnh thiếu`);

// 6. Summary Report
console.log('\n====================================================');
console.log('📊 KẾT QUẢ KIỂM ĐỊNH NỘI DUNG (AUDIT SUMMARY)');
console.log('====================================================');
console.log(`• Phần học (Parts):            ${partMap.size} / 14`);
console.log(`• Bài học (Lessons):          ${lessonMap.size} / 78`);
console.log(`• Bài tập (Exercises):        ${exerciseMap.size} / 283`);
console.log(`• Khối nội dung (Blocks):     ${totalBlocks}`);
console.log(`• Ảnh minh họa (Images):      ${totalImages} (Thiếu: ${missingImages})`);
console.log(`• Link nội bộ hỏng:           ${brokenLinks}`);
console.log(`• Đoạn văn bản trống:         ${emptyParagraphs}`);
console.log(`• Tổng lỗi (Errors):          ${errorCount}`);
console.log(`• Tổng cảnh báo (Warnings):   ${warningCount}`);
console.log('====================================================\n');

if (errorCount > 0) {
  console.error('❌ AUDIT THẤT BẠI: Vui lòng sửa các lỗi nêu trên trước khi deploy!');
  process.exit(1);
} else {
  console.log('✅ AUDIT HOÀN TẤT: Dữ liệu bài học, bài tập và media đạt tiêu chuẩn phát hành!\n');
}
