import { afterEach, describe, expect, it, vi } from 'vitest';

const originalDescriptor = Object.getOwnPropertyDescriptor(Array.prototype, 'at');

afterEach(() => {
  vi.resetModules();
  if (originalDescriptor) {
    Object.defineProperty(Array.prototype, 'at', originalDescriptor);
  } else {
    Reflect.deleteProperty(Array.prototype, 'at');
  }
});

describe('Array.at compatibility polyfill', () => {
  it('restores positive and negative indexing when the native method is unavailable', async () => {
    Object.defineProperty(Array.prototype, 'at', {
      configurable: true,
      writable: true,
      value: undefined,
    });

    await import('../src/polyfills/arrayAt');

    expect([10, 20, 30].at(0)).toBe(10);
    expect([10, 20, 30].at(-1)).toBe(30);
    expect([10, 20, 30].at(-4)).toBeUndefined();
    expect([10, 20, 30].at(Number.NaN)).toBe(10);
  });
});
