# ChronoAge Release Notes

This directory contains source-controlled notes for versioned ChronoAge releases.

## Releases

- [2.0.12](2.0.12.md) — 2026-08-19

## Version-documentation invariant

`npm run metadata:check` requires the version in `package.json` and `src/config/project.ts` to match and also requires:

- a dated `## [VERSION] - ...` entry in `CHANGELOG.md`;
- a `docs/releases/VERSION.md` file whose title identifies the same ChronoAge version.

This keeps a version bump from silently landing without its release documentation.

A source release note does not by itself prove that a GitHub tag or artifact has been published. Follow [../release.md](../release.md) and satisfy all evidence-gated release checks before tagging.
