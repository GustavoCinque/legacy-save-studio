import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("eval: local development remains bound to this repository when nested in another Node workspace", async () => {
  const config = await readFile(new URL("../next.config.ts", import.meta.url), "utf8");
  assert.match(config, /turbopack:\s*\{\s*root:\s*process\.cwd\(\)\s*\}/);
  assert.doesNotMatch(config, /\.\.\/|\.\.\\/);
});
