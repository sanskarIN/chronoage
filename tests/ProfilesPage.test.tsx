import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfilesPage } from '../src/pages/ProfilesPage';
import { clearProfiles, loadProfiles, saveProfile } from '../src/storage/profiles';

describe('ProfilesPage', () => {
  beforeEach(() => clearProfiles());

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
});
