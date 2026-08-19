<div align="center">
  <img src="public/logo.svg" alt="ChronoAge logo" width="112" />
  <h1>ChronoAge</h1>
  <p><strong>A privacy-first, timezone-aware age and date calculator that works beautifully on the web and offline.</strong></p>
  <p><strong>Made by the Sanskar</strong></p>

  [![CI](https://github.com/sanskarIN/chronoage/actions/workflows/ci.yml/badge.svg)](https://github.com/sanskarIN/chronoage/actions/workflows/ci.yml)
  [![CodeQL](https://github.com/sanskarIN/chronoage/actions/workflows/codeql.yml/badge.svg)](https://github.com/sanskarIN/chronoage/actions/workflows/codeql.yml)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)
</div>

## Why ChronoAge

ChronoAge goes beyond a basic age calculator. It combines calendar-accurate age math, next-birthday planning, interval tools, milestone discovery, local saved profiles, accessibility, offline PWA support, printable/shareable results, and explicit leap-day behavior in one maintainable React + TypeScript application.

**Privacy is the default:** calculations run locally in the browser, saved profiles use local browser storage, no account is required, and the project ships with no analytics or cloud sync.

## Interface preview

![ChronoAge interface preview](docs/screenshots/app-preview.svg)

> This repository preview is a source-controlled representation of the production UI. Real release screenshots should be refreshed whenever the visual design changes.

## Features

- Exact age in years, months, days, hours, and minutes.
- Total elapsed days, hours, and minutes.
- IANA-timezone-aware calculations when time of day is enabled.
- Next-birthday date, weekday, days remaining, and age turning.
- Configurable February 29 anniversary behavior (`February 28` or `March 1`).
- Absolute age difference between any two dates.
- Inclusive and exclusive date interval calculator.
- 1,000/5,000/10,000+ day milestones and major birthday anniversaries.
- Local-only saved profiles with schema validation, export, import, and deletion controls.
- Print/share result cards that omit private profile names by default.
- Light, dark, and system themes; reduced-motion and high-contrast settings.
- Keyboard-first navigation, visible focus states, semantic labels, and quick actions (`Ctrl/Cmd + K`).
- Installable offline PWA with a same-origin cache strategy.
- Responsive layouts for phones, tablets, and desktops.
- Internationalization-ready string organization (English ships first).

## Supported platforms

| Platform | Delivery | Status |
| --- | --- | --- |
| Modern desktop browsers | Web | Primary |
| Android / iOS browsers | Responsive web | Primary |
| Installable PWA | Browser install | Primary |
| Windows | PWA install | Supported |
| macOS | PWA/browser | Supported |
| Linux | PWA/browser | Supported |
| Tauri desktop wrapper | Native wrapper | Roadmap |

## Tech stack

- React 19 + TypeScript
- Vite
- Native `Intl.DateTimeFormat` + Gregorian calendar domain logic
- Browser `localStorage` for optional profiles/settings
- Native Service Worker + Web App Manifest
- Vitest + Testing Library
- Playwright end-to-end tests
- ESLint + Prettier
- GitHub Actions + CodeQL + Dependabot

No date library is required by the runtime domain layer. Timezone conversion uses the browser's IANA timezone database through `Intl` and round-trip validation for nonexistent local times.

## Quick start

Requirements: Node.js 22.13+ and npm.

```bash
git clone https://github.com/sanskarIN/chronoage.git
cd chronoage
npm install
npm run dev
```

Open `http://localhost:5173`.

## Quality commands

```bash
npm run format:check
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Run the combined non-E2E quality suite with:

```bash
npm run check
```

See [docs/testing.md](docs/testing.md) for the full strategy and CI expectations.

## Build and release

```bash
npm install
npm run check
npm run build
```

The production web bundle is created in `dist/`. GitHub Actions also verifies clean builds and can publish versioned release artifacts. See [docs/release.md](docs/release.md).

## Architecture

ChronoAge is a modular client-side application:

- `src/domain/` — deterministic date math, milestones, validation.
- `src/storage/` — versioned local persistence and backup/restore.
- `src/pages/` — feature-oriented UI pages.
- `src/components/` — reusable UI building blocks.
- `src/hooks/` — browser/application state integration.
- `src/utils/` — safe logging, PWA registration, sharing, defaults.
- `tests/` — unit, integration, component, and E2E coverage.

Business rules do not depend on React. See [docs/architecture.md](docs/architecture.md) and [docs/adr/](docs/adr/).

## Security and privacy

ChronoAge has no backend, authentication, payments, or required network API. User-entered profile data remains in local browser storage unless the user explicitly exports it. Export files are plain JSON and are **not encrypted**.

- Security policy: [SECURITY.md](SECURITY.md)
- Privacy behavior: [PRIVACY.md](PRIVACY.md)
- Responsible disclosure: `sanskarin@outlook.in`
- Support: `supportramsandesh@gmail.com`

## Accessibility

The UI targets WCAG-oriented practices: keyboard operation, skip links, focus visibility, semantic labels, non-color-only status, reduced-motion support, scalable layouts, and screen-reader-friendly status regions. See [docs/accessibility.md](docs/accessibility.md).

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md), follow the [Code of Conduct](CODE_OF_CONDUCT.md), and include tests for behavior changes.

## Support and contact

- Business: [sanskarin@outlook.in](mailto:sanskarin@outlook.in)
- Business: [sanskarin.business@gmail.com](mailto:sanskarin.business@gmail.com)
- Support: [supportramsandesh@gmail.com](mailto:supportramsandesh@gmail.com)
- GitHub: https://github.com/sanskarIN
- Repository: https://github.com/sanskarIN/chronoage

## Support open-source development

[![Buy Me a Coffee](https://img.shields.io/badge/Buy%20Me%20a%20Coffee-sanskarIN-FFDD00?logo=buy-me-a-coffee&logoColor=000000)](https://buymeacoffee.com/sanskarIN)

Donations are optional and never unlock product functionality.

## License

ChronoAge is released under the [MIT License](LICENSE).

---

**Made by the Sanskar** · Open source · Privacy first
