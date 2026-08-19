# Internationalization

ChronoAge ships English first but keeps user-facing interface copy externalized so additional reviewed locale packs can be added without rewriting feature components.

## Current structure

- `src/i18n/en.ts` contains English interface strings and interpolation helpers.
- Pages and reusable components import copy from the locale module instead of duplicating English literals for normal UI text.
- `Intl.DateTimeFormat` and `toLocaleString` are used for locale-sensitive browser formatting where appropriate.
- Domain helpers such as weekday and milestone formatting accept a locale argument where domain-generated labels require it.
- `src/config/project.ts` is the canonical runtime source for project version, repository/funding URLs, support contacts, license name, and visible credit. Those values should not be translated.

## Adding a locale

Do not machine-publish an unreviewed translation as a supported language.

1. Copy the complete English locale shape into a new locale module.
2. Translate user-facing prose while preserving placeholders and interpolation semantics.
3. Keep project names, email addresses, URLs, timezone identifiers, and license identifiers unchanged unless the displayed surrounding sentence needs localization.
4. Review date terminology with a fluent speaker, especially leap-day, inclusive/exclusive interval, DST overlap, and calendar-duration wording.
5. Add tests for all interpolation helpers in the new locale.
6. Add a locale selector only after at least one complete reviewed locale besides English exists.
7. Persist a locale preference using a backwards-compatible settings migration.
8. Pass the selected locale into domain formatting paths that currently default to `en-US`.
9. Verify layout expansion, right-to-left behavior when applicable, screen-reader output, and print/share copy.
10. Update README, accessibility documentation, and changelog with the supported language list.

## Rules for contributors

- New feature copy belongs in the locale module before the component uses it.
- Validation/domain error messages may remain in the domain layer while English is the only locale, but should move to stable error codes before shipping multiple languages.
- Do not concatenate translated fragments when word order can vary. Prefer an interpolation function that receives all dynamic values.
- Never localize IANA timezone identifiers used as machine values.
- Never infer a locale from saved profile data.
- Keep exported backup schemas language-neutral.

## Translation quality gate

A locale is considered supported only when its full string surface has been reviewed, primary journeys have been exercised in that locale, and no fallback-to-English gaps remain in ordinary product UI. Partial experimental translations should not be advertised as supported.
