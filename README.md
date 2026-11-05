# Persistent Message Logger 0.3.1 — unofficial fork

Based directly on Unbound's official Message Logger source, with a local persistent archive and inline restoration of captured deleted text. The original authors are credited in the manifest; this is not an official Unbound release.

## What changed

- Preserves the official logger's red deleted messages, inline edit history, attachment markers, long-press actions, filtering and nonce handling.
- Uses the **official generated settings panel** from `settings.ts` and the official Rollup preset, with vendored build dependencies. There is no hand-written `SettingsPanel` export or custom esbuild runtime bridge.
- Adds an opt-in local persistent archive, search, account separation, clear controls and retention limits.
- Restores retained deleted-message text in red in its original channel after a restart, when Discord loads the relevant message-history window. This is local display only: no message is posted to the server.
- Opens archived records using the same `ActionSheets.openLazy` + `Discord.ActionSheet` pattern as the official logger's history sheet, with Discord text components. Search text lives only in the sheet's React state; it is not stored in synced settings.

## Install / update

If Discord is on the crash screen, choose **Restart in recovery mode** and disable the failed plugin before continuing.

Upload **all files in the hosting ZIP** to the same GitHub repository folder as before. `index.js` and `manifest.json` replace the old build; `LICENSE`, `README.md` and `source.zip` provide attribution and complete corresponding source. Do not upload the ZIP itself in place of its extracted contents.

Keep the existing manifest URL, for example:

```text
https://YOUR-USERNAME.github.io/persistent-message-logger/manifest.json
```

Wait for GitHub Pages to finish publishing. Update/reinstall from the same URL; check that the card says **0.3.1**. Leave recovery mode if needed, restart Discord and enable this fork. **Keep the official Message Logger and any other logger disabled while using the fork**: both patch the same events and chat rows.

Only the public code/source is hosted. Captured records stay in files on the phone.

## Use

The gear opens the official-style generated settings panel. The familiar appearance/logging/ignore options are preserved. In **Persistent archive**:

1. Optionally enter exact capture channel IDs (comma or space separated; blank permits all accessible channels). Original ignored users/channels/categories/servers still apply.
2. Turn on **Save captured messages across restarts**. Persistence starts off; ordinary in-chat logging follows the original toggles independently.
   Leave **Restore saved deletions in their original channel** on (default), and keep **Red text** on for the red appearance requested. After a restart, open the original channel and let its history load. Scroll to older messages to load older saved deletions.
3. Choose retention days (1–30) and maximum saved events (50–2000). Defaults are seven days and 500 events across all accounts combined.
4. Tap **Open saved archive and search**. Search matches text, file names, author names/IDs, channel/server/message IDs, `edited`, and `deleted`. Words must all match. Use an exact channel filter when needed. Results are shown for the signed-in account only, newest first, 20 per page.
5. Clear this account's archive or all accounts through the confirmation buttons. The official long-press Clear Message History / Clear Message Log actions also clear corresponding saved records. **Dismiss now also removes a deleted message's saved record**, so it does not return on the next restart.

### Inline restoration

Saved deleted text is merged into a real `LOAD_MESSAGES_SUCCESS` batch for its original channel and marked using the official logger's red/deleted row decoration. Original message IDs preserve chronological ordering; the display timestamp is reconstructed from the message ID. Live server-provided messages are never overwritten, duplicates are avoided, and pagination metadata is preserved. Only the signed-in account's retained records are considered, and current ignore/channel settings apply.

No synthetic `MESSAGE_CREATE`, send-message request, notification, unread update or channel-history fetch is generated. A history load must occur before restoration can happen. Older deleted text appears when its portion of history loads. An empty channel can restore saved text only when the payload explicitly identifies a fully exhausted initial page. Unrecognized payload/record shapes are left unchanged; if a record-valued batch needs a converter, Unbound must expose Discord's `createMessageRecord` module.

Only text and a plain file-name note are restored. Attachment bytes/URLs, avatars, embeds, replies/reactions and full original message objects were not saved and are not reconstructed. After-restart **inline edit history** is not added by this change; edited versions remain searchable in the archive. The live official edit-history behavior is preserved.

Disabling the plugin purges its local deleted rows while retaining saved records for the next start. Clear, dismissal, retention expiry and account changes remove restored rows without recording cleanup as a new deletion. Archive retention does not govern the official plugin's separate live memory-only cache; its original clear actions remain available. Restoration is a device-local view, not recovery on Discord's servers.

## Durability, privacy and limits

- Captures only loaded messages available to Discord's MessageStore when a live edit/delete event is observed. Cannot recover earlier deletions or events missed while Discord is closed/offline. Does not fetch inaccessible history or bypass permissions.
- Data files: `persistent-message-logger-v1-a.json` and `persistent-message-logger-v1-b.json` in Discord's documents directory. They are outside Unbound's settings-sync Buckets. Archive preferences in the generated settings can participate in ordinary Unbound settings sync, but message bodies and search queries are not put there.
- Stores bounded before/after text, author ID/name and bot flag, account/channel/server/message IDs, local capture time/type, and attachment file names. No attachment bytes or URLs, embeds, tokens, or complete Discord objects. Same-name file replacements may not be distinguishable. Older archives without a bot flag remain readable.
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

`npm test` rebuilds and runs 13 storage/merge tests under Node. `bun test tests` uses the official SDK testing preset and runs **64 tests**: 38 upstream tests, seven storage tests, six restoration-merge tests, and nine integration tests. The intentionally failing-feature test prints an expected error but passes.

The build uses the official CLI Rollup preset and its settings/i18n generators. Hermes bytecode is disabled; JavaScript source is supported by the installer. Vendored compiler/contract/shared/API sources preserve their license and make the build independent of the npm 0.11/current-source version mismatch. No production npm modules are loaded on the phone.

Completed: official baseline build; 0.3.1 build; strict project type checking; all 64 tests; official client manifest parsing. Integration tests also simulate a restart and history load, assert the saved text returns with the official red/deleted decoration, and check dismissal, account/filter isolation and stop preservation.

The user has confirmed the 0.2.0 settings work on their iPhone. **0.3.1 inline restoration has not yet been verified on the iPhone.** The native Discord 352.1 message-history payload and record converter have not been directly inspected in a live device runtime; tests exercise guarded raw/record handling using SDK mocks. On-device history-load behavior and actual force-close durability still need a test. Unknown payloads safely keep Discord's normal response and the saved archive remains available.

## Source and attribution

Upstream: <https://github.com/marioparaschiv/unbound>, commit `6b0f3d762004758f5bd3082d5c500cdf2b711990`. Its Message Logger code/settings match the user's Unbound commit `bea93f7d146092cb72ed7892c3c97174ba7af6ae` (no differences in those paths). The official source files that changed are listed in `UPSTREAM-NOTES.md`.

GPL-3.0-only; see `LICENSE`. Keep the original author credits, license and corresponding source with redistributed builds. `source.zip` contains this project's source and vendored build/shared/API sources, without node_modules or captured user data.

## Mobile deletion fix in 0.3.1

Locally initiated deleteMessage calls can produce an optimistic deletion plus a server confirmation. A bounded, one-confirmation guard keeps that confirmation from being interpreted as Dismiss. Explicit onlyLocal dismissals bypass the guard. The original delete request, arguments and return value are preserved. Four SDK regression tests cover phone deletion, explicit/immediate dismissal, and a server-only deletion. This sequence is simulated in tests; the exact phone-side event sequence still needs the user’s retest.
