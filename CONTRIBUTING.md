# Contributing to ChronoAge

Thanks for helping improve ChronoAge.

## Before you begin

1. Search existing issues and pull requests.
2. Use an issue for significant behavioral changes before investing in a large implementation.
3. Never include personal birth dates, API keys, secrets, or production-only data in fixtures.
4. Keep user-facing behavior local-first unless a future architecture decision explicitly changes that model.

## Local workflow

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

## Code expectations

- Keep domain logic independent from React.
- Prefer small cohesive functions and explicit types.
- Add regression tests for every bug fix.
- Preserve keyboard and screen-reader behavior when changing UI.
- Update documentation when behavior or commands change.
- Use Conventional Commits where practical (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:`, `chore:`).

## Pull requests

Explain the user problem, the solution, testing performed, accessibility impact, privacy/security impact, and screenshots for visible UI changes. Keep unrelated refactors in separate pull requests.

## Contact

Project: https://github.com/sanskarIN/chronoage  
Business: sanskarin@outlook.in  
Support: supportramsandesh@gmail.com
