import { getParts } from './get-parts';
import { getAllLessons } from './get-lessons';
import { getAllExercises } from './get-exercises';

export interface SearchResultItem {
  id: string;
  type: 'part' | 'lesson' | 'exercise' | 'content';
  title: string;
  part: number;
  path: string;
  snippet?: string;
  badge: string;
}

interface SearchIndexEntry {
  id: string;
  type: 'part' | 'lesson' | 'exercise' | 'content';
  title: string;
  part: number;
  path: string;
  snippet?: string;
  badge: string;
  searchableText: string;
}

let searchIndex: SearchIndexEntry[] | null = null;

export async function buildSearchIndex(): Promise<SearchIndexEntry[]> {
  if (searchIndex) return searchIndex;

  const [parts, lessons, exercises] = await Promise.all([
    getParts(),
    getAllLessons(),
    getAllExercises(),
  ]);

  const index: SearchIndexEntry[] = [];

  // 1. Index parts
  for (const part of parts) {
    index.push({
      id: `part-${part.part}`,
      type: 'part',
      title: `Phần ${part.part}: ${part.title_vi}`,
      part: part.part,
      path: `/course/part-${part.part}`,
      badge: `Phần ${part.part}`,
      searchableText: `${part.part} part ${part.title_original} ${part.title_vi}`.toLowerCase(),
    });
  }

  // 2. Index lessons
  for (const lesson of lessons) {
    index.push({
      id: lesson.id,
      type: 'lesson',
      title: lesson.title_vi || lesson.title_original,
      part: lesson.part,
      path: `/lesson/${lesson.id}`,
      badge: `Bài học • Phần ${lesson.part}`,
      snippet: `Bài học ${lesson.order}: ${lesson.title_vi}`,
      searchableText: `${lesson.title_original} ${lesson.title_vi} ${lesson.slug}`.toLowerCase(),
    });

    // 3. Index headings and major paragraphs inside lessons
    for (const block of lesson.blocks) {
      if (block.type === 'heading' && block.translation?.content) {
        index.push({
          id: block.id,
          type: 'content',
          title: block.translation.content,
          part: lesson.part,
          path: `/lesson/${lesson.id}#${block.id}`,
          badge: `Mục • ${lesson.title_vi}`,
          snippet: `Trong bài ${lesson.title_vi}`,
          searchableText: `${block.translation.content} ${block.original?.content || ''}`.toLowerCase(),
        });
      }
    }
  }

  // 4. Index exercises
  for (const ex of exercises) {
    index.push({
      id: ex.id,
      type: 'exercise',
      title: ex.title_vi || ex.title_original,
      part: ex.part,
      path: `/exercise/${ex.id}`,
      badge: `Bài tập • Phần ${ex.part}`,
      snippet: (ex.description_vi || ex.description_original || '').slice(0, 120) + '...',
      searchableText: `${ex.title_original} ${ex.title_vi} ${ex.tmc_name} ${ex.description_vi || ''}`.toLowerCase(),
    });
  }

  searchIndex = index;
  return index;
}

export async function searchCourse(query: string, limit: number = 20): Promise<SearchResultItem[]> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return [];

  const index = await buildSearchIndex();
  const tokens = cleanQuery.split(/\s+/).filter(Boolean);

  const matched: { item: SearchIndexEntry; score: number }[] = [];

  for (const entry of index) {
    let score = 0;
    const text = entry.searchableText;
    const titleLower = entry.title.toLowerCase();

    // Exact title match gets highest score
    if (titleLower.includes(cleanQuery)) {
      score += 50;
    }

    // Token matches
    let allTokensMatch = true;
    for (const token of tokens) {
      if (text.includes(token)) {
        score += 10;
      } else {
        allTokensMatch = false;
      }
    }

    if (allTokensMatch || score > 0) {
      // Prioritize parts and lessons
      if (entry.type === 'part') score += 15;
      if (entry.type === 'lesson') score += 10;
      if (entry.type === 'exercise') score += 5;

      matched.push({ item: entry, score });
    }
  }

  matched.sort((a, b) => b.score - a.score);

  return matched.slice(0, limit).map((m) => ({
    id: m.item.id,
    type: m.item.type,
    title: m.item.title,
    part: m.item.part,
    path: m.item.path,
    snippet: m.item.snippet,
    badge: m.item.badge,
  }));
}
