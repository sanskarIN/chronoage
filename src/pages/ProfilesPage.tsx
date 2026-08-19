import { useMemo, useRef, useState } from 'react';
import type { SavedProfile } from '../types/models';
import {
  clearProfiles,
  deleteProfile,
  exportProfiles,
  importProfiles,
  loadProfiles,
  MAX_PROFILES,
  restoreProfile,
  saveProfile,
  updateProfile,
} from '../storage/profiles';
import { defaultBirthInputValue } from '../utils/dateDefaults';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icons';

interface ProfilesPageProps {
  onUseProfile: (profile: SavedProfile) => void;
}

export function ProfilesPage({ onUseProfile }: ProfilesPageProps): React.JSX.Element {
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => loadProfiles());
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(defaultBirthInputValue());
  const [query, setQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<SavedProfile | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const filteredProfiles = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    if (!normalized) return profiles;
    return profiles.filter(
      (profile) =>
        profile.name.toLocaleLowerCase().includes(normalized) || profile.birthDate.includes(normalized),
    );
  }, [profiles, query]);

  const resetEditor = (): void => {
    setEditingId(null);
    setName('');
    setBirthDate(defaultBirthInputValue());
  };

  const submitProfile = (): void => {
    try {
      if (editingId) {
        updateProfile(editingId, { name, birthDate });
        setMessage('Profile updated locally.');
      } else {
        saveProfile({ name, birthDate });
        setMessage('Profile saved locally on this device.');
      }
      setProfiles(loadProfiles());
      setLastDeleted(null);
      setError('');
      resetEditor();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save profile.');
    }
  };

  const beginEdit = (profile: SavedProfile): void => {
    setEditingId(profile.id);
    setName(profile.name);
    setBirthDate(profile.birthDate);
    setMessage('');
    setError('');
  };

  const removeProfile = (profile: SavedProfile): void => {
    setProfiles(deleteProfile(profile.id));
    setLastDeleted(profile);
    setMessage('Profile deleted.');
    if (editingId === profile.id) resetEditor();
  };

  const undoDelete = (): void => {
    if (!lastDeleted) return;
    try {
      setProfiles(restoreProfile(lastDeleted));
      setLastDeleted(null);
      setMessage('Profile restored.');
      setError('');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to restore profile.');
    }
  };

  const downloadBackup = (): void => {
    const blob = new Blob([exportProfiles()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `chronoage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Exported backup is plain JSON. Keep the file private.');
    setLastDeleted(null);
  };

  const restoreBackup = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      setProfiles(importProfiles(text));
      setError('');
      setLastDeleted(null);
      setMessage('Backup restored successfully.');
      resetEditor();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to import backup.');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Private by design"
        title="Saved profiles"
        description="Keep frequently used birth dates in browser storage. Nothing is uploaded by ChronoAge."
        action={
          <span className="privacy-chip">
            {profiles.length}/{MAX_PROFILES} profiles
          </span>
        }
      />
      <section className="panel">
        <div className="section-heading">
          <h2>{editingId ? 'Edit profile' : 'Add profile'}</h2>
          <span className="muted">Local storage only</span>
        </div>
        <div className="form-grid profile-form">
          <Field
            label="Name"
            value={name}
            maxLength={80}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Alex"
          />
          <Field
            label="Birth date"
            type="date"
            value={birthDate}
            min="0001-01-01"
            max="9999-12-31"
            onChange={(event) => setBirthDate(event.target.value)}
          />
          <div className="button-row align-end">
            <button type="button" className="primary-button" onClick={submitProfile}>
              {editingId ? 'Update profile' : 'Save profile'}
            </button>
            {editingId && (
              <button type="button" className="secondary-button" onClick={resetEditor}>
                Cancel
              </button>
            )}
          </div>
        </div>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <div className="status-row" role="status">
            <span>{message}</span>
            {lastDeleted && (
              <button type="button" className="text-button" onClick={undoDelete}>
                Undo
              </button>
            )}
          </div>
        )}
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Backup</p>
            <h2>Data controls</h2>
          </div>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={downloadBackup}>
              <Icon name="download" /> Export
            </button>
            <button type="button" className="secondary-button" onClick={() => fileRef.current?.click()}>
              <Icon name="upload" /> Import
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void restoreBackup(file);
                event.currentTarget.value = '';
              }}
            />
          </div>
        </div>
        <p className="muted">
          Export creates a plain JSON backup. Treat it like any file containing personal dates.
        </p>
      </section>
      {profiles.length > 0 && (
        <section className="panel profile-filter">
          <Field
            label="Filter profiles"
            type="search"
            value={query}
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name or YYYY-MM-DD"
          />
        </section>
      )}
      {profiles.length === 0 ? (
        <section className="panel">
          <EmptyState
            icon="profiles"
            title="No profiles saved"
            description="Add a profile above when you want a reusable local birth date."
          />
        </section>
      ) : filteredProfiles.length === 0 ? (
        <section className="panel">
          <EmptyState
            icon="search"
            title="No matching profiles"
            description="Try a different name or date, or clear the filter."
          />
        </section>
      ) : (
        <section className="profile-list" aria-label="Saved profiles">
          {filteredProfiles.map((profile) => (
            <article className="profile-card" key={profile.id}>
              <div className="avatar" aria-hidden="true">
                {profile.name.slice(0, 1).toUpperCase()}
              </div>
              <div className="profile-copy">
                <strong>{profile.name}</strong>
                <span>{profile.birthDate}</span>
              </div>
              <div className="profile-actions">
                <button
                  type="button"
                  className="secondary-button profile-action"
                  onClick={() => onUseProfile(profile)}
                >
                  Calculate
                </button>
                <button
                  type="button"
                  className="secondary-button profile-action"
                  onClick={() => beginEdit(profile)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={() => removeProfile(profile)}
                  aria-label={`Delete ${profile.name}`}
                >
                  <Icon name="trash" />
                </button>
              </div>
            </article>
          ))}
          <button
            type="button"
            className="text-button danger-text"
            onClick={() => {
              if (window.confirm('Delete all locally saved profiles?')) {
                clearProfiles();
                setProfiles([]);
                setLastDeleted(null);
                setQuery('');
                resetEditor();
                setMessage('All profiles deleted.');
              }
            }}
          >
            Delete all profiles
          </button>
        </section>
      )}
    </div>
  );
}
