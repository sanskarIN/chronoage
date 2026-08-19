import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { AboutPage } from './pages/AboutPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { DifferencePage } from './pages/DifferencePage';
import { IntervalPage } from './pages/IntervalPage';
import { MilestonesPage } from './pages/MilestonesPage';
import { ProfilesPage } from './pages/ProfilesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Icon } from './components/Icons';
import { Logo } from './components/Logo';
import { Onboarding } from './components/Onboarding';
import { project } from './config/project';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSettings } from './hooks/useSettings';
import { en } from './i18n/en';
import { sharedText } from './i18n/shared';

type Page = keyof typeof en.nav;

const pageOrder: Page[] = ['calculate', 'difference', 'interval', 'milestones', 'profiles', 'settings', 'about'];

export default function App(): React.JSX.Element {
  const [page, setPage] = useState<Page>('calculate');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useSettings();
  const online = useOnlineStatus();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstCommandRef = useRef<HTMLButtonElement>(null);

  const pageContent = useMemo(() => {
    switch (page) {
      case 'calculate':
        return <CalculatorPage settings={settings} />;
      case 'difference':
        return <DifferencePage settings={settings} />;
      case 'interval':
        return <IntervalPage />;
      case 'milestones':
        return <MilestonesPage settings={settings} />;
      case 'profiles':
        return <ProfilesPage />;
      case 'settings':
        return <SettingsPage settings={settings} onChange={setSettings} />;
      case 'about':
        return <AboutPage />;
    }
  }, [page, settings, setSettings]);

  const rememberFocus = (): void => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  };

  const openSearch = (): void => {
    rememberFocus();
    setSearchOpen(true);
  };

  const closeSearch = (): void => {
    setSearchOpen(false);
  };

  useEffect(() => {
    if (searchOpen) {
      firstCommandRef.current?.focus();
      return;
    }
    const previous = previousFocusRef.current;
    if (previous?.isConnected) previous.focus();
    previousFocusRef.current = null;
  }, [searchOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        if (searchOpen) {
          closeSearch();
        } else {
          openSearch();
        }
      }
      if (event.key === 'Escape') {
        closeSearch();
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen]);

  const navigate = (next: Page): void => {
    setPage(next);
    setMobileNavOpen(false);
    closeSearch();
    window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
  };

  const trapCommandFocus = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Tab') return;
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="app-shell">
      {!settings.onboardingComplete && (
        <Onboarding onComplete={() => setSettings({ ...settings, onboardingComplete: true })} />
      )}
      <a className="skip-link" href="#main-content">
        {en.app.skipToContent}
      </a>
      <aside className={`sidebar ${mobileNavOpen ? 'open' : ''}`}>
        <div className="sidebar-top">
          <Logo />
          <button
            className="mobile-close icon-button"
            type="button"
            onClick={() => setMobileNavOpen(false)}
            aria-label={en.app.closeNavigation}
          >
            <Icon name="close" />
          </button>
        </div>
        <nav aria-label={sharedText.primaryNavigation}>
          {pageOrder.map((item) => (
            <button
              key={item}
              type="button"
              className={page === item ? 'nav-item active' : 'nav-item'}
              onClick={() => navigate(item)}
              aria-current={page === item ? 'page' : undefined}
            >
              <Icon name={item === 'calculate' ? 'age' : item === 'milestones' ? 'milestone' : item} />
              <span>{en.nav[item]}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <a className="bmc-mini" href={project.fundingUrl} target="_blank" rel="noreferrer">
            {en.app.buyMeACoffee}
          </a>
          <span>{project.credit}</span>
        </div>
      </aside>
      {mobileNavOpen && (
        <button
          type="button"
          className="nav-scrim"
          onClick={() => setMobileNavOpen(false)}
          aria-label={en.app.closeNavigationOverlay}
        />
      )}
      <div className="content-shell">
        <header className="topbar">
          <button
            className="mobile-menu icon-button"
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label={en.app.openNavigation}
          >
            <Icon name="menu" />
          </button>
          <button type="button" className="search-trigger" onClick={openSearch}>
            <Icon name="search" />
            <span>{en.app.quickActions}</span>
            <kbd>{sharedText.quickActionsShortcut}</kbd>
          </button>
          <span className={online ? 'connection online' : 'connection offline'}>
            {online ? en.app.online : en.app.offline}
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          {pageContent}
        </main>
        <footer className="site-footer">
          <span>
            {project.name} v{project.version}
          </span>
          <span>{en.app.footerMeta}</span>
        </footer>
      </div>
      {searchOpen && (
        <div className="command-layer" role="presentation" onMouseDown={closeSearch}>
          <div
            className="command"
            role="dialog"
            aria-modal="true"
            aria-label={en.app.quickActions}
            onKeyDown={trapCommandFocus}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="command-title">
              <Icon name="search" />
              <strong>{en.app.quickActions}</strong>
              <kbd>Esc</kbd>
            </div>
            {pageOrder.map((item, index) => (
              <button
                ref={index === 0 ? firstCommandRef : undefined}
                type="button"
                key={item}
                onClick={() => navigate(item)}
              >
                <Icon name={item === 'calculate' ? 'age' : item === 'milestones' ? 'milestone' : item} />
                <span>
                  <strong>{en.nav[item]}</strong>
                  <small>{en.app.openTool(en.nav[item])}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
