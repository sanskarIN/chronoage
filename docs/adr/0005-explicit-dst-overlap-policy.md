# ADR 0005 — Explicit DST overlap policy

- Status: Accepted
- Date: 2026-08-19

## Context

An IANA timezone can map one local wall-clock time to two UTC instants when daylight-saving time falls back. Earlier ChronoAge behavior selected one matching instant deterministically but did not let users express which occurrence they intended.

ChronoAge must keep timezone-aware calculations understandable, deterministic, dependency-light, and backwards compatible.

## Decision

ChronoAge will detect every matching UTC instant for a requested local date/time using native `Intl.DateTimeFormat` timezone data.

- Normal times produce one candidate.
- Nonexistent spring-forward times are rejected by round-trip validation.
- Repeated fall-back times produce two candidates.
- A persisted application setting chooses the `earlier` or `later` occurrence.
- `earlier` remains the default so existing stored settings and prior behavior continue safely.
- The same policy is applied to birth, reference, and calendar-anchor conversions within one age calculation.

The candidate search samples timezone offsets around the resolved instant and validates each derived candidate by formatting it back to the requested civil fields.

## Consequences

Users can now disambiguate repeated local times without introducing a runtime date library. Results continue to depend on the timezone database shipped by the browser/runtime, so regression tests use well-known IANA transition cases and documentation states that dependency explicitly.
