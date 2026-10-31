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
  const match = /^#\/([^/]+)\/?$/.exec(hash.trim());
  if (!match?.[1]) return null;
  return PAGE_IDS.find((page) => page === match[1]) ?? null;
}

export function hashForPage(page: PageId): string {
  return `#/${page}`;
}
