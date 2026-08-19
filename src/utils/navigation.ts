export const PAGE_IDS = [
  'calculate',
  'difference',
  'interval',
  'milestones',
  'profiles',
  'settings',
  'about',
] as const;

export type PageId = (typeof PAGE_IDS)[number];

export function pageFromHash(hash: string): PageId | null {
  const normalized = hash.trim().replace(/^#\/?/, '').replace(/\/$/, '');
  return PAGE_IDS.find((page) => page === normalized) ?? null;
}

export function hashForPage(page: PageId): string {
  return `#/${page}`;
}
