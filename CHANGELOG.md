# Changelog

All notable Fontsequal changes documented here.

## 0.1.0 — Initial release

### Browse and preview

- Browse cached Google Fonts with family search, category, weight, style, variable, favorite, and installed filters.
- Lazy-load visible preview fonts and show skeleton states during loading.
- Typography lab with editable specimen text, presets, size, tracking, leading, weight, italic, and two-to-four family comparison.
- Preview preferences persist locally.

### Local font library

- Scan supported `.ttf` and `.otf` files from Linux and Windows user/system font locations.
- Parse family, full name, PostScript name, style, and weight where available.
- Calculate SHA-256 hashes and flag duplicate files.
- Search and filter installed fonts by management state, duplicate status, file type, and recent install date.

### Safe managed installs and imports

- Install fonts for current user only; system-wide installation is not included.
- Copy managed files to Fontsequal user folders without overwriting existing files.
- Validate font metadata and file type before installing or importing.
- Import local `.ttf` and `.otf` files through picker or drag-and-drop UI.
- Refresh Fontconfig cache on Linux; register managed fonts for Windows session where available.

### Safe uninstall

- Remove only files inside Fontsequal managed user folders.
- Block external and system font deletion.
- Validate canonical managed paths before removal.
- Refresh OS cache after deletion and update SQLite only after file removal succeeds.
- Include single and batch confirmation dialogs.

### Organization

- Favorite and unfavorite families locally.
- Create, rename, delete, search, and inspect local collections.
- Add and remove families from collections from Browse and collection detail views.

### Settings and data

- SQLite-backed appearance, preview, font-management, and Google Fonts settings.
- Theme selection, Google Fonts API-key storage, cache refresh, and font rescan controls.
- Local-only data model; cloud sync is not included in 0.1.0.

### Platform and release

- Tauri 2 desktop application with Bun, React, TypeScript, shadcn-style UI primitives, and Rust.
- Release targets for Linux DEB/AppImage and Windows NSIS/MSI.
- README, contribution, security, issue templates, release checklist, CI, and release-build workflow.
- MIT License.
