# Birthdayly

Birthdayly is a lightweight, privacy-first birthday calendar for Windows, macOS, and Linux. Contacts, reminders, and settings stay in a local SQLite database. The app does not have an account, analytics, or a remote backend.

The interface is Polish by default and can be switched to English. Notifications are native operating-system notifications.

## Screenshots

Screenshots are not included yet. Run `npm run dev` and capture the dashboard, calendar, contacts, and settings before publishing them here.

## Features

- Monthly calendar with multiple birthdays on the same day
- Contact create, edit, delete, search, and sort
- Optional birth year and age
- February 29 birthdays, celebrated on February 28 or March 1
- Dashboard for today, tomorrow, the next 7 days, the next 30 days, and every upcoming birthday
- Reminders on the day and 1, 3, or 7 days before, at a chosen local time
- System tray, close-to-tray, and login startup where the operating system supports it
- JSON and CSV import and export, with a preview and a merge-or-skip choice for duplicates
- Light, dark, and system themes

## Architecture

```text
React renderer  ->  typed preload bridge  ->  Electron main process (Node.js, TypeScript)
                                                      |
                                                      +-- SQLite in userData
                                                      +-- system notifications and tray
```

Birthday calculations live in `src/shared` and use local calendar dates, not UTC timestamps. The main process validates every IPC payload. The renderer cannot use Node.js directly: `contextIsolation` is on, `nodeIntegration` is off, and the window is sandboxed.

The database file is `birthdayly.db` inside Electron's `userData` directory, so it survives application updates. It is not stored inside the packaged app.

## Development

Requirements:

- Node.js 22.12 or newer
- npm

`better-sqlite3` ships a Node-API prebuild, so a C++ compiler is not required for a normal install. If Electron cannot load that binary, install Python 3 and the Visual Studio C++ build tools, then run `npx electron-builder install-app-deps`.

```bash
npm install
npm run dev
```

Other commands:

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile the main process, preload script, and renderer |
| `npm run dist` | Build installers with electron-builder |
| `npm run test` | Run unit tests |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run the TypeScript compiler |
| `npm run preview` | Open the production build |

## Installers

`electron-builder` is configured for:

- Windows: NSIS installer
- macOS: DMG
- Linux: AppImage

A Windows machine can produce the NSIS installer. macOS and Linux packages are built by the release workflow.

```bash
npm run dist
```

Artifacts are written to `release/`.

## Notifications

Reminders are checked when the app starts, every 60 seconds while it is running, and when the computer resumes from sleep. A reminder is sent only once for the same person, reminder type, and birthday year.

The grace period (36 hours by default, configurable from 1 to 168) allows a missed reminder to appear after the app was closed, as long as Birthdayly is opened again before the window ends.

Birthdayly cannot show a notification while the computer is shut down or while the app is not running. Login startup only helps after the user signs in and the operating system launches the app.

## Code signing and notarization

This repository does not contain certificates, private keys, or publisher tokens.

- Windows: sign the NSIS installer with an Authenticode certificate before a public download. Unsigned builds show SmartScreen warnings.
- macOS: sign the app with a Developer ID certificate and notarize it with `notarytool` before distributing a DMG outside the Mac App Store. Unsigned builds are blocked by Gatekeeper.
- Linux: AppImage files are unsigned. Distribute checksums with the release.

The release workflow builds artifacts with `--publish never` and uploads them as workflow artifacts. It does not create a signed GitHub Release by itself.

## Platform limits to verify on each OS

These integrations are implemented, but they depend on the operating system:

- Notification permission and focus behavior
- Reminders after sleep or hibernation
- Launch at login. macOS expects a packaged app, often inside `/Applications`. Linux depends on the desktop session's autostart support.
- DMG and AppImage creation on their own platforms

## Privacy

Birthdayly does not phone home. Import and export use native file dialogs chosen by the user.
