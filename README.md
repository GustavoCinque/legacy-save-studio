# Legacy Save Studio

[![Build Electron](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml/badge.svg)](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml)

A local, offline save editor for **Brave Frontier: Legacy**, built with Next.js, TypeScript, and Electron.

## Features

- Automatically finds the default Windows save folder or opens a folder you choose.
- Edits player data, owned units, unit types, levels, experience, BB, SBB, bonuses, and Imps.
- Supports Lord, Anima, Breaker, Guardian, Oracle, and Rex unit types.
- Filters units by name, ID, element, rarity, and type.
- Adds catalog units individually or in bulk.
- Manages parties, slots, and leaders.
- Validates all save files before writing.
- Creates automatic backups and safely restores previous versions.
- Preserves save fields that are not managed by the editor.
- Available in English, Portuguese, French, and Spanish.

## Download

Download the latest Windows build from [GitHub Releases](https://github.com/GustavoCinque/legacy-save-studio/releases/latest).

Extract the ZIP and run `Legacy Save Studio.exe`. Your save files remain on your computer.

## Development

Requirements: Node.js 20 or newer and Windows for the Electron package.

```powershell
npm ci
npm run dev:electron
```

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

Legacy Save Studio works locally and does not upload save files. Electron uses context isolation, a restricted preload API, validated IPC calls, automatic backups, and safe temporary writes.
