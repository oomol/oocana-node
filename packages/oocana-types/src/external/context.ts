import type { BlockJobStackLevel } from "./block";

export type PreviewType =
  | "image"
  | "video"
  | "audio"
  | "markdown"
  | "iframe"
  | "html"
  | "json"
  | "text"
  | `text/${string}`
  | "table";
export type PreviewPayload =
  | {
      type: "video" | "audio" | "markdown" | "iframe" | "html";
      data: string;
    }
  | {
      type: "json" | "text" | `text/${string}`;
      data: any;
    }
  | {
      type: "image";
      data: string | string[];
    }
  | {
      type: "table";
      data: {
        columns: Array<string | number>;
        rows: Array<Array<string | number | boolean>>;
        row_count?: number;
      };
    };

export type KeepAlive = symbol;
export type ReturnObject<T = Record<string, unknown>> =
  | void
  | undefined
  | Partial<T>
  | KeepAlive;

export type MainFunction<
  TInputs = Record<string, any>,
  TOutputs = Record<string, any>
> = (
  inputs: TInputs,
  context: Context<TInputs, TOutputs>
) => ReturnObject | Promise<ReturnObject>;

export type OOMOL_LLM_ENV = {
  readonly baseUrl: string;
  /** {basUrl}/v1 openai compatible endpoint */
  readonly baseUrlV1: string;
  readonly apiKey: string;
  readonly models: string[];
};

export type HostInfo = {
  readonly gpuVendor: string;
  readonly gpuRenderer: string;
};

export interface Context<
  TInputs = Record<string, any>,
  TOutputs = Record<string, any>
> {
  readonly sessionId: string;
  readonly jobId: string;
  readonly block_path?: string;
  readonly stacks: readonly BlockJobStackLevel[];
  readonly inputs: TInputs;

  /**
   * persist data across job running for same node it. For subflow, each subflow job will possess different flow store.
   * usage example:
   * ```ts
   * function main(inputs, context) {
   *   let value = context.flowNodeStore["key"];
   *   if (value === undefined) {
   *     value = 0;
   *   } else {
   *     value += 1;
   *   }
   *   context.flowNodeStore["key"] = value
   *   console.log("value:", value);
   * }
   *
   * the first time node run, value will be 0
   * the second time node run, value will be 1
   * these jobs are different. but they are in the same flow, so they share the same flowNodeStore.
   * ```
   */
  readonly flowNodeStore: { [index: string]: any };

  readonly output: {
    /**
     * @param handle Output handle
     * @param output Output value
     */
    <THandle extends Extract<keyof TOutputs, string>>(
      handle: THandle,
      output: TOutputs[THandle]
    ): Promise<void>;
  };

  /**
   * Report block outputs. it can report multiple output at once.
   * @param map map can be a partial object of TOutputs
   * @returns
   */
  readonly outputs: (map: Partial<TOutputs>) => Promise<void>;

  /**
   * reporter block finish. it can contain error or result.
   * if contains error, it will be treated as block failed and ignore result argument
   * if contains result, it will be treated as success
   * otherwise, it will be treated as success and no result will be reported.
   */
  readonly finish: (
    arg?: { result?: any; error?: never } | { result?: never; error?: unknown }
  ) => Promise<void>;

  /** Report logs */
  readonly logJSON: (jsonValue: unknown) => Promise<void>;

  /** Report error. */
  readonly error: (error: unknown) => Promise<void>;

  /** Report extra Block messages. */
  readonly sendMessage: (payload: unknown) => Promise<void>;

  /** Send to Preview */
  readonly preview: (payload: PreviewPayload) => Promise<void>;

  /** Report Block's stdio and stdout message. */
  readonly reportLog: (
    payload: string,
    stdio: "stdout" | "stderr"
  ) => Promise<void>;

  /** a temporary directory for whole session. all block in one session will share the same directory */
  readonly sessionDir: string;

  /** Report progress, progress 0 ~ 100, This function has a throttle effect, triggering once every 300ms. */
  readonly reportProgress: (progress: number) => Promise<void>;

  /** oomol environment variables for LLM */
  readonly OOMOL_LLM_ENV: OOMOL_LLM_ENV;

  /** Host machine information */
  readonly hostInfo: HostInfo;

  readonly keepAlive: KeepAlive;

  /** Directory for persistent package files across sessions; not cleared when a session ends. The same package will utilize the same directory, while different packages will utilize distinct directories. */
  readonly pkgDir: string;

  /** Temporary directory for the current flow, all blocks in this flow will share the same directory. This directory will be cleaned if this session finishes successfully; otherwise, it will be kept for debugging or other purposes. */
  readonly tmpDir: string;

  /** Temporary directory for the current package, all blocks in this package will share the same directory. This directory will be cleaned if this session finishes successfully; otherwise, it will be kept for debugging or other purposes. */
  readonly tmpPkgDir: string;

  /** A host endpoint that allows containers to access services running on the host system. in cloud environment, it will be undefined. */
  readonly hostEndpoint: string | undefined;
}
