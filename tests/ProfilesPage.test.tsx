import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilesPage } from '../src/pages/ProfilesPage';
import { clearProfiles, loadProfiles, saveProfile } from '../src/storage/profiles';

describe('ProfilesPage', () => {
  beforeEach(() => clearProfiles());

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('filters saved profiles by name without deleting hidden entries', async () => {
    saveProfile({ name: 'Alex', birthDate: '2000-01-01' });
    saveProfile({ name: 'Jordan', birthDate: '2001-02-03' });
    const user = userEvent.setup();

    render(<ProfilesPage />);
    await user.type(screen.getByLabelText('Search saved profiles'), 'Alex');

    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.queryByText('Jordan')).not.toBeInTheDocument();
    expect(loadProfiles()).toHaveLength(2);
  });

  it('edits a saved profile through the UI', async () => {
    saveProfile({ name: 'Before', birthDate: '2000-01-01' });
    const user = userEvent.setup();

    render(<ProfilesPage />);
    await user.click(screen.getByRole('button', { name: 'Edit Before' }));

    const name = screen.getByLabelText('Name for Before');
    await user.clear(name);
    await user.type(name, 'After');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    expect(screen.getByText('After')).toBeInTheDocument();
    expect(loadProfiles()[0]?.name).toBe('After');
  });

  it('restores the most recently deleted profile through undo', async () => {
    const original = saveProfile({ name: 'Recoverable', birthDate: '2000-01-01' });
    const user = userEvent.setup();

    render(<ProfilesPage />);
    await user.click(screen.getByRole('button', { name: 'Delete Recoverable' }));

    expect(screen.queryByText('Recoverable')).not.toBeInTheDocument();
    expect(loadProfiles()).toEqual([]);

    await user.click(screen.getByRole('button', { name: 'Undo delete' }));

    expect(screen.getByText('Recoverable')).toBeInTheDocument();
    expect(loadProfiles()).toEqual([original]);
    expect(screen.getByRole('status')).toHaveTextContent('Deleted profile restored.');
  });

  it('shows a safe error when deleting cannot write browser storage', async () => {
    saveProfile({ name: 'Blocked', birthDate: '2000-01-01' });
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const user = userEvent.setup();
    render(<ProfilesPage />);

    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Quota reached', 'QuotaExceededError');
    });
    await user.click(screen.getByRole('button', { name: 'Delete Blocked' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Browser storage is unavailable. Changes could not be saved.',
    );
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('shows a safe error when clearing cannot remove browser storage', async () => {
    saveProfile({ name: 'Blocked', birthDate: '2000-01-01' });
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    render(<ProfilesPage />);

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    await user.click(screen.getByRole('button', { name: 'Delete all profiles' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Browser storage is unavailable. Changes could not be saved.',
    );
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });
});
