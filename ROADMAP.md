# ChronoAge Roadmap

## Current release — v2.0.13

ChronoAge `2.0.13` consolidates the completed core PWA, polish, advanced date tooling, accessibility, privacy, saved-profile, reliability, security, release-hardening, cross-platform native-delivery, and deterministic release-evidence work described below. Remaining unchecked items are deliberately evidence-gated; they are not silently treated as complete for the `2.0.13` source tree.

## Next planned milestone — v2.1.0

The next milestone focuses first on reproducibility and repository governance, then on carefully scoped product improvements. See [docs/releases/2.1.0-plan.md](docs/releases/2.1.0-plan.md) for the implementation order and release gates.

### Reproducibility and governance

- [ ] Generate and review a genuine `package-lock.json` using Node.js `22.13.0`.
- [ ] Generate and review a genuine `src-tauri/Cargo.lock` using Rust `1.97.1`.
- [ ] Switch permanent push/PR and Native CI frontend installation to `npm ci`.
- [x] Add an explicit fail-closed installation policy for the pre-lockfile/locked transition.
- [ ] Enforce locked native dependency verification where required.
- [ ] Record a clean web/E2E/native release-candidate verification run.
- [ ] Configure and verify effective `main` branch protection/ruleset.

### Product and compatibility improvements

- [x] Define explicit backup schema-version metadata and future migration boundaries.
- [x] Reject unsupported future backup schemas with a stable user-safe message.
- [ ] Complete human translation review for the first additional locale pack.
- [ ] Add locale-aware date/number/weekday/duration formatting tests.
- [ ] Add locale selection without serializing private calculator/profile data into URLs.

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
- [x] Enforce native Tauri/Cargo version consistency and Native CI Node runtime pins in metadata checks
- [x] Require tag releases to pass npm lockfile preflight and use `npm ci`
- [x] Create deterministic web archives with normalized ordering, timestamps, ownership, and gzip metadata
- [x] Generate deterministic machine-readable release evidence manifests tied to the tag, full commit SHA, archive digest, and source-date epoch
- [x] Re-verify the downloaded archive checksum in the publish job before GitHub Release creation
- [x] Enforce release evidence generation/publication and publish-time integrity checks with static policy plus regression tests
- [x] Add a fail-closed workflow dependency-install policy for the lockfile transition
- [ ] Generate and review a real `package-lock.json` from a successful clean npm resolution
- [ ] Switch permanent push/PR and Native CI frontend installation from `npm install` to `npm ci` after the lockfile is committed
- [ ] Generate and review `src-tauri/Cargo.lock` from a successful clean native dependency resolution
- [ ] Execute the complete clean-checkout install/check/E2E/native release gate in a network-enabled environment and record the passing run
- [ ] Enable and verify the documented `main` branch protection/ruleset in GitHub repository settings

The dependency-lock items above depend on real registry resolution. Lock metadata must not be hand-authored or inferred. A dedicated network-enabled verification branch/PR may be used to generate the lockfiles, but these items remain unchecked until the resulting dependency graphs and quality runs are actually verified.

`main` branch protection is a separate GitHub repository-setting task. The GitHub API still reports the branch as unprotected; see [docs/github.md](docs/github.md) for the intended ruleset. Do not mark that item complete until GitHub reports an effective protection/ruleset configuration.

## Cross-platform native delivery

- [x] Adopt Tauri 2 in a dedicated architecture decision
- [x] Add a shared native Rust entrypoint and Tauri application configuration
- [x] Support Windows native builds
- [x] Support macOS native builds
- [x] Support Linux native builds
- [x] Support Android native project generation, development, APK, and AAB builds
- [x] Support iOS/iPadOS native project generation, development, and builds
- [x] Keep the existing web/PWA build as a first-class delivery target
- [x] Disable browser-only PWA install/update behavior inside the native runtime
- [x] Start native permissions at Tauri `core:default` only
- [x] Add Windows/macOS/Linux native compile CI
- [x] Add Android debug APK smoke-build CI
- [x] Add iOS simulator smoke-build CI
- [x] Document desktop/mobile prerequisites, signing, packaging, privacy, and release boundaries
- [ ] Record a completely green Native CI run for the final release candidate
- [ ] Generate reviewed platform icon sets from the source logo before public store submission
- [ ] Produce, sign, verify, and publish platform installers/store artifacts when release credentials are configured

The native-delivery architecture is defined by [ADR 0007](docs/adr/0007-tauri-cross-platform-native-delivery.md), which supersedes ADR 0006 for native-delivery policy. The product now shares one React + TypeScript frontend and deterministic date-domain implementation across web, Windows, macOS, Linux, Android, and iOS rather than maintaining separate feature implementations.

A platform being source-supported does not mean a signed installer or store listing has already been published. Public native artifacts remain evidence-gated on target-host builds, signing/notarization/store configuration, and release verification.

Additional locale packs are intentionally gated on complete human translation review; the English-first architecture is already externalized and documented.

Roadmap items are not promises and may change based on quality, security, and maintainability.
