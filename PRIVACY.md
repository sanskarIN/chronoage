# ChronoAge Privacy

ChronoAge is intentionally local-first.

## Data processed

The calculator may process dates, optional times/timezones, optional local profile names, and user preferences. This data is used to perform the requested calculation or provide local convenience features.

Time-aware preferences include the default timezone and the choice of earlier/later occurrence when a daylight-saving fall-back hour repeats. Timezone inputs may use any IANA identifier supported by the browser. These preferences remain local browser settings when persistence is available.

## Where data is stored

- Calculator inputs are React UI state and are not intentionally persisted.
- Saved profiles use browser `localStorage` under `chronoage.profiles.v1`.
- Preferences use browser `localStorage` under `chronoage.settings.v1`.
- Export creates a plain JSON file only when the user chooses Export.

ChronoAge includes no account system, analytics SDK, advertising SDK, telemetry endpoint, cloud synchronization, or crash-reporting backend.

## Page URLs and navigation

ChronoAge supports direct links and browser Back/Forward navigation with public page-only fragments such as `#/profiles`, `#/settings`, and `#/milestones`.

The routing layer does **not** intentionally serialize calculator dates, times, timezone values, profile names, saved birth dates, search text, backup contents, or calculation results into the URL. A saved-profile handoff to the Age calculator therefore changes the route only to `#/calculate`; the selected birth date remains local React state.

Unknown app-style `#/...` fragments are treated as invalid application routes and fall back to the Age page. Ordinary document anchors such as `#main-content` are not treated as application routes so the accessibility skip link continues to work normally.

## When browser storage is unavailable

Browsers can block local storage because of privacy settings, security policy, quota limits, or environment restrictions.

- If profile storage cannot be read, ChronoAge loads no saved profiles rather than treating inaccessible data as valid.
- If a profile write/delete/clear cannot be persisted, the action fails with a user-visible local error instead of pretending the change was saved.
- If settings storage cannot be read, safe defaults are used.
- If a settings write fails, the preference still applies to the current React session and Settings explicitly warns that the change is session-only.

These fallbacks do not cause data to be uploaded elsewhere.

## Runtime diagnostics

Application warnings and failures may be written to the local browser developer console through ChronoAge's structured logger. They are not intentionally transmitted anywhere.

The logger is designed to minimize accidental exposure by redacting likely sensitive keys and common email, bearer-token, ISO-date, and clock-time text patterns. Unhandled browser errors and promise rejections pass through the same local redaction layer. Product code should still log only non-sensitive categories, error types, and aggregate counts rather than relying on redaction as permission to log personal data.

If a React render fails, ChronoAge shows a local recovery screen. That screen does not submit a crash report and does not upload profile data or calculator inputs.

## Import validation and replacement

Imported profile backups are treated as untrusted local files. ChronoAge validates the backup schema, size/profile-count limits, profile ids and uniqueness, names, birth dates, and timestamps before committing the imported collection. Malformed JSON is converted to a stable user-safe import error rather than exposing parser internals. A failed import does not intentionally replace the current saved profile collection.

When profiles are already saved, choosing an import file does not immediately overwrite them. ChronoAge asks for explicit confirmation before the imported collection is read and committed as a replacement. Cancelling that confirmation keeps the existing collection unchanged.

If browser storage itself contains a mixture of valid and corrupted profile records, invalid records are ignored while valid independently verifiable records can still be loaded. Diagnostic logs contain aggregate corruption counts rather than profile names or birth dates.

## Profile search and sorting

Profile search, sorting, and progressive rendering are presentation operations over the local in-memory collection. Name/birth-date sorting works on a copied array and does not rewrite the persisted profile order merely because the user changes the visible sort option.

## Sharing and printing

The default result card contains calculated age values and does not include a saved profile name. Browser share/clipboard/print features are invoked only after a user action. Once content is shared outside ChronoAge, the destination's privacy rules apply.

## Export warning

Backup JSON files are not encrypted. Store and share them carefully because they can contain profile names and birth dates.

## Clearing data

Profiles can be individually deleted or cleared from the Profiles page. Browser site-data controls can also remove all ChronoAge local storage, including preferences and service-worker data according to browser controls.

Questions: `supportramsandesh@gmail.com`
