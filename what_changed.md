# ChronoAge — Current Work Handoff

## Current version and release-preparation state

ChronoAge is being prepared as **2.0.13** on branch `release/v2.0.13-prep` in open PR **#21**.

- Repository: `https://github.com/sanskarIN/chronoage`
- Base branch: `main`
- Base checkpoint: `b69a88904d3c324662b662fad7c1c19bd026643c`
- Release-preparation implementation checkpoint before this handoff refresh: `8f2c919e392e8121da54f11b8e889574bb0a4c5b`
- Source/runtime/native version: `2.0.13`
- Shared product runtime: React + TypeScript + Vite
- Native delivery: Tauri 2 + Rust
- Supported source targets: Web/PWA, Windows, macOS, Linux, Android, iOS/iPadOS
- Exact Node pin used by permanent workflows: `22.13.0`
- Exact Rust pin: `1.97.1`
- Native identifier: `in.sanskar.chronoage`
- License: MIT

This handoff reports implemented repository state and directly observed workflow state only. It does **not** claim green hosted CI, reviewed real dependency lockfiles, a published `v2.0.13` release, signed installers, notarization, store publication, or effective `main` branch protection unless those items are separately verified.

## Continuation completed on 2026-08-24

This continuation created a dedicated release-preparation branch and PR instead of making a release-breaking dependency migration directly on `main`.

PR #21 is intentionally not merged yet. The permanent CI/native changes now fail closed when required lockfiles are absent, so merging before genuine registry-generated lockfiles exist would break verification on `main`.

## 2.0.13 release identity preparation

The following release identity was advanced from 2.0.12 to 2.0.13:

- `package.json`
- `src/config/project.ts`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `public/sw.js` cache generation
- `README.md` version badge/current-version/release link/release-check example
- `ROADMAP.md` current release-candidate heading
- `CHANGELOG.md`
- `docs/releases/2.0.13.md`

The runtime, package, native crate, Tauri bundle, and PWA cache versions are therefore aligned for the release candidate.

## Genuine lockfile bootstrap workflow

Added `.github/workflows/dependency-lock-bootstrap.yml` to the release-preparation PR.

The bootstrap is deliberately limited to same-repository pull requests and uses GitHub-hosted infrastructure so dependency state comes from real registry resolution rather than hand-authored content.

It is designed to:

1. check out the pull-request branch;
2. use Node `22.13.0`;
3. generate `package-lock.json` through npm registry resolution;
4. validate it with `npm run release:npm-lock:check`;
5. prove `npm ci --ignore-scripts --no-fund --no-audit` can consume it;
6. install/use Rust `1.97.1` with `clippy` and `rustfmt`;
7. generate `src-tauri/Cargo.lock` through Cargo registry resolution;
8. validate it with `npm run release:cargo-lock:check`;
9. prove Cargo can read the graph with `--locked`;
10. commit only the generated lockfiles back to the PR branch using `sanskarin@outlook.in`.

The bootstrap workflow no longer has a concurrency cancellation rule, because repeated release-preparation commits had caused earlier queued bootstrap attempts to be cancelled before execution.

### Current hosted bootstrap evidence

At the latest direct check during this continuation, bootstrap workflow run `32732374771` remained **queued**.

A queued workflow is not passing evidence. Therefore this handoff does **not** claim that `package-lock.json` or `src-tauri/Cargo.lock` has been generated or reviewed.

## Permanent npm CI migration staged

`.github/workflows/ci.yml` is staged to use:

```bash
npm ci --no-fund --no-audit
```

for both:

- the format/lint/types/tests/build quality job;
- the Playwright E2E job.

`.github/workflows/native.yml` is staged to use the same lockfile-only npm install for:

- Windows/macOS/Linux desktop jobs;
- Android smoke build;
- iOS simulator smoke build.

This migration is source-complete on the release-preparation branch but is not yet operationally proven because the real npm lockfile is still evidence-gated.

## Locked Cargo verification staged

Added package command:

```bash
npm run native:lock:check
```

which executes Cargo metadata with `--locked`.

Native quality commands were hardened so:

