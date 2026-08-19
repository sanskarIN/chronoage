import { useState } from 'react';
import type { AppSettings, ThemePreference } from '../types/models';
import { SelectField } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { usePwaLifecycle } from '../hooks/usePwaLifecycle';

interface Props {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export function SettingsPage({ settings, onChange }: Props): React.JSX.Element {
  const patch = (next: Partial<AppSettings>): void => onChange({ ...settings, ...next });
  const pwa = usePwaLifecycle();
  const [installMessage, setInstallMessage] = useState('');

  const installApp = async (): Promise<void> => {
    const outcome = await pwa.install();
    setInstallMessage(
      outcome === 'accepted'
        ? 'Installation accepted.'
        : outcome === 'dismissed'
          ? 'Installation was dismissed. You can try again later.'
          : 'Your browser is not currently offering an install prompt.',
    );
  };

  const updateMessage =
    pwa.updateStatus === 'checking'
      ? 'Checking for a newer app shell…'
      : pwa.updateStatus === 'current'
        ? 'ChronoAge is up to date.'
        : pwa.updateStatus === 'update-ready'
          ? 'A newer version is ready to apply.'
          : pwa.updateStatus === 'error'
            ? 'The update check could not be completed.'
            : 'Check the service worker for a newer deployed version.';

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Preferences"
        title="Settings"
        description="Control appearance, accessibility, local data behavior, date rules, updates, and project information."
      />

      <section className="settings-section panel" aria-labelledby="appearance-title">
        <div>
          <p className="eyebrow">Appearance</p>
          <h2 id="appearance-title">Theme</h2>
        </div>
        <SelectField
          label="Theme"
          value={settings.theme}
          onChange={(event) => patch({ theme: event.target.value as ThemePreference })}
        >
          <option value="system">System</option>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </SelectField>
      </section>

      <section className="settings-section panel" aria-labelledby="accessibility-title">
        <div>
          <p className="eyebrow">Accessibility</p>
          <h2 id="accessibility-title">Comfort and contrast</h2>
        </div>
        <label className="switch-row">
          <span>
            <strong>Reduce motion</strong>
            <small>Minimize transitions and animated effects.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => patch({ reducedMotion: event.target.checked })}
          />
        </label>
        <label className="switch-row">
          <span>
            <strong>High contrast</strong>
            <small>Strengthen boundaries and text contrast.</small>
          </span>
          <input
            type="checkbox"
            checked={settings.highContrast}
            onChange={(event) => patch({ highContrast: event.target.checked })}
          />
        </label>
      </section>

      <section className="settings-section panel" aria-labelledby="date-title">
        <div>
          <p className="eyebrow">Date behavior</p>
          <h2 id="date-title">Calculation defaults</h2>
        </div>
        <SelectField
          label="Default timezone"
          value={settings.defaultTimeZone}
          onChange={(event) => patch({ defaultTimeZone: event.target.value })}
          hint="Used when time-of-day precision is enabled."
        >
          {Array.from(
            new Set([
              settings.defaultTimeZone,
              'UTC',
              'Asia/Kolkata',
              'America/New_York',
              'Europe/London',
              'Asia/Tokyo',
              'Australia/Sydney',
            ]),
          ).map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="Leap-day anniversary"
          value={settings.leapDayPolicy}
          onChange={(event) =>
            patch({ leapDayPolicy: event.target.value === 'mar1' ? 'mar1' : 'feb28' })
          }
          hint="Applied when a February 29 birthday lands in a non-leap year."
        >
          <option value="feb28">February 28</option>
          <option value="mar1">March 1</option>
        </SelectField>
      </section>

      <section className="settings-section panel" aria-labelledby="data-title">
        <div>
          <p className="eyebrow">Data</p>
          <h2 id="data-title">Local storage and backups</h2>
        </div>
        <div className="privacy-box">
          <strong>Profiles stay in this browser unless you explicitly export them.</strong>
          <p>
            Use the Profiles page to add, edit, delete, export, or import local profile data. Export
            files are plain JSON and are not encrypted.
          </p>
        </div>
      </section>

      <section className="settings-section panel" aria-labelledby="privacy-title">
        <div>
          <p className="eyebrow">Privacy</p>
          <h2 id="privacy-title">Local-first defaults</h2>
        </div>
        <div className="privacy-box">
          <strong>No analytics, account, advertising SDK, or cloud sync is built in.</strong>
          <p>
            Calculator inputs are transient UI state. Saved profiles and preferences use browser
            localStorage only after user actions.
          </p>
        </div>
      </section>

      <section className="settings-section panel" aria-labelledby="install-title">
        <div>
          <p className="eyebrow">Installation</p>
          <h2 id="install-title">Install ChronoAge</h2>
        </div>
        <p className="muted">
          {pwa.installed
            ? 'ChronoAge is running in an installed standalone experience on this device.'
            : pwa.canInstall
              ? 'Your browser is ready to install ChronoAge as an app.'
              : 'Installation availability depends on browser and platform support.'}
        </p>
        {!pwa.installed && (
          <button
            type="button"
            className="secondary-button"
            disabled={!pwa.canInstall}
            onClick={() => void installApp()}
          >
            Install app
          </button>
        )}
        {installMessage && (
          <p className="status-line" role="status">
            {installMessage}
          </p>
        )}
      </section>

      <section className="settings-section panel" aria-labelledby="update-title">
        <div>
          <p className="eyebrow">Updates</p>
          <h2 id="update-title">PWA update check</h2>
        </div>
        <p className="muted" role="status">
          {updateMessage}
        </p>
        <div className="button-row">
          <button
            type="button"
            className="secondary-button"
            disabled={pwa.updateStatus === 'checking'}
            onClick={() => void pwa.checkForUpdate()}
          >
            {pwa.updateStatus === 'checking' ? 'Checking…' : 'Check for updates'}
          </button>
          {pwa.updateStatus === 'update-ready' && (
            <button
              type="button"
              className="primary-button"
              onClick={() => void pwa.applyUpdate()}
            >
              Apply update
            </button>
          )}
        </div>
      </section>

      <section className="settings-section panel" aria-labelledby="about-settings-title">
        <div>
          <p className="eyebrow">About</p>
          <h2 id="about-settings-title">ChronoAge 1.0.0</h2>
        </div>
        <p className="muted">
          Open-source MIT project · Made by the Sanskar ·{' '}
          <a href="https://github.com/sanskarIN/chronoage" target="_blank" rel="noreferrer">
            GitHub repository
          </a>
        </p>
        <p className="muted">
          Support: <a href="mailto:supportramsandesh@gmail.com">supportramsandesh@gmail.com</a>
        </p>
      </section>
    </div>
  );
}
