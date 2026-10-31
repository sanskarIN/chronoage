# Performance

ChronoAge is intentionally small and local-first.

## Budgets

Release budgets:

- Total first-party JavaScript: at most 250 KiB gzip.
- Total first-party CSS: at most 60 KiB gzip.
- No runtime date library.
- No client-side routing library for the finite core page set.
- No calculation-triggered network requests.
- Local calculation response: effectively synchronous for normal interactive inputs.

The JavaScript and CSS transfer-size budgets are enforced against built `dist/` assets by `scripts/check-bundle-size.mjs` rather than existing only as documentation.

## Automated bundle budget gate

Build first, then run the budget checker:

```bash
npm run build
npm run performance:check
```

The checker recursively measures production `.js` and `.css` files using Node's gzip implementation and fails when either total exceeds the configured limit. Source maps and unrelated assets are excluded from the transfer-size totals.

The default limits can be overridden for an intentional reviewed experiment without changing the script:

```bash
CHRONOAGE_JS_GZIP_BUDGET_KIB=250 CHRONOAGE_CSS_GZIP_BUDGET_KIB=60 npm run performance:check
```

Increasing a release budget should be treated as a product/performance decision, not as a way to silence a regression. CI and the release quality suite use the repository defaults.

## Design decisions

- Native `Intl` avoids shipping a timezone/date library.
- The finite page set uses native hash/history APIs instead of a runtime routing dependency.
- Pages use derived memoized calculations rather than network state.
- Saved profiles are capped at 100 and rendered in batches of 20. Search and sorting still evaluate only that bounded local collection, while DOM work stays small until the user requests more matching cards.
- Profile sorting copies the bounded array instead of mutating/re-persisting storage solely for presentation ordering.
- The service worker caches only same-origin GET resources.
- PWA shortcuts reuse the same root application shell and public hash routes rather than requiring separate entry bundles.
- No analytics or third-party UI framework is loaded.
- The duration visualization uses three lightweight DOM segments and does not introduce a charting dependency.

## Timezone conversion cost

Timezone-aware calculation performs more work than civil-date-only calculation because an IANA local time must be mapped to a real instant.

`zonedLocalToUtcCandidates`:

1. iteratively corrects a UTC-shaped guess using `Intl.DateTimeFormat` output;
2. round-trips the result to reject nonexistent local times;
3. samples a small fixed set of nearby offsets to discover repeated fall-back candidates;
4. validates each candidate before selection.

The sample count is constant and independent of the user's age, so the algorithm does not scan every day/year in the interval. Date-only calculations bypass that timezone candidate work.

## Benchmark

The repository includes `tests/dateMath.bench.ts`:

```bash
npm run bench
```

Run the benchmark before and after changes to timezone conversion, calendar decomposition, or milestone hot paths. Record the environment and relative change when documenting a regression or optimization.

Do not commit machine-specific timing numbers as universal guarantees. CI/browser environments, ICU timezone data, and hardware vary.

## Browser measurement

Use browser Performance/Lighthouse tooling against `npm run preview`, not the development server. Measure at least:

- initial JavaScript/CSS transfer sizes;
- first render and interaction readiness;
- calculator input-to-result responsiveness;
- Difference page visualization rendering;
- Milestones page rendering with the built-in timeline;
- profile filtering/sorting at the 100-profile cap, including initial 20-card rendering and progressive reveal;
- page-route navigation and Back/Forward responsiveness;
- offline reload behavior after service-worker installation.

Record regressions in pull requests when a change materially increases bundle size or interaction latency.
