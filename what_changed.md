# ChronoAge — Work Handoff

## Current milestone

ChronoAge remains in **v1.1 polish + release hardening** on top of the existing `1.0.0` production-PWA baseline.

The implemented feature roadmap is substantially complete. Remaining release-hardening work is now explicit and evidence-gated:

1. generate and review a real registry-resolved `package-lock.json`;
2. migrate permanent CI/release installs to `npm ci` only after that lockfile is verified;
3. record a passing clean-checkout quality + E2E release gate;
4. enable and verify the documented `main` branch protection/ruleset in GitHub repository settings.

Additional locale packs remain intentionally gated on human translation review. A native desktop wrapper remains intentionally deferred by ADR until a concrete native-only requirement exists.

## Repository state verified in this continuation

- Repository: `https://github.com/sanskarIN/chronoage`
- Default branch: `main`
- Package version: `1.0.0`
- Source model: public/open source under MIT
- Primary stack: React + TypeScript + Vite + native PWA/service worker
- Exact project Node runtime pin: `22.13.0`
- Package engine floor: `>=22.13.0`
- Commit identity observed on GitHub: `Sanskar <sanskarin@outlook.in>`
- No open GitHub issues were found during this continuation.
- Repository TODO/FIXME/HACK search did not expose unfinished source placeholders requiring implementation.
- Existing core calculator, advanced date tools, PWA, accessibility automation, screenshot automation, runtime hardening, bundle budgets, release-tag checks, and desktop-delivery decisions were preserved rather than rewritten.
- GitHub's branch API reported `main` as **unprotected** on 2026-08-19 with required-status-check enforcement off. The repository documentation now distinguishes the intended ruleset from the actual verified setting.

## Saved-profile work completed

### Reversible individual deletion

Implemented practical one-step undo for locally saved profiles.

- A successful individual deletion stores a validated recovery snapshot in UI state.
- The record is removed from browser storage immediately.
- An accessible **Undo delete** action is displayed.
- Undo preserves id, name, birth date, creation timestamp, update timestamp, and original list position.
- Duplicate restoration is rejected.
- The existing 100-profile capacity remains enforced.
- Import/delete-all invalidate the snapshot because they replace collection state.
- A successful new profile save invalidates an older deletion snapshot, preventing a stale undo from exceeding the 100-profile limit after a replacement record is created.

Storage remains `schemaVersion: 1`; no migration was introduced.

### Restoration and mutation hardening

`restoreProfile(profile, position?)` now reuses the profile validation path used by persisted/imported data and safely clamps an optional restoration index.

`deleteProfile(id)` now rejects a missing identity with `Profile not found.` instead of silently persisting an unchanged list and appearing successful.

### Bounded large-list rendering

Saved-profile storage is already capped at 100 records. UI rendering is now additionally bounded:

- first matching batch: 20 cards;
- **Show more profiles** reveals the next 20;
- a search change resets the reveal window;
- import and delete-all reset the reveal window;
- search still evaluates the intentionally small, capped local collection while DOM work remains bounded.

This satisfies the large-list performance requirement without adding a virtualization dependency for a collection that can never exceed 100 records.

### Saved profile → Age calculator

Saved profiles can now directly seed the Age calculator.

Flow:

1. Open **Profiles**.
2. Activate the profile's Age action.
3. App navigates to **Age**.
4. The profile birth date is prefilled.
5. Calculator reference date/time, timezone, leap-day policy, and DST policy remain normal calculator state.

Implementation:

- `CalculatorPage` accepts optional `initialBirthDate`.
- `ProfilesPage` accepts optional `onUseProfile`.
- `App` owns the selected profile birth-date handoff and navigation.
- Profile action gets an accessible name such as `Age: Saved person`.
- Profile names are not added to print/share result text.

## Regression coverage added

### `tests/profiles.test.ts`

Added/expanded coverage for:

- exact restoration;
- duplicate restoration rejection;
- original-position restoration;
- missing-profile deletion without storage rewrite;
- identity/timestamp preservation;
- existing malformed backup, UTF-8 byte-size, duplicate-id, timestamp, corrupted-local-data, and blocked-storage behavior remains covered.

### `tests/ProfilesPage.test.tsx`

Added/expanded coverage for:

