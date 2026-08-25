# Reproducible Builds and Lockfiles

ChronoAge treats dependency resolution and release packaging as part of the product's correctness boundary. A source commit should not silently resolve different dependency graphs or produce materially different release archives simply because it is built later.

This guide documents the repository policy for npm, Cargo, release archives, and release-candidate evidence.

## Current source state

The repository pins:

- Node through `.nvmrc` at `22.13.0`;
- the native Rust toolchain through `rust-toolchain.toml` at `1.97.1`;
- direct npm dependency versions in `package.json`;
- direct Tauri Rust dependencies in `src-tauri/Cargo.toml` with exact `=MAJOR.MINOR.PATCH` requirements.

Those pins reduce drift, but they do not replace dependency lockfiles.

At the current checkpoint, a real `package-lock.json` and a real `src-tauri/Cargo.lock` still need to be generated from successful dependency resolution. Do not hand-author either lockfile.

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
cargo check --manifest-path src-tauri/Cargo.toml --locked
npm run native:format:check
npm run native:lint
```

Before committing the lockfile:

1. Confirm `rustup show active-toolchain` resolves to the exact channel in `rust-toolchain.toml`.
2. Review new or changed crates, sources, checksums, and versions.
3. Confirm the root `chronoage` package entry matches the native package version.
4. Run the Cargo lockfile preflight.
5. Run Cargo with `--locked` so the build fails rather than silently changing resolution.
6. Run the complete Native CI matrix after the lockfile is committed.

Do not manually synthesize or guess `Cargo.lock` content.

## Release workflow behavior

The tag-triggered web release workflow deliberately fails before dependency installation when `package-lock.json` is missing or inconsistent.

Once the npm lockfile passes preflight, the release workflow installs dependencies with:

```bash
npm ci --no-fund --no-audit
```

The release workflow does not fall back to `npm install`. This prevents a release tag from silently resolving a new graph when the required lockfile is absent.

Normal push/PR CI still uses `npm install` until the real npm lockfile has been generated, reviewed, and committed. After that checkpoint, permanent CI/native frontend installs should be migrated to `npm ci` as a separate reviewed change.

## Deterministic web release archive

After the verified production build and E2E checks, the release workflow creates the web archive with normalized metadata:

- archive entries are sorted by name;
- file timestamps are normalized to the tagged commit timestamp;
- archive owner and group are normalized to numeric `0`;
- gzip filename/timestamp metadata is disabled with `gzip -n`;
- a SHA-256 checksum is generated for the final `.tar.gz`.

These controls make repeated packaging of identical `dist/` content substantially more reproducible and make accidental artifact changes easier to detect.

A deterministic archive does not prove that the build itself is reproducible if dependency resolution, toolchains, environment-sensitive transforms, or generated inputs differ. Lockfiles and pinned toolchains are therefore required parts of the same policy.

## Release evidence manifest

Each verified web release now generates a deterministic JSON evidence manifest beside the archive and checksum.

The generator is exposed as:

```bash
npm run release:manifest -- \
  --archive chronoage-web-vX.Y.Z.tar.gz \
  --checksum chronoage-web-vX.Y.Z.tar.gz.sha256 \
  --output chronoage-web-vX.Y.Z.manifest.json
```

For tag workflows, release identity is taken from `GITHUB_REF_NAME`, `GITHUB_SHA`, and the commit-derived `SOURCE_DATE_EPOCH`. The generator refuses to write evidence unless:

- the tag exactly matches `v${package.json.version}`;
- the commit identity is a full 40-character Git SHA;
- `SOURCE_DATE_EPOCH` is a positive integer;
- the checksum file names the archive being packaged;
- the checksum digest exactly matches a fresh SHA-256 hash of the archive.

The manifest records:

- schema version;
- package name and version;
- semantic release tag;
- exact source commit;
- normalized source-date epoch;
- pinned Node runtime observed during generation;
- archive filename, byte size, and SHA-256 digest;
- SHA-256 digests for `package-lock.json` and `src-tauri/Cargo.lock` when those generated lockfiles exist.

The publish job then verifies the downloaded archive again with `sha256sum --check` before creating the GitHub Release. The archive, checksum, and evidence manifest are attached together. This closes the gap between verification-job packaging and publish-job release creation without claiming cryptographic signing or provenance attestation that has not been configured.

## Native release boundary

Native source support currently covers Windows, macOS, Linux, Android, and iOS/iPadOS through Tauri 2, but source support is not a claim of signed release artifacts.

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

Hosted evidence should also include the complete Native CI matrix and the tag-triggered release verification job. For a published web release, retain the generated `.manifest.json` with its sibling archive and checksum so the released commit/artifact identity remains machine-readable.

A source inspection, successful file write, or local syntax review must not be reported as a passing hosted build.

## Current blockers that must remain explicit

Until separately completed and verified, do not mark these items as done:

- genuine `package-lock.json` generation and review;
- genuine `src-tauri/Cargo.lock` generation and review;
- migration of permanent push/PR/native frontend installs to `npm ci`;
- clean-checkout hosted release-candidate evidence;
- effective `main` branch protection/rulesets;
- signed/notarized/store-ready native artifacts.
