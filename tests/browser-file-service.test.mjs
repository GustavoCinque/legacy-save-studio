import test from "node:test";
import assert from "node:assert/strict";
import { BROWSER_SAVE_TOKEN, createBrowserFileService } from "../work/test-dist/lib/browser-file-service.js";
import { saveDirectory } from "./helpers/fake-browser-fs.mjs";

const fixture = () => ({ player: { playerName: "Browser", unitDex: [], unknown: { keep: true } }, inventory: { nextKey: 0, playerUnits: {} }, parties: { parties: {} } });

test("browser mode selects a folder and loads all three save files", async () => {
  const directory = saveDirectory(fixture());
  const service = createBrowserFileService(async () => directory);
  assert.equal(await service.selectSaveDirectory(), BROWSER_SAVE_TOKEN);
  const loaded = await service.loadSave(BROWSER_SAVE_TOKEN);
  assert.equal(loaded.directory.name, "Brave Frontier_ Legacy");
  assert.equal(loaded.bundle.player.playerName, "Browser");
});

test("browser save creates a complete backup and preserves unknown fields", async () => {
  const directory = saveDirectory(fixture());
  const service = createBrowserFileService(async () => directory);
  await service.selectSaveDirectory();
  const bundle = (await service.loadSave()).bundle;
  bundle.player.playerName = "Changed";
  const backup = await service.saveBundle(BROWSER_SAVE_TOKEN, bundle);
  assert.match(backup.name, /^backup_/);
  assert.equal((await service.loadSave()).bundle.player.playerName, "Changed");
  assert.deepEqual((await service.loadSave()).bundle.player.unknown, { keep: true });
  assert.equal((await service.listBackups()).length, 1);
});

test("browser restore makes a safety backup before replacing current files", async () => {
  const directory = saveDirectory(fixture());
  const service = createBrowserFileService(async () => directory);
  await service.selectSaveDirectory();
  const changed = (await service.loadSave()).bundle;
  changed.player.playerName = "Changed";
  const original = await service.saveBundle(BROWSER_SAVE_TOKEN, changed);
  const restored = await service.restoreBackup(BROWSER_SAVE_TOKEN, original.name);
  assert.equal(restored.bundle.player.playerName, "Browser");
  assert.match(restored.safety.name, /^backup_before_restore_/);
});
