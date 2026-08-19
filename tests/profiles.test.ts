import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearProfiles,
  exportProfiles,
  importProfiles,
  loadProfiles,
  MAX_BACKUP_FILE_BYTES,
  saveProfile,
  updateProfile,
} from '../src/storage/profiles';

const STORAGE_KEY = 'chronoage.profiles.v1';

describe('local profiles', () => {
  beforeEach(() => clearProfiles());

  it('saves profiles locally', () => {
    saveProfile({ name: ' Test User ', birthDate: '2000-01-01' });
    expect(loadProfiles()).toHaveLength(1);
    expect(loadProfiles()[0]?.name).toBe('Test User');
  });

  it('updates an existing profile without changing its identity', () => {
    const original = saveProfile({ name: 'Before', birthDate: '2000-01-01' });
    const updated = updateProfile(original.id, { name: ' After ', birthDate: '2001-02-03' });

    expect(updated.id).toBe(original.id);
    expect(updated.name).toBe('After');
    expect(updated.birthDate).toBe('2001-02-03');
    expect(updated.createdAt).toBe(original.createdAt);
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(original.updatedAt).getTime(),
    );
    expect(loadProfiles()).toEqual([updated]);
  });

  it('rejects updates for missing profiles', () => {
    expect(() => updateProfile('missing', { name: 'Example', birthDate: '2001-02-03' })).toThrow(
      'Profile not found.',
    );
  });

  it('round-trips backup data', () => {
    saveProfile({ name: 'Example', birthDate: '2001-02-03' });
    const backup = exportProfiles();
    clearProfiles();
    expect(importProfiles(backup)).toHaveLength(1);
  });

  it('rejects malformed backup JSON with a stable user-safe error', () => {
    expect(() => importProfiles('{"schemaVersion":1,"profiles":[')).toThrow('Invalid backup file.');
    expect(loadProfiles()).toEqual([]);
  });

  it('rejects invalid backup data', () => {
    expect(() => importProfiles('{"schemaVersion":9,"profiles":[]}')).toThrow(
      'Unsupported backup format',
    );
  });

  it('rejects backups larger than the configured preflight limit', () => {
    expect(() => importProfiles('x'.repeat(MAX_BACKUP_FILE_BYTES + 1))).toThrow(
      'Backup file is too large.',
    );
  });

  it('measures the backup limit in UTF-8 bytes rather than JavaScript characters', () => {
    const multibyteText = 'é'.repeat(Math.floor(MAX_BACKUP_FILE_BYTES / 2) + 1);
    expect(multibyteText.length).toBeLessThan(MAX_BACKUP_FILE_BYTES);
    expect(() => importProfiles(multibyteText)).toThrow('Backup file is too large.');
  });

  it('rejects duplicate ids during import', () => {
    const timestamp = '2026-08-19T00:00:00.000Z';
    const backup = JSON.stringify({
      schemaVersion: 1,
      profiles: [
        {
          id: 'same-id',
          name: 'One',
          birthDate: '2000-01-01',
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        {
          id: 'same-id',
          name: 'Two',
          birthDate: '2001-01-01',
          createdAt: timestamp,
          updatedAt: timestamp,
        },
      ],
    });

    expect(() => importProfiles(backup)).toThrow('Backup contains an invalid profile.');
    expect(loadProfiles()).toEqual([]);
  });

  it('ignores corrupted local entries while keeping valid profiles', () => {
    const timestamp = '2026-08-19T00:00:00.000Z';
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: 1,
        profiles: [
          {
            id: 'valid-id',
            name: 'Valid',
            birthDate: '2000-01-01',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
          {
            id: 'invalid-id',
            name: 'Invalid',
            birthDate: 'not-a-date',
            createdAt: timestamp,
            updatedAt: timestamp,
          },
        ],
      }),
    );

    expect(loadProfiles()).toEqual([
      {
        id: 'valid-id',
        name: 'Valid',
        birthDate: '2000-01-01',
        createdAt: timestamp,
        updatedAt: timestamp,
      },
    ]);
  });

  it('rejects malformed timestamps in imported profiles', () => {
    const backup = JSON.stringify({
      schemaVersion: 1,
      profiles: [
        {
          id: 'profile-id',
          name: 'Example',
          birthDate: '2000-01-01',
          createdAt: 'not-a-timestamp',
          updatedAt: 'not-a-timestamp',
        },
      ],
    });

    expect(() => importProfiles(backup)).toThrow('Backup contains an invalid profile.');
  });
});
