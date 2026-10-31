import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DurationVisualization } from '../src/components/DurationVisualization';

describe('DurationVisualization', () => {
  it('exposes an accessible exact calendar summary', () => {
    render(
      <DurationVisualization
        result={{
          years: 10,
          months: 5,
          days: 3,
          hours: 0,
          minutes: 0,
          totalDays: 3807,
          totalHours: 91368,
          totalMinutes: 5482080,
        }}
        startLabel="2000-01-01"
        endLabel="2010-06-04"
      />,
    );

    expect(screen.getByRole('img')).toHaveAccessibleName(
      '10 years, 5 months, and 3 days between 2000-01-01 and 2010-06-04.',
    );
    expect(screen.getByText('Earlier date').nextSibling).toHaveTextContent('2000-01-01');
    expect(screen.getByText('Later date').nextSibling).toHaveTextContent('2010-06-04');
  });

  it('renders a zero-duration track without losing the exact values', () => {
    render(
      <DurationVisualization
        result={{
          years: 0,
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          totalDays: 0,
          totalHours: 0,
          totalMinutes: 0,
        }}
        startLabel="2026-08-19"
        endLabel="2026-08-19"
      />,
    );

    expect(screen.getByRole('img')).toHaveAccessibleName(
      '0 years, 0 months, and 0 days between 2026-08-19 and 2026-08-19.',
    );
    expect(screen.getAllByText('0')).toHaveLength(3);
  });
});
