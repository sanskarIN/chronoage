# Changelog

All notable changes to ChronoAge are documented here. The project follows Keep a Changelog principles and semantic versioning where practical.

## [Unreleased]

No changes yet.

## [2.0.13] - 2026-08-25

### Added
- Tauri 2 native shell targeting Windows, macOS, Linux, Android, and iOS/iPadOS while reusing the existing React + TypeScript frontend and deterministic date-domain implementation.
- Shared Rust desktop/mobile entrypoint, Tauri bundle configuration, and least-privilege `core:default` capability for the main native window.
- Native runtime detection so browser-only PWA installation, service-worker registration, and PWA update controls are disabled inside installed Tauri applications.
- Native build commands for desktop development/builds, Android APK/AAB development and builds, and iOS/iPadOS development and builds.
- Reproducible native icon generation from the existing ChronoAge SVG logo for Windows, macOS, Linux, Android, and iOS assets.
- Native CI covering Windows, macOS, and Linux compile builds plus Android debug APK and iOS simulator smoke builds.
- Cross-platform platform matrix, mobile guide, native desktop guide, native release gates, and ADR 0007 documenting the Tauri architecture.
- Metadata consistency checks for Tauri/Cargo versions and Native CI Node runtime pins.
- Static security checks for the native CSP, local frontend bundle, disabled global Tauri API injection, loopback-only development URL, and minimal native capability set.
- npm/Cargo release lockfile preflight commands with regression coverage for missing, inconsistent, and malformed release dependency state.
- A dedicated static release-workflow policy check covering lockfile-only release installation, deterministic packaging, checksums, and verify-before-publish ordering.
- Reproducible-build documentation covering real lockfile generation/review, `npm ci`, Cargo `--locked`, deterministic archives, and release-candidate evidence.
- Deterministic machine-readable release evidence manifests containing source identity, archive identity, runtime identity, and generated dependency-lock hashes when available.
- Regression coverage for release evidence generation, archive/checksum mismatch rejection, tag/commit identity validation, and release workflow evidence policy.

### Changed
- Desktop delivery now supports native Tauri packages in addition to the existing PWA/browser path.
- Vite development networking honors `TAURI_DEV_HOST` for native mobile-device development while retaining the existing local web workflow.
- Repository lint/format tooling ignores reproducibly generated Tauri mobile projects, build output, and native icon assets.
- Native generated projects, build artifacts, and signing credentials are explicitly excluded from Git.
- Release documentation now distinguishes source-supported native targets from signed/published installers and store artifacts.
- Architecture and roadmap documentation now describe one shared product implementation delivered through web/PWA and native shells.
- Tag-triggered web releases now fail before installation when the npm lockfile is absent/inconsistent and use `npm ci` rather than resolving dependencies with `npm install`.
- Web release archives now normalize entry ordering, timestamps, ownership, and gzip metadata before generating their SHA-256 checksum.
- Release verification now exports the commit-derived `SOURCE_DATE_EPOCH` into deterministic release evidence.
- The publish job now re-verifies the downloaded archive checksum before GitHub Release creation and publishes the archive, checksum, and evidence manifest together.
- Native CI now reruns when `package-lock.json` changes because native builds consume the shared frontend dependency graph.
- Native security documentation now describes the implemented Tauri 2 capability/runtime boundary instead of the superseded future-wrapper model.
- Canonical package, runtime, Tauri, Cargo, and PWA cache metadata now identify source version `2.0.13`.

### Fixed
- The lockfile preflight no longer lets `--all` mask an unknown command-line target.
- Release workflow policy now fails if publish-time checksum verification, release evidence generation, or GitHub Release manifest attachment is removed.

### Planned
- Generate and review a real npm lockfile from a successful clean network-enabled resolution, then migrate the remaining push/PR/native frontend installs to `npm ci`.
- Generate and review a real `src-tauri/Cargo.lock` from a successful clean native dependency resolution, then use locked Cargo resolution in release/native verification.
- Record passing clean-checkout full quality/E2E/native CI evidence for the final release candidate.
- Enable and verify effective `main` branch protection/rulesets.
- Produce and verify signed/notarized/store-ready native artifacts when platform release credentials are configured.
- Additional locale packs after complete human translation review.

## [2.0.12] - 2026-08-19

