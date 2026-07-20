import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("eval: notices distinguish code licensing, provenance, and removal contact", async () => {
  const [readme, notice] = await Promise.all([
    read("README.md"),
    read("THIRD_PARTY_NOTICES.md"),
  ]);

  assert.match(readme, /unofficial, non-commercial community project/);
  assert.match(readme, /does not grant any rights to[\s\S]*game-derived content/);
  assert.match(notice, /## License scope/);
  assert.match(notice, /## Data provenance/);
  assert.match(notice, /## Rights-holder contact and removal requests/);
  assert.match(notice, /does not contain an official game executable, sprites, artwork,[\s\S]*user save[\s\S]*files/);
});
