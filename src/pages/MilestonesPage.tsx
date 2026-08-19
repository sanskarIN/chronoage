import { useMemo, useState } from 'react';
import { calculateMilestones } from '../domain/milestones';
import { formatDateInput, parseDateInput } from '../domain/dateMath';
import type { AppSettings } from '../types/models';
import { defaultBirthInputValue, todayInputValue } from '../utils/dateDefaults';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';

export function MilestonesPage({ settings }: { settings: AppSettings }): React.JSX.Element {
  const [birthDate, setBirthDate] = useState(defaultBirthInputValue());
  const [referenceDate, setReferenceDate] = useState(todayInputValue());

  const value = useMemo(() => {
    try {
      return { milestones: calculateMilestones(parseDateInput(birthDate), parseDateInput(referenceDate), settings.leapDayPolicy), error: '' };
    } catch (error) {
      return { milestones: [], error: error instanceof Error ? error.message : 'Unable to calculate milestones.' };
    }
  }, [birthDate, referenceDate, settings.leapDayPolicy]);

  return (
    <div className="page-stack">
      <PageHeader eyebrow="Timeline" title="Life milestones" description="Discover day-count landmarks and major anniversaries on your personal timeline." />
      <section className="panel">
        <div className="form-grid two-columns">
          <Field label="Birth date" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} />
          <Field label="As of" type="date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} />
        </div>
      </section>
      {value.error ? <div className="alert error" role="alert">{value.error}</div> : (
        <section className="timeline" aria-label="Calculated milestones">
          {value.milestones.map((milestone) => (
            <article className={`timeline-item ${milestone.reached ? 'reached' : 'upcoming'}`} key={`${milestone.label}-${formatDateInput(milestone.date)}`}>
              <span className="timeline-dot" aria-hidden="true" />
              <div>
                <p className="eyebrow">{milestone.reached ? 'Reached' : 'Upcoming'}</p>
                <h3>{milestone.label}</h3>
                <p>{milestone.weekday} · {formatDateInput(milestone.date)}</p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
