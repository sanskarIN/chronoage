import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../src/storage/settings';

describe('settings storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns safe defaults when storage is empty', () => {
    expect(loadSettings().theme).toBe(DEFAULT_SETTINGS.theme);
    expect(loadSettings().leapDayPolicy).toBe('feb28');
  });

  it('round-trips valid settings', () => {
    saveSettings({
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      reducedMotion: true,
      leapDayPolicy: 'mar1',
      defaultTimeZone: 'UTC',
    });
    expect(loadSettings()).toMatchObject({
      theme: 'dark',
      reducedMotion: true,
      leapDayPolicy: 'mar1',
      defaultTimeZone: 'UTC',
    });
  });

  it('falls back from malformed settings', () => {
    localStorage.setItem('chronoage.settings.v1', '{bad json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
