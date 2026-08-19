import { describe, expect, it } from 'vitest';
import {
  addDays,
  addYearsClamped,
  ageDifference,
  calculateAge,
  intervalDays,
  isLeapYear,
  nextBirthday,
  parseDateInput,
  zonedLocalToUtc,
  zonedLocalToUtcCandidates,
} from '../src/domain/dateMath';

describe('date math', () => {
  it('implements Gregorian leap-year rules', () => {
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
  });

  it('handles four-digit years below 0100 without JavaScript Date remapping', () => {
    const result = ageDifference(parseDateInput('0001-01-01'), parseDateInput('0002-01-01'));
    expect(result.years).toBe(1);
    expect(result.months).toBe(0);
    expect(result.days).toBe(0);
  });

  it('supports both leap-day anniversary policies', () => {
    const leapDay = { year: 2000, month: 2, day: 29 };
    expect(addYearsClamped(leapDay, 1, 'feb28')).toEqual({ year: 2001, month: 2, day: 28 });
    expect(addYearsClamped(leapDay, 1, 'mar1')).toEqual({ year: 2001, month: 3, day: 1 });
  });

  it('rejects year arithmetic outside the supported calendar range', () => {
    expect(() => addYearsClamped({ year: 9999, month: 12, day: 31 }, 1)).toThrow(
      'outside the supported range',
    );
  });

  it('rejects day arithmetic outside the supported calendar range', () => {
    expect(() => addDays({ year: 1, month: 1, day: 1 }, -1)).toThrow(
      'outside the supported range',
    );
    expect(() => addDays({ year: 9999, month: 12, day: 31 }, 1)).toThrow(
      'outside the supported range',
    );
  });

  it('calculates a calendar age exactly', () => {
    const result = calculateAge({
      birth: { year: 2000, month: 1, day: 15, hour: 0, minute: 0 },
      reference: { year: 2026, month: 8, day: 19, hour: 0, minute: 0 },
      timeZone: 'UTC',
      includeTime: false,
      leapDayPolicy: 'feb28',
    });
    expect(result.years).toBe(26);
    expect(result.months).toBe(7);
    expect(result.days).toBe(4);
  });

  it('borrows a calendar day when the reference clock time is earlier', () => {
    const result = calculateAge({
      birth: { year: 2020, month: 1, day: 1, hour: 10, minute: 30 },
      reference: { year: 2020, month: 1, day: 2, hour: 9, minute: 15 },
      timeZone: 'UTC',
      includeTime: true,
      leapDayPolicy: 'feb28',
    });
    expect(result.days).toBe(0);
    expect(result.hours).toBe(22);
    expect(result.minutes).toBe(45);
  });

  it('converts IANA zoned local time to a UTC instant', () => {
    const timestamp = zonedLocalToUtc(
      { year: 2026, month: 8, day: 19, hour: 12, minute: 0 },
      'Asia/Kolkata',
    );
    expect(new Date(timestamp).toISOString()).toBe('2026-08-19T06:30:00.000Z');
  });

  it('returns both instants for an ambiguous DST fall-back time', () => {
    const local = { year: 2026, month: 11, day: 1, hour: 1, minute: 30 };
    const candidates = zonedLocalToUtcCandidates(local, 'America/New_York');
    expect(candidates.map((value) => new Date(value).toISOString())).toEqual([
      '2026-11-01T05:30:00.000Z',
      '2026-11-01T06:30:00.000Z',
    ]);
    expect(new Date(zonedLocalToUtc(local, 'America/New_York', 'earlier')).toISOString()).toBe(
      '2026-11-01T05:30:00.000Z',
    );
    expect(new Date(zonedLocalToUtc(local, 'America/New_York', 'later')).toISOString()).toBe(
      '2026-11-01T06:30:00.000Z',
    );
  });

  it('applies the DST overlap policy to elapsed age totals', () => {
    const baseInput = {
      birth: { year: 2026, month: 11, day: 1, hour: 0, minute: 30 },
      reference: { year: 2026, month: 11, day: 1, hour: 1, minute: 30 },
      timeZone: 'America/New_York',
      includeTime: true,
      leapDayPolicy: 'feb28' as const,
    };
    const earlier = calculateAge({ ...baseInput, dstAmbiguityPolicy: 'earlier' });
    const later = calculateAge({ ...baseInput, dstAmbiguityPolicy: 'later' });

    expect(earlier.totalMinutes).toBe(60);
    expect(later.totalMinutes).toBe(120);
  });

  it('rejects nonexistent DST spring-forward times', () => {
    expect(() =>
      zonedLocalToUtc(
        { year: 2026, month: 3, day: 8, hour: 2, minute: 30 },
        'America/New_York',
      ),
    ).toThrow('does not exist');
  });

  it('counts exclusive and inclusive intervals', () => {
    const start = parseDateInput('2026-08-19');
    const end = parseDateInput('2026-08-20');
    expect(intervalDays(start, end, false)).toBe(1);
    expect(intervalDays(start, end, true)).toBe(2);
  });

  it('finds the next birthday and weekday', () => {
    const result = nextBirthday(parseDateInput('2000-01-15'), parseDateInput('2026-08-19'));
    expect(result.nextBirthday).toEqual({ year: 2027, month: 1, day: 15 });
    expect(result.daysUntil).toBeGreaterThan(0);
    expect(result.ageTurning).toBe(27);
  });

  it('returns an absolute age difference', () => {
    const forward = ageDifference(parseDateInput('2000-01-01'), parseDateInput('2010-06-01'));
    const reverse = ageDifference(parseDateInput('2010-06-01'), parseDateInput('2000-01-01'));
    expect(reverse).toEqual(forward);
    expect(forward.years).toBe(10);
    expect(forward.months).toBe(5);
  });
});
