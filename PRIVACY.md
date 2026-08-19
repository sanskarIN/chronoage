# ChronoAge Privacy

ChronoAge is intentionally local-first.

## Data processed

The calculator may process dates, optional times/timezones, optional local profile names, and user preferences. This data is used to perform the requested calculation or provide local convenience features.

Time-aware preferences include the default timezone and the choice of earlier/later occurrence when a daylight-saving fall-back hour repeats. These preferences remain local browser settings.

## Where data is stored

- Calculator inputs are React UI state and are not intentionally persisted.
- Saved profiles use browser `localStorage` under `chronoage.profiles.v1`.
- Preferences use browser `localStorage` under `chronoage.settings.v1`.
- Export creates a plain JSON file only when the user chooses Export.

ChronoAge includes no account system, analytics SDK, advertising SDK, telemetry endpoint, or cloud synchronization.

## Import validation

Imported profile backups are treated as untrusted local files. ChronoAge validates the backup schema, size/profile-count limits, profile ids and uniqueness, names, birth dates, and timestamps before committing the imported collection. A failed import does not intentionally replace the current saved profile collection.

If browser storage itself contains a mixture of valid and corrupted profile records, invalid records are ignored while valid independently verifiable records can still be loaded. Diagnostic logs contain aggregate corruption counts rather than profile names or birth dates.

## Sharing and printing

The default result card contains calculated age values and does not include a saved profile name. Browser share/clipboard/print features are invoked only after a user action. Once content is shared outside ChronoAge, the destination's privacy rules apply.

## Export warning

Backup JSON files are not encrypted. Store and share them carefully because they can contain profile names and birth dates.

## Clearing data

Profiles can be individually deleted or cleared from the Profiles page. Browser site-data controls can also remove all ChronoAge local storage, including preferences and service-worker data according to browser controls.

Questions: `supportramsandesh@gmail.com`
