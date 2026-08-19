export class UserVisibleError extends Error {
  override name = 'UserVisibleError';
}

export function getUserSafeErrorMessage(error: unknown, fallback: string): string {
  return error instanceof UserVisibleError ? error.message : fallback;
}
