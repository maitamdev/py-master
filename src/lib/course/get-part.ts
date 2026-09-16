import fs from 'fs';
import path from 'path';
import type { CoursePart } from '@/types';
import { getParts } from './get-parts';

export async function getPart(partIdOrSlug: string | number): Promise<CoursePart | null> {
  const parts = await getParts();

  let partNum: number;
  if (typeof partIdOrSlug === 'number') {
    partNum = partIdOrSlug;
  } else {
    const parsed = parseInt(partIdOrSlug.replace('part-', ''), 10);
    partNum = isNaN(parsed) ? -1 : parsed;
  }

  const found = parts.find((p) => p.part === partNum || p.slug === String(partIdOrSlug));
  if (found) return found;

  // Direct file check fallback
  const directFile = path.join(process.cwd(), 'content', 'parts', `part-${partNum}.json`);
  if (fs.existsSync(directFile)) {
    const content = fs.readFileSync(directFile, 'utf-8');
    return JSON.parse(content) as CoursePart;
  }

  return null;
}
