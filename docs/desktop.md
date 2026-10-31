# Desktop Delivery

ChronoAge supports Windows, macOS, and Linux in two ways:

1. standard browser/PWA delivery; and
2. a native Tauri 2 shell built from the same React + TypeScript frontend.

The native implementation supersedes the earlier PWA-only delivery decision. See [ADR 0007](adr/0007-tauri-cross-platform-native-delivery.md).

## Shared desktop workflow

After installing the Tauri prerequisites for your host operating system:

```bash
npm install
npm run native:info
npm run native:dev
```

Build the native application for the current host with:

```bash
npm run native:build
```

For a compile-only validation that skips installer bundling, CI uses Tauri's `--no-bundle` option.

## Windows

Tauri uses Microsoft Edge WebView2 for rendering on Windows and requires the Microsoft C++ build toolchain for development. On supported modern Windows installations, WebView2 is commonly already present; install the Evergreen runtime if it is missing.

Build on Windows:

```powershell
npm install
npm run native:info
npm run native:build
```

Tauri can produce Windows installer formats such as MSI/NSIS when configured and built on an appropriate host. Public installers should be Authenticode-signed. Keep the signing certificate/private key and password outside Git.

## macOS

Install Xcode Command Line Tools for desktop-only development, or full Xcode when iOS development is also required.

```bash
xcode-select --install
npm install
npm run native:info
npm run native:build
```

Public macOS distribution should use Apple code signing and notarization. Direct distribution commonly uses an application bundle/DMG; Mac App Store distribution has additional entitlement and store requirements.

## Linux

Tauri uses WebKitGTK on Linux and requires the distribution's WebKitGTK/build dependencies. On Debian/Ubuntu-family systems, the required development packages include WebKitGTK 4.1 and the standard build dependencies documented by Tauri.

After installing the host packages:

```bash
npm install
npm run native:info
npm run native:build
```

Tauri can bundle Linux applications into formats such as AppImage, Debian packages, or RPM packages depending on the host and selected bundle target.

## Native security model

The committed shell intentionally starts small:

- `withGlobalTauri` is disabled;
- only `core:default` is granted in `src-tauri/capabilities/default.json`;
- there are no filesystem, shell/process, updater, notification, clipboard, or unrestricted HTTP plugins;
- the frontend remains protected by a restrictive Content Security Policy;
- application data remains local unless the user explicitly exports it.

Add native plugins only for a concrete requirement and review their permission scopes before release.

## PWA behavior inside native builds

The browser/PWA service worker and install/update prompts are useful on the web but are not the update mechanism for installed native binaries. ChronoAge detects the Tauri runtime and disables those PWA-specific flows inside the native shell.

Native application updates must follow platform signing/trust requirements. Do not create a custom downloader/executor that bypasses platform security controls.

## Build outputs and generated files

Tauri native build output lives under `src-tauri/target/`. The directory is ignored by Git.

Mobile-generated projects live under `src-tauri/gen/` and are also treated as generated build state. The committed sources of truth are:

- `src-tauri/Cargo.toml`;
- `src-tauri/build.rs`;
- `src-tauri/src/`;
- `src-tauri/tauri.conf.json`;
- `src-tauri/capabilities/`;
- the shared frontend source.

## Release requirements

Before publishing a desktop installer:

1. run the normal web quality suite;
2. compile the native shell on the target operating system;
3. validate the packaged application on a clean machine/account;
4. verify local persistence, import/export, printing/sharing behavior, keyboard access, scaling, and offline startup;
5. sign/notarize the package according to platform policy;
6. verify the signature/notarization result independently;
7. attach only verified artifacts to the GitHub release.

See [platforms.md](platforms.md), [mobile.md](mobile.md), and [release.md](release.md).
