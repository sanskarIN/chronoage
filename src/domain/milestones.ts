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

function isRangeOverflow(error: unknown): boolean {
  return error instanceof DateCalculationError && error.message.includes('outside the supported range');
}

function assertMilestoneDates(birth: LocalDate, reference: LocalDate): void {
  if (!isValidLocalDate(birth) || !isValidLocalDate(reference)) {
    throw new DateCalculationError('Enter valid milestone dates.');
  }
  if (compareLocalDate(birth, reference) > 0) {
    throw new DateCalculationError('Birth date must not be after the reference date.');
  }
}

export function calculateMilestones(
  birth: LocalDate,
  reference: LocalDate,
  leapDayPolicy: LeapDayPolicy = 'feb28',
  locale = 'en-US',
): Milestone[] {
  assertMilestoneDates(birth, reference);

  const byDays = DAY_MILESTONES.flatMap((days): Milestone[] => {
    try {
      const date = addDays(birth, days);
      return [
        {
          label: `${days.toLocaleString(locale)} days`,
          date,
          weekday: weekdayName(date, locale),
          reached: compareLocalDate(date, reference) <= 0,
        },
      ];
    } catch (error) {
      if (isRangeOverflow(error)) return [];
      throw error;
    }
  });

  const byYears = YEAR_MILESTONES.flatMap((years): Milestone[] => {
    try {
      const date = addYearsClamped(birth, years, leapDayPolicy);
      return [
        {
          label: `${years}${ordinalSuffix(years)} birthday`,
          date,
          weekday: weekdayName(date, locale),
          reached: compareLocalDate(date, reference) <= 0,
        },
      ];
    } catch (error) {
      if (isRangeOverflow(error)) return [];
      throw error;
    }
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
  if (!Number.isSafeInteger(amount) || amount < 1) {
    throw new DateCalculationError('Milestone amount must be a positive whole number.');
  }
  assertMilestoneDates(birth, reference);

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
