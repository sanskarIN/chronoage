import { describe, expect, it } from 'vitest';
import type { SavedProfile } from '../src/types/models';
import { sortProfiles } from '../src/utils/profileSort';

const timestamp = '2026-08-19T00:00:00.000Z';

const profiles: SavedProfile[] = [
  { id: '3', name: 'Charlie', birthDate: '2002-03-01', createdAt: timestamp, updatedAt: timestamp },
  { id: '2', name: 'alice', birthDate: '1999-01-01', createdAt: timestamp, updatedAt: timestamp },
  { id: '1', name: 'Bob', birthDate: '2005-05-01', createdAt: timestamp, updatedAt: timestamp },
];

describe('sortProfiles', () => {
  it('preserves storage order for recently saved sorting', () => {
    expect(sortProfiles(profiles, 'recent').map((profile) => profile.name)).toEqual([
      'Charlie',
      'alice',
      'Bob',
    ]);
  });

  it('sorts names in both directions without mutating the source list', () => {
    expect(sortProfiles(profiles, 'name-asc').map((profile) => profile.name)).toEqual([
      'alice',
      'Bob',
      'Charlie',
    ]);
    expect(sortProfiles(profiles, 'name-desc').map((profile) => profile.name)).toEqual([
      'Charlie',
      'Bob',
      'alice',
    ]);
    expect(profiles.map((profile) => profile.name)).toEqual(['Charlie', 'alice', 'Bob']);
  });

  it('sorts ISO birth dates chronologically in both directions', () => {
    expect(sortProfiles(profiles, 'birth-asc').map((profile) => profile.birthDate)).toEqual([
      '1999-01-01',
      '2002-03-01',
      '2005-05-01',
    ]);
    expect(sortProfiles(profiles, 'birth-desc').map((profile) => profile.birthDate)).toEqual([
      '2005-05-01',
      '2002-03-01',
      '1999-01-01',
    ]);
  });
});
