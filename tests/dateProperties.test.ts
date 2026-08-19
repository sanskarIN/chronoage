import { describe, expect, it } from 'vitest';
import {
  addDays,
  ageDifference,
  compareLocalDate,
  fromEpochDay,
  isValidLocalDate,
  toEpochDay,
} from '../src/domain/dateMath';
import type { LeapDayPolicy, LocalDate } from '../src/types/models';

function seededDates(count: number): LocalDate[] {
  let state = 0x5eed1234;
  const next = (): number => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state;
  };

  const result: LocalDate[] = [];
  let cursor: LocalDate = { year: 1900, month: 1, day: 1 };
  for (let index = 0; index < count; index += 1) {
    if (cursor.year > 9800) cursor = { year: 1900 + (next() % 100), month: 1, day: 1 };
    cursor = addDays(cursor, next() % 45_000);
    if (cursor.year > 9800) cursor = { year: 1900 + (next() % 100), month: 1, day: 1 };
    result.push(cursor);
  }
  return result;
}

describe('calendar invariants', () => {
  it('round-trips epoch days for a deterministic fuzz corpus', () => {
    for (const date of seededDates(500)) {
      expect(isValidLocalDate(date)).toBe(true);
      expect(fromEpochDay(toEpochDay(date))).toEqual(date);
    }
  });

  it('keeps absolute age difference symmetric', () => {
    const values = seededDates(80);
    for (let index = 1; index < values.length; index += 1) {
      const first = values[index - 1];
      const second = values[index];
      if (!first || !second) continue;
      expect(ageDifference(first, second)).toEqual(ageDifference(second, first));
    }
  });

  it('keeps calendar difference components canonical under both leap-day policies', () => {
    const values = seededDates(120);
    const policies: LeapDayPolicy[] = ['feb28', 'mar1'];
    for (const policy of policies) {
      for (let index = 1; index < values.length; index += 1) {
        const first = values[index - 1];
        const second = values[index];
        if (!first || !second) continue;
        const result = ageDifference(first, second, policy);
        expect(result.years).toBeGreaterThanOrEqual(0);
        expect(result.months).toBeGreaterThanOrEqual(0);
        expect(result.months).toBeLessThan(12);
        expect(result.days).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('preserves ordering when adding positive days', () => {
    for (const date of seededDates(120)) {
      expect(compareLocalDate(addDays(date, 1), date)).toBeGreaterThan(0);
    }
  });
});
