# ChronoAge — Current Work Handoff

## Current version and milestone

ChronoAge remains source version **2.0.12** on `main`.

- Repository: `https://github.com/sanskarIN/chronoage`
- Shared product runtime: React + TypeScript + Vite
- Native delivery: Tauri 2 + Rust
- Supported source targets: Web/PWA, Windows, macOS, Linux, Android, iOS/iPadOS
- Exact Node pin used by permanent workflows: `22.13.0`
- Exact Rust pin: `1.97.1`
- Native identifier: `in.sanskar.chronoage`
- License: MIT
- Implementation checkpoint before this handoff refresh: `09b27d0ea56a8fa4c328410e7c0eeaa423dbc477`
- Current milestone: release reproducibility and evidence hardening

This file reports implemented and directly checked repository state only. It does **not** claim green hosted CI, signed installers, notarization, store publication, real dependency lockfiles, or protected-branch enforcement unless those items have separately been verified.

## Continuation completed on 2026-08-21

This continuation added **16 focused implementation/test/documentation commits** after the prior checkpoint, followed by this handoff-maintenance commit.

The work intentionally stayed on release-quality hardening because the remaining highest-value blockers are reproducibility/evidence items rather than duplicate cross-platform feature code.

## Release lockfile preflight

Added `scripts/check-lockfiles.mjs` and three package commands:

```bash
npm run release:npm-lock:check
npm run release:cargo-lock:check
npm run release:locks:check
```

The npm preflight verifies:

- `package-lock.json` exists and parses as JSON;
- lockfile format version is the expected current npm format;
- root name/version match `package.json`;
- root dependency specifications exactly match `package.json` dependencies and devDependencies.

The Cargo preflight verifies:

- `src-tauri/Cargo.lock` exists;
- Cargo's generated-file header is present;
- the lockfile uses a supported modern format;
- the native root package name/version from `src-tauri/Cargo.toml` is present.

The checker deliberately fails while a required real lockfile is absent. It does not generate, guess, or hand-author dependency state.

A CLI edge case was also fixed: `--all` can no longer mask an unknown option such as `--unknown`.

## Lockfile regression coverage

Added `tests/lockfiles.test.ts`.

Coverage includes:

- valid npm lockfile acceptance;
- missing npm lockfile rejection;
- npm root dependency drift rejection;
- valid Cargo lockfile acceptance;
- missing Cargo lockfile rejection;
- default all-lockfile checking;
- unknown target rejection;
- unknown target rejection even when combined with `--all`.

The tests execute a copied preflight script inside isolated temporary fixture repositories so the repository does not need real lockfiles merely to test the validator logic.

## Tag release dependency hardening

`.github/workflows/release.yml` now fails before dependency installation unless the npm lockfile preflight succeeds.

Release dependency installation is now:

```bash
npm ci --no-fund --no-audit
```

The tag workflow no longer falls back to `npm install`. Because a real `package-lock.json` is still absent, this means release tags fail safely rather than resolving an unpinned dependency graph.

Normal push/PR and native frontend CI still use `npm install` until the genuine npm lockfile has been generated, reviewed, and committed. That remaining migration is explicitly open.

## Deterministic web release packaging

The release archive is no longer created with one opaque `tar -czf` step.

The workflow now:

- sorts archive entries by name;
- normalizes archive timestamps to the tagged commit timestamp;
- normalizes owner/group to numeric `0`;
- creates the tar archive separately;
- compresses with `gzip -n` to remove filename/timestamp gzip metadata;
- generates the existing SHA-256 checksum after deterministic packaging.

This improves repeatability of the final web archive when `dist/` content is identical.

## Static release workflow policy gate

Added `scripts/check-release-workflow.mjs` and:

```bash
npm run release:workflow:check
```

The command is now part of `npm run check`.

It prevents accidental removal/reordering of release safeguards by checking for:

- npm lockfile preflight;
- `npm ci` release installation;
- absence of release `npm install` fallback;
- deterministic tar ordering/timestamp/ownership flags;
- explicit `gzip -n`;
- SHA-256 checksum generation;
- verified-tag release creation;
- verify-before-publish job ordering/dependency.

The existing metadata checker also enforces the release npm lockfile gate, `npm ci`, release script identities, Cargo monitoring, and Native CI lockfile-trigger behavior.

