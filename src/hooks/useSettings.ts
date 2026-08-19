import { useEffect, useState } from 'react';
import type { AppSettings } from '../types/models';
import { loadSettings, saveSettings } from '../storage/settings';

export function useSettings(): [AppSettings, (next: AppSettings) => void] {
  const [settings, setSettingsState] = useState<AppSettings>(() => loadSettings());

  const setSettings = (next: AppSettings): void => {
    saveSettings(next);
    setSettingsState(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.dataset.contrast = settings.highContrast ? 'high' : 'normal';
    root.dataset.motion = settings.reducedMotion ? 'reduced' : 'full';
  }, [settings]);

  return [settings, setSettings];
}
