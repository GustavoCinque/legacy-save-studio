import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("portable ZIP places project license and third-party notice beside the executable", async () => {
  const script = await read("scripts/build-portable.ps1");
  assert.match(script, /LICENSE\.LegacySaveStudio\.txt/);
  assert.match(script, /THIRD_PARTY_NOTICES\.md/);
  assert.match(script, /Join-Path \$target 'LICENSE\.LegacySaveStudio\.txt'/);
  assert.match(script, /Join-Path \$target 'THIRD_PARTY_NOTICES\.md'/);
});

test("electron-builder packages the same visible notices", async () => {
  const pkg = JSON.parse(await read("package.json"));
  assert.deepEqual(pkg.build.extraFiles, [
    { from: "LICENSE", to: "LICENSE.LegacySaveStudio.txt" },
    { from: "THIRD_PARTY_NOTICES.md", to: "THIRD_PARTY_NOTICES.md" },
  ]);
});

test("package and lockfile versions stay synchronized for release tagging", async () => {
  const [pkg, lock] = await Promise.all([
    read("package.json").then(JSON.parse),
    read("package-lock.json").then(JSON.parse),
  ]);
  assert.equal(pkg.version, "0.1.9");
  assert.equal(lock.version, pkg.version);
  assert.equal(lock.packages[""].version, pkg.version);
});
