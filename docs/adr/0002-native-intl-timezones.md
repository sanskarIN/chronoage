# ADR-0002: Native Intl timezone handling

- Status: Accepted
- Date: 2026-08-19

## Context

Timezone-aware age calculations require mapping a civil local date/time to an instant. Shipping a large date library would increase bundle size for a relatively narrow need.

## Decision

Use browser `Intl.DateTimeFormat` with IANA zone identifiers. Convert local fields through an iterative correction and round-trip validation algorithm. Reject local times that cannot round-trip, such as DST spring-forward gaps.

## Consequences

The runtime bundle stays smaller and uses the browser's maintained timezone database. Behavior depends on platform timezone data quality, so supported browsers must have modern `Intl` support and tests must cover representative zones.
