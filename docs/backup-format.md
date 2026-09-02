# ChronoAge Backup Format

ChronoAge profile backups are local JSON documents. They contain saved-profile records and export metadata only; calculator state, settings, telemetry, credentials, and server data are not part of the backup format.

## Current schema

The current backup schema is `schemaVersion: 1`.

A version-1 backup has this shape:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-09-02T00:00:00.000Z",
  "profiles": []
}
```

Each profile contains:

- `id` — stable profile identity within the local collection.
- `name` — validated display name.
- `birthDate` — validated calendar date.
- `createdAt` — ISO timestamp.
- `updatedAt` — ISO timestamp that must not precede `createdAt`.

`exportedAt` records when the backup was created. It is intentionally not treated as stable content for byte-for-byte comparison; tests should validate its ISO timestamp shape rather than expect a fixed value.

## Compatibility rules

1. Import accepts only a supported schema version.
2. Unknown future schema versions must be rejected with stable user-visible feedback rather than guessed or partially migrated.
3. Duplicate profile IDs are invalid.
4. Invalid timestamps, dates, names, or IDs are invalid profile data.
5. A backup containing more than the supported profile limit is rejected.
6. Backup size is checked using UTF-8 bytes before JSON parsing.
7. Import validates the complete backup before replacing the existing local profile collection, so an invalid backup must not partially overwrite valid local data.
8. Successful import replaces the current local profile collection only after the UI's explicit replacement confirmation flow.

## Migration policy

A future schema version should introduce a dedicated migration function rather than weakening the version-1 parser. Migrations must:

- validate the source schema before transformation;
- produce the current canonical model;
- preserve stable profile identity where possible;
- reject ambiguous or lossy transformations;
- never send profile data to a remote service;
- have round-trip and malformed-input regression tests.

Unsupported future schemas remain unsupported until an explicit migration is implemented and tested.

## Privacy boundary

Backups are user-controlled local files. ChronoAge does not require an account or remote storage for saved profiles. Users should treat exported backups as potentially sensitive because they can contain names and dates of birth.
