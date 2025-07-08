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
  RunResponse,
  IMainframeClientMessage,
} from "@oomol/oocana-types";
import { event, send } from "@wopjs/event";
import { Mainframe } from "./mainframe";
import { isBinHandle, isValHandle, outputRefKey } from "./utils";
import throttle from "lodash.throttle";
import { writeFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import path, { dirname } from "node:path";
import EventEmitter from "node:events";

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
  readonly flowNodeStore: { [index: string]: any };
  private mainframe: Mainframe;
  public readonly inputsDef: HandlesDef;
  public readonly outputsDef: HandlesDef;
  private storeKey: string;
  public readonly sessionDir: string;
  public readonly inputs: Record<string, any>;
  public readonly OOMOL_LLM_ENV: OOMOL_LLM_ENV;
  public readonly hostInfo: HostInfo;
  public readonly tmpDir: string;
  public readonly tmpPkgDir: string;
  public readonly packageName: string;
  public readonly pkgDir: string;
  public readonly hostEndpoint: string | undefined;
  public node_id: string;

  constructor({
    blockInfo,
    mainframe,
    inputs,
    inputsDef,
    outputsDef,
    store = {},
    storeKey,
    sessionDir,
    tmpDir,
    packageName,
    pkgDir,
    flowNodeStore,
  }: {
    blockInfo: BlockInfo;
    mainframe: Mainframe;
    readonly inputs: Record<string, any>;
    inputsDef: HandlesDef;
    outputsDef: HandlesDef;
    store: { [index: string]: any };
    storeKey: string;
    sessionDir: string;
    tmpDir: string;
    packageName: string;
    pkgDir: string;
    flowNodeStore: { [index: string]: any };
  }) {
    const { session_id, job_id, block_path, stacks } = blockInfo;
    this.mainframe = mainframe;
    this.inputsDef = Object.freeze(inputsDef);
    this.outputsDef = Object.freeze(outputsDef);
    this.storeKey = storeKey;
    this.sessionId = session_id;
    this.jobId = job_id;
    this.block_path = block_path;
    this.stacks = stacks;
    this.inputs = inputs;
    this.node_id = stacks[stacks.length - 1]?.node_id;
    this.flowNodeStore = flowNodeStore;
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

    for (const [key, value] of Object.entries(this.OOMOL_LLM_ENV)) {
      if (value === "" || (Array.isArray(value) && value.length === 0)) {
        this.warning(
          `OOMOL_LLM_ENV variable ${key} is (${value}), this may cause some features not working properly.`
        );
      }
    }

    this.hostInfo = Object.freeze({
      gpuVendor: process.env.OOMOL_HOST_GPU_VENDOR || "unknown",
      gpuRenderer: process.env.OOMOL_HOST_GPU_RENDERER || "unknown",
    });

    this.hostEndpoint = process.env.OO_HOST_ENDPOINT;
  }

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

  finish = async (arg?: { result?: any; error?: unknown }) => {
    const { result, error } = arg || {};

    this.reportProgress.flush();

    if (!!error) {
      const errorMessage =
        error instanceof Error
          ? `${error.message}\n${error.stack}`
          : `${error}`;
      await this.mainframe.sendFinish({
        type: "BlockFinished",
        session_id: this.sessionId,
        job_id: this.jobId,
        error: errorMessage,
      });
    } else if (result) {
      const wrapResult: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(result)) {
        if (!(key in this.outputsDef)) {
          await this.warning(
            `Output handle key: [${key}] is not defined in Block outputs schema.`
          );
          continue;
        }
        try {
          wrapResult[key] = await this.wrapOutputValue(key, value);
        } catch (error) {
          this.error(error);
        }
      }
      await this.mainframe.sendFinish({
        type: "BlockFinished",
        session_id: this.sessionId,
        job_id: this.jobId,
        result: wrapResult,
      });
    } else {
      await this.mainframe.sendFinish({
        type: "BlockFinished",
        session_id: this.sessionId,
        job_id: this.jobId,
      });
    }
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

  runBlock = (blockName: string, inputs: Record<string, any>) => {
    const block_job_id = `${this.jobId}-${blockName}-${Date.now()}`;

    let resolver: (data: {
      result?: Record<string, unknown>;
      error?: string;
    }) => void;
    const events = new EventEmitter();
    const onOutput = event<{ handle: string; value: any }>();
    const blockEvent = (payload: IMainframeClientMessage) => {
      if (payload.type === "ExecutorReady" || payload.type === "RunBlock") {
        return;
      }
      if (payload?.job_id !== block_job_id) {
        return;
      }
      events.emit(payload.type, payload);

      if (payload.type === "BlockOutput") {
        send(onOutput, { handle: payload.handle, value: payload.output });
      } else if (payload.type === "BlockOutputs") {
        for (const [handle, value] of Object.entries(payload.outputs)) {
          send(onOutput, { handle, value });
        }
      } else if (payload.type === "BlockFinished") {
        if (payload.result) {
          for (const [handle, value] of Object.entries(payload.result)) {
            send(onOutput, { handle, value });
          }
        }
        resolver({ result: payload.result, error: payload.error });
      }
    };
    this.mainframe.addSessionCallback(this.sessionId, blockEvent);

    const errorEvent = (payload: any) => {
      if (payload?.job_id !== block_job_id) {
        return;
      }
      resolver({ error: payload.error });
    };
    this.mainframe.addRunBlockCallback(this.sessionId, errorEvent);

    let dispose = () => {
      this.mainframe.removeSessionCallback(this.sessionId, blockEvent);
      this.mainframe.removeRunBlockCallback(this.sessionId, errorEvent);
    };

    const finishP = new Promise<{
      result?: Record<string, unknown>;
      error?: unknown;
    }>(resolve => {
      resolver = resolve;
    });

    const response: RunResponse = {
      events,
      onOutput,
      finish: () => finishP,
    };

    response.finish().then(_data => {
      dispose();
    });

    this.mainframe.sendRun({
      type: "RunBlock",
      session_id: this.sessionId,
      job_id: this.jobId,
      stacks: this.stacks,
      block: blockName,
      block_job_id,
      inputs,
    });

    return response;
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
      // convert table data to CSV
      if (
        payload.type === "table" &&
        typeof payload.data !== "string" &&
        Array.isArray(payload.data?.rows)
      ) {
        const csvRows = payload.data.rows.map(row =>
          row.map(cell => String(cell)).join(",")
        );
        const csvContent = [
          payload.data.columns.map(col => String(col)).join(","),
          ...csvRows,
        ].join("\n");
        const randomStr = crypto.randomUUID();
        const filePath = path.join(this.tmpDir, this.jobId, `${randomStr}.csv`);
        try {
          mkdirSync(dirname(filePath), { recursive: true });
          await writeFile(filePath, csvContent);
          payload.data = filePath;
        } catch (error) {
          throw new Error(
            `write preview csv to file error: ${error}, path: ${filePath}`
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

  private wrapOutputValue = async (handle: string, value: any) => {
    const outputsDef = this.outputsDef;
    if (isValHandle(outputsDef, handle) && !this.isBasicType(value)) {
      const objectRef = this.createObjectRef(handle);
      const ref = outputRefKey(objectRef);
      this.#variableStore[ref] = value;
      return {
        __OOMOL_TYPE__: "oomol/var",
        value: objectRef,
      } as VarValue;
    } else if (isBinHandle(outputsDef, handle)) {
      if (!(value instanceof Buffer)) {
        throw new Error(
          `Binary value is not Buffer: ${value}, input def: ${outputsDef[handle]}`
        );
      }

      const filePath = `${this.sessionDir}/binary/${this.sessionId}/${this.jobId}/${handle}`;
      try {
        mkdirSync(dirname(filePath), { recursive: true });
        await writeFile(filePath, value);
        return {
          value: filePath,
          __OOMOL_TYPE__: "oomol/bin",
        } as BinaryValue;
      } catch (error) {
        throw new Error(`write bin to file error: ${error}, path: ${filePath}`);
      }
    }
    return value;
  };

  outputs = async (map: Partial<Record<string, any>>) => {
    const wrapResult: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(map)) {
      if (!(key in this.outputsDef)) {
        await this.warning(
          `Output handle key: [${key}] is not defined in Block outputs schema.`
        );
        continue;
      }
      try {
        wrapResult[key] = await this.wrapOutputValue(key, value);
      } catch (error) {
        this.error(error);
      }
    }

    await this.mainframe.sendOutputs({
      type: "BlockOutputs",
      session_id: this.sessionId,
      job_id: this.jobId,
      outputs: wrapResult,
    });
  };

  output = async <THandle extends string>(handle: THandle, output: any) => {
    if (!(handle in this.outputsDef)) {
      await this.warning(
        `Output handle key: [${handle}] is not defined in Block outputs schema.`
      );
      return;
    }

    let value;
    try {
      value = await this.wrapOutputValue(handle, output);
    } catch (error) {
      this.error(error);
      return;
    }

    await this.mainframe.sendOutput({
      type: "BlockOutput",
      session_id: this.sessionId,
      job_id: this.jobId,
      handle,
      output: value,
    });

    this.reportProgress.flush();
  };
}
