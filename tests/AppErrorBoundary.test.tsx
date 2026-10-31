import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppErrorBoundary } from '../src/components/AppErrorBoundary';

function BrokenView(): React.JSX.Element {
  throw new Error('Render failed for person@example.com');
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('AppErrorBoundary', () => {
  it('shows a safe recovery screen and logs a redacted error', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <AppErrorBoundary>
        <BrokenView />
      </AppErrorBoundary>,
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'ChronoAge hit an unexpected error' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload ChronoAge' })).toBeInTheDocument();

    expect(
      errorSpy.mock.calls.some(
        ([message, context]) =>
          message === '[ChronoAge:error] Application render failed.' &&
          typeof context === 'object' &&
          context !== null &&
          JSON.stringify(context).includes('[redacted-email]'),
      ),
    ).toBe(true);
  });
});
