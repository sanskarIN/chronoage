# ChronoAge — Current 2.0.12 Work Handoff

## Current source state

ChronoAge is on `main` as source version **2.0.12** with a shared web/PWA application and a Tauri 2 native delivery layer.

- Repository: `https://github.com/sanskarIN/chronoage`
- Source version: `2.0.12`
- Matching semantic tag: `v2.0.12`
- Release date recorded for 2.0.12: `2026-08-19`
- License: MIT
- Shared frontend/runtime: React + TypeScript + Vite
- Native shell: Tauri 2 + Rust
- Exact Node pin: `22.13.0`
- Package Node engine floor: `>=22.13.0`
- Native application identifier: `in.sanskar.chronoage`
- Commit identity used for repository work: `Sanskar <sanskarin@outlook.in>`

This file distinguishes implemented source support from external release evidence. It does **not** claim that signed native installers, App Store/Google Play submissions, or the `v2.0.12` GitHub release have been published unless those external steps have separately been verified.

## Full cross-platform support added

ChronoAge is no longer PWA-only at the source-architecture level.

| Platform | Browser/PWA | Native source support | Native path |
| --- | --- | --- | --- |
| Windows | Yes | Yes | Tauri desktop |
| macOS | Yes | Yes | Tauri desktop |
| Linux | Yes | Yes | Tauri desktop |
| Android | Yes | Yes | Tauri Android APK/AAB |
| iOS / iPadOS | Yes | Yes | Tauri iOS |

The same TypeScript date-domain logic, React UI, storage validation, accessibility behavior, routing, and privacy model are reused across every target. There is no second calculator implementation in Rust, Kotlin, Swift, C#, or another platform-specific language.

## Native shell implementation

Added the committed Tauri source-of-truth under `src-tauri/`:

- `src-tauri/Cargo.toml`
- `src-tauri/build.rs`
- `src-tauri/src/lib.rs`
- `src-tauri/src/main.rs`
- `src-tauri/tauri.conf.json`
- `src-tauri/capabilities/default.json`

The native configuration includes:

- product name `ChronoAge`;
- version `2.0.12`;
- identifier `in.sanskar.chronoage`;
- shared frontend output `../dist`;
- desktop window defaults with a 360 px minimum width for responsive layouts;
- Android minimum SDK 24;
- iOS minimum system version 14.0;
- restrictive native Content Security Policy;
- native bundle metadata and ChronoAge icon paths.

## Native runtime behavior

Added `src/utils/platform.ts` using Tauri runtime detection rather than user-agent guessing.

When ChronoAge runs inside Tauri:

- browser service-worker registration is skipped;
- the browser PWA installation prompt is disabled;
- browser PWA update checks/application are disabled;
- the native package is treated as an installed application.

When ChronoAge runs in a normal browser, the existing PWA behavior remains available.

This keeps browser service-worker lifecycle logic separate from native binary distribution/signing.

## Cross-platform build commands

The npm command surface now includes:

```bash
npm run build:web
npm run native:info
npm run native:icons
npm run native:dev
npm run native:build
npm run native:check
npm run native:android:init
npm run native:android:dev
npm run native:android:build
npm run native:android:apk
npm run native:android:aab
npm run native:ios:init
npm run native:ios:dev
npm run native:ios:build
```

### Desktop

`npm run native:dev` and `npm run native:build` regenerate ChronoAge platform icons from `public/logo.svg` before starting the Tauri command.

Desktop native targets are:

- Windows;
- macOS;
- Linux.

### Android

`npm run native:android:init` creates the generated Android project and then regenerates the Android icon assets from the shared ChronoAge logo.

Android build paths include:

- debug/development build;
- APK;
- Android App Bundle (AAB) for store-oriented distribution.

### iOS / iPadOS

`npm run native:ios:init` creates the generated Xcode project and then regenerates Apple mobile icon assets from the same logo source.

Native iOS/iPadOS compilation requires macOS/Xcode at build time.

## Vite mobile-device integration

`vite.config.ts` now honors `TAURI_DEV_HOST`.

This allows Tauri Android/iOS development to expose the Vite development server to a physical device when required while preserving localhost-only behavior for ordinary web development.

Tauri-generated native source/build directories are excluded from Vite watch processing.

## Native branding

`public/logo.svg` remains the single editable logo source.

`npm run native:icons` uses the Tauri icon generator to create:

- Windows icon assets;
- macOS icon assets;
- Linux icon assets;
- Android project icon assets after Android initialization;
- iOS project icon assets after iOS initialization.

