const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "public", "data");
const blockedIds = new Set(JSON.parse(fs.readFileSync(path.join(dataDir, "unsupported_unit_ids.json"), "utf8")).map(Number));

function build(sourceName, targetName) {
  const source = JSON.parse(fs.readFileSync(path.join(dataDir, sourceName), "utf8"));
  if (!Array.isArray(source)) throw new TypeError(`${sourceName} must contain a JSON array`);
  const compatible = source.filter(unit => !blockedIds.has(Number(unit.unitId)));
  fs.writeFileSync(path.join(dataDir, targetName), `${JSON.stringify(compatible)}\n`, "utf8");
  return { source: source.length, compatible: compatible.length };
}

const simple = build("units_database_simple.json", "units_database_compatible_simple.json");
const full = build("units_database_full.json", "units_database_compatible_full.json");
console.log(JSON.stringify({ blockedIds: blockedIds.size, simple, full }));
