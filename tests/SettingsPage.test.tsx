import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SettingsPage } from '../src/pages/SettingsPage';
import { DEFAULT_SETTINGS } from '../src/storage/settings';

describe('SettingsPage', () => {
  it('does not persist an invalid timezone draft', () => {
    const onChange = vi.fn();
    render(<SettingsPage settings={{ ...DEFAULT_SETTINGS, defaultTimeZone: 'UTC' }} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Default timezone'), { target: { value: 'Not/AZone' } });

    expect(screen.getByLabelText('Default timezone')).toHaveValue('Not/AZone');
    expect(screen.getByText(/Enter a valid IANA timezone identifier/)).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('persists any browser-supported IANA timezone, including non-preset values', () => {
    const onChange = vi.fn();
    render(<SettingsPage settings={{ ...DEFAULT_SETTINGS, defaultTimeZone: 'UTC' }} onChange={onChange} />);

    fireEvent.change(screen.getByLabelText('Default timezone'), {
      target: { value: 'Pacific/Auckland' },
    });

    expect(screen.getByLabelText('Default timezone')).toHaveValue('Pacific/Auckland');
    expect(screen.queryByText(/Enter a valid IANA timezone identifier/)).not.toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith({
      ...DEFAULT_SETTINGS,
      defaultTimeZone: 'Pacific/Auckland',
    });
  });
});
