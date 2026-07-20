# Third-party notices

Brave Frontier and all related names, trademarks, characters, unit names,
statistics, and other game-derived content are the property of their
respective owners. Legacy Save Studio is an unofficial, non-commercial
community project. It is not affiliated with, endorsed by, or sponsored by
any rights holder.

## License scope

The MIT License in this repository applies only to original source code and
documentation created for Legacy Save Studio. It does not grant rights to any
third-party trademark, game data, artwork, text, character, or other
game-derived content. No ownership of third-party content is claimed.

## Data provenance

The editor contains the following JSON data under `public/data/`:

| File | Origin and transformation |
| --- | --- |
| `units_database_full.json` | A structured unit catalog imported from the local source dataset used to rebuild the original editor on July 17, 2026. Records identify Brave Frontier: Legacy resource tables such as `Assets/Resources/F_UNIT_MST_*`. The exact upstream extractor, author, and license were not preserved in the source dataset or repository history, so they are currently unknown. |
| `units_database_simple.json` | A reduced UI catalog created for Legacy Save Studio from the same base unit dataset. It retains identifiers, names, statistics, rarity, element, and evolution relationships needed by the editor. |
| `unsupported_unit_ids.json` | A project-maintained compatibility list produced from local testing against the current game build and reports of units the game could not resolve. Unit-name investigation referenced [`cheahjs/bravefrontier_data/info.json`](https://github.com/cheahjs/bravefrontier_data/blob/master/info.json), which describes itself as extracted Brave Frontier data. That archived repository does not state a license for the dataset. The external `info.json` file is not redistributed by this project. |
| `units_database_compatible_full.json` | Generated locally from `units_database_full.json` by `scripts/build-compatible-catalog.cjs`, excluding every identifier in `unsupported_unit_ids.json`. |
| `units_database_compatible_simple.json` | Generated locally from `units_database_simple.json` by `scripts/build-compatible-catalog.cjs`, excluding every identifier in `unsupported_unit_ids.json`. |

The game-derived data is included only to let the editor interoperate with save
files owned by the user and to make the editor's behavior reviewable. This
repository does not contain an official game executable, sprites, artwork,
music, sound effects, proprietary fonts, account credentials, or user save
files.

## Rights-holder contact and removal requests

Rights holders may request corrected attribution or removal through the
[content-removal request form](https://github.com/GustavoCinque/legacy-save-studio/issues/new?template=content-removal.yml).
Please identify the work, the affected repository paths, your relationship to
the rights holder, and the requested action. Requests will be reviewed promptly.
