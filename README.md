# Legacy Save Studio

[![Build Electron](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml/badge.svg)](https://github.com/GustavoCinque/legacy-save-studio/actions/workflows/build-electron.yml)

> [!IMPORTANT]
> Brave Frontier and all related names, trademarks, characters, and game
> content are the property of their respective owners. Legacy Save Studio is
> an unofficial, non-commercial community project and is not affiliated with,
> endorsed by, or sponsored by any rights holder.

## Features

- Opens and writes saves locally in Chrome, Edge, or the desktop app.
- Edits player data, owned units, levels, experience, BB, SBB, bonuses, and Imps.
- Supports Lord, Anima, Breaker, Guardian, Oracle, and Rex unit types.
- Filters units by name, ID, element, rarity, and type.
- Adds catalog units individually or in bulk.
- Paginates the catalog in groups of 250 and restricts bulk addition to the current page.
- Uses the game-compatible catalog by default, with an optional full database mode.
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

When `public/data/unsupported_unit_ids.json` changes, regenerate the compatible catalog copies with:

```powershell
npm run catalog:compatible
```

The **Game compatible** mode omits units confirmed as missing from the current game build. The **Full** mode preserves every database entry and may contain units that prevent the in-game inventory from rendering.

## Build

```powershell
npm run build:portable
```

The portable Windows package is written to `release/LegacySaveStudio-Windows-x64.zip`.

## Privacy and safety

Save files remain on your computer. The project does not upload them to a server. Both storage modes validate JSON and create a complete backup before writing changes.

## License and third-party content

The MIT License applies exclusively to the original source code and
documentation created for this project. It does not grant any rights to
third-party trademarks, game data, artwork, text, characters, or other
game-derived content.

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for data provenance and
third-party notices. Rights holders may request attribution changes or content
removal through the [content-removal request form](https://github.com/GustavoCinque/legacy-save-studio/issues/new?template=content-removal.yml).

## App screenshots

<table>
  <tr>
    <td width="50%">
      <a href="https://github.com/user-attachments/assets/fb6f2fe4-3339-47c4-8541-ab5e11a89c1f">
        <img src="https://github.com/user-attachments/assets/fb6f2fe4-3339-47c4-8541-ab5e11a89c1f" alt="Screenshot 1">
      </a>
    </td>
    <td width="50%">
      <a href="https://github.com/user-attachments/assets/cb28c84a-9771-41ed-abba-28ca6da33d20">
        <img src="https://github.com/user-attachments/assets/cb28c84a-9771-41ed-abba-28ca6da33d20" alt="Screenshot 2">
      </a>
    </td>
  </tr>

  <tr>
    <td width="50%">
      <a href="https://github.com/user-attachments/assets/a7d49464-7ab7-4a19-9763-f99c27b799a7">
        <img src="https://github.com/user-attachments/assets/a7d49464-7ab7-4a19-9763-f99c27b799a7" alt="Screenshot 3">
      </a>
    </td>
    <td width="50%">
      <a href="https://github.com/user-attachments/assets/6d161e39-2fa7-40ab-9e30-4ef481b459c7">
        <img src="https://github.com/user-attachments/assets/6d161e39-2fa7-40ab-9e30-4ef481b459c7" alt="Screenshot 4">
      </a>
    </td>
  </tr>

  <tr>
    <td colspan="2" align="center">
      <a href="https://github.com/user-attachments/assets/ff9b2dd6-6d2e-4b0b-885c-1aa4dccf6141">
        <img width="50%" src="https://github.com/user-attachments/assets/ff9b2dd6-6d2e-4b0b-885c-1aa4dccf6141" alt="Screenshot 5">
      </a>
    </td>
  </tr>
</table>




