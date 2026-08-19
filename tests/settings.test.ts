import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../src/storage/settings';

describe('settings storage', () => {
  beforeEach(() => localStorage.clear());

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns safe defaults when storage is empty', () => {
    expect(loadSettings().theme).toBe(DEFAULT_SETTINGS.theme);
    expect(loadSettings().leapDayPolicy).toBe('feb28');
    expect(loadSettings().dstAmbiguityPolicy).toBe('earlier');
  });

  it('round-trips valid settings', () => {
    expect(
      saveSettings({
        ...DEFAULT_SETTINGS,
        theme: 'dark',
        reducedMotion: true,
        leapDayPolicy: 'mar1',
        dstAmbiguityPolicy: 'later',
        defaultTimeZone: 'UTC',
      }),
    ).toBe(true);
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

  it('does not coerce malformed stored strings into enabled boolean settings', () => {
    localStorage.setItem(
      'chronoage.settings.v1',
      JSON.stringify({
        reducedMotion: 'false',
        highContrast: 'true',
        onboardingComplete: 'true',
      }),
    );

    expect(loadSettings()).toMatchObject({
      reducedMotion: false,
      highContrast: false,
      onboardingComplete: false,
    });
  });

  it('falls back from malformed settings', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    localStorage.setItem('chronoage.settings.v1', '{bad json');
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('falls back safely when browser settings storage cannot be read', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });

    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
  });

  it('returns false instead of throwing when browser settings storage cannot be written', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota reached', 'QuotaExceededError');
    });

    expect(saveSettings(DEFAULT_SETTINGS)).toBe(false);
  });
});
