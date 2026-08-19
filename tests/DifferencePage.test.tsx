import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DifferencePage } from '../src/pages/DifferencePage';
import { DEFAULT_SETTINGS } from '../src/storage/settings';

describe('DifferencePage', () => {
  it('keeps the visualization chronologically ordered when inputs are reversed', () => {
    render(<DifferencePage settings={DEFAULT_SETTINGS} />);

    fireEvent.change(screen.getByLabelText('First date'), { target: { value: '2010-06-01' } });
    fireEvent.change(screen.getByLabelText('Second date'), { target: { value: '2000-01-01' } });

    expect(screen.getByText('Earlier date').nextSibling).toHaveTextContent('2000-01-01');
    expect(screen.getByText('Later date').nextSibling).toHaveTextContent('2010-06-01');
    expect(screen.getByRole('img')).toHaveAccessibleName(
      '10 years, 5 months, and 0 days between 2000-01-01 and 2010-06-01.',
    );
  });
});
