import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';

beforeEach(() => {
  localStorage.clear();
  localStorage.setItem('chronoage.settings.v1', JSON.stringify({ onboardingComplete: true, theme: 'system' }));
});

describe('App', () => {
  it('renders the calculator and navigates to date interval', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { name: 'How much time has passed?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Interval' }));
    expect(screen.getByRole('heading', { name: 'Date interval' })).toBeInTheDocument();
  });

  it('opens quick actions with the toolbar button and restores focus on Escape', async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole('button', { name: /quick actions/i });

    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Quick actions' });
    expect(dialog).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Quick actions' })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('wraps focus inside the quick actions modal', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /quick actions/i }));

    const dialog = screen.getByRole('dialog', { name: 'Quick actions' });
    const actions = Array.from(dialog.querySelectorAll<HTMLButtonElement>('button'));
    expect(actions.length).toBeGreaterThan(1);
    expect(actions[0]).toHaveFocus();

    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(actions.at(-1)).toHaveFocus();

    await user.tab();
    expect(actions[0]).toHaveFocus();
  });

  it('toggles quick actions with the cross-platform keyboard shortcut', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.keyboard('{Control>}k{/Control}');
    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument();

    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog', { name: 'Quick actions' })).not.toBeInTheDocument();
  });

  it('does not open background quick actions while onboarding is active', async () => {
    const user = userEvent.setup();
    localStorage.clear();
    render(<App />);

    expect(screen.getByRole('dialog', { name: /time is personal/i })).toBeInTheDocument();
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog', { name: 'Quick actions' })).not.toBeInTheDocument();
  });
});
