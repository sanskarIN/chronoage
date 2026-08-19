# ChronoAge — Work Handoff

## Current milestone

ChronoAge is in **final v1.1 polish + release hardening** on top of the existing `1.0.0` production-PWA baseline.

The product feature scope from the ChronoAge master prompt has been audited again against the repository. The core calculator, advanced date tooling, local profiles, import/export, privacy-safe sharing, responsive PWA, themes, onboarding, quick actions, accessibility, internationalization-ready English strings, structured logging, offline behavior, security checks, performance budgets, tests, screenshots automation, CI, CodeQL, dependency review, release automation, and documentation set are implemented.

No new feature was added merely to increase feature or commit count. The remaining unfinished items are release evidence or repository settings, not missing application functionality.

## Remaining evidence-gated release blockers

1. Generate and review a real npm-registry-resolved `package-lock.json`.
2. Switch permanent CI and release installation from `npm install` to `npm ci` only after that lockfile is verified.
3. Record a passing clean-checkout quality + browser E2E + accessibility + offline-PWA + bundle-budget release gate.
4. Enable and verify the documented `main` branch protection/ruleset in GitHub repository settings.

Do not mark any of these complete without actual evidence.

Additional locale packs remain intentionally gated on complete human translation review. The native/Tauri wrapper remains intentionally deferred by ADR until a concrete native-only requirement justifies its signing, updater, permissions, packaging, and security surface.

## Repository state verified in this final continuation

- Repository: `https://github.com/sanskarIN/chronoage`
- Default branch: `main`
- Visibility/source model: public open source
- License: MIT
- Package version: `1.0.0`
- Primary stack: React + TypeScript + Vite + native service worker/PWA
- Exact Node runtime pin: `22.13.0`
- Package engine floor: `>=22.13.0`
- Commit identity previously verified from raw Git commit data: `Sanskar <sanskarin@outlook.in>`
- No open GitHub issues were found during the final audit.
- Repository searches did not expose unresolved TODO/FIXME source placeholders requiring implementation.
- `public/logo.svg` provides editable branding artwork.
- `docs/troubleshooting.md` exists and covers install, timezone/DST, profile storage/backup, PWA, CSP, offline behavior, and Playwright troubleshooting.
- GitHub repository-maintenance documentation covers branch protection, labels, milestones, Discussions, merge strategy, and releases.
- Permanent workflows include CI, CodeQL, dependency review, and release verification.
- Static security checks reject selected dangerous browser primitives and direct runtime `console.*` usage outside the redacting logger.
- `main` currently contains no temporary `release-lockfile.yml` workflow.

## Final saved-profile integrity fix

### Reversed timestamp histories are rejected

Saved-profile normalization already required ISO timestamps, but an imported or restored record could previously contain an impossible history where `updatedAt` was earlier than `createdAt`.

`src/storage/profiles.ts` now rejects that state after ISO validation and before accepting the profile into local storage or a restore operation.

This does not change the persisted schema. It strengthens validation of untrusted/corrupted profile data while preserving all valid existing `schemaVersion: 1` records.

### Regression coverage

`tests/profiles.test.ts` now includes a focused regression asserting that an imported profile with `updatedAt < createdAt` is rejected with the existing stable user-safe backup error and leaves storage empty.

### Changelog

`CHANGELOG.md` now records the timestamp-integrity fix under **Unreleased → Fixed**.

## Previously completed saved-profile polish retained

The final audit preserved the already implemented profile improvements:

- local save/load/edit/delete;
- strict backup import validation and export;
- 1 MB UTF-8 backup limit;
- 100-profile capacity limit;
- duplicate-id rejection;
- malformed/corrupted local-data recovery;
- blocked/quota-limited storage handling;
- one-step deletion undo;
- exact identity/timestamp restoration;
- restoration at the original list position;
- stale-undo expiration after replacement creation;
- deterministic profile sorting without mutating storage order;
- search/filter;
- progressive 20-card rendering;
- import replacement confirmation;
- direct saved-profile handoff to the Age calculator.

## Core application audit

The repository continues to cover the master-prompt product requirements:

### Date and age calculations

- exact calendar years/months/days;
- optional hours/minutes and elapsed totals;
- next birthday countdown and weekday;
- age difference;
- inclusive/exclusive intervals;
- Gregorian leap-year handling;
- configurable February 29 policy;
- built-in and custom milestones;
- IANA timezone support using browser `Intl`;
- spring-forward nonexistent-time rejection;
- explicit earlier/later policy for repeated fall-back times;
- supported civil-year boundaries.

### Product experience

- local-only profiles with no account requirement;
- privacy-safe print/share result behavior;
- responsive phone/tablet/desktop layout;
- light/dark/system appearance;
- onboarding and quick actions;
- settings and About pages;
- visible project credit and contact/funding metadata;
- PWA installation/update UX;
- offline service-worker behavior;
- privacy-safe page deep links with browser history;
- route titles and main-content focus handoff.

### Reliability, security, accessibility, and performance