- `native:lint` uses `cargo clippy --locked`;
- `native:check` runs the Cargo lockfile preflight;
- `native:check` verifies locked Cargo metadata;
- `native:check` runs `cargo check --locked`;
- every Native CI job verifies the Cargo lockfile and locked Cargo metadata before platform-specific build work.

This is also fail-closed: the jobs are expected to fail if a genuine `src-tauri/Cargo.lock` is absent or stale.

## CI reproducibility regression gate

Added `scripts/check-ci-reproducibility.mjs` and package command:

```bash
npm run ci:reproducibility:check
```

The command is included in `npm run check`.

It prevents accidental regression by enforcing:

- no `npm install` dependency step in permanent CI, Native CI, or release verification;
- at least two lockfile-only npm installs in normal CI;
- at least three lockfile-only npm installs in Native CI;
- lockfile-only installation in release verification;
- Cargo lockfile preflight in every Native CI target;
- locked Cargo metadata verification in every Native CI target;
- exact identity of the `native:lock:check` package command;
- `--locked` Clippy behavior;
- Cargo lockfile/metadata/locked-check behavior in `native:check`.

Added `tests/ciReproducibility.test.ts` covering:

- acceptance of the correct locked workflow shape;
- rejection of `npm install` in permanent CI;
- rejection of native lint without Cargo `--locked`;
- rejection when Native CI loses locked Cargo metadata checks.

A dependency-free local fixture run also confirmed the policy script parses and accepts a valid synthetic permanent-workflow shape. This is static/synthetic evidence only, not hosted project CI evidence.

## Complete release dependency gate

The tag-triggered release workflow was hardened from npm-only preflight to:

```bash
npm run release:locks:check
npm ci --no-fund --no-audit
```

This means a 2.0.13 tag must contain consistent npm **and** Cargo dependency lockfiles before release verification can proceed.

`scripts/check-release-workflow.mjs` and `scripts/check-metadata.mjs` were updated to enforce the complete lockfile gate and its ordering before `npm ci`.

The existing deterministic archive, SHA-256 checksum, verify-before-publish ordering, and verified-tag release safeguards remain intact.

## Documentation aligned with the new policy

Added/updated:

- `docs/releases/2.0.13.md` — release-candidate status, highlights, compatibility, reproducibility boundary, quality/security gates, and publication blockers;
- `docs/development.md` — `ci:reproducibility:check`, `native:lock:check`, locked native commands, and fail-closed CI behavior;
- `docs/native-quality.md` — 2.0.13 `npm ci`/Cargo locked matrix behavior and evidence boundary;
- `docs/reproducible-builds.md` — staged permanent lockfile-only CI, complete tag lockfile gate, generation/review procedure, and explicit blockers;
- `README.md` — 2.0.13 source identity and release note link;
- `ROADMAP.md` — 2.0.13 release-candidate identity while retaining evidence-gated unchecked items;
- `CHANGELOG.md` — 2.0.13 release-candidate section.

## Verification performed in this continuation

### GitHub repository verification

Directly verified through the connected GitHub repository surface:

- `release/v2.0.13-prep` was created from the current `main` checkpoint;
- PR #21 was opened against `main`;
- PR #21 is open and GitHub reports it as mergeable at the last checked state;
- before this handoff refresh the PR contained 24 focused commits and 20 changed files;
- the implementation checkpoint before this handoff was `8f2c919e392e8121da54f11b8e889574bb0a4c5b`;
- bootstrap, CI, Native CI, CodeQL, and Dependency Review workflows were created/queued for the PR as applicable.

### Local dependency-free verification

The execution environment still cannot resolve `github.com`, so it cannot perform genuine npm/Cargo registry resolution or a clean dependency-installed project build locally.

A local isolated fixture was used only to validate the new dependency-free CI reproducibility policy logic:

- `node --check` succeeded for `scripts/check-ci-reproducibility.mjs`;
- a valid synthetic CI/native/release fixture passed the policy gate.

No synthetic lockfile was committed to the repository.

### Not claimed

This continuation does **not** claim that:

