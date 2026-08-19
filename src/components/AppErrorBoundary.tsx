import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { en } from '../i18n/en';
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
          <p className="eyebrow">{en.errors.eyebrow}</p>
          <h1>{en.errors.title}</h1>
          <p>{en.errors.description}</p>
          <p className="muted">{en.errors.privacyNote}</p>
          <div className="button-row">
            <button type="button" className="primary-button" onClick={this.reload}>
              {en.errors.reload}
            </button>
          </div>
        </section>
      </main>
    );
  }
}
