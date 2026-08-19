# Architecture

ChronoAge is a static modular monolith delivered as a React PWA. There is no backend in v1.

## Layers

### Domain (`src/domain`)

Pure TypeScript calendar rules, timezone conversion, milestones, and validation. The domain layer does not import React or browser storage. This keeps the most error-prone logic easy to test.

### Storage (`src/storage`)

Versioned browser-local persistence adapters for settings and saved profiles. Storage functions validate imported data, cap profile counts, survive malformed local data, and never assume cloud availability.

### Presentation (`src/pages`, `src/components`)

Feature pages compose reusable components. Pages own transient form state. Shared settings are wired explicitly through `App` and `useSettings` instead of a global mutable store.

### Browser integration (`src/hooks`, `src/utils`)

Online status, print/share, PWA registration, safe logging, and system defaults are isolated from domain logic.

## Data flow

1. A user enters a date/time in a semantic form control.
2. Page code parses and validates the input.
3. Domain functions calculate results using Gregorian civil-date math and, when requested, `Intl` timezone conversion.
4. React renders derived results. Calculator input itself is not persisted.
5. Saved profiles are persisted only after an explicit Save action.

## Timezone approach

ChronoAge intentionally avoids a runtime date library. `zonedLocalToUtc` uses the browser's IANA timezone database through `Intl.DateTimeFormat.formatToParts()`. It starts with a UTC-shaped guess, iteratively corrects by the difference between desired and rendered civil fields, then verifies a round trip. Nonexistent DST-gap local times are rejected.

The approach is covered by deterministic tests and documented in ADR-0002.

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

`chronoage.settings.v1` stores appearance/accessibility/calculation defaults. New incompatible schemas must use a migration or a new key; do not silently reinterpret existing records.

## Security boundaries

Because v1 is client-only, the main boundaries are:

- untrusted date/profile/import inputs,
- HTML rendering (React escaping by default),
- local persistence corruption,
- service worker cache scope,
- dependency supply chain.

See `SECURITY.md` and ADR-0003.
