# Internationalization

ChronoAge ships English first but keeps user-facing interface copy externalized so additional reviewed locale packs can be added without rewriting feature components.

## Current structure

- `src/i18n/en.ts` contains the primary English interface strings and interpolation helpers.
- `src/i18n/errors.ts` contains the English root crash-recovery copy so the error boundary does not hard-code prose.
- Pages and reusable components import copy from the internationalization modules instead of duplicating English literals for normal UI text.
- `Intl.DateTimeFormat` and `toLocaleString` are used for locale-sensitive browser formatting where appropriate.
- Domain helpers such as weekday and milestone formatting accept a locale argument where domain-generated labels require it.
- `src/config/project.ts` is the canonical runtime source for project version, repository/funding URLs, support contacts, license name, and visible credit. Those values should not be translated.
- Backup envelopes remain language-neutral and are governed independently by the versioned backup contract in `docs/backup-format.md`.

## Locale architecture rules

The locale layer must separate three categories:

1. **UI copy** — translated strings and interpolation helpers.
2. **Formatting locale** — passed to browser `Intl` APIs for dates, numbers, weekdays, and other presentation values.
3. **Machine identifiers** — URLs, email addresses, IANA timezone identifiers, schema versions, profile IDs, and license identifiers; these are never translated.

A selected locale must affect presentation only. It must not change the meaning of stored profile dates or the date-domain calculations.

## Adding a locale

Do not machine-publish an unreviewed translation as a supported language.

1. Copy the complete English locale shape, including root recovery copy, into the new reviewed locale contract.
2. Translate user-facing prose while preserving placeholders and interpolation semantics.
3. Keep project names, email addresses, URLs, timezone identifiers, and license identifiers unchanged unless the displayed surrounding sentence needs localization.
4. Review date terminology with a fluent speaker, especially leap-day, inclusive/exclusive interval, DST overlap, and calendar-duration wording.
5. Add tests for all interpolation helpers and recovery strings in the new locale.
6. Add locale-aware tests for dates, numbers, weekdays, duration labels, and empty/error states.
7. Add a locale selector only after at least one complete reviewed locale besides English exists.
8. Persist a locale preference using a backwards-compatible settings migration.
9. Pass the selected locale into domain formatting paths that currently default to `en-US`.
10. Verify layout expansion, right-to-left behavior when applicable, screen-reader output, crash-recovery output, and print/share copy.
11. Update README, accessibility documentation, and changelog with the supported language list.

## Rules for contributors

- New feature copy belongs in the internationalization layer before the component uses it.
- Root recovery UI must use externalized copy and must join the selected-locale contract before multi-language support is advertised.
- Validation/domain error messages may remain in the domain layer while English is the only locale, but should move to stable error codes before shipping multiple languages.
- Do not concatenate translated fragments when word order can vary. Prefer an interpolation function that receives all dynamic values.
- Never localize IANA timezone identifiers used as machine values.
- Never infer a locale from saved profile data.
- Keep exported backup schemas language-neutral.
- Never place private calculator values, saved profile names, or birth dates into locale/page URLs.

## Translation quality gate

A locale is considered supported only when its full string surface has been reviewed, primary journeys and the crash-recovery state have been exercised in that locale, and no fallback-to-English gaps remain in ordinary product UI. Partial experimental translations should not be advertised as supported.

## 2.1.0 target

The first additional locale is an explicit review-gated milestone. Implementation should begin only after the complete English string contract and formatting call sites have been inventoried. The release must include automated coverage for interpolation placeholders and locale-sensitive formatting before the locale is advertised as supported.
