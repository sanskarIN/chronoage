import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { clearProfiles, loadProfiles, saveProfile, updateProfile } from '../src/storage/profiles';

describe('profile clock skew resilience', () => {
  beforeEach(() => clearProfiles());

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('keeps update timestamps valid when the device clock moves backward', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T12:00:00.000Z'));
    const original = saveProfile({ name: 'Clock test', birthDate: '2000-01-01' });

    vi.setSystemTime(new Date('2020-01-01T12:00:00.000Z'));
    const updated = updateProfile(original.id, { name: 'Clock corrected', birthDate: '2000-01-01' });

    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(updated.createdAt).getTime(),
    );
    expect(new Date(updated.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(original.updatedAt).getTime(),
    );
    expect(loadProfiles()).toEqual([updated]);
  });
});
