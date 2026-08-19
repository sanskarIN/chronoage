# Troubleshooting

## `npm install` fails

Confirm Node.js meets the engine requirement and that the npm registry is reachable. Remove only generated `node_modules` and retry; do not delete source or local backups.

## A time is rejected as nonexistent

When time-of-day mode is enabled, a civil time inside a daylight-saving spring-forward gap can be invalid in the chosen timezone. Choose a valid local time before or after the gap.

## Result differs from another calculator

Check:

- reference date,
- whether time-of-day is enabled,
- timezone,
- February 29 policy,
- inclusive/exclusive interval setting.

Some calculators divide elapsed days by a fixed year length. ChronoAge uses civil calendar years/months/days for the exact breakdown.

## Saved profiles disappeared

Profiles live in browser localStorage. Clearing site data, private browsing, browser profiles, or some storage-cleanup tools can remove them. Use Export for a manual backup.

## PWA does not update immediately

Close all ChronoAge tabs/windows, reopen the app, and allow the new service worker to activate. Browser developer tools can unregister stale development workers.

## E2E browser missing

```bash
npx playwright install chromium
```
