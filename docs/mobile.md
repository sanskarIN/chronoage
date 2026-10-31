# Mobile Delivery: Android and iOS/iPadOS

ChronoAge uses Tauri 2 for native mobile delivery while keeping the React + TypeScript frontend and date-domain logic shared with the web/PWA build.

## Android

### Requirements

Install:

- Node.js matching the repository requirement;
- Rust stable;
- Android Studio;
- Android SDK Platform and Platform Tools;
- Android Build Tools;
- Android SDK Command-line Tools;
- Android NDK;
- a Java runtime compatible with the installed Android tooling.

Set the Android SDK/NDK environment variables required by Tauri for your operating system before running native commands.

### Initialize the Android project

```bash
npm install
npm run native:android:init
```

The generated Android Studio project is placed below `src-tauri/gen/`. It is generated from the committed Tauri configuration and is ignored by Git.

### Run during development

```bash
npm run native:android:dev
```

For a physical device, Tauri may expose the Vite development server through `TAURI_DEV_HOST`. `vite.config.ts` already honors that variable so the device can reach the development server.

### Build APK

```bash
npm run native:android:apk
```

Use an APK for local testing or direct distribution scenarios where appropriate.

### Build Android App Bundle

```bash
npm run native:android:aab
```

Use the AAB output for Google Play submission. Production uploads require an Android signing key configured outside the repository.

## iOS and iPadOS

### Requirements

Native iOS development is available only on macOS. Install:

- Node.js matching the repository requirement;
- Rust stable;
- Xcode;
- the iOS Rust targets required by Tauri;
- CocoaPods when required by the generated project/toolchain.

Launch Xcode at least once after installation so it can finish installing its required components and accept any required license agreement.

### Initialize the Apple project

```bash
npm install
npm run native:ios:init
```

### Run during development

```bash
npm run native:ios:dev
```

Tauri automatically supplies `TAURI_DEV_HOST` when an iOS device needs a network-accessible frontend development URL; the committed Vite configuration supports that path.

### Build

```bash
npm run native:ios:build
```

Store/TestFlight distribution requires the appropriate Apple Developer team, signing identity, provisioning configuration, and App Store Connect setup. Those credentials and profiles must stay outside Git.

## Local data and privacy on mobile

ChronoAge does not introduce a remote account or synchronization service for native mobile builds. Calculator inputs, settings, and saved profiles remain inside the application's local WebView storage container unless the user explicitly exports data.

The native capability file grants only Tauri's baseline core permission set. Do not add filesystem, shell/process, unrestricted network, or other native plugins without documenting the user-facing requirement, privacy impact, permission scope, and test coverage.

## Updating generated projects

If the Tauri mobile generator or native toolchain changes materially:

1. update the committed Tauri/npm/Rust versions deliberately;
2. remove the local `src-tauri/gen/` directory if regeneration is required;
3. run the corresponding `native:*:init` command again;
4. build and test on an emulator/simulator and a representative physical device before release;
5. re-check signing, store metadata, permissions, and application identifier `in.sanskar.chronoage`.

## Troubleshooting

Start with:

```bash
npm run native:info
```

Then verify that Rust, the Android SDK/NDK or Xcode, and the required platform targets are visible to Tauri. Build failures caused by missing platform SDKs should be fixed in the host toolchain rather than by weakening the application configuration.

See [platforms.md](platforms.md), [desktop.md](desktop.md), and [release.md](release.md).
