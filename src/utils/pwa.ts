import { logger } from './logger';

export function registerServiceWorker(): void {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      logger.warn('Service worker registration failed.', {
        errorType: error instanceof Error ? error.name : 'unknown',
      });
    });
  });
}
