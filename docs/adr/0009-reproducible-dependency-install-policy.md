# ADR 0009: Reproducible dependency install policy

- **Status:** Accepted
- **Date:** 2026-09-02

## Context

ChronoAge needs deterministic dependency installation without breaking the default branch while the genuine npm lockfile is still being generated and reviewed.

The repository has two dependency-installation states:

1. **Pre-lockfile:** the project does not contain `package-lock.json`, so CI may use `npm install` to resolve dependencies.
2. **Locked:** once a genuine, reviewed `package-lock.json` is committed, CI must use `npm ci` and must not silently fall back to `npm install`.

Release verification already requires `npm ci`; therefore the policy must also prevent accidental drift between permanent CI and release CI.

## Decision

Adopt a repository-level installation policy enforced by `scripts/check-install-policy.mjs`.

- Release verification always requires `npm ci`.
- Before `package-lock.json` exists, permanent web and native CI may use `npm install`.
- After `package-lock.json` exists, permanent web and native CI must use `npm ci`.
- The policy check runs as part of the normal project validation and immediately before dependency installation in GitHub Actions.
- No hand-authored or synthetic lockfile is acceptable; the lockfile must come from real npm dependency resolution using the pinned Node/npm toolchain.

## Consequences

This creates an explicit transition point for reproducibility rather than guessing whether a lockfile is trustworthy. The temporary `npm install` state remains intentional and visible, while the post-lockfile state becomes fail-closed against accidental use of `npm install`.

The same principle should be applied to Cargo once `src-tauri/Cargo.lock` is generated and reviewed: use the genuine Cargo-generated lockfile and locked verification for native builds.

## Verification

The policy is checked by `npm run install:policy:check` and is included in `npm run check`. GitHub Actions also runs the policy before installing dependencies.
