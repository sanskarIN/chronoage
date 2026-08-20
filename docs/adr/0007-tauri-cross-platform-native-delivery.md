# ADR 0007: Tauri 2 for Cross-Platform Native Delivery

- Status: Accepted
- Date: 2026-08-20
- Supersedes: [ADR 0006](0006-pwa-first-desktop-delivery.md) for native-delivery policy

## Context

ChronoAge originally used browser/PWA delivery as the only supported installation path. That kept the project small and avoided native signing, SDK, permission, and packaging complexity.

The project now has an explicit requirement to support first-class native delivery across Windows, macOS, Linux, Android, and iOS while preserving the existing web/PWA product.

Maintaining separate Electron, Android, iOS, and desktop implementations would duplicate UI and date-domain logic and increase the risk of behavior drift.

## Decision

Adopt Tauri 2 as a thin native shell around the existing React + TypeScript frontend.

The architecture is:

- React + TypeScript remains the shared UI and application layer.
- Deterministic date/domain logic remains independent of React and native APIs.
- Vite continues to produce the canonical frontend `dist/` bundle.
- Tauri consumes the same `dist/` bundle for Windows, macOS, Linux, Android, and iOS.
- Rust code remains intentionally minimal until a justified native feature requires more.
- Native permissions are denied by omission; the default capability grants only `core:default`.
- Browser/PWA service-worker install/update behavior is disabled when the frontend detects the Tauri runtime.
- Generated mobile projects under `src-tauri/gen/` are reproducible build state rather than the architectural source of truth.

## Why Tauri 2

Tauri 2 supports the required desktop and mobile operating systems from one frontend codebase while using system WebViews. It also provides explicit capability/permission controls and platform packaging commands without requiring ChronoAge to duplicate its business logic.

## Consequences

### Positive

- One shared UI and domain implementation across web and native targets.
- Native Android/iOS and desktop packaging without maintaining separate application codebases.
- Small Rust/native surface area.
- Explicit least-privilege permission model.
- Existing PWA delivery remains available.
- Platform-specific capabilities can be added later without rewriting the application.

### Costs

- Contributors building native packages must install Rust and target-specific SDK/toolchains.
- iOS builds require macOS/Xcode.
- Production installers require platform signing and, for some platforms, notarization/store configuration.
- Native build CI is slower and more host-dependent than web-only CI.
- WebView behavior must be checked on representative operating-system versions.

## Security constraints

Any future native plugin or permission must include:

1. a concrete user-facing requirement;
2. the minimum capability scope;
3. privacy/security impact documentation;
4. tests covering failure/denial paths where applicable;
5. review of signing/update implications.

Do not add broad shell execution, unrestricted filesystem access, or unrestricted remote networking merely for convenience.

## Release constraints

A platform may be described as source-supported once the committed shared frontend and Tauri configuration target it. A specific downloadable installer/store artifact must not be advertised as published until that artifact has been built on an appropriate host, tested, signed where required, and attached/uploaded through the documented release process.

## Follow-up

- Keep Tauri npm and Rust dependency versions deliberately aligned.
- Keep native build/config validation in CI.
- Generate platform icons from the existing ChronoAge logo before public store submission.
- Revisit generated-project commit policy only if platform-specific native customization becomes necessary.
