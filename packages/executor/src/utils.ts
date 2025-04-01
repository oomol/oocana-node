import { ContextImpl } from "@oomol/oocana-sdk";
import minimist from "minimist";
import { stat, realpath, unlink } from "node:fs/promises";
import path from "node:path";
import { logger } from "./logger";
import { importFile } from "@hyrious/esbuild-dev";
import type { ServiceExecutePayload } from "@oomol/oocana-types";
import { pathToFileURL } from "node:url";

export interface ExecutorArgs {
  readonly sessionId: string;
  readonly sessionDir: string;
  readonly tmpDir: string;
  readonly address?: string;
  readonly package?: string;
  readonly identifier?: string;
  readonly inspectWait?: number;
}

export const ExecutorName = "nodejs";

export function getExecutorArgs(): ExecutorArgs {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      sessionId: "session-id",
      sessionDir: "session-dir",
      tmpDir: "tmp-dir",
      inspectWait: "inspect-wait",
    },
  });

  console.log("argv: ", argv);

  const keys = ["sessionId", "sessionDir", "tmpDir"];
  for (const key of keys) {
    if (argv[key] == null) {
      throw new Error(`Missing required argument ${key}`);
    }
    argv[key] = String(argv[key]);
  }

  return argv as unknown as ExecutorArgs;
}

interface ServiceArgs {
  readonly address: string;
  readonly sessionId?: string;
  readonly serviceHash: string;
  readonly sessionDir: string;
}

export function getServiceArgs(): ServiceArgs {
  const argv = minimist(process.argv.slice(2), {
    alias: {
      sessionId: "session-id",
      serviceHash: "service-hash",
      sessionDir: "session-dir",
    },
  });

  const keys = ["address", "serviceHash", "sessionDir"];
  for (const key of keys) {
    if (argv[key] == null) {
      throw new Error(`Missing required argument ${key}`);
    }
    argv[key] = String(argv[key]);
  }

  return argv as unknown as ServiceArgs;
}

export async function outputWithReturnObject(
  context: ContextImpl,
  result: unknown
) {
  if (result === undefined) {
    context.autoDone();
    return;
  }

  // done 的权限移交给用户，让用户自主决定 done 的时机。
  if (result === context.keepAlive) {
    return;
  }

  // 不是 object 而是 string 之类的，也是可以遍历的。
  if (typeof result !== "object") {
    context.done(new Error("return value must be an object"));
    return;
  }

  // 用户如果输出了错误的 key，也一样发出去，通过 context.output 里面的逻辑输出日志。
  // TODO: 如果 output_defs 有 key 没有发出去过，最好也有一个 warning。
  await Promise.all(
    Object.keys(result || {}).map(key =>
      context.output(key, (result as any)[key])
    )
  );

  context.done();
}

const caches = new Set<string>();
let esmHash = 0;

export function clearCache() {
  const beforeLength = Object.keys(require.cache).length;
  for (const key of caches) {
    delete require.cache[key];
  }
  const afterLength = Object.keys(require.cache).length;

  if (beforeLength === afterLength) {
    logger.warn(
      `clear cache: failed, before ${beforeLength}, after ${afterLength}`
    );
  } else {
    logger.info(`clear cache: before ${beforeLength}, after ${afterLength}`);
  }
  caches.clear();
}

export function updateImportSuffix() {
  esmHash++;
}

export async function cleanupTmpFile() {
  let ignoreFiles = new Set<string>();
  for (const tmpFile of debugTmpFile) {
    try {
      await unlink(tmpFile);
    } catch (error) {
      if ((error as any).code == "ENOENT") {
        ignoreFiles.add(tmpFile);
        continue;
      }
      logger.error(`cleanup tmp file ${tmpFile} failed`, error);
    }
  }

  logger.info(
    `cleanup tmp file: ${debugTmpFile.size} files, ${ignoreFiles.size} ignored`
  );

  debugTmpFile.clear();
}

const debugTmpFile = new Set<string>();
export const isDebug = () => {
  const env = process.env.NODE_ENV;
  let isDebug = env === "development" || env === "dev";
  if (isDebug) {
    return isDebug;
  }

  const args = process.argv.slice(2);
  if (args.includes("--enable-source-maps")) {
    isDebug = true;
  }
  logger.debug(`isDebug: ${isDebug}`);
  return isDebug;
};

export async function getModule(file: string): Promise<any> {
  const realModulePath = await realpath(file);
  logger.debug(`real module path: ${realModulePath}`);

  if (realModulePath.endsWith(".ts")) {
    const importOptions = {
      cwd: path.dirname(realModulePath),
      shims: true,
    };

    const fileWithHash = `${realModulePath}?t=${esmHash}`;

    if (isDebug()) {
      // It's the developer's duty to make sure ts files don't mix with js files of the same name
      const jsFile = realModulePath.replace(/\.ts$/, ".js");
      const tsMapFile = jsFile + ".map";
      debugTmpFile.add(jsFile);
      debugTmpFile.add(tsMapFile);

      return importFile(
        fileWithHash,
        { outfile: jsFile },
        undefined,
        importOptions
      );
    }

    return importFile(fileWithHash, undefined, undefined, importOptions);
  }
  return import(pathToFileURL(realModulePath).href);
}

export function findFunction(m: any, name: string | undefined): any {
  if (name && typeof m[name] === "function") {
    return m[name];
  } else if (typeof m.default === "function") {
    return m.default;
  } else if (typeof m.main === "function") {
    return m.main;
  }

  if (name && m[name]) {
    throw new Error(`${name} is not a function but typeof ${typeof m[name]}`);
  } else if (m.default) {
    throw new Error(`default is not a function but typeof ${typeof m.default}`);
  } else if (m.main) {
    throw new Error(`main is not a function but typeof ${typeof m.main}`);
  } else {
    throw new Error(
      "Unable to find any callable function in the default or main field. Maybe you should check the entry file is correct"
    );
  }
}

export async function getEntryPath(entry: string, cwd: string = process.cwd()) {
  if (entry === "") {
    throw new Error("source file path cannot be empty");
  }

  let filePath = entry;

  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(cwd, filePath);
  }

  const fileStat = await stat(filePath);
  if (fileStat.isFile()) {
    return filePath;
  } else if (fileStat.isDirectory()) {
    throw new Error(`entry path ${filePath} is a directory`);
  } else {
    throw new Error(`entry path ${filePath} not found`);
  }
}

export function isServicePayload(
  payload: any
): payload is ServiceExecutePayload {
  return (
    payload &&
    typeof payload === "object" &&
    typeof payload.service_executor === "object" &&
    typeof payload.service_executor.name === "string" &&
    typeof payload.service_executor.entry === "string" &&
    typeof payload.service_executor.function === "string"
  );
}
