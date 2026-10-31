# Release Guide

## Current release candidate

The repository source version is `2.0.13`. The matching release tag is `v2.0.13`.

Do **not** create or push that tag merely because the version metadata has been updated. The release remains evidence-gated until the repository has a reviewed registry-generated `package-lock.json`, permanent push/PR/native frontend installs have migrated to `npm ci`, a clean full quality/E2E/native release gate has passed, the documented `main` branch protection/ruleset has been verified as effective, and every native artifact intended for publication has passed its platform-specific build/signing checks.

## Release checklist

1. Pull the latest `main` from a clean checkout.
2. Verify Node.js is exactly `22.13.0`, matching `.nvmrc` and the pinned CI/release runtime.
3. Generate and review a real `package-lock.json` from a successful network-enabled npm resolution if one is not yet committed. Do not hand-author it.
4. Run `npm run release:npm-lock:check`, then prove a clean `npm ci --no-fund --no-audit` installation succeeds from that lockfile.
5. Run `npm run check`, including project-metadata, release-workflow, static-security, tests, production build, documentation-link, and bundle-budget verification.
6. Run `npx playwright install --with-deps chromium` and `npm run test:e2e`.
7. Confirm the Playwright suite includes maintained axe WCAG audits, offline PWA coverage, and release-candidate screenshot scenarios.
8. Run `npm audit --omit=dev --audit-level=high` and review CodeQL/Dependabot results.
9. Verify PWA install, offline reload, update-check, and waiting-update application behavior manually.
10. Generate and review a real `src-tauri/Cargo.lock` from the pinned Rust toolchain if one is not yet committed. Do not hand-author it.
11. Run `npm run release:cargo-lock:check` and `npm run native:check` on a host with Rust available; use Cargo `--locked` once the generated Cargo lockfile is accepted.
12. Confirm the Native CI workflow is green for Windows, macOS, Linux, Android, and iOS smoke-build jobs on the release candidate.
13. Verify keyboard navigation, focus visibility, dark/light/system theme, reduced motion, 200% zoom, and print output.
14. Trigger one controlled render failure in a development/release-candidate environment and verify the local crash-recovery screen appears without uploading diagnostics or exposing private values.
15. Review the generated calculator, difference, milestone, and mobile screenshots for layout regressions.
16. Confirm `npm run performance:check` reports JavaScript and CSS gzip totals within the release budgets.
17. Verify GitHub reports the documented `main` branch protection/ruleset as effective, including required automated checks and force-push/deletion protection. Do not rely only on repository documentation; confirm the actual setting in GitHub.
18. Update `CHANGELOG.md`, `ROADMAP.md`, package/runtime/native version numbers, release notes, README release references, and `what_changed.md`.
19. Run `npm run metadata:check` and `npm run release:workflow:check` again after changing release metadata.
20. Verify the intended tag before pushing it. For this source version, run `npm run release:check -- v2.0.13`.
21. Confirm no real credentials, private data, debug exports, local profile backups, browser-storage dumps, Android keystores, Apple signing files, Windows signing certificates, or notarization credentials are staged.
22. Create and push a signed/annotated version tag where available only after every required release gate is actually satisfied.

The CI workflows support manual dispatch, so maintainers can run quality/browser and native jobs explicitly on the release candidate before tagging. Repository settings are a separate release boundary: automated workflows cannot compensate for an unprotected default branch if direct force pushes or deletion remain possible.

## GitHub web release workflow

Pushing a tag matching `v*.*.*` runs `.github/workflows/release.yml`. The tag workflow:

1. checks out the tagged commit and runs under the exact Node.js `22.13.0` project pin;
2. verifies the committed npm lockfile before dependency installation;
3. installs dependencies with `npm ci --no-fund --no-audit` and has no `npm install` fallback;
4. verifies the tag exactly matches `v${package.json version}`;
5. runs the complete non-E2E quality suite, including metadata, release-workflow policy, static-security, unit/component tests, documentation links, production build, and bundle-budget invariants;
6. audits high-severity runtime dependency vulnerabilities;
7. installs Chromium and reruns browser journeys, offline PWA tests, and automated accessibility audits;
8. creates a deterministic `dist/` archive with normalized ordering, commit-derived timestamps, numeric ownership, and timestamp-free gzip metadata;
9. generates a SHA-256 checksum for the final `.tar.gz`;
10. generates a deterministic JSON release evidence manifest tied to the package version, tag, full source commit, `SOURCE_DATE_EPOCH`, exact Node runtime, archive size/digest, and generated dependency-lock hashes when present;
11. stages the archive, checksum, and evidence manifest together as the verified workflow artifact;
12. downloads that verified package in the publish job and runs `sha256sum --check` again before publication;
13. creates the GitHub Release from the verified tag only after the verification job succeeds and attaches the archive, checksum, and evidence manifest together.

The release evidence manifest is an integrity/evidence record, not a claim of code signing, SLSA provenance, notarization, or store certification. Those guarantees require separate configured systems and credentials.

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

After the real npm lockfile is committed and the permanent native frontend install migration is complete, use `npm ci` instead of `npm install` for clean release builds.

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
- `public/sw.js` cache version;
- release notes file/heading;
- release tag `vMAJOR.MINOR.PATCH`.

`npm run metadata:check` enforces the package/runtime/Tauri/Cargo/PWA version relationships, release-note presence, changelog release heading, runtime pins, and other project metadata invariants.

## Reproducible dependency installation

A generated npm lockfile must come from a real successful npm resolution in a clean, network-enabled environment. Do not hand-author or infer `package-lock.json` metadata.

The tag release workflow is already lockfile-gated and uses `npm ci`. Once a reviewed lockfile exists:

1. commit it atomically;
2. prove clean installation with `npm ci --no-fund --no-audit`;
3. migrate permanent push/PR CI and Native CI frontend installation from `npm install` to `npm ci`;
4. verify clean checkouts install using only the lockfile contract;
5. keep Dependabot/dependency-review automation aligned with the committed lockfile.

Until that migration is complete, direct dependency versions remain pinned in `package.json`, but clean-install reproducibility for permanent push/PR/native workflows is not considered fully proven.

Cargo applications should also commit a registry-generated `src-tauri/Cargo.lock` after a successful clean native dependency resolution so native Rust builds are deterministic. Do not fabricate a Cargo lockfile manually. After it is accepted, use Cargo `--locked` where release/native dependency drift must be forbidden.

See [reproducible-builds.md](reproducible-builds.md) for the complete lockfile, deterministic archive, checksum, and release evidence policy.

## Versioning

Use semantic versioning:

- PATCH — compatible bug/security/release-engineering fixes,
- MINOR — compatible features,
- MAJOR — intentional breaking changes to public behavior or persisted schema.

`package.json` and the runtime/native/PWA release identity files must carry the same source version. `npm run metadata:check` enforces this relationship along with project name, license, repository/funding links, primary author-email consistency, release documentation, and the permanent Node/Rust runtime pins.

The release tag must match the package version exactly. For the current source version, package version `2.0.13` requires tag `v2.0.13`; `npm run release:check -- v2.0.13` performs the same identity gate used by the GitHub release workflow.

## Cross-platform delivery references

- [Platform support matrix](platforms.md)
- [Desktop delivery](desktop.md)
- [Mobile delivery](mobile.md)
- [Reproducible builds and lockfiles](reproducible-builds.md)
- [ADR 0007 — Tauri 2 cross-platform native delivery](adr/0007-tauri-cross-platform-native-delivery.md)
