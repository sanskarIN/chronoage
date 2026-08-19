type LogLevel = 'info' | 'warn' | 'error';

const REDACTED_KEYS = /name|birth|profile|email|token|secret|password|authorization/i;

function sanitize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        REDACTED_KEYS.test(key) ? '[redacted]' : sanitize(entry),
      ]),
    );
  }
  return value;
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const payload = context ? sanitize(context) : undefined;
  const method = level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;
  method(`[ChronoAge:${level}] ${message}`, payload ?? '');
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => write('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => write('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => write('error', message, context),
};
