# ADR 0008 — Explicit Backup Schema Versioning

- Status: Accepted
- Date: 2026-09-02

## Context

ChronoAge stores saved profiles locally and supports JSON export/import. The current implementation already requires `schemaVersion: 1`, but future format changes need a documented compatibility boundary so a newer backup cannot accidentally be interpreted as an older format.

## Decision

ChronoAge will use an explicit integer `schemaVersion` at the backup envelope level. Each supported schema gets an explicit parser/normalizer. Unsupported future versions are rejected with stable user-facing feedback until a reviewed migration exists.

The application will not infer a schema from optional fields, silently discard unknown future fields, or attempt best-effort migration without a version-specific implementation.

## Consequences

### Positive

- Future migrations have an explicit source-version contract.
- Unknown future files fail safely instead of producing silently corrupted local data.
- Regression tests can target each supported schema independently.
- The local-only privacy boundary remains unchanged.

### Negative

- Every intentional format change requires migration code and tests.
- Old backups may remain unsupported until a migration is shipped.

## Implementation requirements

For every future schema migration:

1. Add a version-specific parser/validator.
2. Convert to the canonical current `SavedProfile` model.
3. Preserve IDs and timestamps where semantically valid.
4. Reject invalid, ambiguous, or lossy data.
5. Add malformed-input and successful-migration tests.
6. Document the migration in `docs/backup-format.md` and the changelog.
7. Never transmit backup/profile data to a remote service as part of migration.
