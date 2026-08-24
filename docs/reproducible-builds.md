# Reproducible Builds and Lockfiles

ChronoAge treats dependency resolution and release packaging as part of the product's correctness boundary. A source commit should not silently resolve different dependency graphs or produce materially different release archives simply because it is built later.

This guide documents the repository policy for npm, Cargo, release archives, and release-candidate evidence.

## Current release-candidate state

The repository pins:

- Node through `.nvmrc` at `22.13.0`;
- the native Rust toolchain through `rust-toolchain.toml` at `1.97.1`;
- direct npm dependency versions in `package.json`;
- direct Tauri Rust dependencies in `src-tauri/Cargo.toml` with exact `=MAJOR.MINOR.PATCH` requirements.

Those pins reduce drift, but they do not replace dependency lockfiles.

The 2.0.13 release-preparation branch is intentionally fail-closed: permanent web/native/release verification has been staged to require lockfile-only dependency state, but genuine `package-lock.json` and `src-tauri/Cargo.lock` content still must come from successful registry resolution and review. Do not hand-author either lockfile, and do not merge a branch that requires them until those files and the associated hosted checks exist.

## Lockfile preflight commands

The repository exposes three explicit checks:

```bash
npm run release:npm-lock:check
npm run release:cargo-lock:check
npm run release:locks:check
```

`release:npm-lock:check` verifies that:

- `package-lock.json` exists and is valid JSON;
- the current npm lockfile format is used;
- the lockfile name/version match `package.json`;
- the root lockfile dependency and development-dependency specifications exactly match `package.json`.

`release:cargo-lock:check` verifies that:

- `src-tauri/Cargo.lock` exists;
- it carries Cargo's generated-file header;
- it uses a supported modern Cargo lockfile format;
- it contains the current native root package name and version from `src-tauri/Cargo.toml`.

`release:locks:check` runs both checks.

These checks validate committed lockfile identity and shape. They do not claim that every transitive package is trustworthy; dependency review, audit, CodeQL, source review, and hosted CI remain separate controls.

## Generating the npm lockfile

Generate the npm lockfile only in a network-enabled clean checkout using the pinned Node toolchain.

Recommended sequence:

```bash
nvm use
node --version
npm --version
npm install --package-lock-only --no-fund --no-audit
npm run release:npm-lock:check
npm ci --no-fund --no-audit
npm run check
npm run test:e2e
```

Before committing the lockfile:

1. Confirm `node --version` is the value in `.nvmrc`.
2. Review the top-level dependency specifications in the generated lockfile.
3. Review unexpected package additions, registry changes, integrity changes, and lifecycle-sensitive packages.
4. Run the npm lockfile preflight.
5. Delete `node_modules` and prove that `npm ci` reconstructs a working dependency tree from the lockfile.
6. Run the full web quality and E2E suites from that clean installation.

Do not modify package versions by editing `package-lock.json` directly. Change `package.json`, regenerate the lockfile with npm, review the resulting diff, and rerun the checks.

## Generating the Cargo lockfile

Generate the Cargo lockfile only with the repository's pinned Rust toolchain and a successful Cargo dependency resolution.

Recommended sequence:

```bash
rustup show active-toolchain
cargo --version
cargo generate-lockfile --manifest-path src-tauri/Cargo.toml
npm run release:cargo-lock:check
npm run native:lock:check
cargo check --manifest-path src-tauri/Cargo.toml --locked
npm run native:format:check
npm run native:lint
```

Before committing the lockfile:

1. Confirm `rustup show active-toolchain` resolves to the exact channel in `rust-toolchain.toml`.
2. Review new or changed crates, sources, checksums, and versions.
3. Confirm the root `chronoage` package entry matches the native package version.
4. Run the Cargo lockfile preflight.
5. Run Cargo with `--locked` so verification fails rather than silently changing resolution.
6. Run the complete Native CI matrix after the lockfile is committed.

Do not manually synthesize or guess `Cargo.lock` content.

## Permanent CI behavior

The 2.0.13 release-preparation branch stages deterministic dependency consumption across permanent verification workflows:

- the normal web quality job installs with `npm ci --no-fund --no-audit`;
- the Playwright job installs with the same `npm ci` command;
- Windows, macOS, Linux, Android, and iOS Native CI jobs install the shared frontend graph with `npm ci`;
- every Native CI job validates the Cargo lockfile and reads Cargo metadata with `--locked`;
- native lint/check commands use Cargo `--locked` for dependency-sensitive verification;
- `npm run ci:reproducibility:check` rejects permanent workflow regressions to `npm install` and missing native lock checks.

This policy means a missing or stale lockfile is a hard failure. That is intentional: CI must not repair dependency state by silently resolving a new graph.

## Release workflow behavior

The tag-triggered release workflow checks the complete dependency lockfile boundary before installation:

```bash
npm run release:locks:check
npm ci --no-fund --no-audit
```

The release workflow does not fall back to `npm install`. It validates both npm and Cargo lockfile identity even though the published web archive consumes the frontend graph directly, because the release source version also contains the supported native application and must not advertise an inconsistent native dependency state.

After the lockfile and install gates, the workflow checks release-tag identity, runs the web quality suite, audits high-severity runtime dependencies, installs Chromium, runs browser/accessibility verification, and only then stages the deterministic release package for publication.

## Deterministic web release archive

After the verified production build and E2E checks, the release workflow creates the web archive with normalized metadata:

- archive entries are sorted by name;
- file timestamps are normalized to the tagged commit timestamp;
- archive owner and group are normalized to numeric `0`;
- gzip filename/timestamp metadata is disabled with `gzip -n`;
- a SHA-256 checksum is generated for the final `.tar.gz`.

These controls make repeated packaging of identical `dist/` content substantially more reproducible and make accidental artifact changes easier to detect.

A deterministic archive does not prove that the build itself is reproducible if dependency resolution, toolchains, environment-sensitive transforms, or generated inputs differ. Lockfiles and pinned toolchains are therefore required parts of the same policy.

## Native release boundary

Native source support covers Windows, macOS, Linux, Android, and iOS/iPadOS through Tauri 2, but source support is not a claim of signed release artifacts.

Before publishing native binaries, release engineering must additionally verify:

- both npm and Cargo lockfiles;
- `npm run native:check` and locked Cargo resolution;
- the hosted Windows/macOS/Linux/Android/iOS Native CI matrix;
- platform signing identities and secret handling;
- macOS notarization where applicable;
- Android signing and store bundle requirements;
- iOS signing/provisioning/store requirements;
- installer/update security if an updater is introduced.

See `native-release-gates.md` for the platform release checklist.

## Release-candidate evidence

A release candidate should record the exact commit and the result of at least:

```bash
npm run release:locks:check
npm run check
npm run test:e2e
npm run native:check
```

Hosted evidence should also include the complete Native CI matrix and the tag-triggered release verification job.

A source inspection, successful file write, queued workflow, or local syntax review must not be reported as a passing hosted build.

## Current blockers that must remain explicit

Until separately completed and verified, do not mark these items as done:

- genuine `package-lock.json` generation and review for the current 2.0.13 dependency graph;
- genuine `src-tauri/Cargo.lock` generation and review for the current 2.0.13 native graph;
- clean-checkout hosted web quality/E2E evidence using the accepted npm lockfile;
- complete hosted Native CI evidence using the accepted npm and Cargo lockfiles;
- effective `main` branch protection/rulesets;
- signed/notarized/store-ready native artifacts.

The source migration to lockfile-only permanent workflows is staged in the release-preparation PR, but it must not be described as operationally proven until the real lockfiles are generated and the hosted jobs pass.
