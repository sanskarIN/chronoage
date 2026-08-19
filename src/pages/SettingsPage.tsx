import { useState } from 'react';
import type { AppSettings, ThemePreference } from '../types/models';
import { SelectField } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { mailto, project } from '../config/project';
import { usePwaLifecycle } from '../hooks/usePwaLifecycle';
import { en } from '../i18n/en';

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
        ? en.settings.installAccepted
        : outcome === 'dismissed'
          ? en.settings.installDismissed
          : en.settings.promptUnavailable,
    );
  };

  const updateMessage =
    pwa.updateStatus === 'checking'
      ? en.settings.checking
      : pwa.updateStatus === 'current'
        ? en.settings.current
        : pwa.updateStatus === 'update-ready'
          ? en.settings.updateReady
          : pwa.updateStatus === 'error'
            ? en.settings.updateError
            : en.settings.updateIdle;

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={en.settings.eyebrow}
        title={en.settings.title}
        description={en.settings.description}
      />

      <section className="settings-section panel" aria-labelledby="appearance-title">
        <div>
          <p className="eyebrow">{en.settings.appearanceEyebrow}</p>
          <h2 id="appearance-title">{en.settings.themeTitle}</h2>
        </div>
        <SelectField
          label={en.settings.theme}
          value={settings.theme}
          onChange={(event) => patch({ theme: event.target.value as ThemePreference })}
        >
          <option value="system">{en.settings.system}</option>
          <option value="light">{en.settings.light}</option>
          <option value="dark">{en.settings.dark}</option>
        </SelectField>
      </section>

      <section className="settings-section panel" aria-labelledby="accessibility-title">
        <div>
          <p className="eyebrow">{en.settings.accessibilityEyebrow}</p>
          <h2 id="accessibility-title">{en.settings.comfortTitle}</h2>
        </div>
        <label className="switch-row">
          <span>
            <strong>{en.settings.reduceMotion}</strong>
            <small>{en.settings.reduceMotionHint}</small>
          </span>
          <input
            type="checkbox"
            checked={settings.reducedMotion}
            onChange={(event) => patch({ reducedMotion: event.target.checked })}
          />
        </label>
        <label className="switch-row">
          <span>
            <strong>{en.settings.highContrast}</strong>
            <small>{en.settings.highContrastHint}</small>
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
          <p className="eyebrow">{en.settings.dateEyebrow}</p>
          <h2 id="date-title">{en.settings.calculationDefaults}</h2>
        </div>
        <SelectField
          label={en.settings.defaultTimezone}
          value={settings.defaultTimeZone}
          onChange={(event) => patch({ defaultTimeZone: event.target.value })}
          hint={en.settings.defaultTimezoneHint}
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
          label={en.settings.leapDay}
          value={settings.leapDayPolicy}
          onChange={(event) =>
            patch({ leapDayPolicy: event.target.value === 'mar1' ? 'mar1' : 'feb28' })
          }
          hint={en.settings.leapDayHint}
        >
          <option value="feb28">{en.settings.february28}</option>
          <option value="mar1">{en.settings.march1}</option>
        </SelectField>
        <SelectField
          label={en.settings.repeatedDst}
          value={settings.dstAmbiguityPolicy}
          onChange={(event) =>
            patch({ dstAmbiguityPolicy: event.target.value === 'later' ? 'later' : 'earlier' })
          }
          hint={en.settings.repeatedDstHint}
        >
          <option value="earlier">{en.settings.earlierOccurrence}</option>
          <option value="later">{en.settings.laterOccurrence}</option>
        </SelectField>
      </section>

      <section className="settings-section panel" aria-labelledby="data-title">
        <div>
          <p className="eyebrow">{en.settings.dataEyebrow}</p>
          <h2 id="data-title">{en.settings.localStorageTitle}</h2>
        </div>
        <div className="privacy-box">
          <strong>{en.settings.localStorageStrong}</strong>
          <p>{en.settings.localStorageDescription}</p>
        </div>
      </section>

      <section className="settings-section panel" aria-labelledby="privacy-title">
        <div>
          <p className="eyebrow">{en.settings.privacyEyebrow}</p>
          <h2 id="privacy-title">{en.settings.privacyTitle}</h2>
        </div>
        <div className="privacy-box">
          <strong>{en.settings.privacyStrong}</strong>
          <p>{en.settings.privacyDescription}</p>
        </div>
      </section>

      <section className="settings-section panel" aria-labelledby="install-title">
        <div>
          <p className="eyebrow">{en.settings.installEyebrow}</p>
          <h2 id="install-title">{en.settings.installTitle}</h2>
        </div>
        <p className="muted">
          {pwa.installed
            ? en.settings.installed
            : pwa.canInstall
              ? en.settings.installReady
              : en.settings.installUnavailable}
        </p>
        {!pwa.installed && (
          <button
            type="button"
            className="secondary-button"
            disabled={!pwa.canInstall}
            onClick={() => void installApp()}
          >
            {en.settings.installApp}
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
          <p className="eyebrow">{en.settings.updatesEyebrow}</p>
          <h2 id="update-title">{en.settings.updatesTitle}</h2>
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
            {pwa.updateStatus === 'checking' ? en.settings.checkingButton : en.settings.checkUpdates}
          </button>
          {pwa.updateStatus === 'update-ready' && (
            <button type="button" className="primary-button" onClick={() => void pwa.applyUpdate()}>
              {en.settings.applyUpdate}
            </button>
          )}
        </div>
      </section>

      <section className="settings-section panel" aria-labelledby="about-settings-title">
        <div>
          <p className="eyebrow">{en.settings.aboutEyebrow}</p>
          <h2 id="about-settings-title">
            {project.name} {project.version}
          </h2>
        </div>
        <p className="muted">
          Open-source {project.license} project · {project.credit} ·{' '}
          <a href={project.repositoryUrl} target="_blank" rel="noreferrer">
            {en.settings.githubRepository}
          </a>
        </p>
        <p className="muted">
          {en.settings.support} <a href={mailto(project.supportEmail)}>{project.supportEmail}</a>
        </p>
      </section>
    </div>
  );
}
