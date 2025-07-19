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
import { AddEventListener, event, send } from "@wopjs/event";
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
  public readonly pkgDataDir: string;
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
    this.pkgDataDir = pkgDir;

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

  queryBlock = async (
    block_name: string
  ): Promise<{
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

    const onOutputInternal = event<TOutputs>();
    const blockEvent = (msgPayload: ReporterMessage) => {
      if (msgPayload?.session_id !== this.sessionId) {
        return;
      }
      if (
        msgPayload.type !== "BlockOutput" &&
        msgPayload.type !== "BlockOutputs" &&
        msgPayload.type !== "BlockFinished" &&
        msgPayload.type !== "SubflowBlockFinished" &&
        msgPayload.type !== "SubflowBlockOutput"
      ) {
        return;
      }
      if (msgPayload.job_id !== block_job_id) {
        return;
      }

      if (msgPayload.type === "BlockOutput") {
        send(onOutputInternal, { [msgPayload.handle]: msgPayload.output });
      } else if (msgPayload.type === "SubflowBlockOutput") {
        send(onOutputInternal, { [msgPayload.handle]: msgPayload.output });
      } else if (msgPayload.type === "BlockOutputs") {
        send(onOutputInternal, msgPayload.outputs);
      } else if (msgPayload.type === "BlockFinished") {
        if (msgPayload.result) {
          send(onOutputInternal, msgPayload.result);
        }
        msgPayload.error ? reject(msgPayload.error) : resolve();
      } else if (msgPayload.type === "SubflowBlockFinished") {
        msgPayload.error ? reject(msgPayload.error) : resolve();
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

    let standaloneOutputEvents: Map<string, AddEventListener<any>> | undefined;
    const onOutput = <K extends Extract<keyof TOutputs, string>>(
      handleName: K | ((outputs: TOutputs) => void)
    ): EventListener<TOutputs[K]> | (() => void) => {
      if (typeof handleName === "function") {
        return onOutputInternal.on(handleName);
      } else {
        let ev = standaloneOutputEvents?.get(handleName);
        if (!ev) {
          (standaloneOutputEvents ??= new Map()).set(
            handleName,
            (ev = event<TOutputs[K]>())
          );
          const disposer = onOutputInternal.on((outputs: TOutputs) => {
            if (outputs[handleName] !== undefined) {
              send(ev!, outputs[handleName]);
            }
          });
          const evDispose = ev.dispose;
          ev.dispose = () => {
            disposer();
            evDispose.call(ev);
            standaloneOutputEvents?.delete(handleName);
          };
        }
        return ev;
      }
    };

    const dispose = () => {
      this.mainframe.removeReportCallback(blockEvent);
      this.mainframe.removeRequestResponseCallback(
        this.sessionId,
        request_id,
        responseEvent
      );
      if (standaloneOutputEvents) {
        for (const ev of standaloneOutputEvents.values()) {
          ev.dispose();
        }
        standaloneOutputEvents.clear();
      }
    };

    const blockJob: BlockJob<TOutputs> = {
      blockJobId: block_job_id,
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
    const queue: any[] = [];

    const ev = event<MapStandaloneOutputEventToValue<T>>();
    const disposers = onOutputs.map((onOutput, index) =>
      onOutput(output => {
        (queue[index] ??= []).push(output);
        if (onOutputs.every((_, i) => queue[i].length)) {
          const data = onOutputs.map((_, i) => queue[i].shift());
          send(ev, data);
        }
      })
    );
    const evDispose = ev.dispose;
    ev.dispose = () => {
      for (const disposer of disposers) {
        disposer();
      }
      evDispose.call(ev);
    };
    return ev;
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
    await this.mainframe.sendReport({
      type: "BlockPreview",
      session_id: this.sessionId,
      job_id: this.jobId,
      block_path: this.block_path,
      stacks: this.stacks,
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
