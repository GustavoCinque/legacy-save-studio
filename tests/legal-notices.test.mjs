import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("README limits the MIT license and provides a rights-holder contact", async () => {
  const readme = await read("README.md");
  assert.match(readme, /MIT License applies exclusively to the original source code/);
  assert.match(readme, /not affiliated with[\s\S]*any rights holder/);
  assert.match(readme, /issues\/new\?template=content-removal\.yml/);
});

test("third-party notice records provenance for every distributed catalog", async () => {
  const notice = await read("THIRD_PARTY_NOTICES.md");
  for (const file of [
    "units_database_full.json",
    "units_database_simple.json",
    "unsupported_unit_ids.json",
    "units_database_compatible_full.json",
    "units_database_compatible_simple.json",
  ]) {
    assert.match(notice, new RegExp(`\\b${file.replaceAll(".", "\\.")}\\b`), file);
  }
  assert.match(notice, /exact upstream extractor, author, and license[\s\S]*unknown/i);
  assert.match(notice, /cheahjs\/bravefrontier_data\/blob\/master\/info\.json/);
});

test("content-removal form collects an actionable request without demanding private data", async () => {
  const form = await read(".github/ISSUE_TEMPLATE/content-removal.yml");
  for (const field of ["request-type", "work", "locations", "authority", "action", "accuracy"]) {
    assert.match(form, new RegExp(`id: ${field}\\b`), field);
  }
  assert.match(form, /Do not include private personal information/);
});
