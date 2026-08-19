import type { AppSettings } from '../types/models';
import { isValidTimeZone } from '../domain/dateMath';
import { systemTimeZone } from '../utils/dateDefaults';

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

export function loadSettings(): AppSettings {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<AppSettings>;
    return {
      theme: parsed.theme === 'light' || parsed.theme === 'dark' || parsed.theme === 'system' ? parsed.theme : 'system',
      reducedMotion: Boolean(parsed.reducedMotion),
      highContrast: Boolean(parsed.highContrast),
      defaultTimeZone:
        typeof parsed.defaultTimeZone === 'string' && isValidTimeZone(parsed.defaultTimeZone)
          ? parsed.defaultTimeZone
          : DEFAULT_SETTINGS.defaultTimeZone,
      leapDayPolicy: parsed.leapDayPolicy === 'mar1' ? 'mar1' : 'feb28',
      dstAmbiguityPolicy: parsed.dstAmbiguityPolicy === 'later' ? 'later' : 'earlier',
      onboardingComplete: Boolean(parsed.onboardingComplete),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
