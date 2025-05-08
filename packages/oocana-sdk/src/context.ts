import {
  BlockInfo,
  BlockJobStackLevel,
  Context,
  HandlesDef,
  OOMOL_LLM_ENV,
  HostInfo,
  PreviewPayload,
  BinaryValue,
  StoreKeyRef,
  VarValue,
} from "@oomol/oocana-types";
import { Mainframe } from "./mainframe";
import { isBinHandle, isValHandle, outputRefKey } from "./utils";
import throttle from "lodash.throttle";
import { writeFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path, { dirname } from "node:path";

interface ThrottleFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>;
  flush(): ReturnType<T>;
}

export class ContextImpl implements Context {
  readonly sessionId: string;
  readonly jobId: string;
  readonly block_path?: string;
  readonly stacks: readonly BlockJobStackLevel[];
  #variableStore: { [index: string]: any };
  static readonly keepAlive = Symbol("keepAlive");
  keepAlive = ContextImpl.keepAlive;
  private isDone = false;
  private mainframe: Mainframe;
  private outputsDef: HandlesDef;
  private storeKey: string;
  public readonly sessionDir: string;
  public readonly inputs: Record<string, any>;
  public readonly OOMOL_LLM_ENV: OOMOL_LLM_ENV;
  public readonly hostInfo: HostInfo;
  public readonly tmpDir: string;
  public readonly packageName: string;
  public readonly pkgDir: string;

  public node_id: string;

  constructor({
    blockInfo,
    mainframe,
    inputs,
    outputsDef,
    store = {},
    storeKey,
    sessionDir,
    tmpDir,
    packageName,
    pkgDir,
  }: {
    blockInfo: BlockInfo;
    mainframe: Mainframe;
    readonly inputs: Record<string, any>;
    outputsDef: HandlesDef;
    store: { [index: string]: any };
    storeKey: string;
    sessionDir: string;
    tmpDir: string;
    packageName: string;
    pkgDir: string;
  }) {
    const { session_id, job_id, block_path, stacks } = blockInfo;
    this.mainframe = mainframe;
    this.outputsDef = outputsDef;
    this.storeKey = storeKey;
    this.sessionId = session_id;
    this.jobId = job_id;
    this.block_path = block_path;
    this.stacks = stacks;
    this.inputs = inputs;
    this.node_id = stacks[stacks.length - 1]?.node_id;
    this.#variableStore = store;
    this.sessionDir = sessionDir;
    this.tmpDir = tmpDir;
    this.packageName = packageName;
    this.tmpPkgDir = path.join(this.tmpDir, this.packageName);
    this.pkgDir = pkgDir;

    this.OOMOL_LLM_ENV = Object.freeze({
      baseUrl: process.env.OOMOL_LLM_BASE_URL || "",
      baseUrlV1: process.env.OOMOL_LLM_BASE_URL_V1 || "",
      apiKey: process.env.OOMOL_LLM_API_KEY || "",
      models: process.env.OOMOL_LLM_MODELS
        ? process.env.OOMOL_LLM_MODELS.split(",")
        : [],
    });

    this.hostInfo = Object.freeze({
      gpuVendor: process.env.OOMOL_HOST_GPU_VENDOR || "unknown",
      gpuRenderer: process.env.OOMOL_HOST_GPU_RENDERER || "unknown",
    });
  }
  tmpPkgDir: string;

  private createObjectRef = (handle: string): StoreKeyRef => {
    return {
      executor: this.storeKey,
      session_id: this.sessionId,
      job_id: this.jobId,
      handle,
    };
  };

  private isBasicType = (value: any): boolean => {
    return (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    );
  };

  autoDone = async () => {
    if (this.isDone) {
      return;
    }
    await this.done();
  };

  done = async (err?: any) => {
    if (this.isDone) {
      this.warning("done has been called multiple times, will be ignored.");
      return;
    }

    this.isDone = true;

    const error =
      err instanceof Error ? `${err.message}\n${err.stack}` : `${err}`;

    this.reportProgress.flush();

    await this.mainframe.sendFinish({
      type: "BlockFinished",
      session_id: this.sessionId,
      job_id: this.jobId,
      error: err ? error : undefined,
    });
  };

