import { bench, describe } from 'vitest';
import { calculateAge } from '../src/domain/dateMath';

const input = {
  birth: { year: 1998, month: 11, day: 27, hour: 8, minute: 45 },
  reference: { year: 2026, month: 8, day: 19, hour: 16, minute: 15 },
  timeZone: 'Asia/Kolkata',
  includeTime: true,
  leapDayPolicy: 'feb28' as const,
};

describe('date math benchmark', () => {
  bench('calculate timezone-aware age', () => {
    calculateAge(input);
  });
});
