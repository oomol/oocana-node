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

export interface RunFlowConfig {
  /** flow.yaml file path or directory path */
  flowPath: string;
  /** comma separated paths for search block package */
  searchPaths?: string;
  /** optional session id */
  sessionId?: string;
  /** address for mqtt */
  address?: string;
  /** will use previous run's last input value, but only json value can be reused */
  useCache?: boolean;
  /** Debug mode. If enable, when oocana spawn executor it will give some debugging message to every executor to make they support debugging. Only support in python-executor and nodejs-executor now */
  debug?: boolean;
  /** only run these nodes */
  nodes?: string[];
  /** fake data override last value save */
  inputValues?: {
    [nodeId: string]: {
      [inputHandle: string]: any[];
    };
  };
  /** @deprecated use nodes parameter instead */
  toNode?: string;
  /** exclude packages, these package will not use ovm layer feature if the feature is enabled */
  excludePackages?: string[];
  /** a path for session storage. this path will shared by all block by context.sessionDir or context.session_dir */
  sessionPath?: string;
  /** a temporary root directory for session storage. oocana will create a subdirectory for each flowPath (one flow path always has the same subdirectory name). oocana will clean this subdirectory after flow session finish success but retain if the session is not successful. every block can get this subdirectory from context.tmpDir or context.tmp_dir. */
  tempRoot?: string;
  /** bind paths, format  src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive], oocana will mount source to target in layer. if target not exist, oocana will create it. */
  bindPaths?: string[];
  /** a file path contains multiple bind paths, better use absolute path. The file format is src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive] line by line, if not provided, it will be found in OOCANA_BIND_PATH_FILE env variable */
  bindPathFile?: string;
  /** default is process.env */
  spawnedEnvs?: SpawnedEnvs;
  /** Environment variables passed to all executors. All variable names will be converted to uppercase; then if the variable name does not start with OOMOL_, the OOMOL_ prefix will be added automatically. */
  oomolEnvs?: Record<string, string>;
  /** when spawn executor, oocana will only retain envs start with OOMOL_ by design. Other env variables need to be explicitly added in this parameters otherwise they will be ignored. */
  envs?: Record<string, string>;
  /** .env file path, better use absolute path, format should be <key>=<value> line by line. These variables will pass to executor when oocana spawn. If not given oocana will search OOCANA_BIND_PATH_FILE to see if it has one. */
  envFile?: string;
}

export const DEFAULT_PORT = 47688;

export interface OocanaInterface {
  connect(address: string): Promise<this>;
  runFlow(config: RunFlowConfig): Promise<Cli>;
  stop(sessionId: string): Promise<void>;
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

  public async runFlow({
    flowPath,
    searchPaths,
    sessionId,
    nodes,
    toNode,
    useCache,
    debug,
    inputValues,
    excludePackages,
    sessionPath,
    tempRoot,
    bindPaths,
    bindPathFile,
    spawnedEnvs,
    oomolEnvs,
    envFile,
    envs,
  }: RunFlowConfig): Promise<Cli> {
    if (!this.#address) {
      throw new Error("Cannot run flow without connecting to a broker");
    }

    const args = ["run", flowPath, "--reporter", "--broker", this.#address];

    if (searchPaths) {
      args.push("--search-paths", searchPaths);
    }

    if (sessionId) {
      args.push("--session", sessionId);
    }

    if (toNode) {
      nodes = [...(nodes || []), toNode];
    }

    if (nodes) {
      args.push("--nodes", nodes.join(","));
    }

    if (inputValues) {
      args.push("--input-values", JSON.stringify(inputValues));
    }

    if (useCache) {
      args.push("--use-cache");
    }

    if (excludePackages) {
      args.push("--exclude-packages", excludePackages.join(","));
    }

    if (sessionPath) {
      args.push("--session-dir", sessionPath);
    }

    if (debug) {
      args.push("--debug");
    }

    const pathPattern =
      /^src=([^,]+),dst=([^,]+)(?:,(?:ro|rw))?(?:,(?:nonrecursive|recursive))?$/;

    if (bindPaths) {
      for (const path of bindPaths) {
        if (!pathPattern.test(path)) {
          throw new Error(
            `Invalid bind path format: ${path}. Expected format: src=<source>,dst=<destination>,[ro|rw],[nonrecursive|recursive]`
          );
        }
        args.push("--bind-paths", path);
      }
    }

    if (tempRoot) {
      args.push("--temp-root", tempRoot);
    }

    const executorEnvs = generateSpawnEnvs(envs, oomolEnvs, spawnedEnvs);

    if (envs) {
      for (const [key, _] of Object.entries(envs)) {
        args.push("--retain-env-keys", key);
      }
    }

    if (envFile) {
      args.push("--env-file", envFile);
    }

    if (bindPathFile) {
      args.push("--bind-path-file", bindPathFile);
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
