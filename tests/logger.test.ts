import { afterEach, describe, expect, it, vi } from 'vitest';
import { installGlobalErrorLogging, logger } from '../src/utils/logger';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('privacy-safe logging', () => {
  it('redacts sensitive keys and sensitive text patterns', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    logger.error('Contact person@example.com with Bearer abc123', {
      profileName: 'Ada Lovelace',
      nested: {
        note: 'Reply to another@example.com',
        token: 'should-never-appear',
      },
      error: new Error('Failure for owner@example.com'),
    });

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [message, context] = errorSpy.mock.calls[0] as [string, Record<string, unknown>];
    expect(message).toBe('[ChronoAge:error] Contact [redacted-email] with Bearer [redacted]');
    expect(context.profileName).toBe('[redacted]');
    expect(context.nested).toEqual({
      note: 'Reply to [redacted-email]',
      token: '[redacted]',
    });
    expect(context.error).toEqual({
      errorType: 'Error',
      message: 'Failure for [redacted-email]',
    });
  });

  it('handles circular context without throwing', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const circular: Record<string, unknown> = { area: 'runtime' };
    circular.self = circular;

    expect(() => logger.warn('Circular context', circular)).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith('[ChronoAge:warn] Circular context', {
      area: 'runtime',
      self: '[circular]',
    });
  });

  it('logs unhandled browser errors through the sanitized logger', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const cleanup = installGlobalErrorLogging(window);

    window.dispatchEvent(
      new ErrorEvent('error', {
        error: new Error('Crash for user@example.com'),
        message: 'Crash for user@example.com',
      }),
    );

    cleanup();
    expect(errorSpy).toHaveBeenCalledWith('[ChronoAge:error] Unhandled browser error.', {
      error: {
        errorType: 'Error',
        message: 'Crash for [redacted-email]',
      },
    });
  });
});