## Native CI lockfile trigger

`.github/workflows/native.yml` now explicitly reruns when `package-lock.json` changes because every native target consumes the shared frontend dependency graph.

`src-tauri/**` was already part of the path filter, so a future real `src-tauri/Cargo.lock` automatically triggers Native CI as well.

Native builds intentionally have **not** been changed to Cargo `--locked` yet because the genuine Cargo lockfile is still absent.

## Documentation corrections and additions

Added:

- `docs/reproducible-builds.md` — real npm/Cargo lockfile generation/review, preflight commands, `npm ci`, Cargo `--locked`, deterministic web packaging, native release boundary, and release-candidate evidence.

Updated:

- `docs/development.md` — lockfile commands and reproducible-build guide link;
- `docs/native-quality.md` — current release lockfile gate, future push/PR/native `npm ci` migration, future Cargo `--locked` migration, and Native CI lockfile trigger behavior;
- `SECURITY.md` — replaced the stale “future native wrapper” security section with the actually implemented Tauri 2 desktop/mobile capability/runtime boundary;
- `CHANGELOG.md` — recorded lockfile preflight, release policy checking, deterministic packaging, native lockfile triggers, documentation correction, and the remaining migration plan;
- `what_changed.md` — this handoff.

## Changed files/modules in this continuation

- `scripts/check-lockfiles.mjs`
- `scripts/check-release-workflow.mjs`
- `scripts/check-metadata.mjs`
- `tests/lockfiles.test.ts`
- `package.json`
- `.github/workflows/release.yml`
- `.github/workflows/native.yml`
- `docs/reproducible-builds.md`
- `docs/development.md`
- `docs/native-quality.md`
- `SECURITY.md`
- `CHANGELOG.md`
- `what_changed.md`

## Verification performed

### Repository verification

Verified through GitHub after the implementation commits:

- all repository writes succeeded on `main`;
- `main` pointed at `09b27d0ea56a8fa4c328410e7c0eeaa423dbc477` before this handoff refresh;
- the latest implementation commit was authored/committed with `sanskarin@outlook.in`;
- `main` is still reported as `protected: false`;
- required status-check enforcement is still reported as off;
- combined commit status for the implementation checkpoint returned no statuses through the available status API.

The available connected GitHub surface still does not provide an action here to configure branch protection/rulesets.

### Local static/synthetic verification

The execution environment could not resolve `github.com` for a clean clone and therefore could not perform real registry-backed npm/Cargo dependency resolution. No fake lockfile was committed.

Independent local checks were still run for the new dependency-free release tooling:

1. `node --check` succeeded for `scripts/check-release-workflow.mjs` in an isolated fixture.
2. Executing that policy checker against the current release workflow fixture succeeded with:

   `Release workflow preserves lockfile-only installation, deterministic packaging, checksum generation, and verify-before-publish policy.`

3. `node --check` succeeded for `scripts/check-lockfiles.mjs` in an isolated fixture.
4. Running the lockfile checker with `--all --unknown` returned exit code `2` and the expected unknown-target error.
5. Running the lockfile checker against valid synthetic npm and Cargo fixture lockfiles succeeded for both targets.

Synthetic fixtures were used only to exercise validation logic. They are not dependency-resolution evidence and were not committed as project lockfiles.

### Not claimed

This continuation does **not** claim that:

- the current hosted CI run is green;
- the hosted Native CI matrix is green;
- `npm test`, `npm run check`, or Playwright completed in a genuine dependency-installed clean checkout during this execution;
- a real npm lockfile exists;
- a real Cargo lockfile exists;
- branch protection is enabled;
- commits are cryptographically signed;
- signed/notarized/store-ready artifacts exist.

## Known limitations and open release blockers

### 1. Real npm lockfile

`package-lock.json` is still absent.

Generate it only from successful npm resolution with the pinned Node toolchain, review it, run `npm run release:npm-lock:check`, prove `npm ci` works from a clean dependency directory, and commit the generated file.

Do **not** hand-author it.

### 2. Remaining npm CI migration

The tag release workflow is already lockfile-gated and uses `npm ci`.

