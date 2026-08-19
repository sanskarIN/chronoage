# ChronoAge — Work Handoff

## Current milestone

ChronoAge is in **v1.1 polish + release hardening** on top of the existing `1.0.0` production-PWA baseline.

The feature roadmap is now substantially complete. The primary remaining release blocker is reproducible dependency installation: the repository still needs a real registry-resolved `package-lock.json`, followed by `npm ci` migration and a recorded clean-checkout full quality/E2E pass. Additional locale packs remain intentionally gated on human translation review, and a native desktop wrapper remains intentionally deferred by ADR until a concrete native-only requirement exists.

## Repository state reviewed

- Repository: `https://github.com/sanskarIN/chronoage`
- Default branch: `main`
- Package version: `1.0.0`
- Source model: public/open source under MIT
- Primary stack: React + TypeScript + Vite + native PWA/service worker
- Commit identity requested by the project: `sanskarin@outlook.in`
- Existing core functionality was preserved rather than rewritten.
- No open GitHub issues were found during this continuation.
- Repository TODO/FIXME/HACK search did not expose unfinished source placeholders requiring implementation.
- The existing roadmap already marked the core calculator, advanced date tools, PWA, accessibility automation, screenshot automation, runtime hardening, bundle budgets, release-tag checks, and desktop-delivery decision as complete.

## Completed in this continuation

### 1. Reversible saved-profile deletion

Implemented practical single-delete undo for locally saved profiles.

Behavior now includes:

- deleting one profile stores a validated recovery snapshot in UI state;
- the profile is removed from browser storage immediately;
- an **Undo delete** action is exposed after successful deletion;
- undo restores the same profile id, name, birth date, creation timestamp, and update timestamp;
- undo restores the profile to its original saved-list position rather than moving an older record to the top;
- the recovery operation rejects duplicate identities and respects the existing 100-profile capacity limit;
- a successful new profile save invalidates a previous delete snapshot so the UI cannot offer an unsafe stale undo after capacity changes;
- import and delete-all operations also invalidate the delete snapshot because they replace the collection state.

Storage behavior was deliberately kept inside schema version `1`; no migration is required.

### 2. Saved-profile restoration hardening

Added `restoreProfile(profile, position?)` to the local profile storage module.

The operation:

- reuses the same profile validation pipeline as import/loading;
- rejects invalid profile payloads;
- rejects duplicate ids;
- enforces the profile limit;
- preserves identity and timestamps;
- clamps a requested restoration position safely into the current list bounds;
- persists the resulting collection through the existing guarded storage write path.

Deletion was also hardened so attempting to delete a missing profile now raises the stable user-visible `Profile not found.` error rather than rewriting unchanged storage and appearing successful.

### 3. Large saved-profile collection rendering

The Profiles page already had a hard storage cap of 100 profiles. Rendering is now additionally bounded:

- initial matching cards: 20;
- **Show more profiles** reveals the next 20;
- searching resets the visible window to the first 20 matches;
- backup import and delete-all reset the reveal window;
- filtering still evaluates the intentionally bounded local collection, while DOM work remains smaller.

This directly addresses the master prompt's requirement to avoid unbounded large-list rendering without introducing an unnecessary virtualization dependency for a collection capped at only 100 records.

### 4. Saved-profile → Age calculator workflow

Saved profiles are now actionable rather than being only storage records.

Implemented flow:

1. Open **Profiles**.
2. Use the accessible Age action on a saved profile.
3. Application navigation moves to **Age**.
4. The selected profile's birth date is prefilled in the calculator.
5. The normal calculator reference date, time, timezone, leap-day, and DST policies remain in control.

Implementation details:

- `CalculatorPage` accepts an optional `initialBirthDate`;
- `ProfilesPage` accepts an optional `onUseProfile` callback;
- `App` owns the selected profile birth-date handoff and performs navigation;
- the profile action has a deterministic accessible name such as `Age: Saved person`.

No profile name is copied into printable/shareable result text by this workflow, preserving the existing privacy-first behavior.

### 5. Profile undo edge-case fixes

Two follow-up edge cases were found during the continuation and fixed rather than left as known defects:

