# Legacy Save Studio

[![Build Electron](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml/badge.svg)](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml)

A local, offline save editor for **Brave Frontier: Legacy**, built with Next.js, TypeScript, and Electron.

## Features

- Opens and writes saves locally in Chrome, Edge, or the desktop app.
- Edits player data, owned units, levels, experience, BB, SBB, bonuses, and Imps.
- Supports Lord, Anima, Breaker, Guardian, Oracle, and Rex unit types.
- Filters units by name, ID, element, rarity, and type.
- Adds catalog units individually or in bulk.
- Manages parties, slots, and leaders.
- Validates save files before writing.
- Creates automatic backups and safely restores previous versions.
- Preserves fields that are not managed by the editor.
- Available in English, Portuguese, French, and Spanish.

## Download

Download the latest Windows build from [GitHub Releases](https://github.com/GustavoCinque/legacy-save-studio/releases/latest), extract the ZIP, and run `Legacy Save Studio.exe`.

## Run locally

Node.js 20 or newer is required.

```powershell
npm ci
```

### Web application

```powershell
npm run dev
```

Open `http://localhost:3000` in Chrome or Edge. Select the Brave Frontier save folder when prompted. The web application reads, writes, backs up, and restores files directly on your computer.

### Desktop application

```powershell
npm run dev:electron
```

Electron also detects the default Windows save folder automatically.

## Verification

```powershell
npm test
npm run eval
npm run build
```

## Build

```powershell
npm run build:portable
```

The portable Windows package is written to `release/LegacySaveStudio-Windows-x64.zip`.

## Privacy and safety

Save files remain on your computer. The project does not upload them to a server. Both storage modes validate JSON and create a complete backup before writing changes.
