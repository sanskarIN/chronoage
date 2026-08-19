import { useCallback, useEffect, useState } from 'react';
import type { AppSettings } from '../types/models';
import { loadSettings, saveSettings } from '../storage/settings';

export type SettingsUpdater = (next: AppSettings) => boolean;

export function useSettings(): [AppSettings, SettingsUpdater] {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  const setSettings = useCallback((next: AppSettings): boolean => {
    const persisted = saveSettings(next);
    setSettingsState(next);
    return persisted;
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.motion = settings.reducedMotion ? 'reduced' : 'full';
  }, [settings]);

  return [settings, setSettings];
}
