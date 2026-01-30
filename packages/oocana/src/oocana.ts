import { spawn } from "node:child_process";
import { join } from "node:path";
import { Remitter } from "remitter";
import type { OocanaEventConfig } from "@oomol/oocana-types";
import { Reporter } from "./reporter";
import type { IDisposable } from "@wopjs/disposable";
import { disposableStore } from "@wopjs/disposable";
import { Cli } from "./cli";
import { generateSpawnEnvs, SpawnedEnvs } from "./env";

export type JobEvent = Remitter<OocanaEventConfig>;

/** JSON-compatible value type for inputs and payloads */
export type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

interface RunConfig {
  /** optional session id, if not give, oocana will generate one */
  sessionId?: string;

  /** Debug mode. If enable, when oocana spawn executor it will give some debugging message to every executor to make they support debugging. Only support in python-executor and nodejs-executor now */
  debug?: boolean;

  /** A directory that can be used for persistent data storage. Flows and blocks that are not part of a package will use this directory */
  projectData: string;
  /** a directory that can be used for persistent package data, all package's data will store in this directory. it can persist across sessions */
  pkgDataRoot: string;

  /** exclude packages, these package will not use ovm layer feature if the feature is enabled */
  excludePackages?: string[];
  /** a path for session storage. this path will shared by all block by context.sessionDir or context.session_dir */
  sessionPath?: string;
  tempRoot?: string;
  /** bind paths, format  src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive], oocana will mount source to target in layer. if target not exist, oocana will create it. */
  bindPaths?: string[];
  /** a file path contains multiple bind paths, better use absolute path. The file format is src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive] line by line, if not provided, it will be found in OOCANA_BIND_PATH_FILE env variable */
  bindPathFile?: string;
  /** when spawn executor, oocana will only retain envs start with OOMOL_ by design. Other env variables need to be explicitly added in this parameters otherwise they will be ignored. */
  envs?: Record<string, string>;
  /** .env file path, better use absolute path, format should be <key>=<value> line by line. These variables will pass to executor
   * when oocana spawn. If not given oocana will search OOCANA_BIND_PATH_FILE to see if it has one.
   * */
  envFile?: string;
}

interface EnvConfig {
  /** default is process.env */
  spawnedEnvs?: SpawnedEnvs;
  /** Environment variables passed to all executors. All variable names will be converted to uppercase;
   * then if the variable name does not start with OOMOL_, the OOMOL_ prefix will be added automatically.
   */
  oomolEnvs?: Record<string, string>;
  /** when spawn executor, oocana will only retain envs start with OOMOL_ by design. Other env variables need to be explicitly added in this parameters otherwise they will be ignored. */
  envs?: Record<string, string>;
  /** .env file path, better use absolute path, format should be <key>=<value> line by line. These variables will pass to executor
   * when oocana spawn. If not given oocana will search OOCANA_BIND_PATH_FILE to see if it has one.
   * */
  envFile?: string;
}

export interface BlockConfig {
  /** block.yaml file path or directory path */
  blockPath: string;
  inputs?: {
    [handleId: string]: JSONValue;
  };
  /** search package blocks's path */
  searchPaths?: string[];
}

export interface FlowConfig {
  /** flow.yaml file path or directory path */
  flowPath: string;
  /** comma separated paths for search block package */
  searchPaths?: string;

  /** address for mqtt */
  address?: string;
  /** will use previous run's last input value, but only json value can be reused */
  useCache?: boolean;

  /** only run these nodes */
  nodes?: string[];
  /** @deprecated use nodesInputs instead */
  inputValues?: {
    [nodeId: string]: {
      [inputHandle: string]: JSONValue;
    };
  };
  nodesInputs?: {
    [nodeId: string]: {
      [inputHandle: string]: JSONValue;
    };
  };
  /** @deprecated use nodes parameter instead */
  toNode?: string;
}

export const DEFAULT_PORT = 47688;
export type RunFlowConfig = FlowConfig & RunConfig & EnvConfig;
export type RunBlockConfig = BlockConfig & RunConfig & EnvConfig;

