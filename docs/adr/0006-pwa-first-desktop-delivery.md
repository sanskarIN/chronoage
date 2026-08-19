# ADR 0006 — PWA-first desktop delivery

- Status: Accepted
- Date: 2026-08-19

## Context

ChronoAge targets Windows, macOS, and Linux in addition to the web. The existing installable PWA already runs on those desktop platforms without introducing native filesystem permissions, a second updater, platform signing credentials, or a Rust/Tauri toolchain.

A Tauri wrapper could provide a native installer and tighter operating-system integration, but ChronoAge currently has no feature that requires native privileges. Adding a wrapper now would increase build, signing, release, and security surface area without improving the core age/date workflows.

## Decision

Keep the installable PWA as the supported desktop delivery for the current major version and defer a Tauri wrapper until a concrete native-only requirement exists.

- Windows, macOS, and Linux users install through a compatible browser or use the web application directly.
- The browser service-worker lifecycle remains the application update mechanism.
- No native auto-updater, filesystem permission, shell integration, or platform entitlement is added today.
- If Tauri is adopted later, it must be introduced behind a separate build target without moving domain logic out of the shared TypeScript modules.
- Native installers must be signed/notarized according to each platform's current requirements before they are advertised as production artifacts.

## Consequences

ChronoAge keeps one primary runtime, one privacy model, and one tested update path. The project avoids unsigned native binaries and avoids storing signing secrets in the repository. A future Tauri adoption requires a new ADR that documents permissions, signing, updater trust, CI secret handling, and release rollback behavior.