Generated icon output is reproducible and excluded from Git. The Tauri bundle configuration references the generated desktop icon paths.

## Native security baseline

ChronoAge starts with deliberately minimal native privilege.

- `withGlobalTauri` is disabled.
- `src-tauri/capabilities/default.json` is scoped to the `main` window.
- The only default capability is `core:default`.
- No optional filesystem plugin is enabled.
- No shell/process execution plugin is enabled.
- No unrestricted remote HTTP plugin is enabled.
- No updater plugin is enabled by default.
- No analytics/crash-reporting native service is introduced.
- Production native packages load the local `dist/` frontend.
- Native CSP remains restrictive.

`scripts/check-security.mjs` now fails if important native invariants are weakened, including:

- global Tauri API injection becoming enabled;
- production `frontendDist` changing away from the local build;
- native development URL changing away from the expected loopback endpoint;
- required CSP protections being removed;
- the default capability expanding beyond exactly `core:default`;
- the capability losing its main-window scope.

Future native plugins/permissions must be added by least privilege and documented/tested as real product requirements.

## Native CI

Added `.github/workflows/native.yml`.

The workflow contains separate smoke-build coverage for:

- Linux desktop native compile;
- Windows desktop native compile;
- macOS desktop native compile;
- Android ARM64 debug APK;
- iOS simulator.

The existing web CI remains responsible for the shared product quality gates: formatting, metadata, static security, linting, TypeScript checks, tests, documentation links, web production build, bundle budgets, runtime audit, browser E2E, accessibility, offline PWA behavior, and release-candidate screenshots.

A native target is not treated as a published artifact merely because source support exists. Final platform artifacts remain gated on successful hosted/target-host builds and platform release requirements.

## Metadata and quality tooling expanded

`scripts/check-metadata.mjs` now verifies native metadata in addition to the existing web/project invariants.

It checks:

- `package.json` version;
- `src/config/project.ts` version;
- `src-tauri/tauri.conf.json` version;
- `src-tauri/Cargo.toml` package version;
- Tauri product name;
- `.nvmrc` Node pin;
- CI Node pin;
- Native CI Node pins;
- release-workflow Node pin;
- project identity/repository/funding metadata;
- release documentation;
- PWA cache/version relationship.

Repository-wide tooling was also corrected for generated native projects:

- format checking ignores `src-tauri/gen/` and `src-tauri/target/`;
- ESLint ignores generated Tauri project/build directories;
- `.gitignore` excludes `src-tauri/gen/`, `src-tauri/target/`, and generated native icons;
- native signing files such as Android keystores and Apple/Windows certificate containers are excluded from Git.

## Documentation completed for native delivery

The following documentation now describes the implemented cross-platform architecture:

- `README.md`
- `ROADMAP.md`
- `CHANGELOG.md`
- `docs/platforms.md`
- `docs/mobile.md`
- `docs/desktop.md`
- `docs/architecture.md`
- `docs/release.md`
- `docs/adr/0007-tauri-cross-platform-native-delivery.md`

ADR 0007 supersedes ADR 0006 for the native-delivery decision. ADR 0006 remains historical documentation of the earlier PWA-first state.

## Existing 2.0.12 product functionality retained

The cross-platform work does not replace or fork the existing product features. The shared application still includes:

### Age and date calculations

- exact calendar years/months/days;
- optional time-of-day precision;
- total elapsed days/hours/minutes;
- next birthday date, weekday, days remaining, and age turning;
- age difference;
- inclusive/exclusive date intervals;
- Gregorian leap-year behavior;
- configurable February 29 policy;
- built-in day-count/birthday milestones;
- custom day-count/birthday milestones;
- calendar-duration comparison visualization;
- supported civil-year range checks.

### Timezone and DST behavior

- runtime-supported IANA timezones through native `Intl`;
- free-form timezone entry with suggestions/validation;
- nonexistent spring-forward local-time rejection;
- repeated fall-back time candidate discovery;
- explicit earlier/later repeated-time policy;
- consistent persisted ambiguity policy across timezone-aware calculations.

### Saved profiles

- local-only save/load;
- editing and deletion;
- one-step delete undo;
- identity/timestamp restoration;
- search/filter;
- deterministic sorting without mutating storage order;
- progressive rendering;
- validated import/export;
- profile-cap enforcement;
- malformed/duplicate/reversed-history validation;
- blocked/quota-limited storage handling;
- confirmation before replacement import;
- direct profile handoff to the calculator.

### Privacy and reliability

