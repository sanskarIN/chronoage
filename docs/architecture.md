# Architecture

ChronoAge is a local-first modular monolith with one React + TypeScript application delivered through two shells:

1. a standard web/PWA build; and
2. a thin Tauri 2 native shell for Windows, macOS, Linux, Android, and iOS/iPadOS.

There is no application backend. The calculator/domain implementation is shared across every target; native platforms do not maintain separate date-calculation code.

## High-level delivery model

```text
src/domain + src/storage + src/pages + src/components
                       |
                       v
                 React + Vite
                  /        \
                 /          \
          Web/PWA dist/    Tauri 2 shell
                            src-tauri/
                         /   /  |  \   \
                    Win  mac Linux Android iOS
```

`npm run build:web` is the canonical frontend build. Tauri's `frontendDist` points at the same `dist/` directory, so browser and native packages consume the same compiled frontend.

## Layers

### Domain (`src/domain`)

Pure TypeScript calendar rules, timezone conversion, milestones, and validation. The domain layer does not import React, Tauri, or browser storage. This keeps the most error-prone logic deterministic and reusable across every delivery target.

Expected calendar/input failures use `DateCalculationError`, which is one of the explicitly user-visible error classes recognized by the presentation boundary.

### Storage (`src/storage`)

Versioned local persistence adapters for settings and saved profiles. In browsers this is browser-local storage; inside Tauri the same web storage API is scoped to the application's WebView container.

Storage functions validate imported data, cap profile counts, reject duplicate backup identities, ignore corrupted local profile entries safely, and never assume cloud availability.

Expected product-level failures that originate outside date calculation, such as an invalid backup format or reaching the profile cap, use `UserVisibleError`. Raw JSON parser/storage implementation errors are not intended to cross into UI text.

### Error boundary (`src/errors.ts`, `src/components/AppErrorBoundary.tsx`)

`src/errors.ts` centralizes which exception classes may expose their messages to users. `getUserSafeErrorMessage` reveals only curated `DateCalculationError`/`UserVisibleError` text and maps unexpected exceptions to the feature's generic fallback.

The React root is wrapped in `AppErrorBoundary`. A render failure is contained by a local recovery screen instead of leaving a blank application. The boundary records only sanitized local diagnostics and does not send a crash report.

### Presentation (`src/pages`, `src/components`)

Feature pages compose reusable components. Pages own transient form state. Shared settings are wired explicitly through `App` and `useSettings` instead of a global mutable store. Feature-specific component CSS may live beside a component when that keeps the main design-system stylesheet cohesive.

`Field` and `SelectField` own reusable label/help relationships. Select hints are linked through `aria-describedby` while preserving caller-provided description ids so helper text remains available to assistive technology.

### Internationalization (`src/i18n`)

English is the shipped locale. Normal user-facing interface copy is externalized in `src/i18n/en.ts`, including interpolation helpers for dynamic sentences. Crash-recovery copy is externalized in `src/i18n/errors.ts`. Locale-independent product identity and contact metadata live in `src/config/project.ts` rather than being duplicated across pages.

See [internationalization.md](internationalization.md) for the locale extension rules. When locale selection is introduced, recovery copy must join the same selected-locale contract. The current saved-profile name sorter uses an explicit English collator so behavior matches the shipped locale instead of depending on the host machine's default locale.

### Runtime integration (`src/hooks`, `src/utils`)

Online status, privacy-safe page routing, saved-profile sorting, print/share, PWA registration, privacy-safe logging, platform detection, and system defaults are isolated from domain logic.

`src/utils/platform.ts` is the runtime boundary between browser/PWA behavior and Tauri behavior. It uses Tauri's runtime detection instead of user-agent guessing. This prevents platform-specific behavior from leaking into the domain layer.

PWA installation and service-worker updates are exposed through a dedicated lifecycle hook rather than being mixed into Settings page business logic. When the app is running inside Tauri, browser-only PWA installation/update paths are disabled because the native package has its own platform release/update trust boundary.

`src/utils/navigation.ts` defines the finite public page-id set and maps it to dependency-free hash routes. The route layer intentionally carries only public page identity (`#/calculate`, `#/profiles`, and similar values). Calculator dates/times, profile names, saved birth dates, search text, and results remain outside URL state. This preserves direct-link and browser-history behavior without introducing a router dependency or a server-side rewrite requirement.

