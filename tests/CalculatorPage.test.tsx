import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CalculatorPage } from '../src/pages/CalculatorPage';
import { DEFAULT_SETTINGS } from '../src/storage/settings';

describe('CalculatorPage', () => {
  it('prefills the birth date when opened from a saved profile', () => {
    render(
      <CalculatorPage
        settings={{ ...DEFAULT_SETTINGS, defaultTimeZone: 'UTC' }}
        initialBirthDate="2004-05-06"
      />,
    );

    expect(screen.getByLabelText('Birth date')).toHaveValue('2004-05-06');
  });

  it('shows the configured DST overlap policy when time precision is enabled', () => {
    render(
      <CalculatorPage
        settings={{ ...DEFAULT_SETTINGS, defaultTimeZone: 'America/New_York', dstAmbiguityPolicy: 'later' }}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Include time of day' }));

    expect(screen.getByLabelText('Timezone')).toHaveValue('America/New_York');
    expect(screen.getByText(/Repeated fall-back times use the later occurrence/)).toBeInTheDocument();
    expect(screen.getAllByText(/repeated fall-back times use the later occurrence/i)).toHaveLength(2);
  });

  it('accepts a valid IANA timezone that is not limited to the old preset selector', () => {
    render(<CalculatorPage settings={{ ...DEFAULT_SETTINGS, defaultTimeZone: 'UTC' }} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Include time of day' }));
    fireEvent.change(screen.getByLabelText('Timezone'), { target: { value: 'Pacific/Auckland' } });
    fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '2000-01-01' } });
    fireEvent.change(screen.getByLabelText('Reference date'), { target: { value: '2026-01-01' } });

    expect(screen.getByLabelText('Timezone')).toHaveValue('Pacific/Auckland');
    expect(screen.queryByText(/Enter a valid IANA timezone identifier/)).not.toBeInTheDocument();
    expect(screen.getByText('26 years old')).toBeInTheDocument();
  });

  it('shows an inline validation error for an unsupported timezone identifier', () => {
    render(<CalculatorPage settings={{ ...DEFAULT_SETTINGS, defaultTimeZone: 'UTC' }} />);

    fireEvent.click(screen.getByRole('checkbox', { name: 'Include time of day' }));
    fireEvent.change(screen.getByLabelText('Timezone'), { target: { value: 'Not/AZone' } });

    expect(screen.getByText(/Enter a valid IANA timezone identifier/)).toBeInTheDocument();
    expect(screen.getByLabelText('Timezone')).toHaveAttribute('aria-invalid', 'true');
  });

  it('reports a nonexistent local wall-clock time instead of normalizing it', () => {
    render(
      <CalculatorPage
        settings={{ ...DEFAULT_SETTINGS, defaultTimeZone: 'America/New_York' }}
      />,
    );

    fireEvent.click(screen.getByRole('checkbox', { name: 'Include time of day' }));
    fireEvent.change(screen.getByLabelText('Birth date'), { target: { value: '2026-03-08' } });
    fireEvent.change(screen.getByLabelText('Birth time'), { target: { value: '02:30' } });
    fireEvent.change(screen.getByLabelText('Reference date'), { target: { value: '2026-03-09' } });
    fireEvent.change(screen.getByLabelText('Reference time'), { target: { value: '03:30' } });

    expect(screen.getByRole('alert')).toHaveTextContent('does not exist');
  });
});
