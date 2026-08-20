import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePwaLifecycle } from '../src/hooks/usePwaLifecycle';

const originalServiceWorkerDescriptor = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');

afterEach(() => {
  vi.restoreAllMocks();
  if (originalServiceWorkerDescriptor) {
    Object.defineProperty(navigator, 'serviceWorker', originalServiceWorkerDescriptor);
  } else {
    Reflect.deleteProperty(navigator, 'serviceWorker');
  }
});

function installServiceWorkerContainer(registration: Partial<ServiceWorkerRegistration>): void {
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      getRegistration: vi.fn().mockResolvedValue(registration),
    },
  });
}

describe('usePwaLifecycle', () => {
  it('consumes a dismissed install prompt instead of leaving a stale prompt reusable', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'dismissed' as const, platform: 'test' }),
    });
    const { result } = renderHook(() => usePwaLifecycle());

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    let outcome: 'accepted' | 'dismissed' | 'unavailable' = 'unavailable';
    await act(async () => {
      outcome = await result.current.install();
    });

    expect(prompt).toHaveBeenCalledTimes(1);
    expect(outcome).toBe('dismissed');
    expect(result.current.canInstall).toBe(false);
  });

  it('contains install prompt failures and clears the unusable prompt', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const event = Object.assign(new Event('beforeinstallprompt'), {
      prompt: vi.fn().mockRejectedValue(new Error('prompt failed')),
      userChoice: Promise.resolve({ outcome: 'accepted' as const, platform: 'test' }),
    });
    const { result } = renderHook(() => usePwaLifecycle());

    act(() => {
      window.dispatchEvent(event);
    });
    await act(async () => {
      expect(await result.current.install()).toBe('unavailable');
    });

    expect(result.current.canInstall).toBe(false);
  });

  it('reports an already waiting service worker as update-ready', async () => {
    const waiting = { postMessage: vi.fn() } as unknown as ServiceWorker;
    const registration = {
      waiting,
      installing: null,
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ServiceWorkerRegistration;
    installServiceWorkerContainer(registration);
    const { result } = renderHook(() => usePwaLifecycle());

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(registration.update).toHaveBeenCalledTimes(1);
    expect(result.current.updateStatus).toBe('update-ready');
  });

  it('keeps checking while an update installs and reports it when waiting', async () => {
    const workerTarget = new EventTarget();
    const worker = Object.assign(workerTarget, { state: 'installing' }) as unknown as ServiceWorker;
    const registration = {
      waiting: null as ServiceWorker | null,
      installing: worker,
      update: vi.fn().mockResolvedValue(undefined),
    } as unknown as ServiceWorkerRegistration;
    installServiceWorkerContainer(registration);
    const { result } = renderHook(() => usePwaLifecycle());

    await act(async () => {
      await result.current.checkForUpdate();
    });
    expect(result.current.updateStatus).toBe('checking');

    await act(async () => {
      Object.assign(registration, { waiting: worker });
      Object.assign(worker, { state: 'installed' });
      workerTarget.dispatchEvent(new Event('statechange'));
    });

    expect(result.current.updateStatus).toBe('update-ready');
  });

  it('posts skip-waiting only when a waiting update exists', async () => {
    const postMessage = vi.fn();
    const waiting = { postMessage } as unknown as ServiceWorker;
    const registration = { waiting } as unknown as ServiceWorkerRegistration;
    installServiceWorkerContainer(registration);
    const { result } = renderHook(() => usePwaLifecycle());

    await act(async () => {
      expect(await result.current.applyUpdate()).toBe(true);
    });

    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
  });

  it('contains service-worker update application failures', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const getRegistration = vi.fn().mockRejectedValue(new Error('registration failed'));
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        getRegistration,
      },
    });
    const { result } = renderHook(() => usePwaLifecycle());

    await act(async () => {
      expect(await result.current.applyUpdate()).toBe(false);
    });

    expect(getRegistration).toHaveBeenCalledTimes(1);
    expect(result.current.updateStatus).toBe('error');
  });
});
