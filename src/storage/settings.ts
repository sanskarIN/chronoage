import type { AppSettings } from '../types/models';
import { isValidTimeZone } from '../domain/dateMath';
import { systemTimeZone } from '../utils/dateDefaults';
import { logger } from '../utils/logger';

const STORAGE_KEY = 'chronoage.settings.v1';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  reducedMotion: false,
  highContrast: false,
  defaultTimeZone: systemTimeZone(),
  leapDayPolicy: 'feb28',
  dstAmbiguityPolicy: 'earlier',
  onboardingComplete: false,
};

function storedBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

export function loadSettings(): AppSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<AppSettings>;
    return {
      theme:
        parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system'
          ? parsed.theme
          : DEFAULT_SETTINGS.theme,
      reducedMotion: storedBoolean(parsed.reducedMotion, DEFAULT_SETTINGS.reducedMotion),
      highContrast: storedBoolean(parsed.highContrast, DEFAULT_SETTINGS.highContrast),
      defaultTimeZone:
        typeof parsed.defaultTimeZone === 'string' && isValidTimeZone(parsed.defaultTimeZone)
          ? parsed.defaultTimeZone
          : DEFAULT_SETTINGS.defaultTimeZone,
      leapDayPolicy: parsed.leapDayPolicy === 'mar1' ? 'mar1' : 'feb28',
      dstAmbiguityPolicy: parsed.dstAmbiguityPolicy === 'later' ? 'later' : 'earlier',
      onboardingComplete: storedBoolean(
        parsed.onboardingComplete,
        DEFAULT_SETTINGS.onboardingComplete,
      ),
    };
  } catch (error) {
    logger.warn('Settings storage could not be read; defaults are being used.', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    logger.warn('Settings storage could not be written; changes are session-only.', {
      errorType: error instanceof Error ? error.name : 'unknown',
    });
    return false;
  }
}
