import { addDays, addYearsClamped, compareLocalDate, weekdayName } from './dateMath';
import type { LeapDayPolicy, LocalDate, Milestone } from '../types/models';

const DAY_MILESTONES = [1_000, 5_000, 10_000, 15_000, 20_000, 25_000, 30_000];
const YEAR_MILESTONES = [1, 5, 10, 13, 16, 18, 21, 25, 30, 40, 50, 60, 75, 100];

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
