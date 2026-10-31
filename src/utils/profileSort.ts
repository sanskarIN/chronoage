import type { SavedProfile } from '../types/models';

export type ProfileSort = 'recent' | 'name-asc' | 'name-desc' | 'birth-asc' | 'birth-desc';

const nameCollator = new Intl.Collator('en', { sensitivity: 'base', numeric: true });

function compareNames(left: SavedProfile, right: SavedProfile): number {
  return nameCollator.compare(left.name, right.name) || left.birthDate.localeCompare(right.birthDate) || left.id.localeCompare(right.id);
}

function compareBirthDates(left: SavedProfile, right: SavedProfile): number {
  return left.birthDate.localeCompare(right.birthDate) || compareNames(left, right);
}

export function sortProfiles(profiles: readonly SavedProfile[], sort: ProfileSort): SavedProfile[] {
  const next = [...profiles];
  switch (sort) {
    case 'name-asc':
      return next.sort(compareNames);
    case 'name-desc':
      return next.sort((left, right) => compareNames(right, left));
    case 'birth-asc':
      return next.sort(compareBirthDates);
    case 'birth-desc':
      return next.sort((left, right) => compareBirthDates(right, left));
    case 'recent':
      return next;
  }
}
