import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultBirthInputValue } from '../src/utils/dateDefaults';

afterEach(() => {
  vi.useRealTimers();
});

describe('date input defaults', () => {
  it('preserves February 29 when the twenty-year target remains a leap year', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2024, 1, 29, 12, 0, 0));

    expect(defaultBirthInputValue()).toBe('2004-02-29');
  });

  it('clamps February 29 across a non-leap Gregorian century target', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2120, 1, 29, 12, 0, 0));

    expect(defaultBirthInputValue()).toBe('2100-02-28');
  });
});
