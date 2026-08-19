# Date and Age Semantics

ChronoAge distinguishes **calendar age** from **elapsed totals**.

## Calendar age

Years, months, and days are decomposed using Gregorian civil-calendar arithmetic. A month is not treated as a fixed number of milliseconds. End-of-month additions clamp to the valid target day.

Example: January 31 plus one calendar month becomes the last valid day of February.

## Time-of-day precision

When time-of-day is disabled, dates are treated as civil dates. The exact-age card shows years/months/days only; elapsed totals remain available separately.

When enabled, the entered IANA timezone maps each civil date/time to a real instant and the exact-age card also shows hours/minutes. If the reference clock time is earlier than the birth clock time, ChronoAge borrows a calendar day before decomposing the remaining hours/minutes.

Timezone fields are free-form inputs with common suggestions rather than a closed preset list. Any IANA identifier supported by the browser's current `Intl` timezone database may be used, such as `Pacific/Auckland`. Unsupported identifiers are rejected inline and are not persisted as the default timezone.

## DST gaps

Some local wall-clock times never occur during a spring-forward transition. ChronoAge verifies timezone conversion by round-tripping the requested civil fields and rejects a nonexistent time instead of silently changing the user's input.

## Fall-back ambiguity

A repeated local hour during a fall-back transition can refer to two distinct UTC instants. ChronoAge discovers matching instants from the browser's IANA timezone data and exposes a setting with two policies:

- **Earlier occurrence** — use the first matching instant. This is the default and preserves the behavior of earlier ChronoAge releases.
- **Later occurrence** — use the second matching instant when the local time repeats.

Normal local times have one candidate, so the preference has no effect outside an overlap. The same preference is applied consistently to birth, reference, and calendar-anchor instants during time-aware age calculation.

## February 29 birthdays

Users can choose one of two non-leap anniversary policies:

- February 28
- March 1

The choice applies to next-birthday, built-in anniversary, and custom birthday-milestone calculations. Leap years continue to use February 29.

## Custom milestones

Custom milestones accept a positive whole number of either days or birthday years.

- Day milestones use exact Gregorian calendar-day addition.
- Birthday-year milestones use anniversary arithmetic and the configured February 29 policy.
- Results outside the supported civil-calendar range are rejected instead of being silently wrapped or normalized.

## Comparison visualization

The age-difference tool reports exact years, months, days, and total elapsed days. Its timeline segment widths are intentionally approximate because calendar years and months do not have fixed day lengths. The exact numeric values remain authoritative.

## Intervals

Exclusive interval = elapsed calendar days between dates.  
Inclusive interval = elapsed calendar days + 1, so both endpoints are counted.

## Supported civil-year range

Date input validation supports years `0001` through `9999`. Calendar-year arithmetic rejects results outside that range. Domain code avoids JavaScript's historical `Date.UTC` remapping of years 0-99.
