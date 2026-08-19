# Release Guide

## Release checklist

1. Pull the latest `main` from a clean checkout.
2. Verify Node version matches `package.json`.
3. Run `npm install`.
4. Run `npm run check`, including project-metadata consistency verification.
5. Run `npx playwright install --with-deps chromium` and `npm run test:e2e`.
6. Confirm the Playwright suite includes the maintained axe WCAG audits and release-candidate screenshot scenarios.
7. Run `npm audit --omit=dev --audit-level=high` and review CodeQL/Dependabot results.
8. Verify PWA install, offline reload, update-check, and waiting-update application behavior manually.
9. Verify keyboard navigation, focus visibility, dark/light/system theme, reduced motion, 200% zoom, and print output.
10. Review the generated calculator, difference, milestone, and mobile screenshots for layout regressions.
11. Update `CHANGELOG.md`, `ROADMAP.md`, package/runtime version numbers, and `what_changed.md`.
12. Run `npm run metadata:check` again after changing version metadata.
13. Confirm no real credentials, private data, debug exports, or local backup files are staged.
14. Create and push a signed/annotated version tag where available.

## GitHub release workflow

Pushing a tag matching `v*.*.*` runs `.github/workflows/release.yml`. The tag workflow:

1. installs dependencies;
2. runs the complete non-E2E quality suite;
3. audits high-severity runtime dependency vulnerabilities;
4. installs Chromium;
5. reruns browser journeys and automated accessibility verification on the tagged commit;
6. archives the verified `dist/` web build;
7. creates the GitHub Release from the verified tag.

A release therefore does not rely only on an earlier branch build for browser/accessibility confidence.

## Versioning

Use semantic versioning:

- PATCH — compatible bug/security fixes,
- MINOR — compatible features,
- MAJOR — intentional breaking changes to public behavior or persisted schema.

`package.json` and `src/config/project.ts` must carry the same version. `npm run metadata:check` enforces this relationship along with project name/license/primary author-email consistency.

## Desktop packaging

The supported desktop delivery is the installable PWA. See [desktop.md](desktop.md) and ADR-0006. A native wrapper should be added only after a concrete native-only requirement exists and after updater, signing/notarization, permissions, platform packaging, and CI secret handling are designed and reviewed.
