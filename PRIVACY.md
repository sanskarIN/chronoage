# ChronoAge Privacy

ChronoAge is intentionally local-first.

## Data processed

The calculator may process dates, optional times/timezones, optional local profile names, and user preferences. This data is used to perform the requested calculation or provide local convenience features.

## Where data is stored

- Calculator inputs are React UI state and are not intentionally persisted.
- Saved profiles use browser `localStorage` under `chronoage.profiles.v1`.
- Preferences use browser `localStorage` under `chronoage.settings.v1`.
- Export creates a plain JSON file only when the user chooses Export.

ChronoAge includes no account system, analytics SDK, advertising SDK, telemetry endpoint, or cloud synchronization.

## Sharing and printing

The default result card contains calculated age values and does not include a saved profile name. Browser share/clipboard/print features are invoked only after a user action. Once content is shared outside ChronoAge, the destination's privacy rules apply.

## Export warning

Backup JSON files are not encrypted. Store and share them carefully because they can contain profile names and birth dates.

## Clearing data

Profiles can be individually deleted or cleared from the Profiles page. Browser site-data controls can also remove all ChronoAge local storage.

Questions: `supportramsandesh@gmail.com`