- no account requirement;
- no application backend;
- no analytics/cloud sync requirement;
- private values omitted from public route state;
- privacy-safe structured diagnostics;
- curated user-visible error classes;
- root crash-recovery boundary;
- restrictive browser/native security policy;
- local-only persistence by default.

### Accessibility and responsive UX

- keyboard-first controls;
- focus management;
- route titles and main-content focus transfer;
- dialog focus containment/restoration;
- semantic labels/status regions;
- light/dark/system theme;
- reduced-motion/high-contrast preferences;
- responsive phone/tablet/desktop layouts;
- axe/browser accessibility regression coverage.

## Dependency/reproducibility evidence still gated

These are not hidden or falsely marked complete:

1. Generate and review a real registry-resolved `package-lock.json`.
2. Switch permanent npm CI/release installs to `npm ci` after that lockfile is accepted.
3. Generate and review a real `src-tauri/Cargo.lock` from a successful native dependency resolution.
4. Record a passing clean-checkout shared quality/E2E run against the final release candidate.
5. Record a completely green Native CI run for the final release candidate.
6. Verify the documented `main` branch protection/ruleset in GitHub settings.

Lock metadata must not be hand-authored or fabricated.

## Native publication evidence still gated

Source/build support is implemented, but public release artifacts require external platform evidence:

- Windows installer signing and clean-machine verification;
- macOS code signing and notarization/App Store requirements;
- Linux package builds and clean-target testing;
- Android release keystore/signing and Play Console submission;
- iOS/iPadOS Apple Developer signing/provisioning and App Store Connect/TestFlight submission.

Signing credentials, keystores, provisioning files, private keys, passwords, and store tokens must remain outside Git.

## Release-tag rule

When—and only when—the required release gates pass:

```bash
npm run metadata:check
npm run release:check -- v2.0.12
```

The matching source tag remains:

```text
v2.0.12
```

Do not publish a different tag for this source version.

## Cross-platform commits created in this continuation

The cross-platform work was intentionally split into many focused commits. Major commits include:

- `6eb8acac` — `build(native): add Tauri build script`
- `ba3f9152` — `build(native): add Rust package metadata`
- `8d2a1264` — `feat(native): add shared Tauri application entrypoint`
- `8593dcb8` — `feat(desktop): add native desktop entrypoint`
- `bf2c771f` — `security(native): add least-privilege default capability`
- `c13da501` — `feat(native): configure cross-platform Tauri packaging`
- `e6ed9482` — `build(native): add Tauri runtime and cross-platform scripts`
- `a82cc2aa` — `build(native): expose Vite dev server to Tauri mobile`
- `1480acd1` — `feat(runtime): add native versus web runtime detection`
- `9180a0ab` — `fix(native): skip browser service worker inside native shell`
- `f4315ef4` — `fix(native): disable PWA install and update controls in Tauri`
- `85c481c5` — `fix(android): pass APK and AAB flags directly to Tauri`
- `6c5d8b0e` — `chore(native): ignore build outputs and signing credentials`
- `ab6014a1` — `docs(platforms): add complete cross-platform support matrix`
- `e0ef31a0` — `docs(mobile): add Android and iOS build guide`
- `b64886b9` — `docs(desktop): replace PWA-only policy with Tauri native delivery`
- `cf190da8` — `docs(adr): adopt Tauri 2 cross-platform native architecture`
- `091a2242` — `ci(native): add desktop Android and iOS smoke builds`
- `5c955d5f` — `docs(release): add native cross-platform release gates`
- `66b12275` — `test(metadata): enforce native version and runtime consistency`
- `01675ba2` — `docs(roadmap): mark native cross-platform delivery implemented`
- `f86fafd8` — `docs(architecture): document shared web and Tauri native architecture`
- `21357448` — `fix(tooling): ignore generated Tauri output in format checks`
- `9a8f4ffc` — `fix(tooling): ignore generated Tauri projects in ESLint`
- `bfd8dc8b` — `security(native): enforce least-privilege Tauri invariants`
- `b9ff5715` — `build(native): generate branded icons for every native build`
- `3ad1ed56` — `build(native): configure generated ChronoAge platform icons`
- `33b0765c` — `chore(native): ignore reproducibly generated platform icons`
- `f06b844b` — `docs(changelog): record full cross-platform native implementation`

## Final accuracy boundary

ChronoAge now contains first-class source/build support for web/PWA, Windows, macOS, Linux, Android, and iOS/iPadOS from one shared product codebase.

Do not convert that statement into a claim that every signed installer/store artifact is already published. Distribution remains evidence-gated on real target-host builds, signing/notarization/store configuration, and final CI/release verification.
