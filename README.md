# Persistent Message Logger 0.2.0 — unofficial fork

This version is based directly on Unbound's official Message Logger source, rather than the custom settings/viewer implementation used in 0.1.x. The original authors are credited in the manifest; this is not an official Unbound release.

## What changed

- Preserves the official logger's red deleted messages, inline edit history, attachment markers, long-press actions, filtering and nonce handling.
- Uses the **official generated settings panel** from `settings.ts` and the official Rollup preset, with vendored build dependencies. There is no hand-written `SettingsPanel` export or custom esbuild runtime bridge.
- Adds an opt-in local persistent archive, search, account separation, clear controls and retention limits.
- Opens archived records using the same `ActionSheets.openLazy` + `Discord.ActionSheet` pattern as the official logger's history sheet, with Discord text components. Search text lives only in the sheet's React state; it is not stored in synced settings.

## Install / replace 0.1.x

If Discord is on the crash screen, choose **Restart in recovery mode** and disable the failed plugin before continuing.

Upload **all files in the hosting ZIP** to the same GitHub repository folder as before. `index.js` and `manifest.json` replace the old build; `LICENSE`, `README.md` and `source.zip` provide attribution and complete corresponding source. Do not upload the ZIP itself in place of its extracted contents.

Keep the existing manifest URL, for example:

```text
https://YOUR-USERNAME.github.io/persistent-message-logger/manifest.json
```

Wait for GitHub Pages to finish publishing. Remove the failed 0.1.x plugin in Unbound and install from the same URL; check that the card says **0.2.0**. Leave recovery mode, restart Discord and enable this fork. **Keep the official Message Logger and any other logger disabled while using the fork**: both patch the same events and chat rows.

Only the public code/source is hosted. Captured records stay in files on the phone. Nothing was deployed or published by the agent.

## Use

The gear opens the official-style generated settings panel. The familiar appearance/logging/ignore options are preserved. In **Persistent archive**:

1. Optionally enter exact capture channel IDs (comma or space separated; blank permits all accessible channels). Original ignored users/channels/categories/servers still apply.
2. Turn on **Save captured messages across restarts**. Persistence starts off; ordinary in-chat logging follows the original toggles independently.
3. Choose retention days (1–30) and maximum saved events (50–2000). Defaults are seven days and 500 events across all accounts combined.
4. Tap **Open saved archive and search**. Search matches text, file names, author names/IDs, channel/server/message IDs, `edited`, and `deleted`. Words must all match. Use an exact channel filter when needed. Results are shown for the signed-in account only, newest first, 20 per page.
5. Clear this account's archive or all accounts through the confirmation buttons. The official long-press Clear Message History / Clear Message Log actions also clear corresponding saved records. Ordinary Dismiss removes a message from chat; it does not erase its archived record.

After a restart, the original live chat cache is gone, as in the official plugin. **Previously captured records remain in the saved archive sheet; they are not reinserted into Discord chat.** Disabling the plugin retains the archive. Clearing the saved archive does not automatically purge the official in-memory chat decorations; use its original clear actions for those.

## Durability, privacy and limits

- Captures only loaded messages available to Discord's MessageStore when a live edit/delete event is observed. Cannot recover earlier deletions or events missed while Discord is closed/offline. Does not fetch inaccessible history or bypass permissions.
- Data files: `persistent-message-logger-v1-a.json` and `persistent-message-logger-v1-b.json` in Discord's documents directory. They are outside Unbound's settings-sync Buckets. Archive preferences in the generated settings can participate in ordinary Unbound settings sync, but message bodies and search queries are not put there.
- Stores bounded before/after text, author ID/name, account/channel/server/message IDs, local capture time/type, and attachment file names. No attachment bytes or URLs, embeds, tokens, or complete Discord objects. Same-name file replacements may not be distinguishable.
- Files are not encrypted by this plugin. Device/app backups and other code with access to Discord's documents may read them. Capture only where participants permit. No archive upload, analytics or export feature is included.
- Each capture initiates a serialized two-copy save; bursts coalesce to the newest pending snapshot. Wait for **Saved locally** in the archive sheet before force-closing. No public fsync/atomic-rename API is available, so a force-close/power loss during a native write can lose recent records. A successful mocked restart test is not an iPhone durability guarantee.
- The newest valid file generation is loaded. One damaged copy causes recovery with persistence off; two unreadable copies fail without overwriting originals.
- Archive retention is measured from capture time, across all accounts combined. It runs at startup, capture/settings changes and about once per active minute. It cannot run while the app is closed. A ~900,000 UTF-16-character event budget may evict records earlier than the event limit. Each version is capped at 16,000 text characters and 20 file names of 300 characters each.
- Clear rewrites both active copies after queued saves; it is not forensic secure erasure and cannot delete backups elsewhere. Before uninstalling, clear **ALL accounts**, check **Saved locally**, then remove the plugin. Uninstalling may leave these separate documents files. The v1 file format is shared with 0.1.x, so any previously saved records can load here.

## Build and validation

Use Node.js 22+ and npm; Bun is required to run the official test suite.

```sh
npm ci --legacy-peer-deps
npm run build
npm run typecheck
npm test
bun test tests
```

`npm test` rebuilds and runs seven storage/logic tests under Node. `bun test tests` uses the official SDK testing preset and runs **50 tests**: 38 preserved upstream tests, seven storage tests, and five integration tests. The intentionally failing-feature test prints an expected error but passes.

The build uses the official CLI Rollup preset and its settings/i18n generators. Hermes bytecode is disabled; JavaScript source is supported by the installer. Vendored compiler/contract/shared/API sources preserve their license and make the build independent of the npm 0.11/current-source version mismatch. No production npm modules are loaded on the phone.

Completed: official baseline build; 0.2.0 build; strict project type checking; all 50 tests; official client manifest parsing. The integration tests check restart persistence after the official purge, edits before attachment preservation, persistence-off defaults, clear behavior, generated settings and archive-sheet rendering.

**Not yet verified on the iPhone:** successful settings navigation with 0.2.0, native archive sheet behavior, actual Discord event timing and force-close durability. The previous 0.1.x Reanimated crash is not claimed to be reproduced or solved on hardware. This is a new official-source-based test build.

## Source and attribution

Upstream: <https://github.com/marioparaschiv/unbound>, commit `6b0f3d762004758f5bd3082d5c500cdf2b711990`. Its Message Logger code/settings match the user's Unbound commit `bea93f7d146092cb72ed7892c3c97174ba7af6ae` (no differences in those paths). The official source files that changed are listed in `UPSTREAM-NOTES.md`.

GPL-3.0-only; see `LICENSE`. Keep the original author credits, license and corresponding source with redistributed builds. `source.zip` contains this project's source and vendored build/shared/API sources, without node_modules or captured user data.
