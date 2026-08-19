# Release Guide

## Release checklist

1. Pull the latest `main` from a clean checkout.
2. Verify Node version matches `package.json`.
3. Run `npm install`.
4. Run `npm run check`.
5. Run `npx playwright install --with-deps chromium` and `npm run test:e2e`.
6. Review `npm audit` output and CodeQL/Dependabot results.
7. Verify PWA install/offline behavior manually.
8. Verify keyboard navigation, focus visibility, dark/light/system theme, reduced motion, and print output.
9. Update `CHANGELOG.md`, `ROADMAP.md`, version numbers, and `what_changed.md`.
10. Create and push a signed/annotated version tag where available.

## GitHub release workflow

Pushing a tag matching `v*.*.*` runs `.github/workflows/release.yml`, which installs dependencies, verifies the project, builds `dist/`, archives it, and attaches the artifact to a GitHub Release.

## Versioning

Use semantic versioning:

- PATCH — compatible bug/security fixes,
- MINOR — compatible features,
- MAJOR — intentional breaking changes to public behavior or persisted schema.

## Desktop packaging

Tauri is roadmap work and is not part of v1.0. Add it only after a dedicated ADR covering updater, signing, permissions, and platform packaging.
