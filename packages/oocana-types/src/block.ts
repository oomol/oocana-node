import { BlockInfo, BlockJobStackLevel, JobInfo } from "./external/block";
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

export interface IMainframeBlockRunPayload extends JobInfo {
  type: "RunBlock";
  block: string;
  block_job_id: string;
  inputs: Record<string, unknown>;
  stacks: readonly BlockJobStackLevel[];
}

export interface IMainframeExecutorReady {
  type: "ExecutorReady";
  executor_name: string;
  session_id: string;
  package?: string;
  identifier?: string;
  inspect_wait?: number;
  process_id?: number;
}

export interface IMainframeBlockOutput<TOutput = any> extends JobInfo {
  type: "BlockOutput";
  handle: string;
  output: TOutput;
}

export interface IMainframeBlockOutputs<TOutput = any> extends JobInfo {
  type: "BlockOutputs";
  outputs: Record<string, TOutput>;
}

export interface IMainframeBlockError extends JobInfo {
  type: "BlockError";
  error: string;
}

export interface IMainframeBlockFinished extends JobInfo {
  type: "BlockFinished";
  error?: string;
  result?: Record<string, unknown>;
}

export type IMainframeServerMessage = IMainframeBlockInputs;
export type IMainframeClientMessage =
  | IMainframeBlockReady
  | IMainframeBlockOutput
  | IMainframeBlockOutputs
  | IMainframeBlockError
  | IMainframeBlockFinished
  | IMainframeBlockRunPayload
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
