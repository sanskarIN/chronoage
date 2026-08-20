import { useMemo, useState } from 'react';
import {
  calculateAge,
  isValidTimeZone,
  nextBirthday,
  parseDateInput,
  parseTimeInput,
} from '../domain/dateMath';
import { getUserSafeErrorMessage } from '../errors';
import type { AppSettings } from '../types/models';
import { currentTimeInputValue, defaultBirthInputValue, todayInputValue } from '../utils/dateDefaults';
import { printResult, shareText } from '../utils/share';
import { Field } from '../components/Field';
import { PageHeader } from '../components/PageHeader';
import { ResultCard } from '../components/ResultCard';
import { TimeZoneField } from '../components/TimeZoneField';
import { en } from '../i18n/en';
import { sharedText } from '../i18n/shared';

export function CalculatorPage({
  settings,
  initialBirthDate,
}: {
  settings: AppSettings;
  initialBirthDate?: string;
}): React.JSX.Element {
  const [birthDate, setBirthDate] = useState(initialBirthDate ?? defaultBirthInputValue());
  const [birthTime, setBirthTime] = useState('00:00');
  const [referenceDate, setReferenceDate] = useState(todayInputValue());
  const [referenceTime, setReferenceTime] = useState(currentTimeInputValue());
  const [includeTime, setIncludeTime] = useState(false);
  const [timeZone, setTimeZone] = useState(settings.defaultTimeZone);
  const [status, setStatus] = useState('');
  const timeZoneError = includeTime && !isValidTimeZone(timeZone) ? sharedText.invalidTimeZone : undefined;

  const calculation = useMemo(() => {
    try {
      const birth = parseDateInput(birthDate);
      const reference = parseDateInput(referenceDate);
      const birthClock = includeTime ? parseTimeInput(birthTime) : { hour: 0, minute: 0 };
      const referenceClock = includeTime ? parseTimeInput(referenceTime) : { hour: 0, minute: 0 };
      const result = calculateAge({
        birth: { ...birth, ...birthClock },
        reference: { ...reference, ...referenceClock },
        timeZone: includeTime ? timeZone : 'UTC',
        includeTime,
        leapDayPolicy: settings.leapDayPolicy,
        dstAmbiguityPolicy: settings.dstAmbiguityPolicy,
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
        error: getUserSafeErrorMessage(error, en.calculator.unable),
      };
    }
  }, [
    birthDate,
    birthTime,
    includeTime,
    referenceDate,
    referenceTime,
    settings.dstAmbiguityPolicy,
    settings.leapDayPolicy,
    timeZone,
  ]);

  const handleShare = async (): Promise<void> => {
    if (!calculation.result) return;
    const result = calculation.result;
    const text = `${en.appName} ${en.result.exactAge.toLowerCase()}: ${result.years} ${en.result.years.toLowerCase()}, ${result.months} ${en.result.months.toLowerCase()}, ${result.days} ${en.result.days.toLowerCase()}${includeTime ? `, ${result.hours} ${en.result.hours.toLowerCase()}, ${result.minutes} ${en.result.minutes.toLowerCase()}` : ''}.`;
    setStatus('');
    try {
      const mode = await shareText(en.result.exactAge, text);
      if (mode === 'cancelled') return;
      setStatus(mode === 'copied' ? en.calculator.copied : en.calculator.shared);
    } catch {
      setStatus(en.calculator.shareUnavailable);
    }
  };

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow={en.calculator.eyebrow}
        title={en.calculator.title}
        description={en.calculator.description}
      />
      <div className="calculator-layout">
        <section className="panel form-panel" aria-labelledby="age-inputs-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">{en.calculator.inputsEyebrow}</p>
              <h2 id="age-inputs-title">{en.calculator.inputsTitle}</h2>
            </div>
            <span className="privacy-chip">{en.calculator.localOnly}</span>
          </div>
          <div className="form-grid two-columns">
            <Field
              label={en.calculator.birthDate}
              type="date"
              value={birthDate}
              onChange={(event) => setBirthDate(event.target.value)}
              max="9999-12-31"
            />
            {includeTime && (
              <Field
                label={en.calculator.birthTime}
                type="time"
                value={birthTime}
                onChange={(event) => setBirthTime(event.target.value)}
              />
            )}
            <Field
              label={en.calculator.referenceDate}
              type="date"
              value={referenceDate}
              onChange={(event) => setReferenceDate(event.target.value)}
              max="9999-12-31"
            />
            {includeTime && (
              <Field
                label={en.calculator.referenceTime}
                type="time"
                value={referenceTime}
                onChange={(event) => setReferenceTime(event.target.value)}
              />
            )}
          </div>
          <label className="switch-row">
            <span>
              <strong>{en.calculator.includeTime}</strong>
              <small>{en.calculator.includeTimeHint}</small>
            </span>
            <input
              type="checkbox"
              checked={includeTime}
              onChange={(event) => setIncludeTime(event.target.checked)}
            />
          </label>
          {includeTime && (
            <TimeZoneField
              label={en.calculator.timezone}
              value={timeZone}
              onChange={(event) => setTimeZone(event.target.value)}
              hint={en.calculator.timezoneHint(settings.dstAmbiguityPolicy)}
              error={timeZoneError}
            />
          )}
          {calculation.error && (
            <div className="alert error" role="alert">
              {calculation.error}
            </div>
          )}
        </section>

        {calculation.result ? (
          <ResultCard
            result={calculation.result}
            birthday={calculation.birthday}
            showTime={includeTime}
            onPrint={printResult}
            onShare={() => void handleShare()}
            status={status}
          />
        ) : (
          <section className="panel result-placeholder" aria-live="polite">
            <span aria-hidden="true">⌛</span>
            <h2>{en.calculator.placeholderTitle}</h2>
            <p>{en.calculator.placeholderDescription}</p>
          </section>
        )}
      </div>
      <div className="info-strip">
        <strong>{en.calculator.calendarRules}</strong>
        <span>
          {en.calculator.calendarRulesDescription(
            settings.leapDayPolicy === 'mar1' ? en.settings.march1 : en.settings.february28,
            settings.dstAmbiguityPolicy,
          )}
        </span>
      </div>
    </div>
  );
}
