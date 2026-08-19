# ChronoAge — Final 2.0.12 Work Handoff

## Current source release

ChronoAge is now finalized on `main` as source version **2.0.12**.

- Repository: `https://github.com/sanskarIN/chronoage`
- Source version: `2.0.12`
- Matching semantic tag: `v2.0.12`
- Release date recorded in the changelog/release notes: `2026-08-19`
- License: MIT
- Runtime: React + TypeScript + Vite + native service worker/PWA
- Exact Node pin: `22.13.0`
- Package Node engine floor: `>=22.13.0`
- Commit identity used throughout the repository work: `Sanskar <sanskarin@outlook.in>`

The repository source version is 2.0.12, but this file does **not** claim that a `v2.0.12` GitHub tag or release artifact has been published. Tagging remains evidence-gated by the release-hardening items below.

## Final 2.0.12 continuation completed

### Canonical version metadata

`package.json` and `src/config/project.ts` now both use `2.0.12`.

The change was committed atomically so the metadata consistency gate never intentionally received a package/runtime version mismatch on `main`.

### 2.0.12 changelog publication

`CHANGELOG.md` now contains:

- an empty/future-facing `Unreleased` section containing only genuinely unfinished/deferred work;
- a dated `2.0.12` release section containing the completed profile, navigation, PWA, accessibility, reliability, security, testing, documentation, and release-hardening work;
- the historical `1.0.0` baseline entry.

### Dedicated release notes

Added:

- `docs/releases/2.0.12.md`
- `docs/releases/README.md`

The 2.0.12 notes distinguish the source release from a published GitHub tag/artifact and list the remaining evidence-gated release boundaries.

### Public README alignment

`README.md` now:

- shows a 2.0.12 version badge;
- identifies `2.0.12` as the current source version;
- links the 2.0.12 release notes;
- uses `npm run release:check -- v2.0.12` in the release command example;
- explicitly warns that version metadata alone does not mean the GitHub release has been published;
- documents rejection of impossible saved-profile timestamp histories.

### Roadmap alignment

`ROADMAP.md` now identifies `v2.0.12` as the current release line while preserving the historical v1.0/v1.1/v1.2 implementation phases.

The roadmap continues to leave evidence-gated dependency/release installation and GitHub branch protection unchecked.

### Release guide alignment

`docs/release.md` now contains a current 2.0.12 release-candidate section and the exact matching tag `v2.0.12`.

It explicitly prohibits tagging merely because package metadata changed and requires actual release evidence first.

### Version-documentation invariant

`scripts/check-metadata.mjs` was strengthened so a version bump cannot silently omit its release documentation.

The metadata gate now requires:

- package/project name consistency;
- package/project version consistency;
- package/project license consistency;
- repository URL consistency;
- homepage consistency;
- issues URL consistency;
- funding URL consistency;
- primary author/business-email consistency;
- package engine floor matching `.nvmrc`;
- permanent CI/release `node-version` values matching `.nvmrc`;
- a dated `## [VERSION] - ...` heading in `CHANGELOG.md`;
- `docs/releases/VERSION.md` to exist;
- that release-note file to identify the same ChronoAge version.

### PWA cache/version invariant

The service-worker cache generation is now tied directly to the app version:

```text
chronoage-2.0.12
```

`npm run metadata:check` now reads `public/sw.js` and requires `CACHE_NAME` to equal:

```text
chronoage-${package.json version}
```

A future application version bump therefore fails the quality gate if the offline cache namespace is left stale.

This replaces the need to remember a separate manual cache-generation counter.

### Security/PWA documentation synchronization

`SECURITY.md` now records:

- current source version 2.0.12 without claiming an unpublished tag;
- rejection of impossible `updatedAt < createdAt` profile histories;
- version-bound PWA cache namespace verification through `metadata:check`.

`docs/pwa.md` now documents the same 2.0.12 cache/version relationship and adds it to manual release testing guidance.

## Final data-integrity fix retained

Saved-profile normalization rejects an imported/restored record when:

```text
updatedAt < createdAt
```

This is checked after ISO timestamp validation and before the record is accepted.

A focused regression test in `tests/profiles.test.ts` verifies the invalid backup is rejected and local profile state remains empty.

Persisted profile schema remains `schemaVersion: 1`; no migration is required for valid existing data.

