import { useRef, useState } from 'react';
import type { SavedProfile } from '../types/models';
import { clearProfiles, deleteProfile, exportProfiles, importProfiles, loadProfiles, saveProfile } from '../storage/profiles';
import { defaultBirthInputValue } from '../utils/dateDefaults';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/Icons';

export function ProfilesPage(): React.JSX.Element {
  const [profiles, setProfiles] = useState<SavedProfile[]>(() => loadProfiles());
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState(defaultBirthInputValue());
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const addProfile = (): void => {
    try {
      saveProfile({ name, birthDate });
      setProfiles(loadProfiles());
      setName('');
      setError('');
      setMessage('Profile saved locally on this device.');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save profile.');
    }
  };

  const removeProfile = (id: string): void => {
    setProfiles(deleteProfile(id));
    setMessage('Profile deleted.');
  };

  const downloadBackup = (): void => {
    const blob = new Blob([exportProfiles()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `chronoage-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('Encrypted storage is not implied: keep exported backup files private.');
  };

  const restoreBackup = async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      setProfiles(importProfiles(text));
      setError('');
      setMessage('Backup restored successfully.');
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
        action={<span className="privacy-chip">{profiles.length}/100 profiles</span>}
      />
      <section className="panel">
        <div className="section-heading"><h2>Add profile</h2><span className="muted">Local storage only</span></div>
        <div className="form-grid profile-form">
          <Field label="Name" value={name} maxLength={80} autoComplete="off" onChange={(event) => setName(event.target.value)} placeholder="e.g. Alex" />
          <Field label="Birth date" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          <button type="button" className="primary-button align-end" onClick={addProfile}>Save profile</button>
        </div>
        {error && <div className="alert error" role="alert">{error}</div>}
        {message && <p className="status-line" role="status">{message}</p>}
      </section>
      <section className="panel">
        <div className="section-heading">
          <div><p className="eyebrow">Backup</p><h2>Data controls</h2></div>
          <div className="button-row">
            <button type="button" className="secondary-button" onClick={downloadBackup}><Icon name="download" /> Export</button>
            <button type="button" className="secondary-button" onClick={() => fileRef.current?.click()}><Icon name="upload" /> Import</button>
            <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void restoreBackup(file);
              event.currentTarget.value = '';
            }} />
          </div>
        </div>
        <p className="muted">Export creates a plain JSON backup. Treat it like any file containing personal dates.</p>
      </section>
      {profiles.length === 0 ? (
        <section className="panel"><EmptyState icon="profiles" title="No profiles saved" description="Add a profile above when you want a reusable local birth date." /></section>
      ) : (
        <section className="profile-list" aria-label="Saved profiles">
          {profiles.map((profile) => (
            <article className="profile-card" key={profile.id}>
              <div className="avatar" aria-hidden="true">{profile.name.slice(0, 1).toUpperCase()}</div>
              <div className="profile-copy"><strong>{profile.name}</strong><span>{profile.birthDate}</span></div>
              <button type="button" className="icon-button danger" onClick={() => removeProfile(profile.id)} aria-label={`Delete ${profile.name}`}><Icon name="trash" /></button>
            </article>
          ))}
          <button type="button" className="text-button danger-text" onClick={() => {
            if (window.confirm('Delete all locally saved profiles?')) {
              clearProfiles();
              setProfiles([]);
              setMessage('All profiles deleted.');
            }
          }}>Delete all profiles</button>
        </section>
      )}
    </div>
  );
}
