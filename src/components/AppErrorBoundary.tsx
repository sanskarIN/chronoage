import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { errorMessages } from '../i18n/errors';
import { logger } from '../utils/logger';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = { hasError: false };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, info: ErrorInfo): void {
    logger.error('Application render failed.', {
      error,
      componentStack: info.componentStack ?? 'unavailable',
    });
  }

  private reload = (): void => {
    window.location.reload();
  };

  public render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <main id="main-content" className="page" tabIndex={-1}>
        <section className="panel" role="alert" aria-live="assertive">
          <p className="eyebrow">{errorMessages.eyebrow}</p>
          <h1>{errorMessages.title}</h1>
          <p>{errorMessages.description}</p>
          <p className="muted">{errorMessages.privacyNote}</p>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={this.reload}>
              {errorMessages.reload}
            </button>
          </div>
        </section>
      </main>
    );
  }
}
