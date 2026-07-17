import test from "node:test";
import assert from "node:assert/strict";
import { createBrowserFileService } from "../work/test-dist/lib/browser-file-service.js";
import { saveDirectory } from "./helpers/fake-browser-fs.mjs";

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
