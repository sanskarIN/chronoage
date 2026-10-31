# Contributing to ChronoAge

Thanks for helping improve ChronoAge.

## Before you begin

1. Search existing issues and pull requests.
2. Use an issue for significant behavioral changes before investing in a large implementation.
3. Never include personal birth dates, profile backups, API keys, secrets, or production-only data in fixtures, screenshots, logs, or issue reproductions.
4. Keep user-facing behavior local-first unless a future architecture decision explicitly changes that model.
5. Read [docs/github.md](docs/github.md) for repository labels, milestones, Discussions, branch protection, and release-setting guidance.

## Local workflow

Use Node.js `22.13.0` (the `.nvmrc`/CI pin) when reproducing release-sensitive behavior.

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

`npm run check` verifies formatting conventions, project/runtime metadata consistency, static security invariants, lint, TypeScript, unit/component tests with coverage, documentation links, the production build, and bundle budgets.

The repository is still completing its verified npm-lockfile migration. Until a reviewed `package-lock.json` lands, follow the installation command documented on `main`; do not hand-author lockfile metadata.

## Code expectations

- Keep domain logic independent from React.
- Prefer small cohesive functions and explicit types.
- Add regression tests for every bug fix.
- Preserve keyboard and screen-reader behavior when changing UI.
- Put ordinary user-facing English copy in `src/i18n/en.ts` and follow `docs/internationalization.md`.
- Reuse `src/config/project.ts` for runtime project metadata instead of duplicating links/version/contact details.
- Route core pages only through the finite `#/page` identifiers in `src/utils/navigation.ts`; do not put calculator dates/times, profile names, saved birth dates, search text, or results into route URLs.
- Keep ordinary document anchors such as `#main-content` outside the application route namespace.
- When changing SPA navigation, preserve route title updates, browser Back/Forward behavior, skip navigation, and main-content focus after overlays/drawers close.
- Treat saved-profile sorting/filtering as presentation behavior; do not rewrite local storage merely because visible ordering changes.
- Preserve confirmation before backup import replaces a non-empty profile collection.
- Keep manifest shortcuts inside the same public route namespace and free of private/query data.
- Use the shared `Field`/`SelectField` components when their semantics fit so label/help/error relationships remain accessible.
- Update documentation when behavior or commands change.
- Use Conventional Commits where practical (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `perf:`, `build:`, `ci:`, `chore:`).

## Regression expectations by area

- Date/time semantics: add deterministic domain tests, including leap/DST boundaries where relevant.
- Profile persistence/imports: cover storage behavior plus the user-facing workflow when possible.
- Navigation/privacy: cover route parsing and assert sensitive values are absent from URLs.
- Accessibility: cover focus/labels/status semantics and update browser accessibility checks for structural changes.
- PWA/service worker: cover manifest/static invariants and browser offline/update behavior where applicable.
- Visible responsive UI: update release-candidate screenshots when the intended appearance changes materially.

## Pull requests

Explain the user problem, the solution, testing performed, accessibility impact, privacy/security impact, and screenshots for visible UI changes. Keep unrelated refactors in separate pull requests.

Do not claim a quality gate passed if you could not execute it. Record environment limitations explicitly so reviewers can distinguish implemented regression coverage from verified execution evidence.

## Contact

Project: https://github.com/sanskarIN/chronoage  
Business: sanskarin@outlook.in  
Support: supportramsandesh@gmail.com
