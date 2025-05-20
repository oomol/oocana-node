import { BlockJobStackLevel, BlockInfo } from "./block";

// region Session
export interface SessionStarted {
  readonly type: "SessionStarted";
  readonly session_id: string;
  readonly create_at: number;
  readonly path: string;
  readonly partial: boolean;
}

export interface SessionFinished {
  readonly type: "SessionFinished";
  readonly session_id: string;
  readonly finish_at: number;
  readonly path: string;
  readonly error?: string;
}
// endregion

// region Flow
export interface FlowStarted {
  readonly type: "FlowStarted";
  readonly session_id: string;
  readonly job_id: string;
  readonly flow_path: string;
  readonly stacks: readonly BlockJobStackLevel[];
  readonly create_at: number;
}
export interface FlowNodesWillRun {
  readonly type: "FlowNodesWillRun";
  readonly session_id: string;
  readonly job_id: string;
  readonly flow_path: string;
  readonly stacks: readonly BlockJobStackLevel[];
  readonly start_nodes: readonly string[];
  readonly mid_nodes: readonly string[];
  readonly end_nodes: readonly string[];
}

export interface FlowFinished {
  readonly type: "FlowFinished";
  readonly session_id: string;
  readonly job_id: string;
  readonly flow_path: string;
  readonly stacks: readonly BlockJobStackLevel[];
  readonly error?: string;
  readonly finish_at: number;
}
// endregion

// region SubflowBlock
export interface SubflowBlockStarted extends BlockInfo {
  readonly type: "SubflowBlockStarted";
  readonly inputs?: Record<string, any>;
  readonly create_at: number;
}

export interface SubflowBlockFinished extends BlockInfo {
  readonly type: "SubflowBlockFinished";
  readonly error?: string;
  readonly finish_at: number;
}

export interface SubflowBlockOutput extends BlockInfo {
  readonly type: "SubflowBlockOutput";
  readonly handle: string;
  readonly output: any;
}
// endregion

// region Block
export interface BlockStarted extends BlockInfo {
  readonly type: "BlockStarted";
  readonly inputs?: Record<string, any>;
  readonly create_at: number;
}

export interface BlockFinished extends BlockInfo {
  readonly type: "BlockFinished";
  readonly error?: string;
  readonly result?: Record<string, any>;
  readonly finish_at: number;
}

export interface BlockOutput extends BlockInfo {
  readonly type: "BlockOutput";
  readonly handle: string;
  readonly output: any;
}

export interface BlockOutputMap extends BlockInfo {
  readonly type: "BlockOutputMap";
  readonly map: Record<string, any>;
}

export interface BlockLog extends BlockInfo {
  readonly type: "BlockLog";
  readonly log: string;
  readonly stdio: string;
}

export interface BlockProgress extends BlockInfo {
  readonly type: "BlockProgress";
  /** 0 ~ 100 */
  readonly rate: number;
}

export interface BlockError extends BlockInfo {
  readonly type: "BlockError";
  readonly error: string;
}

export interface BlockMessage extends BlockInfo {
  readonly type: "BlockMessage";
  readonly payload: any;
}

export interface BlockPreview extends BlockInfo {
  readonly type: "BlockPreview";
  readonly payload: any;
}

export interface BlockWarning extends BlockInfo {
  readonly type: "BlockWarning";
  readonly warning: string;
}

export interface BlockLogJSON extends BlockInfo {
  readonly type: "BlockLogJSON";
  readonly json: unknown;
}
// endregion

export type ReporterMessageKeys = Extract<keyof JobEventMap, string>;

export type ReporterMessage = JobEventMap[ReporterMessageKeys];

export interface JobEventMap {
  SessionStarted: SessionStarted;
  SessionFinished: SessionFinished;
  BlockStarted: BlockStarted;
  BlockFinished: BlockFinished;
  BlockOutput: BlockOutput;
  BlockOutputMap: BlockOutputMap;
  BlockLog: BlockLog;
  BlockError: BlockError;
  FlowStarted: FlowStarted;
  FlowNodesWillRun: FlowNodesWillRun;
  FlowFinished: FlowFinished;
  SubflowBlockStarted: SubflowBlockStarted;
  SubflowBlockOutput: SubflowBlockOutput;
  SubflowBlockFinished: SubflowBlockFinished;
  BlockWarning: BlockWarning;
  BlockMessage: BlockMessage;
  BlockPreview: BlockPreview;
  BlockLogJSON: BlockLogJSON;
  BlockProgress: BlockProgress;
}
