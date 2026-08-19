import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearProfiles,
  exportProfiles,
  importProfiles,
  loadProfiles,
  saveProfile,
  updateProfile,
} from '../src/storage/profiles';

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

  it('rejects invalid backup data', () => {
    expect(() => importProfiles('{"schemaVersion":9,"profiles":[]}')).toThrow(
      'Unsupported backup format',
    );
  });
});
