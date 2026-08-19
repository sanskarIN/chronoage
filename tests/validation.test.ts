import { describe, expect, it } from 'vitest';
import { validateBirthDateString, validateProfileName } from '../src/domain/validation';

describe('input validation', () => {
  it('normalizes ordinary whitespace in profile names', () => {
    expect(validateProfileName('  Ada   Lovelace  ')).toBe('Ada Lovelace');
    expect(validateProfileName('Ada\nLovelace')).toBe('Ada Lovelace');
  });

  it('rejects control characters that survive whitespace normalization', () => {
    expect(() => validateProfileName('Ada\u0000Lovelace')).toThrow(
      'Profile name contains unsupported control characters.',
    );
    expect(() => validateProfileName('Ada\u007FLovelace')).toThrow(
      'Profile name contains unsupported control characters.',
    );
  });

  it('enforces profile name length and non-empty input', () => {
    expect(() => validateProfileName('   ')).toThrow('Enter a profile name.');
    expect(() => validateProfileName('x'.repeat(81))).toThrow('80 characters or fewer');
  });

  it('accepts valid birth dates and rejects invalid calendar dates', () => {
    expect(validateBirthDateString('2024-02-29')).toBe('2024-02-29');
    expect(() => validateBirthDateString('2025-02-29')).toThrow('valid calendar date');
  });
});