export interface OocanaInterface {
  connect(address: string): Promise<this>;
  runFlow(config: RunFlowConfig): Promise<Cli>;
  runBlock(config: RunBlockConfig): Promise<Cli>;
  stop(sessionId: string): Promise<void>;
}

function buildArgs({
  sessionId,
  debug,
  projectData,
  pkgDataRoot,
  excludePackages,
  sessionPath,
  tempRoot,
  bindPaths,
  bindPathFile,
  envs,
  envFile,
}: RunConfig): string[] {
  const args: string[] = [];
  if (sessionId) {
    args.push("--session", sessionId);
  }
  if (debug) {
    args.push("--debug");
  }
  if (projectData) {
    args.push("--project-data", projectData);
  }
  if (pkgDataRoot) {
    args.push("--pkg-data-root", pkgDataRoot);
  }
  if (excludePackages) {
    args.push("--exclude-packages", excludePackages.join(","));
  }
  if (sessionPath) {
    args.push("--session-dir", sessionPath);
  }
  if (tempRoot) {
    args.push("--temp-root", tempRoot);
  }

  if (bindPaths) {
    const pathPattern =
      /^src=([^,]+),dst=([^,]+)(?:,(?:ro|rw))?(?:,(?:nonrecursive|recursive))?$/;

    for (const path of bindPaths) {
      if (!pathPattern.test(path)) {
        throw new Error(
          `Invalid bind path format: ${path}. Expected format: src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive]`
        );
      }
      args.push("--bind-paths", path);
    }
  }

  if (bindPathFile) {
    args.push("--bind-path-file", bindPathFile);
  }

  if (envFile) {
    args.push("--env-file", envFile);
  }

  if (envs) {
    for (const [key, _] of Object.entries(envs)) {
      args.push("--retain-env-keys", key);
    }
  }

  return args;
}

export class Oocana implements IDisposable, OocanaInterface {
  public readonly dispose = disposableStore();

  public readonly events: JobEvent;

  #bin: string;
  #address?: string;

  #sessionTask: Record<string, Cli> = {};
  #randTasks: Cli[] = [];

  public constructor(oocanaPath?: string) {
    this.events = new Remitter();
    this.#bin = oocanaPath || join(__dirname, "..", "oocana");
  }

  public async connect(address = `127.0.0.1:${DEFAULT_PORT}`): Promise<this> {
    this.#address = address;

    const reporter = await Reporter.connect(address);
    this.events.remitAny(() =>
      reporter.onMessage(this.events.emit.bind(this.events))
    );

    this.dispose.add(() => reporter.disconnect());

    return this;
  }

  public async runBlock(
    blockConfig: BlockConfig & RunConfig & EnvConfig
  ): Promise<Cli> {
    if (!this.#address) {
      throw new Error("Cannot run flow without connecting to a broker");
    }

    const sessionId = blockConfig.sessionId;
    const { blockPath, inputs, searchPaths } = blockConfig as BlockConfig;
    const { envs, oomolEnvs, spawnedEnvs } = blockConfig as EnvConfig;

    const args = ["run", blockPath, "--reporter", "--broker", this.#address];
    const baseArgs = buildArgs(blockConfig);

    args.push(...baseArgs);

    if (inputs) {
      args.push("--inputs", JSON.stringify(inputs));
    }

    const executorEnvs = generateSpawnEnvs(envs, oomolEnvs, spawnedEnvs);

    if (envs) {
      for (const [key, _] of Object.entries(envs)) {
        args.push("--retain-env-keys", key);
      }
    }

    if (searchPaths) {
      args.push("--search-paths", searchPaths.join(","));
    }

    const spawnedProcess = spawn(this.#bin, args, {
      env: executorEnvs,
    });
    const flowTask = new Cli(spawnedProcess);
    if (sessionId) {
      this.#sessionTask[sessionId] = flowTask;
      flowTask.wait().then(() => {
        delete this.#sessionTask[sessionId];
      });
    } else {
      this.#randTasks.push(flowTask);
      flowTask.wait().then(() => {
        this.#randTasks = this.#randTasks.filter(task => task !== flowTask);
      });
    }

    const sendOocanaLog = (
      data: string,
      stdio: "stdout" | "stderr" = "stdout"
    ): void => {
      this.events.emit("OocanaLog", {
        type: "OocanaLog",
        data: String(data),
        session_id: sessionId,
        path: blockPath,
        stdio,
      });
    };

    const logStdout = (data: string): void => sendOocanaLog(data, "stdout");
    const logStdErr = (error: string): void => sendOocanaLog(error, "stderr");
    flowTask.addLogListener("stdout", logStdout);
    flowTask.addLogListener("stderr", logStdErr);

    this.dispose.add(flowTask);

    return flowTask;
  }