- centralized user-safe errors;
- root React crash recovery;
- privacy-safe structured logger with redaction;
- browser error/unhandled-rejection routing;
- restrictive CSP and no-referrer policy;
- metadata/security/documentation-link invariant scripts;
- gzip bundle budgets;
- Vitest domain/storage/component coverage;
- deterministic fuzz-style date invariants;
- Playwright desktop/mobile journeys;
- axe WCAG A/AA automated audits;
- offline PWA browser regression tests;
- release-candidate screenshot automation;
- exact Node pin consistency checks.

## Documentation audit

The required documentation set is present and remains aligned with the implementation:

- `README.md`
- `LICENSE`
- `CONTRIBUTING.md`
- `CODE_OF_CONDUCT.md`
- `SECURITY.md`
- `SUPPORT.md`
- `PRIVACY.md`
- `CHANGELOG.md`
- `ROADMAP.md`
- `what_changed.md`
- `.gitignore`
- `.editorconfig`
- `.gitattributes`
- configuration/environment examples where applicable
- `docs/architecture.md`
- `docs/setup.md`
- `docs/development.md`
- `docs/testing.md`
- `docs/release.md`
- `docs/troubleshooting.md`
- `docs/accessibility.md`
- `docs/performance.md`
- `docs/date-semantics.md`
- `docs/pwa.md`
- `docs/security-headers.md`
- `docs/internationalization.md`
- `docs/desktop.md`
- `docs/github.md`
- `docs/github-maintenance.md`
- architecture decision records under `docs/adr/`
- documentation preview artwork and automated release-candidate screenshot coverage.

## Final lockfile verification setup

The original temporary lockfile PR #16 was closed while its branch was being refreshed from newer `main` work. A new clean verification PR now exists:

- PR: **#17 — `chore: verify final reproducible npm lockfile`**
- branch: `chore/release-lockfile-v2`
- base at creation: `583e013e2277c6696687056ebd37fae4cae091d5`
- verification branch commit: `cf383d9de7ac8aa007d4ad28d7614ca0303d3065`
- changed files in the PR at creation: 1
- temporary file: `.github/workflows/release-lockfile.yml`

The temporary workflow is intentionally branch-only. A direct fetch of `main/.github/workflows/release-lockfile.yml` returned 404 after the correction, confirming the final `main` tree does not contain this temporary workflow.

The verification workflow is designed to:

```bash
npm install --package-lock-only --ignore-scripts --no-fund --no-audit
npm ci --no-fund --no-audit
npm run check
npm audit --omit=dev --audit-level=high
npx playwright install --with-deps chromium
npm run test:e2e
git diff --exit-code -- package.json
```

If successful, it commits only the generated `package-lock.json` using:

```text
Sanskar <sanskarin@outlook.in>
build: add reproducible npm lockfile
```

The temporary workflow must not be merged into `main`; only a reviewed lockfile should be brought over after successful verification.

## Current GitHub Actions evidence for PR #17

At the latest inspection, the pull-request-triggered workflows for head `cf383d9de7ac8aa007d4ad28d7614ca0303d3065` were queued:

- Dependency Review — run `32246267005` — queued
- CodeQL — run `32246266999` — queued
- CI — run `32246267142` — queued
  - `Playwright E2E` job `96047357218` — queued
  - `Format, lint, types, tests, build` job `96047357457` — queued

No passing conclusion is claimed while these jobs are queued.

The connector can enumerate pull-request-triggered runs but does not expose a general workflow-run listing suitable for reliably identifying the new push-triggered temporary lockfile workflow by commit. Therefore no claim is made about that push workflow beyond the committed configuration itself.

## Temporary workflow correction on `main`

During the branch refresh, a connector parameter mismatch caused two temporary workflow commits to land on `main` instead of the intended verification branch. This was detected immediately by fetching the file from `main`.

A corrective commit removed the temporary workflow:

- `583e013e` — `chore: remove temporary lockfile workflow from main`

Current-tree verification then returned **Not Found / 404** for `.github/workflows/release-lockfile.yml` on `main` and returned the expected workflow on `chore/release-lockfile-v2`.

The two preceding temporary commits remain in Git history for transparency, but their file changes are fully reversed in the current `main` tree. No production source, package metadata, profile data, or permanent CI workflow was altered by that temporary branch-tooling correction.

## Verification constraints

### Local execution environment

A shallow clone attempt in the execution container failed because the environment could not resolve `github.com`:

```text
Could not resolve host: github.com
```

Accordingly, this continuation does **not** claim that local `npm install`, `npm run check`, Playwright, or npm audit completed in that container.

### GitHub runners

The latest observable PR #17 checks remain queued. No passing quality/E2E/CodeQL/dependency-review result is claimed until GitHub reports a successful conclusion.

### Dependency lock

There is still no verified `package-lock.json` on `main`. Permanent CI/release files therefore intentionally still use `npm install` rather than prematurely switching to `npm ci`.

### Branch protection

