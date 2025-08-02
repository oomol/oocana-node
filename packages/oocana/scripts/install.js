const fs = require("node:fs");
const path = require("node:path");
const matrix = require("../src/matrix.json");

const platform = process.env.npm_config_platform || process.platform;
const arch =
  process.env.npm_config_arch ||
  (platform === "linux"
    ? `${process.arch}-${isMusl() ? "musl" : "gnu"}`
    : process.arch);

if (!matrix[platform]) {
  console.error(`Unsupported platform: ${platform}, ${arch}.`);
  process.exit(0);
}

const target = matrix[platform][arch];

if (!target) {
  console.error(`Unsupported architecture: ${platform} ${arch}.`);
  process.exit(0);
}

const packageName = `@oomol/oocana-cli-${target}`;

let oocanaBinPath = "";

try {
  oocanaBinPath = path.join(
    require.resolve(packageName),
    "..", // index.js
    "bin",
    "oocana"
  );
} catch (error) {
  console.error(
    `Failed to resolve package: ${packageName}. Make sure it is installed.`
  );
  console.error(`No package found for architecture: ${platform} ${arch}.`);
}

if (!oocanaBinPath || !fs.existsSync(oocanaBinPath)) {
  console.error(`No package found for architecture: ${platform} ${arch}.`);
  process.exit(-2);
}

(async () => {
  const { copyFile } = fs.promises;
  try {
    await copyFile(oocanaBinPath, path.join(__dirname, "..", "oocana"));
  } catch (error) {
    console.error(error);
  }
})();

function isMusl() {
  // For Node 10
  if (!process.report || typeof process.report.getReport !== "function") {
    try {
      return fs.readFileSync("/usr/bin/ldd", "utf8").includes("musl");
    } catch (e) {
      return true;
    }
  } else {
    const { glibcVersionRuntime } = process.report.getReport().header;
    return !glibcVersionRuntime;
  }
}