`src/utils/profileSort.ts` performs presentation-only sorting over copies of the local profile array. Changing sort order therefore does not persist a new storage order.

`src/utils/logger.ts` is the single runtime logging boundary. It sanitizes structured context and common sensitive text patterns, handles circular/deep object graphs, and receives global browser/WebView `error` and `unhandledrejection` events. Static security checks reject direct runtime console output outside this logger.

### Native shell (`src-tauri`)

The native layer is intentionally thin:

- `Cargo.toml` defines the Rust package and Tauri dependency.
- `build.rs` runs Tauri's build integration.
- `src/lib.rs` contains the shared desktop/mobile Tauri entry point and carries the mobile entry-point attribute.
- `src/main.rs` is the desktop executable entry point.
- `tauri.conf.json` defines application identity, frontend build hooks, window defaults, CSP, and platform bundle metadata.
- `capabilities/default.json` grants the main window only Tauri's baseline `core:default` capability.

There is no duplicated age/date logic in Rust. Rust/native APIs should be introduced only when a concrete native feature cannot be implemented safely through the shared frontend.

Generated Android/iOS projects live under `src-tauri/gen/`; compiled Rust/native output lives under `src-tauri/target/`. Both are treated as generated build state and ignored by Git so the committed Tauri configuration remains authoritative.

## Navigation and accessibility flow

1. `App` initializes its active page from a recognized public route hash, otherwise defaults to Age.
2. Invalid app-style `#/...` hashes are canonicalized to `#/calculate`; ordinary document anchors such as `#main-content` remain ordinary anchors.
3. Internal page navigation uses `history.pushState`, keeping browser/WebView history semantics without page reloads.
4. `popstate`/recognized `hashchange` events update application page state.
5. Route changes update `document.title` to `<Page> · ChronoAge`.
6. Explicit SPA navigation and history page changes move focus into the persistent `#main-content` region, while modal dismissal retains its separate focus-restoration behavior.

The same semantic HTML, focus management, color/theme system, and responsive layout are shared by browser and native WebView delivery. Native packaging must not be treated as permission to bypass accessibility checks.

## Data flow

1. A user enters a date/time in a semantic form control.
2. Page code parses and validates the input.
3. Domain functions calculate results using Gregorian civil-date math and, when requested, `Intl` timezone conversion.
4. Expected calculation/product exceptions can provide curated user-visible text; unexpected exceptions resolve to generic feature fallbacks.
5. React renders derived results. Calculator input itself is not persisted or serialized into the page route.
6. Saved profiles are persisted only after an explicit Save action.
7. Profile filtering/sorting/progressive rendering operate on local presentation state; sorting does not rewrite storage.
8. An import that would replace existing profiles requires explicit confirmation before replacement proceeds.
9. Settings are persisted through a typed adapter with safe defaults for missing or malformed values.
10. Unexpected runtime failures are contained by the root error boundary and sanitized local diagnostic logging.

## Timezone approach

ChronoAge intentionally avoids a runtime date library. `zonedLocalToUtcCandidates` uses the runtime's IANA timezone database through `Intl.DateTimeFormat.formatToParts()`. It starts with a UTC-shaped guess, iteratively corrects by the difference between desired and rendered civil fields, verifies a round trip, samples nearby timezone offsets, and returns every instant that maps back to the requested local wall-clock fields.

- Normal civil times produce one candidate.
- Nonexistent DST-gap local times are rejected.
- Repeated fall-back local times produce two candidates when the runtime timezone database reports both offsets.
- `zonedLocalToUtc` selects the earlier or later occurrence using the persisted application setting.

The approach is covered by deterministic tests and documented in ADR-0002 and ADR-0005.

## Milestone model

Built-in milestones and the custom milestone builder share pure domain functions. Custom milestones accept a positive whole-number amount in calendar days or birthday years. Birthday-year calculations reuse the configured February 29 anniversary policy instead of reimplementing calendar rules in the UI.

## Persistence schema

`chronoage.profiles.v1`:

```json
{
  "schemaVersion": 1,
  "profiles": [
    {
      "id": "uuid",
      "name": "Example",
      "birthDate": "2001-02-03",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]
}
```

Profile load/import boundaries validate ids, uniqueness, normalized names, calendar dates, and ISO timestamps. Export/import remains plain JSON and is never described as encrypted. Import replacement is all-or-nothing at the validated storage boundary, and the Profiles UI requires confirmation before replacing a non-empty current collection.

