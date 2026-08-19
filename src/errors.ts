import { DateCalculationError } from './domain/dateMath';

export class UserVisibleError extends Error {
  override name = 'UserVisibleError';
}

export function getUserSafeErrorMessage(error: unknown, fallback: string): string {
  return error instanceof UserVisibleError || error instanceof DateCalculationError ? error.message : fallback;
}
