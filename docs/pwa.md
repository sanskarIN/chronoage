# PWA installation and updates

ChronoAge can be installed where the browser exposes Progressive Web App installation. The application does not force installation and remains fully usable in a normal browser tab.

## Installation

`usePwaLifecycle` listens for the browser `beforeinstallprompt` event, stores the prompt only in memory, and exposes an **Install app** action on the Settings page when installation is available. The prompt outcome is shown as non-blocking status text.

Browsers that do not expose `beforeinstallprompt` may still provide their own menu-based installation flow. ChronoAge does not attempt to imitate or bypass browser installation policy.

## Updates

The service worker uses a controlled update lifecycle:

1. A newly downloaded worker installs without immediately taking control.
2. **Check for updates** asks the current registration to update.
3. When a worker is waiting, Settings exposes **Apply update**.
4. Applying sends `SKIP_WAITING` to the waiting worker.
5. The page reloads after `controllerchange` so the active UI and cached shell come from the same version.

The service worker cache name must be incremented when the precached shell changes in a way that should invalidate the previous cache.

## Privacy

Installation and update checks use browser service-worker APIs against the same deployed ChronoAge origin. They do not transmit saved profiles or calculator inputs.

## Testing checklist

- Verify normal browser use when installation is unavailable.
- Verify install prompt acceptance and dismissal in a supported browser.
- Verify an installed display-mode session is detected.
- Deploy two cache versions and verify update discovery, waiting state, apply action, controller change, and reload.
- Verify offline fallback after the updated worker activates.
