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

  it('opens quick actions with the toolbar button', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: /quick actions/i }));
    expect(screen.getByRole('dialog', { name: 'Quick actions' })).toBeInTheDocument();
  });
});
