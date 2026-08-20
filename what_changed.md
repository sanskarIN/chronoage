# ChronoAge — Current Work Handoff

## Current source state

ChronoAge remains source version **2.0.12** on `main`.

- Repository: `https://github.com/sanskarIN/chronoage`
- Shared product runtime: React + TypeScript + Vite
- Native delivery: Tauri 2 + Rust
- Supported source targets: Web/PWA, Windows, macOS, Linux, Android, iOS/iPadOS
- Exact Node pin: `22.13.0`
- Exact Rust pin: `1.97.1`
- Native identifier: `in.sanskar.chronoage`
- License: MIT
- Current handoff head after this continuation: `83aff9e0d0821c46ad9ef90ea22debd5597a561f`

This handoff reports implemented repository state only. It does **not** claim green hosted CI, signed installers, notarization, mobile-store publication, or protected-branch enforcement unless those items have separately been verified.

## Continuation completed on 2026-08-20

This continuation added **20 focused commits** after the previous cross-platform checkpoint.

### Native reproducibility and Rust quality

Added repository-root `rust-toolchain.toml` with:

```toml
[toolchain]
channel = "1.97.1"
profile = "minimal"
components = ["clippy", "rustfmt"]
```

`src-tauri/Cargo.toml` now declares the same Rust requirement:

```toml
rust-version = "1.97.1"
```

The direct native Tauri dependencies are exact-pinned:

```toml
tauri-build = { version = "=2.6.3", features = [] }
tauri = { version = "=2.11.5", features = [] }
```

This reduces direct native dependency drift while the real Cargo lockfile remains pending. It does not pretend to replace transitive dependency locking.

### Native developer quality commands

`package.json` now includes:

```bash
npm run native:format:check
npm run native:lint
npm run native:check
```

- `native:format:check` runs Rust formatting verification.
- `native:lint` runs Clippy across native targets/features and denies warnings.
- `native:check` regenerates icons, verifies Rust formatting, performs `cargo check`, and runs Clippy.

Repository text-format checking now includes `.toml` files as well.

### Native CI hardening

`.github/workflows/native.yml` no longer runs `rustup update stable`.

Every native job now reports the active pinned repository toolchain with:

```bash
rustup show active-toolchain
```

The Linux desktop job additionally runs:

- native icon generation;
- `cargo fmt --check` through the npm helper;
- Clippy with warnings denied;
- native compile/build verification.

The existing platform smoke-build matrix remains:

- Linux desktop;
- Windows desktop;
- macOS desktop;
- Android ARM64 debug APK;
- iOS simulator.

### Native dependency monitoring

`.github/dependabot.yml` now monitors Cargo dependencies under `/src-tauri` in addition to npm and GitHub Actions.

`scripts/check-metadata.mjs` now fails if:

- the Rust toolchain is not an exact `MAJOR.MINOR.PATCH` pin;
- `rustfmt` or Clippy is removed from the toolchain components;
- `Cargo.toml` and `rust-toolchain.toml` disagree about the Rust version;
- direct `tauri` or `tauri-build` dependencies stop using exact Cargo pins;
- Native CI reintroduces `rustup update stable`;
- Native CI stops reporting its active toolchain;
- Cargo Dependabot coverage is removed or no longer targets `/src-tauri`.

### Native runtime regression coverage

Added `tests/platform.test.ts`.

It verifies both runtime states by mocking Tauri's official detector:

- Tauri runtime -> native=true, web=false;
- normal browser runtime -> native=false, web=true.

This protects the boundary that prevents browser-only PWA install/service-worker/update behavior from running inside installed Tauri applications.

## Date-domain correctness improvements

### Exported helper validation

Exported calendar helpers now enforce the same domain invariants as the UI/storage boundaries.

The following cases are rejected rather than silently normalized:

- `daysInMonth` years outside `0001` through `9999`;
- invalid dates passed to `formatDateInput`;
- invalid dates passed to `weekdayName`;
- invalid dates passed to `addYearsClamped`;
- invalid dates passed to `addMonthsClamped`;
- fractional year arithmetic;
- fractional month arithmetic.

Regression tests were added for each of these boundary classes.

### Derived anniversary DST-gap bug fixed

A valid birth/reference pair could previously fail when its **derived calendar anniversary anchor** landed inside a spring-forward gap that did not exist in the birth year.

Example class:

- valid birth local time in an earlier year;
- same date/time in a later anniversary year falls inside a DST gap;
- valid reference time exists after the gap;
- old behavior could throw while resolving the derived anchor.

The date-domain implementation now distinguishes two cases:

1. **User-entered nonexistent local time** — still rejected. ChronoAge does not silently rewrite the user's birth/reference input.
2. **Internally derived anniversary anchor in a gap** — shifted forward by the actual timezone offset increase using the browser's IANA data.

The gap is not hard-coded to one hour.

New regressions cover:

- a one-hour `America/New_York` spring-forward gap;
- the real 30-minute `Australia/Lord_Howe` spring-forward gap.

This behavior is documented in `docs/date-semantics.md`.

## Documentation added/updated

Added:

- `docs/native-quality.md` — native toolchain, exact dependency pins, CI quality gates, Dependabot, lockfile boundary, upgrade procedure, and release-evidence rules.

Updated:

- `docs/development.md` — native quality commands, synchronized Rust pins, metadata enforcement, and link to the dedicated native quality guide.
- `docs/date-semantics.md` — derived DST-gap semantics and exported-helper validation rules.
- `what_changed.md` — this current handoff.

## Focused commits in this continuation

