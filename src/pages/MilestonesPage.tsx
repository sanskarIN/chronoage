import { useMemo, useState } from 'react';
import {
  calculateCustomMilestone,
  calculateMilestones,
  type CustomMilestoneUnit,
} from '../domain/milestones';
import { formatDateInput, parseDateInput } from '../domain/dateMath';
import type { AppSettings } from '../types/models';
import { defaultBirthInputValue, todayInputValue } from '../utils/dateDefaults';
import { Field, SelectField } from '../components/Field';
import { PageHeader } from '../components/PageHeader';

export function MilestonesPage({ settings }: { settings: AppSettings }): React.JSX.Element {
  const [birthDate, setBirthDate] = useState(defaultBirthInputValue());
  const [referenceDate, setReferenceDate] = useState(todayInputValue());
  const [customAmount, setCustomAmount] = useState('10000');
  const [customUnit, setCustomUnit] = useState<CustomMilestoneUnit>('days');

  const value = useMemo(() => {
    try {
      const birth = parseDateInput(birthDate);
      const reference = parseDateInput(referenceDate);
      return {
        milestones: calculateMilestones(birth, reference, settings.leapDayPolicy),
        custom: calculateCustomMilestone(
          birth,
          reference,
          Number(customAmount),
          customUnit,
          settings.leapDayPolicy,
        ),
        error: '',
      };
    } catch (error) {
      return {
        milestones: [],
        custom: null,
        error: error instanceof Error ? error.message : 'Unable to calculate milestones.',
      };
    }
  }, [birthDate, customAmount, customUnit, referenceDate, settings.leapDayPolicy]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Timeline"
        title="Life milestones"
        description="Discover day-count landmarks, major anniversaries, and a milestone you define yourself."
      />
      <section className="panel">
        <div className="form-grid two-columns">
          <Field
            label="Birth date"
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
          <Field
            label="As of"
            type="date"
            value={referenceDate}
            onChange={(event) => setReferenceDate(event.target.value)}
          />
        </div>
      </section>

      <section className="panel" aria-labelledby="custom-milestone-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Custom landmark</p>
            <h2 id="custom-milestone-title">Build your own milestone</h2>
          </div>
          <span className="privacy-chip">Calculated locally</span>
        </div>
        <div className="form-grid two-columns">
          <Field
            label="Amount"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            hint="Use a positive whole number."
          />
          <SelectField
            label="Milestone unit"
            value={customUnit}
            onChange={(event) => setCustomUnit(event.target.value === 'years' ? 'years' : 'days')}
          >
            <option value="days">Days lived</option>
            <option value="years">Birthday years</option>
          </SelectField>
        </div>
        {value.custom && (
          <div className="privacy-box" aria-live="polite">
            <p className="eyebrow">{value.custom.reached ? 'Reached' : 'Upcoming'}</p>
            <strong>{value.custom.label}</strong>
            <p>
              {value.custom.weekday} · {formatDateInput(value.custom.date)}
            </p>
          </div>
        )}
      </section>

      {value.error ? (
        <div className="alert error" role="alert">
          {value.error}
        </div>
      ) : (
        <section className="timeline" aria-label="Calculated milestones">
          {value.milestones.map((milestone) => (
            <article
              className={`timeline-item ${milestone.reached ? 'reached' : 'upcoming'}`}
              key={`${milestone.label}-${formatDateInput(milestone.date)}`}
            >
              <span className="timeline-dot" aria-hidden="true" />
              <div>
                <p className="eyebrow">{milestone.reached ? 'Reached' : 'Upcoming'}</p>
                <h3>{milestone.label}</h3>
                <p>
                  {milestone.weekday} · {formatDateInput(milestone.date)}
                </p>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
