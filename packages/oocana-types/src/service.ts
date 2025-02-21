import type { JobInfo } from "./external/block";
import type { HandlesDef } from "./schema";
import type { Context, ReturnObject } from "./external/context";

type BlockFunction<T = any> = (
  inputs: T,
  context: Context
) => Promise<ReturnObject> | ReturnObject;
type BlocksFunction = (
  blockName: string,
  inputs: any,
  context: Context
) => Promise<ReturnObject> | ReturnObject;

type BlockHandleMap = {
  [blockName: string]: BlockFunction;
};

type ServiceMessageEvent = {
  job_id: string;
  node_id: string;
  flow_path: string;
  payload: any;
};

export type ServiceEvent = {
  message: ServiceMessageEvent;
};

type EventReceiver<T> = {
  // 后续考虑直接 import remitter 的 types
  on<N extends keyof T>(event: N, callback: (data: T[N]) => void): () => void;
};

export interface ServiceContext {
  blockHandler: BlockHandleMap | BlocksFunction;
  events: EventReceiver<ServiceEvent>;
}

export type ServiceStartOption = "block_start" | "session_start" | "app_start";
export type ServiceStopOption =
  | "block_end"
  | "session_end"
  | "app_end"
  | "never";

export interface ServiceExecutePayload extends JobInfo {
  dir: string;
  block_name: string;
  service_executor: {
    name: string;
    entry: string;
    function: string;
    start_at?: ServiceStartOption;
    stop_at?: ServiceStopOption;
    keep_alive?: number;
  };
  outputs: HandlesDef;
  // package + service name 计算的 hash
  service_hash: string;
}
