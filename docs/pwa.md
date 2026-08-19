# PWA installation and updates

ChronoAge can be installed where the browser exposes Progressive Web App installation. The application does not force installation and remains fully usable in a normal browser tab.

## Installation

`usePwaLifecycle` listens for the browser `beforeinstallprompt` event, stores the prompt only in memory, and exposes an **Install app** action on the Settings page when installation is available. The prompt outcome is shown as non-blocking status text.

Browsers that do not expose `beforeinstallprompt` may still provide their own menu-based installation flow. ChronoAge does not attempt to imitate or bypass browser installation policy.

## Updates

The service worker uses a controlled update lifecycle:

1. A newly downloaded worker installs without immediately taking control when an older worker is active.
2. **Check for updates** asks the current registration to update.
3. When a worker is waiting, Settings exposes **Apply update**.
4. Applying sends `SKIP_WAITING` to the waiting worker.
5. Activation removes caches from older ChronoAge cache versions and waits for client claiming to complete.
6. The page reloads after `controllerchange` so the active UI and cached shell come from the same version.

The service worker cache name must be incremented when the precached shell changes in a way that should invalidate the previous cache.

## Offline strategy

ChronoAge precaches the core shell and uses same-origin stale-while-revalidate behavior for GET resources that the application actually requests.

- Cross-origin requests are never placed in the ChronoAge cache.
- Non-GET requests are not intercepted.
- The service-worker script itself is not served from its runtime cache.
- A cached matching resource may be returned immediately while a successful network response refreshes the cache.
- If a navigation fails offline and has no exact cached response, the cached `index.html` app shell may be used.
- Missing non-navigation assets never fall back to `index.html`; they fail as asset requests instead of receiving HTML with the wrong content type.

This distinction prevents an offline missing script/style/image request from being accidentally answered with the application document.

## Privacy

Installation and update checks use browser service-worker APIs against the same deployed ChronoAge origin. They do not transmit saved profiles or calculator inputs.

## Automated browser coverage

`tests/e2e/pwa.spec.ts` waits for service-worker control, performs an online controlled reload so runtime assets are cached, switches the browser context offline, reloads the application, and confirms the primary interface remains available. It also confirms that a deliberately missing non-navigation asset is rejected instead of being replaced by HTML.

The PWA E2E journey runs in the normal desktop and mobile Chromium projects.

## Manual testing checklist

- Verify normal browser use when installation is unavailable.
- Verify install prompt acceptance and dismissal in a supported browser.
- Verify an installed display-mode session is detected.
- Deploy two cache versions and verify update discovery, waiting state, apply action, controller change, and reload.
- Verify offline fallback after the updated worker activates.
- Verify a missing asset request does not return `index.html` while offline.
