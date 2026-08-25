# ChronoAge — Current Work Handoff

## Current version and milestone

ChronoAge is now source version **2.0.13** on `main`.

- Repository: `https://github.com/sanskarIN/chronoage`
- Shared product runtime: React + TypeScript + Vite
- Native delivery: Tauri 2 + Rust
- Supported source targets: Web/PWA, Windows, macOS, Linux, Android, iOS/iPadOS
- Exact Node release/runtime pin: `22.13.0`
- Exact Rust pin: `1.97.1`
- Native identifier: `in.sanskar.chronoage`
- License: MIT
- Implementation checkpoint before this handoff refresh: `dbed34229d2242f09e0de150a361999c52148ec2`
- Current milestone: `2.0.13` release-evidence hardening and next-version preparation

This file reports implemented and directly checked repository state only. It does **not** claim green hosted CI, a published `v2.0.13` release, signed installers, notarization, store publication, real dependency lockfiles, cryptographically signed commits, or protected-branch enforcement unless those items have separately been verified.

## Continuation completed on 2026-08-25

This continuation added **19 focused implementation/test/documentation commits** after the previous handoff, followed by this handoff-maintenance commit.

The highest-value remaining work is still release reproducibility/evidence rather than duplicating already shared cross-platform feature code. Because this execution environment cannot perform the required real npm/Cargo dependency resolution, no lockfile was fabricated. Instead, the release evidence chain was strengthened and source version `2.0.13` was prepared consistently.

## Deterministic release evidence manifest

Added `scripts/generate-release-manifest.mjs` and the package command:

```bash
npm run release:manifest
```

The generator consumes the verified release archive/checksum and refuses to emit evidence unless:

- the running Node version exactly matches `.nvmrc`;
- the release tag exactly matches `v${package.json.version}`;
- the supplied source commit is a full 40-character Git SHA;
- `SOURCE_DATE_EPOCH` is a positive integer;
- the checksum file contains exactly one valid `sha256sum`-compatible entry;
- the checksum entry names the release archive being packaged;
- a fresh SHA-256 digest of the archive matches the checksum entry.

The generated JSON manifest records:

- evidence schema version;
- package name and source version;
- semantic release tag;
- exact source commit;
- commit-derived source-date epoch;
- exact Node runtime used to generate evidence;
- archive filename, byte size, and SHA-256 digest;
- SHA-256 hashes for `package-lock.json` and `src-tauri/Cargo.lock` when those genuine generated lockfiles exist.

The manifest intentionally does not claim signing, notarization, SLSA provenance, or store certification.

## Release publish-chain integrity

`.github/workflows/release.yml` now carries release identity/integrity evidence from verification into publication.

The workflow now:

1. verifies the npm lockfile preflight before dependency installation;
2. installs through `npm ci --no-fund --no-audit` with no release `npm install` fallback;
3. runs release identity/quality/browser verification;
4. creates the deterministic tar/gzip archive with normalized ordering, timestamps, owner/group, and gzip metadata;
5. exports the tagged commit timestamp as `SOURCE_DATE_EPOCH`;
6. generates the SHA-256 checksum;
7. generates `chronoage-web-${GITHUB_REF_NAME}.manifest.json` from the archive/checksum/source identity;
8. stages the archive, checksum, and manifest together;
9. downloads the verified package in the publish job;
10. executes `sha256sum --check` again after download and before release creation;
11. attaches the archive, checksum, and manifest together to the GitHub Release.

For `v2.0.13`, the expected sibling release files are:

```text
chronoage-web-v2.0.13.tar.gz
chronoage-web-v2.0.13.tar.gz.sha256
chronoage-web-v2.0.13.manifest.json
```

A release tag still fails safely while the genuine npm lockfile is absent.

## Release policy enforcement and regression coverage

`scripts/check-release-workflow.mjs` was expanded so repository checks reject release-workflow drift that removes or redirects the new safeguards.

It now enforces, among the existing release requirements:

- the exact package script identity `release:manifest = node scripts/generate-release-manifest.mjs`;
- npm lockfile preflight before `npm ci`;
- absence of release `npm install` fallback;
- deterministic archive metadata controls;
- `SOURCE_DATE_EPOCH` export before manifest generation;
- checksum generation before manifest generation;
- release evidence manifest generation/staging;
- publish-time checksum verification after artifact download and before `gh release create`;
- evidence-manifest attachment to GitHub Release creation;
- verify-before-publish workflow ordering/dependency.

Added `tests/releaseWorkflow.test.ts` to cover:

- acceptance of the current repository workflow;
- rejection of a redirected canonical evidence-generator package command;
- rejection when publish-time checksum verification is removed;
- rejection when release evidence generation is removed;
- rejection when the GitHub Release omits its evidence manifest.

Added and expanded `tests/releaseManifest.test.ts` to cover:

- deterministic evidence identity/content;
- optional dependency-lock hashes;
- exact Node-pin enforcement;
- archive/checksum mismatch rejection;
- release-tag/version drift rejection;
- abbreviated/invalid commit rejection;
- unknown CLI option rejection.

