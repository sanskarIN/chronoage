# Development Guide

## Principles

- Keep calendar rules in `src/domain`.
- Keep React components focused on presentation and interaction.
- Keep persistence behind `src/storage` functions.
- Treat every date/time string and imported backup as untrusted input.
- Do not add network dependencies to basic calculations.
- Preserve local-first behavior unless an ADR approves a model change.
- Put normal user-facing English UI copy in `src/i18n/en.ts` rather than scattering literals through components.
- Put runtime project identity, contacts, repository/funding URLs, license name, and version in `src/config/project.ts`.
- Do not duplicate a domain rule in the presentation layer to make a screen easier to implement.

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
4. Add new English interface strings to `src/i18n/en.ts`.
5. Integrate the UI in a page/component.
6. Add focused component coverage for interactive behavior.
7. Add E2E coverage for the primary journey if user-visible.
8. Update docs/changelog if behavior changes.

## Date rules

Do not use raw millisecond division to derive calendar years or months. Years/months/days are civil-calendar concepts and must use calendar arithmetic. Elapsed totals may use timestamps after the correct instant is established.

A civil time in a timezone can be normal, nonexistent during a spring-forward gap, or repeated during a fall-back overlap. Reuse the domain timezone functions so gap rejection and earlier/later overlap selection stay consistent.

Do not bypass the supported civil-year range of `0001` through `9999` with raw JavaScript date normalization.

## Persistence rules

- Validate data at storage boundaries even if the UI already validates it.
- Keep schema keys versioned.
- Reject invalid imports rather than partially committing an import.
- Local corrupted records may be ignored when valid neighboring records can be recovered safely.
- Never coerce unknown JSON types into security/privacy/accessibility settings merely because JavaScript considers them truthy.
- Keep exported backup formats language-neutral.

## Internationalization

Read [internationalization.md](internationalization.md) before adding or changing visible product copy. English remains the only advertised locale until another locale receives a complete human review and UI validation.

## Project metadata

Use `src/config/project.ts` for runtime metadata. When preparing a release, update the package version and runtime project version together, then verify every displayed version through tests/release review.

## Logging

Use `logger` rather than ad-hoc logging for application events. Do not log profile names, dates of birth, tokens, emails, secrets, raw imported content, or full backup payloads. Aggregate non-sensitive counts are acceptable when they help diagnose local data corruption.
