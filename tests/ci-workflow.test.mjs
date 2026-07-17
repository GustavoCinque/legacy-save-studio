import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { versionTag } = require("../scripts/version-tag.cjs");

const workflowPath = new URL("../.github/workflows/build-electron.yml", import.meta.url);
const nextConfigPath = new URL("../next.config.ts", import.meta.url);
const packagePath = new URL("../package.json", import.meta.url);

test("Turbopack is isolated from lockfiles in parent directories", async () => {
  const config = await readFile(nextConfigPath, "utf8");
  assert.match(config, /turbopack:\s*\{\s*root:\s*process\.cwd\(\)\s*\}/);
  assert.match(config, /assetPrefix:\s*process\.env\.NODE_ENV\s*===\s*"production"\s*\?\s*"\."\s*:\s*undefined/);
});

test("local web and Electron development avoid the Turbopack compile hang", async () => {
  const pkg = JSON.parse(await readFile(packagePath, "utf8"));
  assert.equal(pkg.scripts.dev, "next dev --webpack");
  assert.match(pkg.scripts["dev:electron"], /next dev --webpack/);
});

test("CI tests the project and publishes the portable ZIP as an artifact", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  assert.match(workflow, /validate:\s+ runs-on: windows-latest/);
  assert.match(workflow, /package-and-release:\s+ needs: validate/);
  assert.match(workflow, /if: github\.event_name == 'push'/);
  assert.match(workflow, /github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /runs-on: windows-latest/);
  assert.match(workflow, /run: npm test/);
  assert.match(workflow, /run: npm run eval/);
  assert.match(workflow, /npm run build:portable/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(workflow, /dist\/LegacySaveStudio-Windows-x64\.zip/);
});

test("pull requests validate but never package, tag, or release", async () => {
  const workflow = await readFile(workflowPath, "utf8");
  const packageJob = workflow.slice(workflow.indexOf("  package-and-release:"));
  assert.match(packageJob, /needs: validate/);
  assert.match(packageJob, /if: github\.event_name == 'push'/);
  assert.doesNotMatch(packageJob, /pull_request/);
  assert.match(workflow.slice(0, workflow.indexOf("  package-and-release:")), /pull_request:/);
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
