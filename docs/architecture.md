# Architecture

ChronoAge is a static modular monolith delivered as a React PWA. There is no backend in v1.

## Layers

### Domain (`src/domain`)

Pure TypeScript calendar rules, timezone conversion, milestones, and validation. The domain layer does not import React or browser storage. This keeps the most error-prone logic easy to test.

Expected calendar/input failures use `DateCalculationError`, which is one of the explicitly user-visible error classes recognized by the presentation boundary.

### Storage (`src/storage`)

Versioned browser-local persistence adapters for settings and saved profiles. Storage functions validate imported data, cap profile counts, reject duplicate backup identities, ignore corrupted local profile entries safely, and never assume cloud availability.

Expected product-level failures that originate outside date calculation, such as an invalid backup format or reaching the profile cap, use `UserVisibleError`. Raw JSON parser/storage implementation errors are not intended to cross into UI text.

### Error boundary (`src/errors.ts`, `src/components/AppErrorBoundary.tsx`)

`src/errors.ts` centralizes which exception classes may expose their messages to users. `getUserSafeErrorMessage` reveals only curated `DateCalculationError`/`UserVisibleError` text and maps unexpected exceptions to the feature's generic fallback.

The React root is wrapped in `AppErrorBoundary`. A render failure is contained by a local recovery screen instead of leaving a blank application. The boundary records only sanitized local diagnostics and does not send a crash report.

### Presentation (`src/pages`, `src/components`)

Feature pages compose reusable components. Pages own transient form state. Shared settings are wired explicitly through `App` and `useSettings` instead of a global mutable store. Feature-specific component CSS may live beside a component when that keeps the main design-system stylesheet cohesive.

`Field` and `SelectField` own reusable label/help relationships. Select hints are linked through `aria-describedby` while preserving caller-provided description ids so helper text remains available to assistive technology.

### Internationalization (`src/i18n`)

English is the shipped locale. Normal user-facing interface copy is externalized in `src/i18n/en.ts`, including interpolation helpers for dynamic sentences. Crash-recovery copy is externalized in `src/i18n/errors.ts`. Locale-independent product identity and contact metadata live in `src/config/project.ts` rather than being duplicated across pages.

See [internationalization.md](internationalization.md) for the locale extension rules. When locale selection is introduced, recovery copy must join the same selected-locale contract. The current saved-profile name sorter uses an explicit English collator so behavior matches the shipped locale instead of depending on the host machine's default locale.

### Browser integration (`src/hooks`, `src/utils`)

Online status, privacy-safe page routing, saved-profile sorting, print/share, PWA registration, privacy-safe logging, and system defaults are isolated from domain logic. PWA installation and updates are exposed through a dedicated lifecycle hook rather than being mixed into Settings page business logic.

`src/utils/navigation.ts` defines the finite public page-id set and maps it to dependency-free hash routes. The route layer intentionally carries only public page identity (`#/calculate`, `#/profiles`, and similar values). Calculator dates/times, profile names, saved birth dates, search text, and results remain outside URL state. This preserves direct-link and browser-history behavior without introducing a router dependency or a server-side rewrite requirement.

`src/utils/profileSort.ts` performs presentation-only sorting over copies of the local profile array. Changing sort order therefore does not persist a new storage order.

`src/utils/logger.ts` is the single runtime logging boundary. It sanitizes structured context and common sensitive text patterns, handles circular/deep object graphs, and receives global browser `error` and `unhandledrejection` events. Static security checks reject direct runtime console output outside this logger.

## Navigation and accessibility flow

1. `App` initializes its active page from a recognized public route hash, otherwise defaults to Age.
2. Invalid app-style `#/...` hashes are canonicalized to `#/calculate`; ordinary document anchors such as `#main-content` remain ordinary anchors.
3. Internal page navigation uses `history.pushState`, keeping browser Back/Forward semantics without page reloads.
4. `popstate`/recognized `hashchange` events update application page state.
5. Route changes update `document.title` to `<Page> · ChronoAge`.
6. Explicit SPA navigation and browser-history page changes move focus into the persistent `#main-content` region, while modal dismissal retains its separate focus-restoration behavior.

## Data flow

1. A user enters a date/time in a semantic form control.
2. Page code parses and validates the input.
3. Domain functions calculate results using Gregorian civil-date math and, when requested, `Intl` timezone conversion.
4. Expected calculation/product exceptions can provide curated user-visible text; unexpected exceptions resolve to generic feature fallbacks.
5. React renders derived results. Calculator input itself is not persisted or serialized into the page route.
6. Saved profiles are persisted only after an explicit Save action.
7. Profile filtering/sorting/progressive rendering operate on local presentation state; sorting does not rewrite storage.
8. An import that would replace existing profiles requires explicit confirmation before replacement proceeds.
9. Settings are persisted through a typed adapter with safe defaults for missing or malformed values.
10. Unexpected runtime failures are contained by the root error boundary and sanitized local diagnostic logging.

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

Profile load/import boundaries validate ids, uniqueness, normalized names, calendar dates, and ISO timestamps. Export/import remains plain JSON and is never described as encrypted. Import replacement is all-or-nothing at the validated storage boundary, and the Profiles UI requires confirmation before replacing a non-empty current collection.

`chronoage.settings.v1` stores appearance/accessibility/calculation defaults, including the DST overlap preference. Missing fields use backwards-compatible defaults. Malformed non-boolean values are not coerced into enabled accessibility/onboarding flags.

New incompatible schemas must use a migration or a new key; do not silently reinterpret existing records.

## Performance boundary

Production JavaScript and CSS gzip budgets are executable quality gates. `scripts/check-bundle-size.mjs` measures built `dist/` assets and fails when the configured first-party totals exceed the documented limits. `npm run check`, CI, and the tag-release workflow therefore share the same budget contract.

Saved profiles are capped at 100 and progressively rendered in batches of 20. Search and sorting are bounded operations over that small local collection and avoid introducing a virtualization or state-management dependency.

## Security boundaries

Because v1 is client-only, the main boundaries are:

- untrusted date/profile/import inputs,
- user-visible versus internal exception text,
- private local state versus public route state,
- privacy-safe local diagnostics,
- HTML rendering (React escaping by default),
- local persistence corruption,
- service worker cache scope,
- dependency supply chain.

See `SECURITY.md` and ADR-0003.

## Desktop boundary

Windows, macOS, and Linux are currently served by the installable PWA. ADR-0006 intentionally defers a native wrapper until a native-only requirement justifies the additional permissions, signing, updater, CI-secret, and packaging surface.
