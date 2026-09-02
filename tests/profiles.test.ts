import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearProfiles,
  CURRENT_BACKUP_SCHEMA_VERSION,
  deleteProfile,
  exportProfiles,
  importProfiles,
  loadProfiles,
  MAX_BACKUP_FILE_BYTES,
  restoreProfile,
  saveProfile,
  updateProfile,
} from '../src/storage/profiles';

const STORAGE_KEY = 'chronoage.profiles.v1';

describe('local profiles', () => {
  beforeEach(() => clearProfiles());

  afterEach(() => {
    vi.restoreAllMocks();
  });

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

  it('rejects deletion for missing profiles without rewriting storage', () => {
    const existing = saveProfile({ name: 'Existing', birthDate: '2000-01-01' });
    const before = localStorage.getItem(STORAGE_KEY);

    expect(() => deleteProfile('missing')).toThrow('Profile not found.');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
    expect(loadProfiles()).toEqual([existing]);
  });

  it('restores a removed profile without changing its identity or timestamps', () => {
    const original = saveProfile({ name: 'Recover me', birthDate: '2000-01-01' });
    clearProfiles();

    expect(restoreProfile(original)).toEqual([original]);
    expect(loadProfiles()).toEqual([original]);
  });

  it('restores a profile at its original list position', () => {
    const first = saveProfile({ name: 'First', birthDate: '2000-01-01' });
    const second = saveProfile({ name: 'Second', birthDate: '2001-01-01' });
    const third = saveProfile({ name: 'Third', birthDate: '2002-01-01' });
    expect(loadProfiles()).toEqual([third, second, first]);

    deleteProfile(second.id);
    expect(restoreProfile(second, 1)).toEqual([third, second, first]);
    expect(loadProfiles()).toEqual([third, second, first]);
  });

  it('rejects restoring a profile whose identity already exists', () => {
    const original = saveProfile({ name: 'Existing', birthDate: '2000-01-01' });

    expect(() => restoreProfile(original)).toThrow('Profile already exists.');
    expect(loadProfiles()).toEqual([original]);
  });

  it('round-trips backup data', () => {
    saveProfile({ name: 'Example', birthDate: '2001-02-03' });
    const backup = exportProfiles();
    clearProfiles();
    expect(importProfiles(backup)).toHaveLength(1);
  });

  it('exports the current backup schema and timestamp metadata', () => {
    saveProfile({ name: 'Example', birthDate: '2001-02-03' });
    const exported = JSON.parse(exportProfiles()) as Record<string, unknown>;

    expect(exported.schemaVersion).toBe(CURRENT_BACKUP_SCHEMA_VERSION);
    expect(typeof exported.exportedAt).toBe('string');
    expect(new Date(exported.exportedAt as string).toISOString()).toBe(exported.exportedAt);
    expect(exported.profiles).toHaveLength(1);
  });

  it('rejects malformed backup JSON with a stable user-safe error', () => {
    expect(() => importProfiles('{"schemaVersion":1,"profiles":[')).toThrow('Invalid backup file.');
    expect(loadProfiles()).toEqual([]);
  });

  it('rejects unsupported future backup schemas', () => {
    expect(() => importProfiles('{"schemaVersion":2,"profiles":[]}')).toThrow(
      'Unsupported backup format',
    );
    expect(loadProfiles()).toEqual([]);
  });

  it('rejects invalid backup data', () => {
    expect(() => importProfiles('{"schemaVersion":9,"profiles":[]}')).toThrow(
      'Unsupported backup format',
    );
  });

  it('keeps existing profiles unchanged when an imported backup is invalid', () => {
    const existing = saveProfile({ name: 'Keep me', birthDate: '2000-01-01' });
    const before = localStorage.getItem(STORAGE_KEY);

    const invalidBackup = JSON.stringify({
      schemaVersion: 1,
      profiles: [
        {
          id: 'valid-id',
          name: 'Imported',
          birthDate: '2001-01-01',
          createdAt: '2026-08-19T00:00:00.000Z',
          updatedAt: '2026-08-19T00:00:00.000Z',
        },
        {
          id: 'broken-id',
          name: 'Broken',
          birthDate: 'not-a-date',
          createdAt: '2026-08-19T00:00:00.000Z',
          updatedAt: '2026-08-19T00:00:00.000Z',
        },
      ],
    });

    expect(() => importProfiles(invalidBackup)).toThrow('Backup contains an invalid profile.');
    expect(localStorage.getItem(STORAGE_KEY)).toBe(before);
    expect(loadProfiles()).toEqual([existing]);
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
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
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

  it('rejects imported profiles updated before they were created', () => {
    const backup = JSON.stringify({
      schemaVersion: 1,
      profiles: [
        {
          id: 'profile-id',
          name: 'Example',
          birthDate: '2000-01-01',
          createdAt: '2026-08-19T01:00:00.000Z',
          updatedAt: '2026-08-19T00:00:00.000Z',
        },
      ],
    });

    expect(() => importProfiles(backup)).toThrow('Backup contains an invalid profile.');
    expect(loadProfiles()).toEqual([]);
  });

  it('loads an empty profile list when browser storage cannot be read', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(loadProfiles()).toEqual([]);
  });

  it('throws a stable user-visible error when browser storage cannot be written', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota reached', 'QuotaExceededError');
    });

    expect(() => saveProfile({ name: 'Example', birthDate: '2001-02-03' })).toThrow(
      'Browser storage is unavailable. Changes could not be saved.',
    );
  });

  it('throws a stable user-visible error when browser storage cannot be cleared', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(() => clearProfiles()).toThrow('Browser storage is unavailable. Changes could not be saved.');
  });
});