The previously verified GitHub state reported `main` as unprotected. The available connector exposes repository/file/PR/workflow operations but no branch-protection/ruleset write action, so this setting cannot be truthfully enabled from this environment. `docs/github.md` and `docs/release.md` document the intended configuration and release requirement.

## Files changed on `main` in this final continuation

### Runtime/source

- `src/storage/profiles.ts`
  - reject profile histories where `updatedAt` precedes `createdAt`.

### Tests

- `tests/profiles.test.ts`
  - regression coverage for reversed imported profile timestamps.

### Documentation

- `CHANGELOG.md`
  - records the profile timestamp-integrity fix.
- `what_changed.md`
  - this refreshed final audit/release handoff.

### Corrective temporary-workflow cleanup

- `.github/workflows/release-lockfile.yml`
  - was accidentally written to `main` during branch refresh and then removed in `583e013e`; it is absent from the current `main` tree.

## Temporary verification branch files

- `chore/release-lockfile-v2:.github/workflows/release-lockfile.yml`
  - network-dependent lockfile/release verification only.

## Recent meaningful `main` commits

Newest before this handoff commit:

- `583e013e` — `chore: remove temporary lockfile workflow from main`
- `25c33543` — `docs: record profile timestamp integrity fix`
- `b436743b` — `test: cover reversed profile timestamps`
- `941e6400` — `fix: reject reversed profile timestamps`
- `8782cd7e` — `test: narrow manifest shortcut URL before validation`
- `0b651f55` — `test: protect quick-action route focus handoff`
- `a406ae4a` — `docs: extend security model for routes and imports`
- `f5b2e343` — `docs: align performance guidance with bounded sorting`
- `8aeaf135` — `test: derive PWA shortcuts from canonical routes`
- `aaf56e9b` — `docs: strengthen pull request release checklist`

Temporary history-only commits `72767075` and `70d4d988` added/retargeted the lockfile workflow on `main` during the connector parameter mismatch; `583e013e` fully removes that file from the current tree.

## Verification-branch commits

- `cf383d9d` — `ci: add final lockfile verification gate` on `chore/release-lockfile-v2`.

Older temporary PR #16/branch history is superseded by PR #17 for future lockfile verification.

## Open issues

No open GitHub issues were found during this final audit.

Remaining work is intentionally tracked through `ROADMAP.md`, this handoff, and PR #17 rather than manufacturing duplicate issues for already-known release blockers.

## Next exact tasks

1. Re-check PR #17 pull-request runs `32246267005`, `32246266999`, and `32246267142` until they reach conclusions.
2. Identify and inspect the push-triggered `Generate verified npm lockfile` run for `chore/release-lockfile-v2` when GitHub exposes it.
3. If any run fails, inspect the exact failed job/step/log and fix only the verified failure.
4. If a real `package-lock.json` is generated, review that file and confirm `package.json` was not rewritten.
5. Bring only the reviewed lockfile onto the then-current `main`.
6. Change permanent `.github/workflows/ci.yml` installation commands from `npm install` to `npm ci` in a focused commit.
7. Change permanent `.github/workflows/release.yml` installation from `npm install` to `npm ci` in a separate focused commit.
8. Update setup/testing/release documentation for the verified reproducible-install workflow.
9. Run/observe a clean-checkout `npm ci` + `npm run check` + runtime audit + Chromium desktop/mobile E2E + offline PWA + axe accessibility + screenshot + bundle-budget gate.
10. Only after passing evidence, mark the lockfile, `npm ci`, and clean-release-gate roadmap items complete.
11. Close PR #17 and remove temporary verification branches/workflow machinery after their purpose is complete.
12. Enable the documented `main` branch protection/ruleset in GitHub repository settings and verify GitHub reports it as effective before marking that roadmap item complete.
13. Do not add machine-generated locale packs or a native wrapper solely to make unchecked intentional-deferral items disappear.

## Migration notes

- Saved-profile storage remains `schemaVersion: 1`.
- No localStorage migration is required.
- Valid existing profile records remain compatible.
- Records with impossible reversed creation/update timestamps are now treated as invalid/corrupted input.
- Backup format is unchanged.
- Settings format is unchanged.
- URL/navigation format is unchanged.
- No backend/database migration exists because ChronoAge remains local-first and client-only.

## Release notes draft

The next ChronoAge release delivers a broad polish and release-hardening pass across saved profiles, calculator handoff, responsive rendering, route privacy, PWA lifecycle behavior, accessibility automation, runtime error containment, logging redaction, performance budgets, metadata consistency, exact Node runtime pinning, documentation, and release verification. The final data-integrity audit additionally rejects saved-profile records whose update timestamp predates their creation timestamp and adds a regression test for that case.

Release reproducibility is deliberately evidence-gated: a real npm lockfile, permanent `npm ci` migration, a passing clean-checkout quality/E2E gate, and effective `main` branch protection remain required before declaring release hardening fully complete. PR #17 contains only the temporary network-enabled lockfile verification workflow and must not be merged as permanent branch tooling.
