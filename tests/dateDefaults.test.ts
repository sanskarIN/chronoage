import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultBirthInputValue } from '../src/utils/dateDefaults';

afterEach(() => {
  vi.useRealTimers();
});

describe('date input defaults', () => {
  it('uses a valid February 28 default when twenty years before a leap day is not leap', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 1, 29, 12, 0, 0));

    expect(defaultBirthInputValue()).toBe('2004-02-29');
  });

  it('clamps February 29 when the twenty-year target is not a leap year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2048, 1, 29, 12, 0, 0));

    expect(defaultBirthInputValue()).toBe('2028-02-29');
  });
});