- **Ordering bug:** undoing an older profile originally restored it at list index `0`; restoration now preserves the original card position.
- **Stale-capacity bug:** after deleting one profile, creating a replacement could leave an undo control that might fail at the 100-profile cap; successful creation now expires that stale undo snapshot.

### 6. Regression coverage added/expanded

#### Storage tests

`tests/profiles.test.ts` now additionally covers:

- exact profile restoration;
- duplicate restoration rejection;
- deletion of a missing identity without rewriting storage;
- restoration at a requested original list position;
- preservation of original profile identity/timestamps.

#### Profiles page component tests

`tests/ProfilesPage.test.tsx` now additionally covers:

- bounded 20-card rendering and progressive reveal;
- profile-to-calculator callback behavior;
- delete undo;
- ordered card restoration after undo;
- expiration of stale undo after successful profile creation;
- existing blocked-storage delete/clear feedback remains covered.

#### Calculator component tests

`tests/CalculatorPage.test.tsx` now covers saved-profile birth-date prefill in addition to its existing timezone/DST behavior tests.

#### App integration tests

`tests/App.test.tsx` now exercises the complete application-level Profiles → Age navigation and verifies the calculator receives the saved birth date.

#### Playwright E2E tests

`tests/e2e/app.spec.ts` now includes browser journeys for:

- saved-profile deletion undo;
- saved-profile calculator handoff/prefill.

These complement the existing desktop/mobile calculator, local-profile, PWA, accessibility, and screenshot browser coverage.

### 7. Documentation synchronized

Updated documentation to match implemented behavior:

- `README.md`
  - profile feature overview now includes validation, search, edit, undo, progressive rendering, calculator handoff, backup/import, and deletion controls.
- `CHANGELOG.md`
  - records delete undo, original-position restoration, progressive rendering, calculator handoff, missing-delete hardening, stale-undo expiration, and regression coverage.
- `ROADMAP.md`
  - marks single-delete undo, direct calculator handoff, and progressive profile rendering complete.
- `docs/performance.md`
  - documents the 100-profile cap and 20-card progressive DOM strategy.
- `docs/testing.md`
  - documents new storage, component, application, and browser regressions.

## Release-hardening work started

### Real npm lockfile verification branch

A dedicated branch was created from the repository for the network-dependent lockfile task:

- branch: `chore/release-lockfile`
- pull request: **#16 — `chore: verify reproducible npm lockfile`**

Branch-only workflow:

- `.github/workflows/release-lockfile.yml`

Its intended network-enabled sequence is:

```bash
npm install --package-lock-only --ignore-scripts --no-fund --no-audit
npm ci --no-fund --no-audit
npm run check
```

It then verifies that `package.json` was not rewritten and, only after those checks succeed, commits the generated `package-lock.json` using:

- name: `Sanskar`
- email: `sanskarin@outlook.in`
- commit message: `build: add reproducible npm lockfile`

The workflow was first added for the verification branch and then extended to the same-repository pull request so its run can be inspected through GitHub Actions.

### Current lockfile verification status

At the latest inspection in this continuation:

- workflow run: `32237121294`
- job: `96019473421`
- workflow: `Generate verified npm lockfile`
- job name: `Resolve, verify, and commit lockfile`
- status: **queued**
- conclusion: **none yet**
- head SHA: `c208b73e7cac322b960d02b837231914fad0b5f3`

The associated CI, CodeQL, and Dependency Review runs were also queued when inspected.

**Do not mark the lockfile/reproducible-install roadmap items complete until the workflow actually finishes successfully and the generated dependency graph is reviewed.**

The verification workflow is intentionally branch-specific tooling. Once a verified lockfile exists, prefer copying/committing the verified `package-lock.json` onto current `main`, migrating the permanent CI/release workflows to `npm ci`, rerunning the full gates, and then closing/removing the temporary verification branch rather than merging unnecessary temporary workflow machinery into `main`.

## Files changed in this continuation

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

### Documentation

