# Contributing

Use Bun and Rust stable. Keep font operations local and user-scoped.

Before pull request:

```bash
bun run typecheck
bun run lint
bun run test
cd src-tauri && cargo fmt --check && cargo test && cargo clippy -- -D warnings
```

Never add cloud sync, system-wide install, or deletion outside Fontsequal managed directories without explicit security review.
