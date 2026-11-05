({__plugin:null,__load(){if(this.__plugin)return this.__plugin;this.__plugin=(()=>{"use strict";
var Plugin = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // unbound:@unbound-app/api
  var require_api = __commonJS({
    "unbound:@unbound-app/api"(exports, module) {
      module.exports = unbound;
    }
  });

  // unbound:react-native
  var require_react_native = __commonJS({
    "unbound:react-native"(exports, module) {
      module.exports = ReactNative;
    }
  });

  // unbound:react
  var require_react = __commonJS({
    "unbound:react"(exports, module) {
      module.exports = React;
    }
  });

  // src/index.tsx
  var index_exports = {};
  __export(index_exports, {
    SettingsPanel: () => SettingsPanel,
    start: () => startRuntime,
    stop: () => stopRuntime
  });

  // src/runtime.ts
  var import_api = __toESM(require_api(), 1);
  var import_react_native = __toESM(require_react_native(), 1);

  // src/archive.ts
  var defaults = {
    enabled: false,
    days: 7,
    limit: 500,
    ignoreBots: true,
    ignoreSelf: false,
    channels: "",
    ignoredUsers: "",
    ignoredGuilds: ""
  };
  var emptyArchive = () => ({ version: 1, generation: 0, options: { ...defaults }, entries: [] });
  var id = (value) => typeof value === "string" && /^\d{1,24}$/.test(value);
  var text = (value, max) => typeof value === "string" && value.length <= max;
  function validOptions(o) {
    return !!o && typeof o.enabled === "boolean" && typeof o.ignoreBots === "boolean" && typeof o.ignoreSelf === "boolean" && Number.isInteger(o.days) && o.days >= 1 && o.days <= 30 && Number.isInteger(o.limit) && o.limit >= 50 && o.limit <= 2e3 && ["channels", "ignoredUsers", "ignoredGuilds"].every((k) => text(o[k], 4e3));
  }
  function validSnapshot(s) {
    return !!s && text(s.content, 16e3) && id(s.authorId) && text(s.authorName, 200) && Array.isArray(s.attachments) && s.attachments.length <= 20 && s.attachments.every((v) => text(v, 300));
  }
  function parseArchive(raw) {
    if (raw.length > 4e6) throw new Error("Archive exceeds the safety limit.");
    const a = JSON.parse(raw);
    if (a?.version !== 1 || !Number.isSafeInteger(a.generation) || a.generation < 0 || !validOptions(a.options) || !Array.isArray(a.entries) || a.entries.length > 2e3 || !a.entries.every((e) => e && id(e.accountId) && id(e.channelId) && id(e.messageId) && (e.guildId === "" || id(e.guildId)) && ["edited", "deleted"].includes(e.kind) && Number.isSafeInteger(e.capturedAt) && e.capturedAt > 0 && validSnapshot(e.before) && (e.kind === "deleted" ? e.after === void 0 : validSnapshot(e.after)))) {
      throw new Error("Unsupported or damaged archive.");
    }
    return a;
  }
  function prune(a, now = Date.now()) {
    a.entries = a.entries.filter((e) => e.capturedAt > now - a.options.days * 864e5 && e.capturedAt <= now + 6e4).sort((x, y) => x.capturedAt - y.capturedAt).slice(-a.options.limit);
    let size = 0;
    a.entries = a.entries.reverse().filter((e) => (size += JSON.stringify(e).length) <= 9e5).reverse();
  }
  function search(a, accountId2, query, channel = "") {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return a.entries.filter((e) => e.accountId === accountId2 && (!channel || e.channelId === channel) && terms.every((t) => [
      e.kind,
      e.channelId,
      e.guildId,
      e.messageId,
      e.before.authorId,
      e.before.authorName,
      e.before.content,
      e.after?.content ?? "",
      ...e.before.attachments,
      ...e.after?.attachments ?? []
    ].join(" ").toLowerCase().includes(t))).reverse();
  }
  var ids = (value) => new Set(value.split(/[\s,]+/).filter(Boolean));
  function snapshot(message) {
    if (!id(message?.author?.id) || typeof message.content !== "string") return;
    return {
      content: message.content.slice(0, 16e3),
      authorId: message.author.id,
      authorName: String(message.author.globalName ?? message.author.global_name ?? message.author.username ?? message.author.id).slice(0, 200),
      // Names only: no attachment URLs, downloads, tokens, embeds or full Discord objects.
      attachments: Array.isArray(message.attachments) ? message.attachments.slice(0, 20).map((a) => String(a.filename ?? a.name ?? "Attachment").slice(0, 300)) : []
    };
  }
  function capture(a, accountId2, kind, previous, next, channel, now = Date.now()) {
    const o = a.options;
    const before = snapshot(previous);
    const channelId = previous?.channel_id;
    if (!o.enabled || !id(accountId2) || !before || !id(channelId) || !id(previous.id) || (Number(previous.flags ?? 0) & 64) !== 0 || o.ignoreBots && previous.author.bot || o.ignoreSelf && before.authorId === accountId2 || ids(o.ignoredUsers).has(before.authorId) || ids(o.ignoredGuilds).has(channel?.guild_id) || ids(o.channels).size > 0 && !ids(o.channels).has(channelId)) return false;
    const after = kind === "edited" ? snapshot({ ...previous, ...next, author: previous.author }) : void 0;
    if (kind === "edited" && (!after || before.content === after.content && JSON.stringify(before.attachments) === JSON.stringify(after.attachments))) return false;
    const entry = {
      accountId: accountId2,
      channelId,
      guildId: channel?.guild_id ?? "",
      messageId: previous.id,
      kind,
      capturedAt: now,
      before,
      ...after ? { after } : {}
    };
    const last = a.entries.at(-1);
    if (last && last.accountId === accountId2 && last.messageId === entry.messageId && last.kind === kind && JSON.stringify(last.before) === JSON.stringify(before) && JSON.stringify(last.after) === JSON.stringify(after)) return false;
    a.entries.push(entry);
    prune(a, now);
    return true;
  }

  // src/disk.ts
  var paths = ["persistent-message-logger-v1-a.json", "persistent-message-logger-v1-b.json"];
  var Disk = class {
    constructor(files) {
      __publicField(this, "files", files);
      __publicField(this, "tail", Promise.resolve());
      __publicField(this, "pending");
      __publicField(this, "running", false);
    }
    async load() {
      const slots = await Promise.all(paths.map(async (path) => {
        if (!await this.files.exists(path)) return { exists: false };
        try {
          return { exists: true, archive: parseArchive(await this.files.readFile(path)) };
        } catch {
          return { exists: true };
        }
      }));
      const valid = slots.flatMap((s) => s.archive ? [s.archive] : []).sort((a, b) => b.generation - a.generation);
      if (!valid.length && slots.some((s) => s.exists)) throw new Error("Archive unreadable. Capture paused; files preserved.");
      return { archive: valid[0] ?? emptyArchive(), recovered: slots.some((s) => s.exists && !s.archive) };
    }
    save(a) {
      a.generation++;
      const data = JSON.stringify(a);
      const waiters = this.pending?.waiters ?? [];
      const operation = new Promise((resolve, reject) => {
        waiters.push({ resolve, reject });
        this.pending = { data, waiters };
      });
      this.tail = operation;
      if (!this.running) void this.drain();
      return operation;
    }
    async drain() {
      this.running = true;
      while (this.pending) {
        const job = this.pending;
        this.pending = void 0;
        try {
          await this.files.writeFile(paths[0], job.data);
          await this.files.writeFile(paths[1], job.data);
          job.waiters.forEach((w) => w.resolve());
        } catch (error) {
          job.waiters.forEach((w) => w.reject(error));
        }
      }
      this.running = false;
    }
    flush() {
      return this.tail;
    }
  };

  // src/runtime.ts
  if (!import_api.flux?.getStore || !import_api.flux?.interceptAction || !import_api.fs?.writeFile) {
    throw new Error("Requires current Unbound with Flux and filesystem APIs; the published 0.11 SDK is insufficient.");
  }
  var users = import_api.flux.getStore("User");
  var channels = import_api.flux.getStore("Channel");
  var messages = import_api.flux.getStore("Message");
  var archive = emptyArchive();
  var disk;
  var active = false;
  var ready = false;
  var status = "Stopped";
  var lifecycleToken = 0;
  var saveRequest = 0;
  var storageFailed = false;
  var removes = [];
  var listeners = /* @__PURE__ */ new Set();
  var subscribe = (fn) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  };
  var accountId = () => users.getCurrentUser()?.id ?? "";
  var state = () => ({ archive, ready, status, accountId: accountId() });
  var notify = () => {
    for (const fn of listeners) fn();
  };
  function sweep() {
    const count = archive.entries.length;
    prune(archive);
    if (archive.entries.length !== count) {
      void save();
      notify();
    }
  }
  async function save() {
    const request = ++saveRequest;
    status = "Saving locally\u2026";
    notify();
    try {
      await disk.save(archive);
      if (request === saveRequest && !storageFailed) status = "Saved locally";
    } catch {
      storageFailed = true;
      archive.options.enabled = false;
      try {
        await disk.save(archive);
      } catch {
      }
    }
    if (storageFailed) status = "Save failed. Capture paused. Check device storage, then restart.";
    notify();
  }
  function onEvent(action, kind) {
    if (!active || !ready || !archive.options.enabled) return false;
    try {
      const channelId = action.channelId ?? action.message?.channel_id;
      const ids2 = kind === "edited" ? [action.message?.id] : action.ids ?? [action.id];
      let changed = false;
      for (const id2 of ids2) {
        if (typeof channelId !== "string" || typeof id2 !== "string") continue;
        const previous = messages.getMessage(channelId, id2);
        if (kind === "edited" && typeof action.message?.content !== "string" && !Array.isArray(action.message?.attachments)) continue;
        changed = capture(
          archive,
          accountId(),
          kind,
          previous && {
            id: previous.id,
            channel_id: channelId,
            author: previous.author,
            content: previous.content,
            attachments: previous.attachments,
            flags: previous.flags
          },
          action.message,
          channels.getChannel(channelId)
        ) || changed;
      }
      if (changed) {
        void save();
        notify();
      }
    } catch {
      status = "Capture failed for an event. Discord continued normally.";
      notify();
    }
    return false;
  }
  async function startRuntime() {
    if (active) return;
    const token = ++lifecycleToken;
    disk = new Disk(import_api.fs);
    const loaded = await disk.load();
    if (token !== lifecycleToken) return;
    archive = loaded.archive;
    prune(archive);
    ready = true;
    active = true;
    await save();
    if (token !== lifecycleToken) return;
    if (loaded.recovered) {
      archive.options.enabled = false;
      await save();
      if (token !== lifecycleToken) return;
      status = "Recovered a backup. Capture paused; review history before resuming.";
    }
    removes.push(
      import_api.flux.interceptAction("MESSAGE_DELETE", (a) => onEvent(a, "deleted")),
      import_api.flux.interceptAction("MESSAGE_DELETE_BULK", (a) => onEvent(a, "deleted")),
      import_api.flux.interceptAction("MESSAGE_UPDATE", (a) => onEvent(a, "edited")),
      import_api.flux.onAction("CONNECTION_OPEN", notify),
      import_api.flux.onAction("LOGOUT", notify),
      import_api.flux.onStoreChange(users, notify)
    );
    const appState = import_react_native.AppState.addEventListener("change", (value) => {
      if (value !== "active") void disk.flush().catch(() => {
      });
      else {
        sweep();
        notify();
      }
    });
    const timer = setInterval(sweep, 6e4);
    removes.push(() => appState.remove(), () => clearInterval(timer));
    notify();
  }
  async function stopRuntime() {
    lifecycleToken++;
    active = false;
    ready = false;
    removes.splice(0).reverse().forEach((fn) => fn());
    if (disk) await disk.flush().catch(() => {
    });
    status = "Stopped";
    notify();
  }
  async function configure(changes) {
    if (!ready) return;
    if (changes.enabled && storageFailed) return;
    const next = { ...archive.options, ...changes };
    if (!validOptions(next)) return;
    archive.options = next;
    prune(archive);
    await save();
  }
  async function clear(allAccounts = false, channelId = "") {
    if (!ready) return;
    const user = accountId();
    archive.entries = allAccounts ? [] : archive.entries.filter((e) => e.accountId !== user || channelId && e.channelId !== channelId);
    await save();
  }

  // src/panel.tsx
  var import_react = __toESM(require_react(), 1);
  var import_react_native2 = __toESM(require_react_native(), 1);
  var foreground = "#f2f3f5";
  var label = { color: foreground, fontSize: 15 };
  var input = { color: foreground, backgroundColor: "#292b30", padding: 10, borderRadius: 6, marginVertical: 5 };
  function Button({ title, onPress }) {
    return /* @__PURE__ */ import_react.default.createElement(
      import_react_native2.Pressable,
      {
        accessibilityRole: "button",
        onPress,
        style: { padding: 12, backgroundColor: "#41466b", borderRadius: 6, marginVertical: 5 }
      },
      /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, title)
    );
  }
  function Toggle({ title, value, onChange }) {
    return /* @__PURE__ */ import_react.default.createElement(import_react_native2.View, { style: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 6 } }, /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, title), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Switch, { accessibilityLabel: title, value, onValueChange: onChange }));
  }
  function Field({ title, value, save: save2, numeric = false }) {
    const [draft, setDraft] = (0, import_react.useState)(value);
    (0, import_react.useEffect)(() => setDraft(value), [value]);
    return /* @__PURE__ */ import_react.default.createElement(import_react_native2.View, null, /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, title), /* @__PURE__ */ import_react.default.createElement(
      import_react_native2.TextInput,
      {
        accessibilityLabel: title,
        style: input,
        value: draft,
        onChangeText: setDraft,
        autoCapitalize: "none",
        autoCorrect: false,
        maxLength: 4e3,
        keyboardType: numeric ? "number-pad" : "default",
        onEndEditing: () => {
          save2(draft);
          setDraft(value);
        }
      }
    ));
  }
  function Record({ entry: e }) {
    return /* @__PURE__ */ import_react.default.createElement(import_react_native2.View, { style: { padding: 10, marginVertical: 4, borderColor: "#555", borderWidth: 1, borderRadius: 6 } }, /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { selectable: true, style: label }, e.kind.toUpperCase(), " \xB7 ", new Date(e.capturedAt).toLocaleString()), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { selectable: true, style: label }, e.before.authorName, " (", e.before.authorId, ")"), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { selectable: true, style: label }, "Channel ", e.channelId, " \xB7 Message ", e.messageId), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { selectable: true, style: label }, e.kind === "edited" ? "Before: " : "", e.before.content || "(no text)"), e.before.attachments.length > 0 && /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { selectable: true, style: label }, "File names: ", e.before.attachments.join(", ")), e.after && /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { selectable: true, style: label }, "After: ", e.after.content || "(no text)"), e.after.attachments.length > 0 && /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { selectable: true, style: label }, "File names after: ", e.after.attachments.join(", "))));
  }
  function SettingsPanel() {
    const [, refresh] = (0, import_react.useReducer)((n) => n + 1, 0);
    (0, import_react.useEffect)(() => subscribe(refresh), []);
    const current = state();
    const { archive: archive2, ready: ready2, status: status2, accountId: accountId2 } = current;
    const o = archive2.options;
    const [query, setQuery] = (0, import_react.useState)("");
    const [channel, setChannel] = (0, import_react.useState)("");
    const [visible, setVisible] = (0, import_react.useState)(30);
    (0, import_react.useEffect)(() => {
      setQuery("");
      setChannel("");
      setVisible(30);
    }, [accountId2]);
    const entries = accountId2 ? search(archive2, accountId2, query, channel.trim()) : [];
    function confirmClear(all = false, channelId = "") {
      import_react_native2.Alert.alert("Clear saved history?", all ? "Erase all saved events for every account on this device?" : channelId ? `Erase saved events in channel ${channelId} for this account?` : "Erase saved events for this account?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => {
          void clear(all, channelId);
        } }
      ]);
    }
    return /* @__PURE__ */ import_react.default.createElement(import_react_native2.View, { style: { padding: 14, backgroundColor: "#1e1f22" } }, /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { accessibilityRole: "header", style: { ...label, fontSize: 20 } }, "Persistent Message Logger"), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, "Local, unencrypted history. Capture only where participants permit it. Device backups may contain these files. No recovery of uncaptured messages. Attachment names only."), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { accessibilityLiveRegion: "polite", style: label }, status2), !ready2 ? /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, "Enable the plugin to load the archive. If loading fails, the original files are preserved.") : /* @__PURE__ */ import_react.default.createElement(import_react.default.Fragment, null, /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, "Account: ", accountId2 || "signed out", " \xB7 Limits apply to all accounts combined."), /* @__PURE__ */ import_react.default.createElement(Toggle, { title: "Capture edits and deletions", value: o.enabled, onChange: (v) => {
      void configure({ enabled: v });
    } }), /* @__PURE__ */ import_react.default.createElement(Toggle, { title: "Ignore bots", value: o.ignoreBots, onChange: (v) => {
      void configure({ ignoreBots: v });
    } }), /* @__PURE__ */ import_react.default.createElement(Toggle, { title: "Ignore my messages", value: o.ignoreSelf, onChange: (v) => {
      void configure({ ignoreSelf: v });
    } }), /* @__PURE__ */ import_react.default.createElement(Field, { title: "Capture channel IDs (comma/space separated; blank = all accessible)", value: o.channels, save: (channels2) => {
      void configure({ channels: channels2 });
    } }), /* @__PURE__ */ import_react.default.createElement(Field, { title: "Ignored user IDs", value: o.ignoredUsers, save: (ignoredUsers) => {
      void configure({ ignoredUsers });
    } }), /* @__PURE__ */ import_react.default.createElement(Field, { title: "Ignored server IDs", value: o.ignoredGuilds, save: (ignoredGuilds) => {
      void configure({ ignoredGuilds });
    } }), /* @__PURE__ */ import_react.default.createElement(Field, { title: "Retention days (1\u201330; invalid values revert)", value: String(o.days), numeric: true, save: (v) => {
      const days = Number(v);
      if (Number.isInteger(days) && days >= 1 && days <= 30) void configure({ days });
      else refresh();
    } }), /* @__PURE__ */ import_react.default.createElement(Field, { title: "Maximum events (50\u20132000; invalid values revert)", value: String(o.limit), numeric: true, save: (v) => {
      const limit = Number(v);
      if (Number.isInteger(limit) && limit >= 50 && limit <= 2e3) void configure({ limit });
      else refresh();
    } }), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, "Lowering limits immediately deletes older events. Text is capped at 16,000 characters per version and 20 file names. Total history has a size cap."), /* @__PURE__ */ import_react.default.createElement(Button, { title: "Clear this account's history", onPress: () => confirmClear() }), /* @__PURE__ */ import_react.default.createElement(Button, { title: "Clear ALL accounts on this device", onPress: () => confirmClear(true) }), /* @__PURE__ */ import_react.default.createElement(
      import_react_native2.TextInput,
      {
        style: input,
        accessibilityLabel: "Search history",
        placeholder: "Search text, user, message ID, deleted or edited",
        placeholderTextColor: "#b5bac1",
        value: query,
        onChangeText: (v) => {
          setQuery(v);
          setVisible(30);
        },
        autoCorrect: false,
        autoCapitalize: "none"
      }
    ), /* @__PURE__ */ import_react.default.createElement(
      import_react_native2.TextInput,
      {
        style: input,
        accessibilityLabel: "Filter history by channel ID",
        placeholder: "Filter by exact channel ID (optional)",
        placeholderTextColor: "#b5bac1",
        value: channel,
        onChangeText: (v) => {
          setChannel(v);
          setVisible(30);
        },
        keyboardType: "number-pad"
      }
    ), channel.trim() !== "" && /* @__PURE__ */ import_react.default.createElement(Button, { title: "Clear this channel's history", onPress: () => confirmClear(false, channel.trim()) }), /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, entries.length, " matching saved events \xB7 newest first"), /* @__PURE__ */ import_react.default.createElement(
      import_react_native2.FlatList,
      {
        style: { maxHeight: 440 },
        nestedScrollEnabled: true,
        data: entries.slice(0, visible),
        keyExtractor: (e) => `${e.accountId}:${e.messageId}:${e.kind}:${e.capturedAt}:${archive2.entries.indexOf(e)}`,
        renderItem: ({ item }) => /* @__PURE__ */ import_react.default.createElement(Record, { entry: item }),
        ListEmptyComponent: /* @__PURE__ */ import_react.default.createElement(import_react_native2.Text, { style: label }, "No saved events match.")
      }
    ), entries.length > visible && /* @__PURE__ */ import_react.default.createElement(Button, { title: "Show 30 more", onPress: () => setVisible((n) => n + 30) })));
  }
  return __toCommonJS(index_exports);
})();

return Plugin;})();return this.__plugin;}})