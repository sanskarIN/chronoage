# Security Policy

## Supported versions

Security fixes target the latest released version of ChronoAge and the current `main` branch.

## Reporting a vulnerability

Do not disclose a suspected vulnerability publicly before maintainers have had a reasonable opportunity to investigate it.

Email `sanskarin@outlook.in` with:

- affected version/commit,
- reproduction steps,
- expected and observed behavior,
- realistic impact,
- suggested mitigation if known.

Do not include unrelated personal data in a report.

## Security model

ChronoAge is a static client-side PWA. It has no built-in server, authentication system, payment system, or cloud database. The primary security boundaries are browser input validation, local persistence integrity, safe rendering, user-safe error handling, privacy-safe diagnostics, dependency supply-chain hygiene, browser content policy, and PWA cache behavior.

The application:

- does not use `dangerouslySetInnerHTML`, `eval`, the `Function` constructor, or `document.write`, with these source invariants checked by `npm run security:check`;
- rejects direct runtime `console.log`, `console.info`, `console.warn`, `console.error`, and `console.debug` calls outside the centralized privacy-safe logger;
- scans both application source and public JavaScript for the selected dangerous source patterns;
- ships a same-origin-first Content Security Policy and `no-referrer` browser metadata;
- documents stronger host-level headers, including anti-framing and permissions policy, in `docs/security-headers.md`;
- validates imported profile data before persistence;
- rejects oversized backups before the UI reads them and rechecks the UTF-8 byte limit at the storage boundary;
- limits backup profile count and rejects duplicate imported profile ids and malformed profile timestamps;
- converts malformed backup JSON into a stable user-safe error instead of exposing parser implementation text;
- validates and normalizes profile names and calendar dates at the storage boundary;
- rejects unsupported control characters in persisted profile names;
- ignores independently corrupted local profile entries rather than trusting their shape;
- does not coerce malformed JSON strings into enabled boolean settings;
- exposes only curated `DateCalculationError` or `UserVisibleError` messages to product UI fallbacks; unexpected exceptions receive generic user-safe text;
- redacts likely PII/secret keys and common email, bearer-token, ISO-date, and clock-time text from structured logging;
- handles circular/deep log context without serializing an unbounded object graph;
- logs only aggregate counts when reporting ignored local profile corruption;
- routes unhandled browser errors and unhandled promise rejections through the privacy-safe logger;
- wraps the React application in a local crash-recovery boundary that does not upload diagnostics;
- limits the service worker cache to same-origin GET requests;
- restricts the cached `index.html` offline fallback to document navigations rather than serving HTML for missing assets;
- requires explicit user action before applying a waiting service-worker update;
- commits no credentials and provides only placeholder `.env.example` values;
- runs static security invariants, runtime dependency audit, dependency review, and CodeQL in repository automation;
- reruns browser journeys and automated accessibility checks on release tags before creating the release artifact.

## Content Security Policy

The HTML CSP intentionally permits inline styles because the duration visualization uses a dynamic style value. It does **not** permit inline scripts or third-party script origins. If the visualization is later changed to avoid inline style attributes, remove `'unsafe-inline'` from `style-src` and tighten the deployment header at the same time.

The host should send an HTTP CSP that is at least as restrictive as the HTML baseline and add `frame-ancestors 'none'`, which cannot be reliably enforced through a CSP meta element.

## Diagnostic privacy

ChronoAge has no crash-reporting or analytics backend. Runtime diagnostics are written only to the local browser console through `src/utils/logger.ts`.

The logger is defense in depth, not permission to log personal data. Callers should provide event categories, error types, and aggregate counts rather than profile values, dates, times, backup content, or other user data. The redactor removes common sensitive patterns if they appear accidentally, but new logging must still be reviewed for data minimization.

## Native desktop boundary

ChronoAge currently uses PWA installation for Windows, macOS, and Linux rather than shipping an unsigned native wrapper. Any future native wrapper must receive a separate permissions, signing, updater, and CI-secret review before release. See `docs/adr/0006-pwa-first-desktop-delivery.md`.

## Disclosure

After a fix is available, maintainers may publish a concise advisory and credit the reporter if requested.
