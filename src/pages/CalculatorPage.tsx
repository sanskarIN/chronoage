import { useMemo, useState } from 'react';
import { calculateAge, nextBirthday, parseDateInput, parseTimeInput } from '../domain/dateMath';
import type { AppSettings } from '../types/models';
import { currentTimeInputValue, defaultBirthInputValue, todayInputValue } from '../utils/dateDefaults';
import { printResult, shareText } from '../utils/share';
import { Field, SelectField } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { ResultCard } from '../components/ResultCard';

export function CalculatorPage({ settings }: { settings: AppSettings }): React.JSX.Element {
  const [birthDate, setBirthDate] = useState(defaultBirthInputValue());
  const [birthTime, setBirthTime] = useState('00:00');
  const [referenceDate, setReferenceDate] = useState(todayInputValue());
  const [referenceTime, setReferenceTime] = useState(currentTimeInputValue());
  const [includeTime, setIncludeTime] = useState(false);
  const [timeZone, setTimeZone] = useState(settings.defaultTimeZone);
  const [status, setStatus] = useState('');

  const calculation = useMemo(() => {
    try {
      const birth = parseDateInput(birthDate);
      const reference = parseDateInput(referenceDate);
      const birthClock = parseTimeInput(birthTime);
      const referenceClock = parseTimeInput(referenceTime);
      const result = calculateAge({
        birth: { ...birth, ...birthClock },
        reference: { ...reference, ...referenceClock },
        timeZone,
        includeTime,
        leapDayPolicy: settings.leapDayPolicy,
      });
      return {
        result,
        birthday: nextBirthday(birth, reference, settings.leapDayPolicy),
        error: '',
      };
    } catch (error) {
      return {
        result: null,
        birthday: undefined,
        error: error instanceof Error ? error.message : 'Unable to calculate age.',
      };
    }
  }, [birthDate, birthTime, includeTime, referenceDate, referenceTime, settings.leapDayPolicy, timeZone]);

  const handleShare = async (): Promise<void> => {
    if (!calculation.result) return;
    const result = calculation.result;
    const text = `ChronoAge result: ${result.years} years, ${result.months} months, ${result.days} days${includeTime ? `, ${result.hours} hours, ${result.minutes} minutes` : ''}.`;
    try {
      const mode = await shareText('ChronoAge result', text);
      setStatus(mode === 'copied' ? 'Result copied to clipboard.' : 'Share sheet opened.');
    } catch {
      setStatus('Sharing was cancelled or unavailable.');
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Precision calculator"
        title="How much time has passed?"
        description="Calculate an exact calendar age with leap-year and timezone-aware handling."
      />
      <div className="calculator-layout">
        <section className="panel form-panel" aria-labelledby="age-inputs-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Inputs</p>
              <h2 id="age-inputs-title">Birth and reference</h2>
            </div>
            <span className="privacy-chip">Local only</span>
          </div>
          <div className="form-grid two-columns">
            <Field label="Birth date" type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} max="9999-12-31" />
            {includeTime && <Field label="Birth time" type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} />}
            <Field label="Reference date" type="date" value={referenceDate} onChange={(event) => setReferenceDate(event.target.value)} max="9999-12-31" />
            {includeTime && <Field label="Reference time" type="time" value={referenceTime} onChange={(event) => setReferenceTime(event.target.value)} />}
          </div>
          <label className="switch-row">
            <span>
              <strong>Include time of day</strong>
              <small>Enables hour/minute precision and timezone-aware instant calculations.</small>
            </span>
            <input type="checkbox" checked={includeTime} onChange={(event) => setIncludeTime(event.target.checked)} />
          </label>
          {includeTime && (
            <SelectField label="Timezone" value={timeZone} onChange={(event) => setTimeZone(event.target.value)} hint="Uses your browser's IANA timezone database.">
              {Array.from(new Set([settings.defaultTimeZone, 'UTC', 'Asia/Kolkata', 'America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'])).map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </SelectField>
          )}
          {calculation.error && <div className="alert error" role="alert">{calculation.error}</div>}
        </section>

        {calculation.result ? (
          <ResultCard
            result={calculation.result}
            birthday={calculation.birthday}
            onPrint={printResult}
            onShare={() => void handleShare()}
            status={status}
          />
        ) : (
          <section className="panel result-placeholder" aria-live="polite">
            <span aria-hidden="true">⌛</span>
            <h2>Ready when your dates are</h2>
            <p>Enter a valid birth date that is not later than the reference date.</p>
          </section>
        )}
      </div>
      <div className="info-strip">
        <strong>Leap-day birthdays:</strong>
        <span>Non-leap anniversaries currently use {settings.leapDayPolicy === 'mar1' ? 'March 1' : 'February 28'}, configurable in Settings.</span>
      </div>
    </div>
  );
}
