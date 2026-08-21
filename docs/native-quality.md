# Native Quality and Reproducibility

ChronoAge uses one React + TypeScript product implementation and a Tauri 2 + Rust native shell for Windows, macOS, Linux, Android, and iOS/iPadOS. This guide defines the quality and reproducibility rules for that native layer.

## Quality goals

Native changes should be:

- deterministic enough that an unchanged commit does not silently move to a different direct toolchain or direct Tauri dependency;
- formatted and lint-clean before native compilation;
- compiled on every supported desktop operating system in Native CI;
- smoke-built for Android and the iOS simulator in Native CI;
- least-privilege and local-first, matching the security model documented elsewhere in the repository;
- honest about evidence that has not yet been produced, especially lockfiles, signing, notarization, and store publication.

## Pinned Rust toolchain

The repository root contains `rust-toolchain.toml` with an exact Rust `1.97.1` channel and the `rustfmt` and Clippy components.

`src-tauri/Cargo.toml` declares the same value through `rust-version = "1.97.1"`. `npm run metadata:check` fails if the Cargo requirement and repository toolchain diverge, if the root channel stops being an exact semantic version, or if the required Rust quality components are removed.

Permanent CI must not use `rustup update stable`. A moving stable channel makes identical commits dependent on the date a workflow happens to run. Native CI instead lets rustup honor the repository toolchain file and reports the active toolchain with `rustup show active-toolchain`.

## Direct native dependency pins

Until a reviewed `src-tauri/Cargo.lock` exists, direct native dependencies are pinned with Cargo's exact-version syntax:

```toml
tauri-build = { version = "=2.6.3", features = [] }
tauri = { version = "=2.11.5", features = [] }
```

This does not replace a lockfile because transitive dependencies can still change. It does reduce avoidable direct-dependency drift. The metadata checker rejects direct Tauri versions that stop using an exact `=MAJOR.MINOR.PATCH` pin.

## Local native quality commands

From the repository root:

```bash
npm run native:format:check
npm run native:lint
npm run native:check
```

`native:format:check` runs `cargo fmt --check` for the Tauri manifest. `native:lint` runs Clippy across all targets and features and converts warnings into failures. `native:check` regenerates native icons, verifies Rust formatting, runs `cargo check`, and then runs Clippy.

The repository-wide text-format checker also covers `.toml` files so line endings, tabs, final newlines, and trailing whitespace are checked for Rust configuration and manifests.

## Native CI expectations

`.github/workflows/native.yml` provides separate jobs for:

- Linux desktop compilation;
- Windows desktop compilation;
- macOS desktop compilation;
- Android ARM64 debug APK smoke builds;
- iOS simulator smoke builds.

The Linux desktop job additionally runs the Rust formatting and Clippy quality gates before compiling the native application. All native jobs verify the pinned Rust toolchain before their platform-specific work. Android and iOS install only the extra Rust target required for that job.

Changes to `package-lock.json` trigger Native CI because every native build also consumes the shared frontend dependency graph. Changes under `src-tauri/**`, including a future `src-tauri/Cargo.lock`, already trigger Native CI through the native path filter.

A source-supported target is not considered a published target merely because its CI job exists. Signed installers, notarized packages, store artifacts, release credentials, and clean-device verification remain separate release evidence.

## Dependency monitoring

Dependabot monitors:

- npm dependencies at the repository root;
- Cargo dependencies in `/src-tauri`;
- GitHub Actions dependencies.

`npm run metadata:check` verifies that Cargo dependency monitoring exists and points at `/src-tauri`, preventing accidental loss of native dependency update coverage.

## Runtime detection regression coverage

`tests/platform.test.ts` mocks Tauri's official runtime detector and verifies both supported states:

- Tauri reports a native runtime and ChronoAge reports native/not-web;
- Tauri reports a normal browser runtime and ChronoAge reports web/not-native.

This protects the boundary that keeps browser-only PWA service-worker/install/update behavior out of installed native applications.

## Lockfile boundary

ChronoAge intentionally does not contain a hand-authored or guessed `package-lock.json` or `src-tauri/Cargo.lock`.

Those files must be produced by real package-manager resolution in a network-enabled clean checkout, reviewed, and validated before they are committed. The repository now exposes:

```bash
npm run release:npm-lock:check
npm run release:cargo-lock:check
npm run release:locks:check
```

The tag-triggered web release workflow already requires the npm lockfile preflight and then installs with `npm ci`; until `package-lock.json` is genuinely generated and committed, a release tag therefore fails safely before dependency installation instead of resolving an unpinned graph.

Normal push/PR CI and native frontend installation still use `npm install` until the genuine npm lockfile exists. After that checkpoint, those permanent installs should migrate to `npm ci`. After a genuine Cargo lockfile exists, release/native verification should use Cargo's `--locked` mode where dependency resolution must not drift.

Do not mark either lockfile roadmap item complete based only on direct version pins or on the presence of the preflight script. See [Reproducible Builds and Lockfiles](reproducible-builds.md) for generation, review, deterministic packaging, and evidence procedures.

## Rust upgrade procedure

When intentionally upgrading Rust:

1. Review the target Rust release and compatibility implications.
2. Change the exact `channel` in `rust-toolchain.toml`.
3. Change `rust-version` in `src-tauri/Cargo.toml` to the same exact version.
4. Run `npm run metadata:check`.
5. Run `npm run native:check` on a supported desktop development host.
6. Run the full Native CI matrix.
7. Record the change in release-facing documentation when it affects release engineering or compatibility.

Do not loosen the pin to `stable`, `beta`, a major/minor-only channel, or another moving selector in permanent release infrastructure.

## Tauri dependency upgrade procedure

When upgrading `tauri` or `tauri-build`:

1. Review Tauri release notes and security advisories.
2. Keep direct Cargo versions exact using the leading `=` syntax.
3. Keep JavaScript Tauri packages exact in `package.json`.
4. Run metadata, security, web quality, and native quality checks.
5. Run desktop, Android, and iOS Native CI coverage.
6. Re-review native capability and CSP assumptions if the upgrade changes permissions, plugins, runtime APIs, or bundling behavior.

## Release evidence still required

The following items remain evidence-gated and must not be inferred from source quality alone:

- a reviewed npm lockfile from genuine registry resolution;
- a reviewed Cargo lockfile from genuine registry resolution;
- migration of permanent push/PR/native frontend dependency installs to `npm ci` after the npm lockfile is committed;
- locked Cargo release/native resolution after the Cargo lockfile is committed;
- a completely green clean-checkout shared quality/E2E run for the release candidate;
- a completely green Native CI matrix for the release candidate;
- effective `main` branch protection/ruleset verification;
- signed/verified Windows, macOS, Linux, Android, and iOS distribution artifacts where applicable;
- notarization, provisioning, store configuration, and release-account steps required by each target platform.

Keeping those boundaries explicit is part of ChronoAge's production-quality standard: repository state should describe what has actually been demonstrated, not what is merely intended.
