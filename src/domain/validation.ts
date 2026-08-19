import { DateCalculationError, parseDateInput } from './dateMath';

export function validateProfileName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length < 1) throw new DateCalculationError('Enter a profile name.');
  if (/[\u0000-\u001F\u007F]/.test(normalized)) {
    throw new DateCalculationError('Profile name contains unsupported control characters.');
  }
  if (normalized.length > 80) {
    throw new DateCalculationError('Profile name must be 80 characters or fewer.');
  }
  return normalized;
}

export function validateBirthDateString(value: string): string {
  parseDateInput(value);
  return value;
}

export function safeText(value: unknown): string {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001F\u007F]/g, '').slice(0, 500)
    : '';
}
