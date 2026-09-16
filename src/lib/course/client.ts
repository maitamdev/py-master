/**
 * Client-safe exports from course library.
 * Import this from client components instead of '@/lib/course' to avoid
 * pulling in Node.js 'fs' module which breaks browser bundles.
 */
export { resolveAssetUrl } from './asset-resolver';
export type { SearchResultItem } from './search-course';
