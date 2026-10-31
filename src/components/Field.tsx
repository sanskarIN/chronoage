import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
}

export function Field({ label, hint, error, id, ...props }: FieldProps): React.JSX.Element {
  const inputId = id ?? `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const helpId = `${inputId}-help`;
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <input
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={hint || error ? helpId : undefined}
        {...props}
      />
      {(error || hint) && (
        <span id={helpId} className={error ? 'field-error' : 'field-hint'}>
          {error ?? hint}
        </span>
      )}
    </label>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string | undefined;
  children: ReactNode;
}

export function SelectField({ label, hint, id, children, ...props }: SelectFieldProps): React.JSX.Element {
  const inputId = id ?? `select-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const helpId = `${inputId}-help`;
  const describedBy = [props['aria-describedby'], hint ? helpId : undefined].filter(Boolean).join(' ') || undefined;
  return (
    <label className="field" htmlFor={inputId}>
      <span className="field-label">{label}</span>
      <select id={inputId} {...props} aria-describedby={describedBy}>
        {children}
      </select>
      {hint && (
        <span id={helpId} className="field-hint">
          {hint}
        </span>
      )}
    </label>
  );
}
