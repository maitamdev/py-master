import fs from 'fs';
import path from 'path';
import type { CoursePart } from '@/types';

let cachedParts: CoursePart[] | null = null;

export async function getParts(): Promise<CoursePart[]> {
  if (cachedParts) {
    return cachedParts;
  }

  const partsDir = path.join(process.cwd(), 'content', 'parts');
  const files = fs.readdirSync(partsDir).filter((f) => f.endsWith('.json'));

  const parts: CoursePart[] = files.map((file) => {
    const filePath = path.join(partsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as CoursePart;
  });

  parts.sort((a, b) => a.part - b.part);
  cachedParts = parts;
  return parts;
}
