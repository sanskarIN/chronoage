import type {
  AgeBreakdown,
  AgeInput,
  BirthdayCountdown,
  DstAmbiguityPolicy,
  LeapDayPolicy,
  LocalDate,
  LocalDateTime,
} from '../types/models';

const MS_PER_MINUTE = 60_000;
const MS_PER_HOUR = 3_600_000;
const MS_PER_DAY = 86_400_000;
const NONEXISTENT_LOCAL_TIME_MESSAGE = 'That local time does not exist in the selected timezone.';
const OFFSET_SAMPLE_HOURS = [-48, -36, -24, -18, -12, -6, 0, 6, 12, 18, 24, 36, 48];

export class DateCalculationError extends Error {
  override name = 'DateCalculationError';
}

export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

export function daysInMonth(year: number, month: number): number {
  if (
    !Number.isInteger(year) ||
    year < 1 ||
    year > 9999 ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    throw new DateCalculationError('Invalid year or month.');
  }
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const value = lengths[month - 1];
  if (value === undefined) throw new DateCalculationError('Invalid month.');
  return value;
}

export function isValidLocalDate(value: LocalDate): boolean {
  return (
    Number.isInteger(value.year) &&
    value.year >= 1 &&
    value.year <= 9999 &&
    Number.isInteger(value.month) &&
    value.month >= 1 &&
    value.month <= 12 &&
    Number.isInteger(value.day) &&
    value.day >= 1 &&
    value.day <= daysInMonth(value.year, value.month)
  );
}

export function isValidLocalDateTime(value: LocalDateTime): boolean {
  return (
    isValidLocalDate(value) &&
    Number.isInteger(value.hour) &&
    value.hour >= 0 &&
    value.hour <= 23 &&
    Number.isInteger(value.minute) &&
    value.minute >= 0 &&
    value.minute <= 59
  );
}

export function parseDateInput(value: string): LocalDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) throw new DateCalculationError('Enter a date in YYYY-MM-DD format.');
  const date = { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
  if (!isValidLocalDate(date)) throw new DateCalculationError('Enter a valid calendar date.');
  return date;
}

export function parseTimeInput(value: string): Pick<LocalDateTime, 'hour' | 'minute'> {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new DateCalculationError('Enter a time in HH:MM format.');
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) throw new DateCalculationError('Enter a valid time.');
  return { hour, minute };
}

