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
- validates imported profile data and applies a size/profile count limit,
- redacts likely PII/secret keys from structured logging,
- limits the service worker cache to same-origin GET requests,
- commits no credentials and provides only placeholder `.env.example` values,
- runs dependency review/CodeQL/security checks in GitHub Actions.

## Disclosure

After a fix is available, maintainers may publish a concise advisory and credit the reporter if requested.
