import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("eval: local development remains bound to this repository when nested in another Node workspace", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /turbopack:\s*\{\s*root:\s*process\.cwd\(\)\s*\}/);
  assert.doesNotMatch(config, /\.\.\/|\.\.\\/);
});

test("eval: every interactive development entry point uses the stable compiler", async () => {
  const pkg = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const developmentScripts = [pkg.scripts.dev, pkg.scripts["dev:electron"]];
  assert.ok(developmentScripts.every(script => script.includes("next dev --webpack")));
});

test("eval: development uses root assets while exported Electron builds keep relative assets", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /assetPrefix:\s*process\.env\.NODE_ENV\s*===\s*"production"\s*\?\s*"\."\s*:\s*undefined/);
});
