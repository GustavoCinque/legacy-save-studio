const fs = require("node:fs");

function versionTag(packageJson) {
  const version = typeof packageJson === "string" ? JSON.parse(packageJson).version : packageJson?.version;
  if (typeof version !== "string" || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) {
    throw new Error("package.json must contain a valid semantic version");
  }
  return `v${version}`;
}

if (require.main === module) {
  const packagePath = process.argv[2] || "package.json";
  process.stdout.write(versionTag(fs.readFileSync(packagePath, "utf8")));
}

module.exports = { versionTag };
