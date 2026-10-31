import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Onboarding } from '../src/components/Onboarding';

describe('Onboarding', () => {
  it('focuses the start action and keeps tab focus inside the modal', async () => {
    const user = userEvent.setup();
    render(<Onboarding onComplete={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    const start = screen.getByRole('button', { name: 'Start calculating' });
    expect(dialog).toBeInTheDocument();
    expect(start).toHaveFocus();

    await user.tab();
    expect(start).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(start).toHaveFocus();
  });

  it('completes only after the explicit start action', async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn();
    render(<Onboarding onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Start calculating' }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
