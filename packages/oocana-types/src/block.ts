import { BlockInfo, JobInfo } from "./external/block";
import type { HandlesDef, HandlesDefPatch } from "./schema";

export interface IMainframeBlockInputs<
  TInputs extends Record<string, unknown> = Record<string, unknown>
> extends BlockInfo {
  type: "BlockInputs";
  inputs: TInputs;
  inputs_def: HandlesDef;
  inputs_def_patch?: HandlesDefPatch;
}

export interface IMainframeBlockReady extends JobInfo {
  type: "BlockReady";
}

export interface IMainframeExecutorReady {
  type: "ExecutorReady";
  executor_name: string;
  session_id: string;
  package?: string;
}

export interface IMainframeBlockOutput<TOutput = any> extends JobInfo {
  type: "BlockOutput";
  handle: string;
  output: TOutput;
  done: boolean;
}

export interface IMainframeBlockError extends JobInfo {
  type: "BlockError";
  error: string;
}

export interface IMainframeBlockFinished extends JobInfo {
  type: "BlockFinished";
  error?: string;
}

export type IMainframeServerMessage = IMainframeBlockInputs;
export type IMainframeClientMessage =
  | IMainframeBlockReady
  | IMainframeBlockOutput
  | IMainframeBlockError
  | IMainframeBlockFinished
  | IMainframeExecutorReady;

export interface ExecutorPayload extends JobInfo {
  dir: string;
  executor: {
    name: string;
    options?: {
      entry?: string;
      function?: string;
      source?: string;
    };
  };
  outputs: HandlesDef;
}
