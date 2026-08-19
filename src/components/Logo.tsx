export function Logo({ compact = false }: { compact?: boolean }): React.JSX.Element {
  return (
    <div className="brand" aria-label="ChronoAge home">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="19" fill="none" stroke="currentColor" strokeWidth="3.2" />
          <path d="M24 11v14l9 5" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M13 8l-4 7h8l-4-7Zm22 25-4 7h8l-4-7Z" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="brand-copy">
          <strong>ChronoAge</strong>
          <small>Time, precisely understood</small>
        </span>
      )}
    </div>
  );
}