- 20-card bounded rendering;
- progressive reveal;
- profile-to-calculator callback;
- delete undo;
- ordered card restoration;
- stale undo expiration after a replacement save;
- existing safe delete/clear feedback under blocked storage.

### `tests/CalculatorPage.test.tsx`

Added saved-profile birth-date prefill coverage while retaining timezone/DST tests.

### `tests/App.test.tsx`

Added application-level Profiles → Age navigation/prefill coverage while retaining modal/focus/onboarding tests.

### `tests/e2e/app.spec.ts`

Added browser journeys for:

- profile deletion undo;
- saved-profile Age-calculator handoff/prefill.

These complement existing desktop/mobile calculator, profile, PWA, accessibility, and release-candidate screenshot scenarios.

## Runtime/release reproducibility hardening completed

### Exact Node runtime pin in permanent automation

Permanent CI and release verification no longer use the moving `22` Node channel.

- `.github/workflows/ci.yml` quality job: `22.13.0`
- `.github/workflows/ci.yml` E2E job: `22.13.0`
- `.github/workflows/release.yml`: `22.13.0`
- `.nvmrc`: `22.13.0`

### Metadata gate now prevents runtime drift

`scripts/check-metadata.mjs` now checks:

- package/project name;
- package/project version;
- license;
- repository URL;
- homepage;
- issues URL;
- funding URL;
- author/business-email consistency;
- package Node engine equals `>=` the `.nvmrc` version;
- every permanent CI `node-version` equals `.nvmrc`;
- every release-workflow `node-version` equals `.nvmrc`.

A future change that moves only one of those runtime declarations will therefore fail `npm run metadata:check` instead of silently producing environment drift.

## GitHub default-branch protection gap verified

GitHub repository data currently reports:

- default branch: `main`;
- branch protected: `false`;
- required status-check enforcement: off.

The following files now accurately track that state:

- `docs/github.md` explains the verified current state and the intended protection/ruleset;
- `ROADMAP.md` contains a separate unchecked release-hardening item to enable and verify it;
- `docs/release.md` requires maintainers to verify the effective GitHub ruleset before release rather than assuming repository documentation equals enforcement.

The available GitHub connector exposes repository/file/PR/workflow operations but no branch-protection/ruleset write action, so this repository-setting task cannot be truthfully marked complete from this environment.

## Real npm lockfile verification branch

A dedicated network-dependent verification branch exists:

- branch: `chore/release-lockfile`
- PR: **#16 — `chore: verify reproducible npm lockfile`**

Temporary branch workflow:

- `.github/workflows/release-lockfile.yml`

Intended verification sequence:

```bash
npm install --package-lock-only --ignore-scripts --no-fund --no-audit
npm ci --no-fund --no-audit
npm run check
git diff --exit-code -- package.json
```

If all checks succeed and a lockfile changed, the workflow is designed to commit only the generated lockfile using:

- author name: `Sanskar`
- author email: `sanskarin@outlook.in`
- message: `build: add reproducible npm lockfile`

### Latest observed lockfile job state

- workflow run: `32237121294`
- job: `96019473421`
- workflow: `Generate verified npm lockfile`
- job: `Resolve, verify, and commit lockfile`
- head SHA: `c208b73e7cac322b960d02b837231914fad0b5f3`
- status at the latest check: **queued**
- conclusion: **none**
- no job steps/logs are available while it remains queued.

There is still no verified `package-lock.json` to copy to `main`.

**Do not check the lockfile, `npm ci`, or clean-release-gate roadmap items until actual successful evidence exists.**

The verification workflow is intentionally temporary branch tooling. After a verified lockfile exists, prefer bringing the reviewed lockfile onto the current `main`, converting permanent CI/release installation commands in separate atomic commits, rerunning all gates, and then closing/removing the temporary branch rather than merging temporary workflow machinery unnecessarily.

## Documentation synchronized

Updated during this continuation:

- `README.md`
  - complete saved-profile workflow overview;
  - exact Node runtime pin and metadata invariant description.
- `CHANGELOG.md`
  - saved-profile undo/order/performance/handoff fixes;
  - exact CI/release Node pin;
  - runtime-pin consistency invariant.
- `ROADMAP.md`
  - marks saved-profile undo, calculator handoff, progressive rendering, and runtime pin hardening complete;
  - tracks real lockfile/`npm ci`/clean-release verification and actual branch protection as unfinished.
