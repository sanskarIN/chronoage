import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Field, SelectField } from '../src/components/Field';

describe('Field components', () => {
  it('associates input errors with the input control', () => {
    render(<Field label="Example" value="" readOnly error="Example error" />);

    const input = screen.getByLabelText('Example');
    const error = screen.getByText('Example error');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  it('associates select helper text and preserves an existing description', () => {
    render(
      <>
        <span id="external-help">External help</span>
        <SelectField label="Choice" hint="Local hint" aria-describedby="external-help" defaultValue="one">
          <option value="one">One</option>
          <option value="two">Two</option>
        </SelectField>
      </>,
    );

    const select = screen.getByLabelText('Choice');
    const hint = screen.getByText('Local hint');
    expect(select).toHaveAttribute('aria-describedby', `external-help ${hint.id}`);
  });
});
