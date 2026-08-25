<div align="center">
  <img src="public/logo.svg" alt="ChronoAge logo" width="112" />
  <h1>ChronoAge</h1>
  <p><strong>A privacy-first, timezone-aware age and date calculator for the web, Windows, macOS, Linux, Android, and iOS.</strong></p>
  <p><strong>Made by the Sanskar</strong></p>

  [![Version](https://img.shields.io/badge/version-2.0.13-6657e8.svg)](CHANGELOG.md)
  [![CI](https://github.com/sanskarIN/chronoage/actions/workflows/ci.yml/badge.svg)](https://github.com/sanskarIN/chronoage/actions/workflows/ci.yml)
  [![CodeQL](https://github.com/sanskarIN/chronoage/actions/workflows/codeql.yml/badge.svg)](https://github.com/sanskarIN/chronoage/actions/workflows/codeql.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)
</div>

## Why ChronoAge

ChronoAge goes beyond a basic age calculator. It combines calendar-accurate age math, next-birthday planning, interval tools, custom milestone discovery, visual date comparison, local saved profiles, accessibility, offline PWA support, printable/shareable results, explicit leap-day behavior, and explicit daylight-saving overlap handling in one maintainable React + TypeScript application with a Tauri 2 native shell.

**Privacy is the default:** calculations run locally, saved profiles use local browser/WebView storage, no account is required, and the project ships with no analytics, crash-reporting backend, or cloud sync.

**Current source version:** `2.0.13`. See the [2.0.13 release notes](docs/releases/2.0.13.md) and [release guide](docs/release.md). The source version does not by itself imply that the `v2.0.13` GitHub tag/release artifact has been published; release tagging remains evidence-gated.

## Interface preview

![ChronoAge interface preview](docs/screenshots/app-preview.svg)

> This repository preview is a source-controlled representation of the production UI. CI also captures desktop and mobile release-candidate screenshots during browser tests.

## Features

- Exact age in years, months, days, hours, and minutes.
- Total elapsed days, hours, and minutes.
- IANA-timezone-aware calculations when time of day is enabled.
- Rejection of nonexistent spring-forward wall-clock times.
- User-selectable earlier/later occurrence for repeated fall-back local times.
- Next-birthday date, weekday, days remaining, and age turning.
- Configurable February 29 anniversary behavior (`February 28` or `March 1`).
- Absolute age difference between any two dates with an accessible duration visualization.
- Inclusive and exclusive date interval calculator.
- 1,000/5,000/10,000+ day milestones and major birthday anniversaries.
- Custom positive-whole-number milestones in days or birthday years.
- Local-only saved profiles with validation, search, deterministic sorting, editing, one-step delete undo, progressive rendering, calculator handoff, export, import-replacement confirmation, and deletion controls.
- Saved-profile import/restore validation rejects malformed timestamps and impossible update-before-creation histories.
- Privacy-safe page deep links such as `#/profiles` plus browser Back/Forward navigation; calculator dates, times, profile names, and saved birth dates are not serialized into route URLs.
- SPA page navigation updates the document title and moves focus into main content for keyboard and assistive-technology users.
- Print/share result cards that omit private profile names by default.
- Light, dark, and system themes; reduced-motion and high-contrast settings.
- Keyboard-first navigation, visible focus states, semantic labels, and quick actions (`Ctrl/Cmd + K`).
- Installable offline PWA with user-controlled update application.
- Native Tauri 2 delivery for Windows, macOS, Linux, Android, and iOS from the same frontend codebase.
- Browser-only PWA install/update behavior is automatically disabled inside the native shell.
- Responsive layouts for phones, tablets, and desktops.
- Browser-level accessibility regression checks and release-candidate screenshot capture.
- Local crash-recovery UI with privacy-safe structured diagnostics.
- Automated production JavaScript/CSS gzip budget enforcement.
- Deterministic web-release archives, SHA-256 checksums, and machine-readable release evidence manifests.
- Internationalization-ready string organization (English ships first).

## Supported platforms

| Platform | Delivery | Status |
| --- | --- | --- |
| Modern desktop browsers | Web | Primary |
| Android browsers | Responsive web | Primary |
| iPhone / iPad browsers | Responsive web | Primary |
| Installable PWA | Browser install | Primary |
| Windows | Tauri native app + PWA/browser | Supported |
| macOS | Tauri native app + PWA/browser | Supported |
| Linux | Tauri native app + PWA/browser | Supported |
| Android | Tauri native app + browser/PWA | Supported |
| iOS / iPadOS | Tauri native app + browser/PWA | Supported |

See [docs/platforms.md](docs/platforms.md) for the platform matrix, [docs/desktop.md](docs/desktop.md) for desktop builds, and [docs/mobile.md](docs/mobile.md) for Android/iOS builds.

## Tech stack

- React 19 + TypeScript
- Vite
- Tauri 2 + Rust for native desktop/mobile shells
- Native `Intl.DateTimeFormat` + Gregorian calendar domain logic
- Browser/WebView `localStorage` for optional profiles/settings
- Native Service Worker + Web App Manifest for web/PWA delivery
- Dependency-free hash/history page routing
- Vitest + Testing Library
- Playwright end-to-end, accessibility-regression, and screenshot tests
- ESLint + Prettier
- GitHub Actions + CodeQL + Dependabot

No date library is required by the runtime domain layer. Timezone conversion uses the runtime's IANA timezone database through `Intl`, round-trip validation for nonexistent local times, and explicit candidate selection for repeated local times. See [docs/date-semantics.md](docs/date-semantics.md).

## Quick start

Requirements for web development: Node.js 22.13+ and npm. The repository's reproducible development/CI runtime pin is Node.js `22.13.0` in `.nvmrc`.

```bash
git clone https://github.com/sanskarIN/chronoage.git
cd chronoage
npm install
npm run dev
```

Open `http://localhost:5173`.

Core pages can also be opened with public page-only fragments such as `http://localhost:5173/#/milestones`. ChronoAge deliberately does not put personal calculation values into those fragments.

### Native desktop development

Install the Tauri prerequisites for your operating system first, then run:

```bash
npm install
npm run native:info
npm run native:dev
```

Build a native desktop application for the current host operating system with:

```bash
npm run native:build
```

### Android development

Install Android Studio, the Android SDK/NDK requirements documented by Tauri, and Rust. Then initialize the generated Android project once and run/build it:

```bash
npm install
npm run native:android:init
npm run native:android:dev
npm run native:android:apk
npm run native:android:aab
```

### iOS / iPadOS development

Native iOS builds require macOS with Xcode. Initialize the generated Apple project once and run/build it:

```bash
npm install
npm run native:ios:init
npm run native:ios:dev
npm run native:ios:build
```

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run performance:check
npm run test:e2e
npm run native:check
```

Run the combined non-E2E web quality suite with:

```bash
npm run check
```

`npm run performance:check` measures the built first-party JavaScript and CSS gzip totals against the release budgets, so run `npm run build` first when invoking it directly. `npm run metadata:check`, which is included in `npm run check`, also verifies that the `.nvmrc`, package engine floor, and permanent CI/release Node pins remain aligned.

See [docs/testing.md](docs/testing.md) for the full strategy and CI expectations.

## Build and release

Web release candidate:

```bash
npm install
npm run check
npm run build
npm run release:check -- v2.0.13
npm run release:workflow:check
```

The tag workflow additionally requires a reviewed `package-lock.json`, installs with `npm ci`, creates a deterministic web archive and SHA-256 checksum, emits a machine-readable release evidence manifest, and re-verifies the downloaded checksum before GitHub Release creation. See [docs/reproducible-builds.md](docs/reproducible-builds.md).

Native release candidates are built on the target platform:

```bash
npm run native:build          # Windows / macOS / Linux host
npm run native:android:aab    # Android Play-distribution bundle
npm run native:ios:build      # iOS archive/package on macOS
```

The production web bundle is created in `dist/`. Native output is produced by Tauri under `src-tauri/target/` and generated mobile projects under `src-tauri/gen/`. Production installers and store uploads must be signed using each platform's official signing process; signing credentials must never be committed to the repository. See [docs/release.md](docs/release.md), [docs/desktop.md](docs/desktop.md), and [docs/mobile.md](docs/mobile.md).

## Architecture

ChronoAge is a modular client-side application with a thin native shell:

- `src/domain/` — deterministic date math, milestones, validation.
- `src/storage/` — versioned local persistence and backup/restore.
- `src/pages/` — feature-oriented UI pages.
- `src/components/` — reusable UI building blocks, visualizations, and the application crash boundary.
- `src/hooks/` — browser/application state integration, including the PWA lifecycle.
- `src/i18n/` — externalized English UI/recovery copy and interpolation helpers.
- `src/config/` — locale-independent project identity/runtime metadata.
- `src/utils/` — privacy-safe navigation, platform detection, profile sorting, logging, PWA registration, sharing, and defaults.
- `src-tauri/` — Tauri 2 Rust shell, permissions/capabilities, platform packaging configuration, and generated native projects.
- `tests/` — unit, property, integration, component, and E2E coverage.

Business rules do not depend on React or Tauri. See [docs/architecture.md](docs/architecture.md), [docs/internationalization.md](docs/internationalization.md), and [docs/adr/](docs/adr/).

## Security and privacy

ChronoAge has no backend, authentication, payments, analytics, or required network API. User-entered profile data remains in local browser/WebView storage unless the user explicitly exports it. Export files are plain JSON and are **not encrypted**. Importing a backup over an existing profile collection requires confirmation before replacement.

The native shell starts with Tauri's minimal `core:default` capability and does not grant filesystem, shell, network-client, process-execution, or other optional native plugin permissions. Add native permissions only when a concrete feature requires them and review the security impact first.

Page URLs contain only public page identifiers. ChronoAge does not intentionally serialize calculator dates/times, profile names, saved birth dates, or other calculation inputs into its page-routing fragments.

Expected validation/product errors use curated user-visible messages. Unexpected implementation exceptions use generic UI fallbacks, and runtime diagnostics stay in the local console through a redacting structured logger rather than being uploaded.

- Security policy: [SECURITY.md](SECURITY.md)
- Privacy behavior: [PRIVACY.md](PRIVACY.md)
- Responsible disclosure: `sanskarin@outlook.in`
- Support: `supportramsandesh@gmail.com`

## Accessibility

The UI targets WCAG-oriented practices: keyboard operation, skip links, focus visibility, semantic labels, non-color-only status, reduced-motion support, scalable layouts, screen-reader-friendly status regions, route-change title/focus updates, and browser regression checks for common accessibility failures. See [docs/accessibility.md](docs/accessibility.md).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and include tests for behavior changes.

## Support and contact

- Business: [sanskarin@outlook.in](mailto:sanskarin@outlook.in)
- Business: [sanskarin.business@gmail.com](mailto:sanskarin.business@gmail.com)
- Support: [supportramsandesh@gmail.com](mailto:supportramsandesh@gmail.com)
- GitHub: https://github.com/sanskarIN
- Repository: https://github.com/sanskarIN/chronoage

## Support open-source development

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)

Donations are optional and never unlock product functionality.

## License

ChronoAge is released under the [MIT License](LICENSE).

---

**Made by the Sanskar** · Open source · Privacy first