# Native Quality and Reproducibility

ChronoAge uses one React + TypeScript product implementation and a Tauri 2 + Rust native shell for Windows, macOS, Linux, Android, and iOS/iPadOS. This guide defines the quality and reproducibility rules for that native layer.

## Quality goals

Native changes should be:

- deterministic enough that an unchanged commit does not silently move to a different direct toolchain or dependency graph;
- formatted and lint-clean before native compilation;
- compiled on every supported desktop operating system in Native CI;
- smoke-built for Android and the iOS simulator in Native CI;
- least-privilege and local-first, matching the security model documented elsewhere in the repository;
- honest about evidence that has not yet been produced, especially registry-generated lockfiles, signing, notarization, and store publication.

## Pinned Rust toolchain

The repository root contains `rust-toolchain.toml` with an exact Rust `1.97.1` channel and the `rustfmt` and Clippy components.

`src-tauri/Cargo.toml` declares the same value through `rust-version = "1.97.1"`. `npm run metadata:check` fails if the Cargo requirement and repository toolchain diverge, if the root channel stops being an exact semantic version, or if the required Rust quality components are removed.

Permanent CI must not use `rustup update stable`. A moving stable channel makes identical commits dependent on the date a workflow happens to run. Native CI instead lets rustup honor the repository toolchain file and reports the active toolchain with `rustup show active-toolchain`.

## Direct native dependency pins

Direct native dependencies use Cargo's exact-version syntax:

```toml
tauri-build = { version = "=2.6.3", features = [] }
tauri = { version = "=2.11.5", features = [] }
```

Exact direct pins do not replace a Cargo lockfile because transitive dependencies can still change. The metadata checker rejects direct Tauri versions that stop using an exact `=MAJOR.MINOR.PATCH` pin.

## Local native quality commands

From the repository root:

```bash
npm run release:cargo-lock:check
npm run native:lock:check
npm run native:format:check
npm run native:lint
npm run native:check
```

`release:cargo-lock:check` validates the committed Cargo lockfile identity and generated-file shape. `native:lock:check` asks Cargo to read the graph with `--locked`. `native:format:check` runs `cargo fmt --check` for the Tauri manifest. `native:lint` runs Clippy across all targets and features with `--locked` and converts warnings into failures. `native:check` performs the Cargo lockfile preflight, locked metadata verification, icon generation, formatting, locked `cargo check`, and locked Clippy.

The repository-wide text-format checker also covers `.toml` files so line endings, tabs, final newlines, and trailing whitespace are checked for Rust configuration and manifests.

## Native CI expectations

`.github/workflows/native.yml` provides separate jobs for:

- Linux desktop compilation;
- Windows desktop compilation;
- macOS desktop compilation;
- Android ARM64 debug APK smoke builds;
- iOS simulator smoke builds.

For the 2.0.13 release candidate, every native job installs the shared frontend dependency graph with `npm ci --no-fund --no-audit`, validates `src-tauri/Cargo.lock`, verifies Cargo metadata with `--locked`, and reports the pinned Rust toolchain before platform-specific work. The Linux desktop job additionally runs Rust formatting and locked Clippy quality gates before compiling the native application. Android and iOS install only the extra Rust target required for that job.

This is intentionally fail-closed: while a genuine registry-generated npm or Cargo lockfile is absent, the corresponding job must fail instead of resolving a new dependency graph. The release-preparation PR must not be merged merely because the source policy is present; the generated lockfiles still require review and passing hosted evidence.

Changes to `package-lock.json` trigger Native CI because every native build consumes the shared frontend dependency graph. Changes under `src-tauri/**`, including `src-tauri/Cargo.lock`, trigger Native CI through the native path filter.

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

`package-lock.json` and `src-tauri/Cargo.lock` must be produced by real package-manager resolution using the repository's pinned toolchains, reviewed, and validated before they are accepted. They must never be hand-authored or inferred from direct dependency declarations.

The repository exposes:

```bash
npm run release:npm-lock:check
npm run release:cargo-lock:check
npm run release:locks:check
```

The 2.0.13 release-preparation branch stages lockfile-only behavior across the permanent workflows:

- normal web quality CI uses `npm ci`;
- Playwright CI uses `npm ci`;
- every Native CI job uses `npm ci`;
- Native CI validates Cargo lockfile identity and locked Cargo metadata;
- native lint/check scripts use Cargo `--locked` where dependency resolution must not drift;
- the tag release checks both npm and Cargo lockfiles before `npm ci` and release verification;
- `npm run ci:reproducibility:check` prevents permanent verification workflows from regressing to `npm install` or losing locked native checks.

These source changes are not themselves proof that the real dependency graphs have been resolved or that hosted CI is green. Until genuine registry-generated lockfiles are present and reviewed, the related roadmap evidence remains incomplete.

See [Reproducible Builds and Lockfiles](reproducible-builds.md) for generation, review, deterministic packaging, and evidence procedures.

## Rust upgrade procedure

When intentionally upgrading Rust:

1. Review the target Rust release and compatibility implications.
2. Change the exact `channel` in `rust-toolchain.toml`.
3. Change `rust-version` in `src-tauri/Cargo.toml` to the same exact version.
4. Regenerate/review `src-tauri/Cargo.lock` if resolution changes.
5. Run `npm run metadata:check` and `npm run release:cargo-lock:check`.
6. Run `npm run native:check` on a supported desktop development host.
7. Run the full Native CI matrix.
8. Record the toolchain change in release-facing documentation when it affects release engineering or compatibility.

Do not loosen the pin to `stable`, `beta`, a major/minor-only channel, or another moving selector in permanent release infrastructure.

## Tauri dependency upgrade procedure

When upgrading `tauri` or `tauri-build`:

1. Review Tauri release notes and security advisories.
2. Keep direct Cargo versions exact using the leading `=` syntax.
3. Keep JavaScript Tauri packages exact in `package.json`.
4. Regenerate and review affected npm/Cargo lockfiles with the pinned toolchains.
5. Run metadata, security, web quality, and native quality checks.
6. Run desktop, Android, and iOS Native CI coverage.
7. Re-review native capability and CSP assumptions if the upgrade changes permissions, plugins, runtime APIs, or bundling behavior.

## Release evidence still required

The following items remain evidence-gated and must not be inferred from source quality alone:

- reviewed npm lockfile content from genuine registry resolution for the 2.0.13 graph;
- reviewed Cargo lockfile content from genuine registry resolution for the 2.0.13 graph;
- a completely green clean-checkout shared quality/E2E run using `npm ci`;
- a completely green Native CI matrix using the accepted lockfiles;
- effective `main` branch protection/ruleset verification;
- signed/verified Windows, macOS, Linux, Android, and iOS distribution artifacts where applicable;
- notarization, provisioning, store configuration, and release-account steps required by each target platform.

Keeping those boundaries explicit is part of ChronoAge's production-quality standard: repository state should describe what has actually been demonstrated, not what is merely intended.
