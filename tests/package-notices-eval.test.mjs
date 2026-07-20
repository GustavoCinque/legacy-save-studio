import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("eval: every Electron packaging path exposes both project notices without replacing Electron's license", async () => {
  const [script, packageText] = await Promise.all([
    read("scripts/build-portable.ps1"),
    read("package.json"),
  ]);
  const pkg = JSON.parse(packageText);

  for (const name of ["LICENSE.LegacySaveStudio.txt", "THIRD_PARTY_NOTICES.md"]) {
    assert.match(script, new RegExp(name.replaceAll(".", "\\.")));
    assert.ok(pkg.build.extraFiles.some(entry => entry.to === name), name);
  }

  assert.doesNotMatch(script, /Join-Path \$target 'LICENSE'/);
  assert.ok(pkg.build.extraFiles.every(entry => entry.to !== "LICENSE"));
});
