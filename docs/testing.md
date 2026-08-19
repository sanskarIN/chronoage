# Testing

ChronoAge uses layered automated tests because calendar and timezone behavior is edge-heavy.

## Unit tests

`tests/dateMath.test.ts` covers Gregorian leap-year rules, leap-day anniversary policies, exact calendar decomposition, clock-time borrowing, IANA timezone conversion, inclusive/exclusive intervals, birthday calculation, and date-order-independent age difference.

`tests/milestones.test.ts` protects landmark calculations such as 10,000 days. `tests/dateProperties.test.ts` runs deterministic invariant/fuzz-style coverage across many civil dates.

## Storage integration tests

`tests/profiles.test.ts` verifies local save/load and backup round trips, including invalid import rejection. `tests/settings.test.ts` validates defaults and malformed-storage recovery.

## Component tests

`tests/App.test.tsx` verifies key rendering and navigation behavior in jsdom.

## End-to-end tests

Playwright covers the primary age calculation and local profile journey on desktop and a mobile viewport.

```bash
npm run build
npx playwright install --with-deps chromium
npm run test:e2e
```

## Coverage

Vitest V8 coverage thresholds are configured in `vite.config.ts`. Coverage is a signal, not a substitute for meaningful edge-case tests.

## Regression policy

Every fixed calculation bug should add a focused test that fails before the fix and passes after it.

## CI

CI fails on formatting, lint, type errors, unit/component tests, production build errors, documentation links, and E2E failures. Security workflows remain separate so their permissions stay least-privilege.
