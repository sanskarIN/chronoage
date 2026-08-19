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
import { en } from '../i18n/en';

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
        error: error instanceof Error ? error.message : en.milestones.unable,
      };
    }
  }, [birthDate, customAmount, customUnit, referenceDate, settings.leapDayPolicy]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={en.milestones.eyebrow}
        title={en.milestones.title}
        description={en.milestones.description}
      />
      <section className="panel">
        <div className="form-grid two-columns">
          <Field
            label={en.milestones.birthDate}
            type="date"
            value={birthDate}
            onChange={(event) => setBirthDate(event.target.value)}
          />
          <Field
            label={en.milestones.asOf}
            type="date"
            value={referenceDate}
            onChange={(event) => setReferenceDate(event.target.value)}
          />
        </div>
      </section>

      <section className="panel" aria-labelledby="custom-milestone-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{en.milestones.customEyebrow}</p>
            <h2 id="custom-milestone-title">{en.milestones.customTitle}</h2>
          </div>
          <span className="privacy-chip">{en.milestones.calculatedLocally}</span>
        </div>
        <div className="form-grid two-columns">
          <Field
            label={en.milestones.amount}
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            value={customAmount}
            onChange={(event) => setCustomAmount(event.target.value)}
            hint={en.milestones.amountHint}
          />
          <SelectField
            label={en.milestones.unit}
            value={customUnit}
            onChange={(event) => setCustomUnit(event.target.value === 'years' ? 'years' : 'days')}
          >
            <option value="days">{en.milestones.daysLived}</option>
            <option value="years">{en.milestones.birthdayYears}</option>
          </SelectField>
        </div>
        {value.custom && (
          <div className="privacy-box" aria-live="polite">
            <p className="eyebrow">
              {value.custom.reached ? en.milestones.reached : en.milestones.upcoming}
            </p>
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
        <section className="timeline" aria-label={en.milestones.calculatedMilestones}>
          {value.milestones.map((milestone) => (
            <article
              className={`timeline-item ${milestone.reached ? 'reached' : 'upcoming'}`}
              key={`${milestone.label}-${formatDateInput(milestone.date)}`}
            >
              <span className="timeline-dot" aria-hidden="true" />
              <div>
                <p className="eyebrow">
                  {milestone.reached ? en.milestones.reached : en.milestones.upcoming}
                </p>
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
