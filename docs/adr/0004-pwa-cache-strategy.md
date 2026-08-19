# ADR-0004: Same-origin PWA caching

- Status: Accepted
- Date: 2026-08-19

## Context

ChronoAge should remain useful offline without caching unrelated third-party resources.

## Decision

Use a small first-party service worker that precaches the shell and applies cache-first/network-refresh behavior only to same-origin GET requests. Old named caches are removed during activation.

## Consequences

Core functionality works offline after a successful load. Update freshness depends on service-worker lifecycle, which is documented in troubleshooting/release checks.
