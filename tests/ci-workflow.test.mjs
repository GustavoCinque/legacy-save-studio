import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { versionTag } = require("../scripts/version-tag.cjs");

const workflowPath = new URL("../.github/workflows/build-electron.yml", import.meta.url);

test("CI tests the project and publishes the portable ZIP as an artifact", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(workflow, /runs-on: windows-latest/);
  assert.match(workflow, /run: npm test/);
  assert.match(workflow, /run: npm run eval/);
  assert.match(workflow, /npm run build:portable/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /dist\/LegacySaveStudio-Windows-x64\.zip/);
});

test("a new package version creates a tag and publishes the same ZIP", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /node scripts\/version-tag\.cjs package\.json/);
  assert.match(workflow, /steps\.version\.outputs\.create == 'true'/);
  assert.match(workflow, /git tag -a/);
  assert.match(workflow, /git push origin/);
  assert.match(workflow, /tags: \["v\*"\]/);
  assert.match(workflow, /softprops\/action-gh-release@v2/);
  assert.match(workflow, /tag_name:/);
  assert.match(workflow, /files: dist\/LegacySaveStudio-Windows-x64\.zip/);
});

test("package versions map deterministically to release tags", () => {
  assert.equal(versionTag({ version: "1.2.3" }), "v1.2.3");
  assert.equal(versionTag('{"version":"2.0.0-beta.1"}'), "v2.0.0-beta.1");
  assert.throws(() => versionTag({ version: "latest" }), /semantic version/);
});
