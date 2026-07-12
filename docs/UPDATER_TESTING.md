# Updater test checklist

Run these checks against a private draft release or a dedicated test endpoint, never the stable public release.

| Scenario | Expected result |
| --- | --- |
| Valid signed update | The app shows the version and notes, verifies the package, and updates only after the user chooses to do so. |
| Invalid signature | The update is rejected, no installer runs, and the app stays usable. |
| Modified artifact | Signature verification rejects the artifact. |
| Malformed `latest.json` | A safe metadata error is shown; nothing installs. |
| Missing platform entry | The static metadata is rejected; nothing installs. |
| GitHub unavailable | A safe connection error is shown and the app remains usable. |
| Interrupted download | The update fails safely and can be retried. |
| Same or older version | No downgrade or redundant update is offered. |
| Unsupported architecture | No update is offered for that target. |
| Corrupted installer | Verification or installation fails safely. |
| Relaunch failure | The installed update remains pending and a safe error is shown. |

Perform the valid-update and signature-rejection tests separately on Windows x86_64, Linux x86_64 AppImage, macOS Intel, and macOS Apple Silicon. Also verify that fonts, collections, favorites, and SQLite data survive the update.

The Bun tests in `src/features/updater/updater.service.test.ts` cover progress calculation, release-note normalization, and safe error handling. End-to-end installer and signature tests require real signed artifacts and remain manual.
