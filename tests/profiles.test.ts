import { beforeEach, describe, expect, it } from 'vitest';
import { clearProfiles, exportProfiles, importProfiles, loadProfiles, saveProfile } from '../src/storage/profiles';

describe('local profiles', () => {
  beforeEach(() => clearProfiles());

  it('saves profiles locally', () => {
    saveProfile({ name: ' Test User ', birthDate: '2000-01-01' });
    expect(loadProfiles()).toHaveLength(1);
    expect(loadProfiles()[0]?.name).toBe('Test User');
  });

  it('round-trips backup data', () => {
    saveProfile({ name: 'Example', birthDate: '2001-02-03' });
    const backup = exportProfiles();
    clearProfiles();
    expect(importProfiles(backup)).toHaveLength(1);
  });

  it('rejects invalid backup data', () => {
    expect(() => importProfiles('{"schemaVersion":9,"profiles":[]}')).toThrow('Unsupported backup format');
  });
});
