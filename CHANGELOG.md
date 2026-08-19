# Changelog

All notable changes to ChronoAge are documented here. The project follows Keep a Changelog principles and semantic versioning where practical.

## [Unreleased]

### Added
- Search/filter controls for saved profiles by name or birth date.
- Accessible profile editing UI backed by the existing validated `updateProfile` storage operation.
- PWA install availability detection and a browser-native install action in Settings.
- Explicit service-worker update checks with a controlled waiting-worker apply flow.
- Custom milestone calculations for positive whole-number day counts or birthday years.
- Accessible custom milestone builder UI with leap-day-policy support.
- Calendar-duration visualization for the age-difference tool with an exact screen-reader summary.
- Explicit earlier/later selection for repeated daylight-saving fall-back local times.
- DST overlap/gap regression coverage using IANA timezone data.
- Maintained `@axe-core/playwright` WCAG A/AA audits across every core page plus dark-theme and mobile states.
- Product-specific Playwright accessibility smoke checks for landmarks, accessible names, labels, and image alternatives.
- Responsive E2E navigation helpers so the same browser journeys operate through desktop and mobile navigation.
- Desktop and mobile release-candidate screenshot capture for the calculator, difference visualization, and custom milestone builder.
- Offline PWA browser coverage that verifies controlled reload and navigation-only document fallback.
- Central runtime project metadata for version, repository/funding links, contacts, license, and visible credit.
- Project metadata consistency checker integrated with the quality suite and CI.
- Static browser-security invariant checker integrated with the quality suite and CI.
- Release-tag identity checker requiring `vMAJOR.MINOR.PATCH` to match `package.json` exactly.
- Restrictive browser Content Security Policy and `no-referrer` metadata in the application document.
- Production security-header deployment guidance.
- GitHub repository operations guidance for branch protection, labels, milestones, Discussions, releases, and secret handling.
- Desktop delivery/signing documentation and an ADR retaining PWA-first desktop support until a native-only requirement exists.
- Internationalization contributor documentation and expanded externalized English UI strings.
- PWA manifest identity metadata including stable id/scope/language/direction/category fields.
- Focused unit/component regression tests for DST policy, custom milestones, duration visualization, profile validation, storage corruption, UTF-8 backup limits, and malformed settings.

### Changed
- Service-worker activation waits for explicit update application instead of always taking control immediately after installation.
- Offline document fallback is restricted to navigation requests; failed scripts/styles/images no longer receive cached HTML.
- Service-worker cache generation advanced to invalidate the previous app-shell cache after offline-behavior changes.
- Profile data controls describe editing as part of the local-only workflow.
- Profile backup selection rejects files over 1 MB before reading them, and storage independently validates the UTF-8 byte size before parsing.
- Saved-profile loading validates ids, uniqueness, timestamps, names, and calendar dates instead of trusting structurally shaped local JSON.
- Settings loading accepts only real booleans for boolean preferences instead of JavaScript truthiness coercion.
- Profile names reject unsupported control characters after whitespace normalization.
- Timezone-aware calculations apply one persisted DST-overlap policy consistently to birth, reference, and anchor instants.
- Calendar year/month arithmetic rejects results outside the supported civil-year range.
- Major application-shell, calculator, result, comparison, interval, milestone, profile, settings, onboarding, and About copy now comes from the English locale module.
- About, Settings, and the application shell reuse centralized project metadata rather than repeating runtime version/contact/link values.
- Playwright application, accessibility, and screenshot journeys now navigate correctly in both desktop and mobile projects.
- Accessibility E2E setup deterministically seeds first-run settings instead of depending on onboarding text matching.
- Release tags rerun non-E2E quality checks, runtime dependency audit, Chromium journeys, offline PWA tests, and automated accessibility audits before publishing an artifact.
- Release tags must match the embedded package/runtime version before a GitHub Release can be created.
- Direct TypeScript tooling is pinned to TypeScript 6.0.3 to remain inside the supported typescript-eslint compatibility range instead of using the unsupported TypeScript 7 line.
- Package metadata now includes repository, homepage, bugs, and funding fields.
- README, architecture, date-semantics, testing, development, accessibility, performance, privacy, security, release, PWA, and troubleshooting documentation were expanded to match implemented behavior.

### Fixed
- Profile edit actions use an icon-only fixed-size control so long translated/action text cannot overflow the icon button.
- Milestone screenshot assertions no longer fail Playwright strict mode when built-in and custom 10,000-day labels are both visible.
- Mobile Playwright projects no longer attempt to click hidden desktop-sidebar navigation controls.
- Missing non-navigation resources no longer receive `index.html` as an offline fallback.
- Backup limits are measured in UTF-8 bytes rather than JavaScript character count.
- Malformed stored strings such as `"true"` no longer enable boolean accessibility/onboarding preferences.
- Application and manifest theme metadata use the same primary design token.

### Planned
- Additional locale packs after complete human translation review.
- A native wrapper only if a concrete native-only requirement justifies its additional signing, update, permission, and security surface.

## [1.0.0] - 2026-08-19

### Added
- Exact calendar age calculation with optional time-of-day precision.
- IANA-timezone conversion using native `Intl` round-trip validation.
- Next-birthday countdown and weekday calculation.
- Absolute age difference and inclusive/exclusive interval tools.
- Day-count and anniversary milestones including 10,000 days.
- Configurable February 29 anniversary policy.
- Local-only saved profiles with validated JSON import/export.
- Responsive PWA shell, offline service worker, manifest, themes, onboarding, quick actions, print/share cards.
- Accessibility preferences and keyboard-first navigation.
- Unit, storage, component, and Playwright E2E tests.
- CI, CodeQL, dependency review, release workflow, Dependabot, issue/PR templates.
- Full project, privacy, security, architecture, setup, testing, release, accessibility, performance, and troubleshooting documentation.
