export function Onboarding({ onComplete }: { onComplete: () => void }): React.JSX.Element {
  return (
    <div className="onboarding" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="onboarding-card">
        <div className="onboarding-art" aria-hidden="true">⌛</div>
        <p className="eyebrow">Welcome to ChronoAge</p>
        <h1 id="onboarding-title">Time is personal. Your data should be, too.</h1>
        <p>Calculate exact ages, compare dates, track milestones, and save profiles entirely on this device.</p>
        <ul className="feature-checks">
          <li>No account required</li>
          <li>Timezone-aware when time is included</li>
          <li>Offline-ready PWA</li>
        </ul>
        <button type="button" className="primary-button" onClick={onComplete}>Start calculating</button>
      </div>
    </div>
  );
}
