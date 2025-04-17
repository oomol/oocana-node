import { spawn } from "node:child_process";
import { join } from "node:path";
import { Cli } from "./cli";

const bindPathPattern =
  /^src=([^,]+),dst=([^,]+)(?:,(?:ro|rw))?(?:,(?:nonrecursive|recursive))?$/;

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
    .then(code => code == 0)
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
  bind_paths?: string[];
  bindPathFile?: string;
  envFile?: string;
  envs?: Record<string, string>;
} & CommonParams;

async function createPackageLayer({
  bin,
  packagePath,
  bind_paths,
  bindPathFile,
  envFile,
  envs,
}: CreateParams) {
  const oocanaPath = bin ?? join(__dirname, "..", "oocana");

  const args = ["package-layer", "create", packagePath];
  for (const path of bind_paths ?? []) {
    if (!bindPathPattern.test(path)) {
      `Invalid bind path format: ${path}. Expected format: src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive]`;
    }

    args.push("--bind-paths", path);
  }

  if (bindPathFile) {
    args.push("--bind-path-file", bindPathFile);
  }

  let spawnedEnvs = envs ?? {};
  if (envs) {
    for (const [key, value] of Object.entries(envs)) {
      args.push("--retain-env-keys", key, value);
    }
  }

  for (const key of Object.keys(process.env)) {
    if (key.startsWith("OOCANA_") && !!process.env[key]) {
      spawnedEnvs[key] = process.env[key];
    }
  }

  for (const key of Object.keys(process.env)) {
    if (key.startsWith("OOCANA_") && !!process.env[key]) {
      spawnedEnvs[key] = process.env[key];
    }
  }

  if (envFile) {
    args.push("--env-file", envFile);
  }

  const cli = new Cli(
    spawn(oocanaPath, args, {
      env: spawnedEnvs,
    })
  );
  return cli;
}

async function checkPackageLayer({ bin, packagePath }: CommonParams) {
  const oocanaPath = bin ?? join(__dirname, "..", "oocana");
  const cli = new Cli(spawn(oocanaPath, ["package-layer", "get", packagePath]));

  return new Promise<boolean>((resolve, reject) => {
    let resolved = false;
    cli.addLogListener("stdout", (data: string) => {
      const status = data.trim().split("\n").pop();
      if (status === "Exist") {
        resolved = true;
        resolve(true);
      } else if (status === "NotInStore") {
        resolved = true;
        resolve(false);
      }
    });

    let err = "";
    cli.addLogListener("stderr", (data: string) => {
      err += data;
    });
    cli.wait().then(() => {
      if (!resolved) {
        reject("Failed to get layer status " + err);
      }
    });
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
  const map = {};
  const bin = params.bin ?? join(__dirname, "..", "oocana");

  const paths: string[] = [];
  for (const path of params.searchPaths) {
    paths.push("--search-paths", path);
  }

  return new Promise<{}>((resolve, reject) => {
    const cli = new Cli(spawn(bin, ["package-layer", "scan", ...paths]));
    cli.addLogListener("stdout", (data: string) => {
      const output = data.trim().split("\n").pop();
      if (output?.startsWith("{") && output.endsWith("}")) {
        Object.assign(map, JSON.parse(output));
      }
    });

    let err = "";
    cli.addLogListener("stderr", (data: string) => {
      err += data;
    });
    cli.wait().then(code => {
      if (code == 0) {
        resolve(map);
      } else {
        reject(err);
      }
    });
  });
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
