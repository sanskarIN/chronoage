import { describe, expect, it } from 'vitest';
import { DateCalculationError } from '../src/domain/dateMath';
import { getUserSafeErrorMessage, UserVisibleError } from '../src/errors';

describe('user-safe error messages', () => {
  it('exposes expected validation and product errors', () => {
    expect(getUserSafeErrorMessage(new DateCalculationError('Enter a valid date.'), 'Fallback')).toBe(
      'Enter a valid date.',
    );
    expect(getUserSafeErrorMessage(new UserVisibleError('Backup is invalid.'), 'Fallback')).toBe(
      'Backup is invalid.',
    );
  });

  it('hides unexpected implementation errors behind the supplied fallback', () => {
    expect(getUserSafeErrorMessage(new Error('Internal storage path failed.'), 'Unable to continue.')).toBe(
      'Unable to continue.',
    );
    expect(getUserSafeErrorMessage({ message: 'not an Error instance' }, 'Unable to continue.')).toBe(
      'Unable to continue.',
    );
  });
});