  logJSON = async (jsonValue: unknown) => {
    await this.mainframe.sendReport({
      type: "BlockLogJSON",
      session_id: this.sessionId,
      job_id: this.jobId,
      block_path: this.block_path,
      stacks: this.stacks,
      json: jsonValue,
    });
  };

  error = async (err: unknown) => {
    const error =
      err instanceof Error ? `${err.message}\n${err.stack}` : `${err}`;
    await this.mainframe.sendError({
      type: "BlockError",
      session_id: this.sessionId,
      job_id: this.jobId,
      error: error,
    });
  };

  warning = async (msg: string) => {
    await this.mainframe.sendWarning({
      type: "BlockWarning",
      session_id: this.sessionId,
      job_id: this.jobId,
      warning: msg,
      stacks: this.stacks,
      block_path: this.block_path,
    });
  };

  sendMessage = async (payload: unknown) => {
    await this.mainframe.sendReport({
      type: "BlockMessage",
      session_id: this.sessionId,
      job_id: this.jobId,
      block_path: this.block_path,
      stacks: this.stacks,
      payload,
    });
  };

  preview = async (payload: PreviewPayload) => {
    if (payload) {
      if (payload.type === "table") {
        if (Array.isArray(payload.data.rows) && payload.data.rows.length > 10) {
          payload.data.rows.splice(
            5,
            payload.data.rows.length - 10,
            [...payload.data.columns].fill("...")
          );
        }
      }
    }
    await this.mainframe.sendReport({
      type: "BlockPreview",
      session_id: this.sessionId,
      job_id: this.jobId,
      block_path: this.block_path,
      stacks: this.stacks,
      payload,
    });
  };

  reportLog = async (
    payload: string,
    stdio: "stdout" | "stderr" = "stdout"
  ) => {
    await this.mainframe.sendReport({
      type: "BlockLog",
      session_id: this.sessionId,
      job_id: this.jobId,
      block_path: this.block_path,
      stacks: this.stacks,
      log: String(payload),
      stdio,
    });
  };

  reportProgress: ThrottleFunction<(progress: number) => Promise<void>> =
    throttle((progress: any) => {
      progress = Number(progress) || 0;
      return this.mainframe.sendReport({
        type: "BlockProgress",
        session_id: this.sessionId,
        job_id: this.jobId,
        block_path: this.block_path,
        stacks: this.stacks,
        rate: progress,
      });
    }, 300);

  output = async <THandle extends string>(
    handle: THandle,
    output: any,
    done = false
  ) => {
    const outputsDef = this.outputsDef;
    let value = output;
    if (isValHandle(outputsDef, handle) && !this.isBasicType(output)) {
      const objectRef = this.createObjectRef(handle);
      const ref = outputRefKey(objectRef);
      this.#variableStore[ref] = value;
      value = {
        __OOMOL_TYPE__: "oomol/var",
        value: objectRef,
      } as VarValue;
    } else if (isBinHandle(outputsDef, handle)) {
      if (!(output instanceof Buffer)) {
        await this.error(
          `Bin value not Buffer: ${output}, path: ${outputsDef[handle]}`
        );
        return;
      }

      const filePath = `${this.sessionDir}/binary/${this.sessionId}/${this.jobId}/${handle}`;
      try {
        mkdirSync(dirname(filePath), { recursive: true });
        await writeFile(filePath, output);
        value = {
          value: filePath,
          __OOMOL_TYPE__: "oomol/bin",
        } as BinaryValue;
      } catch (error) {
        await this.error(
          `write bin to file error: ${error}, path: ${outputsDef[handle]}`
        );
        return;
      }
    }

    if (outputsDef[handle] === undefined) {
      await this.warning(
        `Output handle key: [${handle}] is not defined in Block outputs schema.`
      );

      if (done) {
        this.done();
      }

      return;
    }

    await this.mainframe.sendOutput({
      type: "BlockOutput",
      session_id: this.sessionId,
      job_id: this.jobId,
      handle,
      output: value,
      done,
    });

    this.reportProgress.flush();

    if (done) {
      this.done();
    }
  };
}
