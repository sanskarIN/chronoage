# ADR-0003: Explicit local storage for optional profiles

- Status: Accepted
- Date: 2026-08-19

## Context

Users may want reusable birth dates, but mandatory accounts would conflict with the product's privacy-first mission.

## Decision

Store optional named profiles in versioned browser localStorage only after explicit user action. Keep transient calculator inputs unpersisted. Provide explicit export/import/delete controls and clearly state that exported JSON is not encrypted.

## Consequences

No server receives profile data. Browser storage can be cleared, so export is the backup mechanism. Cross-device automatic sync is deliberately absent.
