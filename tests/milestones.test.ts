import { describe, expect, it } from 'vitest';
import { calculateCustomMilestone, calculateMilestones } from '../src/domain/milestones';

describe('milestones', () => {
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

  it('calculates a custom day milestone', () => {
    const item = calculateCustomMilestone(
      { year: 2000, month: 1, day: 1 },
      { year: 2026, month: 8, day: 19 },
      10_000,
      'days',
    );
    expect(item.label).toBe('10,000 days');
    expect(item.date).toEqual({ year: 2027, month: 5, day: 19 });
    expect(item.reached).toBe(false);
  });

  it('calculates custom birthday milestones with the configured leap-day rule', () => {
    const february = calculateCustomMilestone(
      { year: 2000, month: 2, day: 29 },
      { year: 2000, month: 3, day: 1 },
      1,
      'years',
      'feb28',
    );
    const march = calculateCustomMilestone(
      { year: 2000, month: 2, day: 29 },
      { year: 2000, month: 3, day: 1 },
      1,
      'years',
      'mar1',
    );
    expect(february.date).toEqual({ year: 2001, month: 2, day: 28 });
    expect(march.date).toEqual({ year: 2001, month: 3, day: 1 });
  });

  it('rejects non-positive or fractional custom amounts', () => {
    const birth = { year: 2000, month: 1, day: 1 };
    const reference = { year: 2026, month: 8, day: 19 };
    expect(() => calculateCustomMilestone(birth, reference, 0, 'days')).toThrow('positive whole number');
    expect(() => calculateCustomMilestone(birth, reference, 1.5, 'years')).toThrow('positive whole number');
  });
});
