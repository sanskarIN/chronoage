import type { ChangeEventHandler } from 'react';
import { TIME_ZONE_SUGGESTIONS } from '../config/timeZones';
import { Field } from './Field';

interface TimeZoneFieldProps {
  label: string;
  value: string;
  hint?: string;
  error?: string;
  onChange: ChangeEventHandler<HTMLInputElement>;
}

export function TimeZoneField({
  label,
  value,
  hint,
  error,
  onChange,
}: TimeZoneFieldProps): React.JSX.Element {
  const listId = 'chronoage-timezone-suggestions';
  return (
    <>
      <Field
        label={label}
        value={value}
        onChange={onChange}
        list={listId}
        hint={hint}
        error={error}
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
      />
      <datalist id={listId}>
        {TIME_ZONE_SUGGESTIONS.map((zone) => (
          <option key={zone} value={zone} />
        ))}
      </datalist>
    </>
  );
}
