import { useEffect, useRef } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { en } from '../i18n/en';

export function Onboarding({ onComplete }: { onComplete: () => void }): React.JSX.Element {
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    startRef.current?.focus();
  }, []);

  const keepFocusInside = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    startRef.current?.focus();
  };

  return (
    <div
      className="onboarding"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      onKeyDown={keepFocusInside}
    >
      <div className="onboarding-card">
        <div className="onboarding-art" aria-hidden="true">
          ⌛
        </div>
        <p className="eyebrow">{en.onboarding.eyebrow}</p>
        <h1 id="onboarding-title">{en.onboarding.title}</h1>
        <p>{en.onboarding.description}</p>
        <ul className="feature-checks">
          <li>{en.onboarding.noAccount}</li>
          <li>{en.onboarding.timezoneAware}</li>
          <li>{en.onboarding.offlineReady}</li>
        </ul>
        <button ref={startRef} type="button" className="primary-button" onClick={onComplete}>
          {en.onboarding.start}
        </button>
      </div>
    </div>
  );
}
