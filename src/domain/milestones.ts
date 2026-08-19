import {
  addDays,
  addYearsClamped,
  compareLocalDate,
  DateCalculationError,
  isValidLocalDate,
  weekdayName,
} from './dateMath';
import type { LeapDayPolicy, LocalDate, Milestone } from '../types/models';

const DAY_MILESTONES = [1_000, 5_000, 10_000, 15_000, 20_000, 25_000, 30_000];
const YEAR_MILESTONES = [1, 5, 10, 13, 16, 18, 21, 25, 30, 40, 50, 60, 75, 100];

export type CustomMilestoneUnit = 'days' | 'years';

export function calculateMilestones(
  birth: LocalDate,
  reference: LocalDate,
  leapDayPolicy: LeapDayPolicy = 'feb28',
  locale = 'en-US',
): Milestone[] {
  const byDays = DAY_MILESTONES.map((days) => {
    const date = addDays(birth, days);
    return {
      label: `${days.toLocaleString(locale)} days`,
      date,
      weekday: weekdayName(date, locale),
      reached: compareLocalDate(date, reference) <= 0,
    };
  });

  const byYears = YEAR_MILESTONES.map((years) => {
    const date = addYearsClamped(birth, years, leapDayPolicy);
    return {
      label: `${years}${ordinalSuffix(years)} birthday`,
      date,
      weekday: weekdayName(date, locale),
      reached: compareLocalDate(date, reference) <= 0,
    };
  });

  return [...byDays, ...byYears].sort((a, b) => compareLocalDate(a.date, b.date));
}

export function calculateCustomMilestone(
  birth: LocalDate,
  reference: LocalDate,
  amount: number,
  unit: CustomMilestoneUnit,
  leapDayPolicy: LeapDayPolicy = 'feb28',
  locale = 'en-US',
): Milestone {
  if (!Number.isInteger(amount) || amount < 1) {
    throw new DateCalculationError('Milestone amount must be a positive whole number.');
  }
  if (!isValidLocalDate(birth) || !isValidLocalDate(reference)) {
    throw new DateCalculationError('Enter valid milestone dates.');
  }

  const date = unit === 'days' ? addDays(birth, amount) : addYearsClamped(birth, amount, leapDayPolicy);
  if (!isValidLocalDate(date)) {
    throw new DateCalculationError('Milestone falls outside the supported calendar range.');
  }

  const label =
    unit === 'days'
      ? `${amount.toLocaleString(locale)} days`
      : `${amount}${ordinalSuffix(amount)} birthday`;

  return {
    label,
    date,
    weekday: weekdayName(date, locale),
    reached: compareLocalDate(date, reference) <= 0,
  };
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
