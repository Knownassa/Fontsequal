# Fontsequal

**A local-first desktop font manager for designers, developers, and branding teams.**

Fontsequal helps you explore, preview, organize, import, and safely manage fonts without treating your font library like a generic file browser.

## v0.1.0

Fontsequal v0.1.0 targets Windows and Linux. It is an MVP: core local font workflows are ready for testing, while some platform behavior and Google Fonts integration will continue to mature.

## Features

- Browse and filter font families by category, weight, style, variable support, favorites, and install state.
- Preview typography with editable copy, presets, weights, spacing, leading, italics, and side-by-side comparison.
- Scan installed fonts, find duplicates, and inspect font metadata and paths.
- Import local `.ttf` and `.otf` files into Fontsequal's managed user folder.
- Install selected font variants to a per-user Fontsequal folder.
- Create collections and favorites for project-specific font shortlists.
- Keep settings and library data in local SQLite storage.

## Safety first

Fontsequal is designed to leave system font management alone.

- Installs and imports use Fontsequal-managed per-user folders only.
- System-wide installation is not included in this MVP.
- Fontsequal never overwrites source files or managed font files.
- Fontsequal only uninstalls fonts it manages; external and system fonts cannot be deleted from the app.
- No cloud sync or remote account is required. Cloud sync is planned for a later release.

Managed locations:

- Linux: `~/.local/share/fonts/fontsequal`
- Windows: `%LOCALAPPDATA%\Fontsequal\fonts`

## Installation

Prebuilt v0.1.0 packages for Windows and Linux will be published on the project releases page. Until then, build from source using the development setup below.

Linux requires Fontconfig so Fontsequal can refresh the user font cache with `fc-cache`.

## Development

Requirements:

- Bun
- Rust stable toolchain
- Tauri 2 platform dependencies
- Linux: Fontconfig (`fc-cache`)

```bash
bun install
bun run tauri dev
```

Useful checks:

```bash
bun run typecheck
bun run lint
bun run test
cargo test --manifest-path src-tauri/Cargo.toml
```

Build a release package:

```bash
bun run tauri build
```

## MVP status

v0.1.0 focuses on safe local font management: browsing, previews, installed-font scanning, managed import/install/uninstall, favorites, collections, and settings. Windows and Linux packaging is configured; validate release artifacts on each target OS before publishing.

## Roadmap

- Improve Google Fonts catalog and cache controls.
- Expand font metadata and duplicate-management tools.
- Add richer collection workflows and export options.
- Add cloud sync as an opt-in future capability.
- Broaden platform coverage after Windows and Linux stabilization.

## Contributing

Contributions, bug reports, and font-install edge cases are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request, and use the issue templates for reproducible reports.

## License

MIT. See [LICENSE](LICENSE).
