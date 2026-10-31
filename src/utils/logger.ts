type LogLevel = 'info' | 'warn' | 'error';

const REDACTED_KEYS = /name|birth|profile|email|token|secret|password|authorization|date|time/i;
const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const BEARER_PATTERN = /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi;
const ISO_DATE_PATTERN = /\b\d{4}-\d{2}-\d{2}\b/g;
const CLOCK_TIME_PATTERN = /\b(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?\b/g;
const MAX_DEPTH = 5;

function sanitizeText(value: string): string {
  return value
    .replace(EMAIL_PATTERN, '[redacted-email]')
    .replace(BEARER_PATTERN, 'Bearer [redacted]')
    .replace(ISO_DATE_PATTERN, '[redacted-date]')
    .replace(CLOCK_TIME_PATTERN, '[redacted-time]');
}

function sanitize(value: unknown, seen: WeakSet<object>, depth: number): unknown {
  if (depth > MAX_DEPTH) return '[truncated]';
  if (typeof value === 'string') return sanitizeText(value);
  if (value instanceof Date) return '[redacted-date]';
  if (value instanceof Error) {
    return {
      errorType: value.name,
      message: sanitizeText(value.message),
    };
  }
  if (Array.isArray(value)) return value.map((entry) => sanitize(entry, seen, depth + 1));
  if (value && typeof value === 'object') {
    if (seen.has(value)) return '[circular]';
    seen.add(value);
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        REDACTED_KEYS.test(key) ? '[redacted]' : sanitize(entry, seen, depth + 1),
      ]),
    );
  }
  return value;
}

function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  return sanitize(context, new WeakSet<object>(), 0) as Record<string, unknown>;
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const payload = context ? sanitizeContext(context) : undefined;
  const method = level === 'info' ? console.info : level === 'warn' ? console.warn : console.error;
  method(`[ChronoAge:${level}] ${sanitizeText(message)}`, payload ?? '');
}

export const logger = {
  info: (message: string, context?: Record<string, unknown>) => write('info', message, context),
  warn: (message: string, context?: Record<string, unknown>) => write('warn', message, context),
  error: (message: string, context?: Record<string, unknown>) => write('error', message, context),
};

export function installGlobalErrorLogging(target: Window = window): () => void {
  const onError = (event: ErrorEvent): void => {
    logger.error('Unhandled browser error.', {
      error: event.error instanceof Error ? event.error : new Error('Unknown browser error'),
    });
  };
  const onUnhandledRejection = (event: PromiseRejectionEvent): void => {
    logger.error('Unhandled promise rejection.', {
      error: event.reason instanceof Error ? event.reason : new Error('Unknown promise rejection'),
    });
  };

  target.addEventListener('error', onError);
  target.addEventListener('unhandledrejection', onUnhandledRejection);
  return () => {
    target.removeEventListener('error', onError);
    target.removeEventListener('unhandledrejection', onUnhandledRejection);
  };
}
