import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { versionTag } = require("../scripts/version-tag.cjs");

test("eval: stable and prerelease package versions always produce valid Git tag names", () => {
  const cases = ["0.1.6", "1.0.0", "10.24.300", "2.0.0-alpha", "3.1.4-rc.2"];
  for (const version of cases) assert.equal(versionTag({ version }), `v${version}`);
});

test("eval: malformed or unsafe versions never reach git tag", () => {
  for (const version of ["", "1", "1.2", "v1.2.3", "1.2.3 && echo bad", "../1.2.3"]) {
    assert.throws(() => versionTag({ version }), /semantic version/);
  }
});