- `README.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `docs/performance.md`
- `docs/testing.md`
- `what_changed.md`

### Temporary verification branch only

- `.github/workflows/release-lockfile.yml`

## Verification performed and evidence

### Repository inspection

Authenticated GitHub repository data was used to inspect:

- current repository metadata/default branch;
- recent commits;
- `what_changed.md`;
- `ROADMAP.md`;
- `CHANGELOG.md`;
- `README.md`;
- source/storage/profile/calculator/application files;
- unit/component/E2E tests;
- package metadata;
- CI workflow;
- open issues and recent pull requests;
- workflow runs/jobs for the lockfile verification PR.

### Local clean-clone constraint

A clean local clone was attempted with a shallow GitHub clone, but the execution container failed DNS resolution with:

```text
Could not resolve host: github.com
```

Because of that environment limitation, this continuation does **not** claim that local `npm install`, `npm run check`, or Playwright completed in the container.

### GitHub Actions status constraint

The network-enabled lockfile verification job and associated PR checks were still queued at the last inspection. Therefore this handoff makes **no false passing-CI claim** for the newest commits.

The code changes were accompanied by focused regression tests, but final executable verification remains dependent on the queued GitHub runners or another network-enabled clean environment.

## Known limitations / intentionally deferred work

### Release blockers

1. `package-lock.json` has not yet been generated/verified from a successful real npm resolution.
2. Permanent CI/release workflows still use `npm install`; migrate them to `npm ci` only after the verified lockfile lands.
3. A complete clean-checkout install + non-E2E quality suite + browser E2E run still needs a recorded passing result.

### Non-blocking intentional deferrals

- Additional locale packs require complete human translation review; do not machine-fill them merely to mark a checkbox.
- Native/Tauri packaging remains intentionally deferred by the desktop-delivery ADR until a concrete native-only requirement justifies its signing, update, permissions, and security surface.

## Open issues found during this continuation

No open GitHub issues were found. The remaining items are tracked through `ROADMAP.md` and this handoff.

## Next exact tasks

1. Re-check GitHub Actions run `32237121294`.
2. If the lockfile workflow fails, fetch the failing step/job logs, fix only the verified failure on `chore/release-lockfile`, and rerun.
3. If it succeeds, inspect the generated `package-lock.json` on `chore/release-lockfile`.
4. Commit the verified lockfile to the **current** `main` branch without bringing the temporary branch workflow into main.
5. Change permanent CI install commands from `npm install` to `npm ci` in small atomic commits.
6. Change release workflow install commands from `npm install` to `npm ci` in a separate atomic commit.
7. Update setup/testing/release documentation where clean/reproducible install semantics change.
8. Run/observe `npm run check`, runtime dependency audit, Chromium desktop/mobile E2E, offline PWA coverage, accessibility audits, and bundle-budget verification from a clean checkout.
9. Only after successful evidence, check the three remaining release-hardening boxes in `ROADMAP.md` and remove the corresponding Planned changelog items.
10. Close PR #16/remove the temporary verification branch once its lockfile purpose is complete.
11. Review queued CI for the latest `main` profile commits and fix any deterministic failure before tagging another release.

## Migration notes

- Saved-profile storage schema remains `schemaVersion: 1`.
- No localStorage migration is required.
- Existing saved profile objects remain compatible.
- Undo restoration reuses the same existing validated object shape.
- Progressive rendering changes only UI rendering behavior; it does not change stored data or export format.
- Calculator profile prefill is an internal application-navigation handoff; backup/export data format is unchanged.
- No backend/database migration exists or is required because ChronoAge remains local-first and client-only.

## Main-branch commits created in this continuation

Newest first:

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

The next ChronoAge release strengthens its local-first saved-profile workflow with reversible deletion, exact ordered restoration, stale-undo protection, progressive large-list rendering, and direct saved-profile prefill into the Age calculator. Regression coverage now spans storage, components, application navigation, and real browser journeys for these flows. Documentation and performance guidance are synchronized with the implementation. Release hardening is also progressing through a dedicated network-enabled lockfile verification PR, but reproducible `npm ci` installation is not considered complete until that queued workflow produces and verifies a real lockfile and the full clean-checkout quality/E2E gates pass.
