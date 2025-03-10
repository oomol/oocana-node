import { spawn } from "node:child_process";
import { join } from "node:path";
import { Remitter } from "remitter";
import type { OocanaEventConfig } from "@oomol/oocana-types";
import { Reporter } from "./reporter";
import type { IDisposable } from "@wopjs/disposable";
import { disposableStore } from "@wopjs/disposable";
import { Cli } from "./cli";
import { sshSpawn } from "./ssh";

export type JobEvent = Remitter<OocanaEventConfig>;

export interface RunFlowConfig {
  /** flow.yaml file path or directory path */
  flowPath: string;
  /** comma separated paths for search block package */
  blockSearchPaths?: string;
  /** optional session id */
  sessionId?: string;
  /** address for mqtt */
  address?: string;
  /** will use previous run's last input value, but only json value can be reused */
  useCache?: boolean;
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
  /** format <source>:<target>, oocana will mount source to target in layer. if target not exist, oocana will create it. */
  sessionPath?: string;
  /** format <source>:<target>, oocana will mount source to target in layer. if pass invalid string, will throw error. if target path not exist, oocana will ignore this bind path. */
  extraBindPaths?: string[];
  /** TODO: 只在 linux 下进行过较为简单的手动测试。 */
  remote?: boolean;
  /** Environment variables passed to all executors. All variable names will be converted to uppercase; then if the variable name does not start with OOMOL_, the OOMOL_ prefix will be added automatically. */
  oomolEnvs?: Record<string, string>;
  envs?: Record<string, string>;
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
    blockSearchPaths,
    sessionId,
    nodes,
    toNode,
    useCache,
    inputValues,
    excludePackages,
    sessionPath,
    extraBindPaths,
    remote,
    oomolEnvs,
    envs,
  }: RunFlowConfig): Promise<Cli> {
    if (!this.#address) {
      throw new Error("Cannot run flow without connecting to a broker");
    }

    const args = ["run", flowPath, "--reporter", "--broker", this.#address];

    if (blockSearchPaths) {
      args.push("--block-search-paths", blockSearchPaths);
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

    if (extraBindPaths) {
      for (const path of extraBindPaths) {
        if (!path.includes(":")) {
          throw new Error(`Invalid extra bind path: ${path}`);
        }
        args.push("--extra-bind-paths", path);
      }
    }

    let executorEnvs: Record<string, string> = {
      PATH: process.env.PATH || "",
    };

    // CI env 会影响 oocana 是否使用 sudo。如果有 CI 环境变量，需要传递给 oocana。
    if (process.env.CI) {
      executorEnvs.CI = process.env.CI;
    }

    if (oomolEnvs) {
      for (const [key, value] of Object.entries(oomolEnvs)) {
        let envKey = key.toUpperCase();
        if (!envKey.startsWith("OOMOL_")) {
          envKey = `OOMOL_${envKey}`;
        }
        executorEnvs[envKey] = value;
      }
    }
    if (envs) {
      for (const [key, value] of Object.entries(envs)) {
        executorEnvs[key] = value;
        args.push("--retain-env-keys", key);
      }
    }

    const spawnedProcess = remote
      ? sshSpawn(this.#bin, args, {
          env: executorEnvs,
          stdio: "pipe",
        })
      : spawn(this.#bin, args, {
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
