import { useEffect, useMemo, useState } from 'react';
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
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useSettings } from './hooks/useSettings';
import { en } from './i18n/en';

type Page = keyof typeof en.nav;

const pageOrder: Page[] = ['calculate', 'difference', 'interval', 'milestones', 'profiles', 'settings', 'about'];

export default function App(): React.JSX.Element {
  const [page, setPage] = useState<Page>('calculate');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useSettings();
  const online = useOnlineStatus();

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

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((current) => !current);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigate = (next: Page): void => {
    setPage(next);
    setMobileNavOpen(false);
    setSearchOpen(false);
    window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
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
        <nav aria-label="Primary">
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
          <a
            className="bmc-mini"
            href="https://buymeacoffee.com/sanskarIN"
            target="_blank"
            rel="noreferrer"
          >
            {en.app.buyMeACoffee}
          </a>
          <span>{en.credit}</span>
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
          <button type="button" className="search-trigger" onClick={() => setSearchOpen(true)}>
            <Icon name="search" />
            <span>{en.app.quickActions}</span>
            <kbd>Ctrl K</kbd>
          </button>
          <span className={online ? 'connection online' : 'connection offline'}>
            {online ? en.app.online : en.app.offline}
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          {pageContent}
        </main>
        <footer className="site-footer">
          <span>ChronoAge v1.0.0</span>
          <span>{en.app.footerMeta}</span>
        </footer>
      </div>
      {searchOpen && (
        <div className="command-layer" role="presentation" onMouseDown={() => setSearchOpen(false)}>
          <div
            className="command"
            role="dialog"
            aria-modal="true"
            aria-label={en.app.quickActions}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="command-title">
              <Icon name="search" />
              <strong>{en.app.quickActions}</strong>
              <kbd>Esc</kbd>
            </div>
            {pageOrder.map((item) => (
              <button type="button" key={item} onClick={() => navigate(item)}>
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
