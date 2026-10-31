import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ResultCard } from '../src/components/ResultCard';
import type { AgeBreakdown } from '../src/types/models';

const result: AgeBreakdown = {
  years: 20,
  months: 2,
  days: 3,
  hours: 4,
  minutes: 5,
  totalDays: 7368,
  totalHours: 176836,
  totalMinutes: 10610165,
};

describe('ResultCard', () => {
  it('hides exact clock units when time precision is disabled', () => {
    render(
      <ResultCard
        result={result}
        showTime={false}
        onPrint={vi.fn()}
        onShare={vi.fn()}
      />,
    );

    expect(screen.getByText('Years')).toBeInTheDocument();
    expect(screen.getByText('Months')).toBeInTheDocument();
    expect(screen.getByText('Days')).toBeInTheDocument();
    expect(screen.queryByText('Hours')).not.toBeInTheDocument();
    expect(screen.queryByText('Minutes')).not.toBeInTheDocument();
    expect(screen.getByText('Total hours')).toBeInTheDocument();
    expect(screen.getByText('Total minutes')).toBeInTheDocument();
  });

  it('shows exact clock units when time precision is enabled', () => {
    render(
      <ResultCard
        result={result}
        showTime
        onPrint={vi.fn()}
        onShare={vi.fn()}
      />,
    );

    expect(screen.getByText('Hours')).toBeInTheDocument();
    expect(screen.getByText('Minutes')).toBeInTheDocument();
  });
});
