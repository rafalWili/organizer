# Contributing

Birthdayly is a local desktop app. The backend is the Electron main process, written in Node.js and TypeScript. The interface is React. There is no remote server.

## Setup

1. Install Node.js 22.12 or newer.
2. Run `npm install`, then `npm run dev`. A C++ compiler is unnecessary unless the bundled SQLite binary fails to load in Electron.

## Checks

Before opening a pull request, run:

```bash
npm run lint
npm run typecheck
npm run test
```

## Scope

- Keep birthday math in `src/shared` so it can be unit tested without Electron.
- Keep filesystem, SQLite, notifications, and tray code in `src/main`.
- Do not add analytics, accounts, or a network backend.
- User-facing strings belong in `src/shared/i18n.ts`. Polish is the default language.

## Pull requests

Describe the behavior change and how you tested it. Do not commit signing certificates, tokens, or a local database.
