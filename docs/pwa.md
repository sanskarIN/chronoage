# PWA installation and updates

ChronoAge can be installed where the browser exposes Progressive Web App installation. The application does not force installation and remains fully usable in a normal browser tab.

## Installation

`usePwaLifecycle` listens for the browser `beforeinstallprompt` event, stores the prompt only in memory, and exposes an **Install app** action on the Settings page when installation is available. An accepted or dismissed prompt is consumed instead of being reused as a stale browser event. Browser prompt failures are contained and reported through safe local status rather than becoming unhandled promise rejections.

Browsers that do not expose `beforeinstallprompt` may still provide their own menu-based installation flow. ChronoAge does not attempt to imitate or bypass browser installation policy.

## Installed-app shortcuts

The web app manifest exposes optional shortcuts for high-frequency public tools:

- Age Calculator → `/#/calculate`
- Age Difference → `/#/difference`
- Life Milestones → `/#/milestones`

Platforms decide whether and how to show manifest shortcuts. The shortcut URLs use the same finite public page-route namespace as normal ChronoAge navigation and contain no profile ids, names, dates, times, search text, or calculation results.

`tests/manifest.test.ts` protects the stable root manifest identity/scope and verifies that every declared shortcut stays inside the allowed public page-route pattern without query-style data parameters.

## Updates

The service worker uses a controlled worker-update lifecycle:

1. A newly downloaded worker installs without immediately taking control when an older worker is active.
2. **Check for updates** asks the current registration to update.
3. When a worker is waiting, Settings exposes **Apply update**.
4. Applying sends `SKIP_WAITING` to the waiting worker.
5. Activation removes only older `chronoage-*` caches, preserving unrelated same-origin cache namespaces.
6. The page reloads after `controllerchange` so the active UI and cached shell come from the same worker generation.

Install/update-application promise failures are caught inside `usePwaLifecycle`, logged through the privacy-safe logger using non-sensitive error types, and surfaced as a safe unavailable/error state.

### Cache/version invariant

For release `2.0.12`, the service-worker cache name is `chronoage-2.0.12`. ChronoAge binds the cache generation to the application version rather than maintaining a separate manual cache counter.

`npm run metadata:check` verifies that `public/sw.js` declares `CACHE_NAME` as `chronoage-${package.json version}`. A future version bump therefore fails the quality gate if the offline cache generation is not advanced with the application version.

Application resources do **not** depend solely on a worker-script change to refresh. Online document navigations are network-first, so a normal online reload can receive and cache the latest deployed `index.html` even when the service-worker source itself is unchanged. The version-bound cache still provides a clean release-level namespace and deterministic removal of older ChronoAge caches when the new worker activates.

## Offline strategy

ChronoAge precaches the core shell and uses two same-origin GET strategies:

### Document navigations

- Network-first while online.
- Successful responses refresh the matching ChronoAge cache entry.
- If navigation fails offline, an exact cached navigation response is preferred.
- If no exact response exists, cached `index.html` is used as the app-shell fallback.

This prevents a stale cached application document from winning over a reachable deployment during an ordinary reload. Because feature routing uses hash fragments, direct public page shortcuts still request the same root document and resolve the selected page client-side after the shell loads.

### Non-navigation resources

- Cached matching resources may be returned immediately.
- A successful same-origin network response refreshes the cache in the background.
- Missing scripts/styles/images do not fall back to `index.html`.

Across both strategies:

- Cross-origin requests are never placed in the ChronoAge cache.
- Non-GET requests are not intercepted.
- The service-worker script itself is not served from its runtime cache.
- Cache activation deletes only older cache names beginning with `chronoage-`.

## Privacy

Installation, manifest shortcuts, and update checks use browser APIs against the same deployed ChronoAge origin. Shortcut URLs identify only a public tool page. They do not transmit saved profiles or calculator inputs.

## Automated browser coverage

`tests/e2e/pwa.spec.ts` waits for service-worker control, confirms the primary interface is usable, deliberately poisons the cached root document with a stale marker, and verifies an online navigation still loads the current network application. It then switches the browser context offline, reloads the application, and confirms the primary interface remains available. The same journey verifies that a deliberately missing non-navigation asset is rejected instead of being replaced by HTML.

`tests/usePwaLifecycle.test.tsx` separately covers install-prompt consumption and failed install/update-application APIs. `tests/manifest.test.ts` verifies manifest identity and privacy-safe shortcut URLs.

The PWA E2E journey runs in the normal desktop and mobile Chromium projects.

## Manual testing checklist

- Verify normal browser use when installation is unavailable.
- Verify install prompt acceptance and dismissal in a supported browser.
- Verify an installed display-mode session is detected.
- On a platform that exposes PWA shortcuts, verify Age, Difference, and Milestones open the expected public pages without personal data in their launch URLs.
- Bump the application version and verify `npm run metadata:check` rejects any stale service-worker cache name.
- Deploy two worker/cache generations and verify update discovery, waiting state, apply action, controller change, and reload.
- Deploy changed application assets without changing the worker script and verify an online reload receives the current application document.
- Verify offline fallback after the updated worker activates.
- Verify a missing asset request does not return `index.html` while offline.