`chronoage.settings.v1` stores appearance/accessibility/calculation defaults, including the DST overlap preference. Missing fields use backwards-compatible defaults. Malformed non-boolean values are not coerced into enabled accessibility/onboarding flags.

New incompatible schemas must use a migration or a new key; do not silently reinterpret existing records.

## Web/PWA delivery boundary

The web target consists of the Vite `dist/` bundle plus the Web App Manifest and service worker. Its browser integration includes install-prompt handling, offline navigation fallback, and user-controlled waiting-service-worker activation.

Service-worker registration is skipped when `isNativeRuntime()` reports Tauri. Native packages must not rely on the web service worker as a binary updater.

## Native delivery boundary

Tauri 2 supplies the native package/container for:

- Windows;
- macOS;
- Linux;
- Android;
- iOS/iPadOS.

The shared frontend is loaded from packaged local assets in production. Native delivery introduces operating-system trust concerns that do not exist for a normal HTTPS deployment: signing identities, notarization/store requirements, generated native projects, target SDKs, and native permissions.

Those concerns remain outside the domain and presentation layers. See [platforms.md](platforms.md), [desktop.md](desktop.md), [mobile.md](mobile.md), and ADR-0007.

## Native permissions and security

ChronoAge starts with no optional Tauri plugins and only `core:default` for the main window. In particular, the committed configuration does not grant broad filesystem access, shell/process execution, unrestricted remote HTTP access, or other optional native capabilities.

A future native integration must be added by least privilege. Every new permission/plugin should document:

1. the user-facing requirement;
2. the exact capability scope;
3. privacy/security impact;
4. denial/failure behavior;
5. platform signing/update implications;
6. automated/manual test coverage.

`withGlobalTauri` remains disabled so the frontend does not receive a broad global native API object.

The Tauri-side CSP mirrors the restrictive intent of the browser document policy. Native capability controls and CSP solve different problems and both remain required.

## Performance boundary

Production JavaScript and CSS gzip budgets are executable quality gates. `scripts/check-bundle-size.mjs` measures built `dist/` assets and fails when the configured first-party totals exceed the documented limits. `npm run check`, CI, and the tag-release workflow therefore share the same frontend budget contract.

Saved profiles are capped at 100 and progressively rendered in batches of 20. Search and sorting are bounded operations over that small local collection and avoid introducing a virtualization or state-management dependency.

Native wrappers do not duplicate the frontend bundle, so performance work should normally be solved once in the shared application. Platform-specific startup/package-size regressions should additionally be checked in native release validation.

## CI boundaries

`.github/workflows/ci.yml` remains the primary frontend quality gate: format, metadata, security invariants, lint, type checking, tests, docs links, production build, performance budget, runtime audit, and browser E2E.

`.github/workflows/native.yml` adds target-host validation:

- Linux native compile;
- Windows native compile;
- macOS native compile;
- Android debug APK smoke build;
- iOS simulator smoke build.

A native artifact must not be advertised as release-ready solely because source/configuration exists. The target build must pass, then public packages must satisfy platform signing/notarization/store requirements.

## Version and metadata invariants

The source version is shared across:

- `package.json`;
- `src/config/project.ts`;
- `src-tauri/Cargo.toml`;
- `src-tauri/tauri.conf.json`.

`scripts/check-metadata.mjs` checks the web/native version relationship, Tauri product identity, project metadata, service-worker cache version, and Node pins across CI/release/native workflows.

## Security boundaries

Because ChronoAge remains local-first and has no application backend, the main boundaries are:

- untrusted date/profile/import inputs;
- user-visible versus internal exception text;
- private local state versus public route state;
- privacy-safe local diagnostics;
- HTML rendering (React escaping by default);
- local persistence corruption;
- service-worker cache scope on web;
- Tauri capability/permission scope on native targets;
- native signing/notarization/store trust;
- dependency supply chain across npm and Cargo.

See `SECURITY.md`, ADR-0003, and ADR-0007.

## Architecture principle

**One product implementation, multiple trusted delivery shells.**

New features should be implemented in the shared TypeScript/domain/UI layers whenever possible. Platform-specific code belongs behind a narrow runtime boundary only when the platform genuinely requires it. This keeps behavior, accessibility, privacy, and tests consistent across web, desktop, Android, and iOS.
