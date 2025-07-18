import type { EventReceiver } from "remitter";
import { HandlesDef, HandleDef } from "../schema";
import type { BlockJobStackLevel } from "./block";
import { BlockActionEvent } from "../block";

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
      id?: string;
    }
  | {
      type: "json" | "text" | `text/${string}`;
      data: any;
      id?: string;
    }
  | {
      type: "image";
      data: string | string[];
      id?: string;
    }
  | {
      type: "table";
      data:
        | {
            columns: Array<string | number>;
            rows: Array<Array<string | number | boolean>>;
            row_count?: number;
          }
        | string;
      id?: string;
    }
  | {
      type: "csv";
      data: string; // csv file path
      id?: string;
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

export type RunResponse = {
  /** Events emitted during block execution on the executor. Not to be confused with log events, which are optional. */
  events: EventReceiver<BlockActionEvent>;
  /** Event emitted for each block output. When using `context.outputs`, `context.output`, or returning an object, this event fires for each handle and value pair. */
  onOutput(
    listener: (data: { handle: string; value: unknown }) => void
  ): () => void;
  /** await block execution and return result or error. */
  finish(): Promise<{ result?: Record<string, unknown>; error?: unknown }>;
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

  /** block inputs def which is defined in Block inputs_def field and Node inputs_def field, oocana will transform inputs_def array to HandlesDef */
  readonly inputsDef: HandlesDef;
  /** block outputs def which is defined in Block outputs_def field and Node outputs_def field, oocana will transform outputs_def array to HandlesDef */
  readonly outputsDef: HandlesDef;

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
      output: TOutputs[THandle],
      /** if toFlowOutputs or toNodeInputs is provided, the output will be sent to the specified handles. if none of these is provided, the output will be sent to the all. */
      options?: {
        to_flow?: {
          output_handle: string;
        }[];
        to_node?: {
          node_id: string;
          input_handle: string;
        }[];
      }
    ): Promise<void>;
  };

  /**
   * Report block outputs. it can report multiple output at once.
   * @param map map can be a partial object of TOutputs
   * @returns
   */
  readonly outputs: (map: Partial<TOutputs>) => Promise<void>;

  /**
   * Query current node's downstream connection.
   * @param handles node's outputs handles. if undefined or null, will query all handles's downstream
   * @returns
   */
  readonly queryDownstream: (handles?: string[]) => Promise<{
    [handle: string]: {
      to_node: {
        node_id: string;
        /** node's description */
        description?: string;
        input_handle: string;
        input_handle_def?: HandleDef;
      }[];
      to_flow: {
        output_handle: string;
        output_handle_def?: HandleDef;
      }[];
    };
  }>;

  /**
   * This function is experimental and may change in the future.
   * @param blockName Block name to run. format `self::<blockName>` or `<packageName>::<blockName>`. support block and subflow, if block is subflow, it will run the subflow. block will be used first if both block and subflow exist.
   * @param payload payload is used for run block, inputs is required, additional_inputs_def and additional_outputs_def is optional.
   * - inputs: inputs for the block, it must match the block's inputs_def.
   *           some missing inputs will be filled:
   *                1. with the default value if the block's input_def has a default value (which is defined in the value field).
   *                2. input_def's nullable is true, the missing input will filled with Null.
   * - additional_inputs_def: additional inputs for the block, it will be used to extend the block's inputs_def. it is optional, if not provided, it will use the block's inputs_def.
   * - additional_outputs_def: additional outputs for the block, it will be used to extend the block's outputs_def. it is optional, if not provided, it will use the block's outputs_def.
   * @param strict strict if true, validates payload inputs against the block's inputs_def and throws an error on mismatch. Defaults to false.
   * @returns RunResponse.
   *
   * example:
   * ```ts
   * async function main(inputs, context) {
   *   const response = await context.runBlock("self::myBlock", {
   *     input1: "value1",
   *     input2: "value2",
   *   });
   *   response.onOutput((data) => {
   *     console.log("output:", data.handle, data.value);
   *   });
   *   const { result, error } = await response.finish();
   *   if (error) {
   *     console.error("Block failed:", error);
   *   } else {
   *    console.log("Block finished successfully with result:", result);
   *   }
   */
  readonly runBlock: (
    blockName: string,
    payload: {
      inputs: Record<string, any>;
      additional_inputs_def?: HandleDef[];
      additional_outputs_def?: HandleDef[];
    },
    strict?: boolean
  ) => RunResponse;

  /**
   * Query block information.
   * @param blockName Block name to query. format `self::<blockName>` or `<packageName>::<blockName>`. support block and subflow, if block is subflow, it will query the subflow. block will be used first if both block and subflow exist.
   * @returns Block information, including description, inputs_def, outputs_def, additional_inputs, and additional_outputs. only block may contain additional field.
   * example:
   * ```ts
   * async function main(inputs, context) {
   *   const blockInfo = await context.queryBlock("self::myBlock");
   *   console.log("Block Info:", blockInfo);
   *   // Do something with blockInfo
   * }
   */
  readonly queryBlock: (blockName: string) => Promise<{
    description?: string;
    inputs_def?: HandlesDef;
    outputs_def?: HandlesDef;
    additional_inputs?: boolean;
    additional_outputs?: boolean;
  }>;

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

  /**
   * Send to Preview.
   * @param payload - preview payload
   * @param id - optional id for multiple previews.
   */
  readonly preview: (payload: PreviewPayload, id?: string) => Promise<void>;

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
