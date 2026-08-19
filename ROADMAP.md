# ChronoAge Roadmap

## v1.0 — Core production PWA

- [x] Exact age calculator
- [x] Next birthday
- [x] Age difference
- [x] Date interval
- [x] Milestones
- [x] Local profiles and backup/restore
- [x] Theme/accessibility settings
- [x] Offline PWA
- [x] Automated tests and CI
- [x] Documentation and security baseline

## v1.1 — Polish

- [x] Search/filter for large local profile collections
- [x] Editable saved profiles using the validated local storage model
- [x] Install/update prompt UX using browser capabilities
- [x] Baseline automated browser accessibility regression checks
- [x] Maintained axe-core WCAG A/AA audits across core pages, dark theme, and mobile viewport
- [x] Release-candidate screenshot automation
- [x] Externalized English UI strings and centralized runtime project metadata
- [ ] Additional locale packs after translation review

## v1.2 — Advanced date tooling

- [x] Optional custom milestone builder
- [x] Calendar-duration comparison visualization
- [x] Explicit DST ambiguity choice for repeated fall-back hours

## Desktop delivery decision

- [x] Evaluate Tauri/native wrapper in a dedicated ADR
- [x] Document Windows/macOS/Linux delivery, signing, and packaging requirements
- [x] Define the desktop update strategy without changing the local-first privacy model
- [ ] Add a native wrapper only after a justified native-only requirement exists

The current supported desktop delivery is the installable PWA. Native-wrapper work is intentionally deferred by [ADR 0006](docs/adr/0006-pwa-first-desktop-delivery.md), not blocked by missing implementation.

Additional locale packs are intentionally gated on complete human translation review; the English-first architecture is already externalized and documented.

Roadmap items are not promises and may change based on quality, security, and maintainability.