1. `build(rust): pin native toolchain to 1.97.1`
2. `build(native): add rust format and clippy quality scripts`
3. `test(metadata): enforce exact rust toolchain pin`
4. `ci(native): use pinned rust and enforce format clippy`
5. `chore(deps): add cargo dependabot coverage`
6. `test(runtime): cover tauri and web platform detection`
7. `docs(dev): document pinned rust quality workflow`
8. `test(metadata): require cargo dependency monitoring`
9. `build(rust): declare exact minimum rust version`
10. `build(rust): pin direct tauri crate versions exactly`
11. `test(metadata): enforce cargo rust and dependency pins`
12. `test(format): include rust toml configuration files`
13. `docs(native): add quality and reproducibility guide`
14. `docs(dev): link native quality policy and synchronized pins`
15. `fix(date): validate exported calendar helper boundaries`
16. `test(date): cover helper validation boundaries`
17. `test(date): cover arithmetic input hardening`
18. `fix(date): resolve derived age anchors across timezone gaps`
19. `test(date): cover derived timezone gap anchors`
20. `docs(date): define derived anniversary gap semantics`

The handoff update itself is the next focused documentation commit after those twenty implementation/documentation commits.

## Existing cross-platform architecture retained

ChronoAge continues to use one shared product implementation rather than separate calculator engines per platform.

| Platform | Browser/PWA | Native source support | Delivery path |
| --- | --- | --- | --- |
| Windows | Yes | Yes | Tauri desktop |
| macOS | Yes | Yes | Tauri desktop |
| Linux | Yes | Yes | Tauri desktop |
| Android | Yes | Yes | Tauri Android APK/AAB |
| iOS / iPadOS | Yes | Yes | Tauri iOS |

The shared TypeScript domain remains authoritative for age/date calculations, timezone behavior, storage validation, routing, privacy, and accessible UI behavior.

## Existing product functionality retained

### Age/date tools

- exact calendar years/months/days;
- optional time-of-day precision;
- elapsed day/hour/minute totals;
- next birthday date/weekday/countdown;
- age difference;
- inclusive/exclusive intervals;
- Gregorian leap-year handling;
- configurable February 29 policy;
- built-in and custom milestones;
- calendar-duration comparison visualization;
- civil-year range `0001` through `9999`.

### Timezone/DST

- runtime-supported IANA timezones via `Intl`;
- free-form timezone entry with suggestions/validation;
- direct spring-forward gap rejection;
- fall-back overlap candidate discovery;
- earlier/later overlap policy;
- derived-anniversary compatible forward resolution across timezone gaps.

### Local-first data and privacy

- saved profiles stored locally;
- editing/deletion/undo;
- validated import/export;
- bounded profile collection/rendering;
- privacy-safe runtime logging/redaction;
- no analytics requirement for core functionality;
- least-privilege native capability baseline.

### Accessibility/PWA

- keyboard/focus handling for modal flows;
- route focus/title management;
- Playwright accessibility audits in the existing web quality suite;
- service-worker offline behavior;
- controlled install/update lifecycle;
- responsive desktop/mobile web UI.

## Evidence checked during this continuation

### Verified

- Repository writes succeeded on `main`.
- Current head and commit sequence were re-read from GitHub after the changes.
- `main` branch metadata was read through GitHub.
- `main` is currently reported as **unprotected** and required status checks are reported as **off**.
- The connected GitHub surface did not expose a branch-protection/ruleset write action.
- The connected GitHub surface did not expose a workflow-dispatch/listing action suitable for proving the new direct-push CI runs.
- Combined commit status for the current continuation head returned no statuses through the available status API.

### Not claimed

This continuation does **not** claim that:

- the new web CI run is green;
- the new Native CI matrix is green;
- `main` branch protection has been enabled;
- a real npm lockfile has been generated;
- a real Cargo lockfile has been generated;
- signed/notarized/store-ready artifacts have been produced.

## Remaining release-quality blockers

### 1. Real npm lockfile

A genuine `package-lock.json` still needs to be generated from a successful network-enabled clean dependency resolution, reviewed, and committed. After that, permanent CI/release installation should move from `npm install` to `npm ci`.

Do **not** hand-author or guess this file.

### 2. Real Cargo lockfile

A genuine `src-tauri/Cargo.lock` still needs to be generated from a successful native Cargo dependency resolution, reviewed, and committed.

Exact direct dependency pins reduce drift but do not replace this lockfile.

Do **not** hand-author or guess this file.

### 3. Hosted release-candidate evidence

Record a clean-checkout passing run for:

```bash
npm run check
npm run test:e2e
npm run native:check
```

and the full hosted Native CI matrix.

### 4. Protect `main`

GitHub currently reports `main` as unprotected. Configure an effective branch protection rule/ruleset that requires the project's release-quality status checks before merge and prevents accidental direct release-breaking changes.

### 5. Signed platform artifacts

Complete platform-specific signing/notarization/store requirements only after credentials and release accounts are available. Source support is not equivalent to published binaries.

## Next safe continuation point

The best next work is evidence/release hardening rather than adding duplicate cross-platform code:

1. generate and review the real npm lockfile in a network-enabled clean checkout;
2. migrate npm CI/release installs to `npm ci` only after that lockfile exists;
3. generate and review the real Cargo lockfile;
4. run/record the complete web and native release-candidate checks;
5. enable and verify effective `main` branch protection/rulesets;
6. then proceed to signed platform release artifacts when credentials are available.

Until those external/evidence steps are completed, keep them explicitly open rather than marking them done from source inspection alone.
