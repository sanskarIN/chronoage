import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import App from '../src/App';
import { saveProfile } from '../src/storage/profiles';

beforeEach(() => {
  window.history.replaceState(null, '', '/');
  document.title = 'ChronoAge';
  localStorage.clear();
  localStorage.setItem('chronoage.settings.v1', JSON.stringify({ onboardingComplete: true, theme: 'system' }));
});

describe('App', () => {
  it('renders the calculator and navigates to date interval with a public page hash', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('heading', { name: 'How much time has passed?' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Interval' }));
    expect(screen.getByRole('heading', { name: 'Date interval' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/interval');
    expect(document.title).toBe('Interval · ChronoAge');
    expect(document.getElementById('main-content')).toHaveFocus();
  });

  it('waits for the mobile navigation layer to close before focusing routed content', async () => {
    const user = userEvent.setup();
    const { container } = render(<App />);

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(container.querySelector('.content-shell')).toHaveAttribute('inert');

    await user.click(screen.getByRole('button', { name: 'Interval' }));

    expect(container.querySelector('.content-shell')).not.toHaveAttribute('inert');
    expect(document.getElementById('main-content')).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Date interval' })).toBeInTheDocument();
  });

  it('opens a valid page deep link on initial render', () => {
    window.history.replaceState(null, '', '#/milestones');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Life milestones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Milestones' })).toHaveAttribute('aria-current', 'page');
    expect(document.title).toBe('Milestones · ChronoAge');
  });

  it('canonicalizes an invalid application route without treating regular anchors as routes', () => {
    window.history.replaceState(null, '', '#/not-a-page');

    render(<App />);

    expect(screen.getByRole('heading', { name: 'How much time has passed?' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/calculate');
    expect(document.title).toBe('Age · ChronoAge');
  });

  it('canonicalizes an invalid application route reached through browser history', async () => {
    render(<App />);
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Interval' }));

    await act(async () => {
      window.history.replaceState(null, '', '#/unknown-history-page');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(window.location.hash).toBe('#/calculate');
    expect(screen.getByRole('heading', { name: 'How much time has passed?' })).toBeInTheDocument();
    expect(document.title).toBe('Age · ChronoAge');
    expect(document.getElementById('main-content')).toHaveFocus();
  });

  it('responds to browser history navigation without exposing calculation inputs in the URL', async () => {
    render(<App />);

    await act(async () => {
      window.history.replaceState(null, '', '#/difference');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    expect(screen.getByRole('heading', { name: 'Age difference' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/difference');
    expect(window.location.href).not.toContain('birthDate');
    expect(document.title).toBe('Difference · ChronoAge');
    expect(document.getElementById('main-content')).toHaveFocus();
  });

  it('keeps the current route when skip navigation focuses main content', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Interval' }));
    const routeBeforeSkip = window.location.href;

    await user.click(screen.getByRole('link', { name: 'Skip to main content' }));

    expect(window.location.href).toBe(routeBeforeSkip);
    expect(window.location.hash).toBe('#/interval');
    expect(document.getElementById('main-content')).toHaveFocus();
    expect(screen.getByRole('heading', { name: 'Date interval' })).toBeInTheDocument();
  });

  it('ignores accessibility anchor fragments as page routes', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Interval' }));
    expect(screen.getByRole('heading', { name: 'Date interval' })).toBeInTheDocument();

    await act(async () => {
      window.history.replaceState(null, '', '#main-content');
      window.dispatchEvent(new HashChangeEvent('hashchange'));
    });

    expect(screen.getByRole('heading', { name: 'Date interval' })).toBeInTheDocument();
    expect(document.title).toBe('Interval · ChronoAge');
  });

  it('opens a saved profile directly in the calculator without serializing private dates', async () => {
    saveProfile({ name: 'Saved person', birthDate: '2004-05-06' });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Profiles' }));
    await user.click(screen.getByRole('button', { name: 'Age: Saved person' }));

    expect(screen.getByRole('heading', { name: 'How much time has passed?' })).toBeInTheDocument();
    expect(screen.getByLabelText('Birth date')).toHaveValue('2004-05-06');
    expect(window.location.hash).toBe('#/calculate');
    expect(window.location.href).not.toContain('2004-05-06');
    expect(document.title).toBe('Age · ChronoAge');
    expect(document.getElementById('main-content')).toHaveFocus();
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

  it('keeps focus on routed content when navigation occurs inside quick actions', async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole('button', { name: /quick actions/i });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Quick actions' });
    await user.click(dialog.getByRole('button', { name: /Interval/i }));

    expect(screen.queryByRole('dialog', { name: 'Quick actions' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Date interval' })).toBeInTheDocument();
    expect(window.location.hash).toBe('#/interval');
    expect(document.getElementById('main-content')).toHaveFocus();
    expect(trigger).not.toHaveFocus();
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
