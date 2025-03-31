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
export type ReturnObject = void | Record<string, unknown> | KeepAlive;

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

  readonly output: {
    <THandle extends Extract<keyof TOutputs, string>>(
      handle: THandle,
      output: TOutputs[THandle]
    ): Promise<void>;

    /**
     * @deprecated this method will be removed in the future. please use function without done parameter. if you want to report block done, please use context.done() instead.
     * Report Block output.
     * @param handle Output handle
     * @param output Output value
     * @param done will remove. Report Block done.
     */
    <THandle extends Extract<keyof TOutputs, string>>(
      handle: THandle,
      output: TOutputs[THandle],
      done: boolean
    ): Promise<void>;
  };

  /** Report Block done. */
  readonly done: (err?: any) => Promise<void>;

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

  /** a temporary directory for the current follow, all blocks in the this flow will share the same directory. this directory will be cleaned if this session finish successfully, otherwise it will be kept for debugging or other purpose. */
  readonly tmpDir: string;

  /** a temporary directory for the current package, all blocks in the this package will share the same directory. this directory will be cleaned if this session finish successfully, otherwise it will be kept for debugging or other purpose. */
  readonly tmpPkgDir: string;
}