### Added
- Search/filter controls for saved profiles by name or birth date.
- Deterministic saved-profile sorting by recent storage order, name, or birth date without mutating persisted ordering.
- Accessible profile editing UI backed by the existing validated `updateProfile` storage operation.
- One-step undo for the most recently deleted saved profile while preserving its original identity, timestamps, and list position.
- Confirmation before importing a backup over an existing saved-profile collection.
- Direct saved-profile handoff to the Age calculator with birth-date prefill.
- Progressive saved-profile rendering in batches of 20 for bounded DOM work at the 100-profile cap.
- Privacy-safe page hash deep links and browser Back/Forward navigation using public page identifiers only.
- Route-change document-title updates and main-content focus transfer for SPA navigation.
- PWA install availability detection and a browser-native install action in Settings.
- Explicit service-worker update checks with a controlled waiting-worker apply flow.
- Custom milestone calculations for positive whole-number day counts or birthday years.
- Accessible custom milestone builder UI with leap-day-policy support.
- Calendar-duration visualization for the age-difference tool with an exact screen-reader summary.
- Explicit earlier/later selection for repeated daylight-saving fall-back local times.
- Free-form browser-supported IANA timezone inputs with common suggestions and inline validation.
- DST overlap/gap regression coverage using IANA timezone data.
- Maintained `@axe-core/playwright` WCAG A/AA audits across every core page plus dark-theme and mobile states.
- Product-specific Playwright accessibility smoke checks for landmarks, accessible names, labels, route focus/title behavior, and image alternatives.
- Responsive E2E navigation helpers so the same browser journeys operate through desktop and mobile navigation.
- Keyboard focus entry, containment, and restoration for the quick-actions modal.
- First-run onboarding focus containment and background-shortcut isolation.
- Desktop and mobile release-candidate screenshot capture for the calculator, difference visualization, and custom milestone builder.
- Offline PWA browser coverage that verifies controlled reload and navigation-only document fallback.
- Root React crash-recovery UI with a local reload action and no telemetry dependency.
- Global browser error and unhandled-promise-rejection routing through the structured privacy-safe logger.
- Central user-visible error classification for expected calculation/product failures.
- Structured logging redaction for sensitive object keys, emails, bearer credentials, ISO dates, clock times, circular references, and excessive nesting.
- Central runtime project metadata for version, repository/funding links, contacts, license, and visible credit.
- Project metadata consistency checker integrated with the quality suite and CI.
- Runtime-pin consistency checks covering `.nvmrc`, the package Node engine floor, and permanent CI/release `node-version` declarations.
- Static browser-security invariant checker integrated with the quality suite and CI.
- Static enforcement preventing runtime source from bypassing the privacy-safe logger with direct console output.
- Production JavaScript/CSS gzip budget checker integrated with `npm run check` and CI.
- Manual GitHub Actions CI dispatch support for explicit release-candidate verification.
- Release-tag identity checker requiring `vMAJOR.MINOR.PATCH` to match `package.json` exactly.
- Restrictive browser Content Security Policy and `no-referrer` metadata in the application document.
- Production security-header deployment guidance.
- GitHub repository operations guidance for branch protection, labels, milestones, Discussions, releases, and secret handling.
- Desktop delivery/signing documentation and an ADR retaining PWA-first desktop support until a native-only requirement exists.
- Internationalization contributor documentation and expanded externalized English UI strings.
- PWA manifest identity metadata including stable id/scope/language/direction/category fields.
- Regression tests for runtime error recovery, safe-error classification, structured log redaction, modal focus behavior, PWA lifecycle failures, unavailable browser storage, arbitrary timezone entry, optional clock precision units, profile recovery, ordered undo, sorting, progressive profile rendering, import replacement safety, page routing/history, and profile-to-calculator navigation.