- `docs/performance.md`
  - documents the 100-profile cap and 20-card rendering strategy.
- `docs/testing.md`
  - documents new profile regressions and runtime-pin invariant checking.
- `docs/release.md`
  - documents exact Node runtime and requires effective branch-protection verification.
- `docs/github.md`
  - distinguishes intended branch rules from GitHub's currently verified unprotected `main` state.
- `what_changed.md`
  - this complete continuation checkpoint.

## Files changed on `main` in this continuation

### Runtime/source

- `src/storage/profiles.ts`
- `src/pages/ProfilesPage.tsx`
- `src/pages/CalculatorPage.tsx`
- `src/App.tsx`
- `src/i18n/en.ts`

### Tests

- `tests/profiles.test.ts`
- `tests/ProfilesPage.test.tsx`
- `tests/CalculatorPage.test.tsx`
- `tests/App.test.tsx`
- `tests/e2e/app.spec.ts`

### Build/CI/release automation

- `.github/workflows/ci.yml`
- `.github/workflows/release.yml`
- `scripts/check-metadata.mjs`

### Documentation

- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/performance.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/github.md`
- `what_changed.md`

### Temporary verification branch only

- `.github/workflows/release-lockfile.yml`

## Verification evidence and constraints

### Repository inspection

Authenticated GitHub repository data was used throughout this continuation to inspect source files, tests, docs, branch metadata, commit identity, repository state, issues/PRs, workflows, and workflow-job state.

### Commit identity

GitHub branch/commit data verified repository commits authored/committed as:

```text
Sanskar <sanskarin@outlook.in>
```

### Local clean-checkout limitation

A shallow GitHub clone attempted in the execution container failed DNS resolution:

```text
Could not resolve host: github.com
```

Therefore this handoff does **not** claim that local `npm install`, `npm run check`, or Playwright completed in that container.

### GitHub Actions limitation

The network-enabled lockfile verification job remained queued at the latest inspection. No false passing-CI claim is made for it or for a clean reproducible install.

Focused regression tests were added with the implementation, but executable release evidence remains dependent on an available GitHub runner or another network-enabled clean environment.

## Remaining release blockers / repository-setting gaps

1. Generate and review a real `package-lock.json` from a successful npm registry resolution.
2. Convert permanent CI installs from `npm install` to `npm ci` after the lockfile lands.
3. Convert release installation from `npm install` to `npm ci` in a separate commit.
4. Record a passing clean-checkout `npm ci` + quality + browser E2E + accessibility + offline PWA + bundle-budget run.
5. Enable and verify the documented `main` branch ruleset/protection in GitHub settings.

## Intentional non-blocking deferrals

- Additional locale packs require complete human translation review; do not machine-fill them merely to mark the roadmap complete.
- Native/Tauri packaging remains deferred by ADR until a concrete native-only requirement justifies signing, updater, permissions, platform packaging, security surface, and CI secret handling.

## Open issues

No open GitHub issues were found during this continuation. Remaining work is explicitly tracked in `ROADMAP.md`, PR #16, and this handoff.

## Next exact tasks

1. Re-check workflow run `32237121294` / job `96019473421`.
2. If it fails, fetch the failed step/logs, fix only the verified failure on `chore/release-lockfile`, and rerun.
3. If it succeeds, inspect the generated `package-lock.json` rather than assuming it is valid because it exists.
4. Bring the reviewed lockfile onto the **current** `main` without merging unnecessary temporary branch-only workflow machinery.
5. Change permanent CI install commands from `npm install` to `npm ci` in a small atomic commit.
6. Change release install commands from `npm install` to `npm ci` in a separate atomic commit.
7. Update README/setup/testing/release documentation for reproducible clean-install semantics.
8. Run/observe `npm run check`, runtime dependency audit, Chromium desktop/mobile E2E, offline PWA tests, axe accessibility audits, screenshots, and bundle-budget checks from a clean checkout.
9. Only after successful evidence, check the three dependency/release-installation items in `ROADMAP.md` and remove their Planned changelog text.
10. Close PR #16 and remove the temporary lockfile verification branch after its purpose is complete.
11. In GitHub repository settings, enable the documented `main` branch ruleset/protection; then verify through GitHub that protection is actually effective before checking the roadmap item.
12. Review the latest permanent CI runs for all new `main` commits and fix any deterministic failure before creating another release tag.

## Migration notes

- Saved-profile storage remains `schemaVersion: 1`.
- No localStorage migration is required.
- Existing saved-profile data remains compatible.
- Undo restoration reuses the existing validated profile object shape.
- Progressive rendering changes UI rendering only; stored/exported data format is unchanged.
- Calculator prefill is an internal application-state handoff; backup format is unchanged.
- Node pin hardening changes development/CI environment consistency only; application persisted data is unchanged.
- No backend/database migration exists because ChronoAge remains local-first and client-only.

## Main-branch commits created in this continuation

This handoff update brings the continuation to **42 meaningful `main` commits**. Prior commits, newest first before this handoff commit:

- `a46ca949` — `docs: require branch protection release verification`
- `afa5801a` — `docs: track unprotected main branch as release gap`
- `32ce7253` — `docs: record actual main branch protection state`
- `006e6661` — `docs: record reproducible Node workflow pins`
- `0e8f5fbd` — `docs: document exact project Node runtime`
- `22cb60be` — `docs: document runtime pin invariant checks`
- `d69953a7` — `build: enforce Node runtime metadata consistency`
- `2bc8a3f6` — `docs: align release guide with pinned Node runtime`
- `f441c47a` — `release: pin Node runtime to project version`
- `723ccc67` — `ci: pin Node runtime to project version`
- `3cb14bcc` — `docs: refresh complete project handoff`
- `d5cf85c2` — `docs: record ordered profile undo fixes`
- `243d658f` — `test: cover ordered profile undo in UI`
- `5bdab45c` — `test: cover ordered profile restoration`
- `0e04306d` — `feat: preserve profile order when undoing delete`
- `6a828c73` — `feat: restore profiles at original list position`
- `df991532` — `test: cover stale profile undo expiration`
- `e2fd835c` — `fix: expire delete undo after profile creation`
- `f54192f1` — `docs: align testing guide with profile regressions`
- `234abd71` — `test: cover profile deletion undo in browser`
- `2fa27219` — `test: cover profile calculator handoff in browser`
- `19d41494` — `docs: update profile polish roadmap`
- `41857e77` — `docs: refresh saved-profile feature overview`
- `98385161` — `docs: record profile workflow improvements`
- `41ce1f77` — `docs: document bounded profile rendering`
- `29428a4f` — `test: cover missing-profile deletion safety`
- `fee93e85` — `fix: reject deletion of missing profiles`
- `18ee0576` — `test: cover profile-to-calculator journey`
- `ffe7a30e` — `test: cover saved-profile calculator action`
- `e6c90cf3` — `test: cover saved-profile calculator prefill`
- `9719cf36` — `feat: open saved profiles in calculator`
- `deaa3712` — `feat: expose saved-profile calculator action`
- `29c8cdfa` — `test: disambiguate profile undo status`
- `def891d8` — `feat: allow calculator birth-date prefill`
- `2d1a85d3` — `test: cover bounded profile rendering`
- `88a61711` — `perf: bound rendered saved-profile cards`
- `d6e38a29` — `test: cover profile deletion undo`
- `886e7ce4` — `feat: add undo for profile deletion`
- `71163927` — `refactor: externalize profile recovery copy`
- `95e6c4ce` — `test: cover exact saved-profile restoration`
- `fd5b4b4b` — `feat: add exact saved-profile restoration`

## Verification-branch commits

- `c208b73e` — `ci: run lockfile verification on pull requests`
- `8c2b242d` — `ci: add verified lockfile generation gate`

## Release notes draft

The next ChronoAge release strengthens the local-first saved-profile workflow with reversible deletion, original-order restoration, stale-undo protection, bounded progressive rendering, and direct saved-profile prefill into the Age calculator. Regression coverage now spans storage, components, application navigation, and browser journeys. Release reproducibility is stronger because permanent CI/release jobs use the exact `.nvmrc` Node runtime and the metadata gate prevents runtime-pin drift. Repository governance documentation now also records the actual unprotected `main` state and requires effective branch protection before release. Reproducible `npm ci` installation is intentionally not considered complete until PR #16 produces and verifies a real lockfile and the clean-checkout quality/E2E gates pass.
