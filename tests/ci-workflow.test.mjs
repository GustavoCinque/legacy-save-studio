import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

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

test("version tags publish the same ZIP in GitHub Releases", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(workflow, /tags: \["v\*"\]/);
  assert.match(workflow, /softprops\/action-gh-release@v2/);
  assert.match(workflow, /files: dist\/LegacySaveStudio-Windows-x64\.zip/);
});
