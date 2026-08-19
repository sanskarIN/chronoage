import { useMemo, useState } from 'react';
import { ageDifference, compareLocalDate, formatDateInput, parseDateInput } from '../domain/dateMath';
import type { AppSettings } from '../types/models';
import { todayInputValue } from '../utils/dateDefaults';
import { DurationVisualization } from '../components/DurationVisualization';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';

export function DifferencePage({ settings }: { settings: AppSettings }): React.JSX.Element {
  const [first, setFirst] = useState('2000-01-01');
  const [second, setSecond] = useState(todayInputValue());

  const value = useMemo(() => {
    try {
      const firstDate = parseDateInput(first);
      const secondDate = parseDateInput(second);
      const [startDate, endDate] =
        compareLocalDate(firstDate, secondDate) <= 0
          ? [firstDate, secondDate]
          : [secondDate, firstDate];
      return {
        result: ageDifference(firstDate, secondDate, settings.leapDayPolicy),
        startLabel: formatDateInput(startDate),
        endLabel: formatDateInput(endDate),
        error: '',
      };
    } catch (error) {
      return {
        result: null,
        startLabel: '',
        endLabel: '',
        error: error instanceof Error ? error.message : 'Unable to compare dates.',
      };
    }
  }, [first, second, settings.leapDayPolicy]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Compare"
        title="Age difference"
        description="See the precise calendar distance between any two valid dates, regardless of order."
      />
      <section className="panel">
        <div className="form-grid two-columns">
          <Field
            label="First date"
            type="date"
            value={first}
            onChange={(event) => setFirst(event.target.value)}
          />
          <Field
            label="Second date"
            type="date"
            value={second}
            onChange={(event) => setSecond(event.target.value)}
          />
        </div>
      </section>
      {value.result ? (
        <>
          <section className="panel comparison-result" aria-live="polite">
            <p className="eyebrow">Calendar distance</p>
            <div className="hero-number">
              {value.result.years}
              <span>years</span>
            </div>
            <div className="comparison-units">
              <span>
                <strong>{value.result.months}</strong> months
              </span>
              <span>
                <strong>{value.result.days}</strong> days
              </span>
              <span>
                <strong>{value.result.totalDays.toLocaleString()}</strong> total days
              </span>
            </div>
          </section>
          <DurationVisualization
            result={value.result}
            startLabel={value.startLabel}
            endLabel={value.endLabel}
          />
        </>
      ) : (
        <div className="alert error" role="alert">
          {value.error}
        </div>
      )}
    </div>
  );
}
