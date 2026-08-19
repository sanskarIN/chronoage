import type { AgeBreakdown, BirthdayCountdown } from '../types/models';
import { formatDateInput } from '../domain/dateMath';
import { en } from '../i18n/en';
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
    [en.result.years, result.years],
    [en.result.months, result.months],
    [en.result.days, result.days],
    [en.result.hours, result.hours],
    [en.result.minutes, result.minutes],
  ] as const;

  return (
    <section className="result-card print-card" aria-live="polite">
      <div className="result-card-header">
        <div>
          <p className="eyebrow">{en.result.exactAge}</p>
          <h2>{en.result.yearsOld(result.years)}</h2>
        </div>
        <div className="result-actions no-print">
          <button type="button" className="icon-button" onClick={onPrint} aria-label={en.result.print}>
            <Icon name="print" />
          </button>
          <button type="button" className="icon-button" onClick={onShare} aria-label={en.result.share}>
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
        <div>
          <span>{en.result.totalDays}</span>
          <strong>{result.totalDays.toLocaleString()}</strong>
        </div>
        <div>
          <span>{en.result.totalHours}</span>
          <strong>{result.totalHours.toLocaleString()}</strong>
        </div>
        <div>
          <span>{en.result.totalMinutes}</span>
          <strong>{result.totalMinutes.toLocaleString()}</strong>
        </div>
      </div>
      {birthday && (
        <div className="birthday-banner">
          <span aria-hidden="true">🎂</span>
          <div>
            <strong>
              {birthday.daysUntil === 0
                ? en.result.happyBirthday
                : en.result.daysUntilBirthday(birthday.daysUntil)}
            </strong>
            <span>
              {birthday.weekday}, {formatDateInput(birthday.nextBirthday)} · {en.result.turning(birthday.ageTurning)}
            </span>
          </div>
        </div>
      )}
      {status && (
        <p className="status-line no-print" role="status">
          {status}
        </p>
      )}
      <footer className="print-credit">{en.result.printCredit}</footer>
    </section>
  );
}
