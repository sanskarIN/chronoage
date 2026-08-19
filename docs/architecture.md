# Architecture

ChronoAge is a static modular monolith delivered as a React PWA. There is no backend in v1.

## Layers

### Domain (`src/domain`)

Pure TypeScript calendar rules, timezone conversion, milestones, and validation. The domain layer does not import React or browser storage. This keeps the most error-prone logic easy to test.

### Storage (`src/storage`)

Versioned browser-local persistence adapters for settings and saved profiles. Storage functions validate imported data, cap profile counts, reject duplicate backup identities, ignore corrupted local profile entries safely, and never assume cloud availability.

### Presentation (`src/pages`, `src/components`)

Feature pages compose reusable components. Pages own transient form state. Shared settings are wired explicitly through `App` and `useSettings` instead of a global mutable store. Feature-specific component CSS may live beside a component when that keeps the main design-system stylesheet cohesive.

### Internationalization (`src/i18n`)

English is the shipped locale. Normal user-facing interface copy is externalized in `src/i18n/en.ts`, including interpolation helpers for dynamic sentences. Locale-independent product identity and contact metadata live in `src/config/project.ts` rather than being duplicated across pages.

See [internationalization.md](internationalization.md) for the locale extension rules.

### Browser integration (`src/hooks`, `src/utils`)

Online status, print/share, PWA registration, safe logging, and system defaults are isolated from domain logic. PWA installation and updates are exposed through a dedicated lifecycle hook rather than being mixed into Settings page business logic.

## Data flow

1. A user enters a date/time in a semantic form control.
2. Page code parses and validates the input.
3. Domain functions calculate results using Gregorian civil-date math and, when requested, `Intl` timezone conversion.
4. React renders derived results. Calculator input itself is not persisted.
5. Saved profiles are persisted only after an explicit Save action.
6. Settings are persisted through a typed adapter with safe defaults for missing or malformed values.

## Timezone approach

ChronoAge intentionally avoids a runtime date library. `zonedLocalToUtcCandidates` uses the browser's IANA timezone database through `Intl.DateTimeFormat.formatToParts()`. It starts with a UTC-shaped guess, iteratively corrects by the difference between desired and rendered civil fields, verifies a round trip, samples nearby timezone offsets, and returns every instant that maps back to the requested local wall-clock fields.

- Normal civil times produce one candidate.
- Nonexistent DST-gap local times are rejected.
- Repeated fall-back local times produce two candidates when the timezone database reports both offsets.
- `zonedLocalToUtc` selects the earlier or later occurrence using the persisted application setting.

The approach is covered by deterministic tests and documented in ADR-0002 and ADR-0005.

## Milestone model

Built-in milestones and the custom milestone builder share pure domain functions. Custom milestones accept a positive whole-number amount in calendar days or birthday years. Birthday-year calculations reuse the configured February 29 anniversary policy instead of reimplementing calendar rules in the UI.

## Persistence schema

`chronoage.profiles.v1`:

```json
{
  "schemaVersion": 1,
  "profiles": [
    {
      "id": "uuid",
      "name": "Example",
      "birthDate": "2001-02-03",
      "createdAt": "ISO-8601",
      "updatedAt": "ISO-8601"
    }
  ]
}
```

Profile load/import boundaries validate ids, uniqueness, normalized names, calendar dates, and ISO timestamps. Export/import remains plain JSON and is never described as encrypted.

`chronoage.settings.v1` stores appearance/accessibility/calculation defaults, including the DST overlap preference. Missing fields use backwards-compatible defaults. Malformed non-boolean values are not coerced into enabled accessibility/onboarding flags.

New incompatible schemas must use a migration or a new key; do not silently reinterpret existing records.

## Security boundaries

Because v1 is client-only, the main boundaries are:

- untrusted date/profile/import inputs,
- HTML rendering (React escaping by default),
- local persistence corruption,
- service worker cache scope,
- dependency supply chain.

See `SECURITY.md` and ADR-0003.

## Desktop boundary

Windows, macOS, and Linux are currently served by the installable PWA. ADR-0006 intentionally defers a native wrapper until a native-only requirement justifies the additional permissions, signing, updater, CI-secret, and packaging surface.
