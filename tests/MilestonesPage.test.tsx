import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MilestonesPage } from '../src/pages/MilestonesPage';
import { DEFAULT_SETTINGS } from '../src/storage/settings';

describe('MilestonesPage', () => {
  it('updates the custom milestone from accessible form controls', () => {
    render(<MilestonesPage settings={DEFAULT_SETTINGS} />);

    fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Milestone unit'), { target: { value: 'years' } });

    expect(screen.getByText('25th birthday')).toBeInTheDocument();
    expect(screen.getByText(/Wednesday · 2025-01-01/)).toBeInTheDocument();
  });

  it('shows custom validation feedback without hiding built-in milestones', () => {
    render(<MilestonesPage settings={DEFAULT_SETTINGS} />);

    fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('As of'), { target: { value: '2026-01-01' } });
    expect(screen.getByText('1,000 days')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '0' } });

    expect(screen.getByRole('alert')).toHaveTextContent('positive whole number');
    expect(screen.getByText('1,000 days')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Calculated milestones' })).toBeInTheDocument();
  });

  it('keeps the supported timeline usable near year 9999', () => {
    render(<MilestonesPage settings={DEFAULT_SETTINGS} />);

    fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '9998-01-01' } });
    fireEvent.change(screen.getByLabelText('As of'), { target: { value: '9999-01-01' } });
    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Milestone unit'), { target: { value: 'years' } });

    expect(screen.getAllByText('1st birthday')).toHaveLength(2);
    expect(screen.getAllByText(/9999-01-01/)).toHaveLength(2);
    expect(screen.queryByText(/Unable to calculate milestones/)).not.toBeInTheDocument();
  });
});
