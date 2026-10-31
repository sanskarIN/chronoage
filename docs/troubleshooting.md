# Troubleshooting

## `npm install` fails

Confirm Node.js meets the engine requirement and that the npm registry is reachable. Remove only generated `node_modules` and retry; do not delete source or local backups.

If lint reports an unsupported TypeScript version, reinstall from the exact versions in `package.json` rather than upgrading TypeScript independently. The compiler and typescript-eslint compatibility range are maintained together.

## A time is rejected as nonexistent

When time-of-day mode is enabled, a civil time inside a daylight-saving spring-forward gap can be invalid in the chosen timezone. Choose a valid local time before or after the gap. ChronoAge rejects the nonexistent time instead of silently shifting the input.

## A repeated fall-back time is one hour different than expected

When clocks move backward, some local wall-clock times occur twice. Open **Settings → Repeated DST time** and choose **Earlier occurrence** or **Later occurrence** according to the instant you mean. The setting affects timezone-aware calculations only when the civil time is actually ambiguous.

## Result differs from another calculator

Check:

- reference date,
- whether time-of-day is enabled,
- timezone,
- repeated DST-time preference,
- February 29 policy,
- inclusive/exclusive interval setting.

Some calculators divide elapsed days by a fixed year length. ChronoAge uses civil calendar years/months/days for the exact breakdown.

## Saved profiles disappeared

Profiles live in browser `localStorage`. Clearing site data, private browsing, browser profiles, or some storage-cleanup tools can remove them. Use Export for a manual backup.

If storage contains a corrupted record, ChronoAge can ignore that invalid record while preserving independently valid records. A backup import is stricter and is rejected as a whole when any imported profile is invalid.

## A profile backup is rejected as too large

ChronoAge limits backup imports to 1 MB and 100 profiles. The UI checks the selected file size before reading it, and the storage layer independently verifies the UTF-8 byte size before parsing. Create a smaller valid backup instead of modifying the application limits.

## PWA does not update immediately

Open **Settings → Check for updates**. If a new service worker is waiting, use **Apply update** so ChronoAge activates it and reloads after the browser changes controllers.

During development, browser developer tools can unregister stale workers and clear ChronoAge cache storage if an old local worker interferes with testing.

## Offline reload fails

First load ChronoAge online and allow the service worker to install. The browser must have cached the application resources before they can be used offline. If site data/cache was cleared, reconnect once to rebuild the cache.

Missing non-navigation assets intentionally fail offline rather than receiving `index.html` as a content-type-mismatched fallback.

## Browser reports a Content Security Policy error

ChronoAge ships a restrictive browser CSP. Do not solve deployment mistakes by broadly enabling third-party scripts or inline scripts. Compare the deployed headers with [security-headers.md](security-headers.md), confirm all application assets are served from the expected origin, and add only a narrowly justified exception if a future feature requires one.

## E2E browser missing

```bash
npx playwright install --with-deps chromium
```
