# Changelog

All notable changes to ChronoAge are documented here. The project follows Keep a Changelog principles and semantic versioning where practical.

## [Unreleased]

### Added
- Search/filter controls for saved profiles by name or birth date.
- Accessible profile editing UI backed by the existing validated `updateProfile` storage operation.
- Regression tests covering profile updates and missing-profile errors.
- PWA install availability detection and a browser-native install action in Settings.
- Explicit service-worker update checks with a controlled waiting-worker apply flow.
- Playwright accessibility smoke checks for landmarks, accessible names, form labels, and image alternative text.
- Desktop and mobile release-candidate screenshot capture in the Playwright suite.
- CI upload of generated release-candidate screenshots.
- PWA lifecycle documentation.
- Custom milestone calculations for positive whole-number day counts or birthday years.
- Accessible custom milestone builder UI with leap-day-policy support.
- Calendar-duration visualization for the age-difference tool.
- Explicit earlier/later selection for repeated daylight-saving fall-back local times.
- DST overlap/gap regression coverage using IANA timezone data.
- Desktop delivery/signing documentation and an ADR retaining PWA-first desktop support.
- Central runtime project metadata for version, repository/funding links, contacts, license, and visible credit.
- Internationalization contributor documentation and expanded externalized English UI strings.
- Focused calculator and difference-page component regression tests for advanced date behavior.
- Advanced-tool accessibility checks and screenshot captures for difference/milestone screens.
- Storage regression tests for corrupted local profiles, duplicate backup ids, malformed timestamps, and malformed boolean preferences.

### Changed
- Service-worker activation now waits for explicit update application instead of always taking control immediately after installation.
- Profile data controls now describe editing as part of the local-only workflow.
- Timezone-aware calculations apply one persisted DST-overlap policy consistently to birth, reference, and anchor instants.
- Calendar year/month arithmetic rejects results outside the supported civil-year range.
- README and date-semantics documentation now describe advanced milestone, visualization, and DST behavior.
- Major application-shell, calculator, result, comparison, interval, milestone, profile, settings, onboarding, and About copy now comes from the English locale module.
- About/Settings/application shell reuse centralized project metadata rather than repeating runtime version/contact/link values.
- Saved-profile loading validates content rather than trusting structurally shaped local JSON.
- Settings loading accepts only real booleans for boolean preferences instead of JavaScript truthiness coercion.
- Accessibility E2E setup now deterministically seeds first-run settings instead of depending on onboarding text matching.

### Fixed
- Profile edit actions now use an icon-only fixed-size control so long translated/action text cannot overflow the icon button.
- Milestone screenshot assertions no longer fail Playwright strict mode when built-in and custom 10,000-day labels are both visible.

### Planned
- Additional locale packs after translation review.
- A maintained full accessibility-engine audit in CI.
- A native wrapper only if a concrete native-only requirement justifies its additional signing, update, and security surface.

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
