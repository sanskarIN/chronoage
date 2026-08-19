# Testing

ChronoAge uses layered automated tests because calendar and timezone behavior is edge-heavy.

## Unit tests

`tests/dateMath.test.ts` covers Gregorian leap-year rules, leap-day anniversary policies, supported-year boundaries, exact calendar decomposition, clock-time borrowing, IANA timezone conversion, DST gap rejection, repeated fall-back candidate discovery, earlier/later ambiguity selection, inclusive/exclusive intervals, birthday calculation, and date-order-independent age difference.

`tests/milestones.test.ts` protects built-in and custom milestone calculations, including 10,000 days, custom birthday years, leap-day behavior, and invalid custom amounts.

`tests/dateProperties.test.ts` runs deterministic invariant/fuzz-style coverage across many civil dates so epoch-day conversion, ordering, and symmetric age-difference rules are exercised beyond hand-picked examples.

## Storage integration tests

`tests/profiles.test.ts` verifies local save/load, edits, backup round trips, invalid import rejection, duplicate-id rejection, ISO timestamp validation, and safe recovery when corrupted local entries are mixed with valid records.

`tests/settings.test.ts` validates defaults, DST-setting migration, malformed-storage recovery, and prevention of truthy-string coercion for boolean preferences.

## Component tests

- `tests/App.test.tsx` verifies application rendering, navigation, and quick actions.
- `tests/ProfilesPage.test.tsx` verifies local profile filtering and editing.
- `tests/CalculatorPage.test.tsx` verifies the visible DST-overlap preference and spring-forward error feedback.
- `tests/MilestonesPage.test.tsx` verifies the custom milestone builder and validation feedback.
- `tests/DurationVisualization.test.tsx` verifies exact accessible summaries, endpoint labels, and zero-duration rendering.
- `tests/DifferencePage.test.tsx` verifies chronological visualization ordering even when inputs are entered in reverse order.

## End-to-end tests

Playwright covers the primary age calculation and local profile journey on desktop. Additional browser checks cover navigation/accessibility semantics for advanced date tools and produce release-candidate screenshots for the calculator, date-difference visualization, custom milestone builder, and a mobile calculator viewport.

E2E tests seed only the minimal settings needed to bypass first-run onboarding. The settings loader fills missing fields using production migration/default behavior, keeping the test seed concise while still exercising compatibility.

```bash
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

## Accessibility regression checks

The Playwright accessibility smoke suite verifies:

- primary navigation and main landmarks;
- skip-link target wiring;
- a single primary page heading;
- accessible names for buttons;
- labels for visible inputs;
- alternative text on content images;
- accessible labels for the duration visualization;
- labels for custom milestone controls.

These checks catch common regressions but do not replace manual assistive-technology review or a maintained standards engine.

## Coverage

Vitest V8 coverage thresholds are configured in `vite.config.ts`. Coverage is a signal, not a substitute for meaningful edge-case tests.

## Benchmarks

`tests/dateMath.bench.ts` measures timezone-aware age calculation. Run it when timezone-candidate logic or other hot date paths change:

```bash
npm run bench
```

Benchmarks are comparative engineering signals; do not claim a universal runtime guarantee from one machine.

## Regression policy

Every fixed calculation, persistence, accessibility, or release-automation bug should add a focused test when the behavior can be reproduced deterministically.

## CI

CI fails on formatting, lint, type errors, unit/component tests, production build errors, documentation links, and E2E failures. Security workflows remain separate so their permissions stay least-privilege.
