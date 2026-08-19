# ChronoAge — Work Handoff

## Current milestone

Version 1.1 polish work on top of the existing `1.0.0` production PWA baseline.

## Repository state reviewed

- Existing repository was inspected before modification; working code and history were preserved.
- Current package version remains `1.0.0` while v1.1 work accumulates under `Unreleased`.
- The repository already included the core calculator, birthday logic, date difference/interval tools, milestones, local profiles, settings, offline PWA support, tests, CI, CodeQL, Dependabot, documentation, and release tooling.
- The existing storage layer already exposed `updateProfile`, but the Profiles UI did not provide editing.
- The existing v1.1 roadmap called for profile search/filter, install/update UX, accessibility automation, and release-candidate screenshots.

## Completed in this continuation

### Handoff and continuity

- Added this `what_changed.md` file as the primary cross-chat continuation record required by the master prompt.

### Saved-profile polish

- Added saved-profile filtering by name or `YYYY-MM-DD` birth-date text.
- Added a visible result count while filtering.
- Added an empty state for searches with no matches.
- Added accessible profile editing controls using the existing validated `updateProfile` storage operation.
- Preserved profile identity/creation timestamp when editing.
- Added storage regression coverage for successful edits and missing-profile errors.
- Added component-level coverage for profile searching and editing.

### PWA install/update lifecycle

- Added `usePwaLifecycle` to track browser install availability, installed display mode, update checking, and waiting-worker application.
- Added browser-native **Install app** controls to Settings without forcing installation.
- Replaced the previous reload-only update control with explicit service-worker update checking.
- Changed the service worker from immediate `skipWaiting()` activation to a controlled waiting-worker flow.
- Added `SKIP_WAITING` message handling and controller-change reload behavior.
- Incremented the service-worker cache namespace from `chronoage-v1` to `chronoage-v2`.
- Added `docs/pwa.md` covering installation, updates, privacy, and verification expectations.

### Accessibility automation

- Added Playwright browser-level accessibility smoke checks for primary navigation, the skip link, single H1 structure, accessible button names, form-control labels, and image `alt` attributes.
- Updated `docs/accessibility.md` to distinguish these regression checks from a full WCAG/accessibility-engine audit.

### Release-candidate screenshot automation

- Added Playwright capture of desktop and 390x844 mobile calculator screenshots.
- Updated CI to upload generated `chronoage-*.png` screenshots as the `chronoage-release-candidate-screenshots` artifact on every E2E run.

### Documentation and roadmap

- Updated `CHANGELOG.md` with the current v1.1 additions and service-worker behavior change.
- Updated `ROADMAP.md` to mark profile search/editing, install/update UX, baseline accessibility automation, and release-candidate screenshot automation complete.

## Files added

- `what_changed.md`
- `src/hooks/usePwaLifecycle.ts`
- `tests/ProfilesPage.test.tsx`
- `tests/e2e/accessibility.spec.ts`
- `tests/e2e/screenshots.spec.ts`
- `docs/pwa.md`

## Files changed

- `src/pages/ProfilesPage.tsx`
- `src/pages/SettingsPage.tsx`
- `public/sw.js`
- `tests/profiles.test.ts`
- `.github/workflows/ci.yml`
- `docs/accessibility.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`

## Verification performed / constraints

- Repository state, source files, tests, workflows, and recent commit history were inspected through the authenticated GitHub connector.
- The execution container cannot resolve `github.com`; a clean Git clone and dependency installation could not be performed there.
- An attempted local dependency install in a temporary reconstruction timed out and was not used as evidence for the real repository.
- GitHub combined-status lookup for a newly created commit returned no status contexts, so no passing CI claim is made here.
- New work was written to preserve the repository's existing no-tabs/LF/final-newline formatting convention checked by `scripts/check-format.mjs`.
- The GitHub connector's contents-write API does not expose an author-email field. `package.json` and project documentation still specify `sanskarin@outlook.in`; connector-created commits use the authenticated GitHub identity.

## Known limitations / open work

- Full accessibility-engine auditing (for example a maintained axe integration) remains open; current Playwright checks are a dependency-light regression baseline, not a conformance audit.
- Additional locale packs remain intentionally blocked on translation review.
- The repository currently has no committed `package-lock.json`; CI uses `npm install`. Reproducible lockfile generation should be done from a network-enabled clean environment rather than hand-authoring lock metadata.
- The PWA update UI should be exercised against two deployed service-worker versions because waiting/activation behavior cannot be fully proven by static inspection.
- Profile editing uses the current card layout and should receive visual review at narrow breakpoints during the next executable UI verification pass.
- Optional v1.2 advanced date tooling and v2.0 Tauri packaging remain roadmap work, not blockers for the existing 1.0 production-PWA definition.

## Next exact tasks

1. Inspect GitHub Actions results for the newest `main` commits when run data becomes available; fix any format, lint, type, test, build, or E2E failures before release tagging.
2. Generate and commit a real npm lockfile from the repository in a network-enabled environment, then switch CI from `npm install` to `npm ci`.
3. Perform deployed PWA install/update tests across Chromium desktop and an Android-capable browser.
4. Perform manual keyboard, 200% zoom, dark/light/high-contrast, and mobile profile-editing review.
5. Add a maintained accessibility engine only with pinned dependency/version and documented rule ownership.
6. Continue v1.2 only after the v1.1 verification pass is green.

## Commit log for this continuation

- `bae59ca` — `docs: add project continuation handoff`
- `111a33c` — `test: cover profile editing persistence`
- `47ff3cd` — `feat: add profile search and editing`
- `510bf4f` — `docs: record v1.1 profile improvements`
- `875fdc4` — `docs: mark profile search as complete`
- `b6942cc` — `feat: track PWA install and update lifecycle`
- `ff8a5c7` — `feat: support controlled PWA updates`
- `a7b0d91` — `feat: add PWA install and update controls`
- `30ea58a` — `test: cover profile search and edit UI`
- `bb0a972` — `test: add browser accessibility smoke checks`
- `7a0ca09` — `docs: document accessibility smoke automation`
- `8aff394` — `docs: document PWA install and update lifecycle`
- `9a64f75` — `docs: mark PWA install update UX complete`
- `72c07c0` — `test: capture release candidate screenshots`
- `bfe6722` — `ci: upload release candidate screenshots`
- `94bb500` — `docs: mark screenshot automation complete`
- `e207c7f` — `docs: record v1.1 PWA and quality work`

## Release notes draft

The next ChronoAge release improves local profile management with search and editing, adds browser-native PWA installation and controlled update application, expands browser accessibility regression coverage, and generates desktop/mobile release-candidate screenshots in CI while preserving the local-first privacy model.
