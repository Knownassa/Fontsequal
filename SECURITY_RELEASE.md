# Secure release operations

Only `@Knownassa`, or a maintainer explicitly delegated by that account, may approve the `production-release` environment and publish a Fontsequal release.

## Updater signing key

- Generate the Tauri updater key outside this repository and back up the private key in two separately protected, encrypted locations.
- Store `TAURI_SIGNING_PRIVATE_KEY` and its password only as `production-release` environment secrets. Never commit, log, email, chat, or provide the private key to an AI tool.
- The public key is allowed only in `src-tauri/tauri.conf.json`; do not fetch it at runtime.
- If the private key is suspected compromised, stop releases, revoke environment access, investigate affected draft releases, generate a replacement key, and plan a signed migration for already-installed versions. Do not publish a replacement casually: existing clients trust the current public key.

## GitHub protections

Configure GitHub rulesets to require pull requests, passing CI, and code-owner review for `main` and the files listed in `.github/CODEOWNERS`. Block force-pushes and deletion.

Restrict creation, updates, and deletion of `v*` tags to release maintainers. Configure `production-release` to permit protected tags only, require a maintainer review, and prevent bypass where the GitHub plan supports it.

## Draft verification

The release workflow creates drafts only. Before publishing, verify every platform entry in `latest.json`, the release version and notes, non-empty signatures, and the matching uploaded files. Treat release assets as immutable once published.

All workflow actions are currently referenced by maintained version tags. Before merging a release workflow change, replace every third-party action reference with a reviewed full commit SHA and document the reviewed source.
