# Release Guide

## Current release candidate

The repository source version is `2.0.12`. The matching release tag is `v2.0.12`.

Do **not** create or push that tag merely because the version metadata has been updated. The release remains evidence-gated until the repository has a reviewed registry-generated `package-lock.json`, permanent CI/release installs have migrated to `npm ci`, a clean full quality/E2E release gate has passed, the documented `main` branch protection/ruleset has been verified as effective, and every native artifact intended for publication has passed its platform-specific build/signing checks.

## Release checklist

1. Pull the latest `main` from a clean checkout.
2. Verify Node.js is `22.13.0`, matching `.nvmrc` and the pinned CI/release runtime, and satisfies `package.json`.
3. Run `npm install` while the repository has no generated lockfile; after a reviewed `package-lock.json` is committed, use `npm ci` instead.
4. Run `npm run check`, including project-metadata, static-security, tests, production build, and bundle-budget verification.
5. Run `npx playwright install --with-deps chromium` and `npm run test:e2e`.
6. Confirm the Playwright suite includes maintained axe WCAG audits, offline PWA coverage, and release-candidate screenshot scenarios.
7. Run `npm audit --omit=dev --audit-level=high` and review CodeQL/Dependabot results.
8. Verify PWA install, offline reload, update-check, and waiting-update application behavior manually.
9. Run `npm run native:check` on a host with Rust available.
10. Confirm the Native CI workflow is green for Windows, macOS, Linux, Android, and iOS smoke-build jobs on the release candidate.
11. Verify keyboard navigation, focus visibility, dark/light/system theme, reduced motion, 200% zoom, and print output.
12. Trigger one controlled render failure in a development/release-candidate environment and verify the local crash-recovery screen appears without uploading diagnostics or exposing private values.
13. Review the generated calculator, difference, milestone, and mobile screenshots for layout regressions.
14. Confirm `npm run performance:check` reports JavaScript and CSS gzip totals within the release budgets.
15. Verify GitHub reports the documented `main` branch protection/ruleset as effective, including required automated checks and force-push/deletion protection. Do not rely only on the repository documentation; confirm the actual setting in GitHub.
16. Update `CHANGELOG.md`, `ROADMAP.md`, package/runtime/native version numbers, release notes, and `what_changed.md`.
17. Run `npm run metadata:check` again after changing version metadata.
18. Verify the intended tag before pushing it. For this source version, run `npm run release:check -- v2.0.12`.
19. Confirm no real credentials, private data, debug exports, local profile backups, browser-storage dumps, Android keystores, Apple signing files, Windows signing certificates, or notarization credentials are staged.
20. Create and push a signed/annotated version tag where available only after every required release gate is actually satisfied.

The CI workflows support manual dispatch, so maintainers can run quality/browser and native jobs explicitly on the release candidate before tagging. Repository settings are a separate release boundary: automated workflows cannot compensate for an unprotected default branch if direct force pushes or deletion remain possible.

## GitHub web release workflow

Pushing a tag matching `v*.*.*` runs `.github/workflows/release.yml`. The tag workflow:

1. runs under the same pinned Node.js `22.13.0` runtime used by permanent CI;
2. installs dependencies;
3. verifies the tag exactly matches `v${package.json version}`;
4. runs the complete non-E2E quality suite, including metadata, static-security, unit/component tests, production build, and bundle-budget invariants;
5. audits high-severity runtime dependency vulnerabilities;
6. installs Chromium;
7. reruns browser journeys, offline PWA tests, automated accessibility audits, and bundle-budget verification on the tagged commit;
8. archives the verified `dist/` web build and generates a SHA-256 checksum;
9. creates the GitHub Release from the verified tag only after the verification job succeeds.

The existing release workflow publishes the verified web artifact. Native installers/store packages must not be assumed to exist merely because the source has native support; they require the platform-specific release process below.

## Native release process

ChronoAge uses Tauri 2 for Windows, macOS, Linux, Android, and iOS native delivery. The committed source of truth is `src-tauri/`; generated mobile projects and compiled targets are build output.

### Desktop

Build on the target host:

```bash
npm install
npm run native:info
npm run native:build
```

Before publishing:

- **Windows:** build the selected installer format and sign it with the intended Windows code-signing identity.
- **macOS:** sign the application, apply the required hardened-runtime/notarization process for the chosen distribution path, and verify the result.
- **Linux:** build the selected package type and test it on a clean representative distribution/environment.

### Android

Initialize and build from the committed Tauri configuration:

```bash
npm install
npm run native:android:init
npm run native:android:aab
```

Use the AAB for Google Play distribution. APKs are available through `npm run native:android:apk` for testing/direct distribution scenarios. Release signing must use an external protected keystore; never commit signing material.

### iOS / iPadOS

iOS builds require macOS with Xcode:

```bash
npm install
npm run native:ios:init
npm run native:ios:build
```

App Store/TestFlight distribution requires the appropriate Apple Developer signing identity, provisioning configuration, and App Store Connect setup. Keep certificates/profiles and passwords outside Git.

## Native version consistency

Keep these values aligned for a release:

- `package.json` version;
- `src/config/project.ts` version;
- `src-tauri/Cargo.toml` package version;
- `src-tauri/tauri.conf.json` version;
- release tag `vMAJOR.MINOR.PATCH`.

A future metadata checker extension should enforce all native version files automatically. Until then, verify them explicitly during release review.

## Reproducible dependency installation

A generated npm lockfile must come from a real successful npm resolution in a clean, network-enabled environment. Do not hand-author or infer `package-lock.json` metadata.

Once a reviewed lockfile exists:

1. commit it atomically;
2. change CI and release workflows from `npm install` to `npm ci`;
3. verify a clean checkout installs using only the lockfile contract;
4. keep Dependabot/dependency-review automation aligned with the committed lockfile.

Until that migration is complete, dependency versions remain pinned in `package.json`, but clean-install reproducibility is not considered fully proven.

Cargo applications should also commit a registry-generated `src-tauri/Cargo.lock` after a successful clean native dependency resolution so native Rust builds are deterministic. Do not fabricate a Cargo lockfile manually.

## Versioning

Use semantic versioning:

- PATCH — compatible bug/security fixes,
- MINOR — compatible features,
- MAJOR — intentional breaking changes to public behavior or persisted schema.

`package.json` and `src/config/project.ts` must carry the same version. `npm run metadata:check` enforces this relationship along with project name, license, repository/funding links, primary author-email consistency, and the permanent Node runtime pins.

The release tag must match the package version exactly. For the current source version, package version `2.0.12` requires tag `v2.0.12`; `npm run release:check -- v2.0.12` performs the same identity gate used by the GitHub release workflow.

## Cross-platform delivery references

- [Platform support matrix](platforms.md)
- [Desktop delivery](desktop.md)
- [Mobile delivery](mobile.md)
- [ADR 0007 — Tauri 2 cross-platform native delivery](adr/0007-tauri-cross-platform-native-delivery.md)