### Changed
- Canonical package and runtime project metadata now identify this release as version `2.0.12`.
- Permanent CI and release verification now run the exact project Node.js `22.13.0` pin instead of the moving Node 22 channel.
- Core page navigation uses a dependency-free hash/history layer so direct links are stable without introducing a router dependency or server rewrite requirement.
- Page route fragments contain only public page ids; calculator dates, times, profile names, saved birth dates, and other calculation values remain transient/local state rather than URL state.
- Invalid app-style `#/...` route fragments fall back to the canonical Age route while ordinary accessibility anchors such as `#main-content` remain untouched.
- Saved-profile name sorting uses an explicit English collator for deterministic behavior across current English-only CI/browser environments.
- Shared select helper text is programmatically associated with the control through `aria-describedby` while preserving any caller-supplied description ids.
- Service-worker activation waits for explicit update application instead of always taking control immediately after installation.
- Offline document fallback is restricted to navigation requests; failed scripts/styles/images no longer receive cached HTML.
- Service-worker cache generation advanced to invalidate the previous app-shell cache after offline-behavior changes.
- PWA install prompts are consumed after either acceptance or dismissal instead of leaving a stale prompt reusable.
- PWA install/update application failures are contained locally and reflected through safe lifecycle state instead of escaping as unhandled promise rejections.
- Profile data controls describe editing as part of the local-only workflow.
- Profile backup selection rejects files over 1 MB before reading them, and storage independently validates the UTF-8 byte size before parsing.
- Saved-profile loading validates ids, uniqueness, timestamps, names, and calendar dates instead of trusting structurally shaped local JSON.
- Profile storage reads gracefully fall back to an empty saved list when browser storage is blocked.
- Profile writes/clears convert blocked or quota-limited browser storage failures into stable user-visible errors.
- Saved-profile deletion now rejects missing identities rather than silently rewriting unchanged storage.
- A successful new profile save expires any prior single-delete undo snapshot so the UI cannot offer an undo that may exceed the 100-profile cap.
- Settings loading accepts only real booleans for boolean preferences instead of JavaScript truthiness coercion.
- Settings writes degrade to session-only state when browser storage is unavailable, and Settings displays that persistence limitation to the user.
- Profile names reject unsupported control characters after whitespace normalization.
- Malformed backup JSON is converted into stable import feedback instead of exposing JSON parser implementation details.
- Calculator, Difference, Interval, Milestones, and Profiles expose only explicitly user-safe error classes; unexpected implementation errors use generic fallbacks.
- Timezone-aware calculations apply one persisted DST-overlap policy consistently to birth, reference, and anchor instants.
- Calculator and Settings accept any IANA timezone identifier supported by the browser instead of restricting users to a small closed selector.
- Invalid default-timezone drafts remain visible for correction but are not persisted.
- Calendar year/month arithmetic rejects results outside the supported civil-year range.
- Exact-age hours/minutes are shown only when time-of-day precision is enabled; elapsed totals remain available independently.
- Major application-shell, calculator, result, comparison, interval, milestone, profile, settings, onboarding, About, crash-recovery, and shared metadata copy is externalized from feature components.
- About, Settings, and the application shell reuse centralized project metadata rather than repeating runtime version/contact/link values.
- Playwright application, accessibility, and screenshot journeys navigate correctly in both desktop and mobile projects.
- Accessibility E2E setup deterministically seeds first-run settings instead of depending on onboarding text matching.
- Release tags rerun non-E2E quality checks, runtime dependency audit, Chromium journeys, offline PWA tests, automated accessibility audits, and bundle-budget verification before publishing an artifact.
- Release tags must match the embedded package/runtime version before a GitHub Release can be created.
- Direct TypeScript tooling is pinned to TypeScript 6.0.3 to remain inside the supported typescript-eslint compatibility range instead of using the unsupported TypeScript 7 line.
- Package metadata now includes repository, homepage, bugs, and funding fields.
- README, architecture, date-semantics, testing, development, accessibility, performance, privacy, security, release, PWA, internationalization, and troubleshooting documentation were expanded to match implemented behavior.

### Fixed
- Imported or restored saved profiles whose `updatedAt` precedes `createdAt` are rejected instead of accepting an impossible timestamp history.
- Backup import can no longer silently replace an existing local profile collection after file selection; the user must confirm replacement first.
- Profile edit actions use an icon-only fixed-size control so long translated/action text cannot overflow the icon button.
- Profile delete/clear actions no longer allow storage exceptions to escape from click handlers.
- Missing-profile deletion can no longer appear to succeed while leaving storage unchanged.
- Undoing a deletion no longer moves an older profile to the top of the saved-profile list.
- Stale delete undo is no longer offered after a successful replacement profile is created.
- Route navigation no longer leaves keyboard focus behind on the navigation trigger after changing the main SPA view.
- Route navigation now gives each core page a descriptive document title instead of leaving one static app title.
- Milestone screenshot assertions no longer fail Playwright strict mode when built-in and custom 10,000-day labels are both visible.
- Mobile Playwright projects no longer attempt to click hidden desktop-sidebar navigation controls.
- Missing non-navigation resources no longer receive `index.html` as an offline fallback.
- Backup limits are measured in UTF-8 bytes rather than JavaScript character count.
- Malformed stored strings such as `"true"` no longer enable boolean accessibility/onboarding preferences.
- Application and manifest theme metadata use the same primary design token.
- The quick-actions modal no longer leaves keyboard focus behind the dialog or lose the previous trigger on dismissal.
- The onboarding modal no longer permits the background `Ctrl/Cmd + K` shortcut to open a second modal.
- The exact-age card no longer displays zero-valued clock units when time precision is disabled.
- Browser-storage, PWA install, and service-worker update failures no longer rely on the root runtime boundary for ordinary recoverable behavior.

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
