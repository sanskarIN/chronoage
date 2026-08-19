# Date and Age Semantics

ChronoAge distinguishes **calendar age** from **elapsed totals**.

## Calendar age

Years, months, and days are decomposed using Gregorian civil-calendar arithmetic. A month is not treated as a fixed number of milliseconds. End-of-month additions clamp to the valid target day.

Example: January 31 plus one calendar month becomes the last valid day of February.

## Time-of-day precision

When time-of-day is disabled, dates are treated as civil dates and the displayed hours/minutes are zero.

When enabled, the selected IANA timezone maps each civil date/time to a real instant. If the reference clock time is earlier than the birth clock time, ChronoAge borrows a calendar day before decomposing the remaining hours/minutes.

## DST gaps

Some local wall-clock times never occur during a spring-forward transition. ChronoAge verifies timezone conversion by round-tripping the requested civil fields and rejects a nonexistent time instead of silently changing the user's input.

## Fall-back ambiguity

A repeated local hour during a fall-back transition can refer to two instants. The current native-Intl conversion resolves one matching occurrence deterministically. A future release may expose explicit ambiguity selection if users need it.

## February 29 birthdays

Users can choose one of two non-leap anniversary policies:

- February 28
- March 1

The choice applies to next-birthday and calendar-anniversary calculations. Leap years continue to use February 29.

## Intervals

Exclusive interval = elapsed calendar days between dates.  
Inclusive interval = elapsed calendar days + 1, so both endpoints are counted.

## Supported civil-year range

Date input validation supports years `0001` through `9999`. Domain code avoids JavaScript's historical `Date.UTC` remapping of years 0-99.
