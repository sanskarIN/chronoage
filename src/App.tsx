import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { SavedProfile } from './types/models';
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
import { hashForPage, PAGE_IDS, pageFromHash, type PageId } from './utils/navigation';

export default function App(): React.JSX.Element {
  const [page, setPage] = useState<PageId>(() => pageFromHash(window.location.hash) ?? 'calculate');
  const [profileBirthDate, setProfileBirthDate] = useState<string | undefined>();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settings, setSettings] = useSettings();
  const online = useOnlineStatus();
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const firstCommandRef = useRef<HTMLButtonElement>(null);
  const blockingModalOpen = !settings.onboardingComplete || searchOpen;
  const contentBlocked = blockingModalOpen || mobileNavOpen;

  const commitPage = useCallback((next: PageId): void => {
    const nextHash = hashForPage(next);
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', nextHash);
    }
    setPage(next);
  }, []);

  const focusMainContent = useCallback((): void => {
    document.getElementById('main-content')?.focus();
  }, []);

  const useProfile = useCallback(
    (profile: SavedProfile): void => {
      setProfileBirthDate(profile.birthDate);
      previousFocusRef.current = null;
      commitPage('calculate');
      setMobileNavOpen(false);
      setSearchOpen(false);
      window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
      focusMainContent();
    },
    [commitPage, focusMainContent, settings.reducedMotion],
  );

  const pageContent = useMemo(() => {
    switch (page) {
      case 'calculate':
        return <CalculatorPage settings={settings} initialBirthDate={profileBirthDate} />;
      case 'difference':
        return <DifferencePage settings={settings} />;
      case 'interval':
        return <IntervalPage />;
      case 'milestones':
        return <MilestonesPage settings={settings} />;
      case 'profiles':
        return <ProfilesPage onUseProfile={useProfile} />;
      case 'settings':
        return <SettingsPage settings={settings} onChange={setSettings} />;
      case 'about':
        return <AboutPage />;
    }
  }, [page, profileBirthDate, settings, setSettings, useProfile]);

  const rememberFocus = useCallback((): void => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }, []);

  const openSearch = useCallback((): void => {
    rememberFocus();
    setSearchOpen(true);
  }, [rememberFocus]);

  const closeSearch = useCallback((): void => {
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    if (window.location.hash.startsWith('#/') && !pageFromHash(window.location.hash)) {
      window.history.replaceState(null, '', hashForPage('calculate'));
    }
  }, []);

  useEffect(() => {
    document.title = `${en.nav[page]} · ${project.name}`;
  }, [page]);

  useEffect(() => {
    const syncPageFromLocation = (): void => {
      const currentHash = window.location.hash;
      const next = pageFromHash(currentHash);
      if (!next) {
        if (!currentHash.startsWith('#/')) return;
        window.history.replaceState(null, '', hashForPage('calculate'));
        setPage('calculate');
      } else {
        setPage(next);
      }
      setMobileNavOpen(false);
      setSearchOpen(false);
      previousFocusRef.current = null;
      focusMainContent();
    };

    window.addEventListener('popstate', syncPageFromLocation);
    window.addEventListener('hashchange', syncPageFromLocation);
    return () => {
      window.removeEventListener('popstate', syncPageFromLocation);
      window.removeEventListener('hashchange', syncPageFromLocation);
    };
  }, [focusMainContent]);

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
      if (!settings.onboardingComplete) return;
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
  }, [closeSearch, openSearch, searchOpen, settings.onboardingComplete]);

  const navigate = (next: PageId): void => {
    previousFocusRef.current = null;
    commitPage(next);
    setMobileNavOpen(false);
    closeSearch();
    window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
    focusMainContent();
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
      <a
        className="skip-link"
        href="#main-content"
        tabIndex={contentBlocked ? -1 : undefined}
        onClick={(event) => {
          event.preventDefault();
          focusMainContent();
        }}
      >
        {en.app.skipToContent}
      </a>
      <aside className={`sidebar ${mobileNavOpen ? 'open' : ''}`} inert={blockingModalOpen}>
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
          {PAGE_IDS.map((item) => (
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
      <div className="content-shell" inert={contentBlocked}>
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
            {PAGE_IDS.map((item, index) => (
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