  public async runFlow(
    flowConfig: FlowConfig & RunConfig & EnvConfig
  ): Promise<Cli> {
    if (!this.#address) {
      throw new Error("Cannot run flow without connecting to a broker");
    }

    let nodes = flowConfig.nodes;
    const sessionId = flowConfig.sessionId;
    const {
      flowPath,
      searchPaths,
      toNode,
      nodesInputs,
      inputValues,
      useCache,
    } = flowConfig as FlowConfig;
    const { envs, oomolEnvs, spawnedEnvs } = flowConfig as EnvConfig;

    const args = ["run", flowPath, "--reporter", "--broker", this.#address];
    const baseArgs = buildArgs(flowConfig);
    args.push(...baseArgs);

    if (searchPaths) {
      args.push("--search-paths", searchPaths);
    }

    if (toNode) {
      nodes = [...(nodes || []), toNode];
    }

    if (nodes) {
      args.push("--nodes", nodes.join(","));
    }

    if (nodesInputs) {
      args.push("--nodes-inputs", JSON.stringify(nodesInputs));
    } else if (inputValues) {
      args.push("--nodes-inputs", JSON.stringify(inputValues));
    }

    if (useCache) {
      args.push("--use-cache");
    }

    const executorEnvs = generateSpawnEnvs(envs, oomolEnvs, spawnedEnvs);

    if (envs) {
      for (const [key, _] of Object.entries(envs)) {
        args.push("--retain-env-keys", key);
      }
    }

    const spawnedProcess = spawn(this.#bin, args, {
      env: executorEnvs,
    });
    const flowTask = new Cli(spawnedProcess);
    if (sessionId) {
      this.#sessionTask[sessionId] = flowTask;
      flowTask.wait().then(() => {
        delete this.#sessionTask[sessionId];
      });
    } else {
      this.#randTasks.push(flowTask);
      flowTask.wait().then(() => {
        this.#randTasks = this.#randTasks.filter(task => task !== flowTask);
      });
    }

    const sendOocanaLog = (
      data: string,
      stdio: "stdout" | "stderr" = "stdout"
    ): void => {
      this.events.emit("OocanaLog", {
        type: "OocanaLog",
        data: String(data),
        session_id: sessionId,
        path: flowPath,
        stdio,
      });
    };

    const logStdout = (data: string): void => sendOocanaLog(data, "stdout");
    const logStdErr = (error: string): void => sendOocanaLog(error, "stderr");
    flowTask.addLogListener("stdout", logStdout);
    flowTask.addLogListener("stderr", logStdErr);

    this.dispose.add(flowTask);

    return flowTask;
  }

  /** Stops the active flow task associated with the given session ID or all tasks if no ID is provided. */
  public async stop(sessionId?: string): Promise<void> {
    if (sessionId) {
      const task = this.#sessionTask[sessionId];
      if (task) {
        task.kill();
      }
    } else {
      for (const sessionId of Object.keys(this.#sessionTask)) {
        const task = this.#sessionTask[sessionId];
        task.kill();
      }
      for (const task of this.#randTasks) {
        task.kill();
      }
      this.#randTasks = [];
    }
  }
}
