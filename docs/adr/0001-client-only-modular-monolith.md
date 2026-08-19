# ADR-0001: Client-only modular monolith

- Status: Accepted
- Date: 2026-08-19

## Context

ChronoAge calculations do not inherently require an account, backend, or cloud persistence. Adding one would increase privacy risk, operating cost, failure modes, and complexity.

## Decision

Ship v1 as a static React PWA with a modular client-side architecture. Separate domain, storage, presentation, and browser-integration modules, but deploy them as one application.

## Consequences

Positive: offline operation, simple hosting, minimal permissions, fast local calculations, no server-side personal data.

Tradeoff: cross-device sync is not built in. Users who need portability use explicit JSON export/import.
