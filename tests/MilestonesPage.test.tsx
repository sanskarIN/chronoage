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

  it('shows validation feedback for invalid custom milestone amounts', () => {
    render(<MilestonesPage settings={DEFAULT_SETTINGS} />);

    fireEvent.change(screen.getByLabelText('Amount'), { target: { value: '0' } });

    expect(screen.getByRole('alert')).toHaveTextContent('positive whole number');
  });
});
