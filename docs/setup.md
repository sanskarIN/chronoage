# Setup

## Requirements

- Node.js 22.13 or newer
- npm
- Git
- A modern browser with `Intl`, Service Worker, and ES2022 support

## Clone and install

```bash
git clone https://github.com/sanskarIN/chronoage.git
cd chronoage
npm install
```

## Start development

```bash
npm run dev
```

Open `http://localhost:5173`.

## Environment

ChronoAge v1 needs no secrets. Copy `.env.example` only if you need to override non-secret deployment configuration later.

Never add API keys or credentials to `.env.example` or Git.

## Browser notes

Timezone calculations use the browser's IANA timezone data. Very old browsers or embedded webviews with incomplete `Intl` support are not supported.

## PWA testing

Service workers are most reliable in a production build:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173`, then use browser developer tools to inspect Manifest, Service Worker, and Cache Storage.
