# Changelog

All notable changes to ChronoAge are documented here. The project follows Keep a Changelog principles and semantic versioning where practical.

## [Unreleased]

### Added
- Search/filter controls for saved profiles by name or birth date.
- Accessible profile editing UI backed by the existing validated `updateProfile` storage operation.
- Regression tests covering profile updates and missing-profile errors.

### Planned
- Install/update prompt UX using browser capabilities.
- Automated accessibility audit in CI.
- Release screenshots captured from CI/release candidate.
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
