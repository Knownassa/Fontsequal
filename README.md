<div align="center">

# Fontsequal

### A local-first desktop font manager for focused type work.

Search, inspect, compare, and manage the font families your work depends on—without handing control of your library to a cloud service.

[![CI](../../actions/workflows/ci.yml/badge.svg)](../../actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![Tauri 2](https://img.shields.io/badge/Tauri-2-24C8DB)
![Bun](https://img.shields.io/badge/Bun-runtime-black)
![Platforms](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-7C3AED)

<br />

![Fontsequal desktop workspace](docs/images/fontsequal-preview-placeholder.svg)

<br />

**[Features](#a-calm-font-workspace)** · **[Quick start](#quick-start)** · **[Safety](#local-by-design)** · **[Contributing](CONTRIBUTING.md)**

</div>

> **Pre-release:** Fontsequal is in active development. Build from source while v0.1.0 is prepared.

## A calm font workspace

Fontsequal is arranged like a focused desktop editor: navigation on the left, a specimen-first library in the middle, and contextual details on the right.

| Browse | Inspect | Compare |
| --- | --- | --- |
| Search real provider data, filter families, and switch between grid and list views. | Select a family to open a right-side inspector, then expand into a focused full-font viewer. | Use the dedicated Compare page to place two to four families side by side. |

| Organize | Manage | Stay in flow |
| --- | --- | --- |
| Keep favorites and project collections close to the font library. | Scan local metadata, find duplicates, import copies, and safely manage user-scope fonts. | Collapse the sidebar into an icon rail when the specimen needs more room. |

### Keyboard workflow

| Shortcut | Action |
| --- | --- |
| `Ctrl/Cmd + K` | Focus font search |
| Arrow keys | Move the selected family |
| `Enter` | Open or focus the inspector |
| `Space` | Open the full-font viewer |
| `Esc` | Close menus, sheets, and dialogs |

## Local by design

Fontsequal is built around ownership boundaries.

- Managed installs use the current user's Fontsequal directory only.
- System-wide installation is not included in the MVP.
- Imports copy valid font files; original files remain untouched.
- Only fonts managed by Fontsequal can be uninstalled by Fontsequal.
- System and external fonts are shown as read-only.
- Your font data and preferences stay local. Cloud sync is planned as an explicit opt-in feature.

## Quick start

### Desktop app

Arch Linux example:

```bash
sudo pacman -S --needed bun rustup base-devel webkit2gtk-4.1 gtk3 libappindicator-gtk3 librsvg fontconfig
rustup default stable

git clone https://github.com/fontsequal/fontsequal.git
cd fontsequal
bun install
bun run tauri:dev
```

Managed font copies live at:

| Platform | Managed directory |
| --- | --- |
| Linux | `~/.local/share/fonts/fontsequal` |
| Windows | `%LOCALAPPDATA%\Fontsequal\fonts` |

### Browser layout preview

```bash
bun run dev
```

The Vite preview is useful for layout work, but it does not have Tauri's local command bridge. Run `bun run tauri:dev` to scan, import, install, or browse real local/provider data. Fontsequal intentionally does not substitute mock font records.

## Build from source

Requirements: Bun, Rust stable, and the Tauri platform dependencies for your OS.

```bash
bun install
bun run typecheck
bun run lint
bun run test
bun run tauri:build
```

## Why Fontsequal?

| | Fontsequal | Typical system font folders | Cloud font services |
| --- | --- | --- | --- |
| Local-first library | Yes | Partial | Usually no |
| Safe managed uninstall | Yes | Manual and risky | Varies |
| System font protection | Yes | No ownership context | Varies |
| Focused specimen and comparison tools | Yes | No | Varies |
| Cloud sync | Planned, opt-in | No | Usually yes |

## Roadmap

- [x] Local scanning, import, managed install, and safe uninstall
- [x] Google Fonts cache, favorites, collections, duplicate detection, and settings
- [x] Contextual font inspector, full viewer, and multi-font comparison page
- [x] Responsive material desktop UI with collapsible icon sidebar
- [x] Windows and Linux build targets
- [ ] Published installers and signed release artifacts
- [ ] Provider-neutral unified font index
- [ ] Optional cloud sync with explicit opt-in

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request. Use Bun for frontend tooling and keep all font operations local and user-scoped.

## Security

Report vulnerabilities privately. See [SECURITY.md](SECURITY.md). Never include API keys or personal file paths in public reports.

## License

Fontsequal is released under the [MIT License](LICENSE).
