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
  HandleDef,
  ReporterMessage,
  BlockJob,
  EventListener,
  MapStandaloneOutputEventToValue,
} from "@oomol/oocana-types";
import { event, send } from "@wopjs/event";
import { Mainframe } from "./mainframe";
import { isBinHandle, isValHandle, outputRefKey } from "./utils";
import { InternalAPI } from "./internal";
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
  #envWarningsShown = false;
  static readonly keepAlive = Symbol("keepAlive");
  keepAlive = ContextImpl.keepAlive;
  readonly flowNodeStore: { [index: string]: any };
  private mainframe: Mainframe;
  public readonly inputsDef: HandlesDef;
  public readonly outputsDef: HandlesDef;
  private storeKey: string;
  public readonly sessionDir: string;
  public readonly inputs: Record<string, any>;
  public readonly hostInfo: HostInfo;
  public readonly tmpDir: string;
  public readonly tmpPkgDir: string;
  public readonly packageName: string;
  public readonly pkgDir: string;
  public readonly pkgDataDir: string;
  public readonly hostEndpoint: string | undefined;
  public node_id: string;
  public readonly internal: InternalAPI;

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
    this.pkgDataDir = pkgDir;
    this.internal = new InternalAPI(mainframe, { session_id, job_id });


    this.hostInfo = Object.freeze({
      gpuVendor: process.env.OOMOL_HOST_GPU_VENDOR || "unknown",
      gpuRenderer: process.env.OOMOL_HOST_GPU_RENDERER || "unknown",
    });

    this.hostEndpoint = process.env.OO_HOST_ENDPOINT;
  }

  get OOMOL_LLM_ENV(): OOMOL_LLM_ENV {
    const env = Object.freeze({
      baseUrl: process.env.OOMOL_LLM_BASE_URL || "",
      baseUrlV1: process.env.OOMOL_LLM_BASE_URL_V1 || "",
      apiKey: process.env.OOMOL_LLM_API_KEY || "",
      models: process.env.OOMOL_LLM_MODELS
        ? process.env.OOMOL_LLM_MODELS.split(",")
        : [],
    });

    if (!this.#envWarningsShown) {
      for (const [key, value] of Object.entries(env)) {
        if (value === "" || (Array.isArray(value) && value.length === 0)) {
          this.warning(
            `OOMOL_LLM_ENV variable ${key} is (${value}), this may cause some features not working properly.`
          );
        }
      }
      this.#envWarningsShown = true;
    }

    return env;
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

  queryAuth = async (id: string): Promise<{ [key: string]: string }> => {
    const request_id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const cleanupCallback = () => {
        this.mainframe.removeRequestResponseCallback(
          this.sessionId,
          request_id,
          responseEvent
        );
      };

      const responseEvent = (payload: any) => {
        if (payload?.request_id !== request_id) {
          return;
        }

        if (payload.error) {
          cleanupCallback();
          reject(new Error(`Query auth error: ${payload.error}`));
          return;
        }

        if (payload.result) {
          cleanupCallback();
          resolve(payload.result);
          return;
        }
        cleanupCallback();
        reject(new Error("Auth info not found in response"));
      };
      this.mainframe.addRequestResponseCallback(
        this.sessionId,
        request_id,
        responseEvent
      );
      this.mainframe.sendRequest({
        type: "BlockRequest",
        action: "QueryAuth",
        session_id: this.sessionId,
        request_id,
        job_id: this.jobId,
        id,
      });
    });
  };

  queryBlock = async (
    block_name: string
  ): Promise<{
    type: "task" | "subflow";
    description?: string;
    inputs_def?: HandlesDef;
    outputs_def?: HandlesDef;
    additional_inputs?: boolean;
    additional_outputs?: boolean;
  }> => {
    if (!block_name) {
      throw new Error(`Invalid block_name: ${block_name}`);
    }
    const request_id = crypto.randomUUID();

    return new Promise((resolve, reject) => {
      const cleanupCallback = () => {
        this.mainframe.removeRequestResponseCallback(
          this.sessionId,
          request_id,
          responseEvent
        );
      };

      const responseEvent = (payload: any) => {
        if (payload?.request_id !== request_id) {
          return;
        }

        if (payload.error) {
          cleanupCallback();
          reject(new Error(`Query block error: ${payload.error}`));
          return;
        }

        if (payload.result) {
          cleanupCallback();
          resolve(payload.result);
          return;
        }
        cleanupCallback();
        reject(new Error("Block info not found in response"));
      };
      this.mainframe.addRequestResponseCallback(
        this.sessionId,
        request_id,
        responseEvent
      );
      this.mainframe.sendRequest({
        type: "BlockRequest",
        action: "QueryBlock",
        session_id: this.sessionId,
        request_id,
        job_id: this.jobId,
        block: block_name,
      });
    });
  };

  queryDownstream = async (
    handles?: string[]
  ): Promise<{
    [handle: string]: {
      to_node: {
        node_id: string;
        description?: string;
        input_handle: string;
        input_handle_def?: HandleDef;
      }[];
      to_flow: {
        output_handle: string;
        output_handle_def?: HandleDef;
      }[];
    };
  }> => {
    const request_id = crypto.randomUUID();
    if (handles && !Array.isArray(handles)) {
      throw new Error(`Invalid handles: ${handles}`);
    }

    return new Promise((resolve, reject) => {
      const cleanupCallback = () => {
        this.mainframe.removeRequestResponseCallback(
          this.sessionId,
          request_id,
          responseEvent
        );
      };

      const responseEvent = (payload: any) => {
        if (payload?.request_id !== request_id) {
          return;
        }

        if (payload.error) {
          cleanupCallback();
          reject(new Error(`Query downstream error: ${payload.error}`));
          return;
        }

        if (payload.result) {
          cleanupCallback();
          resolve(payload.result);
          return;
        }
        cleanupCallback();
        reject(new Error("Downstream info not found in response"));
      };
      this.mainframe.addRequestResponseCallback(
        this.sessionId,
        request_id,
        responseEvent
      );
      this.mainframe.sendRequest({
        type: "BlockRequest",
        action: "QueryDownstream",
        session_id: this.sessionId,
        request_id,
        job_id: this.jobId,
        handles,
      });
    });
  };

  runBlock = <
    TOutputs extends Record<string, unknown> = { [handle: string]: unknown }
  >(
    blockResourceName: `${string}::${string}`,
    payload?: {
      inputs?: Record<string, any>;
      additional_inputs_def?: HandleDef[];
      additional_outputs_def?: HandleDef[];
    },
    strict = false
  ): BlockJob<TOutputs> => {
    const block_job_id = crypto.randomUUID();
    let request_id = crypto.randomUUID();

    if (!blockResourceName) {
      throw new Error(
        `Invalid parameters for runBlock: blockName: ${blockResourceName}${
          payload?.inputs ? `, inputs: ${payload.inputs}` : ""
        }`
      );
    }

    let resolve: () => void;
    let reject: (reason?: any) => void;
    const finishPromise = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    const onProgress = event<number>();
    const onPreview = event<PreviewPayload>();
    const onMessage = event<unknown>();
    const onOutputInternal = event<TOutputs>();
    const blockEvent = (msg: ReporterMessage) => {
      if (msg?.session_id !== this.sessionId) {
        return;
      }
      if ((msg as any)?.job_id && (msg as any).job_id !== block_job_id) {
        return;
      }

      switch (msg.type) {
        case "BlockOutput":
        case "SubflowBlockOutput": {
          send(onOutputInternal, { [msg.handle]: msg.output });
          break;
        }
        case "BlockOutputs": {
          send(onOutputInternal, msg.outputs);
          break;
        }
        case "BlockProgress": {
          send(onProgress, msg.progress);
          break;
        }
        case "BlockPreview": {
          send(onPreview, msg.payload);
          break;
        }
        case "BlockMessage": {
          send(onMessage, msg.payload);
          break;
        }
        case "BlockFinished": {
          send(onOutputInternal, msg.result);
          msg.error ? reject(msg.error) : resolve();
          msg.error ? null : send(onProgress, 100);
          break;
        }
        case "SubflowBlockFinished": {
          msg.error ? reject(msg.error) : resolve();
          msg.error ? null : send(onProgress, 100);
          break;
        }
        default:
          break;
      }
    };
    this.mainframe.addReportCallback(blockEvent);

    const responseEvent = (eventPayload: any) => {
      if (eventPayload?.request_id === request_id) {
        reject(eventPayload.error);
      }
    };
    this.mainframe.addRequestResponseCallback(
      this.sessionId,
      request_id,
      responseEvent
    );

    const onOutput = <K extends Extract<keyof TOutputs, string>>(
      handleName: K | ((outputs: TOutputs) => void)
    ): EventListener<TOutputs[K]> | (() => void) => {
      if (typeof handleName === "function") {
        return onOutputInternal.on(handleName);
      } else {
        return listener =>
          onOutputInternal.on(outputs => {
            if (
              Object.prototype.hasOwnProperty.call(outputs, handleName) &&
              outputs[handleName] !== undefined
            ) {
              listener(outputs[handleName]);
            }
          });
      }
    };

    const dispose = () => {
      onOutputInternal.dispose();
      onProgress.dispose();
      onMessage.dispose();
      onPreview.dispose();
      this.mainframe.removeReportCallback(blockEvent);
      this.mainframe.removeRequestResponseCallback(
        this.sessionId,
        request_id,
        responseEvent
      );
    };

    const blockJob: BlockJob<TOutputs> = {
      blockJobId: block_job_id,
      onProgress,
      onMessage,
      onPreview,
      onOutput: onOutput as any,
      finish: async () => finishPromise,
      dispose,
    };

    blockJob.finish().then(dispose);

    this.mainframe.sendRun({
      type: "BlockRequest",
      action: "RunBlock",
      session_id: this.sessionId,
      request_id,
      job_id: this.jobId,
      stacks: this.stacks,
      block: blockResourceName,
      block_job_id,
      payload: payload
        ? payload.inputs
          ? (payload as { inputs: Record<string, any> })
          : { ...payload, inputs: {} }
        : { inputs: {} },
      strict,
    });

    return blockJob;
  };

  joinOutputs = <T extends Array<EventListener>>(
    ...onOutputs: T
  ): EventListener<MapStandaloneOutputEventToValue<T>> => {
    return listener => {
      const queue: any[] = [];
      const disposers = onOutputs.map((onOutput, index) =>
        onOutput(output => {
          (queue[index] ??= []).push(output);
          if (onOutputs.every((_, i) => queue[i].length)) {
            const data = onOutputs.map(
              (_, i) => queue[i].shift()!
            ) as MapStandaloneOutputEventToValue<T>;
            listener(data);
          }
        })
      );
      return () => {
        for (const disposer of disposers) {
          disposer();
        }
      };
    };
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

  preview = async (payload: PreviewPayload, id?: string) => {
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
          payload = { ...payload, data: filePath };
        } catch (error) {
          throw new Error(
            `write preview csv to file error: ${error}, path: ${filePath}`
          );
        }
      }
    }
    const requestId = crypto.randomUUID();
    await this.mainframe.sendRequest({
      type: "BlockRequest",
      action: "Preview",
      session_id: this.sessionId,
      request_id: requestId,
      job_id: this.jobId,
      payload: id ? { ...payload, id } : payload,
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
      this.mainframe.sendProgress({
        type: "BlockProgress",
        session_id: this.sessionId,
        job_id: this.jobId,
        progress,
      });
      return this.mainframe.sendReport({
        type: "BlockProgress",
        session_id: this.sessionId,
        job_id: this.jobId,
        block_path: this.block_path,
        stacks: this.stacks,
        progress: progress,
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

  output = async <THandle extends string>(
    handle: THandle,
    output: any,
    options: {
      to_flow?: { output_handle: string }[];
      to_node?: { node_id: string; input_handle: string }[];
    } = {}
  ) => {
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
      options:
        options.to_flow || options.to_node
          ? {
              target: {
                to_flow: options.to_flow,
                to_node: options.to_node,
              },
            }
          : undefined,
    });

    this.reportProgress.flush();
  };
}
