# Contributing to ChronoAge

Thanks for helping improve ChronoAge.

## Before you begin

1. Search existing issues and pull requests.
2. Use an issue for significant behavioral changes before investing in a large implementation.
3. Never include personal birth dates, API keys, secrets, or production-only data in fixtures.
4. Keep user-facing behavior local-first unless a future architecture decision explicitly changes that model.
5. Read [docs/github.md](docs/github.md) for repository labels, milestones, Discussions, branch protection, and release-setting guidance.

## Local workflow

```bash
npm install
npm run dev
```

Before opening a pull request:

```bash
npm run check
npx playwright install --with-deps chromium
npm run test:e2e
```

`npm run check` verifies formatting conventions, project metadata consistency, lint, TypeScript, unit/component tests with coverage, documentation links, and the production build.

## Code expectations

- Keep domain logic independent from React.
- Prefer small cohesive functions and explicit types.
- Add regression tests for every bug fix.
- Preserve keyboard and screen-reader behavior when changing UI.
- Put ordinary user-facing English copy in `src/i18n/en.ts` and follow `docs/internationalization.md`.
- Reuse `src/config/project.ts` for runtime project metadata instead of duplicating links/version/contact details.
- Update documentation when behavior or commands change.
- Use Conventional Commits where practical (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:`, `chore:`).

## Pull requests

Explain the user problem, the solution, testing performed, accessibility impact, privacy/security impact, and screenshots for visible UI changes. Keep unrelated refactors in separate pull requests.

## Contact

Project: https://github.com/sanskarIN/chronoage  
Business: sanskarin@outlook.in  
Support: supportramsandesh@gmail.com
