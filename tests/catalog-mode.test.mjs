import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = name => JSON.parse(fs.readFileSync(new URL(`../public/data/${name}`, import.meta.url), "utf8"));

test("compatible catalogs exclude every unsupported ID and preserve full records", () => {
  const blocked = new Set(read("unsupported_unit_ids.json").map(Number));
  const full = read("units_database_full.json");
  const compatibleFull = read("units_database_compatible_full.json");
  const compatibleSimple = read("units_database_compatible_simple.json");
  assert.equal(blocked.size, 222);
  assert.equal(compatibleFull.length, full.length - full.filter(unit => blocked.has(Number(unit.unitId))).length);
  assert.ok(compatibleFull.every(unit => !blocked.has(Number(unit.unitId))));
  assert.ok(compatibleSimple.every(unit => !blocked.has(Number(unit.unitId))));
  const compatibleIds = new Set(compatibleFull.map(unit => Number(unit.unitId)));
  assert.ok(compatibleSimple.every(unit => compatibleIds.has(Number(unit.unitId))));
});

test("catalog controls are placed in their task-specific sections instead of the header or footer", () => {
  const page = fs.readFileSync(new URL("../app/page.tsx", import.meta.url), "utf8");
  const header = page.match(/<header className="topbar">([\s\S]*?)<\/header>/)?.[1] ?? "";
  const footer = page.match(/<footer>([\s\S]*?)<\/footer>/)?.[1] ?? "";
  assert.doesNotMatch(header, /catalog-select|catalog-pagination/);
  assert.doesNotMatch(footer, /catalog-select|catalog-pagination/);
  assert.match(page, /catalog-table-tools.*items\[0\].*pagination/);
  assert.match(page, /tab==="player".*player-catalog-setting/);
});