## Product feature audit

The ChronoAge master-prompt product scope has been audited repeatedly against the final source tree. Implemented functionality includes the following.

### Age and date calculations

- exact calendar years/months/days;
- optional time-of-day precision;
- total elapsed days/hours/minutes;
- next birthday date, weekday, days remaining, and age turning;
- age difference;
- inclusive/exclusive date intervals;
- Gregorian leap-year behavior;
- configurable February 29 policy;
- built-in day-count/birthday milestones;
- custom day-count/birthday milestones;
- calendar-duration comparison visualization;
- supported civil-year range checks.

### Timezone and DST behavior

- browser-supported IANA timezones through native `Intl`;
- free-form timezone entry with suggestions/validation;
- nonexistent spring-forward local-time rejection;
- repeated fall-back time candidate discovery;
- explicit earlier/later repeated-time policy;
- consistent persisted ambiguity policy across timezone-aware age calculations.

### Saved profiles

- local-only save/load;
- editing;
- deletion;
- one-step delete undo;
- exact identity/timestamp restoration;
- restoration at original list position;
- stale-undo expiration after replacement creation;
- search/filter;
- deterministic sorting without mutating storage order;
- progressive 20-card rendering;
- 100-profile capacity;
- strict validated import/export;
- 1 MB UTF-8 backup limit;
- duplicate-id rejection;
- malformed timestamp rejection;
- reversed timestamp-history rejection;
- corrupted-local-entry recovery;
- blocked/quota-limited storage handling;
- confirmation before replacing an existing collection during import;
- direct saved-profile handoff into the Age calculator.

### Privacy and routing

- client-only calculations;
- no account requirement;
- no analytics/crash-reporting backend/cloud sync;
- public page-only hash routes;
- private dates/times/profile values omitted from URLs;
- print/share results that do not add private profile names;
- structured diagnostics redaction;
- aggregate-only corruption logging.

### PWA and offline behavior

- installable web app manifest;
- editable SVG branding source;
- privacy-safe installed-app shortcuts;
- install prompt UX;
- explicit update checks;
- waiting-worker apply action;
- controlled `SKIP_WAITING` flow;
- versioned release cache namespace;
- old ChronoAge cache cleanup only;
- navigation-only HTML offline fallback;
- missing non-navigation assets do not receive HTML;
- same-origin GET cache restriction;
- desktop/mobile offline Playwright coverage.

### Accessibility and responsive UX

- keyboard-first controls;
- visible focus states;
- skip navigation;
- route-change main-content focus transfer;
- route-change document titles;
- blocking-dialog focus containment/restoration;
- onboarding background-shortcut isolation;
- semantic labels and status regions;
- light/dark/system theme;
- reduced-motion/high-contrast preferences;
- desktop/mobile responsive navigation;
- maintained axe WCAG A/AA automated audits;
- release-candidate screenshot automation.

### Reliability, security, and performance

- central curated user-visible error classification;
- root React crash-recovery boundary;
- global browser error/unhandled-rejection logging;
- sensitive-key/email/bearer/date/time/circular/deep-object diagnostic redaction;
- blocked browser-storage recovery;
- stable malformed-backup messages;
- PWA install/update promise containment;
- restrictive CSP and no-referrer metadata;
- static dangerous-browser-primitive scan;
- direct runtime `console.*` rejection outside the privacy-safe logger;
- production gzip JavaScript/CSS bundle budgets;
- exact Node runtime pin enforcement;
- release-tag/package-version identity gate.

### Testing and automation

- deterministic domain unit tests;
- date invariant/property-style tests;
- storage integration tests;
- component/hook tests;
- desktop Chromium E2E;
- Pixel-class mobile Chromium E2E;
- accessibility smoke checks;
- axe WCAG audits;
- offline PWA tests;
- release-candidate screenshot tests;
- CI;
- CodeQL;
- dependency review;
- Dependabot;
- release workflow;
- metadata/security/docs-link/bundle-budget executable invariants.

## Documentation audit

The final repository includes and maintains:

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
- `.env.example`
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
- `docs/releases/README.md`
- `docs/releases/2.0.12.md`
- architecture decision records under `docs/adr/`
- source-controlled preview artwork under `docs/screenshots/`.

