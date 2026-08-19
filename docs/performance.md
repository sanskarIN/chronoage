# Performance

ChronoAge is intentionally small and local-first.

## Budgets

Target release budgets:

- Main JavaScript bundle: under 250 KiB gzip where practical.
- First-party CSS: under 60 KiB gzip.
- No runtime date library.
- No calculation-triggered network requests.
- Local calculation response: effectively synchronous for normal inputs.

## Design decisions

- Native `Intl` avoids shipping a timezone/date library.
- Pages use derived memoized calculations rather than network state.
- Saved profiles are capped at 100, so virtualization is unnecessary in v1.
- The service worker caches only same-origin GET resources.
- No analytics or third-party UI framework is loaded.

## Measurement

Use browser Performance/Lighthouse tooling against `npm run preview`, not the development server. Record regressions in pull requests when a change materially increases bundle size or interaction latency.
