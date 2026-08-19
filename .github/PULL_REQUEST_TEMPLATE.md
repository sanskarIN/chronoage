## What changed

Describe the user problem and the solution. Keep the pull request focused on one coherent purpose.

## Verification

Check only commands you actually ran. If an environment prevented a check, explain that below rather than marking it complete.

- [ ] `npm run check`
- [ ] `npx playwright install --with-deps chromium` when browser dependencies were needed
- [ ] `npm run test:e2e` when user journeys, accessibility, routing, PWA, or responsive behavior changed
- [ ] `npm audit --omit=dev --audit-level=high` for release/dependency-sensitive changes

Verification notes / environment limitations:

## Quality review

- [ ] Added/updated focused regression tests for behavior changes
- [ ] Considered leap-year/date-boundary/timezone/DST edge cases where relevant
- [ ] Checked keyboard focus, labels, status announcements, and screen-reader behavior for UI/navigation changes
- [ ] Checked mobile/responsive behavior for navigation or layout changes
- [ ] Checked dark/light/system themes and reduced-motion behavior for relevant UI changes
- [ ] Kept calculator/profile/private values out of public route URLs and logs unless explicit sharing is the feature
- [ ] Did not add real profile backups, localStorage dumps, secrets, private personal data, or production credentials
- [ ] Preserved local-first behavior or documented/reviewed any proposed network/cloud boundary change
- [ ] Considered offline/PWA/manifest/service-worker behavior when relevant
- [ ] Updated README/docs/changelog/roadmap when public behavior or maintenance commands changed

## Persistence / migration

- [ ] No persisted schema change
- [ ] Persisted schema changed and migration/compatibility behavior is documented and tested
- [ ] Not applicable

## Screenshots

Add before/after screenshots for material visual changes. Use fictional data and remove unrelated personal information.
