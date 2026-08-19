# Testing

ChronoAge uses layered automated tests because calendar, timezone, persistence, accessibility, and offline behavior are edge-heavy.

## Unit tests

`tests/dateMath.test.ts` covers Gregorian leap-year rules, leap-day anniversary policies, supported-year boundaries, exact calendar decomposition, clock-time borrowing, IANA timezone conversion, DST gap rejection, repeated fall-back candidate discovery, earlier/later ambiguity selection, inclusive/exclusive intervals, birthday calculation, and date-order-independent age difference.

`tests/milestones.test.ts` protects built-in and custom milestone calculations, including 10,000 days, custom birthday years, leap-day behavior, and invalid custom amounts.

`tests/dateProperties.test.ts` runs deterministic invariant/fuzz-style coverage across many civil dates so epoch-day conversion, ordering, and symmetric age-difference rules are exercised beyond hand-picked examples.

`tests/validation.test.ts` covers profile-name normalization, control-character rejection, length/non-empty limits, and birth-date validation.

## Storage integration tests

`tests/profiles.test.ts` verifies local save/load, edits, backup round trips, invalid import rejection, UTF-8 backup byte limits, duplicate-id rejection, ISO timestamp validation, and safe recovery when corrupted local entries are mixed with valid records.

`tests/settings.test.ts` validates defaults, DST-setting migration, malformed-storage recovery, and prevention of truthy-string coercion for boolean preferences.

## Component tests

- `tests/App.test.tsx` verifies application rendering, navigation, and quick actions.
- `tests/ProfilesPage.test.tsx` verifies local profile filtering and editing.
- `tests/CalculatorPage.test.tsx` verifies the visible DST-overlap preference and spring-forward error feedback.
- `tests/MilestonesPage.test.tsx` verifies the custom milestone builder and validation feedback.
- `tests/DurationVisualization.test.tsx` verifies exact accessible summaries, endpoint labels, and zero-duration rendering.
- `tests/DifferencePage.test.tsx` verifies chronological visualization ordering even when inputs are entered in reverse order.

## End-to-end tests

Playwright runs both desktop Chromium and a Pixel-class mobile Chromium project. Shared helpers in `tests/e2e/helpers.ts` seed the backwards-compatible completed-onboarding state and navigate through either the visible desktop sidebar or the mobile navigation drawer, so the same user journeys are exercised responsively instead of accidentally clicking hidden controls.

Browser coverage includes:

- `tests/e2e/app.spec.ts` — primary age calculation and local profile create/delete journeys;
- `tests/e2e/accessibility.spec.ts` — structural accessibility checks and axe WCAG audits;
- `tests/e2e/pwa.spec.ts` — service-worker control, offline reload, and non-navigation asset fallback behavior;
- `tests/e2e/screenshots.spec.ts` — calculator, date-difference visualization, custom milestone builder, and mobile release-candidate captures.

E2E tests seed only the minimal settings needed to bypass first-run onboarding. The settings loader fills missing fields using production migration/default behavior, keeping the seed concise while still exercising compatibility.

```bash
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

## Accessibility automation

The accessibility E2E suite uses two complementary layers.

The product-specific smoke layer verifies:

- primary navigation and main landmarks;
- skip-link target wiring;
- a single primary page heading;
- accessible names for buttons;
- labels for visible inputs;
- alternative text on content images;
- accessible labels for the duration visualization;
- labels for custom milestone controls.

The standards-engine layer uses the pinned `@axe-core/playwright` package and fails on automated WCAG A/AA violations. It scans every core page plus dark-theme and mobile-breakpoint states. Rule-engine updates should be reviewed rather than silently bypassed when they surface a real product issue.

Automated accessibility testing complements but does not replace manual keyboard, zoom, screen-reader, reduced-motion, and platform assistive-technology review.

## PWA/offline regression coverage

The PWA browser test waits until the service worker controls the page, performs an online controlled reload so runtime resources can populate the cache, switches the browser context offline, reloads the application, and verifies the main calculator remains usable. It also requests a deliberately missing CSS asset and verifies that the request fails rather than receiving cached `index.html`.

This protects the distinction between navigation fallback and asset failure that is implemented in `public/sw.js`.

## Coverage

Vitest V8 coverage thresholds are configured in `vite.config.ts`. Coverage is a signal, not a substitute for meaningful edge-case tests.

## Repository invariant checks

The quality suite also contains non-test executable checks:

- `npm run metadata:check` — keeps package and runtime project identity/version/link metadata consistent;
- `npm run security:check` — verifies the expected static browser policy and rejects selected dangerous source primitives;
- `npm run docs:links` — verifies local documentation links;
- `npm run release:check -- vX.Y.Z` — verifies a candidate release tag matches the package version.

## Benchmarks

`tests/dateMath.bench.ts` measures timezone-aware age calculation. Run it when timezone-candidate logic or other hot date paths change:

```bash
npm run bench
```

Benchmarks are comparative engineering signals; do not claim a universal runtime guarantee from one machine.

## Regression policy

Every fixed calculation, persistence, accessibility, PWA, security, or release-automation bug should add a focused test or executable invariant when the behavior can be reproduced deterministically.

## CI

CI fails on repository formatting conventions, metadata/security invariants, lint, type errors, unit/component tests, documentation links, production build errors, runtime dependency-audit failures, and E2E failures. CodeQL and dependency-review workflows remain separate so their permissions stay explicit and least-privilege.
