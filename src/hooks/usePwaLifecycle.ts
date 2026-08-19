import { useCallback, useEffect, useState } from 'react';
import { logger } from '../utils/logger';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export type PwaUpdateStatus = 'idle' | 'checking' | 'current' | 'update-ready' | 'error';

export interface PwaLifecycle {
  canInstall: boolean;
  installed: boolean;
  updateStatus: PwaUpdateStatus;
  install: () => Promise<'accepted' | 'dismissed' | 'unavailable'>;
  checkForUpdate: () => Promise<void>;
  applyUpdate: () => Promise<boolean>;
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export function usePwaLifecycle(): PwaLifecycle {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(isStandalone);
  const [updateStatus, setUpdateStatus] = useState<PwaUpdateStatus>('idle');

  useEffect(() => {
    const onInstallPrompt = (event: Event): void => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = (): void => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    const onControllerChange = (): void => window.location.reload();

    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!installPrompt) return 'unavailable';
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstallPrompt(null);
    return choice.outcome;
  }, [installPrompt]);

  const checkForUpdate = useCallback(async (): Promise<void> => {
    if (!('serviceWorker' in navigator)) {
      setUpdateStatus('current');
      return;
    }
    setUpdateStatus('checking');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setUpdateStatus('current');
        return;
      }
      await registration.update();
      setUpdateStatus(registration.waiting ? 'update-ready' : 'current');
    } catch (error) {
      logger.warn('Service worker update check failed.', {
        errorType: error instanceof Error ? error.name : 'unknown',
      });
      setUpdateStatus('error');
    }
  }, []);

  const applyUpdate = useCallback(async (): Promise<boolean> => {
    if (!('serviceWorker' in navigator)) return false;
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.waiting) return false;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return true;
  }, []);

  return {
    canInstall: Boolean(installPrompt) && !installed,
    installed,
    updateStatus,
    install,
    checkForUpdate,
    applyUpdate,
  };
}
