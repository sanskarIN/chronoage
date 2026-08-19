import { useMemo, useState } from 'react';
import { intervalDays, parseDateInput, weekdayName } from '../domain/dateMath';
import { todayInputValue } from '../utils/dateDefaults';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { en } from '../i18n/en';

export function IntervalPage(): React.JSX.Element {
  const [start, setStart] = useState(todayInputValue());
  const [end, setEnd] = useState(todayInputValue());
  const [inclusive, setInclusive] = useState(false);

  const value = useMemo(() => {
    try {
      const startDate = parseDateInput(start);
      const endDate = parseDateInput(end);
      return {
        days: intervalDays(startDate, endDate, inclusive),
        startWeekday: weekdayName(startDate),
        endWeekday: weekdayName(endDate),
        error: '',
      };
    } catch (error) {
      return {
        days: null,
        startWeekday: '',
        endWeekday: '',
        error: error instanceof Error ? error.message : en.interval.unable,
      };
    }
  }, [end, inclusive, start]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={en.interval.eyebrow}
        title={en.interval.title}
        description={en.interval.description}
      />
      <section className="panel">
        <div className="form-grid two-columns">
          <Field
            label={en.interval.startDate}
            type="date"
            value={start}
            onChange={(event) => setStart(event.target.value)}
          />
          <Field
            label={en.interval.endDate}
            type="date"
            value={end}
            onChange={(event) => setEnd(event.target.value)}
          />
        </div>
        <div className="segmented" role="group" aria-label={en.interval.countingMethod}>
          <button
            type="button"
            className={!inclusive ? 'active' : ''}
            onClick={() => setInclusive(false)}
          >
            {en.interval.exclusive}
          </button>
          <button
            type="button"
            className={inclusive ? 'active' : ''}
            onClick={() => setInclusive(true)}
          >
            {en.interval.inclusive}
          </button>
        </div>
        <p className="muted">{inclusive ? en.interval.inclusiveHint : en.interval.exclusiveHint}</p>
      </section>
      {value.days !== null ? (
        <section className="panel interval-result" aria-live="polite">
          <div className="hero-number">
            {value.days.toLocaleString()}
            <span>{en.interval.days}</span>
          </div>
          <p>
            {value.startWeekday} → {value.endWeekday}
          </p>
          <div className="comparison-units">
            <span>
              <strong>{(value.days / 7).toFixed(2)}</strong> {en.interval.weeks}
            </span>
            <span>
              <strong>{(value.days / 365.2425).toFixed(2)}</strong> {en.interval.solarYears}
            </span>
          </div>
        </section>
      ) : (
        <div className="alert error" role="alert">
          {value.error}
        </div>
      )}
    </div>
  );
}
