import { spawn } from "node:child_process";
import { join } from "node:path";
import { Cli } from "./cli";
import { generateSpawnEnvs } from "./env";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import type { BindPath } from "./oocana";

type PackageOptions = {
  packagePath: string;
};

type CommonParams = {
  bin?: string;
} & PackageOptions;

// TODO: 现在只是单纯检查 ovmlayer 是否在 bin 中。
// 未来应该直接使用 ovmlayer 的自检功能，来确认依赖是否完全。
async function isPackageLayerEnable() {
  const cli = new Cli(spawn("which", ["ovmlayer"]));
  return cli
    .wait()
    .then(code => code === 0)
    .catch(() => false);
}

type ExportParams = {
  dest: string;
} & CommonParams;

// Export a package layer to a directory. require package layer is exit
async function exportPackageLayer(params: ExportParams) {
  const oocanaPath = params.bin ?? join(__dirname, "..", "oocana");
  const { packagePath, dest } = params;
  const cli = new Cli(
    spawn(oocanaPath, ["package-layer", "export", packagePath, dest])
  );
  return cli;
}

type ImportParams = {
  source: string;
} & CommonParams;

// Import a package layer from a directory. require package layer is not exit
async function importPackageLayer(params: ImportParams) {
  const oocanaPath = params.bin ?? join(__dirname, "..", "oocana");
  const { source, packagePath } = params;
  const cli = new Cli(
    spawn(oocanaPath, ["package-layer", "import", source, packagePath])
  );
  return cli;
}

type CreateParams = {
  bindPaths?: BindPath[];
  bindPathFile?: string;
  envFile?: string;
  envs?: Record<string, string>;
} & CommonParams;

async function createPackageLayer({
  bin,
  packagePath,
  bindPaths,
  bindPathFile,
  envFile,
  envs,
}: CreateParams) {
  const oocanaPath = bin ?? join(__dirname, "..", "oocana");

  const args = ["package-layer", "create", packagePath];
  for (const bind of bindPaths ?? []) {
    let path = `src=${bind.src},dst=${bind.dst}`;
    if (bind.mode) {
      path += `,${bind.mode}`;
    }
    if (bind.recursive !== undefined) {
      path += `,${bind.recursive ? "recursive" : "nonrecursive"}`;
    }
    args.push("--bind-paths", path);
  }

  if (bindPathFile) {
    args.push("--bind-path-file", bindPathFile);
  }

  if (envs) {
    for (const [key, value] of Object.entries(envs)) {
      args.push("--retain-env-keys", key);
    }
  }

  // need pass all envs to child process
  const runEnvs = generateSpawnEnvs(envs, undefined);

  if (envFile) {
    args.push("--env-file", envFile);
  }

  const cli = new Cli(
    spawn(oocanaPath, args, {
      env: runEnvs,
    })
  );
  return cli;
}

type CheckPackageLayerParams = {
  packageName?: string;
  version?: string;
} & CommonParams;

async function checkPackageLayer({
  bin,
  packagePath,
  packageName,
  version,
}: CheckPackageLayerParams) {
  const oocanaPath = bin ?? join(__dirname, "..", "oocana");
  const args = ["package-layer", "get", packagePath];

  if (packageName) {
    args.push("--package-name", packageName);
  }

  if (version) {
    args.push("--version", version);
  }

  const cli = new Cli(spawn(oocanaPath, args));

  return cli.runAndParse<boolean>(stdout => {
    const status = stdout.trim().split("\n").pop();
    if (status === "Exist") return true;
    if (status === "NotInStore") return false;
    return null;
  });
}

async function deletePackageLayer({ bin, packagePath }: CommonParams) {
  const cli = new Cli(
    spawn(bin ?? join(__dirname, "..", "oocana"), [
      "package-layer",
      "delete",
      packagePath,
    ])
  );

  return cli;
}

type Params = {
  bin?: string;
};

async function deleteAllPackageData(params?: Params) {
  const bin = params?.bin;
  const oocana = bin ?? join(__dirname, "..", "oocana");
  const cli = new Cli(spawn(oocana, ["package-layer", "delete-all"]));
  return cli;
}

type ScanParams = {
  bin?: string;
  searchPaths: string[];
};

async function scanPackages(
  params: ScanParams
): Promise<{ [key: string]: "NotInStore" | "Exist" }> {
  const bin = params.bin ?? join(__dirname, "..", "oocana");

  const paths: string[] = [];
  for (const path of params.searchPaths) {
    paths.push("--search-paths", path);
  }

  const tmp_file = join(tmpdir(), randomUUID() + ".json");
  paths.push("--output", tmp_file);

  const cli = new Cli(spawn(bin, ["package-layer", "scan", ...paths]));
  const { exitCode, stderr } = await cli.waitWithStderr();

  if (exitCode !== 0) {
    throw new Error(stderr);
  }

  const fileContent = readFileSync(tmp_file, { encoding: "utf-8" });
  try {
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Failed to parse JSON:", error);
    return {};
  }
}

export {
  exportPackageLayer,
  importPackageLayer,
  createPackageLayer,
  checkPackageLayer,
  deletePackageLayer,
  deleteAllPackageData,
  scanPackages,
  isPackageLayerEnable,
};
