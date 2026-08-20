import { addYearsClamped, formatDateInput } from '../domain/dateMath';

export function todayInputValue(): string {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function currentTimeInputValue(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function defaultBirthInputValue(): string {
  const now = new Date();
  const twentyYearsAgo = addYearsClamped(
    { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() },
    -20,
    'feb28',
  );
  return formatDateInput(twentyYearsAgo);
}

export function systemTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
}
