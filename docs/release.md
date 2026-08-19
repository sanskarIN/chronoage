# Release Guide

## Release checklist

1. Pull the latest `main` from a clean checkout.
2. Verify Node.js is `22.13.0`, matching `.nvmrc` and the pinned CI/release runtime, and satisfies `package.json`.
3. Run `npm install` while the repository has no generated lockfile; after a reviewed `package-lock.json` is committed, use `npm ci` instead.
4. Run `npm run check`, including project-metadata, static-security, tests, production build, and bundle-budget verification.
5. Run `npx playwright install --with-deps chromium` and `npm run test:e2e`.
6. Confirm the Playwright suite includes maintained axe WCAG audits, offline PWA coverage, and release-candidate screenshot scenarios.
7. Run `npm audit --omit=dev --audit-level=high` and review CodeQL/Dependabot results.
8. Verify PWA install, offline reload, update-check, and waiting-update application behavior manually.
9. Verify keyboard navigation, focus visibility, dark/light/system theme, reduced motion, 200% zoom, and print output.
10. Trigger one controlled render failure in a development/release-candidate environment and verify the local crash-recovery screen appears without uploading diagnostics or exposing private values.
11. Review the generated calculator, difference, milestone, and mobile screenshots for layout regressions.
12. Confirm `npm run performance:check` reports JavaScript and CSS gzip totals within the release budgets.
13. Update `CHANGELOG.md`, `ROADMAP.md`, package/runtime version numbers, and `what_changed.md`.
14. Run `npm run metadata:check` again after changing version metadata.
15. Verify the intended tag before pushing it with `npm run release:check -- vX.Y.Z`.
16. Confirm no real credentials, private data, debug exports, local profile backups, or browser-storage dumps are staged.
17. Create and push a signed/annotated version tag where available.

The CI workflow also supports manual dispatch, so maintainers can run both quality and browser jobs explicitly on the release candidate before tagging.

## GitHub release workflow

Pushing a tag matching `v*.*.*` runs `.github/workflows/release.yml`. The tag workflow:

1. runs under the same pinned Node.js `22.13.0` runtime used by permanent CI;
2. installs dependencies;
3. verifies the tag exactly matches `v${package.json version}`;
4. runs the complete non-E2E quality suite, including metadata, static-security, unit/component tests, production build, and bundle-budget invariants;
5. audits high-severity runtime dependency vulnerabilities;
6. installs Chromium;
7. reruns browser journeys, offline PWA coverage, and automated accessibility verification on the tagged commit;
8. archives the verified `dist/` web build and generates a SHA-256 checksum;
9. creates the GitHub Release from the verified tag only after the verification job succeeds.

A release therefore cannot be produced from a mismatched version tag and does not rely only on an earlier branch build for browser/accessibility confidence. Pinning the Node runtime also prevents a moving Node 22 patch/minor selection from silently changing between otherwise identical release attempts.

## Reproducible dependency installation

A generated npm lockfile must come from a real successful npm resolution in a clean, network-enabled environment. Do not hand-author or infer `package-lock.json` metadata.

Once a reviewed lockfile exists:

1. commit it atomically;
2. change CI and release workflows from `npm install` to `npm ci`;
3. verify a clean checkout installs using only the lockfile contract;
4. keep Dependabot/dependency-review automation aligned with the committed lockfile.

Until that migration is complete, dependency versions remain pinned in `package.json`, but clean-install reproducibility is not considered fully proven.

## Versioning

Use semantic versioning:

- PATCH — compatible bug/security fixes,
- MINOR — compatible features,
- MAJOR — intentional breaking changes to public behavior or persisted schema.

`package.json` and `src/config/project.ts` must carry the same version. `npm run metadata:check` enforces this relationship along with project name, license, repository/funding links, and primary author-email consistency.

The release tag must then match the package version exactly. For example, package version `1.2.0` requires tag `v1.2.0`. `npm run release:check -- v1.2.0` performs the same gate used by the GitHub release workflow.

## Desktop packaging

The supported desktop delivery is the installable PWA. See [desktop.md](desktop.md) and ADR-0006. A native wrapper should be added only after a concrete native-only requirement exists and after updater, signing/notarization, permissions, platform packaging, and CI secret handling are designed and reviewed.
