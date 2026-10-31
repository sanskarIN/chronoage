# Platform Support Matrix

ChronoAge uses one React + TypeScript frontend and two delivery layers:

1. the standard web/PWA build in `dist/`; and
2. a thin Tauri 2 native shell in `src-tauri/`.

The date-domain, storage validation, routing, accessibility behavior, and UI remain shared. Native packages do not contain a second implementation of the calculator.

## Supported targets

| Target | Web/PWA | Native Tauri | Primary native output |
| --- | --- | --- | --- |
| Windows | Yes | Yes | Native application / Windows installer |
| macOS | Yes | Yes | `.app` / DMG depending on bundle command |
| Linux | Yes | Yes | AppImage, Debian/RPM or other configured Tauri package |
| Android | Yes | Yes | APK for testing/direct distribution; AAB for Google Play |
| iOS / iPadOS | Yes | Yes | Xcode/iOS archive and distributable package |
| Other modern browsers | Yes | Not applicable | Web/PWA |

## Shared-runtime rules

- The production frontend is always built with `npm run build:web`.
- Tauri consumes the same `dist/` output through `src-tauri/tauri.conf.json`.
- PWA service-worker registration and browser install/update prompts are disabled automatically while running inside Tauri.
- Saved profiles remain local to the browser or native WebView storage container.
- The native shell starts with only Tauri's `core:default` capability. Optional filesystem, shell, process, networking, notification, or other native permissions are not granted by default.
- Native build artifacts and signing credentials are excluded from Git.

## Common commands

```bash
npm install
npm run build:web
npm run native:info
npm run native:check
```

Desktop development/build on the current host:

```bash
npm run native:dev
npm run native:build
```

Android:

```bash
npm run native:android:init
npm run native:android:dev
npm run native:android:apk
npm run native:android:aab
```

iOS/iPadOS on macOS:

```bash
npm run native:ios:init
npm run native:ios:dev
npm run native:ios:build
```

## Host restrictions

Native packaging depends on the target operating system and its SDK/toolchain. In particular, iOS development requires macOS and Xcode. Windows, macOS, and Linux desktop packages should be validated on their target hosts before release.

The repository can generate Android and iOS native projects through the Tauri CLI. Generated projects live under `src-tauri/gen/` and are intentionally treated as build output so the authoritative configuration remains in `src-tauri/tauri.conf.json` and the shared Rust/frontend sources.

## Signing and stores

Development builds can be produced without committing secrets. Public distribution must use the platform's official signing and store requirements. Keep Android keystores, Apple certificates/profiles, Windows signing certificates, notarization credentials, and all related passwords/tokens outside Git and provide them to CI only through protected secrets.

See [desktop.md](desktop.md), [mobile.md](mobile.md), and [release.md](release.md) for detailed workflows.
