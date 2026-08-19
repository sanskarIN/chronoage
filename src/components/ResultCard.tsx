import type { AgeBreakdown, BirthdayCountdown } from '../types/models';
import { formatDateInput } from '../domain/dateMath';
import { Icon } from './Icons';

interface ResultCardProps {
  result: AgeBreakdown;
  birthday?: BirthdayCountdown;
  onPrint: () => void;
  onShare: () => void;
  status?: string;
}

export function ResultCard({ result, birthday, onPrint, onShare, status }: ResultCardProps): React.JSX.Element {
  const units = [
    ['Years', result.years],
    ['Months', result.months],
    ['Days', result.days],
    ['Hours', result.hours],
    ['Minutes', result.minutes],
  ] as const;

  return (
    <section className="result-card print-card" aria-live="polite">
      <div className="result-card-header">
        <div>
          <p className="eyebrow">Exact age</p>
          <h2>{result.years} years old</h2>
        </div>
        <div className="result-actions no-print">
          <button type="button" className="icon-button" onClick={onPrint} aria-label="Print result">
            <Icon name="print" />
          </button>
          <button type="button" className="icon-button" onClick={onShare} aria-label="Share result">
            <Icon name="share" />
          </button>
        </div>
      </div>
      <div className="age-grid">
        {units.map(([label, value]) => (
          <div className="age-unit" key={label}>
            <strong>{value.toLocaleString()}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <div className="totals-grid">
        <div><span>Total days</span><strong>{result.totalDays.toLocaleString()}</strong></div>
        <div><span>Total hours</span><strong>{result.totalHours.toLocaleString()}</strong></div>
        <div><span>Total minutes</span><strong>{result.totalMinutes.toLocaleString()}</strong></div>
      </div>
      {birthday && (
        <div className="birthday-banner">
          <span aria-hidden="true">🎂</span>
          <div>
            <strong>{birthday.daysUntil === 0 ? 'Happy birthday!' : `${birthday.daysUntil} days until your next birthday`}</strong>
            <span>{birthday.weekday}, {formatDateInput(birthday.nextBirthday)} · turning {birthday.ageTurning}</span>
          </div>
        </div>
      )}
      {status && <p className="status-line no-print" role="status">{status}</p>}
      <footer className="print-credit">ChronoAge · Made by the Sanskar · Privacy-first local calculation</footer>
    </section>
  );
}
