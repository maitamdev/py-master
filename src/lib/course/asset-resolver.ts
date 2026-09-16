import assetList from './asset-list.json';

const assetSet = new Set(assetList);

/**
 * Resolves a course asset source (image/diagram) to a valid public URL
 * @param src The source string from markdown/JSON (e.g. "1_4_1.png", "../../assets/images/1_4_1.png")
 * @param part Optional course part number (1-14)
 */
export function resolveAssetUrl(src?: string, part?: number): string {
  if (!src) return '/placeholder.png';

  // If already absolute or URL
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/course-assets/')) {
    return src;
  }

  // Extract pure filename
  const cleanSrc = src.replace(/\\/g, '/');
  const filename = cleanSrc.split('/').pop() || cleanSrc;

  // 1. If part provided, test part-specific path first
  if (part) {
    const partPath = `/course-assets/images/part-${part}/${filename}`;
    if (assetSet.has(partPath)) {
      return partPath;
    }
  }

  // 2. Common image directories
  const candidates = [
    `/course-assets/images/${filename}`,
    `/course-assets/images/img/${filename}`,
    `/course-assets/diagrams/${filename}`,
    `/course-assets/diagrams/img/${filename}`,
  ];

  for (const c of candidates) {
    if (assetSet.has(c)) {
      return c;
    }
  }

  // 3. Search in full assetList by filename
  const matched = assetList.find((p) => p.endsWith('/' + filename));
  if (matched) {
    return matched;
  }

  // 4. Fallback
  return part ? `/course-assets/images/part-${part}/${filename}` : `/course-assets/images/${filename}`;
}
