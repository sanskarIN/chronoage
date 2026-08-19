# Desktop Delivery

ChronoAge supports Windows, macOS, and Linux through the installable Progressive Web App and standard modern browsers. The current architecture intentionally does not ship an unsigned native wrapper.

See [ADR 0006](adr/0006-pwa-first-desktop-delivery.md) for the decision record.

## Supported desktop path

1. Deploy the production `dist/` bundle over HTTPS.
2. Open ChronoAge in a browser with PWA installation support.
3. Use the browser's install UI or the in-app **Install app** control when the browser exposes the installation prompt.
4. Launch the installed app from the operating system like another application.
5. Use **Settings → Check for updates** to ask the active service worker to check the deployed app shell.
6. Apply a waiting update explicitly when ChronoAge reports one is ready.

The browser remains responsible for the secure web runtime, origin identity, TLS validation, and PWA container.

## Windows

Chromium-based browsers can install ChronoAge as a desktop PWA. The installed experience can appear in Start/search and run in a standalone window according to browser behavior.

ChronoAge does not currently publish an `.msi`, `.msix`, or `.exe` installer. If a native wrapper is introduced later, production installers should use an appropriate code-signing certificate and the release process must keep private signing material outside Git.

## macOS

Use a browser/PWA installation path supported by the target macOS version. ChronoAge does not currently publish a `.dmg` or signed `.app` bundle.

A future native wrapper must document Apple code signing, hardened runtime requirements where applicable, notarization, entitlements, and credential storage before release artifacts are advertised to users.

## Linux

Use ChronoAge in a supported browser or install it through the browser's PWA capability. Distribution behavior differs by desktop environment and browser.

ChronoAge does not currently publish AppImage, Flatpak, Snap, Debian, or RPM packages. A future native packaging decision should choose formats based on real user demand instead of multiplying unmaintained release targets.

## Native-wrapper gate

Do not add Tauri or another native wrapper only to create more artifacts. A wrapper should be considered when at least one concrete requirement cannot be met safely and maintainably by the PWA, such as a justified native integration.

Before adoption, document and verify:

- required operating-system permissions;
- filesystem/network scope and least privilege;
- application identifier and bundle metadata;
- Windows/macOS signing and macOS notarization;
- Linux packaging targets;
- native updater trust/signature design;
- rollback behavior;
- release-key storage and rotation;
- CI secret boundaries;
- security review for every native plugin/API;
- parity of shared date-domain tests across web and wrapped builds.

## Update strategy

The current desktop update strategy is the same as the PWA strategy documented in [pwa.md](pwa.md): a new web deployment installs a new service worker, the existing app can detect a waiting worker, and the user chooses when to apply it.

If a native wrapper is adopted, native binary updates must not bypass platform trust controls. The project should use the wrapper framework's maintained signed-update mechanism rather than a custom downloader/executor.

## Release artifacts

The existing tag workflow produces the verified web build archive. Do not label that archive as a native installer. Platform-native artifacts should only be attached to releases after the corresponding native target exists, passes clean CI builds, and satisfies signing requirements.