Permanent push/PR CI and Native CI frontend installation still use `npm install`. Migrate those to `npm ci` only after the genuine npm lockfile is committed and verified.

### 3. Real Cargo lockfile

`src-tauri/Cargo.lock` is still absent and was rechecked during this continuation.

Generate it with the pinned Rust/Cargo toolchain, review it, run `npm run release:cargo-lock:check`, then use Cargo `--locked` in release/native verification where resolution drift must be forbidden.

Do **not** hand-author it.

### 4. Hosted release-candidate evidence

A real network-enabled clean checkout still needs recorded passing evidence for:

```bash
npm run release:locks:check
npm run check
npm run test:e2e
npm run native:check
```

and the complete hosted Native CI matrix.

### 5. Protect `main`

GitHub still reports `main` as unprotected and required status-check enforcement as off. Configure an effective ruleset/branch protection policy that requires the project release-quality checks and prevents accidental force-push/deletion/release-breaking direct changes.

### 6. Signed platform artifacts

Complete Windows/macOS/Linux packaging validation, macOS notarization where applicable, Android signing/store bundle requirements, and iOS provisioning/signing/store requirements only when release accounts and credentials are available.

## Exact next continuation tasks

1. In a network-enabled clean checkout using Node `22.13.0`, generate the real `package-lock.json` with npm and review the full dependency/integrity diff.
2. Run `npm run release:npm-lock:check`, delete/recreate dependencies with `npm ci`, then run `npm run check` and `npm run test:e2e`.
3. Commit the real npm lockfile.
4. Migrate push/PR CI and Native CI frontend installs from `npm install` to `npm ci`, then enforce that migration with static policy checks.
5. With Rust `1.97.1`, generate and review `src-tauri/Cargo.lock` using real Cargo resolution.
6. Run `npm run release:cargo-lock:check`, add locked Cargo verification, and run the full Native CI matrix.
7. Record hosted release-candidate evidence for the exact commit.
8. Enable and verify effective `main` branch protection/rulesets.
9. Proceed to signing/notarization/store artifacts only after the reproducibility/evidence gates above are green.

## Migration notes

There is no runtime/user-data migration in this continuation.

Release-engineering behavior changed:

- release tags now require a valid npm lockfile before dependency installation;
- release tags install with `npm ci`;
- the final web archive is packaged with normalized deterministic metadata;
- `npm run check` now includes the static release-workflow policy checker;
- Native CI reacts to future npm lockfile changes.

Contributors preparing a release should read `docs/reproducible-builds.md` before creating a tag.

## Release-notes draft

- Added explicit npm/Cargo lockfile preflight tooling and regression coverage.
- Hardened tag releases to require the npm lockfile and install through `npm ci`.
- Made web release archives deterministic and retained SHA-256 verification.
- Added a static release-workflow policy gate to the normal quality suite.
- Corrected native security documentation to the implemented Tauri 2 architecture.
- Added complete reproducible-build and lockfile generation/review documentation.

## Focused commits in this continuation

1. `64ba45dc` — `build(release): add lockfile reproducibility preflight`
2. `74c55086` — `build(release): expose lockfile preflight commands`
3. `c3852d36` — `ci(release): require npm lockfile and use npm ci`
4. `0317b2eb` — `ci(native): trigger verification on lockfile changes`
5. `938980a6` — `test(release): cover lockfile reproducibility preflight`
6. `867dd138` — `test(metadata): enforce release reproducibility safeguards`
7. `3cdc4e88` — `ci(release): make web archive deterministic`
8. `de5e32fc` — `docs(security): correct implemented native security boundary`
9. `d7178588` — `docs(release): add reproducible build and lockfile guide`
10. `c81e90b7` — `docs(dev): link reproducible release workflow`
11. `33f5fa45` — `docs(native): align lockfile policy with release gate`
12. `bf40edb2` — `test(release): add static release workflow policy check`
13. `c9394913` — `build(check): enforce release workflow policy`
14. `e41959b1` — `fix(release): reject unknown lockfile flags with all target`
15. `ac382f82` — `test(release): cover all-target unknown flag rejection`
16. `09b27d0e` — `docs(changelog): record release reproducibility hardening`

The handoff-maintenance commit comes after the implementation checkpoint and is intentionally not self-referenced by SHA inside this file.
