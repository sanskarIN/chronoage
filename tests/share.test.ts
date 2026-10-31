import { afterEach, describe, expect, it, vi } from 'vitest';
import { shareText } from '../src/utils/share';

const originalShareDescriptor = Object.getOwnPropertyDescriptor(navigator, 'share');
const originalClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

afterEach(() => {
  vi.restoreAllMocks();
  if (originalShareDescriptor) {
    Object.defineProperty(navigator, 'share', originalShareDescriptor);
  } else {
    Reflect.deleteProperty(navigator, 'share');
  }
  if (originalClipboardDescriptor) {
    Object.defineProperty(navigator, 'clipboard', originalClipboardDescriptor);
  } else {
    Reflect.deleteProperty(navigator, 'clipboard');
  }
});

function setClipboard(writeText: ReturnType<typeof vi.fn>): void {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: { writeText },
  });
}

describe('shareText', () => {
  it('uses the platform share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn();
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });
    setClipboard(writeText);

    await expect(shareText('Exact age', 'Result')).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ title: 'Exact age', text: 'Result' });
    expect(writeText).not.toHaveBeenCalled();
  });

  it('falls back to clipboard when the share sheet cannot be used', async () => {
    const shareError = new Error('share unavailable');
    shareError.name = 'NotAllowedError';
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(shareError),
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    await expect(shareText('Exact age', 'Result')).resolves.toBe('copied');
    expect(writeText).toHaveBeenCalledWith('Result');
  });

  it('does not copy after an intentional share cancellation', async () => {
    const abortError = new Error('cancelled');
    abortError.name = 'AbortError';
    Object.defineProperty(navigator, 'share', {
      configurable: true,
      value: vi.fn().mockRejectedValue(abortError),
    });
    const writeText = vi.fn().mockResolvedValue(undefined);
    setClipboard(writeText);

    await expect(shareText('Exact age', 'Result')).resolves.toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('fails clearly when neither sharing nor clipboard copying is available', async () => {
    Reflect.deleteProperty(navigator, 'share');
    Reflect.deleteProperty(navigator, 'clipboard');

    await expect(shareText('Exact age', 'Result')).rejects.toThrow('Clipboard sharing is unavailable');
  });
});
