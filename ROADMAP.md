# ChronoAge Roadmap

## Current release — v2.0.12

ChronoAge `2.0.12` consolidates the completed core PWA, polish, advanced date tooling, accessibility, privacy, saved-profile, reliability, security, and release-hardening work described below. Remaining unchecked items are deliberately evidence-gated or intentionally deferred; they are not silently treated as complete for the `2.0.12` source tree.

## v1.0 — Core production PWA

- [x] Exact age calculator
- [x] Next birthday
- [x] Age difference
- [x] Date interval
- [x] Milestones
- [x] Local profiles and backup/restore
- [x] Theme/accessibility settings
- [x] Offline PWA
- [x] Automated tests and CI
- [x] Documentation and security baseline

## v1.1 — Polish

- [x] Search/filter for large local profile collections
- [x] Deterministic saved-profile sorting without mutating storage order
- [x] Editable saved profiles using the validated local storage model
- [x] One-step undo for individual saved-profile deletion
- [x] Confirm backup replacement before overwriting an existing saved-profile collection
- [x] Direct saved-profile handoff into the Age calculator
- [x] Progressive 20-card rendering for bounded profile-list DOM work
- [x] Privacy-safe page deep links and browser Back/Forward navigation using public page identifiers only
- [x] Route-change document titles and main-content focus management
- [x] Install/update prompt UX using browser capabilities
- [x] Baseline automated browser accessibility regression checks
- [x] Maintained axe-core WCAG A/AA audits across core pages, dark theme, and mobile viewport
- [x] Release-candidate screenshot automation
- [x] Externalized English UI strings and centralized runtime project metadata
- [x] Keyboard focus containment/restoration for blocking onboarding and quick-action dialogs
- [x] User-visible warning when settings persistence degrades to session-only state
- [ ] Additional locale packs after translation review

## v1.2 — Advanced date tooling

- [x] Optional custom milestone builder
- [x] Calendar-duration comparison visualization
- [x] Explicit DST ambiguity choice for repeated fall-back hours
- [x] Free-form browser-supported IANA timezone entry with suggestions and inline validation
- [x] Exact-age clock units shown only when time-of-day precision is enabled

## Release hardening

- [x] Central user-safe error classification so unexpected implementation errors are not rendered directly
- [x] Root React crash-recovery boundary
- [x] Global browser error and unhandled-rejection logging through a privacy-safe logger
- [x] Structured diagnostic redaction for sensitive keys, emails, bearer credentials, dates, times, circular data, and excessive nesting
- [x] Static invariant preventing runtime code from bypassing the structured logger with direct console output
- [x] Graceful settings/profile behavior when browser storage is blocked or quota-limited
- [x] Stable malformed-backup errors without exposing JSON parser details
- [x] Contained PWA install/update promise failures
- [x] Automated first-party JavaScript/CSS gzip budgets in local checks, CI, and release tags
- [x] Manual GitHub Actions CI dispatch option for release-candidate verification
- [x] Release tag/package-version identity gate
- [x] Pin permanent CI/release Node runtime to `.nvmrc` and enforce runtime-pin consistency
- [x] Reject saved-profile histories whose update timestamp precedes creation
- [ ] Generate and review a real `package-lock.json` from a successful clean npm resolution
- [ ] Switch CI/release installation from `npm install` to `npm ci` after the lockfile is committed
- [ ] Execute the complete clean-checkout install/check/E2E release gate in a network-enabled environment and record the passing run
- [ ] Enable and verify the documented `main` branch protection/ruleset in GitHub repository settings

The three dependency-installation items above depend on a real npm registry resolution. Lock metadata must not be hand-authored or inferred. A dedicated network-enabled verification branch/PR may be used to generate the lockfile, but these items remain unchecked until the resulting dependency graph and quality runs are actually verified.

`main` branch protection is a separate GitHub repository-setting task. The GitHub API reported the branch as unprotected on 2026-08-19; see [docs/github.md](docs/github.md) for the intended ruleset. Do not mark that item complete until GitHub reports an effective protection/ruleset configuration.

## Desktop delivery decision

- [x] Evaluate Tauri/native wrapper in a dedicated ADR
- [x] Document Windows/macOS/Linux delivery, signing, and packaging requirements
- [x] Define the desktop update strategy without changing the local-first privacy model
- [ ] Add a native wrapper only after a justified native-only requirement exists

The current supported desktop delivery is the installable PWA. Native-wrapper work is intentionally deferred by [ADR 0006](docs/adr/0006-pwa-first-desktop-delivery.md), not blocked by missing implementation.

Additional locale packs are intentionally gated on complete human translation review; the English-first architecture is already externalized and documented.

Roadmap items are not promises and may change based on quality, security, and maintainability.
