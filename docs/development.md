# Development Guide

## Principles

- Keep calendar rules in `src/domain`.
- Keep React components focused on presentation and interaction.
- Keep persistence behind `src/storage` functions.
- Treat every date/time string as untrusted input.
- Do not add network dependencies to basic calculations.
- Preserve local-first behavior unless an ADR approves a model change.

## Commands

```bash
npm run dev
npm run format
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run check
```

## Adding a domain feature

1. Define/extend types in `src/types/models.ts`.
2. Add the pure business rule under `src/domain`.
3. Add edge-case tests first or with the implementation.
4. Integrate the UI in a page/component.
5. Add E2E coverage for the primary journey if user-visible.
6. Update docs/changelog if behavior changes.

## Date rules

Do not use raw millisecond division to derive calendar years or months. Years/months/days are civil-calendar concepts and must use calendar arithmetic. Elapsed totals may use timestamps after the correct instant is established.

## Logging

Use `logger` rather than ad-hoc logging for application events. Do not log profile names, dates of birth, tokens, emails, secrets, or raw imported content.
