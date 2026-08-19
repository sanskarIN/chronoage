import {
  addDays,
  addYearsClamped,
  compareLocalDate,
  DateCalculationError,
  isValidLocalDate,
  toEpochDay,
  weekdayName,
} from './dateMath';
import type { LeapDayPolicy, LocalDate, Milestone } from '../types/models';

const DAY_MILESTONES = [1_000, 5_000, 10_000, 15_000, 20_000, 25_000, 30_000];
const YEAR_MILESTONES = [1, 5, 10, 13, 16, 18, 21, 25, 30, 40, 50, 60, 75, 100];
const MAX_EPOCH_DAY = toEpochDay({ year: 9999, month: 12, day: 31 });

export function calculateMilestones(
  birth: LocalDate,
  reference: LocalDate,
  leapDayPolicy: LeapDayPolicy = 'feb28',
  locale = 'en-US',
): Milestone[] {
  if (!isValidLocalDate(birth) || !isValidLocalDate(reference)) {
    throw new DateCalculationError('Enter valid birth and reference dates.');
  }
  if (compareLocalDate(birth, reference) > 0) {
    throw new DateCalculationError('Birth date must not be after the reference date.');
  }

  const milestones: Milestone[] = [];
  const birthEpochDay = toEpochDay(birth);

  for (const days of DAY_MILESTONES) {
    if (birthEpochDay + days > MAX_EPOCH_DAY) continue;
    const date = addDays(birth, days);
    milestones.push({
      label: `${days.toLocaleString(locale)} days`,
      date,
      weekday: weekdayName(date, locale),
      reached: compareLocalDate(date, reference) <= 0,
    });
  }

  for (const years of YEAR_MILESTONES) {
    if (birth.year + years > 9999) continue;
    const date = addYearsClamped(birth, years, leapDayPolicy);
    milestones.push({
      label: `${years}${ordinalSuffix(years)} birthday`,
      date,
      weekday: weekdayName(date, locale),
      reached: compareLocalDate(date, reference) <= 0,
    });
  }

  return milestones.sort((a, b) => compareLocalDate(a.date, b.date));
}

function ordinalSuffix(value: number): string {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (value % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}