## Stale verification PR retired

PR #17 (`chore: verify final reproducible npm lockfile`) was created before the 2.0.12 version and release-hardening changes landed.

It was closed without merge on 2026-08-19 and its body now explicitly states that it is superseded.

Do not use PR #17 as release evidence for 2.0.12.

## Fresh 2.0.12 verification branch

The dedicated replacement branch is:

```text
chore/release-lockfile-2.0.12
```

It is created from the frozen 2.0.12 `main` handoff commit immediately after this file is committed.

Its only intended branch-specific file is:

```text
.github/workflows/release-lockfile.yml
```

The workflow must remain temporary branch tooling and must not be merged into `main`.

The workflow sequence is designed to run:

```bash
npm install --package-lock-only --ignore-scripts --no-fund --no-audit
npm ci --no-fund --no-audit
npm run check
npm audit --omit=dev --audit-level=high
npx playwright install --with-deps chromium
npm run test:e2e
git diff --exit-code -- package.json
```

If all checks succeed and the lockfile changes, the branch workflow commits only `package-lock.json` with:

```text
Sanskar <sanskarin@outlook.in>
build: add reproducible npm lockfile
```

After successful verification, copy/rebase only the reviewed generated lockfile onto the then-current `main`; do not merge temporary branch-only workflow machinery.

## Remaining evidence-gated release blockers

These are the only known release-hardening blockers that remain intentionally incomplete:

1. **Generate and review a real registry-resolved `package-lock.json`.**
2. **Migrate permanent CI/release dependency installation from `npm install` to `npm ci` after the lockfile is accepted.**
3. **Record a passing clean-checkout reproducible install + complete quality + browser E2E + accessibility + offline-PWA + bundle-budget release gate.**
4. **Enable and verify the documented `main` branch protection/ruleset in GitHub repository settings.**

None may be marked complete without real evidence.

## Intentional non-blocking deferrals

These are not defects or missing 2.0.12 functionality:

- Additional locale packs require complete human translation review; do not machine-fill them merely to close a roadmap checkbox.
- Native/Tauri packaging remains deferred by ADR until a concrete native-only requirement justifies signing, updater, permissions, platform packaging, security surface, and CI-secret handling.

## Release-tag rule

When—and only when—all required release gates pass, the version identity must be checked with:

```bash
npm run metadata:check
npm run release:check -- v2.0.12
```

Then the matching tag is:

```text
v2.0.12
```

Do not publish a different tag for this source version.

## Main commits created in this 2.0.12 continuation

Newest-to-oldest before this final handoff commit:

- `e633455d` — `docs: bind PWA cache guidance to release version`
- `73852b95` — `docs: align security model with 2.0.12 invariants`
- `51d73d0f` — `build: bind PWA cache generation to app version`
- `3f94da75` — `pwa: advance cache generation for 2.0.12`
- `c6896c80` — `docs: index ChronoAge release notes`
- `7c403911` — `build: enforce version release documentation metadata`
- `8377d9ac` — `docs: publish ChronoAge 2.0.12 in README`
- `6245a129` — `docs: add ChronoAge 2.0.12 release notes`
- `9cabd2bf` — `docs: prepare release guide for v2.0.12`
- `71abc60d` — `docs: align roadmap with ChronoAge 2.0.12`
- `2c30d36d` — `docs: publish ChronoAge 2.0.12 changelog`
- `8eff3b3c` — `release: set ChronoAge version to 2.0.12`

The preceding final-audit commits also remain on `main`, including the saved-profile timestamp-integrity fix and its regression coverage.

## Migration notes

- Saved-profile persistence remains `schemaVersion: 1`.
- Existing valid local profiles/settings remain compatible.
- No browser-data migration is required for 2.0.12.
- No backend/database migration exists because ChronoAge remains client-only.
- The PWA cache namespace changes to `chronoage-2.0.12`; activation removes older `chronoage-*` caches while preserving unrelated same-origin cache namespaces.

## Final accuracy boundary

This handoff intentionally distinguishes implemented source from external release evidence.

Do not claim that `npm ci`, a registry-resolved lockfile, a clean full release gate, branch protection, or the `v2.0.12` GitHub release has succeeded until GitHub or another clean network-enabled environment provides actual verifiable evidence.
