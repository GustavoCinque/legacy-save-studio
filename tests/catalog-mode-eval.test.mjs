import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = name => JSON.parse(fs.readFileSync(new URL(`../public/data/${name}`, import.meta.url), "utf8"));

test("eval: compatible mode cannot offer a unit observed as missing by the game", () => {
  const blocked = read("unsupported_unit_ids.json").map(Number);
  const compatibleIds = new Set(read("units_database_compatible_simple.json").map(unit => Number(unit.unitId)));
  for (const id of blocked) assert.equal(compatibleIds.has(id), false, `unsupported unit ${id}`);
});

test("eval: full mode remains unchanged and can still expose excluded units intentionally", () => {
  const blocked = new Set(read("unsupported_unit_ids.json").map(Number));
  const fullIds = new Set(read("units_database_simple.json").map(unit => Number(unit.unitId)));
  assert.ok([...blocked].some(id => fullIds.has(id)));
});

test("eval: catalog mode and page navigation stay close to the workflows they affect", () => {
  const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  assert.match(page, /catalog-table-tools/);
  assert.match(page, /player-catalog-setting/);
  assert.equal((page.match(/<footer>.*catalog-pagination/g) ?? []).length, 0);
});
