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

ChronoAge is a static client-side PWA. It has no built-in server, authentication system, payment system, or cloud database. The primary security boundaries are browser input validation, local persistence integrity, safe rendering, dependency supply-chain hygiene, and PWA cache behavior.

The application:

- does not use `dangerouslySetInnerHTML`,
- validates imported profile data before persistence,
- limits backup input size and profile count,
- rejects duplicate imported profile ids and malformed profile timestamps,
- validates and normalizes profile names and calendar dates at the storage boundary,
- ignores independently corrupted local profile entries rather than trusting their shape,
- does not coerce malformed JSON strings into enabled boolean settings,
- redacts likely PII/secret keys from structured logging,
- logs only aggregate counts when reporting ignored local profile corruption,
- limits the service worker cache to same-origin GET requests,
- requires explicit user action before applying a waiting service-worker update,
- commits no credentials and provides only placeholder `.env.example` values,
- runs dependency review/CodeQL/security checks in GitHub Actions.

## Native desktop boundary

ChronoAge currently uses PWA installation for Windows, macOS, and Linux rather than shipping an unsigned native wrapper. Any future native wrapper must receive a separate permissions, signing, updater, and CI-secret review before release. See `docs/adr/0006-pwa-first-desktop-delivery.md`.

## Disclosure

After a fix is available, maintainers may publish a concise advisory and credit the reporter if requested.
