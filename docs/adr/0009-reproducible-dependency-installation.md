# ADR 0009: Reproducible dependency installation policy

- **Status:** Accepted
- **Date:** 2026-09-02

## Context

ChronoAge has pinned Node and Rust toolchains and a release workflow that already requires `npm ci`. The permanent CI workflows still use `npm install` because the genuine `package-lock.json` is not yet committed. Switching those workflows early would make CI fail rather than improve reproducibility.

## Decision

ChronoAge uses a two-stage dependency-installation policy:

1. **Before `package-lock.json` exists:** permanent CI may use `npm install --no-fund --no-audit` so the repository remains buildable. A policy check must make this transitional state explicit.
2. **After a genuine npm lockfile is committed:** every CI workflow that installs frontend dependencies must use `npm ci`; `npm install` becomes a policy violation.
3. **Release verification:** release workflows always require the lockfile and use `npm ci`.
4. The policy is enforced by `scripts/check-install-policy.mjs` and runs before dependency installation in CI/native workflows.

## Rationale

This avoids creating a fake or hand-authored lockfile while establishing an automatic guardrail for the eventual migration. The policy therefore improves reproducibility without claiming the reproducibility gate is complete prematurely.

## Consequences

- A future genuine `package-lock.json` automatically changes the expected CI behavior from transitional `npm install` to locked `npm ci`.
- Pull requests cannot silently reintroduce `npm install` after the lockfile migration.
- The current repository remains honest about its outstanding lockfile gate.
- A matching Cargo lockfile remains a separate Rust reproducibility gate.

## Verification

The install-policy check is included in the normal `npm run check` chain and is also executed before dependency installation in CI, Native CI, and Release verification.
