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

  it('reveals large profile collections in bounded batches', async () => {
    for (let index = 0; index < 21; index += 1) {
      saveProfile({ name: `Profile ${index}`, birthDate: '2000-01-01' });
    }
    const user = userEvent.setup();

    render(<ProfilesPage />);

    expect(screen.getAllByRole('article')).toHaveLength(20);
    expect(screen.getByText('Rendered 20 of 21 matching profiles.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show more profiles' }));

    expect(screen.getAllByRole('article')).toHaveLength(21);
    expect(screen.queryByRole('button', { name: 'Show more profiles' })).not.toBeInTheDocument();
  });

  it('passes a saved profile to the calculator action', async () => {
    const profile = saveProfile({ name: 'Open me', birthDate: '2004-05-06' });
    const onUseProfile = vi.fn();
    const user = userEvent.setup();

    render(<ProfilesPage onUseProfile={onUseProfile} />);
    await user.click(screen.getByRole('button', { name: 'Age: Open me' }));

    expect(onUseProfile).toHaveBeenCalledTimes(1);
    expect(onUseProfile).toHaveBeenCalledWith(profile);
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
    expect(screen.getByText('Deleted profile restored.')).toHaveAttribute('role', 'status');
  });

  it('restores a deleted profile to its original card position', async () => {
    saveProfile({ name: 'Alpha', birthDate: '2000-01-01' });
    saveProfile({ name: 'Beta', birthDate: '2001-01-01' });
    saveProfile({ name: 'Gamma', birthDate: '2002-01-01' });
    const user = userEvent.setup();

    render(<ProfilesPage />);
    await user.click(screen.getByRole('button', { name: 'Delete Beta' }));
    await user.click(screen.getByRole('button', { name: 'Undo delete' }));

    const names = screen
      .getAllByRole('article')
      .map((article) => article.querySelector('strong')?.textContent);
    expect(names).toEqual(['Gamma', 'Beta', 'Alpha']);
  });

  it('expires stale delete undo after a new profile is saved', async () => {
    saveProfile({ name: 'Old profile', birthDate: '2000-01-01' });
    const user = userEvent.setup();

    render(<ProfilesPage />);
    await user.click(screen.getByRole('button', { name: 'Delete Old profile' }));
    expect(screen.getByRole('button', { name: 'Undo delete' })).toBeInTheDocument();

    await user.type(screen.getByLabelText('Name'), 'Replacement');
    const birthDate = screen.getByLabelText('Birth date');
    await user.clear(birthDate);
    await user.type(birthDate, '2002-03-04');
    await user.click(screen.getByRole('button', { name: 'Save profile' }));

    expect(screen.queryByRole('button', { name: 'Undo delete' })).not.toBeInTheDocument();
    expect(loadProfiles()).toHaveLength(1);
    expect(loadProfiles()[0]?.name).toBe('Replacement');
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