- hosted CI is green for the current PR head;
- the complete Native CI matrix is green;
- the dependency-lock bootstrap has completed;
- a real `package-lock.json` exists;
- a real `src-tauri/Cargo.lock` exists;
- registry-generated lockfile dependency graphs have been reviewed;
- `npm ci` has passed against the final repository lockfile in hosted CI;
- Cargo locked verification has passed against the final repository lockfile in hosted CI;
- PR #21 is safe to merge yet;
- `main` branch protection/rulesets are enabled;
- commits are cryptographically signed;
- signed/notarized/store-ready artifacts exist;
- a `v2.0.13` GitHub Release has been published.

## Remaining release blockers

### 1. Finish genuine npm lockfile generation and review

Wait for a GitHub-hosted bootstrap execution to produce the registry-generated `package-lock.json`, then review:

- root package version/dependency identity;
- resolved package versions;
- registry URLs;
- integrity fields;
- unexpected transitive additions;
- lifecycle-sensitive packages.

Then require passing `npm run release:npm-lock:check` and clean `npm ci` evidence.

### 2. Finish genuine Cargo lockfile generation and review

Review the generated `src-tauri/Cargo.lock` for:

- generated-file identity;
- root package version;
- crate sources/checksums;
- unexpected transitive crates/version changes.

Then require passing `npm run release:cargo-lock:check`, `native:lock:check`, locked Cargo checks, and Native CI.

### 3. Record complete hosted release-candidate evidence

For the exact accepted PR commit, require passing evidence for at least:

```bash
npm run release:locks:check
npm run check
npm run test:e2e
npm run native:check
```

plus the complete hosted Native CI matrix, CodeQL, and dependency review.

### 4. Remove the bootstrap workflow before merge

`.github/workflows/dependency-lock-bootstrap.yml` is a release-preparation mechanism that can write generated lockfiles back to the same PR branch.

After the genuine lockfiles are committed and reviewed, remove this temporary bootstrap workflow before merging the release-preparation PR so normal future pull requests do not contain an automatic dependency-state writeback mechanism.

### 5. Update documentation after evidence changes

Once the real lockfiles and passing hosted checks exist:

- mark only the proven lockfile/migration roadmap items complete;
- change README installation examples to prefer `npm ci` where appropriate;
- update the 2.0.13 changelog/release notes from staged migration wording to accepted dependency-state wording;
- record exact passing hosted workflow evidence in this handoff.

### 6. Protect `main`

Enable and verify the documented GitHub branch protection/ruleset after release checks are stable. Do not mark it complete until GitHub reports an effective policy.

### 7. Signing/notarization/store publication

Complete Windows/macOS/Linux packaging validation, macOS notarization where applicable, Android signing/Play bundle requirements, and iOS provisioning/signing/store requirements only when platform credentials and release accounts are configured.

## Migration notes

There is no user-data/runtime storage migration in this continuation.

Release-engineering behavior on the 2.0.13 preparation branch changed materially:

- permanent web/native verification now expects `npm ci`;
- native verification expects a genuine Cargo lockfile and locked Cargo resolution;
- release tags require both npm and Cargo lockfile preflight success;
- a static CI reproducibility policy prevents permanent workflow regression;
- the release branch intentionally fails closed until real registry-generated lockfiles are accepted.

## Exact next continuation tasks

1. Recheck GitHub-hosted bootstrap run status and inspect logs if it starts/fails.
2. If generated lockfiles appear, review both complete dependency graphs and verify the bootstrap commit identity.
3. Remove `.github/workflows/dependency-lock-bootstrap.yml` after successful generation/review.
4. Run/observe complete CI, E2E, CodeQL, dependency review, and Native CI for the exact final PR head.
5. Fix any failures found by the reproducible install/locked native matrix.
6. Update README, ROADMAP, CHANGELOG, release notes, and this handoff with only verified completion claims.
7. Merge PR #21 only after the lockfile-dependent quality gates are green.
8. Verify `main` after merge, then prepare/publish `v2.0.13` only when the tag release gate is green.
9. Continue with branch protection and signed platform artifacts as separate evidence-backed release tasks.

The handoff-maintenance commit comes after the implementation checkpoint and is intentionally not self-referenced by SHA inside this file.
