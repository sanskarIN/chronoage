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

### Changed
- Service-worker activation now waits for explicit update application instead of always taking control immediately after installation.
- Profile data controls now describe editing as part of the local-only workflow.

### Planned
- Additional locale packs after translation review.
- A maintained full accessibility-engine audit in CI.
- Optional Tauri desktop wrapper after the PWA release is stable.

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
