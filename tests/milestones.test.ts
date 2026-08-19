import { expect, it } from 'vitest';
import { calculateMilestones } from '../src/domain/milestones';

it('includes the 10,000-day milestone', () => {
  const values = calculateMilestones(
    { year: 2000, month: 1, day: 1 },
    { year: 2026, month: 8, day: 19 },
  );
  const item = values.find((value) => value.label === '10,000 days');
  expect(item).toBeDefined();
  expect(item?.date).toEqual({ year: 2027, month: 5, day: 19 });
  expect(item?.reached).toBe(false);
});
