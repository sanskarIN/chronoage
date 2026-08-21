# Development Guide

## Principles

- Keep calendar rules in `src/domain`.
- Keep React components focused on presentation and interaction.
- Keep persistence behind `src/storage` functions.
- Treat every date/time string and imported backup as untrusted input.
- Do not add network dependencies to basic calculations.
- Preserve local-first behavior unless an ADR approves a model change.
- Put normal user-facing English UI copy in `src/i18n/en.ts` rather than scattering literals through components.
- Put runtime project identity, contacts, repository/funding URLs, license name, and version in `src/config/project.ts`.
- Do not duplicate a domain rule in the presentation layer to make a screen easier to implement.
- Treat unexpected exception messages as implementation details; expose only `DateCalculationError` or `UserVisibleError` messages through `getUserSafeErrorMessage`.

## Commands

```bash
npm run dev
npm run format
npm run lint
npm run typecheck
npm test
npm run build
npm run performance:check
npm run test:e2e
npm run check
npm run release:npm-lock:check
npm run release:cargo-lock:check
npm run release:locks:check
npm run native:format:check
npm run native:lint
npm run native:check
```

`npm run performance:check` expects an existing `dist/` build and enforces the documented gzip budgets for first-party JavaScript and CSS.

The release lockfile commands validate committed npm/Cargo lockfile identity and consistency. They intentionally fail while a required lockfile is absent rather than inventing dependency state. For generation, review, `npm ci`, locked Cargo, deterministic archive, and evidence requirements, read [Reproducible Builds and Lockfiles](reproducible-builds.md).

`npm run native:format:check` verifies Rust formatting with `rustfmt`. `npm run native:lint` runs Clippy across all native targets/features and treats warnings as failures. `npm run native:check` regenerates native icons, checks Rust formatting, performs `cargo check`, and runs Clippy.

For the complete native quality, dependency-pin, CI, and lockfile policy, read [Native Quality and Reproducibility](native-quality.md).

## Native Rust toolchain

The native shell uses the exact Rust toolchain declared in the repository-root `rust-toolchain.toml`. The pin also installs `rustfmt` and Clippy so local development and CI use the same native quality tools.

Do not add `rustup update stable` to permanent CI. That would make an unchanged commit compile against different Rust versions over time and would weaken reproducibility. To intentionally upgrade Rust:

1. Change the exact `channel` in `rust-toolchain.toml` after reviewing the Rust release notes.
2. Keep `rust-version` in `src-tauri/Cargo.toml` synchronized with the same exact version.
3. Run `rustup show active-toolchain` from the repository root and confirm it resolves to the intended version.
4. Run `npm run native:check` on a supported desktop host.
5. Run the complete Native CI matrix for Windows, macOS, Linux, Android, and iOS simulator targets.
6. Record the toolchain change in `CHANGELOG.md` when it affects release engineering or compatibility.

The repository metadata check rejects non-exact Rust channels, Cargo/toolchain Rust-version drift, non-exact direct Tauri crate versions, missing `rustfmt`/Clippy components, missing Cargo Dependabot coverage, and Native CI that reintroduces an unpinned stable update.

## Adding a domain feature

1. Define/extend types in `src/types/models.ts`.
2. Add the pure business rule under `src/domain`.
3. Add edge-case tests first or with the implementation.
4. Add new English interface strings to `src/i18n/en.ts`.
5. Integrate the UI in a page/component.
6. Add focused component coverage for interactive behavior.
7. Add E2E coverage for the primary journey if user-visible.
8. Update docs/changelog if behavior changes.

## Date rules

Do not use raw millisecond division to derive calendar years or months. Years/months/days are civil-calendar concepts and must use calendar arithmetic. Elapsed totals may use timestamps after the correct instant is established.

A civil time in a timezone can be normal, nonexistent during a spring-forward gap, or repeated during a fall-back overlap. Reuse the domain timezone functions so gap rejection and earlier/later overlap selection stay consistent.

Do not bypass the supported civil-year range of `0001` through `9999` with raw JavaScript date normalization.

## Persistence rules

- Validate data at storage boundaries even if the UI already validates it.
- Keep schema keys versioned.
- Reject invalid imports rather than partially committing an import.
- Local corrupted records may be ignored when valid neighboring records can be recovered safely.
- Never coerce unknown JSON types into security/privacy/accessibility settings merely because JavaScript considers them truthy.
- Keep exported backup formats language-neutral.
- Wrap expected storage/import failures in `UserVisibleError`; do not expose raw JSON parser, browser, or storage-engine errors to the UI.

## Internationalization

Read [internationalization.md](internationalization.md) before adding or changing visible product copy. English remains the only advertised locale until another locale receives a complete human review and UI validation.

Crash-recovery copy currently lives in `src/i18n/errors.ts`; if locale packs are introduced, move it into the same locale-selection mechanism rather than duplicating literals in the error boundary.

## Project metadata

Use `src/config/project.ts` for runtime metadata. When preparing a release, update the package version and runtime project version together, then verify every displayed version through tests/release review.

## Logging and runtime failures

Use `logger` rather than ad-hoc `console` calls for application events. `npm run security:check` enforces that runtime source does not bypass the privacy-safe logger.

Do not log profile names, dates of birth, times, tokens, emails, authorization values, secrets, raw imported content, or full backup payloads. The logger additionally redacts common email, bearer-token, date, and clock-time text patterns and guards against circular/deep objects. Aggregate non-sensitive counts are acceptable when they help diagnose local data corruption.

The application root is wrapped by `AppErrorBoundary`, and global `error`/`unhandledrejection` events are routed through the sanitized logger. Recovery UI must remain local-only and must not imply that crash reports are uploaded.
