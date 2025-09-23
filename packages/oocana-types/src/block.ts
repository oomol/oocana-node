import {
  BlockFinished,
  BlockOutput,
  BlockOutputs,
  SubflowBlockFinished,
  SubflowBlockOutput,
} from "./external";
import { BlockInfo, BlockJobStackLevel, JobInfo } from "./external/block";
import type { HandleDef, HandlesDef, HandlesDefPatch } from "./schema";

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

export interface IMainframeRunBlockRequest extends JobInfo {
  type: "BlockRequest";
  action: "RunBlock";
  block: string;
  block_job_id: string;
  request_id: string;
  payload: {
    inputs: Record<string, any>;
    additional_inputs_def?: HandleDef[];
    additional_outputs_def?: HandleDef[];
  };
  stacks: readonly BlockJobStackLevel[];
  strict?: boolean;
}

export interface IMainframeQueryBlockRequest extends JobInfo {
  type: "BlockRequest";
  action: "QueryBlock";
  block: string;
  request_id: string;
}

export interface IMainframeQueryDownstreamRequest extends JobInfo {
  type: "BlockRequest";
  action: "QueryDownstream";
  handles?: string[];
  request_id: string;
}

export interface IMainframePreviewRequest<TPayload = unknown> extends JobInfo {
  type: "BlockRequest";
  action: "Preview";
  request_id: string;
  payload: TPayload;
}
export interface IMainframeQueryAuthRequest extends JobInfo {
  type: "BlockRequest";
  action: "QueryAuth";
  id: string;
  request_id: string;
}

export interface IMainframeUpdateNodeWeightRequest extends JobInfo {
  type: "BlockRequest";
  action: "UpdateNodeWeight";
  node_id: string;
  weight: number;
  request_id: string;
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
  options?: {
    target?: {
      to_flow?: { output_handle: string }[];
      to_node?: { node_id: string; input_handle: string }[];
    };
  };
}

export interface IMainframeBlockOutputs<TOutput = any> extends JobInfo {
  type: "BlockOutputs";
  outputs: Record<string, TOutput>;
}

export interface IMainframeBlockError extends JobInfo {
  type: "BlockError";
  error: string;
}

export interface IMainframeBlockProgress extends JobInfo {
  type: "BlockProgress";
  /** 0 ~ 100 */
  progress: number;
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
  | IMainframeBlockProgress
  | IMainframeBlockFinished
  | IMainframeRunBlockRequest
  | IMainframeQueryBlockRequest
  | IMainframeQueryDownstreamRequest
  | IMainframePreviewRequest
  | IMainframeQueryAuthRequest
  | IMainframeUpdateNodeWeightRequest
  | IMainframeExecutorReady;

export type BlockActionEvent = {
  BlockOutput: BlockOutput;
  BlockOutputs: BlockOutputs;
  BlockFinished: BlockFinished;
  SubflowBlockOutput: SubflowBlockOutput;
  SubflowBlockFinished: SubflowBlockFinished;
};

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