export function formatDateInput(date: LocalDate): string {
  if (!isValidLocalDate(date)) throw new DateCalculationError('Invalid calendar date.');
  return `${String(date.year).padStart(4, '0')}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
}

export function compareLocalDate(a: LocalDate, b: LocalDate): number {
  return toEpochDay(a) - toEpochDay(b);
}

function civilUtcMilliseconds(value: LocalDateTime): number {
  const date = new Date(0);
  date.setUTCFullYear(value.year, value.month - 1, value.day);
  date.setUTCHours(value.hour, value.minute, 0, 0);
  return date.getTime();
}

function comparableToLocalDateTime(timestamp: number): LocalDateTime {
  const date = new Date(timestamp);
  const result = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
    hour: date.getUTCHours(),
    minute: date.getUTCMinutes(),
  };
  if (!isValidLocalDateTime(result)) {
    throw new DateCalculationError('Resulting date is outside the supported range.');
  }
  return result;
}

export function toEpochDay(date: LocalDate): number {
  if (!isValidLocalDate(date)) throw new DateCalculationError('Invalid calendar date.');
  return Math.floor(civilUtcMilliseconds({ ...date, hour: 0, minute: 0 }) / MS_PER_DAY);
}

export function fromEpochDay(epochDay: number): LocalDate {
  if (!Number.isInteger(epochDay)) throw new DateCalculationError('Epoch day must be an integer.');
  const date = new Date(epochDay * MS_PER_DAY);
  const result = {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate(),
  };
  if (!isValidLocalDate(result)) {
    throw new DateCalculationError('Resulting date is outside the supported range.');
  }
  return result;
}

export function addDays(date: LocalDate, days: number): LocalDate {
  if (!Number.isInteger(days)) throw new DateCalculationError('Days must be an integer.');
  return fromEpochDay(toEpochDay(date) + days);
}

export function addYearsClamped(
  date: LocalDate,
  years: number,
  leapDayPolicy: LeapDayPolicy = 'feb28',
): LocalDate {
  if (!isValidLocalDate(date)) throw new DateCalculationError('Invalid calendar date.');
  if (!Number.isInteger(years)) throw new DateCalculationError('Years must be an integer.');
  const targetYear = date.year + years;
  if (targetYear < 1 || targetYear > 9999) {
    throw new DateCalculationError('Resulting year is outside the supported range.');
  }
  if (date.month === 2 && date.day === 29 && !isLeapYear(targetYear)) {
    return leapDayPolicy === 'mar1'
      ? { year: targetYear, month: 3, day: 1 }
      : { year: targetYear, month: 2, day: 28 };
  }
  return {
    year: targetYear,
    month: date.month,
    day: Math.min(date.day, daysInMonth(targetYear, date.month)),
  };
}

export function addMonthsClamped(date: LocalDate, months: number): LocalDate {
  if (!isValidLocalDate(date)) throw new DateCalculationError('Invalid calendar date.');
  if (!Number.isInteger(months)) throw new DateCalculationError('Months must be an integer.');
  const zeroBased = date.year * 12 + (date.month - 1) + months;
  const year = Math.floor(zeroBased / 12);
  const month = ((zeroBased % 12) + 12) % 12 + 1;
  if (year < 1 || year > 9999) {
    throw new DateCalculationError('Resulting year is outside the supported range.');
  }
  return { year, month, day: Math.min(date.day, daysInMonth(year, month)) };
}

function dateTimeToComparable(value: LocalDateTime): number {
  return civilUtcMilliseconds(value);
}

function withTime(date: LocalDate, time: LocalDateTime): LocalDateTime {
  return { ...date, hour: time.hour, minute: time.minute };
}

function formatToZonedParts(timestamp: number, timeZone: string): LocalDateTime {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = Object.fromEntries(
    formatter
      .formatToParts(new Date(timestamp))
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
}

function sameLocalDateTime(a: LocalDateTime, b: LocalDateTime): boolean {
  return (
    a.year === b.year &&
    a.month === b.month &&
    a.day === b.day &&
    a.hour === b.hour &&
    a.minute === b.minute
  );
}

function offsetMinutesAt(timestamp: number, timeZone: string): number {
  const localComparable = dateTimeToComparable(formatToZonedParts(timestamp, timeZone));
  return Math.round((localComparable - timestamp) / MS_PER_MINUTE);
}

function nearbyOffsetMinutes(timestamp: number, timeZone: string): number[] {
  return OFFSET_SAMPLE_HOURS.map((hours) => offsetMinutesAt(timestamp + hours * MS_PER_HOUR, timeZone));
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en', { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns every UTC instant represented by a civil date/time in an IANA timezone.
 * Normal times produce one candidate, fall-back overlaps produce two, and spring-forward
 * gaps throw because the requested civil time does not exist.
 */
export function zonedLocalToUtcCandidates(value: LocalDateTime, timeZone: string): number[] {
  if (!isValidLocalDateTime(value)) throw new DateCalculationError('Invalid date or time.');
  if (!isValidTimeZone(timeZone)) throw new DateCalculationError('Unknown timezone.');

  const desired = dateTimeToComparable(value);
  let guess = desired;
  for (let index = 0; index < 6; index += 1) {
    const actual = formatToZonedParts(guess, timeZone);
    const delta = desired - dateTimeToComparable(actual);
    if (delta === 0) break;
    guess += delta;
  }

  const roundTrip = formatToZonedParts(guess, timeZone);
  if (!sameLocalDateTime(roundTrip, value)) {
    throw new DateCalculationError(NONEXISTENT_LOCAL_TIME_MESSAGE);
  }

  const offsets = new Set<number>(nearbyOffsetMinutes(guess, timeZone));
  const candidates = new Set<number>([guess]);
  for (const offsetMinutes of offsets) {
    const candidate = desired - offsetMinutes * MS_PER_MINUTE;
    if (sameLocalDateTime(formatToZonedParts(candidate, timeZone), value)) candidates.add(candidate);
  }

  return [...candidates].sort((a, b) => a - b);
}

/**
 * Converts a civil date/time in an IANA timezone into a UTC timestamp without a timezone library.
 * Nonexistent spring-forward times are rejected. Ambiguous fall-back times are resolved using the
 * explicit `ambiguityPolicy`, defaulting to the earlier occurrence for backwards compatibility.
 */
export function zonedLocalToUtc(
  value: LocalDateTime,
  timeZone: string,
  ambiguityPolicy: DstAmbiguityPolicy = 'earlier',
): number {
  const candidates = zonedLocalToUtcCandidates(value, timeZone);
  const candidate = ambiguityPolicy === 'later' ? candidates.at(-1) : candidates[0];
  if (candidate === undefined) throw new DateCalculationError('Unable to resolve timezone instant.');
  return candidate;
}

/**
 * Resolves a calendar-derived local anchor. User-entered gap times remain invalid, but a derived
 * anniversary can land in a gap that did not exist in the birth year. In that case the anchor is
 * shifted forward by the actual offset increase, matching compatible civil-time semantics.
 */
function derivedZonedLocalToUtc(
  value: LocalDateTime,
  timeZone: string,
  ambiguityPolicy: DstAmbiguityPolicy,
): number {
  try {
    return zonedLocalToUtc(value, timeZone, ambiguityPolicy);
  } catch (error) {
    if (!(error instanceof DateCalculationError) || error.message !== NONEXISTENT_LOCAL_TIME_MESSAGE) {
      throw error;
    }
  }

  const desired = dateTimeToComparable(value);
  const offsets = nearbyOffsetMinutes(desired, timeZone);
  const gapMinutes = Math.max(...offsets) - Math.min(...offsets);
  if (!Number.isInteger(gapMinutes) || gapMinutes <= 0 || gapMinutes > 24 * 60) {
    throw new DateCalculationError(NONEXISTENT_LOCAL_TIME_MESSAGE);
  }

  const shifted = comparableToLocalDateTime(desired + gapMinutes * MS_PER_MINUTE);
  return zonedLocalToUtc(shifted, timeZone, ambiguityPolicy);
}

function calendarDifference(
  start: LocalDate,
  end: LocalDate,
  leapDayPolicy: LeapDayPolicy,
): { years: number; months: number; days: number; anchor: LocalDate } {
  if (compareLocalDate(start, end) > 0) {
    throw new DateCalculationError('Start date must not be after end date.');
  }

  let years = end.year - start.year;
  let anchor = addYearsClamped(start, years, leapDayPolicy);
  if (compareLocalDate(anchor, end) > 0) {
    years -= 1;
    anchor = addYearsClamped(start, years, leapDayPolicy);
  }

  let months = Math.min(11, (end.year - anchor.year) * 12 + (end.month - anchor.month));
  let monthAnchor = addMonthsClamped(anchor, months);
  if (compareLocalDate(monthAnchor, end) > 0) {
    months -= 1;
    monthAnchor = addMonthsClamped(anchor, months);
  }

  const days = toEpochDay(end) - toEpochDay(monthAnchor);
  return { years, months, days, anchor: addDays(monthAnchor, days) };
}

export function calculateAge(input: AgeInput): AgeBreakdown {
  if (!isValidLocalDateTime(input.birth) || !isValidLocalDateTime(input.reference)) {
    throw new DateCalculationError('Enter valid birth and reference dates.');
  }
  if (!isValidTimeZone(input.timeZone)) throw new DateCalculationError('Select a valid timezone.');

  const ambiguityPolicy = input.dstAmbiguityPolicy ?? 'earlier';
  const birth = input.includeTime ? input.birth : { ...input.birth, hour: 0, minute: 0 };
  const reference = input.includeTime ? input.reference : { ...input.reference, hour: 0, minute: 0 };
  const startMs = input.includeTime
    ? zonedLocalToUtc(birth, input.timeZone, ambiguityPolicy)
    : dateTimeToComparable(birth);
  const endMs = input.includeTime
    ? zonedLocalToUtc(reference, input.timeZone, ambiguityPolicy)
    : dateTimeToComparable(reference);
  if (startMs > endMs) {
    throw new DateCalculationError('Birth date must not be after the reference date.');
  }

  const calendar = calendarDifference(birth, reference, input.leapDayPolicy);
  let calendarDays = calendar.days;
  let anchorDate = calendar.anchor;
  let anchorDateTime = withTime(anchorDate, birth);
  let anchorMs = input.includeTime
    ? derivedZonedLocalToUtc(anchorDateTime, input.timeZone, ambiguityPolicy)
    : dateTimeToComparable(anchorDateTime);

  if (input.includeTime && anchorMs > endMs && calendarDays > 0) {
    calendarDays -= 1;
    anchorDate = addDays(anchorDate, -1);
    anchorDateTime = withTime(anchorDate, birth);
    anchorMs = derivedZonedLocalToUtc(anchorDateTime, input.timeZone, ambiguityPolicy);
  }

  if (input.includeTime && anchorMs > endMs) {
    const previousReferenceDate = addDays(reference, -1);
    const adjusted = calendarDifference(birth, previousReferenceDate, input.leapDayPolicy);
    calendarDays = adjusted.days;
    anchorDate = adjusted.anchor;
    anchorDateTime = withTime(anchorDate, birth);
    anchorMs = derivedZonedLocalToUtc(anchorDateTime, input.timeZone, ambiguityPolicy);
    calendar.years = adjusted.years;
    calendar.months = adjusted.months;
  }

  let remainder = Math.max(0, endMs - anchorMs);
  const hours = Math.floor(remainder / MS_PER_HOUR);
  remainder -= hours * MS_PER_HOUR;
  const minutes = Math.floor(remainder / MS_PER_MINUTE);
  const totalMs = endMs - startMs;

  return {
    years: calendar.years,
    months: calendar.months,
    days: calendarDays,
    hours,
    minutes,
    totalDays: Math.floor(totalMs / MS_PER_DAY),
    totalHours: Math.floor(totalMs / MS_PER_HOUR),
    totalMinutes: Math.floor(totalMs / MS_PER_MINUTE),
  };
}

export function nextBirthday(
  birth: LocalDate,
  reference: LocalDate,
  leapDayPolicy: LeapDayPolicy = 'feb28',
  locale = 'en-US',
): BirthdayCountdown {
  if (!isValidLocalDate(birth) || !isValidLocalDate(reference)) {
    throw new DateCalculationError('Enter valid dates.');
  }
  if (compareLocalDate(birth, reference) > 0) {
    throw new DateCalculationError('Birth date must not be after the reference date.');
  }

  let birthday = addYearsClamped(birth, reference.year - birth.year, leapDayPolicy);
  if (compareLocalDate(birthday, reference) < 0) {
    birthday = addYearsClamped(birth, reference.year - birth.year + 1, leapDayPolicy);
  }

  return {
    nextBirthday: birthday,
    weekday: weekdayName(birthday, locale),
    daysUntil: toEpochDay(birthday) - toEpochDay(reference),
    ageTurning: birthday.year - birth.year,
  };
}

export function intervalDays(start: LocalDate, end: LocalDate, inclusive: boolean): number {
  const delta = toEpochDay(end) - toEpochDay(start);
  if (delta < 0) throw new DateCalculationError('Start date must not be after end date.');
  return delta + (inclusive ? 1 : 0);
}

export function weekdayName(date: LocalDate, locale = 'en-US'): string {
  if (!isValidLocalDate(date)) throw new DateCalculationError('Invalid calendar date.');
  const timestamp = civilUtcMilliseconds({ ...date, hour: 12, minute: 0 });
  return new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' }).format(timestamp);
}

export function ageDifference(
  first: LocalDate,
  second: LocalDate,
  leapDayPolicy: LeapDayPolicy = 'feb28',
): AgeBreakdown {
  const [start, end] = compareLocalDate(first, second) <= 0 ? [first, second] : [second, first];
  return calculateAge({
    birth: { ...start, hour: 0, minute: 0 },
    reference: { ...end, hour: 0, minute: 0 },
    timeZone: 'UTC',
    includeTime: false,
    leapDayPolicy,
  });
}
