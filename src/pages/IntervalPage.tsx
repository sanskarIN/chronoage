import { useMemo, useState } from 'react';
import { intervalDays, parseDateInput, weekdayName } from '../domain/dateMath';
import { todayInputValue } from '../utils/dateDefaults';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';

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
      return { days: null, startWeekday: '', endWeekday: '', error: error instanceof Error ? error.message : 'Unable to calculate interval.' };
    }
  }, [end, inclusive, start]);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Date tools" title="Date interval" description="Count days between dates using clear inclusive or exclusive semantics." />
      <section className="panel">
        <div className="form-grid two-columns">
          <Field label="Start date" type="date" value={start} onChange={(event) => setStart(event.target.value)} />
          <Field label="End date" type="date" value={end} onChange={(event) => setEnd(event.target.value)} />
        </div>
        <div className="segmented" role="group" aria-label="Interval counting method">
          <button type="button" className={!inclusive ? 'active' : ''} onClick={() => setInclusive(false)}>Exclusive</button>
          <button type="button" className={inclusive ? 'active' : ''} onClick={() => setInclusive(true)}>Inclusive</button>
        </div>
        <p className="muted">{inclusive ? 'Includes both the start and end calendar dates.' : 'Counts elapsed whole calendar days; the start date itself is not counted.'}</p>
      </section>
      {value.days !== null ? (
        <section className="panel interval-result" aria-live="polite">
          <div className="hero-number">{value.days.toLocaleString()}<span>days</span></div>
          <p>{value.startWeekday} → {value.endWeekday}</p>
          <div className="comparison-units">
            <span><strong>{(value.days / 7).toFixed(2)}</strong> weeks</span>
            <span><strong>{(value.days / 365.2425).toFixed(2)}</strong> solar years</span>
          </div>
        </section>
      ) : <div className="alert error" role="alert">{value.error}</div>}
    </div>
  );
}
