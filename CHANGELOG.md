# Changelog

All notable changes to ChronoAge are documented here. The project follows Keep a Changelog principles and semantic versioning where practical.

## [Unreleased]

### Added
- Explicit version-1 backup contract documentation covering schema compatibility, privacy boundaries, future-schema rejection, and migration requirements.
- Regression coverage for backup schema metadata, unsupported future versions, and atomic import behavior so invalid backups cannot partially replace valid local profiles.
- A fail-closed Cargo lock transition policy that distinguishes the current pre-lockfile state from the required locked-native state.
- A pre-lockfile-safe native verification command that switches to `cargo metadata --locked` automatically when a genuine `src-tauri/Cargo.lock` is present.
- Native CI coverage of the Cargo lock transition policy and locked dependency-graph verification across desktop, Android, and iOS jobs.

### Planned
- ChronoAge `2.1.0` engineering cycle focused on reproducible dependency state, deterministic CI, repository governance, backup-schema compatibility, and the first fully reviewed additional locale pack.
- Generate and review genuine `package-lock.json` and `src-tauri/Cargo.lock` from the pinned toolchains; no lockfile will be hand-authored.
- Migrate permanent push/PR and Native CI frontend installation to `npm ci` only after the genuine npm lockfile is accepted.
- Enforce locked Cargo verification for native release checks after the genuine Cargo lockfile is accepted.
- Record clean-checkout web, Playwright, and Native CI evidence for the exact release candidate.
- Configure and verify effective `main` branch protection/ruleset before treating repository governance as complete.
- Add locale-aware date, number, weekday, and duration formatting coverage while preserving privacy-safe page URLs.

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
