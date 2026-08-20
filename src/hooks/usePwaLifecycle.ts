import { useCallback, useEffect, useRef, useState } from 'react';
import { logger } from '../utils/logger';
import { isNativeRuntime } from '../utils/platform';

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
  const displayModeStandalone =
    typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches;
  return displayModeStandalone || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

export function usePwaLifecycle(): PwaLifecycle {
  const nativeRuntime = isNativeRuntime();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(() => nativeRuntime || isStandalone());
  const [updateStatus, setUpdateStatus] = useState<PwaUpdateStatus>('idle');
  const reloadOnControllerChange = useRef(false);
  const updateTrackerCleanup = useRef<(() => void) | null>(null);

  const clearUpdateTracker = useCallback((): void => {
    updateTrackerCleanup.current?.();
    updateTrackerCleanup.current = null;
  }, []);

  const trackInstallingWorker = useCallback(
    (registration: ServiceWorkerRegistration, worker: ServiceWorker): void => {
      clearUpdateTracker();

      const finish = (status: PwaUpdateStatus): void => {
        setUpdateStatus(status);
        clearUpdateTracker();
      };

      const onStateChange = (): void => {
        if (registration.waiting) {
          finish('update-ready');
          return;
        }
        if (worker.state === 'activated' || worker.state === 'redundant') {
          finish('current');
        }
      };

      worker.addEventListener('statechange', onStateChange);
      updateTrackerCleanup.current = () => worker.removeEventListener('statechange', onStateChange);
      onStateChange();
    },
    [clearUpdateTracker],
  );

  useEffect(() => {
    if (nativeRuntime) return;

    const onInstallPrompt = (event: Event): void => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    const onInstalled = (): void => {
      setInstalled(true);
      setInstallPrompt(null);
    };
    const onControllerChange = (): void => {
      if (!reloadOnControllerChange.current) return;
      reloadOnControllerChange.current = false;
      window.location.reload();
    };

    window.addEventListener('beforeinstallprompt', onInstallPrompt);
    window.addEventListener('appinstalled', onInstalled);
    navigator.serviceWorker?.addEventListener('controllerchange', onControllerChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', onInstallPrompt);
      window.removeEventListener('appinstalled', onInstalled);
      navigator.serviceWorker?.removeEventListener('controllerchange', onControllerChange);
      clearUpdateTracker();
    };
  }, [clearUpdateTracker, nativeRuntime]);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (nativeRuntime || !installPrompt) return 'unavailable';
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      setInstallPrompt(null);
      return choice.outcome;
    } catch (error) {
      logger.warn('PWA install prompt failed.', {
        errorType: error instanceof Error ? error.name : 'unknown',
      });
      setInstallPrompt(null);
      return 'unavailable';
    }
  }, [installPrompt, nativeRuntime]);

  const checkForUpdate = useCallback(async (): Promise<void> => {
    if (nativeRuntime || !('serviceWorker' in navigator)) {
      setUpdateStatus('current');
      return;
    }
    clearUpdateTracker();
    setUpdateStatus('checking');
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setUpdateStatus('current');
        return;
      }
      await registration.update();
      if (registration.waiting) {
        setUpdateStatus('update-ready');
        return;
      }
      if (registration.installing) {
        trackInstallingWorker(registration, registration.installing);
        return;
      }
      setUpdateStatus('current');
    } catch (error) {
      clearUpdateTracker();
      logger.warn('Service worker update check failed.', {
        errorType: error instanceof Error ? error.name : 'unknown',
      });
      setUpdateStatus('error');
    }
  }, [clearUpdateTracker, nativeRuntime, trackInstallingWorker]);

  const applyUpdate = useCallback(async (): Promise<boolean> => {
    if (nativeRuntime || !('serviceWorker' in navigator)) return false;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration?.waiting) return false;
      reloadOnControllerChange.current = true;
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    } catch (error) {
      reloadOnControllerChange.current = false;
      logger.warn('Service worker update application failed.', {
        errorType: error instanceof Error ? error.name : 'unknown',
      });
      setUpdateStatus('error');
      return false;
    }
  }, [nativeRuntime]);

  return {
    canInstall: !nativeRuntime && Boolean(installPrompt) && !installed,
    installed,
    updateStatus,
    install,
    checkForUpdate,
    applyUpdate,
  };
}
