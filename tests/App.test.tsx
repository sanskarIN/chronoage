import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { saveProfile } from '../src/storage/profiles';

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

  it('opens a saved profile directly in the calculator', async () => {
    saveProfile({ name: 'Saved person', birthDate: '2004-05-06' });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Profiles' }));
    await user.click(screen.getByRole('button', { name: 'Age: Saved person' }));

    expect(screen.getByRole('heading', { name: 'How much time has passed?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Birth date')).toHaveValue('2004-05-06');
  });

  it('opens quick actions with the toolbar button, isolates background content, and restores focus on Escape', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);
    const trigger = screen.getByRole('button', { name: /quick actions/i });

    await user.click(trigger);
    const dialog = screen.getByRole('dialog', { name: 'Quick actions' });
    expect(dialog).toBeInTheDocument();
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(container.querySelector('.content-shell')).toHaveAttribute('inert');
    expect(container.querySelector('.sidebar')).toHaveAttribute('inert');

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'Quick actions' })).not.toBeInTheDocument();
    expect(container.querySelector('.content-shell')).not.toHaveAttribute('inert');
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
    const { container } = render(<App />);

    expect(screen.getByRole('dialog', { name: /time is personal/i })).toBeInTheDocument();
    expect(container.querySelector('.content-shell')).toHaveAttribute('inert');
    expect(container.querySelector('.sidebar')).toHaveAttribute('inert');
    await user.keyboard('{Control>}k{/Control}');
    expect(screen.queryByRole('dialog', { name: 'Quick actions' })).not.toBeInTheDocument();
  });
});
