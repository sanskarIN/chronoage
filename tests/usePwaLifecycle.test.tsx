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