## Version 2.0.13 preparation

Source release identity was advanced from `2.0.12` to `2.0.13` in one atomic metadata commit across:

- `package.json`;
- `src/config/project.ts`;
- `src-tauri/Cargo.toml`;
- `src-tauri/tauri.conf.json`;
- `public/sw.js` cache generation.

The atomic commit avoids leaving `main` in a half-versioned state.

Release documentation was then aligned:

- created `docs/releases/2.0.13.md`;
- added the `2.0.13` release section to `CHANGELOG.md`;
- advanced `ROADMAP.md` to `v2.0.13`;
- updated `README.md` badge/current-version/release-note/tag examples and release-evidence description;
- corrected `docs/release.md` from its stale `2.0.12`/old install-flow text to the current lockfile-gated `npm ci`, deterministic packaging, evidence manifest, and publish checksum flow;
- expanded `docs/reproducible-builds.md` with the evidence-manifest contract and exact-Node requirement.

There is no runtime or user-data schema migration in `2.0.13`; this release-preparation work is release-engineering/documentation hardening.

## Changed files/modules in this continuation

- `scripts/generate-release-manifest.mjs`
- `scripts/check-release-workflow.mjs`
- `tests/releaseManifest.test.ts`
- `tests/releaseWorkflow.test.ts`
- `.github/workflows/release.yml`
- `package.json`
- `src/config/project.ts`
- `src-tauri/Cargo.toml`
- `src-tauri/tauri.conf.json`
- `public/sw.js`
- `docs/releases/2.0.13.md`
- `docs/reproducible-builds.md`
- `docs/release.md`
- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`

## Verification performed

### GitHub repository verification

Direct GitHub checks after the implementation commits confirmed:

- all repository writes succeeded on `main`;
- `main` pointed at implementation checkpoint `dbed34229d2242f09e0de150a361999c52148ec2` before this handoff refresh;
- the implementation checkpoint was authored/committed as `Sanskar <sanskarin@outlook.in>`;
- GitHub reports that commit as unsigned (`verified: false`, reason `unsigned`);
- `main` remains `protected: false`;
- required status-check enforcement remains off;
- the combined-status API returned no statuses for the implementation checkpoint;
- the available commit workflow-run lookup returned no workflow runs for the implementation checkpoint;
- direct repository lookup confirms `package-lock.json` is absent;
- direct repository lookup confirms `src-tauri/Cargo.lock` is absent.

An empty status/workflow-run response is **not** treated as passing CI evidence.

### Local dependency-free/synthetic verification

The execution environment still cannot resolve `github.com` for a clean clone and therefore could not perform real registry-backed npm/Cargo dependency resolution. The local Node available during synthetic validation was `v22.16.0`, not the repository's release pin `v22.13.0`.

No fake dependency lockfile was committed.

Dependency-free validation of the final release-evidence generator was still performed in an isolated synthetic fixture:

1. `node --check` succeeded for the generator source.
2. With a fixture `.nvmrc` matching the executing Node, package version `2.0.13`, valid archive/checksum, full commit SHA, and source-date epoch, manifest generation succeeded and emitted the expected release/artifact evidence.
3. Changing the fixture `.nvmrc` to `0.0.1` caused generation to fail with the expected exact-Node error.

Earlier dependency-free validation in this work stream also exercised the lockfile/release policy tooling with synthetic fixtures. Synthetic fixtures validate checker logic only; they do not constitute dependency-resolution, installed-project, native-build, or hosted-CI evidence.

### Not claimed

This continuation does **not** claim that:

- `npm test`, `npm run check`, Playwright, or `npm run native:check` passed in a genuine dependency-installed clean checkout during this execution;
- the current hosted CI/Native CI matrix is green;
- `v2.0.13` has been tagged or published;
- a genuine npm lockfile exists;
- a genuine Cargo lockfile exists;
- permanent push/PR/native frontend workflows already use `npm ci`;
- Cargo is already forced to `--locked` everywhere it should be;
- branch protection/rulesets are enabled;
- commits are cryptographically signed;
- signed/notarized/store-ready native artifacts exist.

## Known limitations and open release blockers

### 1. Real npm lockfile

`package-lock.json` is still absent.

Generate it only from a successful npm resolution in a network-enabled clean checkout using Node `22.13.0`. Review dependency/integrity/source changes, run `npm run release:npm-lock:check`, remove/reconstruct dependencies with `npm ci --no-fund --no-audit`, run the full quality/E2E gates, then commit the generated lockfile.

Do **not** hand-author or guess it.

### 2. Remaining npm CI migration

The tag release workflow is already lockfile-gated and uses `npm ci`.

Permanent push/PR CI and Native CI frontend installation still use `npm install`. After the real npm lockfile is accepted, migrate those workflows to `npm ci` and expand static policy checks so regressions fail automatically.

### 3. Real Cargo lockfile and locked native resolution

`src-tauri/Cargo.lock` is still absent.

Generate it with the pinned Rust `1.97.1` toolchain using real Cargo resolution, review crates/sources/checksums/versions, run `npm run release:cargo-lock:check`, then use Cargo `--locked` in release/native verification where dependency drift must be forbidden.

Do **not** hand-author or guess it.

### 4. Hosted release-candidate evidence

A real network-enabled clean checkout still needs recorded passing evidence for:

```bash
npm run release:locks:check
npm run check
npm run test:e2e
npm run native:check
```

and the complete hosted Native CI Windows/macOS/Linux/Android/iOS matrix.

### 5. Protect `main`

GitHub still reports `main` as unprotected with required status-check enforcement off. Configure and verify the documented effective ruleset/branch-protection policy before treating release governance as complete.

### 6. Signed platform artifacts

Windows/macOS/Linux installer validation, Windows/macOS signing, macOS notarization where applicable, Android release signing/store bundle requirements, and iOS provisioning/signing/store requirements remain credential/account-dependent work.

## Exact next continuation tasks

1. Use a network-enabled clean checkout and exact Node `22.13.0` to generate/review the real `package-lock.json`.
2. Run `npm run release:npm-lock:check`, clean `npm ci`, `npm run check`, and `npm run test:e2e`; commit the genuine npm lockfile only after those checks are clean.
3. Migrate permanent push/PR CI and Native CI frontend dependency installation from `npm install` to `npm ci`, then enforce that policy statically and with regression tests.
4. With exact Rust `1.97.1`, generate/review `src-tauri/Cargo.lock`, run `npm run release:cargo-lock:check`, introduce required Cargo `--locked` verification, and run native quality checks.
5. Record a completely green hosted web/Native CI release-candidate matrix for the exact candidate commit.
6. Configure and verify effective `main` protection/rulesets with required checks and force-push/deletion protection.
7. Only after reproducibility/evidence gates are green, prepare platform signing/notarization/store artifacts and, when appropriate, create the `v2.0.13` release.

## Migration notes

No user-data migration is required.

Release-engineering behavior changed in `2.0.13` preparation:

- release evidence generation is now a first-class package command;
- evidence generation is pinned to the exact `.nvmrc` Node runtime;
- the release manifest binds the package/tag/full commit/source date to the archive digest;
- tag verification exports commit-derived `SOURCE_DATE_EPOCH` into evidence;
- the archive checksum is verified both before evidence generation and again after workflow-artifact download;
- GitHub Releases are configured to carry the archive, checksum, and evidence manifest together;
- static release policy and tests protect the evidence chain from accidental workflow/script drift;
- package/runtime/native/PWA release metadata now consistently reports `2.0.13`.

Contributors preparing a release should read `docs/release.md`, `docs/reproducible-builds.md`, and `docs/releases/2.0.13.md` before creating a tag.

## Release-notes draft

- Prepared ChronoAge source version `2.0.13` across web, runtime, Tauri, Cargo, and PWA metadata.
- Added deterministic machine-readable web release evidence tied to the exact tag, source commit, source-date epoch, pinned Node runtime, archive size, and SHA-256 digest.
- Added optional evidence hashes for genuine npm/Cargo lockfiles when they exist.
- Added publish-time SHA-256 re-verification after workflow artifact transfer.
- Published release workflow policy/tests that reject removal or redirection of the evidence chain.
- Updated README, roadmap, changelog, release guide, reproducible-build documentation, and `2.0.13` release notes while keeping unresolved lockfile/CI/protection/signing gates explicit.

## Focused commits in this continuation

1. `ae260b45` — `build(release): add deterministic evidence manifest generator`
2. `dd3eaeab` — `test(release): cover deterministic evidence manifest generation`
3. `f4641f15` — `build(release): expose release evidence manifest command`
4. `a01c5430` — `ci(release): publish deterministic release evidence manifest`
5. `12c79126` — `build(check): enforce release evidence and publish integrity policy`
6. `8f2a557a` — `fix(release): require manifest attachment in publish policy`
7. `ae508746` — `test(release): protect evidence and publish integrity policy`
8. `17684355` — `docs(release): document deterministic release evidence manifests`
9. `032fe063` — `docs(release): prepare 2.0.13 release notes`
10. `424884ea` — `chore(release): synchronize version 2.0.13 metadata`
11. `84137993` — `docs(changelog): record 2.0.13 release hardening`
12. `a04f18a8` — `docs(roadmap): advance current release to 2.0.13`
13. `db63fd07` — `build(check): pin release manifest generator command`
14. `57d90a22` — `test(release): pin canonical evidence generator command`
15. `41d9a54c` — `docs(readme): align current release with 2.0.13`
16. `a57edffc` — `fix(release): require pinned Node for evidence generation`
17. `b99bba70` — `test(release): enforce pinned Node evidence runtime`
18. `10665767` — `docs(release): align 2.0.13 evidence and lockfile gates`
19. `dbed3422` — `docs(release): document pinned Node evidence runtime`

The handoff-maintenance commit comes after the implementation checkpoint and is intentionally not self-referenced by SHA inside this file.
