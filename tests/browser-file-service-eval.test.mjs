import test from "node:test";
import assert from "node:assert/strict";
import { createBrowserFileService } from "../work/test-dist/lib/browser-file-service.js";
import { saveDirectory } from "./helpers/fake-browser-fs.mjs";

test("eval: every save shortcut opens valid JSON for arbitrary save contents", async () => {
  const initial = { player: { unicode: "Bravé", unitDex: [] }, inventory: { nextKey: 91, playerUnits: { "90": { unitId: "10011" } } }, parties: { parties: { "0": { leaderUnitIndex: 0, slots: {} } } } };
  const opened = new Map();
  const service = createBrowserFileService(async () => saveDirectory(initial), async (name, contents) => opened.set(name, JSON.parse(await contents)));
  await service.selectSaveDirectory();
  for (const name of ["playerdata.json", "unitinventory.json", "parties.json"]) await service.openSaveFile("browser://selected-save", name);
  assert.equal(opened.size, 3);
  assert.equal(opened.get("playerdata.json").unicode, "Bravé");
  assert.equal(opened.get("unitinventory.json").nextKey, 91);
  assert.deepEqual(opened.get("parties.json").parties["0"].slots, {});
});

test("eval: repeated browser saves remain readable and retain arbitrary game fields", async () => {
  const initial = { player: { unitDex: [], nested: { a: [1, 2, 3] } }, inventory: { nextKey: 0, playerUnits: {}, futureField: "preserved" }, parties: { parties: {} } };
  const service = createBrowserFileService(async () => saveDirectory(initial));
  await service.selectSaveDirectory();
  for (let index = 0; index < 5; index++) {
    const bundle = (await service.loadSave()).bundle;
    bundle.player.iteration = index;
    await service.saveBundle("browser://selected-save", bundle);
  }
  const final = (await service.loadSave()).bundle;
  assert.equal(final.player.iteration, 4);
  assert.deepEqual(final.player.nested, { a: [1, 2, 3] });
  assert.equal(final.inventory.futureField, "preserved");
  assert.equal((await service.listBackups()).length, 5);
});

test("eval: bulk backup deletion never changes the active browser save", async () => {
  const initial = { player: { marker: "active", unitDex: [] }, inventory: { nextKey: 0, playerUnits: {} }, parties: { parties: {} } };
  const service = createBrowserFileService(async () => saveDirectory(initial));
  await service.selectSaveDirectory();
  for (let index = 0; index < 10; index++) await service.saveBundle("browser://selected-save", (await service.loadSave()).bundle);
  assert.equal(await service.deleteBackups("browser://selected-save"), 10);
  assert.equal((await service.loadSave()).bundle.player.marker, "active");
});
