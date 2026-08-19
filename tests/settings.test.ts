import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../src/storage/settings';

describe('settings storage', () => {
  beforeEach(() => localStorage.clear());

  it('returns safe defaults when storage is empty', () => {
    expect(loadSettings().theme).toBe(DEFAULT_SETTINGS.theme);
    expect(loadSettings().leapDayPolicy).toBe('feb28');
    expect(loadSettings().dstAmbiguityPolicy).toBe('earlier');
  });

  it('round-trips valid settings', () => {
    saveSettings({
      ...DEFAULT_SETTINGS,
      theme: 'dark',
      reducedMotion: true,
      leapDayPolicy: 'mar1',
      dstAmbiguityPolicy: 'later',
      defaultTimeZone: 'UTC',
    });
    expect(loadSettings()).toMatchObject({
      theme: 'dark',
      reducedMotion: true,
      leapDayPolicy: 'mar1',
      dstAmbiguityPolicy: 'later',
      defaultTimeZone: 'UTC',
    });
  });

  it('migrates older settings without a DST ambiguity value to the earlier occurrence', () => {
    localStorage.setItem(
      'chronoage.settings.v1',
      JSON.stringify({
        theme: 'light',
        reducedMotion: false,
        highContrast: false,
        defaultTimeZone: 'UTC',
        leapDayPolicy: 'feb28',
        onboardingComplete: true,
      }),
    );
    expect(loadSettings().dstAmbiguityPolicy).toBe('earlier');
  });

  it('falls back from malformed settings', () => {
    localStorage.setItem('chronoage.settings.v1', '{bad json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });
});
