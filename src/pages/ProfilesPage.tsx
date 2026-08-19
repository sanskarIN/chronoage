import { useMemo, useRef, useState } from 'react';
import type { SavedProfile } from '../types/models';
import {
  clearProfiles,
  deleteProfile,
  exportProfiles,
  importProfiles,
  loadProfiles,
  MAX_BACKUP_FILE_BYTES,
  restoreProfile,
  saveProfile,
  updateProfile,
} from '../storage/profiles';
import { getUserSafeErrorMessage, UserVisibleError } from '../errors';
import { defaultBirthInputValue } from '../utils/dateDefaults';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icons';
import { en } from '../i18n/en';

const PROFILE_PAGE_SIZE = 20;

export function ProfilesPage({
  onUseProfile,
}: {
  onUseProfile?: (profile: SavedProfile) => void;
}): React.JSX.Element {
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => loadProfiles());
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(defaultBirthInputValue());
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PROFILE_PAGE_SIZE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [recentlyDeleted, setRecentlyDeleted] = useState<SavedProfile | null>(null);
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
  const visibleProfiles = filteredProfiles.slice(0, visibleCount);

  const addProfile = (): void => {
    try {
      saveProfile({ name, birthDate });
      setProfiles(loadProfiles());
      setName('');
      setRecentlyDeleted(null);
      setError('');
      setMessage(en.profiles.saved);
    } catch (caught) {
      setError(getUserSafeErrorMessage(caught, en.profiles.unableSave));
    }
  };

  const removeProfile = (id: string): void => {
    const profile = profiles.find((entry) => entry.id === id);
    if (!profile) return;
    try {
      setProfiles(deleteProfile(id));
      setRecentlyDeleted(profile);
      if (editingId === id) setEditingId(null);
      setError('');
      setMessage(en.profiles.deleted);
    } catch (caught) {
      setError(getUserSafeErrorMessage(caught, en.profiles.unableDelete));
    }
  };

  const undoDelete = (): void => {
    if (!recentlyDeleted) return;
    try {
      setProfiles(restoreProfile(recentlyDeleted));
      setRecentlyDeleted(null);
      setError('');
      setMessage(en.profiles.restoredDeleted);
    } catch (caught) {
      setError(getUserSafeErrorMessage(caught, en.profiles.unableRestore));
    }
  };

  const beginEdit = (profile: SavedProfile): void => {
    setEditingId(profile.id);
    setEditName(profile.name);
    setEditBirthDate(profile.birthDate);
    setError('');
    setMessage('');
  };

  const saveEdit = (): void => {
    if (!editingId) return;
    try {
      updateProfile(editingId, { name: editName, birthDate: editBirthDate });
      setProfiles(loadProfiles());
      setEditingId(null);
      setError('');
      setMessage(en.profiles.updated);
    } catch (caught) {
      setError(getUserSafeErrorMessage(caught, en.profiles.unableUpdate));
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
    setMessage(en.profiles.backupWarning);
  };

  const restoreBackup = async (file: File): Promise<void> => {
    try {
      if (file.size > MAX_BACKUP_FILE_BYTES) throw new UserVisibleError(en.profiles.backupTooLarge);
      const text = await file.text();
      setProfiles(importProfiles(text));
      setEditingId(null);
      setRecentlyDeleted(null);
      setVisibleCount(PROFILE_PAGE_SIZE);
      setError('');
      setMessage(en.profiles.restored);
    } catch (caught) {
      setError(getUserSafeErrorMessage(caught, en.profiles.unableImport));
    }
  };

  const deleteAllProfiles = (): void => {
    if (!window.confirm(en.profiles.deleteAllConfirm)) return;
    try {
      clearProfiles();
      setProfiles([]);
      setEditingId(null);
      setRecentlyDeleted(null);
      setQuery('');
      setVisibleCount(PROFILE_PAGE_SIZE);
      setError('');
      setMessage(en.profiles.allDeleted);
    } catch (caught) {
      setError(getUserSafeErrorMessage(caught, en.profiles.unableClear));
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={en.profiles.eyebrow}
        title={en.profiles.title}
        description={en.profiles.description}
        action={<span className="privacy-chip">{en.profiles.count(profiles.length)}</span>}
      />
      <section className="panel">
        <div className="section-heading">
          <h2>{en.profiles.addTitle}</h2>
          <span className="muted">{en.profiles.localOnly}</span>
        </div>
        <div className="form-grid profile-form">
          <Field
            label={en.profiles.name}
            value={name}
            maxLength={80}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
            placeholder={en.profiles.namePlaceholder}
          />
          <Field
            label={en.profiles.birthDate}
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
          <button type="button" className="primary-button align-end" onClick={addProfile}>
            {en.profiles.save}
          </button>
        </div>
        {error && (
          <div className="alert error" role="alert">
            {error}
          </div>
        )}
        {message && (
          <p className="status-line" role="status">
            {message}
          </p>
        )}
        {recentlyDeleted && (
          <button type="button" className="text-button" onClick={undoDelete}>
            {en.profiles.undoDelete}
          </button>
        )}
      </section>
      <section className="panel">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{en.profiles.backupEyebrow}</p>
            <h2>{en.profiles.dataControls}</h2>
          </div>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={downloadBackup}>
              <Icon name="download" /> {en.profiles.export}
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => fileRef.current?.click()}
            >
              <Icon name="upload" /> {en.profiles.import}
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
        <p className="muted">{en.profiles.backupDescription}</p>
      </section>
      {profiles.length > 0 && (
        <section className="panel">
          <Field
            label={en.profiles.search}
            type="search"
            value={query}
            autoComplete="off"
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PROFILE_PAGE_SIZE);
            }}
            placeholder={en.profiles.searchPlaceholder}
          />
          <p className="muted" role="status">
            {en.profiles.showing(filteredProfiles.length, profiles.length)}
          </p>
        </section>
      )}
      {profiles.length === 0 ? (
        <section className="panel">
          <EmptyState
            icon="profiles"
            title={en.profiles.noProfiles}
            description={en.profiles.noProfilesDescription}
          />
        </section>
      ) : filteredProfiles.length === 0 ? (
        <section className="panel">
          <EmptyState
            icon="profiles"
            title={en.profiles.noMatches}
            description={en.profiles.noMatchesDescription}
          />
        </section>
      ) : (
        <section className="profile-list" aria-label={en.profiles.listLabel}>
          {visibleProfiles.map((profile) => (
            <article className="profile-card" key={profile.id}>
              {editingId === profile.id ? (
                <div className="profile-edit-form">
                  <Field
                    label={en.profiles.editName(profile.name)}
                    value={editName}
                    maxLength={80}
                    autoComplete="off"
                    onChange={(event) => setEditName(event.target.value)}
                  />
                  <Field
                    label={en.profiles.editBirthDate(profile.name)}
                    type="date"
                    value={editBirthDate}
                    onChange={(event) => setEditBirthDate(event.target.value)}
                  />
                  <div className="button-row">
                    <button type="button" className="primary-button" onClick={saveEdit}>
                      {en.profiles.saveChanges}
                    </button>
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => setEditingId(null)}
                    >
                      {en.profiles.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="avatar" aria-hidden="true">
                    {profile.name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="profile-copy">
                    <strong>{profile.name}</strong>
                    <span>{profile.birthDate}</span>
                  </div>
                  <div className="button-row">
                    {onUseProfile && (
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => onUseProfile(profile)}
                        aria-label={`${en.nav.calculate}: ${profile.name}`}
                      >
                        <Icon name="age" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="icon-button"
                      onClick={() => beginEdit(profile)}
                      aria-label={en.profiles.edit(profile.name)}
                    >
                      <Icon name="edit" />
                    </button>
                    <button
                      type="button"
                      className="icon-button danger"
                      onClick={() => removeProfile(profile.id)}
                      aria-label={en.profiles.delete(profile.name)}
                    >
                      <Icon name="trash" />
                    </button>
                  </div>
                </>
              )}
            </article>
          ))}
          {visibleProfiles.length < filteredProfiles.length && (
            <div className="panel">
              <p className="muted" role="status">
                {en.profiles.rendered(visibleProfiles.length, filteredProfiles.length)}
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={() => setVisibleCount((count) => count + PROFILE_PAGE_SIZE)}
              >
                {en.profiles.showMore}
              </button>
            </div>
          )}
          <button type="button" className="text-button danger-text" onClick={deleteAllProfiles}>
            {en.profiles.deleteAll}
          </button>
        </section>
      )}
    </div>
  );
}
