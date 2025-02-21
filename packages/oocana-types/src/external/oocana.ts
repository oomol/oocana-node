import { JobEventMap } from "./reporter";

export interface OocanaError {
  type: "OocanaError";
  error: string;
  session_id?: string;
  path: string;
}

export interface OocanaLog {
  type: "OocanaLog";
  data: string;
  stdio: "stdout" | "stderr";
  session_id?: string;
  path: string;
}

export interface OocanaEventConfig extends JobEventMap {
  OocanaError: OocanaError;
  OocanaLog: OocanaLog;
}

export type OocanaEventName = Extract<keyof OocanaEventConfig, string>;

export type OocanaEvent = OocanaEventConfig[OocanaEventName];
